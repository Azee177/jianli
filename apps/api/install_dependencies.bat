@echo off
echo ========================================
echo    安装项目依赖
echo ========================================
echo.
echo Conda环境: jianli
echo.

cd /d "%~dp0"

echo 正在安装依赖包...
echo.

E:\anaconda\Scripts\conda.exe run -n jianli pip install -r requirements.txt

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo [成功] 依赖安装完成！
    echo.
    echo 已安装的包:
    E:\anaconda\Scripts\conda.exe run -n jianli pip list
) else (
    echo [失败] 依赖安装出错！
    echo 请检查错误信息
)
echo ========================================
echo.

pause

