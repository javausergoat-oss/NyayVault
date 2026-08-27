import express from 'express';
import { createComplaint, getComplaintsByCase, reviewComplaint } from '../services/complaintService.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// POST /api/cases/:caseId/complaints - IO files a complaint
router.post('/cases/:caseId/complaints', requireRole(['INVESTIGATING_OFFICER']), async (req, res, next) => {
  try {
    const { complainantName, fatherName, contact, address, complaintText, complaintDocumentId } = req.body;
    if (!complainantName || !complaintText) {
      return res.status(400).json({ error: 'Complainant name and complaint text are required.' });
    }
    const complaint = await createComplaint({
      caseId: req.params.caseId,
      complainantName, fatherName, contact, address, complaintText, complaintDocumentId,
      createdBy: req.user.id,
      ipAddress: req.ip
    });
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:caseId/complaints - List all complaints for a case
router.get('/cases/:caseId/complaints', async (req, res, next) => {
  try {
    const complaints = await getComplaintsByCase(req.params.caseId);
    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/complaints/:complaintId/review - IO accepts/rejects a complaint
router.patch('/complaints/:complaintId/review', requireRole(['INVESTIGATING_OFFICER']), async (req, res, next) => {
  try {
    const { status, remarks, rejectionReason, firDocumentId } = req.body;
    if (!status || !['FIR_FILED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be FIR_FILED or REJECTED.' });
    }
    if (!remarks) {
      return res.status(400).json({ error: 'Remarks are mandatory.' });
    }
    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is mandatory when rejecting.' });
    }
    const complaint = await reviewComplaint(req.params.complaintId, {
      status, remarks, rejectionReason, firDocumentId,
      reviewedBy: req.user.id,
      ipAddress: req.ip
    });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
});

export default router;
