from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from .schemas import ResumeBlock, ResumeContacts, ResumeMetadata, ResumeResponse


@dataclass(slots=True)
class ResumeRecord:
  id: str
  user_id: str
  source: str
  template_key: Optional[str]
  title: Optional[str]
  file_name: Optional[str]
  mime_type: Optional[str]
  raw_text: str
  parsed_blocks: List[ResumeBlock]
  skills: List[str]
  contacts: ResumeContacts
  metadata: ResumeMetadata
  created_at: datetime = field(default_factory=datetime.utcnow)
  updated_at: datetime = field(default_factory=datetime.utcnow)


class ResumeStore:
  def __init__(self) -> None:
    self._resumes: Dict[str, ResumeRecord] = {}

  def create(self, record: ResumeRecord) -> ResumeRecord:
    record.created_at = datetime.utcnow()
    record.updated_at = record.created_at
    self._resumes[record.id] = record
    return record

  def update(self, record: ResumeRecord) -> ResumeRecord:
    record.updated_at = datetime.utcnow()
    self._resumes[record.id] = record
    return record

  def generate_id(self) -> str:
    return f"r_{uuid4().hex[:8]}"

  def list_by_user(self, user_id: str) -> List[ResumeRecord]:
    return [resume for resume in self._resumes.values() if resume.user_id == user_id]

  def get(self, resume_id: str) -> Optional[ResumeRecord]:
    return self._resumes.get(resume_id)

  def latest(self, user_id: str) -> Optional[ResumeRecord]:
    records = self.list_by_user(user_id)
    if not records:
      return None
    return max(records, key=lambda rec: rec.updated_at)


def record_to_response(record: ResumeRecord) -> ResumeResponse:
  return ResumeResponse(
    id=record.id,
    raw_text=record.raw_text,
    parsed_blocks=record.parsed_blocks,
    skills=record.skills,
    contacts=record.contacts,
    metadata=record.metadata,
    created_at=record.created_at,
    updated_at=record.updated_at,
  )
