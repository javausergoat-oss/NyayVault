import express from 'express';
import { createCase, listCases, getCaseById } from '../services/caseService.js';
import { uploadDocument, getDocumentsByCase } from '../services/documentService.js';
import { getCaseAuditLogs } from '../services/auditService.js';
import { semanticSearch } from '../services/searchService.js';
import { generateRagResponse } from '../services/aiService.js';
import { uploadSingleEvidence } from '../middleware/uploadMiddleware.js';
import { logAuditEvent } from '../services/auditService.js';
import { requireRole } from '../middleware/roleMiddleware.js';

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
router.post('/:caseId/documents', requireRole(['INVESTIGATOR', 'FORENSICS', 'ADMIN', 'SENIOR_OFFICER']), uploadSingleEvidence, async (req, res, next) => {
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

/**
 * POST /api/cases/:caseId/chat
 * Generates an AI response based on semantic case evidence retrieval (RAG)
 */
router.post('/:caseId/chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Retrieve relevant evidence chunks using the semantic search service
    const relevantChunks = await semanticSearch(req.params.caseId, message, 5);

    // 2. Generate RAG response
    const aiResponse = await generateRagResponse(message, relevantChunks);

    // 3. Log the interaction in the audit trail for accountability
    await logAuditEvent({
      userId: req.user.id,
      caseId: req.params.caseId,
      action: 'AI_RAG_ASSISTANT_QUERY',
      metadata: { query: message }
    });

    res.json({
      success: true,
      response: aiResponse,
      sources: relevantChunks.map(c => ({
        id: c.id,
        document_id: c.document_id,
        filename: c.filename,
        text_snippet: c.text_content.substring(0, 100) + '...'
      }))
    });
  } catch (err) {
    next(err);
  }
});

export default router;
