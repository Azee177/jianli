@echo off
chcp 65001 >nul
title Resume Copilot 后端服务

cd /d "%~dp0"

echo.
echo ========================================
echo   Resume Copilot 后端启动脚本
echo ========================================
echo.

python start_backend.py

pause


