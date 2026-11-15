import React, { useState } from 'react';
import { dbService } from '../lib/db';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await dbService.auth.signIn(email.trim(), password);
      } else {
        if (!fullName.trim()) {
          throw new Error('कृपया आपले पूर्ण नाव प्रविष्ट करा');
        }
        await dbService.auth.signUp(
          email.trim(),
          password,
          fullName.trim(),
          referralCode.trim() || undefined
        );
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'लॉगिन करताना त्रुटी आली. कृपया माहिती तपासा.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'worker') => {
    setLoading(true);
    setError(null);
    try {
      await dbService.auth.loginAsDemo(role);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Village Survey Manager</h1>
          <p className="text-xs text-emerald-100 font-medium">
            ग्राम कुटुंब सर्वेक्षण व संघ व्यवस्थापन प्रणाली
          </p>
        </div>

        {/* Demo Fast Buttons */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block text-center">
            ⚡ जलद चाचणी लॉगिन (Instant Demo Access)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-amber-300 text-amber-900 rounded-xl font-bold shadow-2xs hover:bg-amber-50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>ऍडमिन (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('worker')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-blue-300 text-blue-900 rounded-xl font-bold shadow-2xs hover:bg-blue-50 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>कार्यकर्ता (Worker)</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-5">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              लॉगिन करा (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'signup' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              नवीन नोंदणी (Sign Up)
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {tab === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  पूर्ण नाव <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="उदा. राहुल शिंदे"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ईमेल पत्ता (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">पासवर्ड (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {tab === 'signup' && (
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 space-y-1">
                <label className="block font-semibold text-amber-900">
                  ऍडमिन रेफरल कोड <span className="text-amber-700 font-normal">(Referral Code - ऐच्छिक)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="उदा. SATARA किंवा 6-अंकी कोड"
                    className="w-full pl-9 pr-3 py-1.5 border border-amber-200 bg-white rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-amber-800">
                  आपल्या ऍडमिनने दिलेला कोड येथे टाकल्यास आपण थेट त्यांच्या संघात सामील व्हाल.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 text-xs"
            >
              <span>{loading ? 'कृपया थांबा...' : tab === 'login' ? 'लॉगिन करा (Sign In)' : 'नोंदणी करा (Sign Up)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
