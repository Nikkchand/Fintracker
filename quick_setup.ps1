# FinTrakr AI Assistant - Quick Setup Script
# Run this after you have your OpenAI API key

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FinTrakr AI Assistant - Quick Setup Script           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Function to print colored output
function Print-Status {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )
    
    $colors = @{
        "SUCCESS" = "Green"
        "ERROR"   = "Red"
        "WARNING" = "Yellow"
        "INFO"    = "Cyan"
    }
    
    Write-Host "[$Status] " -ForegroundColor $colors[$Status] -NoNewline
    Write-Host $Message
}

# Step 1: Check Node.js
Print-Status "Checking Node.js installation..." "INFO"
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Print-Status "Node.js $nodeVersion found" "SUCCESS"
} else {
    Print-Status "Node.js not found! Install from https://nodejs.org/" "ERROR"
    exit
}

Write-Host "`n"

# Step 2: Install server dependencies
Print-Status "Installing backend dependencies..." "INFO"
Set-Location -Path "server"

if (Test-Path "node_modules") {
    Print-Status "Dependencies already installed" "SUCCESS"
} else {
    Print-Status "Running npm install..." "INFO"
    npm install
    Print-Status "Backend dependencies installed" "SUCCESS"
}

Write-Host "`n"

# Step 3: Check .env file
Print-Status "Checking server configuration..." "INFO"
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "OPENAI_API_KEY=sk-") {
        Print-Status ".env file configured" "SUCCESS"
    } else {
        Print-Status "OPENAI_API_KEY not properly set in .env" "WARNING"
        Print-Status "Please add your key manually to server\.env" "WARNING"
    }
} else {
    Print-Status ".env file not found" "ERROR"
}

Write-Host "`n"

# Step 4: Install client dependencies
Print-Status "Installing frontend dependencies..." "INFO"
Set-Location -Path "..\client"

if (Test-Path "node_modules") {
    Print-Status "Dependencies already installed" "SUCCESS"
} else {
    npm install
    Print-Status "Frontend dependencies installed" "SUCCESS"
}

Write-Host "`n"

# Summary
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         Setup Complete! Follow these steps:            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n"

Write-Host "Terminal 1 - Start Backend:" -ForegroundColor Yellow
Write-Host "  cd server" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
Write-Host "`n"

Write-Host "Terminal 2 - Start Frontend:" -ForegroundColor Yellow
Write-Host "  cd client" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host "`n"

Write-Host "Then open:" -ForegroundColor Yellow
Write-Host "  http://localhost:5173" -ForegroundColor Gray
Write-Host "`n"

Write-Host "If you get 'trouble connecting' error:" -ForegroundColor Yellow
Write-Host "  1. Make sure server is running (Terminal 1)" -ForegroundColor Gray
Write-Host "  2. Check OPENAI_API_KEY in server\.env" -ForegroundColor Gray
Write-Host "  3. Refresh browser (Ctrl+R)" -ForegroundColor Gray
Write-Host "`n"
