# Village Survey Manager (ग्राम सर्वेक्षण व्यवस्थापक)

A production-ready web application for conducting, managing, and exporting village household surveys (कुटुंब सर्वेक्षण) with Google Authentication, admin team hierarchy, and referral codes.

---

## 🌟 Key Features

1. **Google OAuth & Referral Code Onboarding**:
   - Clean login with Google OAuth.
   - Field workers can enter their Admin's 6-character referral code right on the login screen.
   - After signing in with Google, they are automatically placed into that admin's team.

2. **Admin & Field Worker Team Hierarchy**:
   - **System Owner (You)**: Promotes any user to `admin` directly in the database (`UPDATE profiles SET role = 'admin' WHERE email = '...';`).
   - **Auto-Team Creation**: When an admin is promoted, a team is automatically created with a unique 6-character referral code (e.g., `AB12CD`).
   - **Admin Powers**: The admin sees all surveys submitted by every field worker under them, can edit, delete, view member details, and export all team data.
   - **Field Worker View**: A field worker only sees and manages their own submitted surveys.

3. **Exact 25-Column Survey Form (Bilingual Marathi + English)**:
   - Primary labels in Marathi with English subtitles.
   - Quick-select pill buttons for common choices (`APL/BPL`, `होय/नाही`, `कच्चा/पक्का`, `विहीर/बोर/तळे`, `गॅस/लाकूड`, etc.).
   - Dynamic Family Members table (Add/remove members: Name, Age, Relationship, Marital Status, Education).

4. **100% Template-Matching Excel & PDF Export**:
   - Directly mirrors the 25 columns and numbered headers from your survey template file (`.xlsx`).
   - Relational multi-row family-to-member layout.
   - Professional PDF summary reports ready for printing.

5. **Row-Level Security (RLS)**:
   - Secure PostgreSQL policies ensuring field workers access only their own surveys, while admins access all surveys belonging to their team.

---

## 📋 The 25 Survey Fields

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

## 🗄️ Setting Up Supabase Production

### Step 1: Run SQL Migration
Go to your Supabase project -> **SQL Editor** and execute the entire content of:
`supabase/migrations/001_schema.sql`

### Step 2: Configure Google OAuth
In Supabase Dashboard:
1. Go to **Authentication** -> **Providers** -> **Google**.
2. Toggle Google ON.
3. Enter your Google Client ID and Client Secret (from Google Cloud Console).
4. In **Authentication** -> **URL Configuration**:
   - Set **Site URL** to your app domain (e.g. `http://localhost:5173` or `https://your-app.vercel.app`).
   - Add Redirect URL to Google Cloud Console: `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`.

### Step 3: Configure `.env`
In `village-survey-manager`, create a file named `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Promote an Admin
In Supabase SQL Editor, promote yourself or another user to admin:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```
*(The database trigger will automatically generate a team and unique 6-character referral code for this admin!)*

---

## 🚀 Running Locally

```bash
cd "C:\Users\DEVANAND\OneDrive\Desktop\village-survey-manager"
npm run dev
```

---

## ☁️ Deploying to Vercel

```bash
cd "C:\Users\DEVANAND\OneDrive\Desktop\village-survey-manager"
npx vercel --prod
```
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Environment Variables.
