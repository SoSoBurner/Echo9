@echo off
title Echo 9
cd /d "%~dp0game"

where npm >nul 2>nul
if errorlevel 1 (
  echo [Echo 9] Node.js was not found. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [Echo 9] First run - installing dependencies. This can take a minute...
  call npm install
  if errorlevel 1 (
    echo [Echo 9] Dependency install failed. See the messages above.
    pause
    exit /b 1
  )
)

echo [Echo 9] Building and launching... your browser will open automatically.
echo [Echo 9] Leave this window open while playing. Close it (or press Ctrl-C) to stop.
call npm run play
if errorlevel 1 (
  echo [Echo 9] Launch failed. See the messages above.
  pause
)
