import React, { useState } from 'react';
import type { Profile, Team } from '../lib/types';
import { useLanguage, translations } from '../lib/i18n';
import {
  Building2,
  Users,
  FileSpreadsheet,
  PlusCircle,
  LogOut,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Globe2,
} from 'lucide-react';

interface NavbarProps {
  profile: Profile | null;
  team: Team | null;
  activeTab: 'surveys' | 'new-survey' | 'team';
  setActiveTab: (tab: 'surveys' | 'new-survey' | 'team') => void;
  onLogout: () => void;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  team,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const [lang, setLang] = useLanguage();
  const t = translations[lang];

  const [copied, setCopied] = useState(false);
  const isAdmin = profile?.role === 'admin';

  const handleCopyCode = () => {
    if (team?.referral_code) {
      navigator.clipboard.writeText(team.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'mr' ? 'en' : 'mr');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('surveys')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Village Survey Manager</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
                  {t.appNameShort}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('surveys')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'surveys'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.navSurveys}</span>
            </button>

            <button
              onClick={() => setActiveTab('new-survey')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'new-survey'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.navNewSurvey}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'team'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t.navTeam}</span>
              </button>
            )}
          </nav>

          {/* Profile & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              title={lang === 'mr' ? 'Switch to English' : 'मराठी निवडा'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
            </button>

            {/* Referral Code Badge (Admin only) */}
            {isAdmin && team && (
              <div
                onClick={handleCopyCode}
                title="Click to copy Referral Code"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.referralCode}:</span>
                <span className="font-mono font-bold tracking-wider text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded">
                  {team.referral_code}
                </span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
              </div>
            )}

            {/* User Info + Role Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                  {profile?.full_name || 'User'}
                </div>
                <div className="flex items-center justify-end gap-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 rounded">
                      <ShieldCheck className="w-2.5 h-2.5" /> {t.roleAdmin}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 bg-blue-100/80 px-1.5 rounded">
                      <UserCheck className="w-2.5 h-2.5" /> {t.roleWorker}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={onLogout}
                title={t.logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('surveys')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
              activeTab === 'surveys' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.navSurveys}</span>
          </button>
          <button
            onClick={() => setActiveTab('new-survey')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
              activeTab === 'new-survey' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navNewSurvey}</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('team')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
                activeTab === 'team' ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.navTeam}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
