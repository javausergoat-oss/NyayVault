# SIH26190: Digital Evidence Vault & Management System 🛡️⚖️

[![Live Portal](https://img.shields.io/badge/Official_Portal-nyayvault.in-2563eb?style=for-the-badge&logo=google-chrome&logoColor=white)](https://nyayvault.in)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-v20-green)
![PostgreSQL](https://img.shields.io/badge/Database-PGlite%20%7C%20PostgreSQL-336791)

> **Built for the Smart India Hackathon (Problem Statement SIH26190)**  
> 🌐 **Live Production Portal:** [https://nyayvault.in](https://nyayvault.in) (or [https://www.nyayvault.in](https://www.nyayvault.in))

The **Digital Evidence Vault (NyayVault)** is a secure, military-grade document management system designed to completely digitize the Indian judicial and law enforcement workflow. It replaces vulnerable physical evidence lockers with an immutable, cryptographically secured, AI-powered digital vault.

---

## ✨ Key Features

*   🔐 **Role-Based Access Control (RBAC):** Strict partitioning of evidence. Police (IO), Forensics, Judges, Prosecutors, and Defense Counsel only see documents they are legally authorized to access.
*   ⛓️ **Cryptographic Chain of Custody:** Every upload, download, and redaction is logged immutably. Documents are hashed (SHA-256) upon upload; live verification ensures zero tampering.
*   🧠 **AI-Powered OCR & Classification:** Automatically extracts text from uploaded FIRs, Remand Applications, and Forensics Reports. An integrated LLM classifies the document type (e.g., *FIR*, *Court Order*) and assigns a confidence score.
*   ⬛ **Smart Redaction Engine:** Protect sensitive PII (Aadhar numbers, Bank Accounts, Victim Names) with a single click. Generates a cloned, redacted copy while preserving the original hash.
*   🤖 **Context-Aware Judicial AI:** Judges and IOs can chat directly with an AI assistant that uses RAG (Retrieval-Augmented Generation) to answer questions based *only* on the specific case files.

---

## 🏗️ Architecture & Tech Stack

### Frontend
*   **Framework:** React 18 + Vite
*   **Styling:** Tailwind CSS (Custom Dark UI for extended forensic analysis)
*   **Deployment:** Vercel

### Backend
*   **Runtime:** Node.js + Express
*   **Database:** PostgreSQL (with embedded **PGlite** seamless fallback for local dev)
*   **Storage:** S3-Compatible Object Storage (MinIO)
*   **AI Engine:** OpenRouter API (Gemini 2.5 Flash / Llama 3) for OCR extraction and RAG queries.
*   **Deployment:** AWS EC2 + PM2

---

## 📖 The "State vs. Hardik" Demo Workflow

This system is built to reflect the exact lifecycle of a criminal case in the Indian Judicial System:

1.  **Investigation (`POL-1`):** An Investigating Officer uploads the Victim Complaint, FIR (Sec 318(4) BNS), and Remand Application. Sensitive PII is instantly redacted.
2.  **Forensics (`FOR-1`):** A Cyber Analyst uploads the Bank Tracing & Digital Evidence Report linking the accused to the crime.
3.  **Defense (`ADV-1`):** The Defense Counsel securely uploads a Bail Application.
4.  **Prosecution (`ADV-2`):** The State Prosecutor uploads objections to the bail based on the forensic evidence.
5.  **Registry (`REG-1`):** The Court Registrar issues digital summons to bank witnesses and sets the trial schedule.
6.  **Judiciary (`JUD-1`):** The Presiding Judge reviews all partitioned folders, uses the AI Assistant to cross-examine evidence timelines, and uploads the Final Judgment.

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/sih-evidence-vault.git
cd sih-evidence-vault
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
DATABASE_URL=postgresql://sih_admin:sih_secure_password_2026@localhost:5432/sih26190_evidence_db
AWS_S3_ENDPOINT=http://localhost:9000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadminpassword
AWS_S3_BUCKET_NAME=sih26190-evidence
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_ai_studio_api_key
LLM_MODEL=gemini-3.6-flash
EMBEDDING_MODEL=gemini-embedding-001
```
For Docker Compose, keep the same `GEMINI_API_KEY`, `LLM_MODEL`, and
`EMBEDDING_MODEL` values in `server/.env`; the backend container reads that
ignored file at startup while still using the Compose PostgreSQL and MinIO
service URLs. OpenRouter is also supported with `OPENROUTER_API_KEY`.

Start the backend:
```bash
# Uses PGlite automatically if PostgreSQL is not running!
node src/server.js 
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🛡️ Security Posture
*   **File Isolation:** Files are stored on S3 with random UUID keys, never exposed publicly.
*   **Token Expiry:** JWT tokens expire every 24 hours.
*   **Immutability:** Once an evidence file is uploaded, the database record cannot be overwritten (only appended with redacted clones).

## 📄 License
This project is licensed under the MIT License. Developed for SIH26190.
