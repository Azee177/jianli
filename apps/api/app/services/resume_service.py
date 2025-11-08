from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4
import logging

from fastapi import HTTPException, status

from .. import parser
from ..llm_parser import get_llm_parser
from ..ocr import OcrResult, extract_text_from_pdf, fallback_ocr_with_gateway
from ..schemas import (
  DraftSummary,
  InstantiateTemplateResponse,
  ResumeMetadata,
  ResumeResponse,
  ResumeTemplate,
)
from ..store import ResumeRecord, ResumeStore, record_to_response

logger = logging.getLogger(__name__)


DEFAULT_USER_ID = "demo-user"


class ResumeService:
  def __init__(self, store: ResumeStore, templates: list[ResumeTemplate]) -> None:
    self.store = store
    self.templates = {tpl.id: tpl for tpl in templates}

  async def create_resume(
    self,
    *,
    user_id: Optional[str],
    text: Optional[str],
    file_bytes: Optional[bytes],
    file_name: Optional[str],
    mime_type: Optional[str],
    template_key: Optional[str],
    title: Optional[str],
    use_llm: bool = True,  # 新增：是否使用LLM解析
  ) -> ResumeResponse:
    user = user_id or DEFAULT_USER_ID
    normalized_text = (text or "").strip()
    ocr_meta: OcrResult | None = None

    if not normalized_text and file_bytes:
      ocr_meta = extract_text_from_pdf(file_bytes)
      normalized_text = ocr_meta.text.strip()

      if not normalized_text:
        ocr_meta = await fallback_ocr_with_gateway(file_bytes, file_name, mime_type)
        if ocr_meta:
          normalized_text = ocr_meta.text.strip()

    if not normalized_text:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="未能从上传内容识别出文本，请检查文件是否清晰。",
      )

    # 使用LLM或规则解析
    if use_llm:
      try:
        logger.info(f"使用LLM解析简历，文件: {file_name}")
        llm_parser_instance = get_llm_parser()
        enhanced_parsed = await llm_parser_instance.parse_resume(
          normalized_text,
          use_llm=True,
          fallback_to_rules=True
        )
        parsed = enhanced_parsed  # 使用增强解析结果
        logger.info(f"解析方法: {enhanced_parsed.parsing_method}, 置信度: {enhanced_parsed.confidence_score}")
      except Exception as e:
        logger.error(f"LLM解析失败，降级到规则解析: {e}")
        parsed = parser.parse_resume(normalized_text)
    else:
      parsed = parser.parse_resume(normalized_text)

    metadata = ResumeMetadata(
      ocrEngine=(ocr_meta.engine if ocr_meta else "manual"),
      pageCount=ocr_meta.page_count if ocr_meta else None,
      confidence=ocr_meta.confidence if ocr_meta else None,
      latencyMs=ocr_meta.latency_ms if ocr_meta else None,
      ocrGatewayUsed=ocr_meta.ocr_gateway_used if ocr_meta else None,
      language=parsed.language,
      templateKey=template_key,
      title=title,
      fileName=file_name,
      mimeType=mime_type,
      sha256=self._hash_bytes(file_bytes) if file_bytes else None,
    )

    resume_id = self.store.generate_id()
    
    # 提取LLM解析的额外字段
    structured_sections = getattr(parsed, 'structured_sections', None)
    confidence_score = getattr(parsed, 'confidence_score', None)
    parsing_method = getattr(parsed, 'parsing_method', 'rule-based')
    
    record = ResumeRecord(
      id=resume_id,
      user_id=user,
      source="UPLOAD" if file_bytes else "MANUAL",
      template_key=template_key,
      title=title,
      file_name=file_name,
      mime_type=mime_type,
      raw_text=parsed.normalized,
      parsed_blocks=parsed.blocks,
      skills=parsed.skills,
      contacts=parsed.contacts,
      metadata=metadata,
      structured_sections=structured_sections,
      confidence_score=confidence_score,
      parsing_method=parsing_method,
    )

    saved = self.store.create(record)
    return record_to_response(saved)

  def list_resumes(self, user_id: Optional[str]) -> list[ResumeResponse]:
    user = user_id or DEFAULT_USER_ID
    return [record_to_response(rec) for rec in self.store.list_by_user(user)]

  def get_resume(self, resume_id: str, user_id: Optional[str]) -> ResumeResponse:
    record = self.store.get(resume_id)
    if not record:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="简历不存在")
    if user_id and record.user_id != user_id:
      raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权访问该简历")
    return record_to_response(record)

  def list_drafts(self, user_id: Optional[str]) -> list[DraftSummary]:
    user = user_id or DEFAULT_USER_ID
    drafts: list[DraftSummary] = []
    for record in self.store.list_by_user(user):
      summary = parser.summarize_block(record.parsed_blocks[:1]) or record.raw_text[:140]
      drafts.append(
        DraftSummary(
          versionId=record.id,
          journeyId="demo-journey-001",
          type="ORIGINAL" if record.source == "UPLOAD" else "DRAFT_V1",
          summary=summary,
          updatedAt=record.updated_at,
        )
      )
    drafts.sort(key=lambda d: d.updatedAt, reverse=True)
    return drafts

  def latest_draft(self, user_id: Optional[str]) -> DraftSummary | None:
    user = user_id or DEFAULT_USER_ID
    record = self.store.latest(user)
    if not record:
      return None
    summary = parser.summarize_block(record.parsed_blocks[:1]) or record.raw_text[:140]
    return DraftSummary(
      versionId=record.id,
      journeyId="demo-journey-001",
      type="ORIGINAL" if record.source == "UPLOAD" else "DRAFT_V1",
      summary=summary,
      updatedAt=record.updated_at,
    )

  def list_templates(self) -> list[ResumeTemplate]:
    return list(self.templates.values())

  async def instantiate_template(
    self,
    *,
    template_id: str,
    user_id: Optional[str],
    title: Optional[str],
  ) -> InstantiateTemplateResponse:
    template = self.templates.get(template_id)
    if not template:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模板不存在")

    user = user_id or DEFAULT_USER_ID
    parsed = parser.parse_resume(template.markdown)

    metadata = ResumeMetadata(
      ocrEngine="manual",
      language=parsed.language,
      templateKey=template.id,
      title=title or template.defaultTitle,
    )

    record = ResumeRecord(
      id=f"r_{uuid4().hex[:8]}",
      user_id=user,
      source="TEMPLATE",
      template_key=template.id,
      title=title or template.defaultTitle,
      file_name=None,
      mime_type=None,
      raw_text=template.markdown,
      parsed_blocks=parsed.blocks,
      skills=parsed.skills,
      contacts=parsed.contacts,
      metadata=metadata,
    )

    saved = self.store.create(record)
    return record_to_response(saved)  # type: ignore[return-value]

  @staticmethod
  def _hash_bytes(data: Optional[bytes]) -> Optional[str]:
    if not data:
      return None
    import hashlib

    return hashlib.sha256(data).hexdigest()