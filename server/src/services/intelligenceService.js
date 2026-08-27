import { query } from '../config/db.js';
import { generateEmbedding } from './aiService.js';
import { logAuditEvent } from './auditService.js';

/**
 * Searches across ALL cases (ignoring normal RBAC boundaries) to find connections.
 * This is restricted to senior roles in the route handler.
 */
export async function crossCaseSearch(searchQuery, userId) {
  // 1. Generate semantic embedding for the query
  const embedding = await generateEmbedding(searchQuery);
  const vectorStr = `[${embedding.join(',')}]`;

  // 2. Perform a vector similarity search across ALL document chunks
  // Join with documents and cases to get context
  const sql = `
    SELECT 
      c.id as case_id,
      c.case_number,
      c.title as case_title,
      d.id as document_id,
      d.filename,
      chk.text_content,
      1 - (chk.embedding <=> $1::vector) as similarity
    FROM document_chunks chk
    JOIN documents d ON chk.document_id = d.id
    JOIN cases c ON chk.case_id = c.id
    WHERE 1 - (chk.embedding <=> $1::vector) > 0.75
    ORDER BY similarity DESC
    LIMIT 20;
  `;
  
  const res = await query(sql, [vectorStr]);

  // Log this highly sensitive cross-case search
  await logAuditEvent({
    userId,
    caseId: null,
    action: 'CROSS_CASE_INTELLIGENCE_SEARCH',
    metadata: { query: searchQuery, resultsFound: res.rows.length }
  });

  // 3. Group the results by case to show connections
  const linkedCases = {};
  for (const row of res.rows) {
    if (!linkedCases[row.case_id]) {
      linkedCases[row.case_id] = {
        case_id: row.case_id,
        case_number: row.case_number,
        case_title: row.case_title,
        evidence_links: []
      };
    }
    linkedCases[row.case_id].evidence_links.push({
      document_id: row.document_id,
      filename: row.filename,
      snippet: row.text_content,
      similarity: row.similarity
    });
  }

  return Object.values(linkedCases);
}
