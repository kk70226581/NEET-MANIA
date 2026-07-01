# ⚡ Quick Setup Instructions

Your Solnut NEET CBT Platform is ready! Follow these steps:

## Step 1: Backend Setup

```bash
cd NEETP/backend
npm install
```

**Environment Setup:**
- Edit `.env` file (already created)
- Add MongoDB URI (get from mongodb.com/cloud/atlas)
- Add OpenAI API key (get from platform.openai.com)
- Add Cloudinary credentials (get from cloudinary.com)

**Run Backend:**
```bash
npm run dev
```

Backend will run on: **http://localhost:5000**

## Step 2: Frontend Setup

**In a NEW terminal:**

```bash
cd NEETP/frontend
npm install
```

**Run Frontend:**
```bash
npm start
```

Frontend will open at: **http://localhost:3000**

## Step 3: Test It!

1. Go to http://localhost:3000
2. Click "Register"
3. Create an account with:
   - Email: test@example.com
   - Password: test123456
   - Class: 12
4. Login
5. Click "Start Test" to generate a test
6. Try a full mock test!

## 🎯 What You Have

✅ Complete backend with 20+ API endpoints  
✅ Complete frontend with React  
✅ Real NTA-style exam interface  
✅ All documentation in the NEETP folder  

## 📚 Documentation

Read these files (in order):

1. **START_HERE.md** - Overview
2. **SETUP_GUIDE.md** - Detailed setup
3. **QUICK_REFERENCE.md** - Quick lookup
4. **docs/API.md** - API reference

## ⚠️ If You Get Errors

### Backend won't start
```bash
# Check port 5000 is free
# Check MongoDB URI in .env
# Check all API keys are set
npm run dev
```

### Frontend blank page
- Press F12 to open DevTools
- Check Console for errors
- Verify API_URL in .env matches backend

### Dependencies issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Setup .env files
3. ✅ Run backend & frontend
4. ✅ Register a test account
5. ✅ Generate tests
6. ✅ Add questions via admin panel
7. ✅ Deploy to production

## 📖 All Documentation Files

- `START_HERE.md` - Entry point
- `BUILD_COMPLETE.md` - Summary
- `README.md` - Overview
- `SETUP_GUIDE.md` - Full setup
- `GETTING_STARTED.md` - How to use
- `QUICK_REFERENCE.md` - Quick reference
- `PROJECT_SUMMARY.md` - Architecture
- `INDEX.md` - File navigation
- `docs/API.md` - API reference

**Everything is in the NEETP folder. Happy coding! 🚀**
