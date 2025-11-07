# API 迁移计划：从 Next.js Routes 到 NestJS

## 🎯 迁移策略

### 阶段1: 当前状态 (已完成)
- ✅ Next.js API Routes 实现核心功能
- ✅ 内存Mock数据
- ✅ 完整的前端集成
- ✅ API契约定义 (OpenAPI)

### 阶段2: NestJS 后端实现 (1-2周)
```bash
# 1. 更新 NestJS 服务
cd apps/api

# 2. 安装依赖
npm install @prisma/client prisma zod class-validator class-transformer

# 3. 实现真实的业务逻辑
```

### 阶段3: 数据库集成 (1周)
```bash
# 1. 初始化 Prisma
npx prisma init
npx prisma db push
npx prisma generate

# 2. 数据迁移
npx prisma db seed
```

### 阶段4: 渐进式切换 (1周)
```typescript
// apps/web/src/app/api/resumes/route.ts
export async function POST(req: NextRequest) {
  if (process.env.USE_NESTJS_API === 'true') {
    // 代理到 NestJS 服务
    return fetch(`${process.env.API_BASE_URL}/resumes`, {
      method: 'POST',
      headers: req.headers,
      body: req.body
    });
  } else {
    // 继续使用 Mock
    return handleMockRequest(req);
  }
}
```

## 📁 NestJS 实现示例

### 1. Resume Controller
```typescript
// apps/api/src/modules/resume/resume.controller.ts
@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { text?: string }
  ) {
    const resume = await this.resumeService.create({
      file,
      text: body.text
    });
    return resume;
  }
}
```

### 2. Resume Service
```typescript
// apps/api/src/modules/resume/resume.service.ts
@Injectable()
export class ResumeService {
  constructor(
    private prisma: PrismaService,
    private llmService: LLMService
  ) {}

  async create(input: CreateResumeInput): Promise<Resume> {
    const rawText = input.file 
      ? await this.extractTextFromFile(input.file)
      : input.text;

    const skills = await this.extractSkills(rawText);
    const contacts = await this.extractContacts(rawText);

    return this.prisma.resume.create({
      data: {
        rawText,
        skills,
        contactsJson: JSON.stringify(contacts),
        userId: input.userId
      }
    });
  }

  private async extractSkills(text: string): Promise<string[]> {
    // 使用 LLM 提取技能
    const result = await this.llmService.call({
      system: "提取简历中的技能关键词",
      prompt: text,
      model: 'qwen'
    });
    return JSON.parse(result.text);
  }
}
```

### 3. Pipeline Service
```typescript
// apps/api/src/modules/pipeline/pipeline.service.ts
@Injectable()
export class PipelineService {
  constructor(
    private prisma: PrismaService,
    private llmService: LLMService,
    private queueService: QueueService
  ) {}

  async run(resumeId: string, jdId: string): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        resumeId,
        jdId,
        status: 'QUEUED',
        userId: 'current-user-id'
      }
    });

    // 添加到异步队列
    await this.queueService.add('process-resume', {
      taskId: task.id,
      resumeId,
      jdId
    });

    return task;
  }

  @Process('process-resume')
  async processResume(job: Job<{ taskId: string; resumeId: string; jdId: string }>) {
    const { taskId, resumeId, jdId } = job.data;
    
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: 'RUNNING' }
      });

      const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
      const jd = await this.prisma.jd.findUnique({ where: { id: jdId } });

      // 并行调用 LLM 生成三件套
      const [resumeMd, interviewQuestions, knowledgeItems] = await Promise.all([
        this.generateOptimizedResume(resume, jd),
        this.generateInterviewQuestions(resume, jd),
        this.generateKnowledgeItems(resume, jd)
      ]);

      const output = await this.prisma.output.create({
        data: {
          resumeMd,
          interviewQuestions,
          knowledgeJson: JSON.stringify(knowledgeItems)
        }
      });

      await this.prisma.task.update({
        where: { id: taskId },
        data: { 
          status: 'DONE',
          outputId: output.id,
          latencyMs: Date.now() - job.timestamp
        }
      });

    } catch (error) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { 
          status: 'ERROR',
          error: error.message
        }
      });
    }
  }
}
```

## 🔧 环境配置

### 开发环境
```bash
# .env.local
USE_NESTJS_API=false  # 使用 Next.js Mock
API_BASE_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@localhost:5432/resume_copilot
QWEN_API_KEY=your_qwen_key
DEEPSEEK_API_KEY=your_deepseek_key
```

### 生产环境
```bash
# .env.production
USE_NESTJS_API=true   # 使用真实后端
API_BASE_URL=https://api.your-domain.com
DATABASE_URL=postgresql://prod_user:pass@prod_host:5432/resume_copilot
```

## 📊 迁移时间表

| 阶段 | 时间 | 任务 | 负责人 |
|------|------|------|--------|
| 1 | 已完成 | Next.js API Routes + Mock | ✅ |
| 2 | 第1-2周 | NestJS 服务实现 | 后端开发 |
| 3 | 第3周 | 数据库 + Prisma 集成 | 后端开发 |
| 4 | 第4周 | LLM 服务集成 | AI工程师 |
| 5 | 第5周 | 队列系统 + 异步处理 | 后端开发 |
| 6 | 第6周 | 渐进式切换 + 测试 | 全栈开发 |
| 7 | 第7周 | 生产部署 + 监控 | DevOps |

## 🎯 迁移优势

### 技术优势
- **性能**: NestJS + 数据库 > 内存Mock
- **扩展性**: 微服务架构，可独立扩展
- **可靠性**: 数据持久化，任务队列
- **监控**: 完整的日志和指标

### 业务优势
- **零停机迁移**: 渐进式切换
- **风险可控**: 可随时回滚到Mock
- **功能增强**: 真实的LLM集成
- **用户体验**: 更快的响应速度

## 🚀 立即可做的准备工作

1. **完善 NestJS 基础结构**
2. **设置数据库和 Prisma**
3. **实现 LLM Provider**
4. **添加任务队列系统**
5. **编写迁移脚本**

这样的迁移策略既保证了当前功能的可用性，又为未来的扩展奠定了基础！