# PowerShell Script to automatically start both Frontend and Backend
# Runs seed script to set up credentials

Write-Host "Checking MongoDB service status..." -ForegroundColor Cyan
$service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -ne "Running") {
        Write-Host "⚠️ MongoDB Service is currently STOPPED!" -ForegroundColor Yellow
        Write-Host "Please right-click 'fix-mongodb.ps1' and select 'Run with PowerShell' as Administrator first." -ForegroundColor Yellow
        Write-Host "Press Enter to continue anyway, or Ctrl+C to cancel..."
        $null = Read-Host
    } else {
        Write-Host "✓ MongoDB service is running." -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ MongoDB Service not found on this machine." -ForegroundColor Yellow
}

# 1. Install Backend Dependencies
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "`nInstalling backend dependencies..." -ForegroundColor Cyan
    Push-Location backend
    npm install
    Pop-Location
}

# 2. Install Frontend Dependencies
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Cyan
    Push-Location frontend
    npm install
    Pop-Location
}

# 3. Seed Database (Creates admin@college.edu / admin123)
Write-Host "`nSeeding database..." -ForegroundColor Cyan
Push-Location backend
npm run seed
Pop-Location

# 4. Start Servers
Write-Host "`nStarting Backend and Frontend servers in separate windows..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Backend API Server...'; Set-Location backend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Frontend Vite App...'; Set-Location frontend; npm run dev"

Write-Host "`nDone! The servers are launching in separate windows." -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "`nUse credentials: admin@college.edu / admin123" -ForegroundColor White
Write-Host "Press any key to exit..."
$null = [System.Console]::ReadKey($true)
