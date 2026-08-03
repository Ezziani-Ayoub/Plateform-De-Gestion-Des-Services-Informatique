@echo off
echo ===================================================
echo   Lancement de PGSI (Backend + Frontend)
echo ===================================================
echo.
echo 1. Lancement du Backend Spring Boot (Java 21)...
start "PGSI Backend" cmd /k "%~dp0backend\run-backend.bat"

echo 2. Lancement du Frontend React (Vite)...
start "PGSI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Les deux serveurs ont ete lances !
echo - Backend  : http://localhost:8080
echo - Frontend : http://localhost:3000
echo ===================================================
