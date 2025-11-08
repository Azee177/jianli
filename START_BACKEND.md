# 🚀 后端重启指南

## ⚠️ 问题原因

端口8000有旧连接残留，导致新请求卡住。

## ✅ 解决方案

### 方案1: 使用新端口（推荐）

```powershell
cd apps/api
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

然后更新前端环境变量：
```bash
# 在 apps/web 目录创建 .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8001
```

### 方案2: 等待旧连接释放

```powershell
# 1. 停止所有Python进程
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. 等待30秒让TCP连接完全释放
Start-Sleep -Seconds 30

# 3. 重新启动
cd apps/api
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 方案3: 重启电脑（彻底清理）

最简单但需要时间的方法。

## 🎯 推荐步骤（使用8001端口）

1. **启动后端**（新终端）：
```powershell
cd E:\Code\jianli-main\apps\api
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

2. **配置前端**：
在 `apps/web` 目录创建 `.env.local` 文件：
```
NEXT_PUBLIC_API_BASE=http://localhost:8001
```

3. **重启前端**：
```bash
cd apps/web
npm run dev
```

## ✔️ 验证

启动后应该看到：
```
INFO: Uvicorn running on http://127.0.0.1:8001
INFO: LLM服务初始化完成，默认提供者: qwen
INFO: Qwen API key已配置: sk-e...ebf7
INFO: Application startup complete
```

测试健康检查：
```powershell
curl http://127.0.0.1:8001/health
```

## 🔍 端口检查命令

查看端口占用：
```powershell
netstat -ano | findstr :8001
```

杀掉指定进程：
```powershell
taskkill /F /PID <进程ID>
```


