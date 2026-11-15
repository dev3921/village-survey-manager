import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import type { Profile, Team, Family } from '../lib/types';
import { 
  Users, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Mail, 
  Calendar,
  FileSpreadsheet,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface AdminTeamViewProps {
  team: Team | null;
  profile: Profile | null;
  families: Family[];
  onRefresh: () => void;
}

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({
  team,
  families,
  onRefresh,
}) => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
    } catch (e) {
      console.error('Failed to load team members:', e);
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
      try {
        await dbService.team.regenerateReferralCode(team.id);
        onRefresh();
      } catch (err: any) {
        alert('त्रुटी: ' + (err?.message || 'Failed to regenerate code'));
      }
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${name}" यांना संघातून काढून टाकायचे आहे?`)) {
      setRemovingId(userId);
      try {
        await dbService.team.removeUserFromTeam(userId);
        await loadMembers();
        onRefresh();
      } catch (err: any) {
        alert('त्रुटी: ' + (err?.message || 'Failed to remove user'));
      } finally {
        setRemovingId(null);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner / Referral Code Hero Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-12 w-40 h-40 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ऍडमिन नियंत्रण केंद्र (Admin Control Center)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {team?.name || 'माझा सर्वेक्षण संघ'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              आपल्या सर्व्हेक्षण पथकातील सर्व सदस्यांना खालील रेफरल कोड शेअर करा. जेव्हा नवीन कार्यकर्ता Google द्वारे लॉगिन करताना हा कोड टाकेल, तेव्हा तो आपोआप आपल्या संघात जोडला जाईल आणि त्याचे सर्व्हेक्षण थेट आपल्या डॅशबोर्डवर दिसतील.
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
                className="p-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                title="कोड कॉपी करा (Copy Code)"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-emerald-200">
              <button
                onClick={handleRegenerateCode}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> नवीन कोड तयार करा
              </button>
            </div>
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
              <h3 className="font-bold text-slate-900 text-sm">संघातील सदस्य यादी</h3>
              <p className="text-[11px] text-slate-500">
                {members.length} नोंदणीकृत कार्यकर्ते (Field Workers)
              </p>
            </div>
          </div>

          <button
            onClick={loadMembers}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="रीफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
            <p>कोणतेही सदस्य जोडलेले नाहीत.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              आपल्या सहकाऱ्यांना रेफरल कोड ({team?.referral_code}) पाठवा. ते Google लॉगिन करताना हा कोड वापरून संघात सामील होऊ शकतात.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((mem) => {
              const userSurveys = families.filter((f) => f.user_id === mem.id);
              const isMemAdmin = mem.role === 'admin';

              return (
                <div key={mem.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                      {mem.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{mem.full_name}</span>
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
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
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

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <FileSpreadsheet className="w-3 h-3" />
                      <span>{userSurveys.length} सर्व्हे</span>
                    </div>

                    {!isMemAdmin && (
                      <button
                        onClick={() => handleRemoveMember(mem.id, mem.full_name)}
                        disabled={removingId === mem.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="संघातून काढा (Remove from team)"
                      >
                        <Trash2 className="w-4 h-4" />
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
