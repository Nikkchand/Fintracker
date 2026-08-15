@echo off
REM FinTrakr AI Assistant Verification Script
REM This script checks if everything is properly configured

echo.
echo ============================================
echo FinTrakr AI Assistant - Configuration Check
echo ============================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  ✓ Node.js is installed
    node --version
) else (
    echo  ✗ Node.js is NOT installed - Please install from https://nodejs.org/
)

echo.

REM Check if server directory exists
echo [2/5] Checking server directory...
if exist "server\package.json" (
    echo  ✓ Server directory found
) else (
    echo  ✗ Server directory not found
)

echo.

REM Check if .env file exists
echo [3/5] Checking .env configuration...
if exist "server\.env" (
    echo  ✓ .env file found
    echo.
    echo Checking OPENAI_API_KEY status:
    findstr /C:"OPENAI_API_KEY=" server\.env >nul
    if %errorlevel% equ 0 (
        for /f "delims=" %%A in ('findstr "OPENAI_API_KEY=" server\.env') do echo   %%A
        echo.
        echo  ⚠ If key is incomplete (sk-...TOQA), replace it with full key from https://platform.openai.com/api/keys
    ) else (
        echo  ✗ OPENAI_API_KEY not found in .env
    )
) else (
    echo  ✗ .env file not found
)

echo.

REM Check if client directory exists
echo [4/5] Checking client directory...
if exist "client\src\components\AIAssistant.jsx" (
    echo  ✓ Frontend AI component found
) else (
    echo  ✗ Frontend AI component not found
)

echo.

REM Summary
echo [5/5] Setup Summary
echo.
echo Next Steps:
echo 1. Get OpenAI API Key: https://platform.openai.com/api/keys
echo 2. Update server\.env with your key
echo 3. Run: cd server ^& npm install
echo 4. Run: npm start
echo 5. In new terminal: cd client ^& npm install
echo 6. Run: npm run dev
echo 7. Open http://localhost:5173

echo.
echo ============================================
echo Read AI_ASSISTANT_SETUP_GUIDE.md for details
echo ============================================
echo.
pause
