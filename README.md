# Village Survey Manager (ग्राम कुटुंब सर्वेक्षण व्यवस्थापक)

A production-grade, mobile-first web application for conducting, managing, and exporting village household surveys (कुटुंब सर्वेक्षण) with Google Authentication, admin team hierarchy, referral code onboarding, GPS location capture, Marathi voice dictation, and client-side offline storage.

🔗 **Live Production App:** [village-survey-manager.vercel.app](https://village-survey-manager.vercel.app)

---

## Key Features

1. **Official Administrative Login Portal**:
   - Clean institutional portal styling with zero marketing fluff.
   - 1-year persistent cookie session so field surveyors stay logged in across browser restarts and mobile app switches.
   - Field workers enter their Admin's 6-character referral code right on the login screen to automatically join that admin's team.

2. **Admin & Field Worker Team Hierarchy**:
   - **System Owner**: Promotes any user to `admin` directly via SQL (`UPDATE profiles SET role = 'admin' WHERE email = '...';`).
   - **Auto-Team & Code Generation**: When promoted, PostgreSQL triggers automatically generate a team and unique 6-character referral code.
   - **Admin Powers**: Full visibility over all team submissions, surveyor metrics, member editing/deletion, and master data exports.
   - **Field Worker View**: Isolated view restricted to their own submissions.

3. **Multi-Tab Survey Hub**:
   - **All Surveys (सर्व नोंदी)**: Consolidated team view.
   - **My Surveys (माझ्या नोंदी)**: Quick view of surveys submitted by the logged-in user.
   - **Workers' Surveys (कार्यकर्त्यांच्या नोंदी)**: Dedicated supervisor view of field team output.
   - Individual surveyor filter dropdown and surveyor badges on every survey card and row.

4. **Mobile-First Phone Experience**:
   - **Mobile Cards Layout**: Touch-optimized family cards on smartphones instead of wide overflowing tables.
   - **Fixed Bottom Navigation Bar**: 1-thumb switching between Surveys, New Entry, and Team Management.
   - **Floating Action Button (FAB)**: Floating `+ नवीन नोंदणी` button for fast survey creation while walking through villages.

5. **Field Smart Capabilities**:
   - **# Marathi & English Voice Dictation**: Speech-to-text button allowing hands-free voice typing for Marathi descriptions.
   - **# Client-Side Storage Caching**: Caches survey data in local browser storage for instant 0ms loads and offline data access in rural 2G zones.
   - **# Dark / Light Mode Toggle**: Seamless theme switching with persistent user preference.

6. **Exact 25-Column Survey Form (Bilingual Marathi + English)**:
   - Primary labels in Marathi with English subtitles.
   - Quick-select pill buttons for common choices (`APL/BPL`, `होय/नाही`, `कच्चा/पक्का`, `विहीर/बोर/तळे`, `गॅस/लाकूड`, etc.).
   - Dynamic Family Members table (Add/remove members: Name, Age, Relationship, Marital Status, Education).

7. **100% Template-Matching Excel & PDF Export**:
   - Directly mirrors the 25 columns and numbered headers (`1..25`) from official government survey templates (`.xlsx`).
   - Relational multi-row family-to-member layout with numeric currency cells for Excel formulas.
   - Professional PDF summary reports ready for printing.

---

## The 25 Survey Fields

| # | Marathi Field | English Subtitle |
|---|---------------|------------------|
| 1 | अ.क्र | Serial No |
| 2 | कुटुंब प्रमुखाचे नाव | Head of Family Name |
| 3 | एकूण सदस्य | Total Members |
| 4 | सदस्याचे नाव | Member Name |
| 5 | वय | Age |
| 6 | नाते | Relationship |
| 7 | वैवाहिक स्थिती | Marital Status |
| 8 | शिक्षण | Education |
| 9 | सामाजिक आर्थिक स्तर APL/BPL | Economic Status (APL/BPL) |
| 10 | जात | Caste / Category |
| 11 | स्वयंसहाय्यता गटाचे नाव | Self-Help Group (SHG) Name |
| 12 | मुख्य उत्पन्नाचे स्त्रोत | Main Income Source |
| 13 | महिलेकडे असलेले कौशल्य/अनुभव | Women's Skills/Experience |
| 14 | कुटुंब सदस्याचे मासिक सरासरी उत्पन्न | Monthly Average Income (₹) |
| 15 | शेती जमीन | Farm Land |
| 16 | पाण्याचे स्त्रोत विहीर/तळे/बोर | Water Source |
| 17 | पशुधन गाय/बकरी/कोंबडी | Livestock |
| 18 | उपलब्ध साधन/मशीन | Available Tools/Machines |
| 19 | घराचा प्रकार कच्चा/पक्का | House Type |
| 20 | वीज होय/नाही | Electricity (Yes/No) |
| 21 | सौछालय होय/नाही | Toilet (Yes/No) |
| 22 | इंधन प्रकार | Fuel Type |
| 23 | कुटुंबातील सदस्य अपंग आहे का | Disabled Member (Yes/No) |
| 24 | सरासरी योजनेचा लाभ रेशन/पेंशन/ पीकविमा | Government Schemes Received |
| 25 | इन्टरनेट सुविधा मोबाईल/स्मार्ट फोन | Internet & Mobile Facility |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend / Database**: Supabase (PostgreSQL, Row-Level Security, RPC Functions)
- **Authentication**: Google OAuth with PKCE & Cookie Hybrid Storage
- **Export Engines**: SheetJS (`xlsx`) for exact 25-column template export, `jspdf` & `jspdf-autotable`
- **Hosting**: Vercel Production Deployment 
