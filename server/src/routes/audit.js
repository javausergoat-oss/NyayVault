import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/audit
 * Returns latest system-wide audit activity feed.
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const sql = `
      SELECT 
        a.id,
        a.user_id,
        u.full_name as user_name,
        u.badge_number,
        u.role as user_role,
        u.department,
        a.case_id,
        c.case_number,
        a.document_id,
        d.filename as document_name,
        a.action,
        a.timestamp,
        a.ip_address,
        a.metadata,
        a.previous_hash,
        a.block_hash
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN cases c ON a.case_id = c.id
      LEFT JOIN documents d ON a.document_id = d.id
      ORDER BY a.timestamp DESC
      LIMIT $1;
    `;

    const result = await query(sql, [limit]);
    res.json({
      success: true,
      count: result.rows.length,
      auditLogs: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/audit/verify-chain
 * Performs live cryptographic verification of the SHA-256 Merkle Hash Chain across audit blocks.
 */
router.get('/verify-chain', async (req, res, next) => {
  try {
    const { caseId } = req.query;
    const { verifyAuditChain } = await import('../services/auditService.js');
    const result = await verifyAuditChain(caseId || null);
    res.json({
      success: true,
      chainVerification: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
