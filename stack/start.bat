@echo off
echo 🚀 Starting SIH 2025 Dropout Prediction System
echo ================================================

echo.
echo 📊 Starting ML Backend Server...
start "ML Backend" cmd /c "cd backend && python app.py"

echo.
echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting React Frontend...
start "React Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ✅ Both services are starting!
echo.
echo 🌐 Open in browser:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Press any key to continue...
pause >nul