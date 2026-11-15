import React, { useState } from 'react';
import { dbService } from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';
import { useLanguage, translations } from '../lib/i18n';
import { 
  Building2, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Users, 
  ShieldCheck, 
  Globe2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = () => {
  const [lang, setLang] = useLanguage();
  const t = translations[lang];

  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  const handleGoogleLogin = async () => {
    setError(null);

    if (!configured) {
      setError(
        lang === 'mr'
          ? 'कृपया .env मध्ये Supabase URL आणि Anon Key प्रविष्ट करा.'
          : 'Please configure Supabase credentials in .env file.'
      );
      return;
    }

    if (referralCode.trim()) {
      localStorage.setItem('vsm_pending_referral', referralCode.trim().toUpperCase());
    }

    setLoading(true);
    try {
      await dbService.auth.signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || (lang === 'mr' ? 'Google लॉगिन अयशस्वी' : 'Google login failed'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block">
                {t.appTitle}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium hidden sm:block">
                {t.appSubtitle}
              </span>
            </div>
          </div>

          {/* Language Switcher Pill */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />
            <button
              type="button"
              onClick={() => setLang('mr')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                lang === 'mr'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Login Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Platform Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.loginBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {t.loginHeading}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.loginDesc}
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">{t.feature1Title}</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">{t.feature1Desc}</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">{t.feature2Title}</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">{t.feature2Desc}</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">{t.feature3Title}</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">{t.feature3Desc}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {lang === 'mr' ? 'प्रणालीमध्ये प्रवेश करा' : 'Sign in to Portal'}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {lang === 'mr'
                      ? 'आपल्या अधिकृत Google खात्याद्वारे लॉगिन करा'
                      : 'Authenticate securely using your Google account'}
                  </p>
                </div>

                {!configured && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">{t.needSetup}</p>
                      <p className="text-amber-200/80 text-[11px] leading-relaxed">
                        {t.needSetupDesc}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* Referral Code Box */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4.5 space-y-2.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.referralLabel}</span>
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder={t.referralPlaceholder}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-bold uppercase tracking-widest text-center text-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-normal placeholder:normal-case"
                    maxLength={8}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t.referralHelp}
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-sm shadow-xl active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{loading ? (lang === 'mr' ? 'लॉगिन होत आहे...' : 'Signing in...') : t.signInGoogle}</span>
                </button>

                <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.loginDisclaimer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Village Survey Manager · {t.appNameShort} · २०२६
      </footer>
    </div>
  );
};
