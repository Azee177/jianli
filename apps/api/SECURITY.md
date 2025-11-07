# 安全最佳实践

## API Key 安全管理

### 1. 环境变量配置

**✅ 正确做法：**

```bash
# 使用 .env 文件
QWEN_API_KEY=sk-xxxxxxxxxxxxxx
```

**❌ 错误做法：**

```python
# 不要硬编码API key
api_key = "sk-xxxxxxxxxxxxxx"  # 危险！
```

### 2. .env 文件保护

```bash
# 设置文件权限（Linux/macOS）
chmod 600 .env

# 确保 .env 在 .gitignore 中
echo ".env" >> .gitignore
```

### 3. API Key 获取

#### Qwen（通义千问）
1. 访问：https://dashscope.console.aliyun.com/
2. 登录阿里云账号
3. 创建API Key
4. 复制到 `.env` 文件

#### DeepSeek（备用）
1. 访问：https://platform.deepseek.com/
2. 注册账号
3. 获取API Key

#### OpenAI（备用）
1. 访问：https://platform.openai.com/
2. 创建API Key

### 4. 配置验证

```bash
# 启动应用前验证配置
python -m app.scripts.validate_config
```

### 5. 日志安全

系统会自动屏蔽日志中的敏感信息：

```python
# config.py中的设置
MASK_SENSITIVE_DATA=true

# 日志输出示例
"Qwen API key已配置: sk-ab...xy"  # 自动屏蔽中间部分
```

### 6. API Key 轮换

建议定期更换API Key（每3-6个月）：

1. 生成新的API Key
2. 更新 `.env` 文件
3. 重启应用
4. 撤销旧的API Key

### 7. 生产环境配置

```bash
# .env.production
DEBUG=false
SECRET_KEY=<strong-random-32-char-string>
ALLOWED_ORIGINS=https://yourdomain.com
QWEN_API_KEY=<your-api-key>
```

生成强密钥：

```python
import secrets
print(secrets.token_urlsafe(32))
```

### 8. 网络安全

- ✅ 使用HTTPS传输数据
- ✅ 限制允许的CORS源
- ✅ 实施请求频率限制
- ✅ 记录异常访问

### 9. 监控和告警

```python
# 监控API调用
- 记录每次LLM调用的成本
- 设置月度预算告警
- 跟踪异常调用模式
```

### 10. 错误处理

```python
# 不要在错误响应中暴露敏感信息
try:
    result = llm_service.complete(...)
except Exception as e:
    # ❌ 错误：return {"error": str(e)}  # 可能暴露API key
    # ✅ 正确：
    logger.error(f"LLM调用失败: {e}")
    return {"error": "服务暂时不可用"}
```

### 11. 访问控制

```python
# 实施用户认证
# 限制每个用户的API调用次数
# 记录用户操作日志
```

### 12. 代码审查检查清单

- [ ] 没有硬编码的API key
- [ ] .env 文件在 .gitignore 中
- [ ] 日志不包含敏感信息
- [ ] 错误响应不泄露内部信息
- [ ] 使用SecretStr保护敏感配置
- [ ] API key有适当的权限范围

## 安全检查脚本

运行安全检查：

```bash
python -m app.scripts.security_check
```

## 应急响应

如果API Key泄露：

1. **立即撤销** 泄露的API Key
2. **生成新的** API Key
3. **更新配置** 并重启服务
4. **审查日志** 查找异常使用
5. **评估影响** 和潜在损失
6. **加强防护** 措施

## 联系方式

安全问题请联系：security@example.com

## 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12-Factor App](https://12factor.net/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)

