@echo off
title HomeCare - Launch All Services
echo ==========================================
echo   Starting ALL HomeCare Services...
echo ==========================================
echo.
echo [1/3] Launching Backend API...
start "HomeCare Backend" cmd /k "cd /d "%~dp0backend" && dotnet run"

timeout /t 3 /nobreak >nul

echo [2/3] Launching Customer App...
start "HomeCare Customer" cmd /k "cd /d "%~dp0frontend\customer" && npm start"

echo [3/3] Launching Admin App...
start "HomeCare Admin" cmd /k "cd /d "%~dp0frontend\admin" && npm start"

echo.
echo ==========================================
echo   All services launched in separate windows!
echo   Backend  : http://localhost:5100
echo   Customer : http://localhost:4300
echo   Admin    : http://localhost:4200
echo ==========================================
pause
