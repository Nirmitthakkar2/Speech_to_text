# Speech to Text - Backend Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Speech to Text Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found!" -ForegroundColor Yellow
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host ""
    Write-Host "Virtual environment created!" -ForegroundColor Green
    Write-Host ""
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check if dependencies are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$whisperInstalled = python -c "import whisper" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Whisper not found! Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take 5-10 minutes on first run..." -ForegroundColor Yellow
    Set-Location backend
    pip install -r requirements.txt
    Set-Location ..
    Write-Host ""
    Write-Host "Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Start backend server
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Backend will run on: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KEEP THIS WINDOW OPEN!" -ForegroundColor Red
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend
python main.py