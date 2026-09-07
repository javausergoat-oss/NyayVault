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

/**
 * GET /api/intelligence/ai-mode
 * Gets current AI Engine mode (CLOUD_GEMINI vs LOCAL_AIRGAPPED).
 */
router.get('/ai-mode', async (req, res, next) => {
  try {
    const { getAiModeStatus } = await import('../services/aiService.js');
    res.json({ success: true, status: getAiModeStatus() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/intelligence/ai-mode
 * Toggles AI Engine mode between CLOUD_GEMINI and LOCAL_AIRGAPPED.
 */
router.post('/ai-mode', async (req, res, next) => {
  try {
    const { mode } = req.body;
    const { setAiMode } = await import('../services/aiService.js');
    const status = setAiMode(mode);
    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
});

export default router;
