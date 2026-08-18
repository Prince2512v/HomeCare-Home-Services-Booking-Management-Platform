@echo off
title HomeCare Customer App (Angular)
echo ==========================================
echo   Starting HomeCare Customer Frontend...
echo   URL: http://localhost:4300
echo ==========================================
echo.
cd /d "%~dp0frontend\customer"
npm start
pause
