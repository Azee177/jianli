from __future__ import annotations

import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes.resumes import create_router as create_resume_router
from .routes.jd_sources import create_jd_router
from .routes.optimize import create_optimize_router
from .routes.export import create_export_router
from .routes.uploads import create_upload_router
from .routes.tasks import create_task_router
from .routes.ws import create_ws_router

from .services.resume_service import ResumeService
from .services.jd_service import JDService
from .services.target_service import TargetService
from .services.commonality_service import CommonalityService
from .services.simple_services import (
    OptimizeService, ExportService, UploadService, 
    TaskService, WebSocketService
)

from .store import ResumeStore, JDStore, TaskStore
from .templates import load_templates
from .adapters import ShixiSengAdapter, ZhaopinAdapter, Job51Adapter, BossAdapter

load_dotenv()

logging.basicConfig(level=logging.INFO)

settings = get_settings()
app = FastAPI(
    title="Resume Copilot API", 
    version="0.1.0",
    description="AI-powered resume optimization platform"
)

# 初始化存储层
resume_store = ResumeStore()
jd_store = JDStore()
task_store = TaskStore()

# 初始化适配器
shixiseng_adapter = ShixiSengAdapter(
    app_id=os.getenv("SHIXISENG_APP_ID", ""),
    app_secret=os.getenv("SHIXISENG_APP_SECRET", "")
)
zhaopin_adapter = ZhaopinAdapter()
job51_adapter = Job51Adapter()
boss_adapter = BossAdapter()

# 初始化服务层
resume_templates = load_templates()
resume_service = ResumeService(resume_store, resume_templates)

jd_service = JDService(
    jd_store, task_store,
    shixiseng_adapter, zhaopin_adapter, job51_adapter, boss_adapter
)

target_service = TargetService(task_store)
commonality_service = CommonalityService(jd_store, task_store)
optimize_service = OptimizeService(resume_store, task_store)
export_service = ExportService(resume_store, task_store)
upload_service = UploadService(resume_service, task_store)
task_service = TaskService(task_store)
websocket_service = WebSocketService(task_store)

# 注册路由
app.include_router(create_resume_router(resume_service))
app.include_router(create_jd_router(jd_service, target_service, commonality_service))
app.include_router(create_optimize_router(optimize_service))
app.include_router(create_export_router(export_service))
app.include_router(create_upload_router(upload_service))
app.include_router(create_task_router(task_service))
app.include_router(create_ws_router(websocket_service))

# CORS配置
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "ocrGateway": bool(settings.ocr_service_url),
        "adapters": {
            "shixiseng": shixiseng_adapter.is_available(),
            "zhaopin": zhaopin_adapter.is_available(),
            "job51": job51_adapter.is_available(),
            "boss": boss_adapter.is_available()
        }
    }


@app.get("/")
def root():
    return {
        "message": "Resume Copilot API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }
