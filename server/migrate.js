import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import path from 'path';
import fs from 'fs';

async function migrate() {
  const db = new PGlite(path.join(process.cwd(), 'data', 'pglite'), { extensions: { vector } });
  await db.waitReady;
  
  try {
    await db.query('ALTER TABLE documents ADD COLUMN is_redacted BOOLEAN DEFAULT FALSE;');
    console.log("Added is_redacted");
  } catch (e) { console.log(e.message); }
  
  try {
    await db.query('ALTER TABLE documents ADD COLUMN parent_document_id UUID REFERENCES documents(id);');
    console.log("Added parent_document_id");
  } catch (e) { console.log(e.message); }

  console.log("Migration complete.");
  process.exit(0);
}
migrate();
