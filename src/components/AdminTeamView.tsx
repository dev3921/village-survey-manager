import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import type { Profile, Team, Family } from '../lib/types';
import {
  Users,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
  Mail,
  Calendar,
  Share2,
  KeyRound,
  UserX,
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (team?.id) loadMembers();
  }, [team?.id]);

  const loadMembers = async () => {
    if (!team?.id) return;
    try {
      const list = await dbService.team.getTeamMembers(team.id);
      setMembers(list);
    } catch (err) {
      console.error('Error loading members:', err);
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

  const handleRemoveUser = async (userId: string, name: string) => {
    if (userId === profile?.id) return; // Can't remove yourself
    if (window.confirm(`"${name}" यांना संघातून काढायचे आहे का? (Remove ${name} from team?)`)) {
      try {
        await dbService.team.removeUserFromTeam(userId);
        loadMembers();
      } catch (err) {
        console.error('Error removing user:', err);
      }
    }
  };

  const handleShareCode = () => {
    if (!team?.referral_code) return;
    const text = `Village Survey Manager (ग्राम सर्वेक्षण) मध्ये सामील व्हा!\n\nरेफरल कोड: ${team.referral_code}\n\nGoogle ने लॉगिन करा आणि हा कोड टाका.`;
    if (navigator.share) {
      navigator.share({ title: 'Village Survey Manager - Referral Code', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner with Referral Code */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ऍडमिन डॅशबोर्ड (Admin Dashboard)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {team?.name || 'माझा सर्वेक्षण संघ'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              आपल्या संघातील कार्यकर्त्यांना खालील रेफरल कोड द्या. ते Google ने लॉगिन करताना हा कोड टाकतील आणि आपोआप आपल्या संघात सामील होतील.
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-full md:w-auto min-w-[280px] text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 block">
              आपला संघ रेफरल कोड
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black tracking-widest text-amber-300 bg-black/20 px-4 py-1.5 rounded-xl border border-white/10">
                {team?.referral_code || '------'}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all shadow-md active:scale-95"
                title="कोड कॉपी करा"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-emerald-200">
              <button onClick={handleShareCode} className="hover:text-white flex items-center gap-1 transition-colors">
                <Share2 className="w-3 h-3" /> शेअर करा
              </button>
              <span>·</span>
              <button onClick={handleRegenerateCode} className="hover:text-white flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3" /> नवीन कोड तयार करा
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>कार्यकर्ता कसे जोडावे? (How to add field workers)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto text-sm">1</div>
            <p className="font-semibold text-slate-800">रेफरल कोड शेअर करा</p>
            <p className="text-slate-500">वरील कोड आपल्या कार्यकर्त्यांना WhatsApp, SMS किंवा प्रत्यक्ष भेटीत द्या.</p>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto text-sm">2</div>
            <p className="font-semibold text-slate-800">कार्यकर्ता लॉगिन करतात</p>
            <p className="text-slate-500">कार्यकर्ता Google ने लॉगिन करतात आणि लॉगिन स्क्रीनवर हा रेफरल कोड टाकतात.</p>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto text-sm">3</div>
            <p className="font-semibold text-slate-800">आपोआप संघात जोडले जातात</p>
            <p className="text-slate-500">त्यांनी भरलेले सर्व सर्व्हेक्षण आपल्या डॅशबोर्डवर दिसतील.</p>
          </div>
        </div>
      </div>

      {/* Team Members Roster */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">संघातील सदस्य यादी (Team Members)</h3>
              <p className="text-[11px] text-slate-500">{members.length} नोंदणीकृत सदस्य</p>
            </div>
          </div>

          <button
            onClick={loadMembers}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            अद्याप कोणीही सामील झालेले नाही. रेफरल कोड शेअर करा.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((mem) => {
              const userSurveys = families.filter((f) => f.user_id === mem.id);
              const isSelf = mem.id === profile?.id;

              return (
                <div key={mem.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                      {mem.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {mem.full_name}
                          {isSelf && <span className="text-slate-400 font-normal"> (आपण)</span>}
                        </span>
                        {mem.role === 'admin' ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 rounded">
                            ऍडमिन
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 rounded">
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
                          {new Date(mem.created_at).toLocaleDateString('mr-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <FileSpreadsheet className="w-3 h-3" />
                      {userSurveys.length} सर्व्हे
                    </span>

                    {!isSelf && mem.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveUser(mem.id, mem.full_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="संघातून काढा (Remove from team)"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
