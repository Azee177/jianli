# 🔧 快速修复指南 - 虚拟环境依赖问题

## 问题：启动后端时报错 `python-multipart` 未安装

## ✅ 解决方案

### 步骤1: 激活虚拟环境并安装依赖

在后端目录打开 PowerShell，执行：

```powershell
# 进入后端目录
cd E:\Code\jianli-main\apps\api

# 激活虚拟环境
.\.venv\Scripts\activate

# 安装缺失的依赖
pip install python-multipart

# （可选）安装所有依赖
pip install -r requirements.txt
```

### 步骤2: 重新启动后端服务

虚拟环境激活后，启动服务：

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

---

## 📋 完整的启动流程（推荐）

### 方法1: 手动启动（每个窗口单独操作）

**终端1 - 后端**：
```powershell
cd E:\Code\jianli-main\apps\api
.\.venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

**终端2 - 前端**：
```powershell
cd E:\Code\jianli-main\apps\web
pnpm dev
```

### 方法2: 使用更新后的启动脚本

直接运行项目根目录的 `start.ps1`（已更新支持虚拟环境）

---

## 🎯 验证安装成功

### 1. 检查虚拟环境

```powershell
# 激活虚拟环境
cd E:\Code\jianli-main\apps\api
.\.venv\Scripts\activate

# 检查 python-multipart 是否安装
pip list | findstr multipart
```

应该看到：
```
python-multipart    0.0.9
```

### 2. 启动服务测试

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

成功输出：
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process [xxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3. 浏览器验证

访问：http://localhost:8000/docs

应该看到 Swagger API 文档界面

---

## 📦 完整依赖列表

如果想确保所有依赖都安装，可以运行：

```powershell
# 激活虚拟环境
.\.venv\Scripts\activate

# 安装所有依赖
pip install -r requirements.txt

# 可选：安装 PDF 处理支持
pip install pymupdf
```

---

## ⚠️ 常见问题

### Q1: 虚拟环境激活失败

**症状**：提示"无法加载文件，因为在此系统上禁止运行脚本"

**解决方案**：
```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: pip 命令找不到

**症状**：`pip: command not found`

**解决方案**：
```powershell
# 确保虚拟环境已激活
.\.venv\Scripts\activate

# 检查 Python 路径
which python

# 应该显示虚拟环境路径，如：
# E:\Code\jianli-main\apps\api\.venv\Scripts\python.exe
```

### Q3: 端口被占用

**症状**：`Address already in use: ('127.0.0.1', 8000)`

**解决方案**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :8000

# 结束进程（替换 PID 为实际进程ID）
taskkill /PID <PID> /F

# 或者使用其他端口
python -m uvicorn app.main:app --reload --port 8001
```

---

## 🚀 下次启动

以后每次启动，只需要在两个终端执行：

**终端1（后端）**：
```powershell
cd E:\Code\jianli-main\apps\api
.\.venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

**终端2（前端）**：
```powershell
cd E:\Code\jianli-main\apps\web
pnpm dev
```

或者直接双击运行 `start.ps1`（已更新支持虚拟环境）

---

## ✅ 成功标志

后端启动成功后，您应该能够：

1. ✅ 访问 http://localhost:8000/docs 看到 API 文档
2. ✅ 访问 http://localhost:8000/health 返回健康状态
3. ✅ 前端可以成功连接后端上传简历




