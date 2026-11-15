import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import type { Profile, Team, Family } from '../lib/types';
import { useLanguage, translations } from '../lib/i18n';
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
  const [lang] = useLanguage();
  const t = translations[lang];

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
    const msg = lang === 'mr'
      ? 'नवीन रेफरल कोड तयार करायचा आहे का? जुना कोड काम करणे बंद करेल.'
      : 'Do you want to generate a new referral code? The old code will stop working.';

    if (window.confirm(msg)) {
      await dbService.team.regenerateReferralCode(team.id);
      onRefresh();
    }
  };

  const handleRemoveUser = async (userId: string, name: string) => {
    if (userId === profile?.id) return;
    const msg = lang === 'mr'
      ? `"${name}" यांना संघातून काढायचे आहे का?`
      : `Are you sure you want to remove "${name}" from this team?`;

    if (window.confirm(msg)) {
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
    const text = lang === 'mr'
      ? `Village Survey Manager (ग्राम सर्वेक्षण) मध्ये सामील व्हा!\n\nरेफरल कोड: ${team.referral_code}\n\nGoogle ने लॉगिन करा आणि हा कोड टाका.`
      : `Join Village Survey Manager!\n\nReferral Code: ${team.referral_code}\n\nSign in with Google and enter this code to join my team.`;

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
              <span>{t.adminHeroBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {team?.name || (lang === 'mr' ? 'माझा सर्वेक्षण संघ' : 'My Survey Team')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t.adminHeroDesc}
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-full md:w-auto min-w-[280px] text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 block">
              {t.teamReferralCodeLabel}
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black tracking-widest text-amber-300 bg-black/20 px-4 py-1.5 rounded-xl border border-white/10">
                {team?.referral_code || '------'}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-emerald-200">
              <button onClick={handleShareCode} className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer">
                <Share2 className="w-3 h-3" /> {t.btnShare}
              </button>
              <span>·</span>
              <button onClick={handleRegenerateCode} className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer">
                <RefreshCw className="w-3 h-3" /> {t.btnRegenerate}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{t.howItWorksTitle}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-800/60 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center mx-auto text-sm">1</div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{t.step1Title}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{t.step1Desc}</p>
          </div>
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-800/60 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center mx-auto text-sm">2</div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{t.step2Title}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{t.step2Desc}</p>
          </div>
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-800/60 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center mx-auto text-sm">3</div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{t.step3Title}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{t.step3Desc}</p>
          </div>
        </div>
      </div>

      {/* Team Members Roster */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.teamRosterTitle}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{members.length} {t.teamRosterSub}</p>
            </div>
          </div>

          <button
            onClick={loadMembers}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
            {t.emptyTeam}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.map((mem) => {
              const userSurveys = families.filter((f) => f.user_id === mem.id);
              const isSelf = mem.id === profile?.id;

              return (
                <div key={mem.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                      {mem.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {mem.full_name}
                          {isSelf && <span className="text-slate-400 dark:text-slate-500 font-normal"> ({t.youBadge})</span>}
                        </span>
                        {mem.role === 'admin' ? (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1.5 rounded">
                            {t.roleAdmin}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1.5 rounded">
                            {t.roleWorker}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {mem.email}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(mem.created_at).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <FileSpreadsheet className="w-3 h-3" />
                      {userSurveys.length} {t.surveysCount}
                    </span>

                    {!isSelf && mem.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveUser(mem.id, mem.full_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                        title={t.btnRemoveUser}
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
