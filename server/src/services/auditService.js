import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export const AuditActions = {
  CASE_CREATED: 'CASE_CREATED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_DOWNLOADED: 'DOCUMENT_DOWNLOADED',
  DOCUMENT_INTEGRITY_VERIFIED: 'DOCUMENT_INTEGRITY_VERIFIED',
  DOCUMENT_INTEGRITY_FAILED: 'DOCUMENT_INTEGRITY_FAILED',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
};

/**
 * Records an immutable chain-of-custody audit log entry.
 * @param {Object} params
 * @param {string} [params.userId] - ID of the user performing the action
 * @param {string} [params.caseId] - Associated Case ID
 * @param {string} [params.documentId] - Associated Document ID
 * @param {string} params.action - Audit action constant
 * @param {string} [params.ipAddress] - Request IP address
 * @param {Object} [params.metadata] - Additional contextual data (hashes, filenames, sizes, reason)
 * @returns {Promise<Object>}
 */
export async function logAuditEvent({
  userId = null,
  caseId = null,
  documentId = null,
  action,
  ipAddress = '127.0.0.1',
  metadata = {},
}) {
  const id = `aud-${uuidv4()}`;
  const timestamp = new Date().toISOString();

  const sql = `
    INSERT INTO audit_logs (id, user_id, case_id, document_id, action, timestamp, ip_address, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, user_id, case_id, document_id, action, timestamp, ip_address, metadata;
  `;

  const params = [
    id,
    userId,
    caseId,
    documentId,
    action,
    timestamp,
    ipAddress,
    JSON.stringify(metadata),
  ];

  try {
    const res = await query(sql, params);
    return res.rows[0];
  } catch (err) {
    console.error('CRITICAL: Failed to write audit log:', err);
    throw err;
  }
}

/**
 * Retrieves full audit trail for a case.
 * @param {string} caseId
 * @returns {Promise<Array>}
 */
export async function getCaseAuditLogs(caseId) {
  if (!caseId) return [];
  const idStr = String(caseId).trim();
  const normalizedHyphen = idStr.replace(/_/g, '-');
  const normalizedUnderscore = idStr.replace(/-/g, '_');

  const sql = `
    SELECT 
      a.id,
      a.user_id,
      u.full_name as user_name,
      u.badge_number,
      u.role as user_role,
      u.department,
      a.case_id,
      a.document_id,
      d.filename as document_name,
      a.action,
      a.timestamp,
      a.ip_address,
      a.metadata
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN documents d ON a.document_id = d.id
    WHERE a.case_id = $1 OR a.case_id = $2 OR a.case_id = $3
    ORDER BY a.timestamp DESC;
  `;

  const res = await query(sql, [idStr, normalizedHyphen, normalizedUnderscore]);
  return res.rows;
}

/**
 * Retrieves audit trail for a specific document.
 * @param {string} documentId
 * @returns {Promise<Array>}
 */
export async function getDocumentAuditLogs(documentId) {
  const sql = `
    SELECT 
      a.id,
      a.user_id,
      u.full_name as user_name,
      u.badge_number,
      u.role as user_role,
      u.department,
      a.case_id,
      a.document_id,
      a.action,
      a.timestamp,
      a.ip_address,
      a.metadata
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.document_id = $1
    ORDER BY a.timestamp DESC;
  `;

  const res = await query(sql, [documentId]);
  return res.rows;
}

export default {
  AuditActions,
  logAuditEvent,
  getCaseAuditLogs,
  getDocumentAuditLogs,
};
