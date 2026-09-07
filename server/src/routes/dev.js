import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();
router.get('/migrate', async (req, res) => {
  try {
    await query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_redacted BOOLEAN DEFAULT FALSE;');
    await query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id VARCHAR(64) REFERENCES documents(id);');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);');
    await query("ALTER TABLE cases ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'INVESTIGATION';");
    res.json({ success: true, message: 'Migration applied!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
router.post('/user', async (req, res) => {
  try {
    const { id, badge_number, full_name, role, department } = req.body;
    if (!badge_number || !full_name || !role || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const userId = id || `usr-${Date.now()}`;
    await query(
      'INSERT INTO users (id, badge_number, full_name, role, department) VALUES ($1, $2, $3, $4, $5)',
      [userId, badge_number, full_name, role, department]
    );
    res.json({ success: true, message: `User ${badge_number} created successfully!`, userId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/assign', async (req, res) => {
  try {
    const { case_number, badge_number, assigned_role } = req.body;
    
    // Lookup case ID
    const caseRes = await query('SELECT id FROM cases WHERE case_number = $1', [case_number]);
    if (caseRes.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    const caseId = caseRes.rows[0].id;
    
    // Lookup user ID
    const userRes = await query('SELECT id FROM users WHERE badge_number = $1', [badge_number]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userId = userRes.rows[0].id;
    
    await query(
      'INSERT INTO case_assignments (case_id, user_id, assigned_role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [caseId, userId, assigned_role]
    );
    res.json({ success: true, message: `Assigned user ${badge_number} to case ${case_number} successfully!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const tamperBackupMap = new Map();

/**
 * POST /api/dev/tamper/:documentId
 * Live Hackathon Presentation Tool: Intentionally modifies 1 byte in storage blob
 * to demonstrate live red TAMPER_DETECTED warning badge in UI.
 */
router.post('/tamper/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const docRes = await query('SELECT * FROM documents WHERE id = $1', [documentId]);
    if (docRes.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const doc = docRes.rows[0];

    const { getObjectStream, uploadObject } = await import('../storage/s3Client.js');
    const { stream } = await getObjectStream({ key: doc.storage_key });

    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const originalBuffer = Buffer.concat(chunks);

    if (!tamperBackupMap.has(doc.id)) {
      tamperBackupMap.set(doc.id, originalBuffer);
    }

    // Mutate 1 byte
    const tamperedBuffer = Buffer.from(originalBuffer);
    if (tamperedBuffer.length > 0) {
      tamperedBuffer[0] = tamperedBuffer[0] === 65 ? 66 : 65; // flip byte
    }

    await uploadObject({ key: doc.storage_key, buffer: tamperedBuffer, contentType: doc.mime_type });

    res.json({
      success: true,
      documentId: doc.id,
      isTampered: true,
      message: '1 byte altered in storage. Live Cryptographic Check will now flag TAMPER_DETECTED.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/dev/restore/:documentId
 * Restores original un-tampered storage bytes.
 */
router.post('/restore/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const docRes = await query('SELECT * FROM documents WHERE id = $1', [documentId]);
    if (docRes.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const doc = docRes.rows[0];

    if (!tamperBackupMap.has(doc.id)) {
      return res.status(400).json({ error: 'No backup found for this document; it was not tampered with.' });
    }

    const originalBuffer = tamperBackupMap.get(doc.id);
    const { uploadObject } = await import('../storage/s3Client.js');
    await uploadObject({ key: doc.storage_key, buffer: originalBuffer, contentType: doc.mime_type });

    res.json({
      success: true,
      documentId: doc.id,
      isTampered: false,
      message: 'Storage object restored to authentic state. Live Check will now flag VERIFIED_AUTHENTIC.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
