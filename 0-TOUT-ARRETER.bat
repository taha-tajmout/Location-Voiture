@echo off
title Mehdi Luxury Cars - Arret des serveurs
echo ============================================
echo   Liberation des ports 8080 et 5173
echo ============================================
echo.

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo Arret du backend ^(PID %%P^)...
    taskkill /PID %%P /F >nul 2>&1
)

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Arret du site ^(PID %%P^)...
    taskkill /PID %%P /F >nul 2>&1
)

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5174" ^| findstr "LISTENING"') do (
    echo Arret d'un site en double ^(PID %%P^)...
    taskkill /PID %%P /F >nul 2>&1
)

echo.
echo Termine. Vous pouvez relancer 1-DEMARRER-BACKEND.bat
echo.
pause
