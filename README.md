# Solnut NEET CBT Platform

See [PYQ_SYSTEM_GUIDE.md](PYQ_SYSTEM_GUIDE.md) for the 10-year PYQ explorer, trends, practice, performance, and admin verification module.

A complete Computer-Based Test (CBT) platform for NEET preparation with AI-powered analysis, adaptive learning, and real exam experience.

## 🎯 Features

- ✅ Real NTA-style CBT exam interface
- ✅ Chapter-wise, Subject-wise, and Full Mock tests
- ✅ AI-powered question extraction from PDFs
- ✅ Automated question database management
- ✅ Advanced timer with auto-save and auto-submit
- ✅ Question palette with color-coded status
- ✅ AI performance analysis and predictions
- ✅ Mistake notebook for revision
- ✅ AI doubt resolution chatbot
- ✅ Personalized study recommendations
- ✅ Student dashboard with progress tracking
- ✅ Admin panel for content management

## 📋 Tech Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- React Query
- Redux Toolkit
- Socket.io (real-time sync)

### Backend
- Node.js + Express
- MongoDB
- JWT Authentication
- OpenAI/Gemini API
- Tesseract.js (OCR)

### Storage
- Cloudinary (images)
- MongoDB (data)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional; test generation and scoring work without it)

### Installation

1. Clone and setup backend:
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

2. Setup frontend:
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The seed is non-destructive and upserts 300 clearly labelled demo questions. It
provides enough Physics, Chemistry, and Biology content for a complete
180-question mock. Replace the demo bank with reviewed, licensed questions for
production use.

To enable the admin PDF review workspace, set `ADMIN_EMAIL` and
`ADMIN_PASSWORD` before running `npm run seed`. AI extraction is enabled only
when `OPENAI_API_KEY` is configured. `OPENAI_MODEL` defaults to
`gpt-5.4-mini`.

## 📁 Project Structure

```
solnut-neet-cbt/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── services/     # AI, OCR, utilities
│   │   └── config/       # Configuration
│   └── package.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API calls
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Redux state
│   │   └── utils/        # Utilities
│   └── package.json
└── docs/                 # Documentation
```

## Verification

```bash
cd backend
npm test -- --runInBand

cd ../frontend
npm run build
```

The implemented flow is: authentication → filtered test generation → timed
CBT with auto-save/resume → submission and +4/−1 scoring → subject/chapter
analysis → mistake notebook and study plan. PDF imports remain unpublished
until an administrator reviews and publishes them.

## 📚 API Documentation

See `docs/API.md` for complete API endpoints.

## 🤝 Contributing

This is a personal project for Solnut. For modifications, please discuss with the team.

## 📄 License

Private - Solnut

---

**Built with ❤️ for NEET aspirants**
