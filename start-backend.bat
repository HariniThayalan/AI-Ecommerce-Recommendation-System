@echo off
title ShopSmart AI — Backend
echo =============================================
echo  ShopSmart AI — FastAPI Backend (Port 8001)
echo =============================================
echo.
echo  API Root    : http://localhost:8001
echo  API Docs    : http://localhost:8001/docs
echo  Redoc       : http://localhost:8001/redoc
echo.
echo  NOTE: Port 8001 used because Reflex occupies 8000
echo.
echo [Starting FastAPI server...]
echo.
cd /d "%~dp0backend"
uvicorn main:app --reload --host 0.0.0.0 --port 8001
