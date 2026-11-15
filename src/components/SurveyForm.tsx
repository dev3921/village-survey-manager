import React, { useState, useEffect } from 'react';
import type { Family, FamilyFormData, FamilyMember } from '../lib/types';
import { 
  ECONOMIC_STATUS_OPTIONS, 
  HOUSE_TYPE_OPTIONS, 
  YES_NO_OPTIONS, 
  WATER_SOURCE_OPTIONS, 
  FUEL_TYPE_OPTIONS, 
  RELATIONSHIP_OPTIONS, 
  MARITAL_STATUS_OPTIONS, 
  EDUCATION_OPTIONS, 
  INCOME_SOURCE_OPTIONS, 
  CASTE_OPTIONS, 
  LIVESTOCK_OPTIONS, 
  INTERNET_ACCESS_OPTIONS, 
  SCHEME_OPTIONS 
} from '../lib/constants';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Users, 
  Home, 
  Coins, 
  Zap, 
  CheckCircle2,
  FileCheck2
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [serialNo, setSerialNo] = useState<number>(initialData?.serial_no || nextSerialNo);
  const [villageName, setVillageName] = useState<string>(initialData?.village_name || '');
  const [headName, setHeadName] = useState<string>(initialData?.head_name || '');
  const [totalMembers, setTotalMembers] = useState<number>(initialData?.total_members || 1);
  const [economicStatus, setEconomicStatus] = useState<string>(initialData?.economic_status || 'BPL');
  const [caste, setCaste] = useState<string>(initialData?.caste || 'खुला (Open)');
  const [shgName, setShgName] = useState<string>(initialData?.shg_name || '');
  const [incomeSource, setIncomeSource] = useState<string>(initialData?.income_source || 'शेती (Farming)');
  const [womenSkills, setWomenSkills] = useState<string>(initialData?.women_skills || '');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialData?.monthly_income || 0);
  const [farmLand, setFarmLand] = useState<string>(initialData?.farm_land || '');
  const [waterSource, setWaterSource] = useState<string>(initialData?.water_source || 'विहीर');
  const [livestock, setLivestock] = useState<string>(initialData?.livestock || '');
  const [toolsMachines, setToolsMachines] = useState<string>(initialData?.tools_machines || '');
  const [houseType, setHouseType] = useState<string>(initialData?.house_type || 'पक्का');
  const [electricity, setElectricity] = useState<boolean>(initialData?.electricity ?? true);
  const [toilet, setToilet] = useState<boolean>(initialData?.toilet ?? true);
  const [fuelType, setFuelType] = useState<string>(initialData?.fuel_type || 'गॅस');
  const [hasDisabled, setHasDisabled] = useState<boolean>(initialData?.has_disabled ?? false);
  const [schemeBenefits, setSchemeBenefits] = useState<string>(initialData?.scheme_benefits || 'रेशन कार्ड');
  const [internetAccess, setInternetAccess] = useState<string>(initialData?.internet_access || 'स्मार्टफोन');

  // Dynamic Family Members state
  const [members, setMembers] = useState<Omit<FamilyMember, 'id' | 'family_id' | 'created_at'>[]>(() => {
    if (initialData?.members && initialData.members.length > 0) {
      return initialData.members.map((m) => ({
        member_name: m.member_name,
        age: m.age,
        relationship: m.relationship,
        marital_status: m.marital_status,
        education: m.education,
      }));
    }
    // Default initial member: The Head of Family
    return [
      {
        member_name: initialData?.head_name || '',
        age: 45,
        relationship: 'स्वतः (Self)',
        marital_status: 'विवाहित (Married)',
        education: '१० वी',
      },
    ];
  });

  // Keep total_members in sync with members length
  useEffect(() => {
    if (members.length > 0) {
      setTotalMembers(members.length);
    }
  }, [members.length]);

  // Keep member[0] name synced with headName if it was 'स्वतः'
  const handleHeadNameChange = (val: string) => {
    setHeadName(val);
    if (members.length > 0 && (members[0].relationship.includes('स्वतः') || !members[0].member_name)) {
      const updated = [...members];
      updated[0].member_name = val;
      setMembers(updated);
    }
  };

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        member_name: '',
        age: 25,
        relationship: 'पत्नी (Wife)',
        marital_status: 'विवाहित (Married)',
        education: '१० वी',
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
      setError('कृपया कुटुंब प्रमुखाचे नाव प्रविष्ट करा (Please enter Family Head Name)');
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
      setError(err?.message || 'नोंद जतन करताना त्रुटी आली (Failed to save survey)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>मागे जा (Back to List)</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            <span>{initialData ? 'कुटुंब माहिती संपादन' : 'नवीन कुटुंब सर्वेक्षण नोंदणी'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {initialData ? 'Edit Family Survey Information' : 'New Family Household Survey Entry'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            रद्द करा (Cancel)
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'जतन करत आहे...' : 'जतन करा (Save Survey)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* SECTION 1: प्राथमिक माहिती (Primary Details) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            १
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">प्राथमिक माहिती</h3>
            <p className="text-xs text-slate-500">Primary & Village Identification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. अ.क्र */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              अ.क्र <span className="text-slate-400 font-normal">(Sr. No)</span>
            </label>
            <input
              type="number"
              value={serialNo}
              onChange={(e) => setSerialNo(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* गावाची नोंद */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              गावाचे नाव <span className="text-slate-400 font-normal">(Village Name)</span>
            </label>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              placeholder="उदा. कोरेगाव"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 2. कुटुंब प्रमुखाचे नाव */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              कुटुंब प्रमुखाचे नाव <span className="text-emerald-600">*</span>{' '}
              <span className="text-slate-400 font-normal">(Head of Family Name)</span>
            </label>
            <input
              type="text"
              value={headName}
              onChange={(e) => handleHeadNameChange(e.target.value)}
              placeholder="उदा. राजाराम तुकाराम कदम"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              required
            />
          </div>

          {/* 3. एकूण सदस्य */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              एकूण सदस्य <span className="text-slate-400 font-normal">(Total Members)</span>
            </label>
            <input
              type="number"
              min="1"
              value={totalMembers}
              onChange={(e) => setTotalMembers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-semibold"
            />
          </div>

          {/* 9. सामाजिक आर्थिक स्तर APL/BPL */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              सामाजिक आर्थिक स्तर <span className="text-slate-400 font-normal">(Economic Status APL/BPL)</span>
            </label>
            <div className="flex gap-2">
              {ECONOMIC_STATUS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setEconomicStatus(opt)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    economicStatus === opt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: कुटुंब सदस्य तपशील (Dynamic Family Members) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              २
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">कुटुंब सदस्य तपशील</h3>
              <p className="text-xs text-slate-500">Family Members Details (अ.क्र ४ ते ८)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>सदस्य जोडा (Add Member)</span>
          </button>
        </div>

        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  सदस्य #{index + 1}
                </span>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="काढून टाका (Remove Member)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 4. सदस्याचे नाव */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    सदस्याचे नाव <span className="text-slate-400 font-normal">(Member Name)</span>
                  </label>
                  <input
                    type="text"
                    value={member.member_name}
                    onChange={(e) => handleMemberChange(index, 'member_name', e.target.value)}
                    placeholder="उदा. सुनीता कदम"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-medium"
                    required
                  />
                </div>

                {/* 5. वय */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    वय <span className="text-slate-400 font-normal">(Age)</span>
                  </label>
                  <input
                    type="number"
                    value={member.age ?? ''}
                    onChange={(e) => handleMemberChange(index, 'age', e.target.value ? Number(e.target.value) : null)}
                    placeholder="उदा. 42"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* 6. नाते */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    नाते <span className="text-slate-400 font-normal">(Relationship)</span>
                  </label>
                  <select
                    value={member.relationship}
                    onChange={(e) => handleMemberChange(index, 'relationship', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {RELATIONSHIP_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. वैवाहिक स्थिती */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    वैवाहिक स्थिती <span className="text-slate-400 font-normal">(Status)</span>
                  </label>
                  <select
                    value={member.marital_status}
                    onChange={(e) => handleMemberChange(index, 'marital_status', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {MARITAL_STATUS_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. शिक्षण */}
                <div className="sm:col-span-2 lg:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    शिक्षण <span className="text-slate-400 font-normal">(Education)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['अशिक्षित', 'प्राथमिक (१-४)', 'माध्यमिक (५-१०)', '१२ वी (HSC)', 'पदवी (Graduate)', 'इतर'].map((edu) => (
                      <button
                        type="button"
                        key={edu}
                        onClick={() => handleMemberChange(index, 'education', edu)}
                        className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                          member.education === edu
                            ? 'bg-blue-600 text-white border-blue-600 font-medium'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {edu}
                      </button>
                    ))}
                    <input
                      type="text"
                      value={member.education}
                      onChange={(e) => handleMemberChange(index, 'education', e.target.value)}
                      placeholder="किंवा इतर शिक्षण लिहा"
                      className="px-2 py-0.5 border border-slate-200 rounded text-[11px] bg-white flex-1 min-w-[120px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: सामाजिक व आर्थिक स्थिती */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            ३
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">सामाजिक व आर्थिक स्थिती</h3>
            <p className="text-xs text-slate-500">Social, Economic & Livelihood Details (अ.क्र १० ते १४)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 10. जात */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              जात / प्रवर्ग <span className="text-slate-400 font-normal">(Caste / Category)</span>
            </label>
            <select
              value={caste}
              onChange={(e) => setCaste(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {CASTE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 11. स्वयंसहाय्यता गटाचे नाव */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              स्वयंसहाय्यता गटाचे नाव <span className="text-slate-400 font-normal">(SHG Group Name)</span>
            </label>
            <input
              type="text"
              value={shgName}
              onChange={(e) => setShgName(e.target.value)}
              placeholder="उदा. महालक्ष्मी महिला बचत गट"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 12. मुख्य उत्पन्नाचे स्त्रोत */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मुख्य उत्पन्नाचे स्त्रोत <span className="text-slate-400 font-normal">(Main Income Source)</span>
            </label>
            <select
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {INCOME_SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 13. महिलेकडे असलेले कौशल्य/अनुभव */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              महिलेकडे असलेले कौशल्य/अनुभव <span className="text-slate-400 font-normal">(Women's Skills/Experience)</span>
            </label>
            <input
              type="text"
              value={womenSkills}
              onChange={(e) => setWomenSkills(e.target.value)}
              placeholder="उदा. शिलाई काम, दुग्धप्रक्रिया, हस्तकला, ब्युटी पार्लर"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 14. मासिक सरासरी उत्पन्न */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मासिक सरासरी उत्पन्न (₹) <span className="text-slate-400 font-normal">(Monthly Avg Income)</span>
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="उदा. 15000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: शेती, पशुधन व निवारा */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            ४
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">शेती, पशुधन व निवारा</h3>
            <p className="text-xs text-slate-500">Agriculture, Livestock & Housing (अ.क्र १५ ते १९)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 15. शेती जमीन */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              शेती जमीन <span className="text-slate-400 font-normal">(Farm Land)</span>
            </label>
            <input
              type="text"
              value={farmLand}
              onChange={(e) => setFarmLand(e.target.value)}
              placeholder="उदा. 2 एकर (जिरायत / बागायत / नाही)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 16. पाण्याचे स्त्रोत विहीर/तळे/बोर */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              पाण्याचे स्त्रोत <span className="text-slate-400 font-normal">(Water Source)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WATER_SOURCE_OPTIONS.map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWaterSource(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    waterSource === w
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* 17. पशुधन गाय/बकरी/कोंबडी */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पशुधन <span className="text-slate-400 font-normal">(Livestock)</span>
            </label>
            <input
              type="text"
              value={livestock}
              onChange={(e) => setLivestock(e.target.value)}
              placeholder="उदा. 2 गायी, 4 शेळ्या, कोंबड्या"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 18. उपलब्ध साधन/मशीन */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              उपलब्ध साधन/मशीन <span className="text-slate-400 font-normal">(Tools/Machines)</span>
            </label>
            <input
              type="text"
              value={toolsMachines}
              onChange={(e) => setToolsMachines(e.target.value)}
              placeholder="उदा. ट्रॅक्टर, पाण्याचा पंप, स्प्रे पंप"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 19. घराचा प्रकार कच्चा/पक्का */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              घराचा प्रकार <span className="text-slate-400 font-normal">(House Type)</span>
            </label>
            <div className="flex gap-2">
              {HOUSE_TYPE_OPTIONS.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHouseType(h)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    houseType === h
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: पायाभूत सुविधा, आरोग्य व योजना लाभ */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            ५
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">पायाभूत सुविधा व शासकीय योजना</h3>
            <p className="text-xs text-slate-500">Utilities, Disability & Government Benefits (अ.क्र २० ते २५)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 20. वीज होय/नाही */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              वीज सुविधा <span className="text-slate-400 font-normal">(Electricity)</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setElectricity(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  electricity
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                होय (Yes)
              </button>
              <button
                type="button"
                onClick={() => setElectricity(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !electricity
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                नाही (No)
              </button>
            </div>
          </div>

          {/* 21. शौचालय होय/नाही */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              शौचालय सुविधा <span className="text-slate-400 font-normal">(Toilet)</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setToilet(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  toilet
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                होय (Yes)
              </button>
              <button
                type="button"
                onClick={() => setToilet(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !toilet
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                नाही (No)
              </button>
            </div>
          </div>

          {/* 22. इंधन प्रकार */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              इंधन प्रकार <span className="text-slate-400 font-normal">(Fuel Type)</span>
            </label>
            <div className="flex gap-1.5">
              {FUEL_TYPE_OPTIONS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFuelType(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    fuelType === f
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 23. कुटुंबातील सदस्य अपंग आहे का होय/नाही */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              अपंग सदस्य आहे का? <span className="text-slate-400 font-normal">(Disabled Member)</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasDisabled(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  hasDisabled
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                होय (Yes)
              </button>
              <button
                type="button"
                onClick={() => setHasDisabled(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !hasDisabled
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                नाही (No)
              </button>
            </div>
          </div>

          {/* 24. सरासरी योजनेचा लाभ रेशन/पेंशन/ पीकविमा */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              शासकीय योजना लाभ <span className="text-slate-400 font-normal">(Government Schemes Received)</span>
            </label>
            <input
              type="text"
              value={schemeBenefits}
              onChange={(e) => setSchemeBenefits(e.target.value)}
              placeholder="उदा. रेशन कार्ड, संजय गांधी निराधार पेंशन, पीक विमा, पीएम किसान"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 25. इन्टरनेट सुविधा मोबाईल/स्मार्ट फोन */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              इन्टरनेट / मोबाईल सुविधा <span className="text-slate-400 font-normal">(Internet & Phone Facility)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERNET_ACCESS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setInternetAccess(opt)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    internetAccess === opt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-lg flex items-center justify-between gap-4 sticky bottom-4 z-30">
        <div className="text-xs text-slate-500">
          कुटुंब प्रमुख: <span className="font-bold text-slate-800">{headName || 'अद्याप नाव नाही'}</span> ·{' '}
          सदस्य संख्या: <span className="font-bold text-slate-800">{members.length}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            रद्द करा (Cancel)
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'जतन करत आहे...' : 'सर्व्हेक्षण जतन करा (Save)'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
