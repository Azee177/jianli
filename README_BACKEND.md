# Resume Copilot 后端实现

根据 11.6.md 文档要求，实现了"契约优先 + 纵向切片"的后端架构。

## 🚀 快速开始

### 1. 启动开发服务器

```bash
cd apps/web
npm run dev
```

### 2. 测试API

访问 `http://localhost:3000/test-api` 查看API测试页面，可以完整测试整个工作流。

### 3. 主要功能

访问 `http://localhost:3000` 使用完整的UI界面，左侧选择"AI 工作流"扩展。

## 📋 API 接口

### 核心4个API

1. **POST /api/resumes** - 上传简历
2. **POST /api/jds/parse** - 解析JD  
3. **POST /api/pipelines/run** - 运行AI流水线
4. **GET /api/tasks/{id}** - 轮询任务状态

详细接口文档见 `openapi.yml`

## 🏗️ 架构设计

### 数据流程

```
上传简历 → 解析JD → 启动流水线 → 轮询结果 → 展示三件套
```

### 核心组件

- **类型定义**: `apps/web/src/lib/types.ts`
- **数据存储**: `apps/web/src/lib/store.ts` (内存Mock)
- **API路由**: `apps/web/src/app/api/*/route.ts`
- **前端Hooks**: `apps/web/src/lib/hooks.ts`
- **工作流管理**: `apps/web/src/hooks/useWorkflow.ts`

### UI组件

- **上传面板**: `UploadPanel.tsx`
- **JD解析面板**: `JDPanel.tsx`  
- **流水线控制**: `PipelinePanel.tsx`
- **面试问题**: `InterviewPanel.tsx`
- **知识推荐**: `KnowledgePanel.tsx`
- **工作流扩展**: `WorkflowExtension.tsx`

## 🔄 工作流状态

### 任务状态

- `queued` - 排队中
- `running` - 处理中  
- `done` - 完成
- `error` - 失败

### 输出结果

每个任务完成后产出三件套：

1. **简历草稿** (`resume_md`) - 优化后的Markdown格式简历
2. **面试问题** (`interview_questions`) - 针对性面试题列表
3. **知识点推荐** (`knowledge_items`) - 学习资源推荐

## 🛠️ 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **状态管理**: React Hooks + SWR
- **数据验证**: Zod
- **API**: Next.js API Routes
- **存储**: 内存Mock (可扩展至数据库)

## 📊 Mock数据特性

当前使用内存Mock实现，包含：

- 智能技能提取 (支持中英文技能识别)
- JD公司识别 (腾讯、字节等)
- 模拟异步处理 (1-2秒延迟)
- 成本和耗时统计
- 丰富的输出内容

## 🔧 扩展指南

### 替换为真实后端

1. **数据库**: 使用 `prisma/schema.prisma` 中的模型
2. **LLM服务**: 实现 `apps/web/src/lib/llm.ts` 中的Provider
3. **任务队列**: 集成Redis + BullMQ
4. **文件存储**: 集成OSS/S3

### 添加新功能

1. 在 `types.ts` 中定义新的数据结构
2. 在 `store.ts` 中添加Mock逻辑
3. 创建对应的API路由
4. 更新前端组件

## 🧪 测试

### API测试

```bash
# 上传简历
curl -X POST http://localhost:3000/api/resumes \
  -H "Content-Type: application/json" \
  -d '{"text":"张三简历内容..."}'

# 解析JD  
curl -X POST http://localhost:3000/api/jds/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"腾讯产品经理JD..."}'

# 运行流水线
curl -X POST http://localhost:3000/api/pipelines/run \
  -H "Content-Type: application/json" \
  -d '{"resume_id":"r_xxx","jd_id":"j_xxx"}'

# 查询任务
curl http://localhost:3000/api/tasks/t_xxx
```

### 前端测试

访问 `/test-api` 页面进行完整的端到端测试。

## 📈 性能优化

- SWR自动轮询任务状态
- 组件级错误边界
- 防抖输入处理
- 并行API调用

## 🔒 安全考虑

- 输入验证 (Zod schemas)
- 错误处理和用户友好提示
- 文件类型限制
- API速率限制 (待实现)

## 📝 下一步计划

1. **持久化存储** - 集成PostgreSQL + Prisma
2. **真实LLM** - 接入Qwen/DeepSeek API
3. **任务队列** - Redis + BullMQ异步处理
4. **文件处理** - PDF解析和OCR
5. **用户系统** - 完善认证和权限
6. **监控告警** - Sentry + 日志系统

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

遵循现有的代码风格和组件结构。