@echo off
echo ========================================
echo    启动简历助手后端服务器
echo ========================================
echo.
echo Conda环境: jianli
echo 端口: 8000
echo.

cd /d "%~dp0"

echo 正在启动服务器...
echo.
E:\anaconda\envs\jianli\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

echo.
echo 服务器已停止
pause

