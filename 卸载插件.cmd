@echo off
setlocal EnableExtensions
chcp 65001 >nul
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"

py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)" >nul 2>&1
if errorlevel 1 goto try_python
py -3 "%~dp0install.py" --language zh --uninstall %*
goto finish

:try_python
python -c "import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)" >nul 2>&1
if errorlevel 1 goto missing_python
python "%~dp0install.py" --language zh --uninstall %*
goto finish

:missing_python
echo Python 3.9 or later is required.
echo Install Python from https://www.python.org/downloads/windows/
echo Enable the Python launcher or "Add Python to PATH", then run this file again.
set "INSTALLER_EXIT_CODE=1"
goto close_window

:finish
set "INSTALLER_EXIT_CODE=%ERRORLEVEL%"
if not "%INSTALLER_EXIT_CODE%"=="0" echo Installer failed. Review the error above.

:close_window
echo.
echo Press any key to close this window.
pause >nul
exit /b %INSTALLER_EXIT_CODE%
