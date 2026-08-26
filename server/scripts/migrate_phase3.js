import { initDatabase, query } from '../src/config/db.js';

async function migrate() {
  await initDatabase();
  console.log("Running Phase 3 Migration (Vector Search)...");
  
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("Enabled pgvector extension");
  } catch (e) { console.log("Failed to enable pgvector", e.message); }
  
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS document_chunks (
          id VARCHAR(64) PRIMARY KEY,
          document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
          case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
          chunk_index INT NOT NULL,
          text_content TEXT NOT NULL,
          embedding vector(1536)
      );
    `);
    console.log("Created document_chunks table");
  } catch (e) { console.log("Failed to create document_chunks", e.message); }

  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_document_chunks_case_id ON document_chunks(case_id);`);
    console.log("Created index on case_id");
  } catch(e) {}
  
  console.log("Phase 3 Migration complete!");
  process.exit(0);
}

migrate();
