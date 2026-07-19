# PowerShell Script to fix MongoDB Service permissions and start it
# MUST BE RUN AS ADMINISTRATOR

Write-Host "Fixing MongoDB directory permissions..." -ForegroundColor Cyan

$dataDir = "C:\Program Files\MongoDB\Server\8.3\data"
$logDir = "C:\Program Files\MongoDB\Server\8.3\log"

# Verify directories exist
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

try {
    # Grant Network Service Full Control permissions
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("Network Service", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    
    $dataAcl = Get-Acl $dataDir
    $dataAcl.SetAccessRule($rule)
    Set-Acl $dataDir $dataAcl
    Write-Host "✓ Permissions granted for data directory: $dataDir" -ForegroundColor Green

    $logAcl = Get-Acl $logDir
    $logAcl.SetAccessRule($rule)
    Set-Acl $logDir $logAcl
    Write-Host "✓ Permissions granted for log directory: $logDir" -ForegroundColor Green

    # Try starting the service
    Write-Host "Attempting to start MongoDB service..." -ForegroundColor Cyan
    Start-Service -Name MongoDB
    
    $status = (Get-Service -Name MongoDB).Status
    if ($status -eq "Running") {
        Write-Host "✓ MongoDB service is now RUNNING successfully on port 27017!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Service status is: $status. Please start it manually in services.msc" -ForegroundColor Yellow
    }
} catch {
    Write-Error "Error: $_"
    Write-Host "`nFailed to start service automatically. Try this manually:" -ForegroundColor Yellow
    Write-Host "1. Press Win + R, type 'services.msc' and press Enter." -ForegroundColor White
    Write-Host "2. Find 'MongoDB Server (MongoDB)'" -ForegroundColor White
    Write-Host "3. Right click -> Properties -> Log On tab -> Select 'Local System account'." -ForegroundColor White
    Write-Host "4. Apply and click Start service." -ForegroundColor White
}

Write-Host "`nPress any key to close..."
$null = [System.Console]::ReadKey($true)
