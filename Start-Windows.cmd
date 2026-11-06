@echo off
cd /d "%~dp0"

call scripts\find-node.cmd

if not defined NODE (
  echo.
  echo  A supported Node.js LTS version is required but was not found.
  echo  Install Node.js 22, 24 or 26 from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if exist .env (
  "%NODE%" --env-file=.env scripts\launch.mjs %*
) else (
  "%NODE%" scripts\launch.mjs %*
)

echo.
pause
