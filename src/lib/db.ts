import { supabase } from './supabase';
import type { Profile, Team, Family, FamilyFormData } from './types';
import { generateReferralCode } from './utils';
import { surveyCache } from './cache';

export const dbService = {
  // ─── AUTH ───────────────────────────────────────────
  auth: {
    getCurrentUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return null;
      return { id: data.user.id, email: data.user.email || '' };
    },

    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    onAuthStateChange: (callback: (user: any) => void) => {
      return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
      });
    },
  },

  // ─── PROFILE ────────────────────────────────────────
  profile: {
    getProfile: async (): Promise<Profile | null> => {
      const user = await dbService.auth.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    },

    updateProfile: async (updates: Partial<Profile>): Promise<Profile> => {
      const user = await dbService.auth.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
  },

  // ─── TEAM ───────────────────────────────────────────
  team: {
    getCurrentTeam: async (): Promise<Team | null> => {
      const profile = await dbService.profile.getProfile();
      if (!profile) return null;

      if (profile.team_id) {
        const { data } = await supabase
          .from('teams')
          .select('*')
          .eq('id', profile.team_id)
          .maybeSingle();

        if (data) return data as Team;
      }

      // If user is admin but team_id isn't linked yet, check by admin_id
      if (profile.role === 'admin') {
        const { data: adminTeam } = await supabase
          .from('teams')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();

        if (adminTeam) {
          await supabase.from('profiles').update({ team_id: adminTeam.id }).eq('id', profile.id);
          return adminTeam as Team;
        }
      }

      return null;
    },

    joinByReferralCode: async (code: string): Promise<Team> => {
      const cleanCode = code.trim().toUpperCase();

      // Use the SECURITY DEFINER RPC function to safely validate and join team
      const { data, error: rpcErr } = await supabase.rpc('join_team_with_referral_code', {
        code_input: cleanCode,
      });

      if (!rpcErr && data) {
        if (!data.success) {
          throw new Error(data.message || 'अवैध रेफरल कोड! कृपया तपासा (Invalid referral code)');
        }
        return {
          id: data.team_id,
          name: data.team_name,
          referral_code: cleanCode,
          admin_id: '',
          created_at: new Date().toISOString(),
        };
      }

      // Fallback in case RPC is not yet created
      const user = await dbService.auth.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data: team, error: findErr } = await supabase
        .from('teams')
        .select('*')
        .ilike('referral_code', cleanCode)
        .maybeSingle();

      if (findErr) throw findErr;
      if (!team) throw new Error('अवैध रेफरल कोड! कृपया तपासा (Invalid referral code)');

      const { error: joinErr } = await supabase
        .from('profiles')
        .update({ team_id: team.id, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (joinErr) throw joinErr;
      return team as Team;
    },

    getTeamMembers: async (teamId: string): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Profile[];
    },

    regenerateReferralCode: async (teamId: string): Promise<string> => {
      const newCode = generateReferralCode();
      const { error } = await supabase
        .from('teams')
        .update({ referral_code: newCode })
        .eq('id', teamId);

      if (error) throw error;
      return newCode;
    },

    removeUserFromTeam: async (userId: string): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .update({ team_id: null, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
    },
  },

  // ─── FAMILIES (SURVEYS) ─────────────────────────────
  families: {
    getAll: async (forceRefresh = false): Promise<Family[]> => {
      // Return local cache immediately if fresh to minimize database reads & bandwidth
      if (!forceRefresh && !surveyCache.isStale()) {
        const cached = surveyCache.get();
        if (cached && cached.length > 0) return cached;
      }

      const profile = await dbService.profile.getProfile();
      if (!profile) return [];

      let query = supabase
        .from('families')
        .select('*, members:family_members(*)')
        .order('serial_no', { ascending: true })
        .order('created_at', { foreignTable: 'family_members', ascending: true });

      if (profile.role === 'admin' && profile.team_id) {
        // Admin sees all surveys from their team
        query = query.eq('team_id', profile.team_id);
      } else {
        // Field worker sees only their own
        query = query.eq('user_id', profile.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching families:', error);
        // Fallback to offline cached data if available
        return surveyCache.get() || [];
      }

      const familiesList = (data || []) as Family[];

      // Populate submitter profiles for all user_ids
      const userIds = Array.from(new Set(familiesList.map((f) => f.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .in('id', userIds);

          if (profiles) {
            const profileMap = new Map(profiles.map((p) => [p.id, p]));
            familiesList.forEach((f) => {
              f.submitter = profileMap.get(f.user_id) || null;
            });
          }
        } catch (e) {
          console.warn('Could not populate submitters:', e);
        }
      }

      // Store in client-side storage cache
      surveyCache.set(familiesList);

      return familiesList;
    },

    getById: async (id: string): Promise<Family | null> => {
      const { data, error } = await supabase
        .from('families')
        .select('*, members:family_members(*)')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return data as Family;
    },

    create: async (formData: FamilyFormData): Promise<Family> => {
      const profile = await dbService.profile.getProfile();
      if (!profile) throw new Error('Not authenticated');

      const { members, ...familyData } = formData;

      const { data: createdFam, error: famErr } = await supabase
        .from('families')
        .insert({
          ...familyData,
          user_id: profile.id,
          team_id: profile.team_id,
        })
        .select()
        .single();

      if (famErr || !createdFam) throw famErr;

      if (members && members.length > 0) {
        const rows = members.map((m) => ({ ...m, family_id: createdFam.id }));
        const { data: createdMembers, error: memErr } = await supabase
          .from('family_members')
          .insert(rows)
          .select();

        if (memErr) throw memErr;
        surveyCache.invalidate();
        return { ...createdFam, members: createdMembers } as Family;
      }

      surveyCache.invalidate();
      return createdFam as Family;
    },

    update: async (id: string, formData: Partial<FamilyFormData>): Promise<Family> => {
      const { members, ...familyData } = formData;

      const { data: updatedFam, error: famErr } = await supabase
        .from('families')
        .update({ ...familyData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (famErr) throw famErr;

      if (members) {
        // Replace all members
        await supabase.from('family_members').delete().eq('family_id', id);

        if (members.length > 0) {
          const rows = members.map((m) => ({ ...m, family_id: id }));
          const { data: newMembers } = await supabase
            .from('family_members')
            .insert(rows)
            .select();

          surveyCache.invalidate();
          return { ...updatedFam, members: newMembers || [] } as Family;
        }
      }

      surveyCache.invalidate();
      return updatedFam as Family;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('families').delete().eq('id', id);
      if (error) throw error;
      surveyCache.invalidate();
    },
  },
};
