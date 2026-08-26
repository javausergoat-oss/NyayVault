import express from 'express';
import { createCase, listCases, getCaseById } from '../services/caseService.js';
import { uploadDocument, getDocumentsByCase } from '../services/documentService.js';
import { getCaseAuditLogs } from '../services/auditService.js';
import { semanticSearch } from '../services/searchService.js';
import { uploadSingleEvidence } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * GET /api/cases
 * Returns all active investigation cases.
 */
router.get('/', async (req, res, next) => {
  try {
    const cases = await listCases();
    res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cases
 * Creates a new case.
 */
router.post('/', async (req, res, next) => {
  try {
    const { caseNumber, title, description, securityLevel } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const newCase = await createCase({
      caseNumber,
      title,
      description,
      securityLevel,
      createdBy: req.user?.id,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      case: newCase,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cases/:caseId
 * Returns single case details.
 */
router.get('/:caseId', async (req, res, next) => {
  try {
    const caseItem = await getCaseById(req.params.caseId);
    res.json({
      success: true,
      case: caseItem,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cases/:caseId/documents
 * Lists all documents attached to a case.
 */
router.get('/:caseId/documents', async (req, res, next) => {
  try {
    const documents = await getDocumentsByCase(req.params.caseId);
    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cases/:caseId/documents
 * Securely uploads a document, computes SHA-256 hash, stores in MinIO, and creates DB + Audit record.
 */
router.post('/:caseId/documents', uploadSingleEvidence, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please attach a file under key "file".',
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const document = await uploadDocument({
      caseId: req.params.caseId,
      file: req.file,
      user: req.user,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Evidence document uploaded, hashed, and stored successfully.',
      document,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cases/:caseId/audit-trail
 * Retrieves the full chain-of-custody log for a case.
 */
router.get('/:caseId/audit-trail', async (req, res, next) => {
  try {
    const logs = await getCaseAuditLogs(req.params.caseId);
    res.json({
      success: true,
      count: logs.length,
      auditLogs: logs,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cases/:caseId/search
 * Semantic Vector Search across documents in a case.
 */
router.get('/:caseId/search', async (req, res, next) => {
  try {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 5;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required.' });
    }
    
    const results = await semanticSearch(req.params.caseId, query, limit);
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
