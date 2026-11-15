import { useState, useEffect, useCallback } from 'react';
import { dbService } from './lib/db';
import type { Profile, Team, Family, FamilyFormData } from './lib/types';
import { Navbar } from './components/Navbar';
import { SurveyList } from './components/SurveyList';
import { SurveyForm } from './components/SurveyForm';
import { AdminTeamView } from './components/AdminTeamView';
import { AuthPage } from './components/AuthPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'surveys' | 'new-survey' | 'team'>('surveys');
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);

  const loadData = useCallback(async () => {
    try {
      const prof = await dbService.profile.getProfile();
      setProfile(prof);

      if (prof?.team_id) {
        const tm = await dbService.team.getCurrentTeam();
        setTeam(tm);
      } else {
        setTeam(null);
      }

      const list = await dbService.families.getAll();
      setFamilies(list);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  // After OAuth redirect: apply pending referral code if exists
  const applyPendingReferral = useCallback(async () => {
    const pendingCode = localStorage.getItem('vsm_pending_referral');
    if (!pendingCode) return;

    localStorage.removeItem('vsm_pending_referral');
    try {
      await dbService.team.joinByReferralCode(pendingCode);
      console.log('Successfully joined team with referral code:', pendingCode);
    } catch (err) {
      console.warn('Could not auto-join team with referral code:', pendingCode, err);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: subscription } = dbService.auth.onAuthStateChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Small delay to let trigger-created profile settle
        await new Promise((r) => setTimeout(r, 500));
        await applyPendingReferral();
        await loadData();
      } else {
        setProfile(null);
        setTeam(null);
        setFamilies([]);
      }
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [loadData, applyPendingReferral]);

  const handleLogout = async () => {
    await dbService.auth.signOut();
    setUser(null);
    setProfile(null);
    setTeam(null);
    setFamilies([]);
    setActiveTab('surveys');
  };

  const handleSaveSurvey = async (formData: FamilyFormData) => {
    if (editingFamily) {
      await dbService.families.update(editingFamily.id, formData);
    } else {
      await dbService.families.create(formData);
    }
    setEditingFamily(null);
    setActiveTab('surveys');
    await loadData();
  };

  const handleDeleteSurvey = async (id: string) => {
    await dbService.families.delete(id);
    await loadData();
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login page
  if (!user) {
    return <AuthPage onSuccess={loadData} />;
  }

  const nextSerial = families.length > 0
    ? Math.max(...families.map((f) => f.serial_no || 0)) + 1
    : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        profile={profile}
        team={team}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'surveys' && (
          <SurveyList
            families={families}
            profile={profile}
            onNewSurvey={() => {
              setEditingFamily(null);
              setActiveTab('new-survey');
            }}
            onEditSurvey={(fam) => {
              setEditingFamily(fam);
              setActiveTab('new-survey');
            }}
            onDeleteSurvey={handleDeleteSurvey}
          />
        )}

        {activeTab === 'new-survey' && (
          <SurveyForm
            initialData={editingFamily}
            onSave={handleSaveSurvey}
            onCancel={() => {
              setEditingFamily(null);
              setActiveTab('surveys');
            }}
            nextSerialNo={nextSerial}
          />
        )}

        {activeTab === 'team' && (
          <AdminTeamView
            team={team}
            profile={profile}
            families={families}
            onRefresh={loadData}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        Village Survey Manager · ग्राम सर्वेक्षण · २०२६
      </footer>
    </div>
  );
}
