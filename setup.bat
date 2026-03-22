@echo off
title ShopSmart AI — Setup
echo =============================================
echo  ShopSmart AI — Project Setup
echo =============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.10+ first.
    pause
    exit /b 1
)

echo [1/4] Creating virtual environment at project root...
python -m venv .venv
call .venv\Scripts\activate.bat

echo.
echo [2/4] Installing backend dependencies...
pip install -r backend\requirements-backend.txt

echo.
echo [3/4] Installing frontend dependencies...
pip install -r frontend\requirements-frontend.txt

echo.
echo [4/4] Initialising Reflex (from frontend/)...
cd /d "%~dp0frontend"
reflex init
cd /d "%~dp0"

echo.
echo =============================================
echo  Setup complete!
echo =============================================
echo.
echo  NEXT STEPS — open TWO terminals:
echo.
echo  Terminal 1 (Backend):   start-backend.bat
echo  Terminal 2 (Frontend):  start-frontend.bat
echo.
echo  Backend  : http://localhost:8000/docs
echo  Frontend : http://localhost:3000
echo.
pause
