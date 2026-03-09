@echo off
setlocal
title VK SPINE SETUP

echo ==========================================
echo    VK SPINE STOK - MINIMAL SETUP
echo ==========================================
echo.

:: Get current directory
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

echo [INFO] Working Directory: %CD%

:: 1. Check Node.js
echo [1/5] Checking Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. 
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js is installed.

:: 2. Check Git (Optional)
echo [2/5] Checking Git...
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [SKIP] Git not found. Skipping auto-updates.
) else (
    echo [OK] Git is installed.
)

:: 3. Install Dependencies
echo [3/5] Installing packages...
echo This might take a few minutes. Please wait...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed. Check your internet connection.
    pause
    exit /b 1
)
echo [OK] Packages installed.

:: 4. Database Setup
echo [4/5] Setting up database...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma generate failed.
    pause
    exit /b 1
)

call npx prisma db push --accept-data-loss
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Database push failed.
    pause
    exit /b 1
)
echo [OK] Database is ready.

:: 5. Seed and Start
echo [5/5] Starting application...
call npx prisma db seed >nul 2>&1

echo.
echo ==========================================
echo    SUCCESS! Opening browser...
echo ==========================================
echo.

start http://localhost:3000
npm run dev

pause
