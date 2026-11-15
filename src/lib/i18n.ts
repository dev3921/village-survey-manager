import { useState, useEffect } from 'react';

export type Language = 'mr' | 'en';

const STORAGE_KEY = 'vsm_lang';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'mr';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' ? 'en' : 'mr';
}

export function setStoredLanguage(lang: Language) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new Event('vsm_lang_change'));
}

export function useLanguage(): [Language, (lang: Language) => void] {
  const [lang, setLang] = useState<Language>(getStoredLanguage());

  useEffect(() => {
    const handler = () => setLang(getStoredLanguage());
    window.addEventListener('vsm_lang_change', handler);
    return () => window.removeEventListener('vsm_lang_change', handler);
  }, []);

  const changeLang = (newLang: Language) => {
    setStoredLanguage(newLang);
    setLang(newLang);
  };

  return [lang, changeLang];
}

export const translations = {
  mr: {
    appTitle: 'Village Survey Manager',
    appSubtitle: 'ग्राम कुटुंब सर्वेक्षण व संघ व्यवस्थापन प्रणाली',
    appNameShort: 'ग्राम सर्वेक्षण',

    // Nav
    navSurveys: 'सर्व्हेक्षण यादी',
    navNewSurvey: 'नवीन नोंदणी',
    navTeam: 'संघ व वापरकर्ते',
    referralCode: 'रेफरल कोड',
    roleAdmin: 'ऍडमिन',
    roleWorker: 'सर्व्हेक्षक',
    logout: 'बाहेर पडा',

    // Auth Page
    loginBadge: 'डिजिटल कुटुंब सर्वेक्षण व्यासपीठ',
    loginHeading: 'ग्राम कुटुंब सर्वेक्षण प्रणाली',
    loginDesc: 'गावातील सर्व कुटुंबांचे सामाजिक, आर्थिक, शेती व पायाभूत सुविधांचे सुरक्षित सर्वेक्षण व व्यवस्थापन.',
    referralLabel: 'ऍडमिन रेफरल कोड (ऐच्छिक)',
    referralPlaceholder: 'उदा. AB12CD',
    referralHelp: 'आपल्या ऍडमिनने दिलेला ६-अंकी कोड येथे टाका. आपण थेट त्यांच्या संघात सामील व्हाल. कोड नसल्यास रिक्त ठेवा.',
    signInGoogle: 'Google ने लॉगिन करा',
    loginDisclaimer: 'लॉगिन केल्यानंतर आपले Google खाते आपोआप नोंदणी होईल.',
    feature1Title: '२५ निकषांवर अचूक सर्वेक्षण',
    feature1Desc: 'घरप्रमुखापासून ते सर्व सदस्यांपर्यंत सविस्तर माहिती.',
    feature2Title: 'संघ व रेफरल कोड प्रणाली',
    feature2Desc: 'ऍडमिन आपल्या सर्व कार्यकर्त्यांचे काम एकाच ठिकाणी नियंत्रित करू शकतात.',
    feature3Title: '१-क्लिक Excel व PDF अहवाल',
    feature3Desc: 'शासकीय व संस्थात्मक स्वरूपात तात्काळ डेटा डाऊनलोड करा.',
    needSetup: 'Supabase सेटअप आवश्यक आहे',
    needSetupDesc: '.env मध्ये Supabase credentials जोडणे आवश्यक आहे.',

    // Stats
    statFamilies: 'एकूण कुटुंबे',
    statFamiliesDesc: 'नोंदणी झालेली कुटुंबे',
    statMembers: 'एकूण लोकसंख्या',
    statMembersDesc: 'कुटुंब सदस्य संख्या',
    statEconomic: 'BPL / APL वर्गवारी',
    statEconomicDesc: 'आर्थिक स्तर वितरण',
    statAmenities: 'पायाभूत सुविधा',
    statAmenitiesDesc: 'वीज व शौचालय उपलब्धता',

    // List & Table
    searchPlaceholder: 'नाव, गाव, जात किंवा बचत गटाचे नाव शोधा...',
    filterAllStatus: 'सर्व स्तर (All APL/BPL)',
    filterBPL: 'फक्त BPL',
    filterAPL: 'फक्त APL',
    filterAllHouse: 'सर्व घरे',
    filterPucca: 'पक्के घर',
    filterKutcha: 'कच्चे घर',
    btnExcel: 'Excel डाऊनलोड',
    btnPdf: 'PDF अहवाल',
    btnNew: 'नवीन नोंदणी',
    thSr: 'अ.क्र',
    thHead: 'कुटुंब प्रमुख व गाव',
    thMembers: 'सदस्य',
    thStatus: 'आर्थिक स्तर / जात',
    thIncome: 'मासिक उत्पन्न',
    thHouse: 'घर व सुविधा',
    thDate: 'तारीख',
    thActions: 'क्रिया',
    emptyTitle: 'एकही कुटुंब सर्व्हेक्षण सापडले नाही',
    emptyDesc: 'आपल्या संघात अद्याप कुटुंब नोंदणी झालेली नाही किंवा शोध निकषांशी जुळणारे निकाल नाहीत.',
    emptyBtn: 'पहिली नोंदणी सुरू करा',
    modalDetailsTitle: 'कुटुंब सविस्तर माहिती',
    btnEdit: 'संपादन',
    btnClose: 'बंद करा',
    confirmDelete: 'तुम्हाला खात्री आहे का? हे कुटुंब सर्वेक्षण हटवायचे आहे?',

    // Survey Form
    formNewTitle: 'नवीन कुटुंब सर्वेक्षण नोंदणी',
    formEditTitle: 'कुटुंब माहिती संपादन',
    btnBack: 'मागे जा',
    btnCancel: 'रद्द करा',
    btnSave: 'सर्व्हेक्षण जतन करा',
    btnSaving: 'जतन करत आहे...',

    // Form Section 1
    sec1Title: '१. प्राथमिक माहिती',
    sec1Desc: 'कुटुंब प्रमुख, गाव व सदस्य संख्या',
    fSrNo: 'अ.क्र',
    fVillage: 'गावाचे नाव',
    fVillagePlaceholder: 'उदा. कोरेगाव',
    fHeadName: 'कुटुंब प्रमुखाचे नाव',
    fHeadPlaceholder: 'उदा. राजाराम तुकाराम कदम',
    fTotalMembers: 'एकूण सदस्य संख्या',
    fEconomicStatus: 'सामाजिक आर्थिक स्तर',

    // Form Section 2
    sec2Title: '२. कुटुंब सदस्य तपशील',
    sec2Desc: 'कुटुंबातील प्रत्येक सदस्याची माहिती (अ.क्र ४ ते ८)',
    btnAddMember: 'सदस्य जोडा',
    fMemberName: 'सदस्याचे नाव',
    fMemberPlaceholder: 'उदा. सुनीता कदम',
    fAge: 'वय',
    fRelationship: 'नाते',
    fMaritalStatus: 'वैवाहिक स्थिती',
    fEducation: 'शिक्षण',

    // Form Section 3
    sec3Title: '३. सामाजिक व आर्थिक स्थिती',
    sec3Desc: 'जात, बचत गट, उत्पन्न व कौशल्य (अ.क्र १० ते १४)',
    fCaste: 'जात / प्रवर्ग',
    fShg: 'स्वयंसहाय्यता गटाचे नाव (बचत गट)',
    fShgPlaceholder: 'उदा. महालक्ष्मी महिला बचत गट',
    fIncomeSource: 'मुख्य उत्पन्नाचे स्त्रोत',
    fWomenSkills: 'महिलेकडे असलेले कौशल्य/अनुभव',
    fWomenSkillsPlaceholder: 'उदा. शिलाई काम, दुग्धप्रक्रिया, हस्तकला',
    fMonthlyIncome: 'मासिक सरासरी उत्पन्न (₹)',

    // Form Section 4
    sec4Title: '४. शेती, पशुधन व निवारा',
    sec4Desc: 'जमीन, पाणी, जनावरे व घर प्रकार (अ.क्र १५ ते १९)',
    fFarmLand: 'शेती जमीन',
    fFarmLandPlaceholder: 'उदा. २ एकर (जिरायत / बागायत / नाही)',
    fWaterSource: 'पाण्याचे स्त्रोत',
    fLivestock: 'पशुधन',
    fLivestockPlaceholder: 'उदा. २ गायी, ४ शेळ्या, कोंबड्या',
    fTools: 'उपलब्ध साधन / मशीन',
    fToolsPlaceholder: 'उदा. ट्रॅक्टर, पाण्याचा पंप, स्प्रे पंप',
    fHouseType: 'घराचा प्रकार',

    // Form Section 5
    sec5Title: '५. पायाभूत सुविधा व शासकीय योजना',
    sec5Desc: 'वीज, शौचालय, इंधन, अपंगत्व व योजना लाभ (अ.क्र २० ते २५)',
    fElectricity: 'वीज सुविधा',
    fToilet: 'शौचालय सुविधा',
    fFuelType: 'इंधन प्रकार',
    fDisabled: 'कुटुंबात अपंग सदस्य आहे का?',
    fSchemes: 'शासकीय योजनांचा लाभ',
    fSchemesPlaceholder: 'उदा. रेशन कार्ड, संजय गांधी निराधार, पीक विमा, पीएम किसान',
    fInternet: 'इन्टरनेट व फोन सुविधा',
    yes: 'होय',
    no: 'नाही',

    // Admin Team View
    adminHeroBadge: 'ऍडमिन नियंत्रण केंद्र',
    adminHeroDesc: 'आपल्या सर्व्हेक्षण संघातील सर्व कार्यकर्त्यांचे काम एकाच ठिकाणी नियंत्रित करा.',
    teamReferralCodeLabel: 'आपला संघ रेफरल कोड',
    btnShare: 'शेअर करा',
    btnRegenerate: 'नवीन कोड तयार करा',
    howItWorksTitle: 'कार्यकर्ता कसे जोडावे?',
    step1Title: '१. कोड पाठवा',
    step1Desc: 'वरील रेफरल कोड कार्यकर्त्यांना WhatsApp किंवा SMS ने द्या.',
    step2Title: '२. कार्यकर्ता लॉगिन',
    step2Desc: 'कार्यकर्ता Google लॉगिन करताना हा कोड प्रविष्ट करतात.',
    step3Title: '३. संघात समाविष्ट',
    step3Desc: 'ते आपोआप आपल्या संघात येतील व त्यांचे सर्व सर्व्हेक्षण येथे दिसतील.',
    teamRosterTitle: 'संघातील सदस्य यादी',
    teamRosterSub: 'नोंदणीकृत सर्व्हेक्षक कार्यकर्ते',
    emptyTeam: 'अद्याप कोणीही सामील झालेले नाही. कार्यकर्त्यांना रेफरल कोड शेअर करा.',
    btnRemoveUser: 'संघातून काढा',
    surveysCount: 'सर्व्हेक्षणे',
    youBadge: 'आपण',
  },

  en: {
    appTitle: 'Village Survey Manager',
    appSubtitle: 'Household Survey & Field Team Management System',
    appNameShort: 'Survey Portal',

    // Nav
    navSurveys: 'Surveys List',
    navNewSurvey: 'New Entry',
    navTeam: 'Team & Members',
    referralCode: 'Referral Code',
    roleAdmin: 'Admin',
    roleWorker: 'Field Worker',
    logout: 'Sign Out',

    // Auth Page
    loginBadge: 'Digital Household Survey Platform',
    loginHeading: 'Village Survey Management Portal',
    loginDesc: 'Secure census, socio-economic, agriculture and livelihood survey management for field teams and administrators.',
    referralLabel: 'Admin Referral Code (Optional)',
    referralPlaceholder: 'e.g. AB12CD',
    referralHelp: 'Enter the 6-character code provided by your team admin to automatically join their team. Leave blank if none.',
    signInGoogle: 'Sign in with Google',
    loginDisclaimer: 'Your account will be registered automatically using your Google profile.',
    feature1Title: '25-Point Comprehensive Survey',
    feature1Desc: 'Covers family head, dynamic member roster, and livelihood metrics.',
    feature2Title: 'Team & Referral Code Hierarchy',
    feature2Desc: 'Admins monitor, review, and edit all submissions across field workers.',
    feature3Title: 'Instant Excel & PDF Export',
    feature3Desc: 'Download reports matching the exact official template format.',
    needSetup: 'Supabase Setup Required',
    needSetupDesc: 'Supabase credentials need to be configured in .env',

    // Stats
    statFamilies: 'Total Families',
    statFamiliesDesc: 'Surveyed Households',
    statMembers: 'Total Population',
    statMembersDesc: 'Individual Members',
    statEconomic: 'BPL / APL Ratio',
    statEconomicDesc: 'Economic Classification',
    statAmenities: 'Basic Amenities',
    statAmenitiesDesc: 'Power & Sanitation Access',

    // List & Table
    searchPlaceholder: 'Search by head name, village, caste, or SHG group...',
    filterAllStatus: 'All Statuses (APL/BPL)',
    filterBPL: 'BPL Only',
    filterAPL: 'APL Only',
    filterAllHouse: 'All House Types',
    filterPucca: 'Pucca House',
    filterKutcha: 'Kutcha House',
    btnExcel: 'Export Excel',
    btnPdf: 'PDF Report',
    btnNew: 'New Survey',
    thSr: 'Sr.',
    thHead: 'Head of Family & Village',
    thMembers: 'Members',
    thStatus: 'Status / Category',
    thIncome: 'Monthly Income',
    thHouse: 'Housing & Utilities',
    thDate: 'Date',
    thActions: 'Actions',
    emptyTitle: 'No Household Surveys Found',
    emptyDesc: 'No survey submissions have been recorded in this team yet or no records match your search criteria.',
    emptyBtn: 'Add First Household',
    modalDetailsTitle: 'Family Survey Details',
    btnEdit: 'Edit',
    btnClose: 'Close',
    confirmDelete: 'Are you sure you want to permanently delete this household survey?',

    // Survey Form
    formNewTitle: 'New Household Survey Entry',
    formEditTitle: 'Edit Household Information',
    btnBack: 'Back to List',
    btnCancel: 'Cancel',
    btnSave: 'Save Survey',
    btnSaving: 'Saving...',

    // Form Section 1
    sec1Title: '1. Basic Information',
    sec1Desc: 'Head of family, village name and total count',
    fSrNo: 'Serial No.',
    fVillage: 'Village Name',
    fVillagePlaceholder: 'e.g. Koregaon',
    fHeadName: 'Head of Family Name',
    fHeadPlaceholder: 'e.g. Rajaram Tukaram Kadam',
    fTotalMembers: 'Total Members Count',
    fEconomicStatus: 'Economic Status',

    // Form Section 2
    sec2Title: '2. Family Members Roster',
    sec2Desc: 'Details of each family member (Columns 4 to 8)',
    btnAddMember: 'Add Member',
    fMemberName: 'Member Full Name',
    fMemberPlaceholder: 'e.g. Sunita Kadam',
    fAge: 'Age',
    fRelationship: 'Relationship',
    fMaritalStatus: 'Marital Status',
    fEducation: 'Education',

    // Form Section 3
    sec3Title: '3. Socio-Economic Status',
    sec3Desc: 'Caste, SHG group, income & skills (Columns 10 to 14)',
    fCaste: 'Caste / Category',
    fShg: 'Self-Help Group (SHG) Name',
    fShgPlaceholder: 'e.g. Mahalakshmi Women SHG',
    fIncomeSource: 'Primary Income Source',
    fWomenSkills: 'Skills / Experience of Women',
    fWomenSkillsPlaceholder: 'e.g. Tailoring, Dairy processing, Handicrafts',
    fMonthlyIncome: 'Monthly Average Income (₹)',

    // Form Section 4
    sec4Title: '4. Land, Livestock & Housing',
    sec4Desc: 'Land holding, water, livestock & house type (Columns 15 to 19)',
    fFarmLand: 'Farm Land Holding',
    fFarmLandPlaceholder: 'e.g. 2 Acres (Irrigated / Rainfed / None)',
    fWaterSource: 'Water Source',
    fLivestock: 'Livestock Details',
    fLivestockPlaceholder: 'e.g. 2 Cows, 4 Goats, Poultry',
    fTools: 'Available Equipment / Tools',
    fToolsPlaceholder: 'e.g. Tractor, Water Pump, Sprayer',
    fHouseType: 'House Construction Type',

    // Form Section 5
    sec5Title: '5. Utilities & Welfare Schemes',
    sec5Desc: 'Power, sanitation, fuel, disability & schemes (Columns 20 to 25)',
    fElectricity: 'Electricity Available?',
    fToilet: 'Toilet Available?',
    fFuelType: 'Fuel Type',
    fDisabled: 'Any Person with Disability in Household?',
    fSchemes: 'Government Scheme Benefits Received',
    fSchemesPlaceholder: 'e.g. Ration Card, Social Pension, Crop Insurance, PM Awas',
    fInternet: 'Internet & Mobile Access',
    yes: 'Yes',
    no: 'No',

    // Admin Team View
    adminHeroBadge: 'Admin Control Center',
    adminHeroDesc: 'Manage your field survey team, monitor field workers, and share your team referral code.',
    teamReferralCodeLabel: 'Your Team Referral Code',
    btnShare: 'Share',
    btnRegenerate: 'Generate New Code',
    howItWorksTitle: 'How to Onboard Field Workers',
    step1Title: '1. Share Referral Code',
    step1Desc: 'Send your 6-character referral code to your field workers.',
    step2Title: '2. Worker Signs In',
    step2Desc: 'Workers enter this referral code when signing in with Google.',
    step3Title: '3. Central Supervision',
    step3Desc: 'Their submissions automatically appear in your dashboard.',
    teamRosterTitle: 'Team Members Roster',
    teamRosterSub: 'Registered field workers and supervisors',
    emptyTeam: 'No field workers have joined yet. Share your referral code above to start.',
    btnRemoveUser: 'Remove from Team',
    surveysCount: 'Surveys',
    youBadge: 'You',
  },
};
