from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(slots=True)
class Settings:
  """Application settings loaded from environment variables."""

  port: int = int(os.getenv("PORT", "3002"))
  ocr_service_url: str | None = os.getenv("OCR_SERVICE_BASE_URL")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
  return Settings()
