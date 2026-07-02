@echo off
REM Echo9 — one-click launcher for Windows (Chrome-safe).
REM Builds the production bundle, starts vite preview on http://localhost:4173,
REM and opens your default browser to the game. Ctrl-C to stop.
REM
REM Works with Chrome because it serves over HTTP, sidestepping the file://
REM ES-module CORS block that would blank the page if you double-clicked
REM Echo9\index.html or game\dist\index.html directly.

cd /d "%~dp0game"
if errorlevel 1 (
  echo [play] cannot find game\ subfolder next to this launcher.
  pause
  exit /b 1
)

call npm run play

REM Keep the window open if npm errored, so the user can see the message.
if errorlevel 1 (
  echo.
  echo [play] npm run play exited with an error. Press any key to close.
  pause
)
