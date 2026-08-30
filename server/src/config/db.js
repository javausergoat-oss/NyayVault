import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let pgliteInstance = null;
let isEmbeddedMode = false;

/**
 * Initializes the database connection.
 * Attempts to connect to native PostgreSQL first.
 * If PostgreSQL is unavailable, seamlessly falls back to embedded PGlite
 * so development and tests run immediately with zero friction.
 */
export async function initDatabase() {
  const schemaPath = path.resolve(__dirname, '../db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Try PostgreSQL connection
  const connectionString = process.env.DATABASE_URL || 'postgresql://sih_admin:sih_secure_password_2026@localhost:5432/sih26190_evidence_db';
  
  try {
    const testPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
    });

    const client = await testPool.connect();
    console.log('Connected to PostgreSQL database:', connectionString.replace(/:[^:@]+@/, ':****@'));
    
    // Execute schema setup
    await client.query(schemaSql);
    client.release();
    
    pool = testPool;
    isEmbeddedMode = false;
    return;
  } catch (pgError) {
    console.warn(`Native PostgreSQL not reachable (${pgError.message}). Activating embedded PostgreSQL engine (PGlite)...`);
  }

  // Fallback to embedded PGlite engine
  try {
    const dataDir = path.resolve(__dirname, '../../../data/pglite');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    } else {
      // Clean up stale lock files from previous unclean shutdowns
      try {
        const pidFile = path.resolve(dataDir, 'postmaster.pid');
        if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
        const lockFile = path.resolve(dataDir, '.s.PGSQL.5432.lock.out');
        if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
      } catch (e) {
        console.warn('Could not remove stale lock files:', e.message);
      }
    }
    
    try {
      const { vector } = await import('@electric-sql/pglite/vector');
      pgliteInstance = new PGlite({ dataDir, extensions: { vector } });
      await pgliteInstance.query('SELECT 1');
    } catch (extErr) {
      console.warn('PGlite vector extension unavailable, using standard PGlite engine:', extErr.message);
      pgliteInstance = new PGlite({ dataDir });
      await pgliteInstance.query('SELECT 1');
    }
    await pgliteInstance.exec(schemaSql);

    // Auto-apply non-breaking column migrations
    await pgliteInstance.exec(`
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_redacted BOOLEAN DEFAULT FALSE;
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id VARCHAR(64) REFERENCES documents(id);
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_category VARCHAR(50) DEFAULT 'GENERAL';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'INVESTIGATION';
    `);

    isEmbeddedMode = true;
    console.log('Embedded PostgreSQL engine initialized at:', dataDir);
  } catch (embeddedError) {
    console.error('Failed to initialize embedded PostgreSQL engine:', embeddedError);
    throw embeddedError;
  }
}

/**
 * Executes a parameterized SQL query.
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameter values
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
export async function query(text, params = []) {
  if (pool && !isEmbeddedMode) {
    const res = await pool.query(text, params);
    return res;
  }

  if (pgliteInstance) {
    // PGlite expects text and params
    const res = await pgliteInstance.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
    };
  }

  throw new Error('Database is not initialized. Call initDatabase() first.');
}

/**
 * Helper to check DB status
 */
export function getDbStatus() {
  return {
    isInitialized: Boolean(pool || pgliteInstance),
    mode: isEmbeddedMode ? 'Embedded (PGlite)' : 'PostgreSQL (Native)',
  };
}

export default {
  initDatabase,
  query,
  getDbStatus,
};
