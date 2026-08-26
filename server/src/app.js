import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authenticateUser } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getDbStatus } from './config/db.js';
import { getStorageStatus } from './storage/minioClient.js';

import authRouter from './routes/auth.js';
import casesRouter from './routes/cases.js';
import documentsRouter from './routes/documents.js';
import auditRouter from './routes/audit.js';

const app = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    exposedHeaders: ['X-Evidence-SHA256', 'Content-Disposition'],
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global User context middleware
app.use(authenticateUser);

// System Health & Readiness API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SIH26190 Secure Digital Document Management API',
    version: '1.0.0 (Phase 1)',
    database: getDbStatus(),
    storage: getStorageStatus(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/audit', auditRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
