# Solnut NEET CBT - Quick Reference

## 🚀 Start Here (60 seconds)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
npm run dev

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm start

# 3. Open http://localhost:3000
```

---

## 📂 Important Files

| File | Purpose | Edit When |
|------|---------|-----------|
| `backend/.env` | Backend config | Setting up API keys |
| `frontend/.env` | Frontend config | Changing API URL |
| `backend/src/config/constants.js` | App constants | Adding chapters |
| `backend/src/models/Question.js` | Question schema | Need new fields |
| `frontend/src/pages/ExamPage.jsx` | Exam interface | Customizing UI |

---

## 🔗 Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Frontend app |
| http://localhost:5000/api | Backend API |
| http://localhost:5000/health | API health check |

---

## 🔑 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Quick Reference

### Auth
```bash
# Register
POST /auth/register
{email, password, firstName, lastName, class}

# Login
POST /auth/login
{email, password}
```

### Tests
```bash
# Generate test
POST /tests/generate
{testType, subject, difficulty}

# Get test questions
GET /tests/{testId}/questions

# Start test
POST /tests/{testId}/start

# Submit test
PUT /tests/attempts/{attemptId}/submit

# Get results
GET /tests/attempts/{attemptId}/results
```

### Questions
```bash
# Get questions
GET /questions?subject=physics&chapter=Modern Physics

# Create question (admin)
POST /questions
{questionText, options, correctAnswer, subject, chapter, difficulty}

# Upload PDF (admin)
POST /questions/upload-pdf
{pdf file, subject, chapter, source}
```

---

## 🧪 Testing Checklist

- [ ] Backend starts without errors
- [ ] MongoDB connection works
- [ ] Frontend loads at localhost:3000
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can see dashboard
- [ ] Can generate test
- [ ] Can take exam
- [ ] Timer works correctly
- [ ] Can submit test
- [ ] Results page shows analysis

---

## 🐛 Common Issues

### Backend won't start
```bash
# Check if port 5000 is free
lsof -i :5000

# Check MongoDB connection
# Verify MONGODB_URI in .env

# Check node_modules
rm -rf node_modules
npm install
npm run dev
```

### Frontend blank page
```bash
# Check console (F12)
# Check API_URL in .env
# Clear localStorage
localStorage.clear()
```

### API errors
```bash
# Check MongoDB whitelist (add your IP)
# Verify API keys are correct
# Check CORS is enabled
# Review backend logs
```

---

## 📦 Install Commands

```bash
# Backend dependencies
npm install express mongoose dotenv jsonwebtoken bcryptjs cors

# Frontend dependencies
npm install react react-router-dom axios react-query redux react-redux

# Optional
npm install tesseract.js openai cloudinary  # For advanced features
```

---

## 🎯 Test Scenarios

### Scenario 1: Basic Flow
1. Register new user → Login → Dashboard → Generate test → Take exam → Submit → View results

### Scenario 2: Admin Upload
1. Login as admin → Upload PDF → Verify questions → Publish → Available for tests

### Scenario 3: Multiple Tests
1. Take full mock → View results → Take chapter test → Take subject test → Compare performance

---

## 🔐 Default Test Credentials

Create a test account:
```
Email: test@example.com
Password: test123456
Class: 12
```

---

## 📊 Database Commands

### MongoDB Compass
1. Connect: `mongodb+srv://user:pass@cluster.mongodb.net/solnut-neet`
2. View collections: Users, Questions, Tests, TestAttempts
3. Check indexes on key fields

### Useful Queries
```javascript
// Count questions by subject
db.questions.aggregate([
  { $match: { isPublished: true } },
  { $group: { _id: "$subject", count: { $sum: 1 } } }
])

// Find questions by chapter
db.questions.find({ subject: "physics", chapter: "Modern Physics" })

// Get user statistics
db.users.findOne({ email: "test@example.com" })
```

---

## 🚀 Deployment Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] API tested thoroughly
- [ ] Frontend build optimized
- [ ] Error handling implemented
- [ ] Security headers added
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Monitoring set up

---

## 📱 Features Quick Map

```
User Registration/Login
    ↓
Dashboard (Statistics, Test Selection)
    ↓
Test Generation (Multiple Types)
    ↓
Exam Interface (Timer, Palette)
    ↓
Submit & Results
    ↓
Analysis & Recommendations
    ↓
Attempt History
```

---

## 💻 Development Tips

### Adding a new feature
1. Create model in `backend/src/models/`
2. Add controller logic in `backend/src/controllers/`
3. Create routes in `backend/src/routes/`
4. Update API service in `frontend/src/services/api.js`
5. Create React component in `frontend/src/pages/` or `components/`

### Debugging
```javascript
// Backend
console.log('Debug:', variable);
// Check logs: `npm run dev`

// Frontend  
console.log('Debug:', variable);
// Check DevTools: F12 → Console
```

### Database Debugging
```javascript
// MongoDB shell
show dbs
use solnut-neet
show collections
db.questions.find().limit(1)
db.users.findOne()
```

---

## 🎨 UI Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: '#2563eb',    // Change to any color
  success: '#16a34a',
  danger: '#dc2626'
}
```

### Change Fonts
Edit `frontend/src/index.css`:
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Add Dark Mode
Tailwind supports dark mode by default:
```jsx
<div className="bg-white dark:bg-black">
```

---

## 📈 Performance Tips

1. **Database**: Use pagination, indexes, projections
2. **Frontend**: Lazy load components, use React.memo
3. **API**: Cache responses with React Query
4. **Images**: Use Cloudinary transformations
5. **Bundle**: Use code splitting for routes

---

## 🔄 Git Workflow

```bash
# Initialize
git init
git add .
git commit -m "Initial commit: Solnut NEET CBT Platform"

# Push
git remote add origin https://github.com/your/repo.git
git push -u origin main

# Updates
git add .
git commit -m "Feature: Add new test type"
git push
```

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `PORT=5001 npm run dev` |
| DB connection fails | Check MongoDB URI and whitelist |
| API returns 401 | Check JWT token, re-login |
| Images not loading | Verify Cloudinary credentials |
| Tests timeout | Increase timeout in backend |
| State not updating | Check Redux DevTools |

---

## 🎓 Learning Resources

### MongoDB
- Collections structure
- Indexing for performance
- Aggregation pipeline

### Node.js/Express
- Middleware system
- Error handling
- Async/await patterns

### React
- Hooks (useState, useEffect)
- Context vs Redux
- Component lifecycle

### Authentication
- JWT tokens
- Password hashing
- Authorization patterns

---

## ✅ Final Checklist Before Launch

- [ ] All 20 API endpoints working
- [ ] Tested on localhost
- [ ] Database backups configured
- [ ] Error handling complete
- [ ] Documentation updated
- [ ] Security review done
- [ ] Performance tested
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Ready for deployment

---

## 🚀 Ready to Launch?

1. **Setup** → Follow SETUP_GUIDE.md
2. **Test** → Use Testing Checklist above
3. **Deploy** → Choose platform (Vercel/Railway)
4. **Monitor** → Set up logging
5. **Market** → Start promoting to students

---

## 📚 Full Documentation

- `README.md` - Overview
- `SETUP_GUIDE.md` - Detailed setup
- `GETTING_STARTED.md` - Quick start
- `docs/API.md` - API reference
- `PROJECT_SUMMARY.md` - Technical summary

---

**Questions? Check the full documentation or debugging sections above!**

**Happy coding! 🚀**
