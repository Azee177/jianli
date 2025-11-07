# Agent系统快速启动指南

## 🚀 5分钟快速开始

### 步骤 1: 获取Qwen API Key

1. 访问阿里云DashScope控制台：https://dashscope.console.aliyun.com/
2. 登录/注册阿里云账号
3. 开通"通义千问"服务
4. 创建API Key并复制

### 步骤 2: 配置环境变量

```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件
# Windows: notepad .env
# Linux/Mac: nano .env
```

在 `.env` 文件中填入你的API Key：

```bash
QWEN_API_KEY=your-actual-api-key-here
DEFAULT_LLM_PROVIDER=qwen
```

### 步骤 3: 安装依赖

```bash
cd apps/api
pip install -r requirements.txt
```

### 步骤 4: 验证配置

```bash
# 运行配置验证脚本
python -m app.scripts.validate_config
```

看到"✅ 配置验证通过！"说明配置成功。

### 步骤 5: 启动服务

```bash
# 开发模式
uvicorn app.main:app --reload --port 8000

# 或使用提供的启动脚本
python start.py
```

### 步骤 6: 测试Agent

```python
# test_agent.py
import asyncio
from app.agents import MasterAgent, ResumeParserAgent
from app.agents.base_agent import AgentContext, JourneyStage

async def test():
    # 创建Agent
    parser = ResumeParserAgent()
    master = MasterAgent({"ResumeParser": parser})
    
    # 创建上下文
    context = AgentContext(
        user_id="test_user",
        journey_id="test_journey"
    )
    
    # 测试简历解析
    result = await master.execute(
        task={
            "action_type": "upload_resume",
            "ocr_text": """
            张三
            138-1234-5678 | zhangsan@email.com
            
            教育背景
            清华大学 | 计算机科学 | 硕士 | 2018-2021
            
            工作经历
            字节跳动 | 后端工程师 | 2021-至今
            - 负责推荐系统开发
            - 提升系统性能30%
            """
        },
        context=context
    )
    
    print("解析结果:", result)

# 运行测试
asyncio.run(test())
```

## 📊 Agent架构说明

### Master Agent（总控）
- **职责**: 意图识别、流程编排
- **调用方式**: 所有用户请求的入口

### Resume Parser Agent（简历解析）
- **职责**: 从OCR文本提取结构化信息
- **输入**: OCR文本 + PDF字节流
- **输出**: 结构化简历数据 + 照片信息

### Job Recommendation Agent（岗位推荐）
- **职责**: 对话式收集意向、推荐岗位
- **特点**: ChatGPT风格的交互

### JD Analysis Agent（JD分析）
- **职责**: 抓取15条JD、提取共性
- **输出**: 4-5条核心维度

### Resume Optimization Agent（简历优化）
- **职责**: 差距分析、生成优化建议
- **特点**: 生成三版本（稳健/平衡/激进）

### Interview Prep Agent（面试准备）
- **职责**: 生成面试问题和答案提纲

## 🔧 配置选项

### LLM提供者切换

```bash
# 使用Qwen（推荐）
DEFAULT_LLM_PROVIDER=qwen
QWEN_API_KEY=your-key

# 使用DeepSeek
DEFAULT_LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-key

# 使用OpenAI
DEFAULT_LLM_PROVIDER=openai
OPENAI_API_KEY=your-key
```

### 调整LLM参数

```bash
# 超时时间（秒）
LLM_TIMEOUT=60

# 重试次数
LLM_MAX_RETRIES=3

# 默认温度参数
LLM_DEFAULT_TEMPERATURE=0.7
```

## 🔒 安全最佳实践

1. **永远不要提交 `.env` 文件到git**
   ```bash
   # 确保在 .gitignore 中
   echo ".env" >> .gitignore
   ```

2. **设置文件权限（Linux/Mac）**
   ```bash
   chmod 600 .env
   ```

3. **定期更换API Key**
   - 建议每3-6个月更换一次

4. **监控API使用量**
   - 在阿里云控制台设置预算告警

5. **生产环境配置**
   ```bash
   DEBUG=false
   SECRET_KEY=<strong-random-key>
   MASK_SENSITIVE_DATA=true
   ```

## 📝 API调用示例

### 1. 上传并解析简历

```bash
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "upload_resume",
    "ocr_text": "简历文本...",
    "user_id": "user123"
  }'
```

### 2. 开始岗位推荐对话

```bash
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "start_intent_collection",
    "user_id": "user123"
  }'
```

### 3. 发送对话消息

```bash
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "chat",
    "message": "我想应聘后端工程师",
    "user_id": "user123"
  }'
```

## 🐛 常见问题

### Q1: API Key无效
```
错误: Authentication failed
解决: 
1. 检查API Key是否正确复制
2. 确认已开通通义千问服务
3. 检查账户余额是否充足
```

### Q2: 连接超时
```
错误: Timeout waiting for response
解决:
1. 检查网络连接
2. 增加 LLM_TIMEOUT 值
3. 检查防火墙设置
```

### Q3: 配置验证失败
```
错误: LLM配置不完整
解决:
1. 运行: python -m app.scripts.validate_config
2. 按照提示检查配置
3. 确保 .env 文件在正确位置
```

## 📚 更多资源

- [完整架构文档](./agents/agent_architecture.md)
- [安全指南](./SECURITY.md)
- [API文档](http://localhost:8000/docs)
- [Qwen API文档](https://help.aliyun.com/zh/dashscope/)

## 💡 开发技巧

### 调试Agent

```python
# 启用详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 使用低温度获得更确定的结果
result = await agent.call_llm(
    prompt=prompt,
    temperature=0.1  # 更确定
)
```

### 自定义Agent

```python
from app.agents.base_agent import BaseAgent, AgentContext

class MyCustomAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="MyAgent",
            description="我的自定义Agent"
        )
    
    async def execute(self, task, context):
        # 调用LLM
        result = await self.call_llm_json(
            prompt="你的提示词",
            system_message="系统消息"
        )
        return result
```

## 🎯 下一步

- [ ] 完成所有Sub-Agents的实现
- [ ] 创建统一的API路由
- [ ] 添加流式响应支持
- [ ] 实现会话管理
- [ ] 添加缓存机制
- [ ] 完善错误处理
- [ ] 编写单元测试

---

**需要帮助？** 查看 [SECURITY.md](./SECURITY.md) 或提交Issue。

