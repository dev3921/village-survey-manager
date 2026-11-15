import React, { useState, useMemo } from 'react';
import type { Family, Profile } from '../lib/types';
import { exportFamiliesToExcel, exportFamiliesToPDF } from '../lib/export';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Users, 
  Building2, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  XCircle,
  X,
  FileSpreadsheet,
  AlertCircle
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [houseFilter, setHouseFilter] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  // Metrics computation
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
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        f.head_name.toLowerCase().includes(q) ||
        (f.village_name && f.village_name.toLowerCase().includes(q)) ||
        (f.caste && f.caste.toLowerCase().includes(q)) ||
        (f.shg_name && f.shg_name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || f.economic_status === statusFilter;
      const matchesHouse = houseFilter === 'all' || f.house_type === houseFilter;

      return matchesSearch && matchesStatus && matchesHouse;
    });
  }, [families, searchTerm, statusFilter, houseFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${name}" यांचे कुटुंब सर्वेक्षण हटवायचे आहे?`)) {
      setDeletingId(id);
      try {
        await onDeleteSurvey(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Families */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              एकूण कुटुंबे (Families)
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalFamilies}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">नोंदणी झालेली कुटुंबे</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              एकूण लोकसंख्या (Members)
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalMembers}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">कुटुंब सदस्य</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* BPL / APL Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              BPL / APL स्तर
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-600">{metrics.bplCount} BPL</span>
              <span className="text-xs text-slate-400 font-medium">/ {metrics.aplCount} APL</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">आर्थिक वर्गवारी</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Basic Amenities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              पायाभूत सुविधा
            </p>
            <div className="flex items-center gap-3 mt-1 text-sm font-bold text-slate-800">
              <span>⚡ वीज: {metrics.electricityCount}</span>
              <span>🚽 शौचालय: {metrics.toiletCount}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">उपलब्ध सुविधा संख्या</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar (Search, Filters, Exports, New Survey) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाव, गाव, जात किंवा बचत गटाचे नाव शोधा... (Search surveys)"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Filters & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">सर्व स्तर (All APL/BPL)</option>
            <option value="BPL">फक्त BPL</option>
            <option value="APL">फक्त APL</option>
          </select>

          {/* House filter */}
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">सर्व घरे (All Houses)</option>
            <option value="पक्का">पक्के घर (Pucca)</option>
            <option value="कच्चा">कच्चे घर (Kutcha)</option>
          </select>

          {/* Export Excel (Matches uploaded template) */}
          <button
            onClick={() => exportFamiliesToExcel(filteredFamilies)}
            title="Export exact 25-column format to Excel"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel डाऊनलोड</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={() => exportFamiliesToPDF(filteredFamilies)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>PDF अहवाल</span>
          </button>

          {/* New Survey Button */}
          <button
            onClick={onNewSurvey}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन नोंदणी</span>
          </button>
        </div>
      </div>

      {/* Main Surveys Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredFamilies.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">एकही कुटुंब सर्व्हेक्षण सापडले नाही</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'शोध निकषांशी जुळणारे निकाल उपलब्ध नाहीत. कृपया शोध बदलून पहा.'
                : 'आपल्या संघात अद्याप कुटुंब नोंदणी झालेली नाही. पहिली नोंदणी सुरू करा.'}
            </p>
            <button
              onClick={onNewSurvey}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>पहिली नोंदणी करा (Add Survey)</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">अ.क्र</th>
                  <th className="py-3.5 px-4">कुटुंब प्रमुख (Head) व गाव</th>
                  <th className="py-3.5 px-4 text-center">सदस्य (Members)</th>
                  <th className="py-3.5 px-4">आर्थिक स्तर / जात</th>
                  <th className="py-3.5 px-4">उत्पन्न व स्त्रोत</th>
                  <th className="py-3.5 px-4">घर व सुविधा</th>
                  <th className="py-3.5 px-4">तारीख</th>
                  <th className="py-3.5 px-4 text-right">क्रिया (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFamilies.map((fam, idx) => (
                  <tr key={fam.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Serial No */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                      {fam.serial_no || idx + 1}
                    </td>

                    {/* Head Name & Village */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{fam.head_name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-medium text-emerald-700">📍 {fam.village_name || 'गाव अनिर्दिष्ट'}</span>
                        {fam.shg_name && (
                          <span className="text-slate-400">· {fam.shg_name}</span>
                        )}
                      </div>
                    </td>

                    {/* Members Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
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
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {fam.economic_status || 'BPL'}
                        </span>
                        <span className="text-[11px] text-slate-600 truncate max-w-[120px]">{fam.caste}</span>
                      </div>
                    </td>

                    {/* Income */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-700">
                        {fam.monthly_income ? `₹${fam.monthly_income.toLocaleString('en-IN')}/महिना` : '-'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                        {fam.income_source || '-'}
                      </div>
                    </td>

                    {/* House & Amenities */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">
                        {fam.house_type ? `${fam.house_type} घर` : '-'}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className={fam.electricity ? 'text-emerald-700' : 'text-slate-400'}>
                          ⚡ {fam.electricity ? 'वीज' : 'नाही'}
                        </span>
                        <span className={fam.toilet ? 'text-teal-700' : 'text-slate-400'}>
                          🚽 {fam.toilet ? 'शौचालय' : 'नाही'}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(fam.created_at).toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedFamily(fam)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="सविस्तर पहा (View Details)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditSurvey(fam)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="माहिती संपादन करा (Edit Survey)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          disabled={deletingId === fam.id}
                          onClick={() => handleDelete(fam.id, fam.head_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="हटवा (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL (Displays all 25 fields for the chosen family) */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-5 border-b border-slate-200 flex items-center justify-between z-10">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  अ.क्र #{selectedFamily.serial_no || 1}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedFamily.head_name}</h3>
                <p className="text-xs text-slate-500">गाव: {selectedFamily.village_name || 'अनिर्दिष्ट'}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const fam = selectedFamily;
                    setSelectedFamily(null);
                    onEditSurvey(fam);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>संपादन</span>
                </button>
                <button
                  onClick={() => setSelectedFamily(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with All 25 Columns */}
            <div className="p-6 space-y-6 text-xs">
              {/* Member Roster */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>कुटुंब सदस्य यादी ({selectedFamily.members?.length || 1} सदस्य)</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2 px-3">सदस्याचे नाव</th>
                        <th className="py-2 px-3">वय</th>
                        <th className="py-2 px-3">नाते</th>
                        <th className="py-2 px-3">वैवाहिक स्थिती</th>
                        <th className="py-2 px-3">शिक्षण</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedFamily.members && selectedFamily.members.length > 0 ? (
                        selectedFamily.members.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-900">{m.member_name}</td>
                            <td className="py-2 px-3">{m.age || '-'}</td>
                            <td className="py-2 px-3">{m.relationship}</td>
                            <td className="py-2 px-3">{m.marital_status}</td>
                            <td className="py-2 px-3">{m.education || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-900">{selectedFamily.head_name}</td>
                          <td className="py-2 px-3">-</td>
                          <td className="py-2 px-3">स्वतः</td>
                          <td className="py-2 px-3">-</td>
                          <td className="py-2 px-3">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">सामाजिक आर्थिक स्तर</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedFamily.economic_status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">जात / प्रवर्ग</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.caste || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">बचत गट (SHG)</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.shg_name || 'नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">मुख्य उत्पन्न स्त्रोत</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.income_source}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">मासिक सरासरी उत्पन्न</span>
                  <span className="font-bold text-emerald-700">₹{selectedFamily.monthly_income?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">महिलेचे कौशल्य</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.women_skills || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">शेती जमीन</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.farm_land || 'नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">पाण्याचे स्त्रोत</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.water_source || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">पशुधन</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.livestock || 'नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">साधन / मशीन</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.tools_machines || 'नाही'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">घराचा प्रकार</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.house_type || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">इंधन प्रकार</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.fuel_type || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">वीज सुविधा</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.electricity ? 'होय (Yes)' : 'नाही (No)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">शौचालय सुविधा</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.toilet ? 'होय (Yes)' : 'नाही (No)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">अपंग सदस्य</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.has_disabled ? 'होय (Yes)' : 'नाही (No)'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">योजना लाभ</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.scheme_benefits || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">इंटरनेट सुविधा</span>
                  <span className="font-semibold text-slate-800">{selectedFamily.internet_access || '-'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedFamily(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
