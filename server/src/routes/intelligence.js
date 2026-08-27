import express from 'express';
import { crossCaseSearch } from '../services/intelligenceService.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Only Investigating Officers (or Admins/Senior Officers in a full system) can run cross-case analysis
router.get('/cross-case', requireRole(['INVESTIGATING_OFFICER']), async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    
    const results = await crossCaseSearch(q, req.user.id);
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
});

export default router;
