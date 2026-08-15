@echo off
setlocal enabledelayedexpansion
title FinTrakr AI Platform Launcher

echo ============================================
echo      Starting FinTrakr AI Platform
echo ============================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%client"

echo [1/2] Launching Vite Frontend Server...
start "FinTrakr Dev Server" cmd /k "cd /d "%SCRIPT_DIR%client" && npm run dev"

echo [2/2] Opening FinTrakr in Browser...
timeout /t 4 >nul
start http://localhost:5173/landing

echo.
echo ============================================
echo FinTrakr is live at http://localhost:5173/landing
echo ============================================
echo Keep the terminal window open while using the app.
pause
