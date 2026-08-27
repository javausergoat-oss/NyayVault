-- Schema for SIH26190: Secure Digital Document Management System
-- Database: sih26190_evidence_db

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users Table (Law Enforcement & Judiciary Personnel)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$10$PHXbeifecX92LfHvGsYBPuPZd9KK64fPqWqQ0E1hGVLObljQMx2cW',
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$10$PHXbeifecX92LfHvGsYBPuPZd9KK64fPqWqQ0E1hGVLObljQMx2cW';

-- 2. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    security_level VARCHAR(50) DEFAULT 'RESTRICTED',
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Documents / Evidence Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    status VARCHAR(50) DEFAULT 'uploaded',
    document_type VARCHAR(100) DEFAULT 'UNKNOWN',
    document_category VARCHAR(50) DEFAULT 'GENERAL',
    classification_confidence NUMERIC(4,3),
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_redacted BOOLEAN DEFAULT FALSE,
    parent_document_id VARCHAR(64) REFERENCES documents(id),
    uploaded_by VARCHAR(64) NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 Semantic Search Chunks Table
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    text_content TEXT NOT NULL,
    embedding vector(1536)
);

-- 4. Audit Trail / Chain of Custody Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    case_id VARCHAR(64),
    document_id VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id),
    complainant_name VARCHAR(200) NOT NULL,
    complainant_father_name VARCHAR(200),
    complainant_contact VARCHAR(100),
    complainant_address TEXT,
    complaint_text TEXT NOT NULL,
    complaint_document_id VARCHAR(64) REFERENCES documents(id),
    fir_document_id VARCHAR(64) REFERENCES documents(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    io_remarks TEXT,
    rejection_reason TEXT,
    reviewed_by VARCHAR(64) REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Case & Document Lookups
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON documents(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case_id ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_document_id ON audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_case_id ON document_chunks(case_id);
CREATE INDEX IF NOT EXISTS idx_complaints_case_id ON complaints(case_id);

-- Seed Initial System Actors (Judiciary, Police, Forensics)
INSERT INTO users (id, badge_number, full_name, role, department)
VALUES 
    ('usr-pol-042', 'POL-78219', 'Insp. Rajesh Sharma', 'INVESTIGATING_OFFICER', 'Special Crime Branch'),
    ('usr-for-108', 'FOR-33104', 'Dr. Anita Desai', 'FORENSIC_EXAMINER', 'Central Forensic Science Laboratory'),
    ('usr-jud-007', 'JUD-99201', 'Hon. Magistrate S. Iyer', 'JUDICIAL_OFFICER', 'District & Sessions Court'),
    ('usr-reg-001', 'REG-55001', 'Sh. R.K. Mishra', 'REGISTRAR', 'Faridabad District Court'),
    ('usr-law-001', 'LAW-11001', 'Adv. Priya Kapoor', 'LAWYER_PROSECUTION', 'State Prosecution'),
    ('usr-law-002', 'LAW-22001', 'Adv. Vikram Singh', 'LAWYER_DEFENSE', 'Defense Counsel')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Active Investigation Cases
INSERT INTO cases (id, case_number, title, description, security_level, created_by)
VALUES 
    ('case-c001', 'FIR-2026-DL-0042', 'Faridabad-Court-1-Mr Sharma vs State', 'Cyber extortion and illegal data tampering investigation across financial channels.', 'TOP_SECRET', 'usr-pol-042'),
    ('case-c002', 'FIR-2026-MH-1189', 'Faridabad-Court-2-Cargo Inspection', 'Interception of suspicious cargo documents and customs clearance falsification.', 'RESTRICTED', 'usr-pol-042'),
    ('case-c003', 'FIR-2026-KA-0502', 'Faridabad-Court-3-Registry Forgery', 'Alleged forged registry deeds and contested property deeds presented in civil trial.', 'CONFIDENTIAL', 'usr-for-108')
ON CONFLICT (id) DO NOTHING;
