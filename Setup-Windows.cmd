@echo off
cd /d "%~dp0"

call scripts\find-node.cmd

if not defined NODE (
  echo.
  echo  A supported Node.js LTS version is required but was not found.
  echo  Install Node.js 22, 24 or 26 from https://nodejs.org/
  echo  Then run Setup again.
  echo.
  pause
  exit /b 1
)

"%NODE%" scripts\setup.mjs

echo.
pause
