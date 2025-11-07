OCR1.0

我觉得前端暂时差不多了，接下来请你根据我的产品逻辑开始实现具体的后端功能。 首先实现新建简历的所有功能， 第一需要支持用户自行上传pdf格式简历我们做一个ocr提取，目前还没有实现这个最基本的功能 第二可以让用户开始在我们的简历模版上新建一个空白简历 请你帮我设计合理的工作流和选择合适的ocr模型



太好了，前端基本到位后，后端就从“**新建简历**”这条主线发力。下面给你一套可直接落地的**工作流 + 接口设计 + OCR 方案选择**（离线/自建优先，云厂商可选），兼顾中文场景、成本和可扩展性。

------

# 一、两条创建路径（产品流转）

## A. 上传 PDF 简历 → OCR/解析

**目标**：把用户的 PDF（文本型或扫描件）解析成「结构化 JSON + Markdown」并生成可编辑草稿。

**流水线（后台队列执行）**

1. **接收与存储**
   - `POST /api/resumes`（multipart）→ 存 S3/OSS，记录 sha256、页数、MIME。
2. **判断是否需要 OCR**
   - 尝试用 pdfplumber/pdfminer 提取文本；若无文本层/极少字符，则走 OCR（扫描件）分支。pdfplumber 本身**不具备 OCR**，对扫描 PDF 需要外部 OCR 才能取出文本。([pdfplumber.com](https://www.pdfplumber.com/is-pdfplumber-suitable-for-extracting-data-from-scanned-or-image-based-pdfs/?utm_source=chatgpt.com))
3. **文本型 PDF 分支**
   - 用 pdfminer/pdfplumber拿到**文本 + 坐标 + 版面对象**（textbox、lines）；这些库能暴露更高层布局对象以便保持阅读顺序。([GitHub](https://github.com/jsvine/pdfplumber?utm_source=chatgpt.com))
4. **扫描件 / 混合分支（OCR）**
   - 先把 PDF 渲染为**300DPI**图片页（PyMuPDF/Poppler），Tesseract 官方建议≥300dpi有助于识别质量。([Tesseract OCR](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html?utm_source=chatgpt.com))
   - **主引擎：PaddleOCR + PP-Structure**
     - PP-OCRv5 多语种（含中英）并持续提升准确率；PP-Structure/PP-StructureV3 集成**版面分析、表格识别、结构化抽取**，适合简历这种富布局文档。([GitHub](https://github.com/PaddlePaddle/PaddleOCR?utm_source=chatgpt.com))
     - 输出**文字块+边框+类别**（段落/标题/列表/表格/图片）。
   - **可选 GPU 高质引擎：docTR**（深度学习端到端文本检测+识别，支持直接输入 PDF/图像，强调**按布局组织的输出**）。([GitHub](https://github.com/mindee/doctr?utm_source=chatgpt.com))
   - **兜底：Tesseract**（纯 CPU、免费，干净文本效果好，但遇到多栏/表格需配合额外版面分析）。([Tesseract OCR](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html?utm_source=chatgpt.com))
5. **布局理解与阅读顺序**
   - PaddleOCR 的 PP-Structure 自带布局；也可结合 **LayoutParser**（Detectron2/预训练 PubLayNet）做更稳的页面元素检测与顺序重排。研究与社区经验都指出**加入布局检测能显著提升 OCR 文本质量与结构保持**。([GitHub](https://github.com/Layout-Parser/layout-parser?utm_source=chatgpt.com))
6. **归一化后处理**
   - 行合并、断词/连字符修复、项目符号识别、表格转 Markdown/HTML。产出：
     - `raw_blocks[]`（文本、bbox、type）
     - `resume_md`（用于编辑器）
     - `sections{教育|经历|项目|技能}`（启发式+正则）
7. **落库并返回**
   - `Task{status: done, output: {resume_md, blocks, pages}}`，前端取 `resume_md` 直接进编辑器。

> **云厂商可选方案**（需要省研发/要高稳 SLA）
>
> - **AWS Textract**：除文本外可识别**表格、表单、签名**，且返回**坐标框**，适合后台批量并有异步队列模式；按功能**分 API 计费**。([Amazon Web Services, Inc.](https://aws.amazon.com/textract/features/?utm_source=chatgpt.com))
> - **Google Document AI**：**Form Parser / Layout Parser**可抽取**KVP、表格、列表、段落**，覆盖 200+ 语言。([Google Cloud](https://cloud.google.com/document-ai/docs/form-parser?utm_source=chatgpt.com))
> - **Azure Document Intelligence**：**Read/ Layout** 模型抽**文本、表格、结构**，支持自定义模型。([Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/layout?view=doc-intel-4.0.0&utm_source=chatgpt.com))

## B. 基于模板新建空白简历

**目标**：一键在后端创建一份**结构化简历对象**（含默认分区 + 段落占位），返回 Markdown 给前端编辑。

**步骤**

1. `POST /api/resumes/templates/{template_id}/instantiate`
2. 生成 `Resume{ sections:[header, education, experience, project, skills], resume_md: <模板Markdown> }`
3. 返回 `resume_id` 和 `resume_md`，前端载入 TipTap 即可。

------

# 二、接口与数据结构（与你现有 Mock 一致）

- `POST /api/resumes`：上传 PDF 或文本 → `{resume_id}`
- `POST /api/resumes/:id/extract`：入队 OCR/解析任务 → `{task_id}`
- `GET /api/tasks/:id`：轮询任务，拿 `status/output`
- `GET /api/resume-templates`：列出模板（简历-校招、社招、英文学术等）
- `POST /api/resumes/templates/:tpl/instantiate`：创建空白简历
- `GET /api/resumes/:id`：取简历详情（`resume_md`, `raw_blocks`, `pages`）
- 数据要点：
  - `pages[]`：每页 `width/height/blocks[]`
  - `blocks[]`：`{type: title|paragraph|list|table|figure, text, bbox, page}`

------

# 三、后端实现与组件选型

## 1) 编排与队列

- **Next.js API** 仅负责下发任务、回查结果；
- **Python OCR 微服务（FastAPI）** 实做高性能 OCR/版面（利于用 PaddleOCR/docTR）；
- **队列**：Redis + BullMQ（Node）或 Celery（Python）都可；先用轮询，后续切队列。

## 2) OCR 服务（Python/FastAPI）伪代码

```python
# /ocr/app.py
from fastapi import FastAPI, UploadFile
from paddleocr import PaddleOCR  # ppocr
import fitz  # PyMuPDF

ocr = PaddleOCR(use_angle_cls=True, lang='ch', show_log=False)  # 可选 ch_PP-OCRv4/v5
app = FastAPI()

@app.post("/ocr/pdf")
async def ocr_pdf(file: UploadFile):
    # 1. 渲染为 300dpi 图像
    doc = fitz.open(stream=await file.read(), filetype="pdf")
    pages = []
    for p in doc:
        pix = p.get_pixmap(dpi=300)  # 300dpi: 有利于识别质量（Tesseract 文档建议）
        img = pix.tobytes("png")
        # 2. OCR
        res = ocr.ocr(img, cls=True)
        # 3. 归一化为 blocks（text, bbox, type='paragraph'）
        # 4. 结合 pp-structure 或后处理生成 markdown
        pages.append({"blocks": normalize(res)})
    return {"pages": pages, "resume_md": to_markdown(pages)}
```

> 若采用 **PP-Structure** 的版面/表格能力，请走其 `PP-Structure` 推理入口（支持**中文/英文版面模型**），可识别**文本/标题/表格/图片/列表**等结构。([paddleocr.ai](https://www.paddleocr.ai/v2.9/en/ppstructure/model_train/train_layout.html?utm_source=chatgpt.com))

## 3) 质量与健壮性策略

- **优先“文本层”**：PDF 有可抽文本就不做 OCR（更快更准）。pdfplumber 对无文本扫描件无能，自动切换 OCR 分支。([pdfplumber.com](https://www.pdfplumber.com/is-pdfplumber-suitable-for-extracting-data-from-scanned-or-image-based-pdfs/?utm_source=chatgpt.com))
- **渲染分辨率**：至少 300DPI；必要时二值化/去噪/倾斜校正。([Tesseract OCR](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html?utm_source=chatgpt.com))
- **布局→再 OCR**：复杂布局先做**布局检测**（PP-Structure 或 LayoutParser/Detectron2 + PubLayNet），再分块 OCR，结构更稳。([paddleocr.ai](https://www.paddleocr.ai/v2.9/en/ppstructure/model_train/train_layout.html?utm_source=chatgpt.com))
- **表格**：PP-StructureV3 的表格/结构化抽取可直接输出单元格关系，便于转成 Markdown/HTML。([arXiv](https://arxiv.org/html/2507.05595v1?utm_source=chatgpt.com))
- **可观测性**：落库每页**字符数/空块率/低置信度块**，回传给前端提示“重新拍照/重新上传”。

------

# 四、模型选择与组合（给你一套默认方案）

| 场景                             | 推荐方案                                                     | 原因                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 默认（自建、成本敏感，中英混排） | **PaddleOCR (PP-OCRv5) + PP-Structure**                      | 中英能力强、**集成版面+表格**、CPU 可跑、社区成熟；新版本 PP-StructureV3 强化文档解析。([GitHub](https://github.com/PaddlePaddle/PaddleOCR?utm_source=chatgpt.com)) |
| 需要更强视觉模型/GPU可用         | **docTR (Mindee)**                                           | 端到端深度学习 OCR，强调整体布局组织输出，Python 生态好。([GitHub](https://github.com/mindee/doctr?utm_source=chatgpt.com)) |
| 轻量兜底/边缘设备                | **Tesseract**                                                | CPU 轻量、免费，但对复杂布局需配合布局检测；对高分辨率更友好。([Tesseract OCR](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html?utm_source=chatgpt.com)) |
| 要高 SLA、免维护                 | **AWS Textract / Google Document AI / Azure Document Intelligence** | 一站式**文本+表格+KVP+坐标**，异步大批量、易集成；注意按功能计费。([Amazon Web Services, Inc.](https://aws.amazon.com/textract/features/?utm_source=chatgpt.com)) |

> 备注：Google Document AI 的 **Form Parser / Layout Parser** 用于 KVP 和结构抽取；Azure 的 **Read/Layout** 同理。([Google Cloud](https://cloud.google.com/document-ai/docs/form-parser?utm_source=chatgpt.com))

------

# 五、模板新建（空白简历）

**模板结构示例**

```json
{
  "id": "std-cn-fresh",
  "name": "标准·校招·中文",
  "sections": [
    {"type":"header","fields":["姓名","邮箱","电话","链接"]},
    {"type":"education","items":[]},
    {"type":"experience","items":[]},
    {"type":"project","items":[]},
    {"type":"skills","items":[]}
  ],
  "markdown": "# 个人信息\\n- 姓名：\\n- 邮箱：\\n- 电话：\\n\\n## 教育经历\\n- 学校 / 专业 / 时间\\n\\n## 实习 / 工作经历\\n- 公司 / 职位 / 结果（量化）\\n\\n## 项目经历\\n- 项目名 / 角色 / 贡献\\n\\n## 技能\\n- 语言 / 框架 / 工具"
}
```

**接口**

- `GET /api/resume-templates` → 列表（支持中英文/校招社招/学术）
- `POST /api/resumes/templates/:tpl/instantiate` → 新建并返回 `{resume_id, resume_md, sections}`

------

# 六、成本与上线建议

- **先自建 PaddleOCR**（CPU 即可，成本近乎 0）；
- 企业/大批量时，**开云服务异步批处理**（S3→Textract→SQS 模式，Feature 组合会**叠加计费**，注意控制调用）。([cloudchipr.com](https://cloudchipr.com/blog/aws-textract?utm_source=chatgpt.com))
- **可选：OCRmyPDF** 生成**可检索 PDF**副本，便于以后全文检索/二次加工。([Stack Overflow](https://stackoverflow.com/questions/55704218/how-to-check-if-pdf-is-scanned-image-or-contains-text?utm_source=chatgpt.com))

------

如果你点头，我就按这套设计把：

1. `POST /api/resumes/:id/extract` 的 **Python OCR 服务**（PaddleOCR+PP-Structure）
2. `POST /api/resumes/templates/:tpl/instantiate` 的 **模板实例化接口**

直接写成**最小可运行版本**给你贴到项目里用。



好，给你一套**最小可运行示例（默认场景）**：

- 支持**上传 PDF 简历 → 自动判断是否需要 OCR → 产出 Markdown**；
- 支持**基于模板新建空白简历**；
- 采用 **FastAPI(后端服务)** + **PaddleOCR（OCR）** + **PyMuPDF（渲染与文本层提取）**。
- 说明里顺带标注了关键依据与文档链接。

------

# 1) 后端（Python/FastAPI）——单服务搞定

## 1.1 安装

```bash
# CPU 版足够先跑通（如需 GPU 再换成 paddlepaddle-gpu）
pip install -U fastapi uvicorn python-multipart pymupdf "paddleocr>=2.7" "paddlepaddle>=2.6"
```

- **PaddleOCR** 提供 PP-OCRv5 的通用 OCR 流水线（默认 server 模型），适合中英环境。([PaddlePaddle](https://paddlepaddle.github.io/PaddleOCR/main/en/version3.x/pipeline_usage/OCR.html?utm_source=chatgpt.com))
- **PyMuPDF** 可直接把 PDF 页面渲染为 **300 DPI** 图片用于 OCR（`page.get_pixmap(dpi=300)`）。([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/recipes-images.html?utm_source=chatgpt.com))
- FastAPI 的文件上传用 `UploadFile` / `python-multipart`。([fastapi.tiangolo.com](https://fastapi.tiangolo.com/tutorial/request-files/?utm_source=chatgpt.com))

## 1.2 启动脚本 `app.py`

```python
# app.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
import fitz  # PyMuPDF
import io
import re
import time
from typing import List, Dict, Any

app = FastAPI(title="Resume OCR Service")

# 初始化 OCR 引擎（PP-OCRv5，中文+英文，CPU）
ocr = PaddleOCR(use_angle_cls=True, lang='ch', show_log=False)  # 需要时可切 en / multilang

# ====== 工具函数 ======
def page_text_or_ocr(page: "fitz.Page") -> Dict[str, Any]:
    """
    先尝试读文本层；若文本太少（判定为扫描件），再走 OCR。
    """
    # 1) 文本层
    txt = page.get_text("text") or ""  # 有文本层时优先使用
    if len(txt.strip()) >= 40:
        return {"mode": "text", "text": txt}

    # 2) OCR（300 DPI 渲染）
    pix = page.get_pixmap(dpi=300)  # 300dpi 对 OCR 识别质量更稳
    img_bytes = pix.tobytes("png")
    res = ocr.ocr(img_bytes, cls=True)

    # PaddleOCR 返回：每行 [ [x1,y1...x4,y4], (text, conf) ]
    lines = []
    for line in res[0] if res else []:
        text = line[1][0]
        conf = float(line[1][1])
        if text.strip():
            lines.append((text, conf))

    # 简单按置信度过滤与拼接
    lines = [t for t, c in lines if c >= 0.5]
    text = "\n".join(lines)
    return {"mode": "ocr", "text": text}

def normalize_to_markdown(pages_text: List[str]) -> str:
    """
    极简：把整份文本做基础清洗并组织为 Markdown。
    真实业务里建议引入布局/标题识别与更细分的段落切分。
    """
    full = "\n\n".join(pages_text)
    # 常见中文简历分段标题的弱匹配
    full = re.sub(r"(?m)^(教育|教育经历)[:：]?$", r"## 教育经历", full)
    full = re.sub(r"(?m)^(工作|工作经历|实习|实习经历)[:：]?$", r"## 工作 / 实习经历", full)
    full = re.sub(r"(?m)^(项目|项目经历)[:：]?$", r"## 项目经历", full)
    full = re.sub(r"(?m)^(技能|技能特长)[:：]?$", r"## 技能", full)
    full = re.sub(r"(?m)^(获奖|奖项|证书)[:：]?$", r"## 奖项 / 证书", full)
    # 一些项目符号修复
    full = re.sub(r"•|·|●", r"-", full)
    return f"# 简历草稿\n\n{full.strip()}"

# ====== API ======

@app.post("/ocr/pdf")
async def ocr_pdf(file: UploadFile = File(...)):
    """
    接收 PDF：逐页提取文本层或 OCR，最后合成 Markdown。
    返回：pages[{mode,text}] + resume_md
    """
    tic = time.time()
    raw = await file.read()
    doc = fitz.open(stream=raw, filetype="pdf")
    pages = []
    for i in range(len(doc)):
        page = doc.load_page(i)
        result = page_text_or_ocr(page)
        pages.append({"index": i, **result})
    resume_md = normalize_to_markdown([p["text"] for p in pages])
    return JSONResponse({
        "pages": pages,
        "resume_md": resume_md,
        "page_count": len(pages),
        "latency_ms": int((time.time() - tic) * 1000)
    })

@app.get("/templates")
def list_templates():
    """
    列出可用模板（这里只放一个默认模板）
    """
    return [
        {"id": "std-cn-fresh", "name": "标准·中文·空白（校招/社招通用）"}
    ]

@app.post("/templates/instantiate")
def instantiate_template(template_id: str = Form("std-cn-fresh")):
    """
    基于模板创建空白简历，返回 resume_md（可直接丢给前端编辑器）
    """
    if template_id != "std-cn-fresh":
        template_id = "std-cn-fresh"

    md = (
        "# 个人信息\n"
        "- 姓名：\n- 邮箱：\n- 电话：\n- 链接（GitHub/主页）：\n\n"
        "## 教育经历\n"
        "- 学校 / 专业 / 学位 / 时间\n  - 课程/排名/奖学金（可选）\n\n"
        "## 工作 / 实习经历\n"
        "- 公司 / 职位 / 时间\n  - 关键成果（量化，如 DAU +12%、延迟 -30%）\n  - 负责的技术栈 / 业务模块\n\n"
        "## 项目经历\n"
        "- 项目名 / 角色 / 时间\n  - 背景 → 动作 → 结果（STAR 法）\n\n"
        "## 技能\n"
        "- 语言 / 框架 / 工具（按熟练度排序）\n"
    )
    return {"template_id": template_id, "resume_md": md}
```

运行：

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 7001
```

### 接口测试（curl）

```bash
# 1) 上传 PDF + OCR
curl -F "file=@/path/to/your_resume.pdf" http://localhost:7001/ocr/pdf

# 2) 列模板
curl http://localhost:7001/templates

# 3) 实例化空白简历
curl -X POST -F "template_id=std-cn-fresh" http://localhost:7001/templates/instantiate
```

> 说明
>
> - 之所以**先尝试文本层**再 OCR，是因为很多 PDF 并非扫描件，直接取文本层更快且更准；只有文本极少时才走 OCR 分支。渲染为 **300DPI** 图片再 OCR 是 PyMuPDF 官方建议的常用做法之一，有助于保证识别质量。([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/recipes-images.html?utm_source=chatgpt.com))
> - OCR 默认用 **PP-OCRv5 pipeline**（PaddleOCR 3.0 默认 server 模型），在通用中文/英文文档上表现稳定；后续若要表格/版面更细结构化，可接 **PP-Structure**（支持文本/标题/表格/图片等区域分类与结构恢复）。([PaddlePaddle](https://paddlepaddle.github.io/PaddleOCR/main/en/version3.x/pipeline_usage/OCR.html?utm_source=chatgpt.com))

------

# 2) 与你现有 Next.js 前端对接（极简代理）

若你希望沿用 `/api/resumes` 这一路径，可以在 Next.js 里**转发到上面的 FastAPI**。

**`apps/web/src/app/api/resumes/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server"

const OCR_BASE = process.env.OCR_BASE || "http://localhost:7001"

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || ""
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ message: "upload PDF via multipart/form-data" }, { status: 400 })
  }
  const fd = await req.formData()
  const form = new FormData()
  const file = fd.get("file")
  if (file instanceof File) form.append("file", file, file.name)

  const r = await fetch(`${OCR_BASE}/ocr/pdf`, { method: "POST", body: form })
  const data = await r.json()
  // 统一后端数据形状：返回 resume_md 给前端编辑器
  return NextResponse.json({ resume_md: data.resume_md, pages: data.pages, page_count: data.page_count })
}
```

**`apps/web/src/app/api/resume-templates/[id]/instantiate/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server"
const OCR_BASE = process.env.OCR_BASE || "http://localhost:7001"

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const form = new FormData()
  form.append("template_id", params.id || "std-cn-fresh")
  const r = await fetch(`${OCR_BASE}/templates/instantiate`, { method: "POST", body: form })
  const data = await r.json()
  return NextResponse.json({ resume_md: data.resume_md })
}
```

> 这样你的前端只需要：
>
> - 上传 PDF → `POST /api/resumes` → 直接拿 `resume_md` 放进 TipTap；
> - 新建空白 → `POST /api/resume-templates/std-cn-fresh/instantiate` → 返回 `resume_md`。

------

# 3) 后续增强位点（保持与本示例兼容）

- **版面/表格结构化**：接入 **PP-Structure**（布局分类、表格识别、KIE），可输出更丰富的 `blocks[] / tables[]`。([Gitee](https://gitee.com/yang_le_gittee/PaddleOCR/blob/release/2.6/ppstructure/README.md?utm_source=chatgpt.com))
- **质量指标**：在响应中回传每页的 `ocr_ratio/avg_conf`，低于阈值提示“重新拍照或换源文件”。
- **存储**：把 `resume_md` 与 `pages/blocks` 落到数据库（Prisma/PG），与你现有 `Task`/`Resume` 模型对齐即可。
- **高并发**：FastAPI 单点可配多 worker；或拆为 Celery 队列，Next.js 只管轮询任务状态。

------

## 参考

- PaddleOCR 通用 OCR 流水线（支持 PP-OCRv3/v4/v5，默认 v5 server）。([PaddlePaddle](https://paddlepaddle.github.io/PaddleOCR/main/en/version3.x/pipeline_usage/OCR.html?utm_source=chatgpt.com))
- PP-Structure：版面分析、表格识别、结构恢复/导出。([Gitee](https://gitee.com/yang_le_gittee/PaddleOCR/blob/release/2.6/ppstructure/README.md?utm_source=chatgpt.com))
- PyMuPDF：`get_pixmap(dpi=300)` 渲染页面、控制分辨率。([pymupdf.readthedocs.io](https://pymupdf.readthedocs.io/en/latest/recipes-images.html?utm_source=chatgpt.com))
- FastAPI 文件上传：`UploadFile` / `python-multipart`。([fastapi.tiangolo.com](https://fastapi.tiangolo.com/tutorial/request-files/?utm_source=chatgpt.com))

------

需要我把这套服务做成 **Dockerfile + docker-compose**（Python OCR + Next.js API 一键起）也可以马上补上。