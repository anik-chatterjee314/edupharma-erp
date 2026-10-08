import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import testRoutes from './routes/test.routes.js';
import documentRoutes from './routes/document.routes.js';
import materialRoutes from './routes/material.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import financeRoutes from './routes/finance.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientUrl, credentials: true }));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many attempts. Please try again later.' } });
app.use('/api/auth', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(config.uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve frontend build in production
const __filename = fileURLToPath(import.meta.url);
const __dirnameSrc = path.dirname(__filename);
const distPath = path.resolve(__dirnameSrc, '..', '..', 'dist');
app.use(express.static(distPath));
// SPA fallback — serve index.html for any non-API, non-file routes
const indexHtml = fs.existsSync(path.join(distPath, 'index.html'))
  ? fs.readFileSync(path.join(distPath, 'index.html'), 'utf8')
  : null;

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  if (indexHtml) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(indexHtml);
  }
  next();
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`\n  🏥 EduPharma ERP Server`);
  console.log(`  ➜ Local:   http://localhost:${config.port}`);
  console.log(`  ➜ API:     http://localhost:${config.port}/api`);
  console.log(`  ➜ Health:  http://localhost:${config.port}/api/health`);
  console.log(`  ➜ Mode:    ${config.nodeEnv}\n`);
});

export default app;

