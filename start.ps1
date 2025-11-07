# 简历优化平台 - 服务启动脚本
# 使用方法: 右键点击此文件 -> 使用PowerShell运行

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  简历优化平台 - 启动服务" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 启动后端服务
Write-Host "[1/2] 启动后端服务 (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\apps\api'; " + `
    "Write-Host '后端服务启动中...' -ForegroundColor Green; " + `
    "Write-Host '激活虚拟环境...' -ForegroundColor Gray; " + `
    ".venv\Scripts\activate; " + `
    "python -m uvicorn app.main:app --reload --port 8000"

# 等待后端启动
Write-Host "      等待后端初始化..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 启动前端服务  
Write-Host "[2/2] 启动前端服务 (Next.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\apps\web'; " + `
    "Write-Host '前端服务启动中...' -ForegroundColor Green; " + `
    "pnpm dev"

# 显示访问地址
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  服务启动完成!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  后端 API:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  前端页面:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  详细测试指南: FRONTEND_TEST_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

