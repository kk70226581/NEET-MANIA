require('dotenv').config();
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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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
app.use('/api/questions', require('./routes/questions'));
app.use('/api/ai-questions', require('./routes/aiQuestions'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/mistakes', require('./routes/mistakes'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/pyq', require('./routes/pyq'));

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
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or start this backend on a different port.`);
    process.exit(1);
  }

  throw error;
});

module.exports = app;
// Trigger restart
