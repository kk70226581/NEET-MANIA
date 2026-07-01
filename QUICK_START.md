# 🚀 Quick Start - Solnut NEET CBT Platform

## ⚡ Fastest Way to Run (10 minutes)

### Step 1: Install MongoDB Locally

**Windows:**
1. Download MongoDB Community from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install as a Service"
4. MongoDB will run automatically

**Verify MongoDB is running:**
```bash
mongo
```
You should see a MongoDB shell. Type `exit` to close it.

### Step 2: Start Backend

```bash
cd NEETP/backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
Server running on port 5000
```

### Step 3: Start Frontend (New Terminal)

```bash
cd NEETP/frontend
npm start
```

This will:
- Install remaining dependencies
- Compile React
- Open http://localhost:3000

### Step 4: Test It!

1. Go to http://localhost:3000
2. Register:
   - Email: test@example.com
   - Password: test123456
   - Class: 12
3. Login
4. Click "Start Test"
5. Generate a Full Mock Test
6. Try the exam!

---

## 🔧 If Something Goes Wrong

### Frontend won't start
```bash
# Try this
cd NEETP/frontend
npm install
npm start
```

### Backend won't connect to MongoDB
1. Check MongoDB is running
2. In Windows, search for "Services" and look for MongoDB
3. If not running, start it manually

### Port 5000 already in use
```bash
# Use different port
cd NEETP/backend
PORT=5001 npm run dev
```
Then update frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### Still getting errors?
```bash
# Clear everything and reinstall
cd NEETP/frontend
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

---

## 📚 Documentation

All guides are in NEETP folder:
- **START_HERE.md** - Overview
- **SETUP_GUIDE.md** - Detailed setup
- **QUICK_REFERENCE.md** - Common tasks
- **docs/API.md** - API reference

---

## 🎯 What Works Without API Keys

✅ Register & Login  
✅ Generate Tests  
✅ Take Exams  
✅ View Results  
✅ Test Timer & Palette  

## 🔑 What Needs API Keys (Optional)

❌ PDF Upload (needs OpenAI)  
❌ AI Analysis (needs OpenAI)  
❌ AI Chatbot (needs OpenAI)  
❌ Image Storage (needs Cloudinary)  

**You can add these later!**

---

## 🎉 Done!

Your NEET CBT platform is running locally!

### Next Steps:
1. Create a test account
2. Generate a mock test
3. Take the exam
4. View results

### When Ready to Add Features:
1. Get OpenAI API key
2. Get Cloudinary account
3. Update `.env` files
4. Restart backend

---

**Have fun building! 🚀**
