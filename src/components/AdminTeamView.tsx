import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import type { Profile, Team, Family } from '../lib/types';
import { 
  Users, 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  UserPlus, 
  FileSpreadsheet, 
  Mail, 
  Calendar,
  Share2,
  Sparkles
} from 'lucide-react';

interface AdminTeamViewProps {
  team: Team | null;
  profile: Profile | null;
  families: Family[];
  onRefresh: () => void;
}

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({
  team,
  profile,
  families,
  onRefresh,
}) => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  useEffect(() => {
    if (team?.id) {
      loadMembers();
    }
  }, [team?.id]);

  const loadMembers = async () => {
    if (!team?.id) return;
    setLoading(true);
    try {
      const list = await dbService.team.getTeamMembers(team.id);
      setMembers(list);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (team?.referral_code) {
      navigator.clipboard.writeText(team.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRegenerateCode = async () => {
    if (!team?.id) return;
    if (window.confirm('नवीन रेफरल कोड तयार करायचा आहे का? जुना कोड काम करणे बंद करेल.')) {
      await dbService.team.regenerateReferralCode(team.id);
      onRefresh();
    }
  };

  // Quick invite / register helper
  const handleQuickAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    try {
      await dbService.auth.signUp(
        inviteEmail.trim(),
        'Password123!',
        inviteName.trim(),
        team?.referral_code
      );
      setInviteMsg(`✅ वापरकर्ता यशस्वीरित्या जोडला गेला: ${inviteName}`);
      setInviteEmail('');
      setInviteName('');
      loadMembers();
      setTimeout(() => setInviteMsg(null), 4000);
    } catch (err: any) {
      setInviteMsg(`❌ त्रुटी: ${err?.message || 'जोडता आले नाही'}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner / Referral Code Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-12 w-40 h-40 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ऍडमिन डॅशबोर्ड (Admin Control Center)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {team?.name || 'माझा सर्वेक्षण संघ'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              आपल्या सर्व्हेक्षण पथकातील सर्व सदस्यांना जोडण्यासाठी खालील रेफरल कोड पाठवा. जेव्हा नवीन वापरकर्ता हा कोड वापरून खाते उघडेल, तेव्हा त्याचे सर्व कुटुंब सर्व्हेक्षण थेट आपल्या नियंत्रणाखाली येतील.
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-full md:w-auto min-w-[280px] text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 block">
              आपला संघ रेफरल कोड (Referral Code)
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black tracking-widest text-amber-300 bg-black/20 px-4 py-1.5 rounded-xl border border-white/10">
                {team?.referral_code || '------'}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all shadow-md active:scale-95"
                title="कोड कॉपी करा (Copy Code)"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-emerald-200">
              <button
                onClick={handleRegenerateCode}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> नवीन कोड तयार करा
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Quick Add Worker + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Add Worker Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">थेट कार्यकर्ता जोडा</h3>
              <p className="text-[11px] text-slate-500">Quickly add a worker to your team</p>
            </div>
          </div>

          {inviteMsg && (
            <div className="p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              {inviteMsg}
            </div>
          )}

          <form onSubmit={handleQuickAddUser} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                कार्यकर्त्याचे नाव (Full Name)
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="उदा. राहुल शिंदे"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ईमेल (Email Address)
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="उदा. rahul@survey.org"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <p className="text-[11px] text-slate-400">
              कार्यकर्ता आपोआप रेफरल कोड <span className="font-mono font-bold text-slate-700">{team?.referral_code}</span> शी जोडला जाईल. (डीफॉल्ट पासवर्ड: Password123!)
            </p>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-xs"
            >
              + संघात जोडा (Add to Team)
            </button>
          </form>
        </div>

        {/* Right: Team Members Roster */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">संघातील सदस्य यादी</h3>
                <p className="text-[11px] text-slate-500">
                  {members.length} नोंदणीकृत सदस्य (Field Workers)
                </p>
              </div>
            </div>

            <button
              onClick={loadMembers}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              title="रीफ्रेश करा"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              कोणतेही सदस्य जोडलेले नाहीत. आपल्या सहकाऱ्यांना रेफरल कोड शेअर करा.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((mem) => {
                const userSurveys = families.filter((f) => f.user_id === mem.id);
                const isMemAdmin = mem.role === 'admin';

                return (
                  <div key={mem.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {mem.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{mem.full_name}</span>
                          {isMemAdmin ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                              ऍडमिन
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              सर्व्हेक्षक
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {mem.email}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(mem.created_at).toLocaleDateString('mr-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>{userSurveys.length} सर्व्हे</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
