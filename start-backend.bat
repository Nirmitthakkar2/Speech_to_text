@echo off
echo ========================================
echo Starting Speech to Text Backend Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv&quot; (
    echo Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    echo.
    echo Virtual environment created!
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
echo.
echo Checking dependencies...
python -c "import whisper" 2>nul
if errorlevel 1 (
    echo Whisper not found! Installing dependencies...
    echo This may take 5-10 minutes on first run...
    cd backend
    pip install -r requirements.txt
    cd ..
    echo.
    echo Dependencies installed!
    echo.
)

REM Start backend server
echo.
echo Starting backend server...
echo Backend will run on: http://localhost:8000
echo.
echo ========================================
echo KEEP THIS WINDOW OPEN!
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd backend
python main.py

pause