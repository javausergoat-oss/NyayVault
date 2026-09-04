import { query, initDatabase } from '../config/db.js';

const documents = [
  { id: 'doc-6094a442-9', name: '01_Initial_Complaint.png', key: 'cases/case-56fd49f6/documents/doc-6094a442-9/01_Initial_Complaint.png', type: 'image/png', size: 1048576, hash: 'a1b2c3d4e5f6', by: 'usr-pol-001', cat: 'INVESTIGATION', date: '2026-08-26' },
  { id: 'doc-da88e5e4-3', name: '02_FIR_Copy.png', key: 'cases/case-56fd49f6/documents/doc-da88e5e4-3/02_FIR_Copy.png', type: 'image/png', size: 2048576, hash: 'b1c2d3e4f5a6', by: 'usr-pol-001', cat: 'INVESTIGATION', date: '2026-08-27' },
  { id: 'doc-f7ad7f8b-f', name: '03_Arrest_Memo.png', key: 'cases/case-56fd49f6/documents/doc-f7ad7f8b-f/03_Arrest_Memo.png', type: 'image/png', size: 1548576, hash: 'c1d2e3f4a5b6', by: 'usr-pol-001', cat: 'INVESTIGATION', date: '2026-08-28' },
  { id: 'doc-d018b47c-d', name: '04_Remand_Application.png', key: 'cases/case-56fd49f6/documents/doc-d018b47c-d/04_Remand_Application.png', type: 'image/png', size: 1248576, hash: 'd1e2f3a4b5c6', by: 'usr-pol-001', cat: 'INVESTIGATION', date: '2026-08-28' },
  { id: 'doc-561ad143-5', name: '05_Cyber_Forensics_Report.png', key: 'cases/case-56fd49f6/documents/doc-561ad143-5/05_Cyber_Forensics_Report.png', type: 'image/png', size: 3048576, hash: 'e1f2a3b4c5d6', by: 'usr-pol-001', cat: 'INVESTIGATION', date: '2026-08-29' },
  { id: 'doc-a8aea168-9', name: '06_Defense_Bail_Application_Hardik.png', key: 'cases/case-56fd49f6/documents/doc-a8aea168-9/06_Defense_Bail_Application_Hardik.png', type: 'image/png', size: 1148576, hash: 'f1a2b3c4d5e6', by: 'usr-1787866191848', cat: 'DEFENSE', date: '2026-08-31' },
  { id: 'doc-eb3f3aa4-d', name: '07_Prosecution_Bail_Objection.png', key: 'cases/case-56fd49f6/documents/doc-eb3f3aa4-d/07_Prosecution_Bail_Objection.png', type: 'image/png', size: 1448576, hash: 'a2b3c4d5e6f1', by: 'usr-1787866298750', cat: 'PROSECUTION', date: '2026-09-01' },
  { id: 'doc-ff1f22e4-2', name: '08_Final_Charge_Sheet_Sec173.png', key: 'cases/case-56fd49f6/documents/doc-ff1f22e4-2/08_Final_Charge_Sheet_Sec173.png', type: 'image/png', size: 4048576, hash: 'b2c3d4e5f6a1', by: 'usr-pol-001', cat: 'INVESTIGATION', date: '2026-09-05' },
  { id: 'doc-dabc0e25-9', name: '09_Court_Summons_Bank_Manager.png', key: 'cases/case-56fd49f6/documents/doc-dabc0e25-9/09_Court_Summons_Bank_Manager.png', type: 'image/png', size: 948576, hash: 'c2d3e4f5a6b1', by: 'usr-1787866796708', cat: 'REGISTRAR', date: '2026-09-10' },
  { id: 'doc-6fb9a753-2', name: '10_Official_Trial_Schedule.png', key: 'cases/case-56fd49f6/documents/doc-6fb9a753-2/10_Official_Trial_Schedule.png', type: 'image/png', size: 848576, hash: 'd2e3f4a5b6c1', by: 'usr-1787866796708', cat: 'REGISTRAR', date: '2026-09-15' },
  { id: 'doc-f95bcc8f-0', name: '11_Final_Court_Judgment.png', key: 'cases/case-56fd49f6/documents/doc-f95bcc8f-0/11_Final_Court_Judgment.png', type: 'image/png', size: 2548576, hash: 'e2f3a4b5c6d1', by: 'usr-jud-001', cat: 'JUDICIAL', date: '2026-12-15' }
];

async function seed() {
  await initDatabase();
  console.log('Seeding documents for CASE-1...');
  
  for (const doc of documents) {
    await query(`
      INSERT INTO documents (id, case_id, filename, storage_key, mime_type, file_size, sha256_hash, uploaded_by, document_category, status, uploaded_at)
      VALUES ($1, 'case-56fd49f6', $2, $3, $4, $5, $6, $7, $8, 'uploaded', $9)
      ON CONFLICT (id) DO NOTHING;
    `, [doc.id, doc.name, doc.key, doc.type, doc.size, doc.hash, doc.by, doc.cat, doc.date]);
  }
  
  console.log('✅ Documents seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
