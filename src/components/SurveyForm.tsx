import React, { useState, useEffect } from 'react';
import type { Family, FamilyFormData } from '../lib/types';
import {
  getEconomicStatusOptions,
  getCasteOptions,
  getIncomeSourceOptions,
  getWaterSourceOptions,
  getHouseTypeOptions,
  getFuelTypeOptions,
  getInternetAccessOptions,
  getRelationshipOptions,
  getMaritalStatusOptions,
} from '../lib/constants';
import { useLanguage, translations } from '../lib/i18n';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  FileCheck2, 
  Users, 
  AlertCircle,
  MapPin,
  Mic,
  Loader2
} from 'lucide-react';

interface SurveyFormProps {
  initialData?: Family | null;
  onSave: (data: FamilyFormData) => Promise<void>;
  onCancel: () => void;
  nextSerialNo?: number;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  initialData,
  onSave,
  onCancel,
  nextSerialNo = 1,
}) => {
  const [lang] = useLanguage();
  const t = translations[lang];

  const economicOptions = getEconomicStatusOptions();
  const casteOptions = getCasteOptions(lang);
  const incomeOptions = getIncomeSourceOptions(lang);
  const waterOptions = getWaterSourceOptions(lang);
  const houseOptions = getHouseTypeOptions(lang);
  const fuelOptions = getFuelTypeOptions(lang);
  const internetOptions = getInternetAccessOptions(lang);
  const relationshipOptions = getRelationshipOptions(lang);
  const maritalOptions = getMaritalStatusOptions(lang);

  // Form states
  const [serialNo, setSerialNo] = useState<number>(initialData?.serial_no || nextSerialNo);
  const [villageName, setVillageName] = useState(initialData?.village_name || '');
  const [headName, setHeadName] = useState(initialData?.head_name || '');
  const [totalMembers, setTotalMembers] = useState<number>(
    initialData?.total_members || initialData?.members?.length || 1
  );
  const [economicStatus, setEconomicStatus] = useState<string>(
    initialData?.economic_status || economicOptions[0]
  );
  const [caste, setCaste] = useState<string>(initialData?.caste || casteOptions[0]);
  const [shgName, setSHGName] = useState(initialData?.shg_name || '');
  const [incomeSource, setIncomeSource] = useState<string>(
    initialData?.income_source || incomeOptions[0]
  );
  const [womenSkills, setWomenSkills] = useState(initialData?.women_skills || '');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialData?.monthly_income || 0);
  const [farmLand, setFarmLand] = useState(initialData?.farm_land || '');
  const [waterSource, setWaterSource] = useState<string>(
    initialData?.water_source || waterOptions[0]
  );
  const [livestock, setLivestock] = useState(initialData?.livestock || '');
  const [toolsMachines, setToolsMachines] = useState(initialData?.tools_machines || '');
  const [houseType, setHouseType] = useState<string>(
    initialData?.house_type || houseOptions[0]
  );
  const [electricity, setElectricity] = useState<boolean>(initialData?.electricity ?? true);
  const [toilet, setToilet] = useState<boolean>(initialData?.toilet ?? true);
  const [fuelType, setFuelType] = useState<string>(initialData?.fuel_type || fuelOptions[0]);
  const [hasDisabled, setHasDisabled] = useState<boolean>(initialData?.has_disabled ?? false);
  const [schemeBenefits, setSchemeBenefits] = useState(initialData?.scheme_benefits || '');
  const [internetAccess, setInternetAccess] = useState<string>(
    initialData?.internet_access || internetOptions[0]
  );

  // Field Smart Features: GPS Location & Voice Dictation
  const [detectingGps, setDetectingGps] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये GPS उपलब्ध नाही.' : 'Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setVillageName((prev) => (prev ? `${prev} (📍 ${lat}, ${lng})` : `📍 ${lat}, ${lng}`));
        setDetectingGps(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        alert(lang === 'mr' ? 'लोकेशन मिळवता आले नाही. कृपया GPS चालू करा.' : 'Unable to retrieve location. Please allow GPS.');
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleStartVoice = (fieldName: string, onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये व्हॉइस टायपिंग उपलब्ध नाही (Google Chrome वापरा).' : 'Speech recognition not supported in this browser (use Google Chrome).');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setListeningField(fieldName);
      recognition.onstart = () => setListeningField(fieldName);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) onResult(transcript);
        setListeningField(null);
      };
      recognition.onerror = () => setListeningField(null);
      recognition.onend = () => setListeningField(null);
      recognition.start();
    } catch (e) {
      console.warn('Voice error:', e);
      setListeningField(null);
    }
  };

  // Member sub-rows
  const [members, setMembers] = useState<FamilyFormData['members']>(() => {
    if (initialData?.members && initialData.members.length > 0) {
      return initialData.members.map((m) => ({
        member_name: m.member_name,
        age: m.age,
        relationship: m.relationship,
        marital_status: m.marital_status,
        education: m.education || '',
      }));
    }
    return [
      {
        member_name: initialData?.head_name || '',
        age: 35,
        relationship: relationshipOptions[0] || 'Self',
        marital_status: maritalOptions[0] || 'Married',
        education: lang === 'mr' ? '१० वी' : '10th',
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep totalMembers synced with members count
  useEffect(() => {
    setTotalMembers(members.length);
  }, [members.length]);

  const handleHeadNameChange = (val: string) => {
    setHeadName(val);
    if (members.length > 0) {
      const updated = [...members];
      updated[0] = { ...updated[0], member_name: val };
      setMembers(updated);
    }
  };

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        member_name: '',
        age: 25,
        relationship: relationshipOptions[1] || 'Member',
        marital_status: maritalOptions[0] || 'Married',
        education: lang === 'mr' ? '१० वी' : '10th',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) return;
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!headName.trim()) {
      setError(lang === 'mr' ? 'कृपया कुटुंब प्रमुखाचे नाव प्रविष्ट करा' : 'Please enter the Family Head Name');
      return;
    }

    setLoading(true);
    try {
      const payload: FamilyFormData = {
        serial_no: Number(serialNo),
        village_name: villageName.trim(),
        head_name: headName.trim(),
        total_members: Number(totalMembers),
        economic_status: economicStatus,
        caste: caste,
        shg_name: shgName.trim(),
        income_source: incomeSource,
        women_skills: womenSkills.trim(),
        monthly_income: Number(monthlyIncome) || 0,
        farm_land: farmLand.trim(),
        water_source: waterSource,
        livestock: livestock.trim(),
        tools_machines: toolsMachines.trim(),
        house_type: houseType,
        electricity: Boolean(electricity),
        toilet: Boolean(toilet),
        fuel_type: fuelType,
        has_disabled: Boolean(hasDisabled),
        scheme_benefits: schemeBenefits.trim(),
        internet_access: internetAccess,
        members: members.map((m) => ({
          member_name: m.member_name.trim() || headName.trim(),
          age: Number(m.age) || null,
          relationship: m.relationship,
          marital_status: m.marital_status,
          education: m.education,
        })),
      };

      await onSave(payload);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (lang === 'mr' ? 'नोंद जतन करताना त्रुटी आली' : 'Failed to save survey record'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-24 md:pb-16 px-1 sm:px-0">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.btnBack}</span>
          </button>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{initialData ? t.formEditTitle : t.formNewTitle}</span>
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.btnCancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t.btnSaving : t.btnSave}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* SECTION 1: Basic Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 transition-colors">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.sec1Title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.sec1Desc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fSrNo}</label>
            <input
              type="number"
              value={serialNo}
              onChange={(e) => setSerialNo(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.fVillage}</label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingGps}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer disabled:opacity-50"
              >
                {detectingGps ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                <span>{detectingGps ? t.detectingLocation : t.btnDetectLocation}</span>
              </button>
            </div>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              placeholder={t.fVillagePlaceholder}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.fHeadName} <span className="text-emerald-600 dark:text-emerald-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleStartVoice('headName', (val) => handleHeadNameChange(val))}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                  listeningField === 'headName'
                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{listeningField === 'headName' ? t.voiceListening : t.btnVoice}</span>
              </button>
            </div>
            <input
              type="text"
              value={headName}
              onChange={(e) => handleHeadNameChange(e.target.value)}
              placeholder={t.fHeadPlaceholder}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fTotalMembers}</label>
            <input
              type="number"
              min="1"
              value={totalMembers}
              onChange={(e) => setTotalMembers(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fEconomicStatus}</label>
            <div className="flex gap-2">
              {economicOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setEconomicStatus(opt)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    economicStatus === opt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Dynamic Family Members */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.sec2Title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.sec2Desc}</p>
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.btnAddMember}</span>
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-blue-200 dark:hover:border-blue-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {lang === 'mr' ? `सदस्य #${index + 1}` : `Member #${index + 1}`}
                </span>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{t.fMemberName}</label>
                  <input
                    type="text"
                    value={member.member_name}
                    onChange={(e) => handleMemberChange(index, 'member_name', e.target.value)}
                    placeholder={t.fMemberPlaceholder}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{t.fAge}</label>
                  <input
                    type="number"
                    value={member.age ?? ''}
                    onChange={(e) => handleMemberChange(index, 'age', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{t.fRelationship}</label>
                  <select
                    value={member.relationship}
                    onChange={(e) => handleMemberChange(index, 'relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {relationshipOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{t.fMaritalStatus}</label>
                  <select
                    value={member.marital_status}
                    onChange={(e) => handleMemberChange(index, 'marital_status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {maritalOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{t.fEducation}</label>
                  <input
                    type="text"
                    value={member.education}
                    onChange={(e) => handleMemberChange(index, 'education', e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. १० वी / पदवी' : 'e.g. 10th / Graduate'}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Socio-Economic */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 transition-colors">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.sec3Title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.sec3Desc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fCaste}</label>
            <select
              value={caste}
              onChange={(e) => setCaste(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {casteOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fShg}</label>
            <input
              type="text"
              value={shgName}
              onChange={(e) => setSHGName(e.target.value)}
              placeholder={t.fShgPlaceholder}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fIncomeSource}</label>
            <select
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {incomeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.fWomenSkills}</label>
              <button
                type="button"
                onClick={() => handleStartVoice('womenSkills', (val) => setWomenSkills(val))}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                  listeningField === 'womenSkills'
                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{listeningField === 'womenSkills' ? t.voiceListening : t.btnVoice}</span>
              </button>
            </div>
            <input
              type="text"
              value={womenSkills}
              onChange={(e) => setWomenSkills(e.target.value)}
              placeholder={t.fWomenSkillsPlaceholder}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fMonthlyIncome}</label>
            <input
              type="number"
              min="0"
              step="500"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-emerald-700 dark:text-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Land & Housing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 transition-colors">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.sec4Title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.sec4Desc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fFarmLand}</label>
            <input
              type="text"
              value={farmLand}
              onChange={(e) => setFarmLand(e.target.value)}
              placeholder={t.fFarmLandPlaceholder}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fWaterSource}</label>
            <div className="flex flex-wrap gap-1.5">
              {waterOptions.map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWaterSource(w)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    waterSource === w
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fLivestock}</label>
            <input
              type="text"
              value={livestock}
              onChange={(e) => setLivestock(e.target.value)}
              placeholder={t.fLivestockPlaceholder}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fTools}</label>
            <input
              type="text"
              value={toolsMachines}
              onChange={(e) => setToolsMachines(e.target.value)}
              placeholder={t.fToolsPlaceholder}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fHouseType}</label>
            <div className="flex gap-2">
              {houseOptions.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHouseType(h)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    houseType === h
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Utilities & Schemes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 transition-colors">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{t.sec5Title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.sec5Desc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fElectricity}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setElectricity(true)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  electricity ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setElectricity(false)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  !electricity ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fToilet}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setToilet(true)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  toilet ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setToilet(false)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  !toilet ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fFuelType}</label>
            <div className="flex flex-wrap gap-1.5">
              {fuelOptions.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFuelType(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    fuelType === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fDisabled}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasDisabled(true)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  hasDisabled ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setHasDisabled(false)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  !hasDisabled ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.fSchemes}</label>
              <button
                type="button"
                onClick={() => handleStartVoice('schemes', (val) => setSchemeBenefits(val))}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                  listeningField === 'schemes'
                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{listeningField === 'schemes' ? t.voiceListening : t.btnVoice}</span>
              </button>
            </div>
            <input
              type="text"
              value={schemeBenefits}
              onChange={(e) => setSchemeBenefits(e.target.value)}
              placeholder={t.fSchemesPlaceholder}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.fInternet}</label>
            <div className="flex flex-wrap gap-2">
              {internetOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setInternetAccess(opt)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    internetAccess === opt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar (Optimized for Mobile Thumb Tap) */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-3 sticky bottom-3 z-30 transition-colors">
        <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-none">
          <span className="font-bold text-slate-800 dark:text-slate-200">{headName || 'कुटुंब'}</span> ·{' '}
          <span>{members.length} {lang === 'mr' ? 'सदस्य' : 'members'}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.btnCancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t.btnSaving : t.btnSave}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
