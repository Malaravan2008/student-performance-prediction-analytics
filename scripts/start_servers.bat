@echo off
echo ===================================================================
echo Starting Student Performance Prediction Analytics Platform
echo ===================================================================

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\Python\Python313;%PATH%"

start "EduPredict Backend (FastAPI)" cmd /k "cd /d %~dp0\.. && py -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"
start "EduPredict Frontend (React)" cmd /k "cd /d %~dp0\..\frontend && npm run dev"

echo.
echo Servers launched!
echo - FastAPI Backend: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo - React Dashboard: http://localhost:3000
echo.
echo Demo Credentials: teacher@example.com / teacher123
echo ===================================================================
