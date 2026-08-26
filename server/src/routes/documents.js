import express from 'express';
import {
  getDocumentById,
  verifyDocumentIntegrity,
  downloadDocument,
} from '../services/documentService.js';
import { getDocumentAuditLogs } from '../services/auditService.js';

const router = express.Router();

/**
 * GET /api/documents/:documentId
 * Returns metadata of a specific document.
 */
router.get('/:documentId', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.documentId);
    res.json({
      success: true,
      document,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents/:documentId/verify
 * Live Cryptographic Integrity Check:
 * Reads raw bytes directly from MinIO, computes fresh SHA-256 hash, and compares with PostgreSQL record.
 */
router.get('/:documentId/verify', async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await verifyDocumentIntegrity(req.params.documentId, req.user, ipAddress);

    res.json({
      success: true,
      verification: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents/:documentId/download
 * Authorized evidence retrieval:
 * Streams file from MinIO object storage, logs chain of custody access.
 */
router.get('/:documentId/download', async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { stream, filename, contentType, contentLength, sha256Hash } =
      await downloadDocument(req.params.documentId, req.user, ipAddress);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('X-Evidence-SHA256', sha256Hash);

    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents/:documentId/audit-trail
 * Returns chain-of-custody audit logs for this specific document.
 */
router.get('/:documentId/audit-trail', async (req, res, next) => {
  try {
    const logs = await getDocumentAuditLogs(req.params.documentId);
    res.json({
      success: true,
      count: logs.length,
      auditLogs: logs,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
