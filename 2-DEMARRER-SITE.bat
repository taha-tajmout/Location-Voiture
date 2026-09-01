@echo off
title Mehdi Luxury Cars - SITE (port 5173)
cd /d "%~dp0frontend"
echo ============================================
echo   MEHDI LUXURY CARS - Site web
echo   Ne fermez PAS cette fenetre.
echo   Site  : http://localhost:5173
echo   Admin : http://localhost:5173/admin/login
echo ============================================
echo.
if not exist "node_modules" (
    echo Premiere utilisation : installation des dependances...
    call npm install
)
call npm run dev
echo.
echo Le serveur s'est arrete.
pause
