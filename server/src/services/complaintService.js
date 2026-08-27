import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { logAuditEvent } from './auditService.js';

export async function createComplaint({ caseId, complainantName, fatherName, contact, address, complaintText, complaintDocumentId, createdBy, ipAddress }) {
  const id = `cmp-${uuidv4().substring(0, 10)}`;
  const sql = `
    INSERT INTO complaints (id, case_id, complainant_name, complainant_father_name, complainant_contact, complainant_address, complaint_text, complaint_document_id, status, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)
    RETURNING *;
  `;
  const res = await query(sql, [id, caseId, complainantName, fatherName || null, contact || null, address || null, complaintText, complaintDocumentId || null, createdBy]);
  
  await logAuditEvent({
    userId: createdBy,
    caseId,
    action: 'COMPLAINT_FILED',
    metadata: { complaintId: id, complainantName }
  });
  
  return res.rows[0];
}

export async function getComplaintsByCase(caseId) {
  const sql = `
    SELECT c.*, 
      u1.full_name as created_by_name, u1.badge_number as created_by_badge,
      u2.full_name as reviewed_by_name, u2.badge_number as reviewed_by_badge
    FROM complaints c
    LEFT JOIN users u1 ON c.created_by = u1.id
    LEFT JOIN users u2 ON c.reviewed_by = u2.id
    WHERE c.case_id = $1
    ORDER BY c.created_at DESC;
  `;
  const res = await query(sql, [caseId]);
  return res.rows;
}

export async function reviewComplaint(complaintId, { status, remarks, rejectionReason, firDocumentId, reviewedBy, ipAddress }) {
  const sql = `
    UPDATE complaints 
    SET status = $1, io_remarks = $2, rejection_reason = $3, fir_document_id = $4, reviewed_by = $5, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;
  const res = await query(sql, [status, remarks, rejectionReason || null, firDocumentId || null, reviewedBy, complaintId]);
  
  if (res.rows.length === 0) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }
  
  await logAuditEvent({
    userId: reviewedBy,
    caseId: res.rows[0].case_id,
    action: status === 'FIR_FILED' ? 'COMPLAINT_ACCEPTED_FIR_FILED' : 'COMPLAINT_REJECTED',
    metadata: { complaintId, status, remarks }
  });
  
  return res.rows[0];
}
