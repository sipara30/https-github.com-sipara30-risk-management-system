@echo off
echo ========================================
echo  Risk Management System - Rebuild & Start
echo ========================================
echo.

echo [1/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
echo.

echo [2/4] Starting backend server...
start "Backend Server" cmd /k "npm run server:prisma"
echo ✅ Backend server started
echo.

echo [3/4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul
echo ✅ Backend should be ready
echo.

echo [4/4] Starting frontend server...
start "Frontend Server" cmd /k "npm run preview"
echo ✅ Frontend server started
echo.

echo ========================================
echo  🎉 Both servers are now running!
echo ========================================
echo.
echo 📍 Backend:  http://localhost:3001
echo 🌐 Frontend: http://localhost:4173
echo.
echo 🔧 Debug features added:
echo    - Test Backend button
echo    - Test Login button  
echo    - Detailed error messages
echo    - Console logging
echo.
echo 📱 Open your browser and go to:
echo    http://localhost:4173
echo.
echo 🔐 Login with: admin@admin.com / 12345678
echo.
pause
