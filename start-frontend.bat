@echo off
title ShopSmart AI — Frontend (React + Vite)
echo =============================================
echo  ShopSmart AI — React Frontend (Port 5173)
echo =============================================
echo.
echo  App URL     : http://localhost:5173
echo  Backend     : http://localhost:8000
echo.
echo [Starting React + Vite dev server...]
echo.
cd /d "%~dp0frontend"
npm run dev
