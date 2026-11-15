import React, { useState } from 'react';
import type { Profile, Team } from '../lib/types';
import { useLanguage, translations } from '../lib/i18n';
import { useTheme } from '../lib/theme';
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
  Sun,
  Moon,
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
  const [theme, , toggleTheme] = useTheme();
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
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('surveys')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">Village Survey</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hidden xs:inline">
                    {t.appNameShort}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('surveys')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'surveys'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200/50 dark:border-emerald-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t.navSurveys}</span>
              </button>

              <button
                onClick={() => setActiveTab('new-survey')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'new-survey'
                    ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.navNewSurvey}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('team')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200/50 dark:border-emerald-800/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{t.navTeam}</span>
                </button>
              )}
            </nav>

            {/* Profile & Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Admin Referral Code Pill (Mobile & Desktop) */}
              {isAdmin && team && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Click to copy Referral Code"
                  className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] sm:text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer active:scale-95 transition-all"
                >
                  <KeyRound className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="font-mono tracking-wider">{team.referral_code}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
              )}

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? t.themeLight : t.themeDark}
                className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                )}
              </button>

              {/* Language Switcher Pill */}
              <button
                onClick={toggleLanguage}
                title={lang === 'mr' ? 'Switch to English' : 'मराठी निवडा'}
                className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'mr' ? 'EN' : 'मराठी'}</span>
              </button>

              {/* User Profile Info (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                    {profile?.full_name || 'User'}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" /> {t.roleAdmin}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/60 px-1.5 rounded">
                        <UserCheck className="w-2.5 h-2.5" /> {t.roleWorker}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Logout */}
              <button
                onClick={onLogout}
                title={t.logout}
                className="sm:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Native Bottom Navigation Bar (Fixed at bottom for easy thumb access) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg shadow-2xl py-2 flex items-center justify-around transition-colors">
        <button
          onClick={() => setActiveTab('surveys')}
          className={`flex-1 flex flex-col items-center gap-1 py-1 text-center cursor-pointer ${
            activeTab === 'surveys'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mx-auto" />
          <span className="text-[10px] leading-none">{t.navSurveys}</span>
        </button>

        <button
          onClick={() => setActiveTab('new-survey')}
          className={`flex-1 flex flex-col items-center gap-1 py-1 text-center cursor-pointer ${
            activeTab === 'new-survey'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <PlusCircle className="w-5 h-5 mx-auto" />
          <span className="text-[10px] leading-none">{t.navNewSurvey}</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 flex flex-col items-center gap-1 py-1 text-center cursor-pointer ${
              activeTab === 'team'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Users className="w-5 h-5 mx-auto" />
            <span className="text-[10px] leading-none">{t.navTeam}</span>
          </button>
        )}
      </nav>
    </>
  );
};
