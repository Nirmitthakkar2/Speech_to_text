# Speech to Text - Frontend Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Speech to Text Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Node modules not found!" -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    npm install
    Write-Host ""
    Write-Host "Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Start frontend
Write-Host ""
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KEEP THIS WINDOW OPEN!" -ForegroundColor Red
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev