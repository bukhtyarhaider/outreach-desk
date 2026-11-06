@echo off
:: Find a supported Node.js LTS (22, 24 or 26) and set NODE=path
set "NODE="
set "_NM="

:: 1. Check node on PATH
where node >nul 2>nul
if errorlevel 1 goto :_fn_nvm

for /f %%v in ('node -e "console.log(parseInt(process.versions.node))" 2^>nul') do set "_NM=%%v"
if "%_NM%"=="22" set "NODE=node"
if "%_NM%"=="24" set "NODE=node"
if "%_NM%"=="26" set "NODE=node"
if defined NODE goto :_fn_done

:_fn_nvm
:: 2. Check nvm-windows installed versions
if not exist "%APPDATA%\nvm" goto :_fn_prog
for /d %%d in ("%APPDATA%\nvm\v22.*") do if exist "%%d\node.exe" set "NODE=%%d\node.exe"& set "PATH=%%~d;%PATH%"
if defined NODE goto :_fn_done
for /d %%d in ("%APPDATA%\nvm\v24.*") do if exist "%%d\node.exe" set "NODE=%%d\node.exe"& set "PATH=%%~d;%PATH%"
if defined NODE goto :_fn_done
for /d %%d in ("%APPDATA%\nvm\v26.*") do if exist "%%d\node.exe" set "NODE=%%d\node.exe"& set "PATH=%%~d;%PATH%"
if defined NODE goto :_fn_done

:_fn_prog
:: 3. Check standard install location
if not exist "%ProgramFiles%\nodejs\node.exe" goto :_fn_done
for /f %%v in ('"%ProgramFiles%\nodejs\node.exe" -e "console.log(parseInt(process.versions.node))" 2^>nul') do set "_NM=%%v"
if "%_NM%"=="22" set "NODE=%ProgramFiles%\nodejs\node.exe"& set "PATH=%ProgramFiles%\nodejs;%PATH%"
if "%_NM%"=="24" set "NODE=%ProgramFiles%\nodejs\node.exe"& set "PATH=%ProgramFiles%\nodejs;%PATH%"
if "%_NM%"=="26" set "NODE=%ProgramFiles%\nodejs\node.exe"& set "PATH=%ProgramFiles%\nodejs;%PATH%"

:_fn_done
set "_NM="

