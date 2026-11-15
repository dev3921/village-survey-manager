import React, { useState, useMemo } from 'react';
import type { Family, Profile } from '../lib/types';
import { exportFamiliesToExcel, exportFamiliesToPDF } from '../lib/export';
import { useLanguage, translations } from '../lib/i18n';
import { 
  Search, 
  Download, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Users, 
  Building2, 
  TrendingUp, 
  Zap, 
  X,
  FileSpreadsheet,
  UserCheck,
  User,
  ShieldCheck,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface SurveyListProps {
  families: Family[];
  profile: Profile | null;
  onNewSurvey: () => void;
  onEditSurvey: (family: Family) => void;
  onDeleteSurvey: (id: string) => Promise<void>;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  families,
  profile,
  onNewSurvey,
  onEditSurvey,
  onDeleteSurvey,
}) => {
  const [lang] = useLanguage();
  const t = translations[lang];

  const isAdmin = profile?.role === 'admin';

  // Sub-tabs for filtering scope
  const [scopeTab, setScopeTab] = useState<'all' | 'mine' | 'team'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [houseFilter, setHouseFilter] = useState<string>('all');
  const [surveyorFilter, setSurveyorFilter] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract distinct surveyors
  const surveyorsList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; role: string }>();
    families.forEach((f) => {
      if (f.user_id && f.submitter) {
        map.set(f.user_id, {
          id: f.user_id,
          name: f.submitter.full_name || 'Worker',
          role: f.submitter.role,
        });
      }
    });
    return Array.from(map.values());
  }, [families]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const all = families.length;
    const mine = families.filter((f) => f.user_id === profile?.id).length;
    const team = families.filter((f) => f.user_id !== profile?.id).length;
    return { all, mine, team };
  }, [families, profile?.id]);

  // Metrics computation (based on the currently visible list)
  const metrics = useMemo(() => {
    const totalFamilies = families.length;
    const totalMembers = families.reduce((acc, f) => acc + (f.total_members || f.members?.length || 1), 0);
    const bplCount = families.filter((f) => f.economic_status === 'BPL').length;
    const aplCount = families.filter((f) => f.economic_status === 'APL').length;
    const toiletCount = families.filter((f) => f.toilet).length;
    const electricityCount = families.filter((f) => f.electricity).length;

    return {
      totalFamilies,
      totalMembers,
      bplCount,
      aplCount,
      toiletCount,
      electricityCount,
    };
  }, [families]);

  // Filtering
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      // Scope tab filter
      if (scopeTab === 'mine' && f.user_id !== profile?.id) return false;
      if (scopeTab === 'team' && f.user_id === profile?.id) return false;

      // Specific surveyor filter
      if (surveyorFilter !== 'all' && f.user_id !== surveyorFilter) return false;

      // Search term
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        f.head_name.toLowerCase().includes(q) ||
        (f.village_name && f.village_name.toLowerCase().includes(q)) ||
        (f.caste && f.caste.toLowerCase().includes(q)) ||
        (f.shg_name && f.shg_name.toLowerCase().includes(q)) ||
        (f.submitter?.full_name && f.submitter.full_name.toLowerCase().includes(q));

      // Dropdown filters
      const matchesStatus = statusFilter === 'all' || f.economic_status === statusFilter;
      const matchesHouse = houseFilter === 'all' || f.house_type === houseFilter;

      return matchesSearch && matchesStatus && matchesHouse;
    });
  }, [families, scopeTab, surveyorFilter, searchTerm, statusFilter, houseFilter, profile?.id]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`${t.confirmDelete}\n(${name})`)) {
      setDeletingId(id);
      try {
        await onDeleteSurvey(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 md:pb-16 px-1 sm:px-0">
      {/* Metrics Row (Compact & Horizontal scroll on mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Families */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statFamilies}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1">{metrics.totalFamilies}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.statFamiliesDesc}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statMembers}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1">{metrics.totalMembers}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.statMembersDesc}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* BPL / APL Ratio */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statEconomic}
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.bplCount} BPL</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">/ {metrics.aplCount} APL</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.statEconomicDesc}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Basic Amenities */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.statAmenities}
            </p>
            <div className="flex items-center gap-2.5 mt-0.5 sm:mt-1 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              <span>⚡ {metrics.electricityCount}</span>
              <span>🚽 {metrics.toiletCount}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.statAmenitiesDesc}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Scope Filter Tabs (All / My Surveys / Team Submissions) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-full sm:w-auto">
          <button
            onClick={() => setScopeTab('all')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scopeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t.tabAllSurveys}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => setScopeTab('mine')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scopeTab === 'mine'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t.tabMySurveys}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
              {tabCounts.mine}
            </span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setScopeTab('team')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scopeTab === 'team'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t.tabTeamSurveys}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold">
                {tabCounts.team}
              </span>
            </button>
          )}
        </div>

        {/* Desktop New Survey Button */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => exportFamiliesToExcel(filteredFamilies)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.btnExcel}</span>
          </button>

          <button
            onClick={() => exportFamiliesToPDF(filteredFamilies)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{t.btnPdf}</span>
          </button>

          <button
            onClick={onNewSurvey}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.btnNew}</span>
          </button>
        </div>
      </div>

      {/* Action Bar (Search, Dropdown Filters, Mobile Export Buttons) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Surveyor filter (Only if multiple surveyors exist) */}
            {isAdmin && surveyorsList.length > 1 && (
              <select
                value={surveyorFilter}
                onChange={(e) => setSurveyorFilter(e.target.value)}
                className="px-2.5 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="all">{t.filterAllSurveyors}</option>
                {surveyorsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role === 'admin' ? t.roleAdmin : t.roleWorker})
                  </option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">{t.filterAllStatus}</option>
              <option value="BPL">{t.filterBPL}</option>
              <option value="APL">{t.filterAPL}</option>
            </select>

            <select
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
              className="px-2.5 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">{t.filterAllHouse}</option>
              <option value="पक्का">{t.filterPucca}</option>
              <option value="कच्चा">{t.filterKutcha}</option>
            </select>
          </div>
        </div>

        {/* Mobile Export Buttons Row */}
        <div className="flex md:hidden items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => exportFamiliesToExcel(filteredFamilies)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportFamiliesToPDF(filteredFamilies)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main Surveys Content */}
      {filteredFamilies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-16 text-center transition-colors">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.emptyTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {t.emptyDesc}
          </p>
          <button
            onClick={onNewSurvey}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.emptyBtn}</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. MOBILE CARDS VIEW (Displayed on Phones, < 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredFamilies.map((fam, idx) => {
              const isMine = fam.user_id === profile?.id;
              const submitterName = isMine
                ? t.youSelf
                : fam.submitter?.full_name || 'Worker';

              return (
                <div
                  key={fam.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors"
                >
                  {/* Top: Serial #, Head Name & Submitter Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                        #{fam.serial_no || idx + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight">
                          {fam.head_name}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">📍 {fam.village_name || '-'}</span>
                          {fam.caste && <span>· {fam.caste}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Submitter Pill */}
                    <div className="shrink-0">
                      {isMine ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                          ⭐ {t.youSelf}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                          <User className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[90px]">{submitterName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Badges & Metrics Row */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                      <Users className="w-3 h-3" />
                      {fam.total_members || fam.members?.length || 1} {lang === 'mr' ? 'सदस्य' : 'members'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase ${
                        fam.economic_status === 'BPL'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {fam.economic_status || 'BPL'}
                    </span>

                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{fam.monthly_income ? fam.monthly_income.toLocaleString('en-IN') : 0}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400">
                      {fam.house_type || '-'}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {fam.electricity ? '⚡' : ''} {fam.toilet ? '🚽' : ''}
                    </span>
                  </div>

                  {/* Bottom: Touch Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedFamily(fam)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{lang === 'mr' ? 'तपशील' : 'Details'}</span>
                    </button>

                    <button
                      onClick={() => onEditSurvey(fam)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.btnEdit}</span>
                    </button>

                    <button
                      disabled={deletingId === fam.id}
                      onClick={() => handleDelete(fam.id, fam.head_name)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. DESKTOP TABLE VIEW (Displayed on Tablets & Computers, >= 768px) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase font-bold tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-12 text-center">{t.thSr}</th>
                    <th className="py-3.5 px-4">{t.thHead}</th>
                    <th className="py-3.5 px-4">{t.thSurveyor}</th>
                    <th className="py-3.5 px-4 text-center">{t.thMembers}</th>
                    <th className="py-3.5 px-4">{t.thStatus}</th>
                    <th className="py-3.5 px-4">{t.thIncome}</th>
                    <th className="py-3.5 px-4">{t.thHouse}</th>
                    <th className="py-3.5 px-4">{t.thDate}</th>
                    <th className="py-3.5 px-4 text-right">{t.thActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredFamilies.map((fam, idx) => {
                    const isMine = fam.user_id === profile?.id;
                    const submitterName = isMine
                      ? t.youSelf
                      : fam.submitter?.full_name || 'Worker';

                    return (
                      <tr key={fam.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Serial No */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                          {fam.serial_no || idx + 1}
                        </td>

                        {/* Head Name & Village */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{fam.head_name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">📍 {fam.village_name || '-'}</span>
                            {fam.shg_name && (
                              <span className="text-slate-400 dark:text-slate-500">· {fam.shg_name}</span>
                            )}
                          </div>
                        </td>

                        {/* Surveyor / Added by */}
                        <td className="py-3.5 px-4">
                          {isMine ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                              ⭐ {t.youSelf}
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{submitterName}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block">
                                {fam.submitter?.role === 'admin' ? t.roleAdmin : t.roleWorker}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Members Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Users className="w-3 h-3" />
                            {fam.total_members || fam.members?.length || 1}
                          </span>
                        </td>

                        {/* Economic Status / Caste */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                fam.economic_status === 'BPL'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {fam.economic_status || 'BPL'}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{fam.caste}</span>
                          </div>
                        </td>

                        {/* Income */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {fam.monthly_income ? `₹${fam.monthly_income.toLocaleString('en-IN')}` : '-'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                            {fam.income_source || '-'}
                          </div>
                        </td>

                        {/* House & Amenities */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {fam.house_type ? `${fam.house_type}` : '-'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                            <span className={fam.electricity ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}>
                              ⚡ {fam.electricity ? (lang === 'mr' ? 'वीज' : 'Power') : '-'}
                            </span>
                            <span className={fam.toilet ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}>
                              🚽 {fam.toilet ? (lang === 'mr' ? 'शौचालय' : 'Toilet') : '-'}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-[11px]">
                          {new Date(fam.created_at).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedFamily(fam)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                              title="Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onEditSurvey(fam)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              disabled={deletingId === fam.id}
                              onClick={() => handleDelete(fam.id, fam.head_name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button (FAB) on Mobile Screens */}
      <button
        onClick={onNewSurvey}
        className="fixed bottom-6 right-5 z-40 md:hidden flex items-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-full shadow-2xl shadow-emerald-900/40 border border-emerald-400/30 transition-all cursor-pointer"
        aria-label={t.btnNew}
      >
        <Plus className="w-5 h-5" />
        <span className="text-xs font-bold">{t.btnNew}</span>
      </button>

      {/* DETAIL MODAL */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 transition-colors">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {t.thSr} #{selectedFamily.serial_no || 1}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>{t.addedBy}:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedFamily.user_id === profile?.id ? t.youSelf : selectedFamily.submitter?.full_name || 'Worker'}
                    </strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedFamily.head_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.fVillage}: {selectedFamily.village_name || '-'}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const fam = selectedFamily;
                    setSelectedFamily(null);
                    onEditSurvey(fam);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t.btnEdit}</span>
                </button>
                <button
                  onClick={() => setSelectedFamily(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
              {/* Member Roster */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t.sec2Title} ({selectedFamily.members?.length || 1})</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left min-w-[480px]">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">{t.fMemberName}</th>
                        <th className="py-2.5 px-3">{t.fAge}</th>
                        <th className="py-2.5 px-3">{t.fRelationship}</th>
                        <th className="py-2.5 px-3">{t.fMaritalStatus}</th>
                        <th className="py-2.5 px-3">{t.fEducation}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedFamily.members && selectedFamily.members.length > 0 ? (
                        selectedFamily.members.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{m.member_name}</td>
                            <td className="py-2.5 px-3">{m.age || '-'}</td>
                            <td className="py-2.5 px-3">{m.relationship}</td>
                            <td className="py-2.5 px-3">{m.marital_status}</td>
                            <td className="py-2.5 px-3">{m.education || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{selectedFamily.head_name}</td>
                          <td className="py-2.5 px-3">-</td>
                          <td className="py-2.5 px-3">Self</td>
                          <td className="py-2.5 px-3">-</td>
                          <td className="py-2.5 px-3">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fEconomicStatus}</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedFamily.economic_status}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fCaste}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.caste || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fShg}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.shg_name || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fIncomeSource}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.income_source || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fMonthlyIncome}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{selectedFamily.monthly_income?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fWomenSkills}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.women_skills || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fFarmLand}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.farm_land || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fWaterSource}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.water_source || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fLivestock}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.livestock || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fTools}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.tools_machines || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fHouseType}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.house_type || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fFuelType}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.fuel_type || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fElectricity}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.electricity ? t.yes : t.no}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fToilet}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.toilet ? t.yes : t.no}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fDisabled}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.has_disabled ? t.yes : t.no}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fSchemes}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.scheme_benefits || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t.fInternet}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFamily.internet_access || '-'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end transition-colors">
              <button
                onClick={() => setSelectedFamily(null)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t.btnClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
