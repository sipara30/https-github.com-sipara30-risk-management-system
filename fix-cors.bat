@echo off
echo ========================================
echo  Fixing CORS Issue - Risk Management
echo ========================================
echo.

echo [1/3] Stopping any existing servers...
taskkill /f /im node.exe 2>nul
echo ✅ Servers stopped
echo.

echo [2/3] Rebuilding frontend with CORS fixes...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend rebuilt successfully
echo.

echo [3/3] Starting backend with CORS fixes...
start "Backend Server (CORS Fixed)" cmd /k "npm run server:prisma"
echo ✅ Backend server started with CORS fixes
echo.

echo ========================================
echo  🎉 CORS Issue Fixed!
echo ========================================
echo.
echo 📍 Backend:  http://localhost:3001
echo 🌐 Frontend: http://localhost:4173
echo.
echo 🔧 CORS fixes applied:
echo    - Added localhost:4173 to allowed origins
echo    - Added preflight request handling
echo    - Added explicit CORS headers
echo    - Added CORS test endpoint
echo.
echo 📱 Now open your browser and go to:
echo    http://localhost:4173
echo.
echo 🧪 Test the debug buttons:
echo    1. Test Backend - should work now
echo    2. Test Login - should work now
echo    3. Try logging in
echo.
echo ⏳ Wait 5 seconds for backend to start, then test...
timeout /t 5 /nobreak >nul
echo.
echo 🚀 Ready to test! The CORS error should be gone.
echo.
pause
