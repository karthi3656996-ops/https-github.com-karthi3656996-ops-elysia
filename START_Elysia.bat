@echo off
title Elysia - AI Sign Language Translator
echo ===================================================
echo      Elysia - AI Sign Language Translator
echo      A Accessibility Web Application
echo ===================================================
echo.
echo Starting local web server...
cd /d "e:\Elysia project\Elysia"
if not exist ".venv" (
    echo [ERROR] Virtual environment not found. Please run the setup first.
    pause
    exit /b
)
echo Activating virtual environment...
call .venv\Scripts\activate
echo Launching Streamlit...
streamlit run app.py
pause
