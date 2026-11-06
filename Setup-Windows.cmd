@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install a supported Node.js LTS version (22, 24 or 26) from https://nodejs.org/, then run Setup again.
) else (
  node scripts\setup.mjs
)
pause
