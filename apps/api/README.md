# Resume Copilot FastAPI Backend

基于FastAPI实现的简历优化后端服务，严格遵循 `docs/testapi.md` 文档规范。

## 🚀 快速启动

### 1. 环境准备

```bash
cd apps/api

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境 (Windows)
.venv\Scripts\activate

# 激活虚拟环境 (Linux/Mac)
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 环境变量配置

创建 `.env` 文件：

```bash
# 基础配置
PORT=3002
OCR_SERVICE_BASE_URL=http://localhost:8080

# 实习僧开放平台（可选）
SHIXISENG_APP_ID=your_app_id
SHIXISENG_APP_SECRET=your_app_secret

# LLM配置（可选）
OPENAI_API_KEY=your_openai_key
QWEN_API_KEY=your_qwen_key
DEEPSEEK_API_KEY=your_deepseek_key

# 数据库（可选）
DATABASE_URL=postgresql://user:pass@localhost:5432/resume_copilot

# 对象存储（可选）
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

### 3. 启动服务

```bash
# 开发模式
uvicorn app.main:app --reload --port 3002

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 3002
```

### 4. 访问文档

- Swagger UI: http://localhost:3002/docs
- ReDoc: http://localhost:3002/redoc
- 健康检查: http://localhost:3002/health

## 📋 API接口

### 核心接口（按testapi.md规范）

1. **简历管理**
   - `POST /resumes` - 上传简历
   - `GET /resumes` - 简历列表
   - `GET /resumes/{id}` - 简历详情

2. **JD抓取与解析**
   - `POST /jd/fetch` - 抓取JD（异步）
   - `POST /jd/search` - 搜索JD
   - `GET /jd` - JD列表

3. **目标岗位**
   - `POST /targets` - 创建目标岗位
   - `GET /targets` - 目标岗位列表

4. **共性提炼**
   - `POST /jd/commonalities` - 提炼共性（异步）
   - `GET /jd/commonalities/{id}` - 获取共性结果

5. **简历优化**
   - `POST /resumes/{id}/optimize/preview` - 优化预览（异步）
   - `POST /resumes/{id}/optimize/apply` - 应用优化
   - `POST /resumes/{id}/study-plan` - 生成学习计划（异步）
   - `POST /resumes/{id}/qa` - 生成面试问答（异步）

6. **导出服务**
   - `POST /exports/pdf` - 导出PDF（异步）
   - `POST /exports/docx` - 导出DOCX（异步）

7. **上传服务**
   - `POST /uploads/presign` - 生成预签名URL
   - `POST /resumes/from-upload` - 从上传创建简历

8. **任务管理**
   - `GET /tasks/{id}` - 查询任务状态
   - `GET /tasks` - 任务列表

9. **WebSocket**
   - `WS /ws/tasks` - 任务进度推送

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────┐
│   Routes Layer  │  # FastAPI路由层
├─────────────────┤
│  Services Layer │  # 业务逻辑层
├─────────────────┤
│ Adapters Layer  │  # 外部服务适配器
├─────────────────┤
│  Storage Layer  │  # 数据存储层
└─────────────────┘
```

### 核心组件

- **Routes**: API路由定义
- **Services**: 业务逻辑实现
- **Adapters**: JD抓取适配器（实习僧/智联/51job/BOSS）
- **Store**: 数据存储（内存/数据库）
- **Schemas**: Pydantic数据模型

## 🔧 JD抓取策略

### 优先级顺序

1. **实习僧开放平台**（官方API，推荐）
2. **智联招聘**（前端JSON接口）
3. **前程无忧**（前端接口）
4. **BOSS直聘**（Playwright自动化）

### 合规说明

- 优先使用官方开放平台
- 前端接口仅作研究和备用
- 严格遵守robots.txt和服务条款
- 实现频率限制和缓存机制

## 📊 数据流程

### 典型工作流

```
1. 上传简历 → OCR解析 → 结构化存储
2. 输入目标 → 多源JD抓取 → 标准化处理
3. 共性提炼 → LLM分析 → 15条+Top5
4. 简历优化 → 基于共性改写 → 预览确认
5. 学习计划 → 知识点推荐 → B站链接
6. 面试准备 → 问答生成 → 追问树
7. 导出简历 → PDF/DOCX → 下载链接
```

## 🧪 测试

### API测试

```bash
# 健康检查
curl http://localhost:3002/health

# 上传简历
curl -X POST http://localhost:3002/resumes \
  -H "Content-Type: application/json" \
  -d '{"text":"张三简历内容..."}'

# 解析JD
curl -X POST http://localhost:3002/jd/fetch \
  -H "Content-Type: application/json" \
  -d '{"text":"腾讯产品经理JD..."}'

# 查询任务
curl http://localhost:3002/tasks/task_12345678
```

### 前端集成

前端需要更新API调用地址：

```typescript
// 从 Next.js API Routes 切换到 FastAPI
const API_BASE = 'http://localhost:3002';

// 示例调用
const response = await fetch(`${API_BASE}/resumes`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': 'demo-user'
  },
  body: JSON.stringify({ text: resumeText })
});
```

## 🚀 部署

### Docker部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 3002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3002"]
```

### 环境变量

生产环境需要配置：
- 数据库连接
- 对象存储密钥
- LLM API密钥
- JD抓取平台密钥

## 📈 扩展计划

1. **数据库集成** - PostgreSQL + SQLAlchemy
2. **任务队列** - Celery + Redis
3. **真实LLM** - OpenAI/Qwen/DeepSeek
4. **文件存储** - AWS S3/阿里云OSS
5. **监控告警** - Prometheus + Grafana
6. **API网关** - Kong/Nginx

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 遵循代码规范
4. 提交Pull Request

## 📄 许可证

MIT License