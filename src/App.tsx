import React, { useState, useEffect } from 'react';
import { dbService } from './lib/db';
import type { Profile, Team, Family, FamilyFormData } from './lib/types';
import { Navbar } from './components/Navbar';
import { SurveyList } from './components/SurveyList';
import { SurveyForm } from './components/SurveyForm';
import { AdminTeamView } from './components/AdminTeamView';
import { AuthModal } from './components/AuthModal';

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'surveys' | 'new-survey' | 'team'>('surveys');
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);

  // Initialize DB and load data
  useEffect(() => {
    dbService.init();
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const user = await dbService.auth.getCurrentUser();
      if (!user) {
        setProfile(null);
        setTeam(null);
        setFamilies([]);
        return;
      }

      const prof = await dbService.profile.getProfile();
      setProfile(prof);

      if (prof?.team_id) {
        const tm = await dbService.team.getCurrentTeam();
        setTeam(tm);
      } else {
        setTeam(null);
      }

      const list = await dbService.families.getAll(true);
      setFamilies(list);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await dbService.auth.signOut();
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
    await loadAllData();
  };

  const handleDeleteSurvey = async (id: string) => {
    await dbService.families.delete(id);
    await loadAllData();
  };

  const handleStartNewSurvey = () => {
    setEditingFamily(null);
    setActiveTab('new-survey');
  };

  const handleEditSurvey = (family: Family) => {
    setEditingFamily(family);
    setActiveTab('new-survey');
  };

  // If loading first time
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">लोड होत आहे... (Loading Village Survey Manager)</p>
        </div>
      </div>
    );
  }

  // If not logged in, render the Auth modal
  if (!profile) {
    return <AuthModal onSuccess={loadAllData} />;
  }

  // Calculate next serial number for new survey
  const nextSerial = families.length > 0 ? Math.max(...families.map((f) => f.serial_no || 0)) + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        team={team}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onRefresh={loadAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'surveys' && (
          <SurveyList
            families={families}
            profile={profile}
            onNewSurvey={handleStartNewSurvey}
            onEditSurvey={handleEditSurvey}
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
            onRefresh={loadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        Village Survey Manager · कुटुंब सर्वेक्षण व संघ व्यवस्थापन प्रणाली · २०२६
      </footer>
    </div>
  );
}

export default App;
