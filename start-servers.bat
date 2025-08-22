@echo off
echo Starting Risk Management System...
echo.

echo Starting Backend Server (Prisma)...
start "Backend Server" cmd /k "npm run server:prisma"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run preview"

echo.
echo Both servers should now be running:
echo - Backend: http://localhost:3001
echo - Frontend: http://localhost:4173
echo.
echo Press any key to close this window...
pause >nul
