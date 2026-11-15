# Village Survey Manager (ग्राम सर्वेक्षण व्यवस्थापक)

A web application designed for field workers and administrative supervisors to conduct, manage, and export village household surveys (कुटुंब सर्वेक्षण).

---

## 🌟 Key Features

1. **Admin & Field Worker Team Hierarchy**:
   - **System Owner**: Promotes users to `admin` in Supabase (`UPDATE profiles SET role = 'admin' WHERE id = '...'`).
   - **Admin Dashboard**: Each admin has a unique 6-character referral code (e.g., `SATARA`).
   - **Referral Code System**: When field workers register and enter the referral code, they are automatically placed into that admin's team.
   - **Central Oversight**: The admin can view all submissions from every field worker under them, view details, edit records, delete records, and export team data.

2. **Exact 25-Column Survey Form (Bilingual Marathi + English)**:
   - Primary labels in Marathi with English subtitles.
   - Quick-select pill buttons for common choices (`APL/BPL`, `होय/नाही`, `कच्चा/पक्का`, `विहीर/बोर/तळे`, `गॅस/लाकूड`, etc.).
   - Dynamic Family Members table (Add/remove members: Name, Age, Relationship, Marital Status, Education).

3. **100% Template-Matching Excel & PDF Export**:
   - The Excel export directly mirrors the 25 columns and numbered headers from your survey template file (`.xlsx`).
   - Generates multi-row family-to-member relational layouts.
   - Professional PDF summary reports ready for printing.

4. **Dual Mode (Instant Demo + Supabase Production)**:
   - Works immediately out of the box with built-in demo data (`localStorage`) so you can test both Admin and Worker roles with one click.
   - Ready for Supabase PostgreSQL with complete Row-Level Security (RLS) migrations.

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

## 🚀 Running Locally

```bash
cd "C:\Users\DEVANAND\OneDrive\Desktop\village-survey-manager"
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

- Click **"⚡ जलद चाचणी लॉगिन -> ऍडमिन (Admin)"** to test the Admin experience with the pre-seeded Satara team.
- Click **"⚡ जलद चाचणी लॉगिन -> कार्यकर्ता (Worker)"** to test the field worker perspective.

---

## 🗄️ Setting Up Supabase Production

1. Create a project in [Supabase](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run the migration file located at:
   `supabase/migrations/001_schema.sql`
3. Copy your project URL and Anon key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Promote an admin user in Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
   ```
5. Deploy to Vercel with `npx vercel --prod`.
