# ⚡ 快速启动指南

## 🎯 优化完成状态

✅ **方向1**: 增强解析能力 - 集成阿里云通义千问LLM替代规则匹配  
✅ **方向2**: 完善数据流 - 让前端使用结构化数据和模板填充  
✅ **方向3**: 优化用户体验 - 添加实时预览和智能建议  

**后端状态**: ✅ 已验证可正常启动（http://127.0.0.1:8000）

---

## 🚀 启动步骤

### 1. 配置环境变量

创建 `apps/api/.env` 文件（当前被.gitignore忽略）：

```env
# 阿里云通义千问配置
QWEN_API_KEY=sk-ea9cb50463984a528a3876f6c7e7ebf7
QWEN_MODEL=qwen-max

# 默认LLM提供者
DEFAULT_LLM_PROVIDER=qwen

# LLM调用配置
LLM_TIMEOUT=60
LLM_MAX_RETRIES=3
LLM_DEFAULT_TEMPERATURE=0.3

# 调试模式
DEBUG=true

# 日志配置
LOG_LEVEL=INFO

# Agent配置
ENABLE_AGENT_LOGGING=true
MASK_SENSITIVE_DATA=true

# CORS配置
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

### 2. 启动后端（必须在虚拟环境中）

```powershell
# PowerShell命令
cd apps/api
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

或

```bash
# Bash命令（Linux/Mac）
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**验证后端**:
```powershell
curl http://127.0.0.1:8000/health
```

预期返回: `{"status":"ok",...}`

### 3. 启动前端

```bash
cd apps/web
npm install  # 首次运行
npm run dev
```

访问: http://localhost:3000

---

## 📡 新增API端点

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/resumes` | POST | 上传简历 | 支持`useLlm=true`参数启用LLM解析 |
| `/resumes/{id}/render` | GET | 获取HTML简历 | 返回格式化的HTML |
| `/resumes/{id}/structured` | GET | 获取结构化数据 | 返回JSON格式的详细数据 |
| `/suggestions/analyze` | POST | 分析简历 | AI评分+建议 |
| `/suggestions/section` | POST | 章节建议 | 针对特定章节的优化建议 |
| `/suggestions/optimize-text` | POST | 文本优化 | 智能优化文本内容 |
| `/suggestions/generate-summary` | POST | 生成总结 | 生成个人总结 |

---

## 🧪 快速测试

### 测试1: 上传简历（使用LLM解析）

```bash
curl -X POST http://127.0.0.1:8000/resumes \
  -F "file=@your_resume.pdf" \
  -F "useLlm=true"
```

### 测试2: 获取格式化HTML

```bash
# 假设简历ID为 r_abc12345
curl http://127.0.0.1:8000/resumes/r_abc12345/render
```

### 测试3: 获取结构化数据

```bash
curl http://127.0.0.1:8000/resumes/r_abc12345/structured
```

### 测试4: 分析简历

```bash
curl -X POST http://127.0.0.1:8000/suggestions/analyze \
  -H "Content-Type: application/json" \
  -d '{"resume_id":"r_abc12345"}'
```

---

## 📋 核心功能

### 1. LLM智能解析
- 自动识别简历各个章节
- 提取详细字段信息
- 计算解析置信度
- 失败自动降级到规则解析

### 2. 模板渲染
- 清华紫调专业模板
- 自动格式化和布局
- HTML响应式输出

### 3. AI智能建议
- 简历整体评分（0-100）
- 优势劣势分析
- 分章节优化建议
- 文本智能优化
- 个人总结生成

---

## 🐛 常见问题

### Q1: 导入错误 `ModuleNotFoundError`
**A**: 确保在虚拟环境中运行：
```bash
cd apps/api
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

### Q2: LLM API调用失败
**A**: 检查：
1. .env文件是否存在于 `apps/api/` 目录
2. QWEN_API_KEY是否正确
3. 网络是否可以访问 dashscope.aliyuncs.com

### Q3: 端口8000已被占用
**A**: 使用其他端口：
```bash
uvicorn app.main:app --reload --port 8001
```

### Q4: 前端无法连接后端
**A**: 检查CORS配置，确保前端URL在 `ALLOWED_ORIGINS` 中

---

## 📊 架构图

```
用户上传PDF
    ↓
OCR文本提取
    ↓
LLM智能解析 (qwen-max)
    ├─ 个人信息
    ├─ 教育背景
    ├─ 工作经历
    ├─ 项目经历
    ├─ 技能
    └─ 荣誉奖项
    ↓
结构化数据存储
    ↓
    ├─ 模板渲染 → HTML简历
    └─ AI分析 → 优化建议
    ↓
前端展示
```

---

## 📝 下一步

1. 测试完整的简历上传→解析→渲染流程
2. 体验AI智能建议功能
3. 查看 `OPTIMIZATION_SUMMARY.md` 了解详细优化内容
4. 根据需要调整模板样式

---

## 💡 提示

- 所有LLM功能都有降级方案，不会影响基础功能
- 建议在测试时监控后端日志，了解LLM调用情况
- 可以通过 `useLlm=false` 参数禁用LLM使用规则解析

---

**状态**: ✅ 优化完成，后端已验证可正常启动
**文档**: 详见 `OPTIMIZATION_SUMMARY.md`

