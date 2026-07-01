const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  publishQuestion,
  uploadPDF,
  uploadImage,
  classifyQuestions,
  getQuestionStats,
  getQuestionMetadata,
  getAdminQuestions,
  aiFixQuestion,
  clearAllQuestions,
  generateQuestions,
  generateQuestionsStream
} = require('../controllers/questionController');

// Configure multer for file uploads
const uploadDirectory = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const pdfUploadLimitMb = Math.max(1, Number(process.env.PDF_UPLOAD_LIMIT_MB) || 100);
const imageUploadLimitMb = Math.max(1, Number(process.env.IMAGE_UPLOAD_LIMIT_MB) || 8);

const pdfUpload = multer({
  storage,
  limits: { fileSize: pdfUploadLimitMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are supported'));
  }
});

const imageUpload = multer({
  storage,
  limits: { fileSize: imageUploadLimitMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are supported'));
  }
});

// Public routes
router.get('/', getQuestions);

// Protected routes (authenticated users only)
router.get('/stats', authenticate, getQuestionStats);
router.get('/metadata', authenticate, getQuestionMetadata);

// Protected routes (Admin only)
router.get('/admin/review', authenticate, isAdmin, getAdminQuestions);
router.delete('/admin/clear-all', authenticate, isAdmin, clearAllQuestions);
router.post('/generate', authenticate, isAdmin, generateQuestions);
router.post('/generate-stream', authenticate, isAdmin, generateQuestionsStream);
router.post('/upload-pdf', authenticate, isAdmin, pdfUpload.single('pdf'), uploadPDF);
router.post('/upload-image', authenticate, isAdmin, imageUpload.single('image'), uploadImage);
router.post('/classify', authenticate, isAdmin, classifyQuestions);
router.post('/', authenticate, isAdmin, createQuestion);
router.put('/:id', authenticate, isAdmin, updateQuestion);
router.delete('/:id', authenticate, isAdmin, deleteQuestion);
router.put('/:id/publish', authenticate, isAdmin, publishQuestion);
router.post('/:id/ai-fix', authenticate, isAdmin, aiFixQuestion);
router.get('/:id', getQuestion);

module.exports = router;
