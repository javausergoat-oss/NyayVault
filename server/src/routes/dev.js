import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();
router.get('/migrate', async (req, res) => {
  try {
    await query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_redacted BOOLEAN DEFAULT FALSE;');
    await query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id VARCHAR(64) REFERENCES documents(id);');
    res.json({ success: true, message: 'Migration applied!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
export default router;
