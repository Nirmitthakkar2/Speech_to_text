# Speech to Text with LLM Refinement

Web app that records audio, transcribes with Whisper, and refines with AI.

## Features

- Browser-based audio recording
- Local Whisper transcription (no API costs)
- LLM text refinement via OpenRouter
- **Choose from 100+ AI models**
- Recording history with edit capability
- Copy and download transcriptions
- Settings page for easy configuration

## Prerequisites

- Node.js 18+
- Python 3.10+
- ~2GB disk space for Whisper model

---

## 🚀 Quick Start (Easiest Way)

### Windows Users - Just Double-Click!

1. **Double-click `start-backend.bat`** (or `start-backend.ps1` for PowerShell)
   - Wait for: "Uvicorn running on http://0.0.0.0:8000"
   - **KEEP THIS WINDOW OPEN!**

2. **Double-click `start-frontend.bat`** (or `start-frontend.ps1` for PowerShell)
   - Wait for: "Ready in X.Xs"
   - **KEEP THIS WINDOW OPEN!**

3. **Open your browser:** http://localhost:3000

**That's it!** The scripts handle everything automatically:
- ✅ Virtual environment creation
- ✅ Dependency installation
- ✅ Server startup
- ✅ Clear status messages

**First time setup may take 5-10 minutes** (downloads Whisper model ~2GB)

---

## 📖 Manual Setup (Mac/Linux or Advanced Users)

### 1. Clone and Install Frontend

```bash
git clone <repository-url>
cd Speech_to_text
npm install
```

### 2. Set Up Python Backend

**Create Virtual Environment (IMPORTANT!):**

```bash
# Windows PowerShell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1

# Windows Command Prompt
cd backend
python -m venv venv
venv\Scripts\activate.bat

# Mac/Linux
cd backend
python3 -m venv venv
source venv/bin/activate
```

**Install Dependencies:**

```bash
# Make sure venv is activated (you should see (venv) in your terminal)
pip install -r requirements.txt
```

First run will download the Whisper model (~500MB).

### 3. Configure API Key

**Option A: Through Settings Page (Recommended)**

1. Start the application (see step 4)
2. Click **⚙️ Settings** in the top-right corner
3. Get your OpenRouter API key:
   - Go to https://openrouter.ai
   - Sign up / Log in
   - Navigate to Settings → API Keys
   - Click "Create Key"
   - Copy the key
4. Paste the key in the Settings page
5. Click **"Save API Key"**
6. Click **"Test Configuration"** to verify

**Option B: Environment Variable (Optional)**

Create a `.env.local` file in the project root:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
WHISPER_BACKEND_URL=http://localhost:8000
```

### 4. Run the App

**You need TWO terminals running simultaneously:**

**Terminal 1 - Backend:**
```bash
cd backend
# Activate venv first!
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or
venv\Scripts\activate.bat    # Windows CMD
# or
source venv/bin/activate     # Mac/Linux

# Then start backend
python main.py
```

**Expected output:**
```
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
Loading Whisper 'small' model...
Whisper 'small' model loaded successfully!
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**✅ KEEP THIS TERMINAL OPEN!**

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
```

**Expected output:**
```
▲ Next.js 15.1.3
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

**✅ KEEP THIS TERMINAL OPEN!**

**Then open:** http://localhost:3000 in your browser

---

## ⚠️ Important Notes

### Backend 404 Errors Are Normal!

If you see these in the backend terminal:
```
INFO:     127.0.0.1:1260 - "GET / HTTP/1.1" 404 Not Found
INFO:     127.0.0.1:1260 - "GET /favicon.ico HTTP/1.1" 404 Not Found
```

**This is COMPLETELY NORMAL!** 

- The backend only has `/transcribe` endpoint
- There's no root `/` endpoint
- You need the **frontend** to connect to it
- Don't access http://localhost:8000 directly in your browser

### Both Servers Must Run Simultaneously

- ❌ Backend only = 404 errors when accessed directly
- ❌ Frontend only = "Cannot connect to transcription server"
- ✅ **Both running = Everything works!**

### First Time Setup Takes Time

- **Backend:** 5-10 minutes (downloads Whisper model ~2GB)
- **Frontend:** 2-3 minutes (installs Node packages)
- **Subsequent starts:** 10-20 seconds

---

## 🎯 Usage

### 1. Configure Settings (First Time)

1. Click **⚙️ Settings** in top-right
2. **Left side:** Add your OpenRouter API key
3. **Right side:** Choose your preferred AI model
   - Browse 100+ models
   - Search by name
   - Filter free models
   - See pricing and specs
4. Click **"Save API Key"** and **"Save Model"**
5. Click **"Test Configuration"** to verify

### 2. Record and Transcribe

1. Click the red **record button**
2. Speak into your microphone
3. Click **stop** when done
4. Wait for transcription
5. View results:
   - **Raw:** Original Whisper transcription
   - **Refined:** AI-improved text with proper grammar

### 3. Edit and Export

- Click **"Edit"** to modify text manually
- Click **"Re-refine"** to improve again with AI
- Click **"Copy"** to copy to clipboard
- Click **"Download"** to save as text file

### 4. Recording History

- All recordings saved in browser
- Click any recording to view
- Edit or delete as needed
- History persists across sessions

---

## 🆘 Troubleshooting

### "ModuleNotFoundError: No module named 'whisper'"

**Problem:** You forgot to activate the virtual environment!

**Solution:**
```bash
# Activate it first
.\venv\Scripts\Activate.ps1  # Windows PowerShell
venv\Scripts\activate.bat    # Windows CMD
source venv/bin/activate     # Mac/Linux

# Then run
python main.py
```

**Or just use the startup scripts** - they handle this automatically!

### "Cannot connect to transcription server"

**Problem:** Backend is not running.

**Solution:** 
1. Check if backend terminal is open
2. Look for "Uvicorn running on http://0.0.0.0:8000"
3. If not, start the backend first

### Port Already in Use

**Problem:** Port 8000 or 3000 is already being used.

**Solution:**

**Windows:**
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID XXXX /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID XXXX /F
```

**Mac/Linux:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Backend Shows 404 Errors

**This is NORMAL!** Don't worry about it.

- The backend doesn't have a root endpoint
- It only responds to `/transcribe` requests from the frontend
- You should access the app through http://localhost:3000 (frontend)
- Not http://localhost:8000 (backend)

### More Issues?

See **TROUBLESHOOTING.md** for comprehensive solutions to all common problems.

---

## 📚 Documentation

### User Guides:
- **QUICK_START.md** - Simple quick start guide
- **USER_GUIDE.md** - Complete user manual (English)
- **GUJARATI_GUIDE.md** - Complete user manual (Gujarati)
- **TROUBLESHOOTING.md** - Comprehensive troubleshooting

### Feature Guides:
- **MODEL_SELECTION_GUIDE.md** - How to choose AI models
- **VISUAL_GUIDE.md** - Visual interface guide

### Technical Docs:
- **IMPLEMENTATION_DETAILS.md** - Technical documentation
- **FEATURE_SUMMARY.md** - Feature overview

---

## 🎨 Model Selection

The app supports **100+ AI models** from OpenRouter:

### Free Models:
- Xiaomi MiMo V2 Flash (default)
- Google Gemini Flash
- Meta Llama models
- Mistral models
- And more...

### Paid Models:
- GPT-4, GPT-3.5
- Claude models
- PaLM models
- And 100+ more options

**Choose in Settings → Model Selection**

---

## 🏗️ Architecture

```
Browser (MediaRecorder)
    -> Next.js API /api/transcribe
    -> Python FastAPI /transcribe
    -> Whisper (local)
    -> Raw text
    -> Next.js API /api/refine
    -> OpenRouter API (selected model)
    -> Refined text
    -> Frontend display + history
```

---

## 🔧 Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Python FastAPI, OpenAI Whisper
- **LLM:** OpenRouter (100+ models available)
- **Storage:** Browser localStorage

---

## 📝 API Keys Setup

### OpenRouter (Required for text refinement)

The app uses OpenRouter to access various AI models.

**Get Your Key:**
1. Visit https://openrouter.ai/settings/keys
2. Create a new API key
3. Add to Settings page in the app

**Note:** The app works without OpenRouter (shows raw transcription only), but refinement will be disabled.

**Cost:** Many free models available! Paid models charge per use.

---

## 🎓 Development

### Project Structure

```
Speech_to_text/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transcribe/route.ts  # Proxy to Python backend
│   │   │   ├── refine/route.ts      # OpenRouter LLM refinement
│   │   │   └── models/route.ts      # Fetch available models
│   │   ├── settings/page.tsx        # Settings page
│   │   ├── page.tsx                 # Main page
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── AudioRecorder.tsx        # Recording UI
│   │   ├── RecordingHistory.tsx     # History panel
│   │   └── TranscriptionCard.tsx    # History item card
│   ├── lib/
│   │   └── openrouter.ts            # OpenRouter API helper
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── backend/
│   ├── main.py                      # FastAPI server
│   └── requirements.txt             # Python dependencies
├── start-backend.bat                # Windows startup script
├── start-frontend.bat               # Windows startup script
├── start-backend.ps1                # PowerShell startup script
├── start-frontend.ps1               # PowerShell startup script
└── README.md                        # This file
```

### Scripts

```bash
npm run dev    # Start Next.js dev server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

---

## ⚡ Performance Tips

### For Faster Transcription:
- Use a smaller Whisper model (edit `MODEL_NAME` in `backend/main.py`)
- GPU acceleration significantly improves speed
- Keep recordings under 5 minutes

### For Better Quality:
- Use a good microphone
- Record in a quiet environment
- Speak clearly at normal pace
- Try different AI models for refinement

---

## 🔒 Privacy & Security

- **Local Transcription:** Whisper runs on your machine
- **API Keys:** Stored in browser localStorage only
- **Recordings:** Saved in browser, never uploaded
- **No Tracking:** No analytics or tracking
- **Open Source:** All code is visible

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
- **GPU:** Optional, speeds up transcription

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Backend terminal shows: "Uvicorn running on http://0.0.0.0:8000"
2. ✅ Frontend terminal shows: "Ready in X.Xs"
3. ✅ Browser opens http://localhost:3000
4. ✅ You see the Speech to Text interface
5. ✅ Settings page loads
6. ✅ Can record and transcribe audio
7. ✅ Can select different AI models
8. ✅ Refinement works with your API key

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT

---

## 🆘 Need Help?

1. **Read TROUBLESHOOTING.md** for detailed solutions
2. **Check QUICK_START.md** for simple instructions
3. **Review error messages** in terminal windows
4. **Make sure both servers are running**
5. **Try restarting both servers**

---

**Remember:** Both backend and frontend must be running simultaneously for the app to work!

**Access the app at:** http://localhost:3000 (NOT http://localhost:8000)

---

*Speech to Text with LLM Refinement - Powered by Whisper and OpenRouter*