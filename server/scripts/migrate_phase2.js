import { initDatabase, query } from '../src/config/db.js';

async function migrate() {
  await initDatabase();
  console.log("Running Phase 2 Migration...");
  
  try {
    await query(`ALTER TABLE documents ADD COLUMN document_type VARCHAR(100) DEFAULT 'UNKNOWN';`);
    console.log("Added document_type");
  } catch (e) { console.log("document_type may already exist", e.message); }
  
  try {
    await query(`ALTER TABLE documents ADD COLUMN classification_confidence NUMERIC(4,3);`);
    console.log("Added classification_confidence");
  } catch (e) { console.log("classification_confidence may already exist", e.message); }
  
  try {
    await query(`ALTER TABLE documents ADD COLUMN extracted_text TEXT;`);
    console.log("Added extracted_text");
  } catch (e) { console.log("extracted_text may already exist", e.message); }
  
  try {
    await query(`ALTER TABLE documents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;`);
    console.log("Added metadata");
  } catch (e) { console.log("metadata may already exist", e.message); }
  
  console.log("Migration complete!");
  process.exit(0);
}

migrate();
