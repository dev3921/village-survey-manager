import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile, Team, Family, FamilyMember, FamilyFormData } from './types';

// Mock IDs & Storage Keys for seamless demo / local storage mode
const STORAGE_PREFIX = 'vsm_';
const AUTH_KEY = `${STORAGE_PREFIX}auth_user`;
const PROFILE_KEY = `${STORAGE_PREFIX}profiles`;
const TEAMS_KEY = `${STORAGE_PREFIX}teams`;
const FAMILIES_KEY = `${STORAGE_PREFIX}families`;
const MEMBERS_KEY = `${STORAGE_PREFIX}members`;

// Generate random 6-character uppercase referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Initial demo seed data for local mode
function initLocalData() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(TEAMS_KEY)) {
    const demoTeam: Team = {
      id: 'team-demo-01',
      name: 'सातारा विभाग सर्वेक्षण गट (Satara Division)',
      admin_id: 'user-admin-01',
      referral_code: 'SATARA',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(TEAMS_KEY, JSON.stringify([demoTeam]));
  }

  if (!localStorage.getItem(PROFILE_KEY)) {
    const demoProfiles: Profile[] = [
      {
        id: 'user-admin-01',
        full_name: 'प्रमोद पाटील (Pramod Patil - Admin)',
        email: 'admin@villagesurvey.org',
        role: 'admin',
        team_id: 'team-demo-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user-worker-01',
        full_name: 'सुनीता शिंदे (Sunita Shinde - Worker)',
        email: 'worker@villagesurvey.org',
        role: 'user',
        team_id: 'team-demo-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(PROFILE_KEY, JSON.stringify(demoProfiles));
  }

  if (!localStorage.getItem(FAMILIES_KEY)) {
    const famId1 = 'fam-demo-01';
    const famId2 = 'fam-demo-02';

    const demoFamilies: Family[] = [
      {
        id: famId1,
        user_id: 'user-worker-01',
        team_id: 'team-demo-01',
        serial_no: 1,
        head_name: 'राजाराम तुकाराम कदम',
        village_name: 'कोरेगाव (Koregaon)',
        total_members: 4,
        economic_status: 'BPL',
        caste: 'मराठा (Open)',
        shg_name: 'महालक्ष्मी महिला बचत गट',
        income_source: 'शेती व दुग्धव्यवसाय',
        women_skills: 'शिलाई काम, दुग्धप्रक्रिया',
        monthly_income: 14000,
        farm_land: '2 एकर (जिरायत)',
        water_source: 'विहीर',
        livestock: '2 गायी, 1 म्हैस',
        tools_machines: 'पाण्याचा पंप, स्प्रे पंप',
        house_type: 'पक्का',
        electricity: true,
        toilet: true,
        fuel_type: 'गॅस',
        has_disabled: false,
        scheme_benefits: 'रेशन कार्ड, पीक विमा',
        internet_access: 'स्मार्टफोन',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: famId2,
        user_id: 'user-worker-01',
        team_id: 'team-demo-01',
        serial_no: 2,
        head_name: 'दत्तात्रय ज्ञानोबा भोसले',
        village_name: 'वडूज (Vaduj)',
        total_members: 3,
        economic_status: 'APL',
        caste: 'इतर मागासवर्ग (OBC)',
        shg_name: 'क्रांतिज्योती बचत गट',
        income_source: 'किराणा दुकान व भाजीपाला विक्री',
        women_skills: 'गृहउद्योग, पापड लोणचे',
        monthly_income: 22000,
        farm_land: '1 एकर',
        water_source: 'बोर',
        livestock: '3 शेळ्या',
        tools_machines: 'दुकान वजन काटा',
        house_type: 'पक्का',
        electricity: true,
        toilet: true,
        fuel_type: 'गॅस',
        has_disabled: false,
        scheme_benefits: 'रेशन कार्ड',
        internet_access: 'स्मार्टफोन',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const demoMembers: FamilyMember[] = [
      {
        id: 'mem-01',
        family_id: famId1,
        member_name: 'राजाराम तुकाराम कदम',
        age: 48,
        relationship: 'स्वतः (Self)',
        marital_status: 'विवाहित (Married)',
        education: '१० वी',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mem-02',
        family_id: famId1,
        member_name: 'सुमन राजाराम कदम',
        age: 44,
        relationship: 'पत्नी (Wife)',
        marital_status: 'विवाहित (Married)',
        education: '८ वी',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mem-03',
        family_id: famId1,
        member_name: 'अमोल राजाराम कदम',
        age: 21,
        relationship: 'मुलगा (Son)',
        marital_status: 'अविवाहित (Unmarried)',
        education: 'पदवी (B.Com)',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mem-04',
        family_id: famId1,
        member_name: 'प्रिया राजाराम कदम',
        age: 18,
        relationship: 'मुलगी (Daughter)',
        marital_status: 'अविवाहित (Unmarried)',
        education: '१२ वी सायन्स',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mem-05',
        family_id: famId2,
        member_name: 'दत्तात्रय ज्ञानोबा भोसले',
        age: 52,
        relationship: 'स्वतः (Self)',
        marital_status: 'विवाहित (Married)',
        education: '१२ वी',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mem-06',
        family_id: famId2,
        member_name: 'मंगला दत्तात्रय भोसले',
        age: 47,
        relationship: 'पत्नी (Wife)',
        marital_status: 'विवाहित (Married)',
        education: '१० वी',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mem-07',
        family_id: famId2,
        member_name: 'रोहित दत्तात्रय भोसले',
        age: 23,
        relationship: 'मुलगा (Son)',
        marital_status: 'अविवाहित (Unmarried)',
        education: 'पदविका (Diploma)',
        created_at: new Date().toISOString(),
      },
    ];

    localStorage.setItem(FAMILIES_KEY, JSON.stringify(demoFamilies));
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(demoMembers));
  }
}

// Helpers for localStorage
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Local storage write error:', err);
  }
}

export const dbService = {
  isConfigured: () => isSupabaseConfigured(),

  init: () => {
    initLocalData();
  },

  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------
  auth: {
    getCurrentUser: async (): Promise<{ id: string; email: string } | null> => {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) return null;
          return { id: data.user.id, email: data.user.email || '' };
        } catch {
          return null;
        }
      }
      return getLocal<{ id: string; email: string } | null>(AUTH_KEY, null);
    },

    signIn: async (email: string, password?: string) => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'Password123!',
        });
        if (error) throw error;
        return { success: true, user: data.user };
      }

      // Demo/Local login
      initLocalData();
      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      let profile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!profile) {
        // Create new user locally
        const newId = `user-${Date.now()}`;
        profile = {
          id: newId,
          full_name: email.split('@')[0],
          email,
          role: 'user',
          team_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        profiles.push(profile);
        setLocal(PROFILE_KEY, profiles);
      }

      const user = { id: profile.id, email: profile.email };
      setLocal(AUTH_KEY, user);
      return { success: true, user };
    },

    signUp: async (email: string, password: string, fullName: string, referralCode?: string) => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        // If referral code provided, attempt join
        if (data.user && referralCode) {
          try {
            await dbService.team.joinByReferralCode(referralCode, data.user.id);
          } catch (e) {
            console.warn('Could not join team automatically:', e);
          }
        }
        return { success: true, user: data.user };
      }

      // Local/Demo sign up
      initLocalData();
      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      const existing = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('हा ईमेल आधीपासून नोंदणीकृत आहे (Email already registered)');
      }

      const newId = `user-${Date.now()}`;
      let teamId: string | null = null;

      if (referralCode) {
        const teams = getLocal<Team[]>(TEAMS_KEY, []);
        const foundTeam = teams.find(
          (t) => t.referral_code.toUpperCase() === referralCode.trim().toUpperCase()
        );
        if (foundTeam) {
          teamId = foundTeam.id;
        }
      }

      const newProfile: Profile = {
        id: newId,
        full_name: fullName,
        email,
        role: 'user',
        team_id: teamId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      setLocal(PROFILE_KEY, profiles);

      const user = { id: newId, email };
      setLocal(AUTH_KEY, user);
      return { success: true, user };
    },

    signOut: async () => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error('Supabase signOut error:', e);
        }
      }
      localStorage.removeItem(AUTH_KEY);
      return { success: true };
    },

    // Demo switch helper
    loginAsDemo: async (type: 'admin' | 'worker') => {
      initLocalData();
      const targetEmail = type === 'admin' ? 'admin@villagesurvey.org' : 'worker@villagesurvey.org';
      return await dbService.auth.signIn(targetEmail);
    },
  },

  // ----------------------------------------------------
  // PROFILE
  // ----------------------------------------------------
  profile: {
    getProfile: async (): Promise<Profile | null> => {
      const user = await dbService.auth.getCurrentUser();
      if (!user) return null;

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error || !data) {
          // Fallback or create default
          return {
            id: user.id,
            full_name: user.email.split('@')[0],
            email: user.email,
            role: 'user',
            team_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return data as Profile;
      }

      initLocalData();
      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      const found = profiles.find((p) => p.id === user.id);
      return found || null;
    },

    updateProfile: async (updates: Partial<Profile>): Promise<Profile> => {
      const user = await dbService.auth.getCurrentUser();
      if (!user) throw new Error('Not logged in');

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();
        if (error) throw error;
        return data as Profile;
      }

      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      const idx = profiles.findIndex((p) => p.id === user.id);
      if (idx === -1) throw new Error('Profile not found');
      profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
      setLocal(PROFILE_KEY, profiles);
      return profiles[idx];
    },

    // Promotion helper (Owner promoting a user to admin)
    promoteToAdmin: async (userId: string): Promise<void> => {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', userId);
        if (error) throw error;

        // Ensure user has a team
        const { data: team } = await supabase.from('teams').select('id').eq('admin_id', userId).maybeSingle();
        if (!team) {
          const code = generateReferralCode();
          const { data: newTeam } = await supabase
            .from('teams')
            .insert({ name: 'माझा सर्वेक्षण संघ (My Survey Team)', admin_id: userId, referral_code: code })
            .select()
            .single();
          if (newTeam) {
            await supabase.from('profiles').update({ team_id: newTeam.id }).eq('id', userId);
          }
        }
        return;
      }

      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      const userIdx = profiles.findIndex((p) => p.id === userId);
      if (userIdx !== -1) {
        profiles[userIdx].role = 'admin';
        // Auto-create a team for them if they don't have one
        if (!profiles[userIdx].team_id) {
          const teams = getLocal<Team[]>(TEAMS_KEY, []);
          const newTeam: Team = {
            id: `team-${Date.now()}`,
            name: `${profiles[userIdx].full_name} चा संघ`,
            admin_id: userId,
            referral_code: generateReferralCode(),
            created_at: new Date().toISOString(),
          };
          teams.push(newTeam);
          setLocal(TEAMS_KEY, teams);
          profiles[userIdx].team_id = newTeam.id;
        }
        setLocal(PROFILE_KEY, profiles);
      }
    },
  },

  // ----------------------------------------------------
  // TEAM
  // ----------------------------------------------------
  team: {
    getCurrentTeam: async (): Promise<Team | null> => {
      const profile = await dbService.profile.getProfile();
      if (!profile || !profile.team_id) return null;

      if (isSupabaseConfigured()) {
        const { data } = await supabase.from('teams').select('*').eq('id', profile.team_id).single();
        return data as Team;
      }

      const teams = getLocal<Team[]>(TEAMS_KEY, []);
      return teams.find((t) => t.id === profile.team_id) || null;
    },

    getTeamByReferralCode: async (code: string): Promise<Team | null> => {
      const cleanCode = code.trim().toUpperCase();
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('teams')
          .select('*')
          .ilike('referral_code', cleanCode)
          .maybeSingle();
        return data as Team;
      }

      const teams = getLocal<Team[]>(TEAMS_KEY, []);
      return teams.find((t) => t.referral_code.toUpperCase() === cleanCode) || null;
    },

    joinByReferralCode: async (code: string, targetUserId?: string): Promise<Team> => {
      const user = await dbService.auth.getCurrentUser();
      const userId = targetUserId || user?.id;
      if (!userId) throw new Error('Not logged in');

      const team = await dbService.team.getTeamByReferralCode(code);
      if (!team) {
        throw new Error('अवैध रेफरल कोड! कृपया तपासा (Invalid referral code)');
      }

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('profiles')
          .update({ team_id: team.id, updated_at: new Date().toISOString() })
          .eq('id', userId);
        if (error) throw error;
        return team;
      }

      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      const idx = profiles.findIndex((p) => p.id === userId);
      if (idx !== -1) {
        profiles[idx].team_id = team.id;
        setLocal(PROFILE_KEY, profiles);
      }
      return team;
    },

    getTeamMembers: async (teamId: string): Promise<Profile[]> => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('profiles').select('*').eq('team_id', teamId);
        if (error) throw error;
        return (data || []) as Profile[];
      }

      const profiles = getLocal<Profile[]>(PROFILE_KEY, []);
      return profiles.filter((p) => p.team_id === teamId);
    },

    regenerateReferralCode: async (teamId: string): Promise<string> => {
      const newCode = generateReferralCode();
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('teams')
          .update({ referral_code: newCode })
          .eq('id', teamId);
        if (error) throw error;
        return newCode;
      }

      const teams = getLocal<Team[]>(TEAMS_KEY, []);
      const idx = teams.findIndex((t) => t.id === teamId);
      if (idx !== -1) {
        teams[idx].referral_code = newCode;
        setLocal(TEAMS_KEY, teams);
      }
      return newCode;
    },
  },

  // ----------------------------------------------------
  // FAMILIES & SURVEYS
  // ----------------------------------------------------
  families: {
    getAll: async (filterTeam?: boolean): Promise<Family[]> => {
      const profile = await dbService.profile.getProfile();
      if (!profile) return [];

      const isAdmin = profile.role === 'admin';

      if (isSupabaseConfigured()) {
        let query = supabase.from('families').select(`
          *,
          members:family_members(*)
        `).order('serial_no', { ascending: true });

        // If user is regular worker, only show their own families
        if (!isAdmin) {
          query = query.eq('user_id', profile.id);
        } else if (filterTeam && profile.team_id) {
          query = query.eq('team_id', profile.team_id);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching families:', error);
          return [];
        }
        return (data || []) as Family[];
      }

      initLocalData();
      const allFamilies = getLocal<Family[]>(FAMILIES_KEY, []);
      const allMembers = getLocal<FamilyMember[]>(MEMBERS_KEY, []);

      let filtered = allFamilies;
      if (!isAdmin) {
        // Field worker only sees their own
        filtered = allFamilies.filter((f) => f.user_id === profile.id);
      } else if (filterTeam && profile.team_id) {
        // Admin sees all families from their team
        filtered = allFamilies.filter((f) => f.team_id === profile.team_id);
      }

      // Attach members
      return filtered.map((f) => ({
        ...f,
        members: allMembers.filter((m) => m.family_id === f.id),
      }));
    },

    getById: async (id: string): Promise<Family | null> => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('families')
          .select(`
            *,
            members:family_members(*)
          `)
          .eq('id', id)
          .single();
        if (error || !data) return null;
        return data as Family;
      }

      const allFamilies = getLocal<Family[]>(FAMILIES_KEY, []);
      const fam = allFamilies.find((f) => f.id === id);
      if (!fam) return null;

      const allMembers = getLocal<FamilyMember[]>(MEMBERS_KEY, []);
      return {
        ...fam,
        members: allMembers.filter((m) => m.family_id === fam.id),
      };
    },

    create: async (data: FamilyFormData): Promise<Family> => {
      const profile = await dbService.profile.getProfile();
      if (!profile) throw new Error('Not logged in');

      const { members, ...familyData } = data;

      if (isSupabaseConfigured()) {
        // 1. Insert Family
        const { data: createdFam, error: famError } = await supabase
          .from('families')
          .insert({
            ...familyData,
            user_id: profile.id,
            team_id: profile.team_id,
          })
          .select()
          .single();

        if (famError || !createdFam) throw famError;

        // 2. Insert Members
        if (members && members.length > 0) {
          const membersToInsert = members.map((m) => ({
            ...m,
            family_id: createdFam.id,
          }));

          const { data: createdMembers, error: memError } = await supabase
            .from('family_members')
            .insert(membersToInsert)
            .select();

          if (memError) throw memError;
          return { ...createdFam, members: createdMembers } as Family;
        }

        return createdFam as Family;
      }

      // Local storage implementation
      const allFamilies = getLocal<Family[]>(FAMILIES_KEY, []);
      const allMembers = getLocal<FamilyMember[]>(MEMBERS_KEY, []);

      const newFamId = `fam-${Date.now()}`;
      const newFamily: Family = {
        ...familyData,
        id: newFamId,
        user_id: profile.id,
        team_id: profile.team_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      allFamilies.push(newFamily);
      setLocal(FAMILIES_KEY, allFamilies);

      const createdMemberList: FamilyMember[] = [];
      if (members && members.length > 0) {
        members.forEach((m, idx) => {
          const newMem: FamilyMember = {
            ...m,
            id: `mem-${Date.now()}-${idx}`,
            family_id: newFamId,
            created_at: new Date().toISOString(),
          };
          allMembers.push(newMem);
          createdMemberList.push(newMem);
        });
        setLocal(MEMBERS_KEY, allMembers);
      }

      return { ...newFamily, members: createdMemberList };
    },

    update: async (id: string, data: Partial<FamilyFormData>): Promise<Family> => {
      const { members, ...familyData } = data;

      if (isSupabaseConfigured()) {
        const { data: updatedFam, error: famError } = await supabase
          .from('families')
          .update({
            ...familyData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (famError) throw famError;

        // If members provided, replace them
        if (members) {
          await supabase.from('family_members').delete().eq('family_id', id);
          if (members.length > 0) {
            const membersToInsert = members.map((m) => ({
              ...m,
              family_id: id,
            }));
            const { data: createdMembers } = await supabase
              .from('family_members')
              .insert(membersToInsert)
              .select();
            return { ...updatedFam, members: createdMembers || [] } as Family;
          }
        }

        return updatedFam as Family;
      }

      // Local storage update
      const allFamilies = getLocal<Family[]>(FAMILIES_KEY, []);
      const idx = allFamilies.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error('Family record not found');

      allFamilies[idx] = {
        ...allFamilies[idx],
        ...familyData,
        updated_at: new Date().toISOString(),
      };
      setLocal(FAMILIES_KEY, allFamilies);

      let allMembers = getLocal<FamilyMember[]>(MEMBERS_KEY, []);
      if (members) {
        // Delete existing members for this family
        allMembers = allMembers.filter((m) => m.family_id !== id);
        const newMembers: FamilyMember[] = members.map((m, i) => ({
          ...m,
          id: `mem-${Date.now()}-${i}`,
          family_id: id,
          created_at: new Date().toISOString(),
        }));
        allMembers.push(...newMembers);
        setLocal(MEMBERS_KEY, allMembers);
        return { ...allFamilies[idx], members: newMembers };
      }

      return allFamilies[idx];
    },

    delete: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('families').delete().eq('id', id);
        if (error) throw error;
        return true;
      }

      let allFamilies = getLocal<Family[]>(FAMILIES_KEY, []);
      allFamilies = allFamilies.filter((f) => f.id !== id);
      setLocal(FAMILIES_KEY, allFamilies);

      let allMembers = getLocal<FamilyMember[]>(MEMBERS_KEY, []);
      allMembers = allMembers.filter((m) => m.family_id !== id);
      setLocal(MEMBERS_KEY, allMembers);

      return true;
    },
  },
};
