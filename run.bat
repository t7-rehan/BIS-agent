@echo off
echo ============================================
echo  BIS Agent - Startup Script
echo ============================================
echo.

REM Step 1: Install frontend dependencies if needed
echo [1/3] Checking frontend dependencies...
cd /d "%~dp0Frontend"
if not exist "node_modules\vite\package.json" (
    echo     Installing npm packages - this may take a minute...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed. Exiting.
        pause
        exit /b 1
    )
) else (
    echo     node_modules already present.
)

REM Step 2: Start frontend dev server in a new window
echo.
echo [2/3] Starting frontend dev server in new window...
start "BIS Frontend - localhost:5173" cmd /k "cd /d "%~dp0Frontend" && npm run dev"

REM Step 3: Start backend
echo.
echo [3/3] Starting backend server...
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat

echo.
echo ============================================
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:5173
echo  API Docs : http://localhost:8000/docs
echo  Press Ctrl+C to stop the backend.
echo ============================================
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
