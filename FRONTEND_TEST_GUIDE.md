# 🧪 前端功能测试指南

## 📋 测试前准备

### 1. 配置环境变量

在 `apps/web` 目录创建 `.env.local` 文件：

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### 2. 启动后端服务

打开**第一个终端**，启动FastAPI后端：

```bash
# 进入后端目录
cd apps/api

# 安装依赖（如果还没安装）
pip install -r requirements.txt

# 启动后端服务（默认8000端口）
uvicorn app.main:app --reload --port 8000
```

看到以下输出表示成功：
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3. 启动前端服务

打开**第二个终端**，启动Next.js前端：

```bash
# 进入Web目录
cd apps/web

# 安装依赖（如果还没安装）
pnpm install

# 启动开发服务器
pnpm dev
```

看到以下输出表示成功：
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

## 🧪 测试步骤

### 测试1: 验证后端服务 ✅

1. 打开浏览器访问：http://localhost:8000/docs
2. 你应该看到FastAPI的Swagger文档界面
3. 检查以下接口是否存在：
   - `POST /resumes` - 上传简历
   - `GET /resumes` - 获取简历列表
   - `GET /resumes/templates` - 获取模板列表

**期望结果**：看到完整的API文档

---

### 测试2: 简历上传功能（文本） ✅

#### 方式A: 使用主页面

1. 打开浏览器访问：http://localhost:3000
2. 在左侧面板找到 **"上传 & 解析"** 卡片
3. 点击 **"选择文件"** 按钮
4. 选择一个 `.txt` 文件或创建测试文件

**测试文件内容** (`test_resume.txt`):
```
张三
电话: 13800138000
邮箱: zhangsan@example.com
地址: 北京

教育背景
清华大学 · 计算机科学与技术专业 | 本科 | 2018.9 - 2022.6
GPA: 3.8/4.0

工作经历
字节跳动 · 后端开发工程师 | 2022.7 - 至今
- 负责推荐系统后端开发，支持日均10亿次请求
- 优化数据库查询性能，响应时间降低40%

技能
Python, Java, Go, TypeScript, React, Vue, SQL, PostgreSQL, 
MySQL, Redis, MongoDB, Docker, Kubernetes
```

**期望结果**：
- 显示 ✅ "简历已上传"
- 显示简历ID
- 显示识别的技能
- 显示姓名

#### 方式B: 使用测试页面

1. 访问：http://localhost:3000/test-api
2. 点击 **"上传简历"** 按钮
3. 查看控制台和页面显示

**期望结果**：
- 页面显示简历ID和解析结果
- 控制台无错误

---

### 测试3: 简历上传功能（PDF） ⚠️

**注意**：需要先安装PDF处理库

```bash
cd apps/api
pip install pymupdf
```

然后：
1. 在主页面点击 **"选择文件"**
2. 选择一个PDF简历文件
3. 等待上传和解析

**期望结果**：
- 显示 ✅ "简历已上传"
- 正确提取文本内容
- 识别联系方式和技能

---

### 测试4: 查看模板列表 ✅

#### 使用浏览器开发者工具

1. 打开主页面：http://localhost:3000
2. 按 `F12` 打开开发者工具
3. 切换到 **Console（控制台）** 标签
4. 输入以下代码并回车：

```javascript
fetch('http://localhost:8000/resumes/templates')
  .then(r => r.json())
  .then(data => console.log('模板列表：', data))
```

**期望结果**：
```json
{
  "templates": [
    {
      "id": "modern-cn",
      "name": "现代中文 · 紫调模板",
      "locale": "zh-CN",
      "description": "参考清华紫配色的一页式现代中文简历版式。",
      "defaultTitle": "个人简历"
    },
    {
      "id": "simple-en",
      "name": "Simple English Template",
      "locale": "en-US",
      ...
    }
  ]
}
```

---

### 测试5: 使用API直接创建简历 ✅

在控制台执行：

```javascript
// 测试文本简历上传
fetch('http://localhost:8000/resumes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': 'test-user-001'
  },
  body: JSON.stringify({
    text: `张三
电话: 13800138000
邮箱: zhangsan@example.com

教育背景
清华大学 · 计算机科学 | 本科 | 2018-2022

技能
Python, JavaScript, React, Vue`
  })
})
.then(r => r.json())
.then(data => {
  console.log('创建成功：', data);
  console.log('简历ID：', data.id);
  console.log('识别的技能：', data.skills);
  console.log('联系方式：', data.contacts);
})
```

**期望结果**：
- 返回完整的简历对象
- 包含解析后的blocks、skills、contacts

---

### 测试6: 查看生成的HTML简历 ✅

1. 打开后端测试输出文件：
   - 文件位置：`apps/api/test_output_resume.html`
   - 双击用浏览器打开

2. 检查以下内容：
   - ✅ 左上角有校徽占位图
   - ✅ 右上角有照片占位图
   - ✅ 中间有姓名和联系方式
   - ✅ 下方有各个章节（教育背景、项目经历等）
   - ✅ 每个章节有紫色分割线

---

## 🔍 调试技巧

### 1. 查看网络请求

1. 按 `F12` 打开开发者工具
2. 切换到 **Network（网络）** 标签
3. 执行上传操作
4. 查看请求详情：
   - 请求URL是否正确
   - 状态码是否为200
   - 响应内容是什么

### 2. 查看后端日志

在后端终端可以看到所有请求日志：

```
INFO:     127.0.0.1:xxxxx - "POST /resumes HTTP/1.1" 200 OK
```

### 3. 使用Swagger测试

访问 http://localhost:8000/docs

1. 找到 `POST /resumes` 接口
2. 点击 **Try it out**
3. 填写请求体：
   ```json
   {
     "text": "张三\n电话: 13800138000\n邮箱: zhangsan@example.com\n\n技能: Python, JavaScript"
   }
   ```
4. 点击 **Execute**
5. 查看响应

---

## ❓ 常见问题

### 问题1: 前端无法连接后端

**症状**：页面显示网络错误，控制台显示 `ERR_CONNECTION_REFUSED`

**解决方案**：
1. 检查后端是否启动：`http://localhost:8000/docs`
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_BASE` 配置
3. 重启前端服务：`pnpm dev`

### 问题2: CORS错误

**症状**：控制台显示 `Access-Control-Allow-Origin` 错误

**解决方案**：
后端已配置CORS，确认 `apps/api/app/main.py` 中有：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 问题3: 上传后没有反应

**解决方案**：
1. 查看浏览器控制台是否有错误
2. 查看后端终端是否有错误日志
3. 检查文件格式是否支持（.pdf, .doc, .docx, .txt）

### 问题4: PDF解析失败

**症状**：后端日志显示 `PyMuPDF not available`

**解决方案**：
```bash
cd apps/api
pip install pymupdf
```

然后重启后端服务。

---

## 📸 期望的测试结果截图

### 1. 主页面 - 上传前
```
┌─────────────────────────────────────┐
│ 上传 & 解析                         │
│ 支持 PDF、Word 文档或直接粘贴文本   │
│                                     │
│ [选择文件]  [模板]                  │
│                                     │
│ ○ 尚未上传                          │
└─────────────────────────────────────┘
```

### 2. 主页面 - 上传后
```
┌─────────────────────────────────────┐
│ 上传 & 解析                         │
│ 支持 PDF、Word 文档或直接粘贴文本   │
│                                     │
│ [选择文件]  [模板]                  │
│                                     │
│ ✓ 简历已上传 · ID: r_abc123        │
│ 技能: Python, JavaScript, React     │
│ 姓名: 张三                          │
└─────────────────────────────────────┘
```

### 3. Swagger API文档
```
FastAPI

Resume Copilot API

resumes
  POST /resumes       Upload resume
  GET /resumes        List resumes
  GET /resumes/{id}   Get resume
  ...
```

---

## ✅ 测试检查清单

- [ ] 后端服务启动成功（端口8000）
- [ ] 前端服务启动成功（端口3000）
- [ ] 可以访问 Swagger 文档
- [ ] 主页面正常显示
- [ ] 文本简历上传成功
- [ ] 信息提取正确（姓名、邮箱、电话）
- [ ] 技能识别正确
- [ ] 可以查看模板列表
- [ ] HTML简历生成正确

---

## 🎯 下一步测试

完成基础测试后，可以测试：

1. **模板实例化**：使用不同模板创建简历
2. **简历列表**：创建多个简历并查看列表
3. **JD解析**：测试岗位描述解析功能
4. **简历优化**：测试完整的优化流程

---

## 📞 需要帮助？

如果遇到问题：

1. 检查本文档的"常见问题"部分
2. 查看后端日志获取详细错误信息
3. 查看浏览器控制台的错误信息
4. 查看 `apps/api/TEST_SUMMARY.md` 了解后端测试结果

