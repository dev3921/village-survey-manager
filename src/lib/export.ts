import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Family } from './types';

// The exact 25 headers matching the uploaded Excel template
export const EXCEL_HEADERS = [
  'अ.क्र,',
  'कुटुंब प्रमुखाचे नाव',
  'एकूण सदस्य',
  'सदस्याचे नाव',
  'वय',
  'नाते',
  'वैवाहिक स्थिती ',
  'शिक्षण ',
  'सामाजिक आर्थिक स्तर APL/BPL ',
  'जात ',
  'स्वयंसहाय्यता गटाचे नाव',
  'मुख्य उत्पन्नाचे स्त्रोत',
  'महिलेकडे असलेले कौशल्य/अनुभव',
  'कुटुंब सदस्याचे मासिक सरासरी उत्पन्न ',
  'शेती जमीन ',
  'पाण्याचे स्त्रोत विहीर/तळे/बोर',
  'पशुधन गाय/बकरी/कोंबडी',
  'उपलब्ध साधन/मशीन',
  'घराचा प्रकार कच्चा/पक्का',
  'वीज होय/नाही',
  'सौछालय होय/नाही',
  'इंधन प्रकार',
  'कुटुंबातील सदस्य अपंग आहे का होय/नाही',
  'सरासरी योजनेचा लाभ रेशन/पेंशन/ पीकविमा',
  'इन्टरनेट सुविधा मोबाईल/स्मार्ट फोन',
];

export function exportFamiliesToExcel(families: Family[], filename = 'village_survey_data.xlsx') {
  // Numbered header row: 1 to 25
  const numberedRow = Array.from({ length: 25 }, (_, i) => i + 1);

  const dataRows: (string | number)[][] = [
    numberedRow,
    EXCEL_HEADERS,
  ];

  let currentSerial = 1;

  families.forEach((fam) => {
    const serial = fam.serial_no || currentSerial++;
    const members = fam.members && fam.members.length > 0 ? fam.members : [null];

    members.forEach((mem) => {
      const row: (string | number)[] = [
        serial,
        fam.head_name || '',
        fam.total_members || members.length,
        mem ? mem.member_name : (fam.head_name || ''),
        mem && mem.age !== null ? mem.age : '',
        mem ? mem.relationship : 'स्वतः',
        mem ? mem.marital_status : '',
        mem ? mem.education : '',
        fam.economic_status || '',
        fam.caste || '',
        fam.shg_name || '',
        fam.income_source || '',
        fam.women_skills || '',
        fam.monthly_income !== null && fam.monthly_income !== undefined ? fam.monthly_income : '',
        fam.farm_land || '',
        fam.water_source || '',
        fam.livestock || '',
        fam.tools_machines || '',
        fam.house_type || '',
        fam.electricity ? 'होय' : 'नाही',
        fam.toilet ? 'होय' : 'नाही',
        fam.fuel_type || '',
        fam.has_disabled ? 'होय' : 'नाही',
        fam.scheme_benefits || '',
        fam.internet_access || '',
      ];

      dataRows.push(row);
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);

  // Column width configuration for readable layout
  worksheet['!cols'] = [
    { wch: 6 },  // अ.क्र
    { wch: 22 }, // कुटुंब प्रमुखाचे नाव
    { wch: 10 }, // एकूण सदस्य
    { wch: 20 }, // सदस्याचे नाव
    { wch: 6 },  // वय
    { wch: 14 }, // नाते
    { wch: 16 }, // वैवाहिक स्थिती
    { wch: 16 }, // शिक्षण
    { wch: 12 }, // APL/BPL
    { wch: 16 }, // जात
    { wch: 22 }, // SHG
    { wch: 22 }, // उत्पन्नाचे स्त्रोत
    { wch: 22 }, // महिलेचे कौशल्य
    { wch: 14 }, // उत्पन्न
    { wch: 14 }, // शेती जमीन
    { wch: 16 }, // पाणी
    { wch: 16 }, // पशुधन
    { wch: 16 }, // साधन/मशीन
    { wch: 12 }, // घराचा प्रकार
    { wch: 10 }, // वीज
    { wch: 10 }, // शौचालय
    { wch: 12 }, // इंधन
    { wch: 12 }, // अपंग
    { wch: 22 }, // योजना लाभ
    { wch: 18 }, // इंटरनेट
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'कुटुंब सर्वेक्षण');
  XLSX.writeFile(workbook, filename);
}

export function exportFamiliesToPDF(families: Family[], title = 'ग्राम कुटुंब सर्वेक्षण अहवाल (Village Family Survey Report)') {
  const doc = new jsPDF('landscape', 'pt', 'a4');

  doc.setFontSize(16);
  doc.text(title, 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`एकूण कुटुंबे (Total Families): ${families.length} | दिनांक (Date): ${new Date().toLocaleDateString('mr-IN')}`, 40, 60);

  const tableHead = [
    ['अ.क्र', 'कुटुंब प्रमुख (Head Name)', 'गाव (Village)', 'सदस्य (Members)', 'APL/BPL', 'उत्पन्न (Income)', 'घर (House)', 'वीज (Power)', 'शौचालय (Toilet)', 'योजना लाभ (Schemes)']
  ];

  const tableBody = families.map((fam, idx) => [
    fam.serial_no || idx + 1,
    fam.head_name,
    fam.village_name || '-',
    fam.total_members,
    fam.economic_status || '-',
    fam.monthly_income ? `Rs. ${fam.monthly_income}` : '-',
    fam.house_type || '-',
    fam.electricity ? 'होय (Yes)' : 'नाही (No)',
    fam.toilet ? 'होय (Yes)' : 'नाही (No)',
    fam.scheme_benefits || '-'
  ]);

  autoTable(doc, {
    startY: 75,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 70, left: 40, right: 40 },
  });

  doc.save('village_survey_report.pdf');
}
