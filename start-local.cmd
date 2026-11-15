@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer from https://nodejs.org and try again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection.
    pause
    exit /b 1
  )
)
echo Open http://localhost:3020 after the terminal says Ready.
echo Keep this window open. Press Ctrl+C to stop.
call node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3020
pause
