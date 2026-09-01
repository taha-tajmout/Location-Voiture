@echo off
title Mehdi Luxury Cars - BACKEND (port 8080)
cd /d "%~dp0backend"
echo ============================================
echo   MEHDI LUXURY CARS - Serveur backend
echo   Ne fermez PAS cette fenetre.
echo   API : http://localhost:8080
echo ============================================
echo.
call mvn spring-boot:run
echo.
echo Le serveur s'est arrete.
pause
