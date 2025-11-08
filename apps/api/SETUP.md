# 后端项目环境配置说明

## 环境信息

- **Conda环境名称**: jianli
- **Python版本**: 3.11.14
- **Conda路径**: E:\anaconda

## 已完成的配置

### 1. 创建Conda环境

```bash
E:\anaconda\Scripts\conda.exe create -n jianli python=3.11 -y
```

### 2. 安装依赖

```bash
E:\anaconda\Scripts\conda.exe run -n jianli pip install -r requirements.txt
E:\anaconda\Scripts\conda.exe run -n jianli pip install openai
```

### 3. 环境变量配置

在 `.env` 文件中已配置：
- `QWEN_API_KEY`: 通义千问API密钥（已配置并测试成功）
- 其他配置项请参考 `app/config.py`

## 启动服务器

### 方式1: 使用启动脚本（推荐）

```bash
# 双击运行或在命令行执行
start_server.bat
```

### 方式2: 直接使用Python

```bash
cd e:\Code\jianli-main\apps\api
E:\anaconda\envs\jianli\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 方式3: 使用Python启动脚本

```bash
cd e:\Code\jianli-main\apps\api
E:\anaconda\envs\jianli\python.exe start.py
```

### 方式4: 使用conda run

```bash
cd e:\Code\jianli-main\apps\api
E:\anaconda\Scripts\conda.exe run -n jianli python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 问题修复记录

### 修复1: ResumeRecord缺少字段

**问题**: `TypeError: ResumeRecord.__init__() got an unexpected keyword argument 'structured_sections'`

**原因**: LLM解析功能新增了三个字段，但数据类定义中没有包含

**修复**: 在 `app/store/resume_store.py` 的 `ResumeRecord` 类中添加了以下字段：
```python
# LLM解析增强字段
structured_sections: Optional[Dict[str, Any]] = None
confidence_score: Optional[float] = None
parsing_method: Optional[str] = "rule-based"
```

### 修复2: LLM API调用测试

**测试结果**: ✓ 所有测试通过
- OpenAI SDK同步调用: 正常
- httpx异步调用: 正常
- 项目LLM服务: 正常

**测试内容**:
1. API Key配置验证
2. 网络连接测试
3. 实际API调用测试

## 已安装的主要依赖

- fastapi==0.121.0
- uvicorn==0.38.0
- httpx==0.28.1
- pydantic==2.12.4
- pymupdf==1.26.6
- openai==2.7.1
- beautifulsoup4==4.14.2
- python-dotenv==1.2.1

完整依赖列表请参考 `requirements.txt`

## API文档

服务器启动后，可以访问以下地址：

- **API交互文档**: http://127.0.0.1:8000/docs
- **ReDoc文档**: http://127.0.0.1:8000/redoc
- **健康检查**: http://127.0.0.1:8000/health

## 开发建议

1. **使用VSCode/Cursor**: 在IDE的集成终端中激活conda环境
2. **调试**: 使用 `--reload` 参数可以在代码修改后自动重启服务器
3. **日志**: 服务器日志会输出到终端，便于调试

## 常见问题

### Q: 如何检查conda环境是否激活？
```bash
E:\anaconda\Scripts\conda.exe env list
```
当前激活的环境前面会有 `*` 标记

### Q: 如何在VS Code中选择conda环境？
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Python: Select Interpreter"
3. 选择 `jianli (E:\anaconda\envs\jianli\python.exe)`

### Q: 如何更新依赖？
```bash
E:\anaconda\Scripts\conda.exe run -n jianli pip install --upgrade <package_name>
```

### Q: 如何查看环境中已安装的包？
```bash
E:\anaconda\Scripts\conda.exe run -n jianli pip list
```

## 下一步

1. 确认前端可以正常连接到 http://127.0.0.1:8000
2. 测试简历上传功能
3. 验证LLM解析功能是否正常工作

## 端口配置说明

**统一端口**: 8000

- 后端API: http://127.0.0.1:8000
- 前端开发: http://localhost:3000
- 前端通过环境变量 `NEXT_PUBLIC_API_BASE` 连接后端

如需修改端口，请同时更新：
1. 后端启动命令中的 `--port` 参数
2. 前端 `.env.local` 中的 `NEXT_PUBLIC_API_BASE`
3. `apps/api/start.py` 中的 `PORT` 环境变量默认值

---

**最后更新**: 2025-11-07
**配置人**: AI Assistant

