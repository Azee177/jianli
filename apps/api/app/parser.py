from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

from .schemas import ResumeBlock, ResumeContacts

SECTION_KEYWORDS: dict[str, list[str]] = {
  "header": ["个人信息", "联系", "contact", "resume"],
  "summary": ["简介", "概述", "summary", "profile"],
  "education": ["教育", "education", "学历"],
  "experience": ["工作经历", "experience", "实习", "employment"],
  "project": ["项目经历", "projects", "project"],
  "skills": ["技能", "skills", "tech stack"],
  "awards": ["荣誉", "奖项", "awards", "certificates"],
}

SKILL_DICTIONARY = [
  "Python",
  "Java",
  "C++",
  "Go",
  "TypeScript",
  "JavaScript",
  "React",
  "Vue",
  "Node",
  "Node.js",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "LangChain",
  "LLM",
  "AI",
  "Machine Learning",
  "深度学习",
  "机器学习",
  "产品经理",
  "项目管理",
  "数据分析",
  "运营",
  "增长",
]


@dataclass(slots=True)
class ParsedResume:
  normalized: str
  blocks: list[ResumeBlock]
  contacts: ResumeContacts
  skills: list[str]
  language: str


def parse_resume(text: str) -> ParsedResume:
  normalized = normalize_text(text)
  blocks = split_into_blocks(normalized)
  contacts = extract_contacts(normalized)
  skills = extract_skills(normalized)
  language = detect_language(normalized)
  return ParsedResume(
    normalized=normalized,
    blocks=blocks,
    contacts=contacts,
    skills=skills,
    language=language,
  )


def normalize_text(text: str) -> str:
  return (
    text.replace("\r\n", "\n")
    .replace("\u00a0", " ")
    .replace("\u2022", "-")
    .strip()
  )


def detect_language(text: str) -> str:
  chinese = len(re.findall(r"[\u4e00-\u9fff]", text))
  latin = len(re.findall(r"[A-Za-z]", text))
  if chinese == 0 and latin == 0:
    return "unknown"
  return "zh" if chinese >= latin else "en"


def split_into_blocks(text: str) -> list[ResumeBlock]:
  if not text:
    return []

  lines = text.split("\n")
  blocks: list[ResumeBlock] = []
  buffer: list[str] = []
  current_type = "header"

  def flush():
    content = "\n".join(buffer).strip()
    if content:
      blocks.append(ResumeBlock(type=current_type, text=content))
    buffer.clear()

  for raw_line in lines:
    line = raw_line.strip()
    if not line:
      buffer.append("")
      continue
    detected = detect_section(line)
    if detected and detected != current_type:
      flush()
      current_type = detected
    buffer.append(raw_line)

  flush()
  return blocks or [ResumeBlock(type="summary", text=text)]


def detect_section(line: str) -> str | None:
  lower = line.lower()
  for section, keywords in SECTION_KEYWORDS.items():
    if any(lower.startswith(keyword.lower()) for keyword in keywords):
      return section
  if re.match(r".+[：:]\s*$", line):
    return "summary"
  return None


def extract_contacts(text: str) -> ResumeContacts:
  email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
  phone_match = re.search(r"(?:\+?86[-\s]?)?1[3-9]\d{9}|(?:\d{3,4}[-\s]\d{7,8})", text)
  website_match = re.search(r"https?://[^\s]+", text)
  location_match = re.search(r"(北京|上海|广州|深圳|杭州|成都|武汉|南京|天津|重庆|西安)", text)

  first_lines = [line.strip() for line in text.split("\n")[:5] if line.strip()]
  name_candidate = None
  for fl in first_lines:
    if len(fl) <= 15 and not re.search(r"[@：:]", fl):
      name_candidate = fl
      break

  return ResumeContacts(
    name=name_candidate,
    email=email_match.group(0) if email_match else None,
    phone=phone_match.group(0) if phone_match else None,
    location=location_match.group(0) if location_match else None,
    website=website_match.group(0) if website_match else None,
  )


def extract_skills(text: str) -> list[str]:
  normalized = text.lower()
  skills_found = {skill for skill in SKILL_DICTIONARY if skill.lower() in normalized}
  return sorted(skills_found)


def summarize_block(blocks: Iterable[ResumeBlock]) -> str:
  return " ".join(block.text.strip().replace("\n", " ") for block in blocks if block.text).strip()
