import type { Language } from './i18n';

export const getEconomicStatusOptions = () => ['BPL', 'APL'];

export const getHouseTypeOptions = (lang: Language) =>
  lang === 'mr' ? ['पक्का', 'कच्चा', 'अर्ध-पक्का'] : ['Pucca', 'Kutcha', 'Semi-Pucca'];

export const getWaterSourceOptions = (lang: Language) =>
  lang === 'mr'
    ? ['विहीर', 'बोर', 'तळे', 'नळ', 'इतर']
    : ['Well', 'Borewell', 'Pond/Tank', 'Tap Water', 'Other'];

export const getFuelTypeOptions = (lang: Language) =>
  lang === 'mr'
    ? ['गॅस', 'लाकूड', 'शेण', 'इतर']
    : ['LPG Gas', 'Firewood', 'Cow Dung', 'Other'];

export const getRelationshipOptions = (lang: Language) =>
  lang === 'mr'
    ? [
        'स्वतः (Self)',
        'पती (Husband)',
        'पत्नी (Wife)',
        'मुलगा (Son)',
        'मुलगी (Daughter)',
        'आई (Mother)',
        'वडील (Father)',
        'भाऊ (Brother)',
        'बहीण (Sister)',
        'सासू (Mother-in-law)',
        'सासरे (Father-in-law)',
        'सून (Daughter-in-law)',
        'जावई (Son-in-law)',
        'नातू (Grandson)',
        'नात (Granddaughter)',
        'इतर (Other)',
      ]
    : [
        'Self',
        'Husband',
        'Wife',
        'Son',
        'Daughter',
        'Mother',
        'Father',
        'Brother',
        'Sister',
        'Mother-in-law',
        'Father-in-law',
        'Daughter-in-law',
        'Son-in-law',
        'Grandson',
        'Granddaughter',
        'Other',
      ];

export const getMaritalStatusOptions = (lang: Language) =>
  lang === 'mr'
    ? ['विवाहित (Married)', 'अविवाहित (Unmarried)', 'विधवा (Widow)', 'विधुर (Widower)', 'घटस्फोटित (Divorced)', 'इतर (Other)']
    : ['Married', 'Unmarried', 'Widow', 'Widower', 'Divorced', 'Other'];

export const getEducationOptions = (lang: Language) =>
  lang === 'mr'
    ? ['अशिक्षित', 'प्राथमिक (१-४)', 'माध्यमिक (५-१०)', '१२ वी (HSC)', 'पदवी (Graduate)', 'पदव्युत्तर (Post Graduate)', 'इतर']
    : ['Illiterate', 'Primary (1-4)', 'Secondary (5-10)', 'Higher Secondary (12th)', 'Graduate', 'Post Graduate', 'Other'];

export const getIncomeSourceOptions = (lang: Language) =>
  lang === 'mr'
    ? ['शेती (Farming)', 'मजुरी (Daily Wage)', 'नोकरी (Job)', 'व्यवसाय (Business)', 'पशुपालन (Dairy/Livestock)', 'इतर (Other)']
    : ['Farming', 'Daily Wage Labor', 'Salaried Job', 'Business / Trade', 'Dairy / Livestock', 'Other'];

export const getCasteOptions = (lang: Language) =>
  lang === 'mr'
    ? ['खुला (Open)', 'इतर मागासवर्ग (OBC)', 'अनुसूचित जाती (SC)', 'अनुसूचित जमाती (ST)', 'विमुक्त जाती व भटक्या जमाती (VJNT)', 'इतर (Other)']
    : ['General / Open', 'OBC (Other Backward Class)', 'SC (Scheduled Caste)', 'ST (Scheduled Tribe)', 'VJNT', 'Other'];

export const getInternetAccessOptions = (lang: Language) =>
  lang === 'mr'
    ? ['स्मार्टफोन (Smartphone)', 'साधा फोन (Keypad Phone)', 'नाही (None)']
    : ['Smartphone', 'Basic Keypad Phone', 'No Phone / None'];

// Backward compatibility arrays
export const ECONOMIC_STATUS_OPTIONS = ['BPL', 'APL'];
export const HOUSE_TYPE_OPTIONS = ['पक्का', 'कच्चा'];
export const YES_NO_OPTIONS = ['होय', 'नाही'];
export const WATER_SOURCE_OPTIONS = ['विहीर', 'बोर', 'तळे', 'नळ', 'इतर'];
export const FUEL_TYPE_OPTIONS = ['गॅस', 'लाकूड', 'शेण', 'इतर'];
export const RELATIONSHIP_OPTIONS = getRelationshipOptions('mr');
export const MARITAL_STATUS_OPTIONS = getMaritalStatusOptions('mr');
export const EDUCATION_OPTIONS = getEducationOptions('mr');
export const INCOME_SOURCE_OPTIONS = getIncomeSourceOptions('mr');
export const CASTE_OPTIONS = getCasteOptions('mr');
export const LIVESTOCK_OPTIONS = ['गाय', 'म्हैस', 'शेळी/बकरी', 'कोंबडी', 'बैल'];
export const INTERNET_ACCESS_OPTIONS = getInternetAccessOptions('mr');
export const SCHEME_OPTIONS = ['रेशन कार्ड', 'पेंशन', 'पीक विमा', 'आवास योजना'];
