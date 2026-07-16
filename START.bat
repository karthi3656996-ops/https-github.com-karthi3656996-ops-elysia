@echo off
echo ========================================
echo     Elysia - AI Sign Language Platform
echo ========================================
echo.
echo Installing dependencies...
cd /d "e:\Elysia project\frontend"
call npm install
echo.
echo Starting Elysia dev server...
echo Open your browser at: http://localhost:5173
echo.
call npm run dev
pause
