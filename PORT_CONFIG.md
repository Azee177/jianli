# 端口配置统一说明

## ✅ 统一端口配置

**后端API端口**: **8000**  
**前端开发端口**: **3000**

### 为什么选择 8000？

1. ✅ **前端默认配置**: 前端代码默认连接到 `http://localhost:8000`
2. ✅ **FastAPI标准**: 8000 是 FastAPI/Python Web 服务的标准端口
3. ✅ **文档一致性**: 绝大部分项目文档使用 8000
4. ✅ **行业惯例**: Django/FastAPI 等 Python Web 框架的默认端口

## 服务访问地址

### 后端服务（端口 8000）

- 🌐 **API文档（Swagger）**: http://127.0.0.1:8000/docs
- 📖 **API文档（ReDoc）**: http://127.0.0.1:8000/redoc
- 💚 **健康检查**: http://127.0.0.1:8000/health
- 📝 **API基础路径**: http://127.0.0.1:8000

### 前端服务（端口 3000）

- 🖥️ **前端界面**: http://localhost:3000

## 启动命令

### 后端启动

```bash
# 方式1: 使用启动脚本（推荐）
cd e:\Code\jianli-main\apps\api
start_server.bat

# 方式2: 使用Python启动脚本
cd e:\Code\jianli-main\apps\api
E:\anaconda\envs\jianli\python.exe start.py

# 方式3: 直接使用uvicorn
cd e:\Code\jianli-main\apps\api
E:\anaconda\envs\jianli\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 前端启动

```bash
cd e:\Code\jianli-main\apps\web
npm run dev
```

## 前端配置

前端默认使用环境变量 `NEXT_PUBLIC_API_BASE` 来配置后端地址。

### 默认配置（无需修改）

前端代码中的默认配置：

```typescript
// apps/web/src/lib/fastapi-hooks.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
```

### 自定义配置（可选）

如需自定义后端地址，创建 `apps/web/.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## 已更新的文件

以下文件已统一使用 8000 端口：

1. ✅ `apps/api/start.py` - Python启动脚本
2. ✅ `apps/api/start_server.bat` - Windows批处理启动脚本
3. ✅ `apps/api/SETUP.md` - 配置文档
4. ✅ 当前运行的服务器 - 已在 8000 端口运行

## 端口冲突解决

### 检查端口占用

```powershell
# Windows
netstat -ano | findstr :8000

# 查看进程详情
tasklist | findstr <PID>
```

### 释放端口

```powershell
# 强制结束占用端口的进程
taskkill /F /PID <PID>
```

### 临时使用其他端口

如果 8000 端口被占用，可以临时使用其他端口：

```bash
# 设置环境变量后启动
set PORT=8001
E:\anaconda\envs\jianli\python.exe start.py

# 或直接指定端口
E:\anaconda\envs\jianli\python.exe -m uvicorn app.main:app --reload --port 8001
```

**注意**: 修改端口后需要同步更新前端配置：

```env
# apps/web/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:8001
```

## 网络配置说明

### 监听地址说明

- **127.0.0.1**: 仅本地访问（推荐用于开发）
- **0.0.0.0**: 允许外网访问（生产环境或需要局域网访问时使用）

当前配置使用 `127.0.0.1`，仅允许本地访问，更安全。

### CORS配置

后端已配置 CORS，允许以下来源访问：

- `http://localhost:3000` - 前端开发服务器
- `http://localhost:3001` - 备用前端端口

配置位置: `apps/api/app/config.py`

```python
allowed_origins: list[str] = Field(
    default=["http://localhost:3000", "http://localhost:3001"],
    validation_alias="ALLOWED_ORIGINS"
)
```

## 防火墙配置

如果遇到连接问题，请检查防火墙设置：

```powershell
# Windows Defender 防火墙
# 允许 Python 通过防火墙
# 控制面板 > Windows Defender 防火墙 > 允许应用通过防火墙
```

## 验证配置

### 1. 检查后端服务

```bash
# PowerShell
Invoke-WebRequest -Uri http://127.0.0.1:8000/health

# 或使用浏览器访问
# http://127.0.0.1:8000/docs
```

### 2. 检查前端连接

前端启动后，打开浏览器控制台（F12），查看 Network 标签：
- 应该能看到对 `http://localhost:8000` 的请求
- 请求状态应该是 200 OK

## 常见问题

### Q1: 前端无法连接后端？

**检查清单**:
1. ✅ 后端服务是否在 8000 端口运行？
2. ✅ 防火墙是否允许 8000 端口？
3. ✅ 前端的 API_BASE 配置是否正确？
4. ✅ 浏览器控制台是否有 CORS 错误？

### Q2: 端口被占用怎么办？

```powershell
# 查找占用进程
netstat -ano | findstr :8000

# 结束进程
taskkill /F /PID <进程ID>
```

### Q3: 如何同时运行多个后端实例？

使用不同的端口：

```bash
# 实例1 - 开发环境
E:\anaconda\envs\jianli\python.exe -m uvicorn app.main:app --reload --port 8000

# 实例2 - 测试环境  
E:\anaconda\envs\jianli\python.exe -m uvicorn app.main:app --reload --port 8001
```

## 生产环境建议

生产环境部署时建议：

1. 使用环境变量配置端口
2. 使用 Nginx/Caddy 作为反向代理
3. 使用标准 HTTP 端口（80/443）
4. 配置 SSL/TLS 证书

示例 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

**最后更新**: 2025-11-07  
**当前状态**: ✅ 端口已统一为 8000  
**后端运行状态**: ✅ 正在运行（http://127.0.0.1:8000）

