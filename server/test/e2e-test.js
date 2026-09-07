import crypto from 'crypto';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from '../src/app.js';
import { initDatabase, query } from '../src/config/db.js';
import { initStorage, objectExists } from '../src/storage/s3Client.js';
import { calculateBufferHash } from '../src/utils/hashUtils.js';

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

function logPass(msg) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function logFail(msg, error) {
  console.error(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`);
  if (error) console.error(error);
  process.exitCode = 1;
}

// Helper for multipart/form-data upload using native Node.js fetch
async function uploadFileViaFetch(url, filename, buffer, mimetype = 'application/pdf', headers = {}) {
  const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');
  
  const headerPart = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${mimetype}\r\n\r\n`
  );
  
  const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerPart, buffer, footerPart]);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length.toString(),
      ...headers,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runE2ETests() {
  console.log('\n======================================================');
  console.log(' SIH26190: Phase 1 Automated End-to-End Verification');
  console.log('======================================================\n');

  try {
    // 1. Initialize Subsystems
    await initDatabase();
    await initStorage();

    // Start ephemeral test server
    server = app.listen(PORT);
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`Test server running at http://localhost:${PORT}\n`);

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_number: 'POL-78219', password: 'sih2026' }),
    }).then((r) => r.json());
    if (!loginRes.token) {
      throw new Error(`E2E login failed: ${JSON.stringify(loginRes)}`);
    }
    const authHeaders = { Authorization: `Bearer ${loginRes.token}` };

    // ------------------------------------------------------------------------
    // TEST 1: Health & Readiness API
    // ------------------------------------------------------------------------
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    if (healthRes.status === 'healthy' && healthRes.database?.isInitialized) {
      logPass(`System Health verified. Database Mode: ${healthRes.database.mode}, Storage: ${healthRes.storage.driver}`);
    } else {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 2: Create Investigation Case
    // ------------------------------------------------------------------------
    const caseNum = `FIR-E2E-${Date.now()}`;
    const createCaseRes = await fetch(`${BASE_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        caseNumber: caseNum,
        title: 'Cyber Heist and Digital Forgery E2E Test Case',
        description: 'Automated test case to verify Phase 1 tamper-proofing and storage integrity.',
        securityLevel: 'TOP_SECRET',
      }),
    }).then((r) => r.json());

    if (createCaseRes.success && createCaseRes.case?.id) {
      logPass(`Created case "${caseNum}" with ID: ${createCaseRes.case.id}`);
    } else {
      throw new Error(`Failed to create case: ${JSON.stringify(createCaseRes)}`);
    }

    const testCaseId = createCaseRes.case.id;

    // ------------------------------------------------------------------------
    // TEST 3: Upload Legal Document & Verify Immediate SHA-256 Computation
    // ------------------------------------------------------------------------
    const sampleContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Title (First Information Report - Confidential) >>\nendobj\nEvidence content for legal verification...\n%%EOF'
    );
    const expectedSha256 = calculateBufferHash(sampleContent);

    const uploadRes = await uploadFileViaFetch(
      `${BASE_URL}/cases/${testCaseId}/documents`,
      'FIR_Initial_Statement.pdf',
      sampleContent,
      'application/pdf',
      authHeaders
    );

    if (uploadRes.status === 201 && uploadRes.data?.document?.id) {
      logPass(`Document uploaded successfully: ID = ${uploadRes.data.document.id}`);
    } else {
      throw new Error(`Document upload failed: ${JSON.stringify(uploadRes)}`);
    }

    const docRecord = uploadRes.data.document;

    // ------------------------------------------------------------------------
    // TEST 4: Confirm Document Exists in Object Storage (MinIO / S3 Key Structure)
    // ------------------------------------------------------------------------
    const existsInStorage = await objectExists({ key: docRecord.storage_key });
    if (existsInStorage) {
      logPass(`Object confirmed in storage at key: "${docRecord.storage_key}"`);
    } else {
      throw new Error(`Object not found in storage at: ${docRecord.storage_key}`);
    }

    // ------------------------------------------------------------------------
    // TEST 5: Verify PostgreSQL Document Record Integrity & Checksum
    // ------------------------------------------------------------------------
    const dbDocRes = await query('SELECT * FROM documents WHERE id = $1', [docRecord.id]);
    const dbDoc = dbDocRes.rows[0];

    if (dbDoc && dbDoc.sha256_hash === expectedSha256) {
      logPass(`PostgreSQL record verified. Stored SHA-256 matches computed raw bytes (${expectedSha256})`);
    } else {
      throw new Error(`DB SHA-256 mismatch! DB: ${dbDoc?.sha256_hash}, Expected: ${expectedSha256}`);
    }

    // ------------------------------------------------------------------------
    // TEST 6: Verify Immutable Audit Log / Chain of Custody Record
    // ------------------------------------------------------------------------
    const auditRes = await query(
      'SELECT * FROM audit_logs WHERE document_id = $1 AND action = $2',
      [docRecord.id, 'DOCUMENT_UPLOADED']
    );
    if (auditRes.rows.length > 0) {
      logPass(`Chain-of-custody audit log confirmed: Action = DOCUMENT_UPLOADED, Actor = ${auditRes.rows[0].user_id}`);
    } else {
      throw new Error('Audit log for DOCUMENT_UPLOADED not found in database!');
    }

    // ------------------------------------------------------------------------
    // TEST 7: Live Cryptographic Integrity Verification Endpoint
    // ------------------------------------------------------------------------
    const verifyRes = await fetch(`${BASE_URL}/documents/${docRecord.id}/verify`, { headers: authHeaders }).then((r) =>
      r.json()
    );
    if (verifyRes.success && verifyRes.verification?.isTamperFree === true) {
      logPass(`Live Cryptographic Integrity Verified: Status = ${verifyRes.verification.status}`);
    } else {
      throw new Error(`Integrity verification failed: ${JSON.stringify(verifyRes)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 8: Authorized Download & Exact Byte-for-Byte Check
    // ------------------------------------------------------------------------
    const downloadRes = await fetch(`${BASE_URL}/documents/${docRecord.id}/download`, {
      headers: authHeaders,
    });
    const downloadedBuffer = Buffer.from(await downloadRes.arrayBuffer());
    const downloadedSha256 = calculateBufferHash(downloadedBuffer);

    if (downloadedSha256 === expectedSha256 && Buffer.compare(sampleContent, downloadedBuffer) === 0) {
      logPass(`Authorized download verified. Byte comparison identical (SHA-256: ${downloadedSha256})`);
    } else {
      throw new Error('Downloaded bytes do not match original uploaded file!');
    }

    // ------------------------------------------------------------------------
    // TEST 9: Verify Download Event in Audit Trail
    // ------------------------------------------------------------------------
    const downloadAuditRes = await query(
      'SELECT * FROM audit_logs WHERE document_id = $1 AND action = $2',
      [docRecord.id, 'DOCUMENT_DOWNLOADED']
    );
    if (downloadAuditRes.rows.length > 0) {
      logPass(`Download audit log recorded for Judicial Officer: Action = DOCUMENT_DOWNLOADED`);
    } else {
      throw new Error('Download audit log was not recorded!');
    }

    // ------------------------------------------------------------------------
    // TEST 10: Error Handling: Rejection of Unsupported / Empty Files
    // ------------------------------------------------------------------------
    const emptyBuffer = Buffer.alloc(0);
    const emptyUploadRes = await uploadFileViaFetch(
      `${BASE_URL}/cases/${testCaseId}/documents`,
      'empty.pdf',
      emptyBuffer,
      'application/pdf',
      authHeaders
    );
    if (emptyUploadRes.status === 400) {
      logPass('Error Handling: Empty file correctly rejected with 400 Bad Request.');
    } else {
      throw new Error(`Empty file was not rejected! Status: ${emptyUploadRes.status}`);
    }

    const invalidExtRes = await uploadFileViaFetch(
      `${BASE_URL}/cases/${testCaseId}/documents`,
      'malicious_payload.exe',
      Buffer.from('MZ...executable binary content'),
      'application/x-msdownload',
      authHeaders
    );
    if (invalidExtRes.status === 400) {
      logPass('Error Handling: Unsupported file extension correctly rejected with 400 Bad Request.');
    } else {
      throw new Error(`Invalid extension was not rejected! Status: ${invalidExtRes.status}`);
    }

    // ------------------------------------------------------------------------
    // TEST 11: SHA-256 Merkle Blockchain Hash Chain Verification
    // ------------------------------------------------------------------------
    const verifyChainRes = await fetch(`${BASE_URL}/audit/verify-chain`, { headers: authHeaders }).then((r) => r.json());
    if (verifyChainRes.success && verifyChainRes.chainVerification?.isIntact === true) {
      logPass(`SHA-256 Merkle Chain Verified. Total blocks: ${verifyChainRes.chainVerification.totalBlocks}, Root: ${verifyChainRes.chainVerification.merkleRoot.substring(0, 16)}...`);
    } else {
      throw new Error(`Hash chain verification failed: ${JSON.stringify(verifyChainRes)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 12: PKI RSA-2048 Digital Signature & BSA Sec 63 Certificate
    // ------------------------------------------------------------------------
    const signRes = await fetch(`${BASE_URL}/documents/${docRecord.id}/sign`, {
      method: 'POST',
      headers: authHeaders,
    }).then((r) => r.json());

    if (signRes.success && signRes.signature?.keyFingerprint) {
      logPass(`PKI RSA-2048 Digital Signature attached: Key Fingerprint = ${signRes.signature.keyFingerprint}`);
    } else {
      throw new Error(`PKI signing failed: ${JSON.stringify(signRes)}`);
    }

    const certRes = await fetch(`${BASE_URL}/documents/${docRecord.id}/pki-certificate`, { headers: authHeaders }).then((r) => r.json());
    if (certRes.success && certRes.certificate?.certificateId) {
      logPass(`BSA 2023 Sec 63 Certificate generated: ID = ${certRes.certificate.certificateId}`);
    } else {
      throw new Error(`BSA Certificate generation failed: ${JSON.stringify(certRes)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 13: Live Storage Tamper Simulation (Mutate 1 byte -> TAMPER_DETECTED)
    // ------------------------------------------------------------------------
    const tamperSimRes = await fetch(`${BASE_URL}/dev/tamper/${docRecord.id}`, { method: 'POST' }).then((r) => r.json());
    if (tamperSimRes.success && tamperSimRes.isTampered) {
      logPass('Live Tamper Simulation triggered: 1 byte altered in storage.');
    } else {
      throw new Error(`Tamper simulation failed: ${JSON.stringify(tamperSimRes)}`);
    }

    const postTamperVerifyRes = await fetch(`${BASE_URL}/documents/${docRecord.id}/verify`, { headers: authHeaders }).then((r) => r.json());
    if (postTamperVerifyRes.success && postTamperVerifyRes.verification?.isTamperFree === false) {
      logPass(`Live Tamper Detection confirmed: Status = ${postTamperVerifyRes.verification.status} (TAMPER_DETECTED)`);
    } else {
      throw new Error(`Tamper detection failed! Output: ${JSON.stringify(postTamperVerifyRes)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 14: Storage Restoration (TAMPER_DETECTED -> VERIFIED_AUTHENTIC)
    // ------------------------------------------------------------------------
    const restoreRes = await fetch(`${BASE_URL}/dev/restore/${docRecord.id}`, { method: 'POST' }).then((r) => r.json());
    if (restoreRes.success && !restoreRes.isTampered) {
      logPass('Storage restoration completed.');
    } else {
      throw new Error(`Storage restoration failed: ${JSON.stringify(restoreRes)}`);
    }

    const postRestoreVerifyRes = await fetch(`${BASE_URL}/documents/${docRecord.id}/verify`, { headers: authHeaders }).then((r) => r.json());
    if (postRestoreVerifyRes.success && postRestoreVerifyRes.verification?.isTamperFree === true) {
      logPass(`Post-restoration status confirmed: ${postRestoreVerifyRes.verification.status} (VERIFIED_AUTHENTIC)`);
    } else {
      throw new Error(`Post-restoration verify failed: ${JSON.stringify(postRestoreVerifyRes)}`);
    }

    // ------------------------------------------------------------------------
    // TEST 15: Air-Gapped Local AI Engine Mode Toggle
    // ------------------------------------------------------------------------
    const toggleAiRes = await fetch(`${BASE_URL}/intelligence/ai-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ mode: 'LOCAL_AIRGAPPED' }),
    }).then((r) => r.json());

    if (toggleAiRes.success && toggleAiRes.status?.isAirGapped === true) {
      logPass(`Air-Gapped AI Engine Mode active: ${toggleAiRes.status.activeProvider}`);
    } else {
      throw new Error(`AI Mode toggle failed: ${JSON.stringify(toggleAiRes)}`);
    }

    // Revert AI mode back to cloud
    await fetch(`${BASE_URL}/intelligence/ai-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ mode: 'CLOUD_GEMINI' }),
    });

    console.log('\n======================================================');
    console.log(' ALL 15 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! ');
    console.log('======================================================\n');
  } catch (err) {
    logFail('E2E Test Execution failed with error:', err);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runE2ETests();
