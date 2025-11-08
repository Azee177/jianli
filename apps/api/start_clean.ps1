# 清理并启动后端服务器
Write-Host "正在清理8000端口..." -ForegroundColor Yellow

# 杀掉所有Python进程
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 检查端口
Write-Host "检查8000端口状态..." -ForegroundColor Yellow
netstat -ano | findstr :8000

Write-Host "`n准备启动后端..." -ForegroundColor Green
Write-Host "请在新终端执行以下命令:" -ForegroundColor Cyan
Write-Host "`ncd E:\Code\jianli-main\apps\api" -ForegroundColor White
Write-Host ".venv\Scripts\activate" -ForegroundColor White
Write-Host "uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -ForegroundColor White


