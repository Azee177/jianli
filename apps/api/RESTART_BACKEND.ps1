# 清理缓存并重启后端
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "后端重启脚本" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. 停止所有Python进程
Write-Host "`n[1/4] 停止旧的后端进程..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*jianli-main*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. 清理Python缓存
Write-Host "[2/4] 清理Python缓存..." -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force

# 3. 检查端口
Write-Host "[3/4] 检查8000端口..." -ForegroundColor Yellow
$port8000 = netstat -ano | findstr :8000 | findstr LISTENING
if ($port8000) {
    Write-Host "端口8000仍被占用，正在清理..." -ForegroundColor Red
    $port8000 | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            taskkill /F /PID $matches[1] 2>$null
        }
    }
    Start-Sleep -Seconds 2
}

# 4. 启动后端
Write-Host "[4/4] 启动后端服务器..." -ForegroundColor Green
Write-Host "`n请确保你在 apps\api 目录下！`n" -ForegroundColor Cyan

# 激活虚拟环境并启动
& .\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000


