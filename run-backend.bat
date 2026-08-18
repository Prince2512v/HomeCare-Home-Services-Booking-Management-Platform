@echo off
title HomeCare Backend (.NET API)
echo ==========================================
echo   Starting HomeCare Backend API...
echo   URL: http://localhost:5100
echo ==========================================
echo.
cd /d "%~dp0backend"
dotnet run
pause
