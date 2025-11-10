# 环境配置指南

## LLM API Key 配置

对话功能需要配置LLM API key。请在 `apps/api` 目录下创建 `.env` 文件。

### 1. 创建 .env 文件

在 `apps/api` 目录下创建 `.env` 文件（注意：该文件已被 `.gitignore` 忽略，不会提交到git）。

### 2. 配置通义千问 (推荐)

```env
# 通义千问（阿里云百炼平台）
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_MODEL=qwen-turbo
DEFAULT_LLM_PROVIDER=qwen
```

**获取步骤**：
1. 访问 [阿里云百炼平台](https://dashscope.console.aliyun.com/apiKey)
2. 登录/注册账号
3. 创建 API Key
4. 复制 API Key 到 `.env` 文件

**模型选择**：
- `qwen-turbo`: 快速响应，性价比高（推荐）
- `qwen-plus`: 更强的理解能力
- `qwen-max`: 最强性能

### 3. 或配置 DeepSeek（备选）

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-chat
DEFAULT_LLM_PROVIDER=deepseek
```

**获取步骤**：
1. 访问 [DeepSeek平台](https://platform.deepseek.com/api_keys)
2. 注册并创建 API Key

### 4. 或配置 OpenAI（备选）

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
DEFAULT_LLM_PROVIDER=openai
```

## 完整的 .env 示例

```env
# ==================== LLM配置 ====================
QWEN_API_KEY=sk-your-actual-api-key-here
QWEN_MODEL=qwen-turbo
DEFAULT_LLM_PROVIDER=qwen

# LLM调用配置
LLM_TIMEOUT=60
LLM_MAX_RETRIES=3
LLM_DEFAULT_TEMPERATURE=0.7

# ==================== 其他配置 ====================
# 日志级别
LOG_LEVEL=INFO

# 是否启用Agent日志
ENABLE_AGENT_LOGGING=true

# 是否在日志中屏蔽敏感数据
MASK_SENSITIVE_DATA=true

# 允许的跨域来源
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 验证配置

1. 确保 `.env` 文件在 `apps/api` 目录下
2. 重启后端服务
3. 在前端对话界面输入消息测试

## 常见问题

### Q: API调用失败，提示 "No LLM providers configured"
A: 检查 `.env` 文件是否正确配置，API key 是否有效。

### Q: 提示 "Provider qwen not configured"
A: 确认 `QWEN_API_KEY` 已正确设置，且 `DEFAULT_LLM_PROVIDER=qwen`。

### Q: 如何切换LLM提供者？
A: 修改 `DEFAULT_LLM_PROVIDER` 的值为 `qwen`、`deepseek` 或 `openai`。

### Q: 对话没有记忆？
A: 对话记忆是自动的，通过 `session_id` 管理。前端会自动生成和保持 session_id。

## 价格参考

### 通义千问
- qwen-turbo: ¥0.0008/千tokens（输入）、¥0.002/千tokens（输出）
- qwen-plus: ¥0.004/千tokens（输入）、¥0.012/千tokens（输出）

### DeepSeek
- deepseek-chat: ¥0.001/千tokens（输入）、¥0.002/千tokens（输出）

### OpenAI
- gpt-4-turbo: $0.01/千tokens（输入）、$0.03/千tokens（输出）

## 安全提示

⚠️ **重要**：
- 不要将 `.env` 文件提交到 git
- 不要在代码中硬编码 API key
- 定期轮换 API key
- 设置 API 使用限额

## 测试配置

启动后端后，访问 `http://localhost:8000/health` 检查服务状态。

```bash
cd apps/api
python -m uvicorn app.main:app --reload --port 8000
```

然后打开前端，尝试在对话界面发送消息。

