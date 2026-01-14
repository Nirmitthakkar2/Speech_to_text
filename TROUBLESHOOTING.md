# Troubleshooting Guide - Speech to Text Application

## 🔴 Common Error: "ModuleNotFoundError: No module named 'whisper'"

This error occurs when Python can't find the Whisper module. Here's how to fix it:

---

## ✅ Solution Steps

### Step 1: Verify Python Installation

Open Command Prompt (cmd) or PowerShell and check your Python version:

```bash
python --version
# or
py --version
```

**Expected output:** Python 3.10 or higher

---

### Step 2: Create Virtual Environment (RECOMMENDED)

**Why?** Virtual environments keep your project dependencies isolated and prevent conflicts.

#### On Windows (PowerShell):

```powershell
# Navigate to your project
cd C:\Users\TNirmit\PycharmProjects\Speech_to_text

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### On Windows (Command Prompt):

```cmd
# Navigate to your project
cd C:\Users\TNirmit\PycharmProjects\Speech_to_text

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate.bat
```

#### On Mac/Linux:

```bash
# Navigate to your project
cd ~/Speech_to_text

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

**You'll know it's activated when you see `(venv)` at the start of your command line.**

---

### Step 3: Install Dependencies

**IMPORTANT:** Make sure your virtual environment is activated (you should see `(venv)` in your terminal).

```bash
# Navigate to backend folder
cd backend

# Install all requirements
pip install -r requirements.txt
```

**This will install:**
- FastAPI (web framework)
- Uvicorn (server)
- OpenAI Whisper (speech recognition)
- PyTorch (deep learning framework)
- Other dependencies

**Note:** First installation may take 5-10 minutes and download ~2GB of files.

---

### Step 4: Verify Installation

Check if Whisper is installed correctly:

```bash
python -c "import whisper; print('Whisper installed successfully!')"
```

**Expected output:** `Whisper installed successfully!`

If you get an error, try:

```bash
pip install --upgrade openai-whisper
```

---

### Step 5: Run the Backend

**Make sure you're in the backend folder with virtual environment activated:**

```bash
# Should see (venv) at the start of your line
python main.py
```

**Expected output:**
```
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
Loading Whisper 'small' model...
100%|████████████████████████| 461M/461M [00:21<00:00, 22.9MiB/s]
Whisper 'small' model loaded successfully!
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Keep this terminal open!** The backend server needs to keep running.

---

### Step 6: Run the Frontend

**Open a NEW terminal/command prompt** (keep the backend running in the first one):

```bash
# Navigate to project root
cd C:\Users\TNirmit\PycharmProjects\Speech_to_text

# Install Node.js dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
> speech-to-text@0.1.0 dev
> next dev

   ▲ Next.js 15.1.3
   - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 2.3s
```

---

## 🎯 Quick Reference

### Starting the Application (After Initial Setup)

**Terminal 1 - Backend:**
```bash
cd C:\Users\TNirmit\PycharmProjects\Speech_to_text\backend
.\venv\Scripts\Activate.ps1  # or venv\Scripts\activate.bat
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\TNirmit\PycharmProjects\Speech_to_text
npm run dev
```

**Then open:** http://localhost:3000

---

## 🐛 Common Issues & Solutions

### Issue 1: "python: command not found"

**Solution:** Use `py` instead of `python`:
```bash
py -m venv venv
py main.py
```

---

### Issue 2: "pip: command not found"

**Solution:** Use `python -m pip`:
```bash
python -m pip install -r requirements.txt
```

---

### Issue 3: Virtual environment won't activate (PowerShell)

**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:
```powershell
.\venv\Scripts\Activate.ps1
```

---

### Issue 4: "Cannot connect to transcription server"

**Causes:**
1. Backend not running
2. Backend running on wrong port
3. Firewall blocking connection

**Solutions:**

**Check if backend is running:**
- Look for terminal with "Uvicorn running on http://0.0.0.0:8000"
- If not, start it: `python main.py`

**Test backend directly:**
```bash
# In browser or curl
curl http://localhost:8000
```

**Check port:**
- Backend should be on port 8000
- Frontend should be on port 3000

---

### Issue 5: Whisper model download fails

**Error:** Download interrupted or fails

**Solution:**
```bash
# Clear cache and retry
python -c "import whisper; whisper.load_model('small')"
```

**Or manually download:**
1. Go to: https://openaipublic.azureedge.net/main/whisper/models/
2. Download: `9ecf779972d90ba49c06d968637d720dd632c55bbf19d441fb42bf17a411e794/small.pt`
3. Place in: `~/.cache/whisper/` (Windows: `C:\Users\YourName\.cache\whisper\`)

---

### Issue 6: "Port 8000 already in use"

**Solution:**

**Windows:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9
```

---

### Issue 7: PyTorch installation fails

**Error:** "Could not find a version that satisfies the requirement torch"

**Solution:**

**For CPU-only (faster install):**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**For GPU (NVIDIA CUDA):**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

---

### Issue 8: "No module named 'whisper'" even after installation

**Possible causes:**
1. Multiple Python installations
2. Not using virtual environment
3. Installing in wrong Python environment

**Solution:**

**Check which Python is being used:**
```bash
# Activate venv first
.\venv\Scripts\Activate.ps1

# Check Python path
python -c "import sys; print(sys.executable)"
```

**Reinstall in correct environment:**
```bash
# Make sure venv is activated
pip uninstall openai-whisper
pip install openai-whisper
```

---

## 📋 Complete Setup Checklist

Use this checklist to ensure everything is set up correctly:

### Backend Setup:
- [ ] Python 3.10+ installed
- [ ] Virtual environment created
- [ ] Virtual environment activated (see `(venv)` in terminal)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Whisper module imports successfully
- [ ] Backend server starts without errors
- [ ] Can access http://localhost:8000

### Frontend Setup:
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Settings page loads
- [ ] Can add API key

### API Configuration:
- [ ] OpenRouter account created
- [ ] API key generated
- [ ] API key added in Settings page
- [ ] Test configuration passes

---

## 🔍 Diagnostic Commands

Run these to diagnose issues:

```bash
# Check Python version
python --version

# Check pip version
pip --version

# Check if in virtual environment
python -c "import sys; print(sys.prefix)"

# List installed packages
pip list

# Check if Whisper is installed
pip show openai-whisper

# Test Whisper import
python -c "import whisper; print('OK')"

# Check backend port
netstat -an | findstr 8000  # Windows
lsof -i :8000              # Mac/Linux

# Check frontend port
netstat -an | findstr 3000  # Windows
lsof -i :3000              # Mac/Linux
```

---

## 💡 Best Practices

### 1. Always Use Virtual Environment
- Keeps dependencies isolated
- Prevents version conflicts
- Easy to recreate if issues occur

### 2. Keep Terminals Open
- Backend terminal must stay open
- Frontend terminal must stay open
- Don't close them while using the app

### 3. Check Both Servers
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Both must be running

### 4. Update Regularly
```bash
# Update backend dependencies
pip install --upgrade -r requirements.txt

# Update frontend dependencies
npm update
```

---

## 🆘 Still Having Issues?

### Collect This Information:

1. **Python version:**
   ```bash
   python --version
   ```

2. **Pip version:**
   ```bash
   pip --version
   ```

3. **Installed packages:**
   ```bash
   pip list > packages.txt
   ```

4. **Error messages:**
   - Copy the full error message
   - Include the command that caused it

5. **System information:**
   - Operating System (Windows/Mac/Linux)
   - Version (Windows 10/11, macOS version, etc.)

---

## 📚 Additional Resources

### Documentation:
- **Whisper:** https://github.com/openai/whisper
- **FastAPI:** https://fastapi.tiangolo.com/
- **Next.js:** https://nextjs.org/docs

### Guides in This Project:
- `README.md` - General setup
- `USER_GUIDE.md` - How to use the app
- `GUJARATI_GUIDE.md` - Gujarati instructions
- `MODEL_SELECTION_GUIDE.md` - Choosing AI models

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Backend terminal shows: "Uvicorn running on http://0.0.0.0:8000"
2. ✅ Frontend terminal shows: "Ready in X.Xs"
3. ✅ Browser opens http://localhost:3000
4. ✅ You see the Speech to Text interface
5. ✅ Settings page loads
6. ✅ Can record and transcribe audio
7. ✅ Can select different AI models

---

**Remember:** Both backend and frontend must be running simultaneously for the app to work!

---

*Troubleshooting guide for Speech to Text application*