import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';
import { initDatabase } from './config/db.js';
import { initStorage } from './storage/s3Client.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('--- Starting SIH26190 Secure Document Management System ---');
    
    // 1. Initialize Database (PostgreSQL or Embedded PGlite fallback)
    await initDatabase();

    // 2. Initialize Object Storage (MinIO or Local S3 emulation fallback)
    await initStorage();

    // 2.5 Start Background Processing Worker
    const { startWorker } = await import('./workers/documentProcessor.js');
    startWorker();

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      console.log(`Backend API Server running securely on http://localhost:${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

startServer();

// triggered restart
