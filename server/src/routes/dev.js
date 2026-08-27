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

export default router;
