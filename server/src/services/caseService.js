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
export async function listCases() {
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
    GROUP BY c.id, u.id
    ORDER BY c.created_at DESC;
  `;

  const res = await query(sql);
  return res.rows;
}

/**
 * Retrieves a single case by ID with full details.
 */
export async function getCaseById(caseId) {
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
    WHERE c.id = $1
    GROUP BY c.id, u.id;
  `;

  const res = await query(sql, [caseId]);
  if (res.rows.length === 0) {
    const error = new Error(`Case not found with ID: ${caseId}`);
    error.statusCode = 404;
    throw error;
  }
  return res.rows[0];
}

export default {
  createCase,
  listCases,
  getCaseById,
};
