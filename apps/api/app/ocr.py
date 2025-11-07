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
