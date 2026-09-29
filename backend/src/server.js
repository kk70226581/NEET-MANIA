require('dotenv').config();

// Ensure robust Admin defaults on Render if missing or misconfigured
const VALID_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
if (!process.env.ADMIN_EMAIL || !VALID_EMAIL_PATTERN.test(String(process.env.ADMIN_EMAIL).trim())) {
  process.env.ADMIN_EMAIL = 'admin@gmail.com';
}
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'change_me_in_production') {
  process.env.ADMIN_PASSWORD = '12345678';
}

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { getGeminiModel } = require('./services/geminiClient');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Middleware
const configuredFrontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = new Set([
  'https://medicalmania.site',
  'https://www.medicalmania.site',
  'https://neet-mania.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredFrontendOrigins
]);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include health checks and server-to-server calls.
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error(`CORS blocked request from ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/ai-questions', require('./routes/aiQuestions'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/mistakes', require('./routes/mistakes'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/pyq', require('./routes/pyq'));
app.use('/api/retention', require('./routes/retention'));

// B.Sc. Nursing Prep Routes
app.use('/api/nursing/exams', require('./routes/nursing/exams'));
app.use('/api/nursing/practice', require('./routes/nursing/practice'));
app.use('/api/nursing/tests', require('./routes/nursing/tests'));
app.use('/api/nursing/admin', require('./routes/nursing/admin'));
app.use('/api/nursing/syllabus', require('./routes/nursing/syllabus'));
app.use('/api/nursing/ai', require('./routes/nursing/aiExplainer'));
app.use('/api/nursing/content', require('./routes/nursing/content'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Solnut NEET CBT Platform API running on port ${PORT}`);

  const { getProvider, getGeminiModel, isGeminiConfigured: checkAI } = require('./services/geminiClient');
  const activeProvider = getProvider();
  if (checkAI()) {
    console.log(`✅ Unified AI Client configured. Provider: ${activeProvider.toUpperCase()}, Model: ${getGeminiModel()}`);
  } else {
    console.warn(`⚠️  Unified AI Client is not configured. Add credentials for the active AI_PROVIDER (${activeProvider}) in backend/.env.`);
  }

  // Initialize B.Sc. Nursing Background Schedulers
  try {
    const NursingScheduler = require('./services/nursing/nursingScheduler');
    NursingScheduler.init();
  } catch (schedulerErr) {
    console.error('Failed to initialize B.Sc. Nursing background scheduler:', schedulerErr);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or start this backend on a different port.`);
    process.exit(1);
  }

  throw error;
});

module.exports = app;
