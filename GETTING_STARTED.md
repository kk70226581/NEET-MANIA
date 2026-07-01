# Solnut NEET CBT Platform - Getting Started

## 🎯 What You've Built

A **complete Computer-Based Test (CBT) platform** for NEET preparation with:

✅ Real NTA-style exam interface  
✅ AI-powered question extraction from PDFs  
✅ Multiple test types (Full Mock, Chapter-wise, Subject-wise)  
✅ Comprehensive performance analysis  
✅ Mistake notebook for revision  
✅ Student dashboard with progress tracking  
✅ Admin panel for content management  

---

## 📁 Project Structure

```
solnut-neet-cbt/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── config/          # Database & constants
│   │   ├── models/          # MongoDB schemas
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # AI, OCR, tests
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API layer
│   │   ├── store/          # Redux state
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/
│   └── API.md              # API documentation
│
├── SETUP_GUIDE.md          # Detailed setup instructions
├── README.md               # Project overview
└── GETTING_STARTED.md      # This file
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 3. Access the Platform

- Frontend: http://localhost:3000
- API: http://localhost:5000/api

---

## 📚 Key Features Explained

### 1. **Authentication**
- User registration & login
- JWT-based token authentication
- Profile management

### 2. **Test Generation**
- Full Mock Test (180Q, 180min) - NTA format
- Subject Tests (60Q, 90min)
- Chapter Tests (30Q, 45min)
- Topic Tests (15Q, 30min)
- Previous Year Questions
- Custom tests with filters

### 3. **CBT Exam Interface**
- Real-time countdown timer
- Question palette (color-coded status)
- Save & Next, Mark for Review
- Previous/Next navigation
- Auto-save responses
- Auto-submit on timeout

### 4. **Performance Analysis**
- Score calculation with marking scheme
- Accuracy percentage
- Subject-wise breakdown
- Chapter-wise analysis
- Time per question metrics
- Predicted NEET rank
- AI-powered insights

### 5. **Student Features**
- Dashboard with statistics
- Test attempts history
- Mistake notebook
- Weak & strong chapter identification
- Study recommendations

### 6. **Admin Features**
- PDF upload & processing
- Question creation & management
- Question verification
- Publish/unpublish control
- Content statistics

---

## 🔑 Important Files

### Backend

| File | Purpose |
|------|---------|
| `src/server.js` | Express app setup |
| `src/models/User.js` | User schema |
| `src/models/Question.js` | Question schema |
| `src/models/Test.js` | Test schema |
| `src/models/TestAttempt.js` | Test attempt & results |
| `src/services/testGenerator.js` | Test generation logic |
| `src/services/aiAnalyzer.js` | AI analysis engine |
| `src/services/pdfExtractor.js` | PDF processing |
| `src/controllers/testController.js` | Test logic |
| `src/routes/tests.js` | Test endpoints |

### Frontend

| File | Purpose |
|------|---------|
| `src/App.js` | Main app component |
| `src/pages/DashboardPage.jsx` | Home dashboard |
| `src/pages/ExamPage.jsx` | Exam interface |
| `src/pages/ResultsPage.jsx` | Results & analysis |
| `src/services/api.js` | API client |
| `src/store/slices/examSlice.js` | Exam state |

---

## 📊 Database Collections

### Users
Stores student profiles, statistics, weak/strong chapters

### Questions
Stores all questions with metadata:
- Text, options, correct answer
- Subject, chapter, topic
- Difficulty, source, weightage
- Statistics (attempts, accuracy)

### Tests
Stores test configurations:
- Questions included
- Type & source
- Time limit & distribution

### TestAttempts
Stores student responses:
- Question responses
- Scores & analysis
- Weak areas identified

### MistakeNotebook
Stores student mistakes for revision

---

## 🔄 Workflow

### Student Workflow

1. **Register/Login** → Create account
2. **Dashboard** → View statistics, select test type
3. **Generate Test** → Choose subject, chapter, difficulty
4. **Take Exam** → NTA-style interface, timer, palette
5. **Submit Test** → Auto-calculation of score
6. **View Results** → Detailed AI analysis
7. **Revision** → Mistake notebook, weak chapters

### Admin Workflow

1. **Login** → Admin account
2. **Upload PDF** → Select file, metadata
3. **PDF Processing** → OCR + AI extraction
4. **Review Questions** → Edit if needed
5. **Publish** → Make available to students

---

## 🛠️ Customization Guide

### Add New Chapter

1. Edit `backend/src/config/constants.js`
2. Add to `PHYSICS_CHAPTERS`, `CHEMISTRY_CHAPTERS`, etc.

### Modify Marking Scheme

Edit `backend/src/config/constants.js`:
```javascript
MARKING_SCHEME = {
  CORRECT: 4,      // Change this
  INCORRECT: -1,   // Change this
  UNANSWERED: 0
}
```

### Change Test Configuration

Edit `TEST_CONFIG`:
```javascript
CHAPTER_TEST: { timeLimit: 45, questionCount: 30 } // Modify
```

### Customize UI

Edit `frontend/src/index.css` or `tailwind.config.js`

---

## 🚨 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Find process
lsof -i :5000
# Kill it or use different port
PORT=5001 npm run dev
```

**MongoDB connection error:**
- Check MongoDB Atlas whitelist (add your IP)
- Verify credentials in .env
- Test connection with MongoDB Compass

**OpenAI API errors:**
- Check API key is valid
- Verify billing is enabled
- Check API usage limits

### Frontend Issues

**Blank page:**
- Open DevTools (F12)
- Check Console for errors
- Verify API_URL in .env

**Can't login:**
- Check backend is running
- Verify API_URL points to backend
- Check browser Network tab

**Timer not working:**
- Clear browser cache
- Check Redux store state
- Verify setInterval is running

---

## 📈 Performance Tips

### Backend Optimization

1. **Database Indexing** - Already done on key fields
2. **Pagination** - Always use limit in queries
3. **Caching** - Implement Redis for frequently accessed data
4. **API Rate Limiting** - Already configured

### Frontend Optimization

1. **Code Splitting** - React Router handles this
2. **Image Optimization** - Use Cloudinary transforms
3. **State Management** - Redux for global state
4. **Lazy Loading** - React.lazy for routes

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable MongoDB encryption
- [ ] Use HTTPS for frontend
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Sanitize PDF uploads
- [ ] Hash passwords (already done)
- [ ] Protect admin routes
- [ ] Implement CSRF protection

---

## 📦 Deployment Options

### Recommended Stack

**Frontend:** Vercel  
**Backend:** Railway or Render  
**Database:** MongoDB Atlas (free tier)  
**Storage:** Cloudinary  

### Deploy to Vercel (Frontend)

```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Deploy to Railway (Backend)

```bash
# Connect GitHub repo
# Railway auto-deploys on push
```

---

## 🎓 Next Features to Build

1. **AI Chatbot** - Answer student doubts
2. **Study Planner** - AI-generated daily schedule
3. **Leaderboard** - Compete with other students
4. **Discussion Forum** - Student community
5. **Video Explanations** - Link to YouTube videos
6. **Offline Mode** - Download for offline practice
7. **Mobile App** - React Native version
8. **Adaptive Learning** - Difficulty adjustment
9. **Live Classes** - Integrate with Zoom
10. **Payment Integration** - Subscriptions

---

## 📞 Support Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🎉 Congratulations!

You now have a **production-ready NEET CBT platform** with:

✨ Modern tech stack  
✨ AI-powered features  
✨ Professional UI/UX  
✨ Scalable architecture  
✨ Complete documentation  

### What to do next:

1. **Test Everything** - Take a full mock test yourself
2. **Add Sample Data** - Upload PDFs with questions
3. **Invite Beta Users** - Get feedback
4. **Deploy** - Take it live
5. **Monitor** - Track performance metrics
6. **Iterate** - Add features based on feedback

---

## 💡 Pro Tips

1. **Start with PDF uploads** - They're the hardest part
2. **Test with 10 questions first** - Before full mock
3. **Monitor AI API costs** - They can add up
4. **Use pagination** - For large datasets
5. **Backup database regularly** - Critical data
6. **Track user metrics** - For improvements
7. **Get user feedback early** - Iterate fast
8. **Focus on exam UX** - This is your differentiator

---

## 📝 License

This project is built for Solnut. Modify as needed!

---

## 🚀 Ready to Launch?

Your platform is ready to go. All that's left is:

1. ✅ Set up environment variables
2. ✅ Add your first questions
3. ✅ Test the entire flow
4. ✅ Deploy to production
5. ✅ Market to students

**Good luck! You've built something amazing! 🎉**

---

**Questions? Check the [Setup Guide](./SETUP_GUIDE.md) or [API Docs](./docs/API.md)**
