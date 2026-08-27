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

export default router;
