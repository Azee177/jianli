from __future__ import annotations

from datetime import datetime
from typing import Any, Optional, List
from enum import Enum

from pydantic import BaseModel, Field


class ResumeBlock(BaseModel):
  type: str = Field(..., description="Block category, e.g. header/experience/project")
  text: str


class ResumeContacts(BaseModel):
  name: Optional[str] = None
  email: Optional[str] = None
  phone: Optional[str] = None
  location: Optional[str] = None
  website: Optional[str] = None


class ResumeMetadata(BaseModel):
  ocrEngine: Optional[str] = None
  pageCount: Optional[int] = None
  confidence: Optional[float] = None
  latencyMs: Optional[int] = None
  sha256: Optional[str] = None
  ocrGatewayUsed: Optional[bool] = None
  language: Optional[str] = None
  templateKey: Optional[str] = None
  title: Optional[str] = None
  fileName: Optional[str] = None
  mimeType: Optional[str] = None


class ResumeResponse(BaseModel):
  id: str
  raw_text: str
  parsed_blocks: list[ResumeBlock]
  skills: list[str]
  contacts: ResumeContacts
  metadata: ResumeMetadata
  created_at: datetime
  updated_at: datetime


class ResumeListResponse(BaseModel):
  items: list[ResumeResponse]


class DraftSummary(BaseModel):
  versionId: str
  journeyId: str
  type: str
  summary: str
  updatedAt: datetime


class DraftListResponse(BaseModel):
  drafts: list[DraftSummary]


class ResumeTemplate(BaseModel):
  id: str
  name: str
  locale: str
  description: Optional[str] = None
  defaultTitle: Optional[str] = None
  markdown: str


class TemplateListResponse(BaseModel):
  templates: list[ResumeTemplate]


class InstantiateTemplateResponse(ResumeResponse):
  pass


# JD相关Schema
class JDSource(str, Enum):
  SHIXISENG = "shixiseng"
  ZHAOPIN = "zhaopin"
  JOB51 = "job51"
  BOSS = "boss"
  MANUAL = "manual"


class JDRequest(BaseModel):
  url: Optional[str] = None
  text: Optional[str] = None
  company: Optional[str] = None
  title: Optional[str] = None
  city: Optional[str] = None


class JDResponse(BaseModel):
  id: str
  company: str
  title: str
  location: Optional[str] = None
  jd_text: str
  must_have_skills: List[str] = Field(default_factory=list)
  nice_to_have: List[str] = Field(default_factory=list)
  source: JDSource
  source_url: Optional[str] = None
  created_at: datetime


class JDListResponse(BaseModel):
  items: List[JDResponse]


# 目标岗位Schema
class TargetRequest(BaseModel):
  company: str
  title: str
  city: Optional[str] = None
  description: Optional[str] = None


class TargetResponse(BaseModel):
  id: str
  company: str
  title: str
  city: Optional[str] = None
  description: Optional[str] = None
  created_at: datetime


# 共性提炼Schema
class CommonalityRequest(BaseModel):
  jd_ids: List[str]
  company_preference: Optional[str] = None


class CommonalityItem(BaseModel):
  text: str
  frequency: int
  importance: float


class CommonalityResponse(BaseModel):
  id: str
  query_info: dict
  items_15: List[CommonalityItem]
  top_5: List[CommonalityItem]
  created_at: datetime


# 任务相关Schema
class TaskStatus(str, Enum):
  QUEUED = "queued"
  RUNNING = "running"
  DONE = "done"
  ERROR = "error"


class TaskType(str, Enum):
  OCR = "ocr"
  JD_FETCH = "jd_fetch"
  COMMONALITY = "commonality"
  OPTIMIZE = "optimize"
  EXPORT = "export"


class TaskResponse(BaseModel):
  id: str
  type: TaskType
  status: TaskStatus
  progress: Optional[int] = None
  result: Optional[dict] = None
  error: Optional[str] = None
  cost: Optional[float] = None
  latency_ms: Optional[int] = None
  created_at: datetime
  updated_at: datetime


# 简历优化Schema
class OptimizePreviewRequest(BaseModel):
  commonality_id: str
  sections: Optional[List[str]] = None


class OptimizePreviewResponse(BaseModel):
  id: str
  original_text: str
  optimized_text: str
  suggestions: List[dict]
  changes: List[dict]


class OptimizeApplyRequest(BaseModel):
  preview_id: str
  selected_changes: List[str]


# 学习计划Schema
class KnowledgeItem(BaseModel):
  title: str
  url: str
  why: str
  source: str = "bilibili"


class StudyPlanResponse(BaseModel):
  id: str
  resume_id: str
  knowledge_items: List[KnowledgeItem]
  created_at: datetime


# 面试问答Schema
class InterviewQuestion(BaseModel):
  question: str
  category: str
  difficulty: str
  follow_ups: Optional[List[str]] = None


class InterviewQAResponse(BaseModel):
  id: str
  resume_id: str
  questions: List[InterviewQuestion]
  created_at: datetime


# 导出Schema
class ExportFormat(str, Enum):
  PDF = "pdf"
  DOCX = "docx"


class ExportRequest(BaseModel):
  resume_id: str
  format: ExportFormat
  template_id: Optional[str] = None
  theme_color: Optional[str] = None
  hide_sensitive: bool = False


class ExportResponse(BaseModel):
  id: str
  resume_id: str
  format: ExportFormat
  file_url: str
  file_size: Optional[int] = None
  created_at: datetime


# 预签名上传Schema
class PresignRequest(BaseModel):
  file_name: str
  file_size: int
  content_type: str


class PresignResponse(BaseModel):
  upload_url: str
  object_key: str
  expires_in: int
  fields: Optional[dict] = None


# WebSocket消息Schema
class WSMessage(BaseModel):
  type: str
  task_id: Optional[str] = None
  data: Optional[dict] = None
  timestamp: datetime = Field(default_factory=datetime.utcnow)