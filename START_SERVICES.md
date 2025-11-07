# 🚀 快速启动服务

## Windows 系统（PowerShell）

### 方法1: 使用两个终端窗口

**终端1 - 启动后端**：
```powershell
cd E:\Code\jianli-main\apps\api
python -m uvicorn app.main:app --reload --port 8000
```

**终端2 - 启动前端**：
```powershell
cd E:\Code\jianli-main\apps\web
pnpm dev
```

### 方法2: 使用启动脚本（推荐）

创建 `start.ps1` 脚本：

```powershell
# 保存为 E:\Code\jianli-main\start.ps1

# 启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\Code\jianli-main\apps\api; python -m uvicorn app.main:app --reload --port 8000"

# 等待2秒
Start-Sleep -Seconds 2

# 启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\Code\jianli-main\apps\web; pnpm dev"

Write-Host "服务启动中..."
Write-Host "后端: http://localhost:8000/docs"
Write-Host "前端: http://localhost:3000"
```

然后右键点击 `start.ps1` → **使用PowerShell运行**

---

## 验证服务

等待约10秒后：

1. **后端服务**：访问 http://localhost:8000/docs
   - 应该看到FastAPI的Swagger文档

2. **前端服务**：访问 http://localhost:3000
   - 应该看到简历优化平台主页

---

## 停止服务

在各个终端窗口按 `Ctrl + C` 停止服务

---

## 测试连接

打开 http://localhost:3000，按 F12 打开控制台，输入：

```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(data => console.log('后端状态:', data))
```

应该看到：
```json
{
  "status": "ok",
  "ocrGateway": false,
  "adapters": {...}
}
```

