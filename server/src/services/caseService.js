import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { logAuditEvent, AuditActions } from './auditService.js';

/**
 * Creates a new case in the system.
 */
export async function createCase({
  caseNumber,
  title,
  description = '',
  securityLevel = 'RESTRICTED',
  createdBy = 'usr-pol-042',
  ipAddress = '127.0.0.1',
}) {
  if (!caseNumber || !title) {
    const error = new Error('Case Number and Title are required.');
    error.statusCode = 400;
    throw error;
  }

  // Check unique case number
  const existing = await query('SELECT id FROM cases WHERE case_number = $1', [caseNumber]);
  if (existing.rows.length > 0) {
    const error = new Error(`Case with number "${caseNumber}" already exists.`);
    error.statusCode = 409;
    throw error;
  }

  const id = `case-${uuidv4().substring(0, 8)}`;
  const now = new Date().toISOString();

  const insertSql = `
    INSERT INTO cases (id, case_number, title, description, security_level, created_by, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, case_number, title, description, security_level, created_by, created_at, updated_at;
  `;

  const res = await query(insertSql, [
    id,
    caseNumber.trim(),
    title.trim(),
    description.trim(),
    securityLevel,
    createdBy,
    now,
    now,
  ]);

  const newCase = res.rows[0];

  // Record Audit Event
  await logAuditEvent({
    userId: createdBy,
    caseId: newCase.id,
    action: AuditActions.CASE_CREATED,
    ipAddress,
    metadata: {
      caseNumber: newCase.case_number,
      title: newCase.title,
      securityLevel: newCase.security_level,
    },
  });

  return newCase;
}

/**
 * Retrieves all active investigation cases with document statistics.
 */
export async function listCases(user = null) {
  let sql = `
    SELECT 
      c.id,
      c.case_number,
      c.title,
      c.description,
      c.security_level,
      c.created_at,
      c.updated_at,
      u.full_name as created_by_name,
      u.badge_number as created_by_badge,
      u.role as created_by_role,
      COUNT(d.id)::int as document_count
    FROM cases c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN documents d ON c.id = d.case_id
  `;
  
  const params = [];
  if (user) {
    if (user.role === 'INVESTIGATING_OFFICER') {
      sql += ` WHERE c.created_by = $1 OR EXISTS (SELECT 1 FROM documents d2 WHERE d2.case_id = c.id AND d2.uploaded_by = $1)`;
      params.push(user.id);
    } else if (['JUDICIAL_OFFICER', 'LAWYER_PROSECUTION', 'LAWYER_DEFENSE'].includes(user.role)) {
      sql += ` WHERE EXISTS (SELECT 1 FROM case_assignments ca WHERE ca.case_id = c.id AND ca.user_id = $1)`;
      params.push(user.id);
    }
  }
  
  sql += ` GROUP BY c.id, u.id ORDER BY c.created_at DESC;`;

  const res = await query(sql, params);
  return res.rows;
}

/**
 * Retrieves a single case by ID with full details.
 */
export async function getCaseById(caseId) {
  if (!caseId) {
    const error = new Error('Case ID is required');
    error.statusCode = 400;
    throw error;
  }
  const idStr = String(caseId).trim();
  const normalizedHyphen = idStr.replace(/_/g, '-');
  const normalizedUnderscore = idStr.replace(/-/g, '_');

  const sql = `
    SELECT 
      c.id,
      c.case_number,
      c.title,
      c.description,
      c.security_level,
      c.created_at,
      c.updated_at,
      u.full_name as created_by_name,
      u.badge_number as created_by_badge,
      u.role as created_by_role,
      COUNT(d.id)::int as document_count
    FROM cases c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN documents d ON c.id = d.case_id
    WHERE c.id = $1 OR c.id = $2 OR c.id = $3 OR LOWER(c.case_number) = LOWER($1)
    GROUP BY c.id, u.id;
  `;

  const res = await query(sql, [idStr, normalizedHyphen, normalizedUnderscore]);
  if (res.rows.length === 0) {
    const error = new Error(`Case not found with ID: ${caseId}`);
    error.statusCode = 404;
    throw error;
  }
  return res.rows[0];
}

export async function updateCaseStatus(caseId, status, user, ipAddress) {
  const caseItem = await getCaseById(caseId);
  const sql = `UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
  const res = await query(sql, [status, caseItem.id]);
  
  if (res.rows.length === 0) {
    throw new Error('Case not found');
  }

  // Log the status change
  await logAuditEvent({
    userId: user?.id,
    caseId: caseItem.id,
    action: 'CASE_STATUS_UPDATED',
    ipAddress,
    metadata: { new_status: status }
  });

  return res.rows[0];
}

export default {
  createCase,
  listCases,
  getCaseById,
  updateCaseStatus
};
