# Quick Start Guide - Speech to Text Application

## 🚀 Easiest Way to Start (Windows)

### First Time Setup:

1. **Download the project** (if you haven't already)
2. **Open the project folder** in File Explorer
3. **Double-click these files in order:**

   **Step 1:** Double-click `start-backend.bat`
   - A black window will open
   - Wait for "Uvicorn running on http://0.0.0.0:8000"
   - **KEEP THIS WINDOW OPEN!**

   **Step 2:** Double-click `start-frontend.bat`
   - Another window will open
   - Wait for "Ready in X.Xs"
   - **KEEP THIS WINDOW OPEN!**

4. **Open your browser** and go to: http://localhost:3000

That's it! 🎉

---

## 📝 What Each File Does

### `start-backend.bat`
- Creates virtual environment (first time only)
- Installs Python dependencies (first time only)
- Starts the backend server on port 8000
- **Must stay open while using the app**

### `start-frontend.bat`
- Installs Node.js dependencies (first time only)
- Starts the frontend server on port 3000
- **Must stay open while using the app**

---

## ⚠️ Important Notes

### First Time Setup:
- **Backend:** May take 5-10 minutes (downloads Whisper model ~2GB)
- **Frontend:** May take 2-3 minutes (installs Node packages)
- **Be patient!** Subsequent starts will be much faster (10-20 seconds)

### Every Time You Use the App:
1. Start backend first (wait for it to load)
2. Start frontend second
3. Keep both windows open
4. Use the app in your browser
5. Close both windows when done (Ctrl+C or close window)

---

## 🎯 Using the Application

### Step 1: Configure API Key (First Time Only)

1. Click **⚙️ Settings** in the top-right corner
2. Get your OpenRouter API key:
   - Go to https://openrouter.ai
   - Sign up / Log in
   - Go to Settings → API Keys
   - Click "Create Key"
   - Copy the key
3. Paste the key in the Settings page
4. Click **"Save API Key"**
5. Click **"Test Configuration"** to verify

### Step 2: Choose AI Model (Optional)

1. In Settings page, right side shows "Model Selection"
2. Browse available models or search
3. Click on a model to select it
4. Click **"Save Model"**
5. Free models are marked with a green "FREE" badge

### Step 3: Record and Transcribe

1. Go back to main page (click the back arrow)
2. Click the red **record button**
3. Speak into your microphone
4. Click **stop** when done
5. Wait for transcription
6. View results:
   - **Raw:** Original transcription
   - **Refined:** AI-improved text with proper grammar

### Step 4: Edit and Export

- Click **"Edit"** to modify text
- Click **"Re-refine"** to improve again with AI
- Click **"Copy"** to copy to clipboard
- Click **"Download"** to save as text file

---

## 🔧 Troubleshooting

### Backend won't start?

**Check:**
1. Do you have Python installed? (Python 3.10+)
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. Is port 8000 already in use?
   - Close any other programs using port 8000
   - Or restart your computer

**Fix:**
- Delete the `venv` folder
- Run `start-backend.bat` again

### Frontend won't start?

**Check:**
1. Do you have Node.js installed? (Node.js 18+)
   - Download from: https://nodejs.org/
   - Choose the LTS version

2. Is port 3000 already in use?
   - Close any other programs using port 3000
   - Or restart your computer

**Fix:**
- Delete the `node_modules` folder
- Run `start-frontend.bat` again

### "Cannot connect to transcription server"?

**This means the backend is not running.**

**Fix:**
1. Make sure `start-backend.bat` window is still open
2. Check if it shows "Uvicorn running on http://0.0.0.0:8000"
3. If not, close and restart `start-backend.bat`

### Microphone not working?

**Check:**
1. Browser permissions - Allow microphone access
2. System settings - Microphone is enabled
3. Try a different browser (Chrome recommended)

### API key not working?

**Check:**
1. Key is copied correctly (no extra spaces)
2. Key starts with `sk-or-v1-`
3. You have credits in your OpenRouter account
4. Try creating a new key

---

## 💡 Tips

### For Best Results:
- Use a good microphone
- Speak clearly and at normal pace
- Record in a quiet environment
- Keep recordings under 5 minutes
- Use free models for testing

### Saving Time:
- Keep both windows open between recordings
- Don't close them unless you're done for the day
- The app loads faster on subsequent uses

### Choosing Models:
- Start with the default (Xiaomi MiMo V2 Flash - FREE)
- Try different models to compare quality
- Free models work great for most uses
- Paid models offer higher quality (optional)

---

## 📊 System Requirements

### Minimum:
- **OS:** Windows 10/11, macOS 10.15+, or Linux
- **RAM:** 4GB
- **Storage:** 5GB free space
- **Internet:** Required for AI refinement

### Recommended:
- **RAM:** 8GB or more
- **Storage:** 10GB free space
- **Internet:** Stable broadband connection

---

## 🎓 Learning Resources

### Guides Available:
- **TROUBLESHOOTING.md** - Detailed problem solving
- **USER_GUIDE.md** - Complete user manual (English)
- **GUJARATI_GUIDE.md** - Complete user manual (Gujarati)
- **MODEL_SELECTION_GUIDE.md** - How to choose AI models
- **README.md** - Technical documentation

### Video Tutorials:
- Check the project repository for video guides
- Look for community tutorials online

---

## ✅ Success Checklist

Before using the app, make sure:

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Both batch files run without errors
- [ ] Backend shows "Uvicorn running"
- [ ] Frontend shows "Ready"
- [ ] Browser opens http://localhost:3000
- [ ] Can see the main interface
- [ ] Settings page loads
- [ ] API key configured
- [ ] Microphone permission granted

---

## 🎉 You're Ready!

Once both servers are running and you've configured your API key, you can:

✅ Record audio  
✅ Get instant transcriptions  
✅ Improve text with AI  
✅ Choose from 100+ AI models  
✅ Edit and export results  
✅ Save recording history  

**Enjoy using your Speech to Text application!** 🚀

---

## 📞 Need More Help?

1. Read **TROUBLESHOOTING.md** for detailed solutions
2. Check the error messages in the terminal windows
3. Make sure both servers are running
4. Try restarting both servers
5. Restart your computer if issues persist

---

*Quick Start Guide - Speech to Text Application*