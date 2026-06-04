@echo off
echo ========================================
echo   SerialFac CRM - Starting Server
echo ========================================
echo.
echo   เข้าใช้งานได้ที่:
echo   http://192.168.212.109:3001
echo.
echo   กด Ctrl+C เพื่อหยุด server
echo ========================================
echo.
cd /d "%~dp0backend"
node server.js
pause
