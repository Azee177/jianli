from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from typing import Optional

import httpx

from .config import get_settings

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class OcrResult:
  text: str
  page_count: Optional[int] = None
  confidence: Optional[float] = None
  latency_ms: Optional[int] = None
  engine: str = "pdf-text"
  ocr_gateway_used: bool = False


def extract_text_from_pdf(data: bytes) -> OcrResult:
  """从PDF提取文本 - 简化版本，避免依赖问题"""
  try:
    # 尝试导入pymupdf
    try:
      import fitz
      doc = fitz.open(stream=data, filetype="pdf")
      
      texts = []
      for page in doc:
        page_text = page.get_text("text").strip()
        if page_text:
          texts.append(page_text)
      combined = "\n\n".join(texts)

      confidence = None
      if texts:
        avg_len = sum(len(t) for t in texts) / len(texts)
        confidence = 0.95 if avg_len > 80 else 0.8

      return OcrResult(
        text=combined.strip(),
        page_count=doc.page_count,
        confidence=confidence,
        engine="pdf-text",
      )
      
    except ImportError:
      # 如果pymupdf不可用，尝试其他方法
      logger.warning("PyMuPDF not available, trying alternative PDF extraction")
      
      try:
        # 尝试使用pdfminer.six
        from pdfminer.high_level import extract_text
        text = extract_text(io.BytesIO(data))
        
        return OcrResult(
          text=text.strip(),
          page_count=1,  # 无法准确获取页数
          confidence=0.8,
          engine="pdfminer",
        )
      except ImportError:
        logger.warning("pdfminer.six not available, returning empty result")
        return OcrResult(text="", engine="none")
        
  except Exception as exc:
    logger.error("Failed to extract text from PDF: %s", exc)
    return OcrResult(text="", engine="error")


async def fallback_ocr_with_gateway(data: bytes, file_name: str | None, mime_type: str | None) -> OcrResult | None:
  """使用外部OCR网关服务"""
  settings = get_settings()
  if not settings.ocr_service_url:
    return None

  try:
    async with httpx.AsyncClient(timeout=120) as client:
      files = {
        "file": (
          file_name or "resume.pdf",
          io.BytesIO(data),
          mime_type or "application/pdf",
        )
      }
      response = await client.post(f"{settings.ocr_service_url.rstrip('/')}/ocr/pdf", files=files)
      response.raise_for_status()
      payload = response.json()
  except Exception as exc:
    logger.error("OCR gateway request failed: %s", exc)
    return None

  pages = payload.get("pages") or []
  text = "\n\n".join(page.get("text", "") for page in pages if page.get("text"))
  return OcrResult(
    text=text.strip(),
    page_count=payload.get("page_count"),
    latency_ms=payload.get("latency_ms"),
    confidence=payload.get("confidence"),
    engine="ocr-image",
    ocr_gateway_used=True,
  )


def extract_photo_regions(pdf_bytes: bytes) -> list[dict]:
  """识别PDF中的照片区域
  
  Returns:
    List of photo regions with coordinates and page numbers
  """
  regions = []
  try:
    import fitz
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    for page_num, page in enumerate(doc):
      images = page.get_images(full=True)
      
      for img_info in images:
        bbox = page.get_image_bbox(img_info)
        if bbox:
          regions.append({
            "page": page_num + 1,
            "x": bbox.x0,
            "y": bbox.y0,
            "width": bbox.width,
            "height": bbox.height,
            "aspect_ratio": bbox.width / bbox.height if bbox.height > 0 else 0
          })
    
    doc.close()
  except Exception as exc:
    logger.error("Failed to extract photo regions: %s", exc)
  
  return regions


def extract_contact_info(text: str) -> dict:
  """从文本中提取联系方式信息
  
  Returns:
    Dict with phone, email, wechat, etc.
  """
  import re
  
  contact_info = {
    "phone": None,
    "email": None,
    "wechat": None,
    "github": None,
    "linkedin": None,
    "address": None
  }
  
  # 提取手机号 (中国手机号)
  phone_pattern = r'1[3-9]\d{9}'
  phone_match = re.search(phone_pattern, text)
  if phone_match:
    contact_info["phone"] = phone_match.group()
  
  # 提取邮箱
  email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
  email_match = re.search(email_pattern, text)
  if email_match:
    contact_info["email"] = email_match.group()
  
  # 提取微信 (通常在"微信:"、"WeChat:"等关键词后)
  wechat_pattern = r'(?:微信|WeChat|wechat|WX)[：:]\s*([A-Za-z0-9_-]+)'
  wechat_match = re.search(wechat_pattern, text)
  if wechat_match:
    contact_info["wechat"] = wechat_match.group(1)
  
  # 提取GitHub
  github_pattern = r'github\.com/([A-Za-z0-9_-]+)'
  github_match = re.search(github_pattern, text, re.IGNORECASE)
  if github_match:
    contact_info["github"] = github_match.group(1)
  
  # 提取LinkedIn
  linkedin_pattern = r'linkedin\.com/in/([A-Za-z0-9_-]+)'
  linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
  if linkedin_match:
    contact_info["linkedin"] = linkedin_match.group(1)
  
  return contact_info


def extract_education_info(text: str) -> list[dict]:
  """从文本中提取教育背景信息
  
  Returns:
    List of education records
  """
  import re
  
  education_records = []
  
  # 查找教育相关的段落
  education_keywords = ['教育经历', '教育背景', 'Education', 'EDUCATION', '学历']
  
  # 常见学历关键词
  degree_keywords = ['博士', '硕士', '学士', '本科', 'PhD', 'Master', 'Bachelor', 'MBA']
  
  # 常见大学关键词
  university_keywords = ['大学', '学院', 'University', 'College', 'Institute']
  
  # 简单的规则提取
  lines = text.split('\n')
  for i, line in enumerate(lines):
    # 检查是否包含学历关键词
    has_degree = any(keyword in line for keyword in degree_keywords)
    has_university = any(keyword in line for keyword in university_keywords)
    
    if has_degree or has_university:
      # 尝试提取时间
      date_pattern = r'(\d{4})[年\.\-/]?\d{0,2}.*?(\d{4})[年\.\-/]?\d{0,2}'
      date_match = re.search(date_pattern, line)
      
      education_records.append({
        "school": line.strip(),
        "degree": None,  # 需要更精细的提取
        "major": None,   # 需要更精细的提取
        "start_date": date_match.group(1) if date_match else None,
        "end_date": date_match.group(2) if date_match else None,
        "raw_text": line.strip()
      })
  
  return education_records


def extract_work_experience(text: str) -> list[dict]:
  """从文本中结构化提取工作经历
  
  Returns:
    List of work experience records
  """
  import re
  
  work_records = []
  
  # 查找工作经历相关的段落
  work_keywords = ['工作经历', '工作经验', 'Work Experience', 'WORK EXPERIENCE', '项目经验']
  
  # 尝试找到工作经历部分
  lines = text.split('\n')
  in_work_section = False
  current_record = None
  
  for line in lines:
    line = line.strip()
    if not line:
      continue
    
    # 检查是否进入工作经历部分
    if any(keyword in line for keyword in work_keywords):
      in_work_section = True
      continue
    
    # 检查是否离开工作经历部分（进入其他部分）
    other_section_keywords = ['教育经历', '技能', '证书', 'Education', 'Skills', 'Certificates']
    if any(keyword in line for keyword in other_section_keywords):
      in_work_section = False
      if current_record:
        work_records.append(current_record)
        current_record = None
      continue
    
    if in_work_section:
      # 尝试识别公司和职位行（通常包含时间）
      date_pattern = r'(\d{4})[年\.\-/]?\d{0,2}.*?(\d{4}|至今|present)[年\.\-/]?\d{0,2}'
      date_match = re.search(date_pattern, line)
      
      if date_match:
        # 这可能是一条新的工作记录
        if current_record:
          work_records.append(current_record)
        
        current_record = {
          "company": None,
          "position": None,
          "start_date": date_match.group(1),
          "end_date": date_match.group(2),
          "description": [],
          "raw_text": line
        }
      elif current_record:
        # 这是工作描述的一部分
        current_record["description"].append(line)
  
  # 添加最后一条记录
  if current_record:
    work_records.append(current_record)
  
  return work_records
