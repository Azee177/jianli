# Resume Copilot · 后端蓝图（FastAPI 方案）

> 目标：用 **FastAPI** 实现一套“上传 PDF → OCR → 岗位/公司确认 → JD 抓取与共性提炼 → 简历定制改写 → 学习计划 & 面试问答 → 导出 PDF/Word”的后端。
>  说明：本文提供目录结构、数据模型、接口协议、异步与抓取策略、导出与部署建议，方便直接交给工程同学或 Claude 生成代码。

------

## 1) 总体架构

```
[Web/前端]  ──(JWT)──▶  [FastAPI 应用层]
                      │
                      ├─ 文件上传：S3/GCS(预签名) 或本地MinIO
                      ├─ OCR微服务：PyMuPDF + PaddleOCR（Celery 异步）
                      ├─ 抓取微服务：Playwright 采集 + 官方/半官方 API 适配器
                      ├─ LLM编排：岗位共性提炼 / 简历改写 / 问答生成
                      ├─ 导出服务：WeasyPrint(HTML→PDF) / Pandoc & python-docx(→DOCX)
                      ├─ 通知：WebSocket 进度/事件流
                      └─ 数据层：PostgreSQL + Alembic 迁移
```

- 选择 **FastAPI**：自动生成 Swagger UI/Redoc 文档、基于 OpenAPI、类型安全，生产可用。([FastAPI](https://fastapi.tiangolo.com/features/?utm_source=chatgpt.com))
- 实时通信：FastAPI 原生支持 **WebSocket**，用于长任务进度/交互式改写。([FastAPI](https://fastapi.tiangolo.com/advanced/websockets/?utm_source=chatgpt.com))
- 异步任务：轻量任务用 `BackgroundTasks`，重任务（OCR/导出/抓取）用 **Celery**。([FastAPI](https://fastapi.tiangolo.com/tutorial/background-tasks/?utm_source=chatgpt.com))
- OCR：**PyMuPDF** 渲染 PDF 页（300dpi）→ **PaddleOCR**（PP-OCR 系列）识别；可直接抽取文本页则走 **pdfminer.six**。([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/recipes-images.html?utm_source=chatgpt.com))
- 导出：**WeasyPrint** 把 HTML 模板转 PDF；**Pandoc** / **python-docx** 生成 DOCX（或基于 docxtpl 套模板）。([doc.courtbouillon.org](https://doc.courtbouillon.org/weasyprint/stable/?utm_source=chatgpt.com))
- 人脸/证件照裁剪（可选）：**InsightFace/RetinaFace** 做头像检测与居中裁切。([GitHub](https://github.com/deepinsight/insightface?utm_source=chatgpt.com))
- 抓取 JD：优先 **实习僧开放平台**；其余（智联/前程无忧/BOSS 直聘）谨慎走公开页解析或 Playwright 自动化，严格遵守对方条款与 robots。([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))
- 可观测性：**OpenTelemetry** 为 FastAPI 加自动埋点/追踪。([opentelemetry-python-contrib.readthedocs.io](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html?utm_source=chatgpt.com))

------

## 2) 代码与目录建议

```
apps/
  api/
    app/
      main.py                 # FastAPI 入口（/docs, /redoc 自动）
      deps.py                 # 依赖、DB 会话、鉴权
      config.py               # 环境变量
      routers/
        resumes.py            # 简历 CRUD & 上传
        ocr.py                # OCR 提交与结果拉取
        jd_sources.py         # JD 抓取与共性提炼
        optimize.py           # 简历改写/问答/学习计划
        export.py             # PDF/DOCX 导出
        ws.py                 # WebSocket 进度
      services/
        ocr_service.py        # PyMuPDF + PaddleOCR 封装
        jd_service.py         # 实习僧API/Playwright 适配器
        llm_orchestrator.py   # LLM 提示词与流程
        export_service.py     # WeasyPrint/Pandoc/python-docx
        avatar_service.py     # InsightFace 裁剪
      models/                 # SQLModel/SQLAlchemy 模型
      schemas/                # Pydantic 模型
      tasks/                  # Celery 任务（ocr, export, crawl）
      templates/              # Jinja2 HTML 简历模板
    celery_worker.py
    alembic/                  # 迁移脚本
```

- SQL 建议用 **SQLModel**（作者同一人，和 FastAPI/Pydantic 配合顺滑），迁移交给 **Alembic**。([sqlmodel.tiangolo.com](https://sqlmodel.tiangolo.com/tutorial/fastapi/?utm_source=chatgpt.com))

------

## 3) 数据模型（核心表）

- `users`：账号、邮箱、哈希密码、角色
- `resumes`：所属用户、标题、当前版本、头像URL、导入来源（ocr/pdf/docx）
- `resume_versions`：版本化保存的 JSON/HTML 与 diff
- `experiences`：经历条目（与 version 关联）
- `targets`：用户输入的目标公司/岗位
- `jd_sources`：抓取渠道、URL、全文、结构化字段（公司/岗位/地点/要求）
- `jd_commonalities`：针对 `targets` 计算出的 15 条共性、4–5 条强共性
- `tasks`：异步任务表（id、类型、状态、进度、结果URL/错误栈）
- `exports`：导出记录（pdf/docx、模板ID、生成时间）

> 迁移使用 Alembic，配合 SQLAlchemy/SQLModel 的自动生成。([alembic.sqlalchemy.org](https://alembic.sqlalchemy.org/en/latest/tutorial.html?utm_source=chatgpt.com))

------

## 4) API 设计（节选）

### 4.1 简历与上传

- `POST /uploads/presign`：生成对象存储 **预签名 URL**（前端直传 PDF/头像，减少后端压力；支持分片）。响应：`{url, fields, expires_in}`。([AWS 文档](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html?utm_source=chatgpt.com))
- `POST /resumes/from-upload`：提交已上传文件的 `object_key`，创建 `resume` 草稿，触发 OCR（返回 `task_id`）。轻量情况也可接收 `UploadFile` 直传。([davidmuraya.com](https://davidmuraya.com/blog/fastapi-file-uploads/?utm_source=chatgpt.com))
- `GET /tasks/{task_id}`：查询 OCR/抓取/导出等任务进度（或订阅 `/ws/tasks`）。

> 说明：预签名直传是大文件/高并发上传的主流做法（也可做多段分片）。([Nicholas Adamou](https://www.nicholasadamou.com/notes/handling-large-file-uploads-20gb-in-fast-api-with-s3-multipart-upload-using-signed-urls?utm_source=chatgpt.com))

### 4.2 OCR 与解析

- `POST /ocr/pdf`：入参 `resume_id`，后端读取 S3 上 PDF → PyMuPDF 渲染 300dpi → PaddleOCR → 版面重排 → 回写 `resume_version`。**异步 Celery**。([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/recipes-images.html?utm_source=chatgpt.com))
- 纯文本 PDF：优先 **pdfminer.six** 直抽，降成本提速。([pdfminersix.readthedocs.io](https://pdfminersix.readthedocs.io/en/latest/tutorial/highlevel.html?utm_source=chatgpt.com))

### 4.3 目标岗位/公司 & JD 抓取

- `POST /targets`：用户选择/输入公司与岗位
- `POST /jd/fetch`：根据 `targets` 调度抓取器：
  - `实习僧开放平台`（签名鉴权）优先；([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))
  - 其他站点：**粘贴 JD 链接**优先（公开页解析）；必要时 **Playwright** 自动化（登录/滚动/反爬处理）；**务必遵守网站条款与 robots**。([Playwright](https://playwright.dev/python/docs/library?utm_source=chatgpt.com))
  - *参考*：网上常见的“智联/51job 前端 JSON 接口”文章仅作研究示例，不保证长期可用且可能违反条款。生产环境应避免依赖这类非官方 API。([CSDN Blog](https://blog.csdn.net/ZGQ3586/article/details/90461188?utm_source=chatgpt.com))

### 4.4 共性提炼 & 简历改写

- `POST /jd/commonalities`：输入多个 JD 文本，输出 **15 条共性 + 4–5 条强共性**（LLM）。
- `POST /resumes/{id}/optimize/preview`：基于共性，生成第一版改写草稿（标注建议点位）。
- `POST /resumes/{id}/optimize/apply`：将选中修改项写入新版本。
- `POST /resumes/{id}/qa`：基于简历生成 **面试官式追问** 树。
- `POST /resumes/{id}/study-plan`：输出知识点与 **B 站/课程**链接建议（可维护白名单源）。

### 4.5 导出

- `POST /exports/pdf`：用 HTML + WeasyPrint 导出 PDF；可注入“1/4 公司定制段落”。([doc.courtbouillon.org](https://doc.courtbouillon.org/weasyprint/stable/?utm_source=chatgpt.com))
- `POST /exports/docx`：使用 Pandoc 或 `python-docx/docxtpl` 导出 DOCX（可加载品牌模板）。([pandoc.org](https://pandoc.org/MANUAL.html?utm_source=chatgpt.com))

### 4.6 鉴权与速率限制

- 鉴权：OAuth2 + JWT（`/auth/login` 发放 token；受保护路由要求 `Bearer`）。([FastAPI](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/?utm_source=chatgpt.com))
- 速率限制：`slowapi` 中间件，限制上传/抓取等高成本路由。([slowapi.readthedocs.io](https://slowapi.readthedocs.io/?utm_source=chatgpt.com))
- 幂等：对导入/导出/扣费类接口使用 **Idempotency-Key** 头；避免重复点击导致的重复任务。([Stripe 文档](https://docs.stripe.com/api/idempotent_requests?utm_source=chatgpt.com))

------

## 5) 关键流程（默认场景）

### 5.1 上传 & OCR

1. 前端请求 `/uploads/presign` 获取直传地址 → 将 PDF 上传到对象存储。([AWS 文档](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html?utm_source=chatgpt.com))
2. 前端调用 `/resumes/from-upload` 绑定文件并触发 OCR（返回 `task_id`）。
3. Celery Worker：
   - PyMuPDF 渲染页面（`dpi=300`）→ PaddleOCR（PP-OCRv5/4/3 可选）→ 文块重排。([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/recipes-images.html?utm_source=chatgpt.com))
   - 若 `pdfminer.six` 能稳定抽取，跳过渲染直接用文本。([pdfminersix.readthedocs.io](https://pdfminersix.readthedocs.io/en/latest/tutorial/highlevel.html?utm_source=chatgpt.com))
4. 通过 `/ws/tasks` 或 `GET /tasks/{id}` 推送进度与结果。

### 5.2 目标岗位/公司与 JD 抓取

1. 用户在对话区确认目标公司/岗位（或系统推荐 Top N）。
2. `/jd/fetch`：
   - 优先 **实习僧开放平台**（REST，有签名与限流说明）。([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))
   - 粘贴 JD URL 的情况：Playwright 启浏览器→访问→抽取 DOM 文本（规避反爬，尊重条款）。([Playwright](https://playwright.dev/python/docs/library?utm_source=chatgpt.com))

### 5.3 共性提炼 → 定制改写

1. `/jd/commonalities`：汇总多来源 JD 得出 **供需共性**。
2. 在聊天侧栏给出“复选项”让用户微调；确认后写入 `jd_commonalities`。
3. `/resumes/{id}/optimize/preview`：输出改写草稿（保留量化指标、STAR 结构；标注“公司调性段”占 25%）。
4. `/resumes/{id}/optimize/apply`：生成新版本内容并保存 diff。

### 5.4 知识点 & 面试追问

- `/resumes/{id}/study-plan`：根据共性列出学习清单与视频链接。
- `/resumes/{id}/qa`：对要点生成“技术追问树”，便于用户演练。

### 5.5 导出

- `/exports/pdf|docx`：选择模板、主题色、是否隐藏敏感信息；完成后返回文件 URL（对象存储）。

------

## 6) 抓取源策略（中国站点优先）

- **实习僧开放平台**：官方文档给出签名、限流、白名单等规范，建议优先接入。([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))
- **直连公开页**：用户提供 JD 链接时，使用 Playwright 渲染后抽取；注意验证码/反爬与网站条款。([Playwright](https://playwright.dev/python/docs/library?utm_source=chatgpt.com))
- **智联/51job 非官方 JSON**：社区文章中常见的 `fe-api.zhaopin.com`、`search_result.php` 等接口仅供研究，**不建议**生产依赖。([CSDN Blog](https://blog.csdn.net/ZGQ3586/article/details/90461188?utm_source=chatgpt.com))

------

## 7) 进度与实时交互

- **WebSocket**：`/ws/tasks` 推送 OCR/导出/抓取进度与错误；也可做“选中文段→请求改写→实时回传替换建议”的交互。([FastAPI](https://fastapi.tiangolo.com/advanced/websockets/?utm_source=chatgpt.com))
- 小任务可用 `BackgroundTasks`，避免阻塞请求；重任务全部走 **Celery**（可水平扩容 Worker，Broker 建议 Redis/RabbitMQ）。([FastAPI](https://fastapi.tiangolo.com/tutorial/background-tasks/?utm_source=chatgpt.com))

------

## 8) 文档与可观测性

- FastAPI 自动生成 **Swagger UI**（`/docs`）与 **Redoc**（`/redoc`），可定制或自托管。([FastAPI](https://fastapi.tiangolo.com/features/?utm_source=chatgpt.com))
- **OpenTelemetry**：安装 `opentelemetry-instrumentation-fastapi`，导出 OTLP 到可视化平台（Tempo/Jaeger/Last9/Uptrace/SigNoz 等）。([opentelemetry-python-contrib.readthedocs.io](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html?utm_source=chatgpt.com))

------

## 9) 安全与合规

- JWT + OAuth2 密码流、强口令哈希（PyJWT + pwdlib/bcrypt）。([FastAPI](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/?utm_source=chatgpt.com))
- 上传直传：**预签名 URL**（有效期短、最小权限、可多段分片）。([AWS 文档](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html?utm_source=chatgpt.com))
- 速率限制：`slowapi`；关键接口（导出/创建任务）使用 **Idempotency-Key**。([slowapi.readthedocs.io](https://slowapi.readthedocs.io/?utm_source=chatgpt.com))
- 抓取合规：仅在获得授权或明确许可的源上抓取；遵守服务条款与 `robots.txt`；优先官方 API。

------

## 10) 部署（示例）

- **docker-compose**（节选）：
  - `api`: FastAPI (Uvicorn)
  - `worker`: Celery Worker
  - `redis`: Broker/Backend
  - `db`: PostgreSQL
  - `minio`: 对象存储（或换成 S3/GCS）
- 开启 `--reload` 仅用于本地；生产使用多进程/多实例（如 gunicorn+uvicorn workers）。

------

## 11) 关键依赖列表（可直接装）

- `fastapi[standard]`, `uvicorn`, `pydantic`, `sqlalchemy/sqlmodel`, `alembic`（DB/框架）([sqlmodel.tiangolo.com](https://sqlmodel.tiangolo.com/tutorial/fastapi/?utm_source=chatgpt.com))
- `celery`, `redis`（任务队列）([docs.celeryq.dev](https://docs.celeryq.dev/?utm_source=chatgpt.com))
- `pymupdf`, `paddleocr`, `pdfminer.six`（OCR链路）([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/pixmap.html?utm_source=chatgpt.com))
- `weasyprint`, `pandoc`(系统级), `python-docx` / `docxtpl`（导出）([doc.courtbouillon.org](https://doc.courtbouillon.org/weasyprint/stable/?utm_source=chatgpt.com))
- `playwright`（抓取自动化）([Playwright](https://playwright.dev/python/docs/library?utm_source=chatgpt.com))
- `opentelemetry-instrumentation-fastapi`（可观测）([opentelemetry-python-contrib.readthedocs.io](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html?utm_source=chatgpt.com))
- `slowapi`（限流）([slowapi.readthedocs.io](https://slowapi.readthedocs.io/?utm_source=chatgpt.com))

------

## 12) 最小可行接口草案（可交给 Claude 直接生码）

```http
POST /uploads/presign                     # 生成直传URL（pdf/头像）
POST /resumes/from-upload                 # 绑定object_key并触发OCR -> task_id
GET  /tasks/{id}                          # 任务状态查询（或 /ws/tasks 订阅）
POST /targets                             # 保存目标公司/岗位
POST /jd/fetch                            # 抓取JD（实习僧或粘贴URL/Playwright）
POST /jd/commonalities                    # 提炼15条共性 + 强共性
POST /resumes/{id}/optimize/preview       # 生成改写草稿
POST /resumes/{id}/optimize/apply         # 应用勾选修改 → 新版本
POST /resumes/{id}/study-plan             # 学习清单（含B站等链接）
POST /resumes/{id}/qa                     # 面试追问树
POST /exports/pdf                         # HTML→PDF
POST /exports/docx                        # →DOCX（模板/主题）
```

> 以上所有受保护路由均需 `Authorization: Bearer <JWT>`，速率限制与 **Idempotency-Key** 可按路由分类启用。([FastAPI](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/?utm_source=chatgpt.com))

------

### 结语

这份蓝图把“上传→OCR→抓取→共性→定制改写→学习/问答→导出”的闭环拆成可部署、可扩展的 **FastAPI** 微架构，并给出与之匹配的库/规范与接口草案。拿去即可让 Claude/同事按模块开工：先打通 **上传 + OCR + 导出** 主干，再接入 **实习僧** 与 **Playwright** 的 JD 管道，最后补齐 LLM 改写与学习/问答闭环。



太对口了——既然你要**优先用国内网站（实习僧、BOSS 直聘、智联、前程无忧等）\**来抓 JD，我给你一套“\*\*合规优先、稳定可维护\*\*”的抓取与聚合方案：先走\**有官方 API/开放平台**的渠道，其次用**公开 Web JSON**（风险提示），最后才考虑**浏览器自动化**或**用户黏贴 JD URL**兜底。下面是可直接落地的设计。

------

# 1) 抓取优先级与合规策略

**A. 首选：实习僧开放平台（官方 API）**

- 官方给了完整的开发者/HR开放平台：鉴权（`Authorization: base64(app_id:timestamp)` + `sign=MD5(app_id+app_secret+timestamp)`）、IP 白名单、限流等，接口包含“获取职位列表、职位详情、区域/类别字典”等，适合你抓**实习/校招** JD 做“共性提炼”。([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))
- 关键接口示例：`GET HOST/v1/jobs`（职位列表）、`GET HOST/v1/job_pub_num`（可发布额度）、字典接口（未鉴权即可访问），文档写得很细。([猎云网](https://hr-open.shixiseng.com/))

**B. 次选：智联招聘 & 前程无忧（公开 Web JSON，但非正式开放平台）**

- 智联常见的前端 JSON 搜索接口形如 `https://fe-api.zhaopin.com/c/i/sou?...`（参数包括 `kw/cityId/education/...`），很多技术文章有抓包分析，但**属于前端接口，非官方对外开放 API**，稳定性与合规性要评估。([CSDN Blog](https://blog.csdn.net/ZGQ3586/article/details/90461188?utm_source=chatgpt.com))
- 前程无忧（51job）早年有 `search_result.php` 等搜索接口，同样主要是**站内调用**，社区有参数逆向与案例，实际生产要做好**频控、重试与页面备援**。([cnblogs.com](https://www.cnblogs.com/crazyData/p/7609136.html?utm_source=chatgpt.com))

**C. 慎用：BOSS 直聘**

- BOSS 直聘对**反爬非常严格**，有加密参数（如 `__zp_stoken__`）与风控；网络上能找到逆向文章/仓库，但这类方式**高度不稳定且可能违反平台条款**，不建议作为主链路。若确有必要，请优先**用户粘贴 JD URL → 你后端用浏览器自动化（Playwright）渲染并提取文本**，严格限速与缓存，并遵守 robots/条款。([GitHub](https://github.com/ChenZixinn/spider_reverse?utm_source=chatgpt.com))

**D. 企业 ATS / 合作方式（中长期推荐）**

- 很多国内企业用 ATS（如**北森**等）管理招聘，有各自的**开放平台/开放 API**。与企业或 ATS 厂商建立**数据合作**是合规且稳定的长期路径。([beisen.com](https://www.beisen.com/developer/?utm_source=chatgpt.com))

------

# 2) 端到端拉取与“共性提炼”流程（与你的产品逻辑对齐）

1. **用户给公司/岗位意向** → 后端触发“JD 聚合任务”。
2. **数据源优先级**：
   - 实习僧 API（官方）→ 目标公司/岗位关键词检索。([猎云网](https://hr-open.shixiseng.com/))
   - 智联/前程无忧前端 JSON（保底）→ 关键词 + 城市；出现风控即退化为浏览器自动化单点取回。([CSDN Blog](https://blog.csdn.net/ZGQ3586/article/details/90461188?utm_source=chatgpt.com))
   - BOSS 直聘：默认不直接逆向；采用**用户粘贴 JD URL**→ 浏览器自动化解析。([GitHub](https://github.com/ChenZixinn/spider_reverse?utm_source=chatgpt.com))
3. **标准化与去重**：将职位原文统一映射到结构：`{company, title, location, level, jd_text, skills[], source_url, source}`；用标题+地点+内容哈希去重。
4. **“15 条共性 → 4–5 条核心”**：把多份 JD 文本送入 LLM，得到“需求要点清单（去重合并并排序）+ 关键词词表”。
5. **用户在对话框复选 & 可编辑**：你保存为 `jd_common` 记录（版本化），后续用于简历定制改写。
6. **根据共性改写简历**：局部选区 → LLM STAR 改写 → 回填；预留**1/4 版面**用于“公司文化/岗位定制段落”。
7. **学习清单 & 面试问答**：根据共性生成学习主题与 B 站检索关键词；再生成追问树。
8. **导出 & 看板**：HTML/CSS→PDF（WeasyPrint）或 Markdown→docx（Pandoc / python-docx）；记录投递/更新节点并提醒。

------

# 3) 具体落地：站点适配器设计

**Adapter: ShixiSengAdapter（官方）**

- 鉴权：`Authorization: base64(app_id:timestamp)`；`sign=MD5(app_id+app_secret+timestamp)`；支持 IP 白名单/限流。([猎云网](https://hr-open.shixiseng.com/))
- 读职位：`GET /v1/jobs`（分页）+ 详情接口；字典接口（类别/区域/技能）便于**关键词映射**。([猎云网](https://hr-open.shixiseng.com/))

**Adapter: ZhaopinAdapter（保底）**

- 解析 `fe-api.zhaopin.com/c/i/sou` 的返回结构，做关键词/城市筛选；注意**频控**和**接口随时变更风险**。([CSDN Blog](https://blog.csdn.net/ZGQ3586/article/details/90461188?utm_source=chatgpt.com))

**Adapter: Job51Adapter（保底）**

- 解析 `search_result.php` 搜索结果或站内接口；同样注意**反爬与变更**。([cnblogs.com](https://www.cnblogs.com/crazyData/p/7609136.html?utm_source=chatgpt.com))

**Adapter: BossZhipinAdapter（兜底）**

- 默认**不绕过加密参数**；走**用户粘贴 URL → Playwright**渲染→提取正文，限速与缓存。若检测到验证码/风控，直接中断并提示用户。([GitHub](https://github.com/ChenZixinn/spider_reverse?utm_source=chatgpt.com))

------

# 4) FastAPI 后端：数据流与表结构（摘要）

- `jd_sources`: `{id, source, company, title, city, url, raw_json/html, fetched_at}`
- `jd_normalized`: `{id, source_id, company, title, location, jd_text, skills_json, hash}`
- `jd_common`: `{id, query, company_pref, items_15[], top_5[], editable, version, created_at}`
- `tasks`: Celery 任务表（抓取、标准化、共性提炼、导出）

------

# 5) 实习僧 API 调用样例（Python）

> 仅示例思路：生成 `Authorization` 和 `sign`，从实习僧拉取职位列表，按关键词过滤。

```python
import time, base64, hashlib, httpx

HOST = "https://hr-open.shixiseng.com"  # 生产
APP_ID = "your_app_id"
APP_SECRET = "your_app_secret"

def make_auth_headers():
    ts = str(int(time.time()))
    auth = base64.b64encode(f"{APP_ID}:{ts}".encode()).decode()
    sign_src = f"{APP_ID}{APP_SECRET}{ts}"
    sign = hashlib.md5(sign_src.encode()).hexdigest().upper()
    return {"Authorization": auth, "Content-Type": "application/x-www-form-urlencoded"}, sign

def list_jobs(page=1, limit=20):
    headers, sign = make_auth_headers()
    params = {"page": page, "limit": limit, "sign": sign}
    r = httpx.get(f"{HOST}/v1/jobs", params=params, headers=headers, timeout=15)
    r.raise_for_status()
    return r.json()
```

> 鉴权与签名算法、接口路径均来自实习僧 HR 开放文档。([猎云网](https://hr-open.shixiseng.com/))

------

# 6) 反爬/稳定性与法务注意

- **尽量使用官方 API**：如实习僧；必要时对接企业/ATS 开放平台（北森等）。([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))
- **前端 JSON 接口仅作备援**（智联/51job），随时可能调整；做好**错误恢复**与**缓存**。([CSDN Blog](https://blog.csdn.net/ZGQ3586/article/details/90461188?utm_source=chatgpt.com))
- **避免逆向加密/绕过风控**（BOSS 直聘典型），默认改为“粘贴岗位链接 → 浏览器自动化解析文本”。([GitHub](https://github.com/ChenZixinn/spider_reverse?utm_source=chatgpt.com))
- **频控与白名单**：所有抓取都加**速率限制**与**重试退避**，保存 `source_url`、时间戳与哈希，7~30 天内优先命中缓存，避免重复抓取。
- **Robots/ToS**：按站点条款与 robots 限制访问路径；对需要授权的接口，申请正式合作/密钥。

------

# 7) 接口编排（和你现在的产品体验配合）

- `POST /jd/search`：入参 `{company?, title, city?}` → 任务：实习僧 API 优先，补充智联/51job → 归一化返回候选 JD。
- `POST /jd/commons`：入参 `jd_ids[]` → LLM 产出**15 条共性 + Top 4–5**，回传到对话框复选。
- `POST /resumes/{id}/rewrite`：对选区/段落按共性要点改写（保留数字化结果与关键词）。
- `POST /study-plan` / `POST /mock-qa`：生成学习清单与追问树（可附 B 站搜索词）。
- `POST /export/pdf|docx`：WeasyPrint / Pandoc。

------

## 结论

- **主力数据源**：用**实习僧官方开放平台**保证“可用 + 合规 + 稳定”；其余国内站点（智联/51job）作为**保底补充**；BOSS 直聘采用**URL 粘贴 + 浏览器自动化解析**的兜底策略。
- 这样既满足“优先中国网站”的需求，又能把**共性提炼→定制改写→导出/投递**整条链路跑稳，还保留未来与**ATS 厂商/企业官方 API**对接的扩展空间。([实习僧开放平台](https://open.shixiseng.com/?utm_source=chatgpt.com))

如果你愿意，我可以按这个方案把 **FastAPI 里的 `ShixiSengAdapter / ZhaopinAdapter / Job51Adapter / BossPasteAdapter`** 四个适配器的骨架和 `/jd/search` 工作流一次性写好，直接接进你现有后端。

