# 项目依赖说明

## 核心依赖（必需）

### Web框架
- **fastapi** (>=0.115.0) - 现代高性能Web框架
- **uvicorn[standard]** (>=0.30.0) - ASGI服务器，包含标准插件
- **python-multipart** (>=0.0.9) - 文件上传支持

### HTTP客户端
- **httpx** (>=0.26.0) - 异步HTTP客户端，用于API调用

### 配置管理
- **python-dotenv** (>=1.0.1) - 环境变量加载
- **pydantic** (>=2.5.0) - 数据验证和配置管理
- **pydantic-settings** (>=2.0.0) - Pydantic配置扩展

### PDF处理
- **pymupdf** (>=1.24.10) - 主要PDF解析库，性能优异
- **pdfminer.six** (>=20231228) - 备用PDF解析库

### 网页抓取
- **beautifulsoup4** (>=4.12.0) - HTML/XML解析
- **lxml** (>=4.9.0) - 高性能XML/HTML解析器

### LLM集成（智能简历解析）
- **openai** (>=1.0.0) - 通义千问API调用（使用OpenAI兼容格式）

### 模板引擎
- **jinja2** (>=3.1.0) - 简历模板渲染

### 图片处理
- **pillow** (>=10.0.0) - 图片操作和处理

## 当前已安装版本

| 包名 | 版本 | 用途 |
|-----|------|-----|
| fastapi | 0.121.0 | Web框架核心 |
| uvicorn | 0.38.0 | ASGI服务器 |
| httpx | 0.28.1 | HTTP客户端 |
| pydantic | 2.12.4 | 数据验证 |
| pydantic-settings | 2.11.0 | 配置管理 |
| pymupdf | 1.26.6 | PDF处理 |
| pdfminer.six | 20250506 | PDF备用处理 |
| beautifulsoup4 | 4.14.2 | HTML解析 |
| lxml | 6.0.2 | XML/HTML解析 |
| openai | 2.7.1 | LLM API调用 |
| jinja2 | 3.1.6 | 模板引擎 |
| pillow | 12.0.0 | 图片处理 |
| python-dotenv | 1.2.1 | 环境变量 |

## 自动安装的依赖

以下是上述包自动安装的依赖项：

- **starlette** (0.49.3) - FastAPI底层框架
- **httpcore** (1.0.9) - httpx底层核心
- **h11** (0.16.0) - HTTP/1.1协议实现
- **anyio** (4.11.0) - 异步IO抽象层
- **sniffio** (1.3.1) - 异步库检测
- **idna** (3.11) - 国际化域名支持
- **certifi** (2025.10.5) - SSL证书
- **click** (8.3.0) - 命令行工具
- **colorama** (0.4.6) - 终端颜色支持
- **watchfiles** (1.1.1) - 文件监控（热重载）
- **websockets** (15.0.1) - WebSocket支持
- **pyyaml** (6.0.3) - YAML配置支持
- **cryptography** (46.0.3) - 加密功能
- **typing-extensions** (4.15.0) - 类型提示扩展
- **markupsafe** (3.0.3) - Jinja2安全标记
- **soupsieve** (2.8) - CSS选择器（BeautifulSoup）
- **tqdm** (4.67.1) - 进度条（OpenAI SDK）
- **distro** (1.9.0) - Linux发行版信息
- **jiter** (0.11.1) - JSON迭代器

## 可选依赖（未安装）

### 浏览器自动化
```bash
pip install playwright>=1.40.0
playwright install chromium  # 安装浏览器
```
用于BOSS直聘等需要JavaScript渲染的网站抓取

### PDF导出
```bash
pip install weasyprint>=60.0
```
用于将HTML简历导出为PDF

### DOCX导出
```bash
pip install python-docx>=1.1.0
```
用于生成Word格式简历

### 任务队列
```bash
pip install celery>=5.3.0 redis>=5.0.0
```
用于异步任务处理（如批量简历解析）

### 数据库支持
```bash
# PostgreSQL
pip install sqlalchemy>=2.0.0 alembic>=1.13.0 psycopg2-binary>=2.9.0

# MongoDB
pip install pymongo>=4.0.0
```
用于持久化存储（当前使用内存存储）

### 其他LLM提供商
```bash
pip install anthropic>=0.7.0  # Claude
```

## 安装指南

### 完整安装（推荐）
```bash
# 使用conda环境
E:\anaconda\Scripts\conda.exe run -n jianli pip install -r requirements.txt
```

### 最小安装
如果只需要基础功能，可以只安装必需依赖：
```bash
pip install fastapi uvicorn[standard] python-multipart httpx python-dotenv pydantic pydantic-settings
```

### 添加可选功能
```bash
# 添加浏览器自动化
pip install playwright
playwright install chromium

# 添加PDF导出
pip install weasyprint

# 添加DOCX导出
pip install python-docx
```

## 依赖更新

### 检查过期包
```bash
E:\anaconda\Scripts\conda.exe run -n jianli pip list --outdated
```

### 更新所有包
```bash
E:\anaconda\Scripts\conda.exe run -n jianli pip install --upgrade -r requirements.txt
```

### 更新特定包
```bash
E:\anaconda\Scripts\conda.exe run -n jianli pip install --upgrade <package_name>
```

## 版本锁定

当前 `requirements.txt` 使用 `>=` 允许安装更新版本。

如需锁定版本（生产环境推荐）：
```bash
# 生成精确版本
E:\anaconda\Scripts\conda.exe run -n jianli pip freeze > requirements-lock.txt
```

## 常见问题

### Q1: 为什么不使用 poetry 或 pipenv？
A: 为了简化配置，项目使用传统的 requirements.txt + conda。如有需要可以转换。

### Q2: 如何处理依赖冲突？
```bash
# 使用 pip-tools
pip install pip-tools
pip-compile requirements.txt
pip-sync requirements.txt
```

### Q3: Windows上安装失败怎么办？
某些包（如 lxml）需要编译，建议：
1. 使用conda安装：`conda install lxml`
2. 或下载预编译wheel：https://www.lfd.uci.edu/~gohlke/pythonlibs/

### Q4: 如何减小部署体积？
生产环境可以移除开发工具：
```bash
# 移除 watchfiles（热重载）
pip uninstall watchfiles

# 使用 --no-reload 启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## LLM API配置

### 通义千问（当前使用）
```env
QWEN_API_KEY=sk-your-api-key
DEFAULT_LLM_PROVIDER=qwen
```

### DeepSeek（可选）
```env
DEEPSEEK_API_KEY=sk-your-api-key
DEFAULT_LLM_PROVIDER=deepseek
```

### OpenAI（可选）
```env
OPENAI_API_KEY=sk-your-api-key
DEFAULT_LLM_PROVIDER=openai
```

## 性能优化建议

### 生产环境
1. 使用 `uvicorn` workers：
```bash
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

2. 使用 `gunicorn` + `uvicorn`:
```bash
pip install gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 内存优化
- 使用 Redis 缓存简历解析结果
- 实现简历数据的分页加载
- 定期清理过期数据

### 并发优化
- 使用 `httpx` 异步调用外部API
- LLM调用使用批处理
- 文件上传使用流式处理

---

**环境**: Conda (jianli)  
**Python**: 3.11.14  
**最后更新**: 2025-11-08

