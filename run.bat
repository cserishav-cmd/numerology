@echo off
title Numerology O Fortune Server
echo ========================================================
echo   Starting Numerology O Fortune Server
echo ========================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

REM Create virtual environment if it does not exist
if not exist .venv (
    echo [*] Creating virtual environment (.venv)...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Install dependencies
echo [*] Installing/Verifying dependencies from requirements.txt...
pip install -r requirements.txt --quiet

echo.
echo ========================================================
echo   Server is running at: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ========================================================
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
pause
