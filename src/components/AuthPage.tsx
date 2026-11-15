import React, { useState } from 'react';
import { dbService } from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';
import { useLanguage, translations } from '../lib/i18n';
import { 
  Building2, 
  KeyRound, 
  AlertTriangle, 
  ShieldCheck, 
  Globe2, 
  Lock
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Top Institutional Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight">
                {t.portalTitle}
              </span>
            </div>
          </div>

          {/* Language Switcher Pill */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-slate-600 ml-1.5" />
            <button
              type="button"
              onClick={() => setLang('mr')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                lang === 'mr'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Portal Form (Centered, Clean White) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative">
            
            {/* Portal Badge / Icon */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center text-emerald-700 shadow-xs mb-1">
                <Lock className="w-7 h-7 text-emerald-700" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'mr' ? 'प्रणाली प्रवेश' : 'Portal Sign In'}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.officialAccessOnly}
              </p>
            </div>

            {/* Error & Warning Banners */}
            {!configured && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{t.needSetup}</p>
                  <p className="text-amber-800/80 text-[11px] leading-relaxed">
                    {t.needSetupDesc}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Referral Code Box */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.referralLabel}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'mr' ? '(फक्त कार्यकर्त्यांसाठी)' : '(Field Workers)'}
                  </span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder={t.referralPlaceholder}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold uppercase tracking-widest text-center text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 focus:outline-hidden placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal placeholder:normal-case transition-all"
                  maxLength={8}
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {t.referralHelp}
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-xl text-sm shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? (lang === 'mr' ? 'प्रणालीमध्ये प्रवेश होत आहे...' : 'Signing in...') : t.signInGoogle}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.loginDisclaimer}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        {t.portalTitle} · {t.appNameShort} · {lang === 'mr' ? 'शासकीय व संस्थात्मक वापरासाठी' : 'Official Survey Portal'}
      </footer>
    </div>
  );
};
