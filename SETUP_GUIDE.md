# Solnut NEET CBT Platform - Setup Guide

Complete setup instructions for the Solnut NEET CBT Platform.

## 📋 Prerequisites

- Node.js 18+ (Download from https://nodejs.org/)
- MongoDB Atlas account (Free tier at https://www.mongodb.com/cloud/atlas)
- OpenAI API key (https://platform.openai.com/api-keys)
- Cloudinary account for image storage (https://cloudinary.com/)
- Git

## 🔧 Environment Setup

### 1. MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a free cluster
3. Create a database user and get connection string
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/solnut-neet?retryWrites=true&w=majority`

### 2. OpenAI Setup

1. Get API key from OpenAI platform
2. Set up billing (required for API calls)

### 3. Cloudinary Setup

1. Create account at cloudinary.com
2. Get API credentials (Cloud Name, API Key, API Secret)

## 🚀 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in backend directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/solnut-neet?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/solnut-neet-test

# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=30d

# OpenAI
OPENAI_API_KEY=sk-your-api-key

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 3: Create Upload Directory

```bash
mkdir uploads
```

### Step 4: Start Backend Server

```bash
npm run dev
```

Server should be running at `http://localhost:5000`

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### Step 3: Start Frontend Server

```bash
npm start
```

Application should open at `http://localhost:3000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Questions

- `GET /api/questions` - Get questions with filters
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create question (Admin)
- `POST /api/questions/upload-pdf` - Upload PDF (Admin)
- `GET /api/questions/stats` - Get statistics

### Tests

- `POST /api/tests/generate` - Generate test
- `GET /api/tests/:testId` - Get test details
- `GET /api/tests/:testId/questions` - Get test questions
- `POST /api/tests/:testId/start` - Start test attempt
- `PUT /api/tests/attempts/:attemptId/response` - Save response
- `PUT /api/tests/attempts/:attemptId/submit` - Submit test
- `GET /api/tests/attempts/:attemptId/results` - Get results
- `GET /api/tests/attempts` - Get user attempts

## 🗄️ Database Schema Overview

### Users
- Personal information
- Statistics (tests, accuracy, streak)
- Subscription status
- Weak/Strong chapters

### Questions
- Question text & options
- Correct answer & explanation
- Subject, chapter, topic
- Difficulty, source, weightage
- Statistics (attempts, accuracy)

### Tests
- Test configuration
- Question distribution
- Test type & source
- Statistics

### Test Attempts
- Student responses
- Scores & analysis
- Subject-wise breakdown
- Chapter-wise analysis
- Performance metrics

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend generates JWT token
3. Token stored in localStorage
4. API requests include token in header
5. Backend verifies token for protected routes

## 🧪 Testing the Platform

### 1. Create Test User

```
POST http://localhost:5000/api/auth/register
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210",
  "class": "12"
}
```

### 2. Add Sample Questions

Use the admin panel to upload a PDF, or via API:

```
POST http://localhost:5000/api/questions
Headers: Authorization: Bearer {token}
{
  "questionText": "What is...",
  "options": {
    "A": "Option A",
    "B": "Option B",
    "C": "Option C",
    "D": "Option D"
  },
  "correctAnswer": "A",
  "subject": "physics",
  "chapter": "Modern Physics",
  "difficulty": "medium",
  "source": "pyq"
}
```

### 3. Generate & Take Test

Use the dashboard to generate tests and attempt them

### 4. View Results

After submission, view detailed AI-powered analysis

## 🚀 Production Deployment

### Backend (using Railway/Render/Heroku)

```bash
# Add start script to package.json
"start": "node src/server.js"

# Deploy
git push heroku main
```

### Frontend (using Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production

Update `.env` with production URLs and secure keys:

```env
NODE_ENV=production
MONGODB_URI={production-db-uri}
JWT_SECRET={strong-random-secret}
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check port 5000 is free
lsof -i :5000

# Check MongoDB connection
mongo "mongodb+srv://..."

# View logs
npm run dev
```

### Frontend Blank Page

- Check `REACT_APP_API_URL` in .env
- Open browser console for errors
- Clear localStorage if authentication issues

### API Errors

- Check MongoDB Atlas whitelist includes your IP
- Verify API keys are correct
- Check CORS settings in backend

### PDF Upload Issues

- Ensure uploads/ directory exists
- Check Tesseract.js installation
- Verify OpenAI API quota

## 📞 Support

For issues, check:

1. Console logs (both backend & frontend)
2. MongoDB Atlas error logs
3. OpenAI usage dashboard
4. Network tab in browser DevTools

## 🔄 Next Steps

After successful setup:

1. Create more test questions
2. Implement admin dashboard for PDF uploads
3. Add more AI features
4. Set up automated testing
5. Configure CI/CD pipeline
6. Deploy to production

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/)

---

**Happy coding! Build something amazing with Solnut! 🚀**
