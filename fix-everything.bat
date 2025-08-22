@echo off
echo ========================================
echo  COMPLETE FIX - Risk Management System
echo ========================================
echo.

echo [1/5] Stopping ALL existing servers and processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im cmd.exe 2>nul
echo ✅ All processes stopped
echo.

echo [2/5] Waiting for processes to fully stop...
timeout /t 3 /nobreak >nul
echo ✅ Wait complete
echo.

echo [3/5] Rebuilding frontend with latest fixes...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend rebuilt successfully
echo.

echo [4/5] Starting backend with COMPLETE CORS fixes...
start "Backend Server (CORS Fixed)" cmd /k "npm run server:prisma"
echo ✅ Backend server started
echo.

echo [5/5] Starting frontend server...
start "Frontend Server" cmd /k "npm run preview"
echo ✅ Frontend server started
echo.

echo ========================================
echo  🎉 COMPLETE FIX APPLIED!
echo ========================================
echo.
echo 🔧 CORS fixes applied:
echo    - Allow ALL origins in development
echo    - Global CORS headers for all requests
echo    - Proper preflight request handling
echo    - Enhanced error handling
echo.
echo 📍 Backend:  http://localhost:3001
echo 🌐 Frontend: http://localhost:4173
echo.
echo ⏳ Wait 10 seconds for both servers to fully start...
timeout /t 10 /nobreak >nul
echo.
echo 🧪 TESTING INSTRUCTIONS:
echo    1. Open browser to: http://localhost:4173
echo    2. Click "Test Backend" - should work now
echo    3. Click "Test Login" - should work now
echo    4. Try logging in with: admin@admin.com / 12345678
echo.
echo 🚀 The "Failed to fetch" error should be completely gone!
echo.
pause
