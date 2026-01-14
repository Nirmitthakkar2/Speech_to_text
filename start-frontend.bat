@echo off
echo ========================================
echo Starting Speech to Text Frontend
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules&quot; (
    echo Node modules not found!
    echo Installing dependencies...
    echo This may take a few minutes...
    call npm install
    echo.
    echo Dependencies installed!
    echo.
)

REM Start frontend
echo.
echo Starting frontend server...
echo Frontend will run on: http://localhost:3000
echo.
echo ========================================
echo KEEP THIS WINDOW OPEN!
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev

pause