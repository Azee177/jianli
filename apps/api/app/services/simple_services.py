"""简化的服务实现 - 用于快速启动"""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import uuid4
from fastapi import BackgroundTasks, HTTPException

from ..schemas import *
from ..store import ResumeStore, TaskStore


class OptimizeService:
    """简历优化服务"""
    
    def __init__(self, resume_store: ResumeStore, task_store: TaskStore):
        self.resume_store = resume_store
        self.task_store = task_store
        self._previews = {}
        self._study_plans = {}
        self._interview_qas = {}

    async def optimize_preview_async(
        self, resume_id: str, request: OptimizePreviewRequest, 
        user_id: Optional[str], background_tasks: BackgroundTasks
    ) -> TaskResponse:
        task_id = f"optimize_{uuid4().hex[:8]}"
        task = self.task_store.create_task(task_id, TaskType.OPTIMIZE, user_id or "demo-user")
        
        background_tasks.add_task(self._mock_optimize_background, task_id, resume_id, request)
        return task

    async def _mock_optimize_background(self, task_id: str, resume_id: str, request: OptimizePreviewRequest):
        await asyncio.sleep(1)
        preview_id = f"preview_{uuid4().hex[:8]}"
        
        self._previews[preview_id] = OptimizePreviewResponse(
            id=preview_id,
            original_text="原始简历内容...",
            optimized_text="优化后的简历内容，突出了关键技能和量化成果...",
            suggestions=[{"type": "skill", "text": "添加Python技能"}],
            changes=[{"section": "experience", "type": "enhance", "content": "量化工作成果"}]
        )
        
        self.task_store.update_task_result(task_id, TaskStatus.DONE, {"preview_id": preview_id})

    def get_optimize_preview(self, preview_id: str, user_id: Optional[str]) -> OptimizePreviewResponse:
        preview = self._previews.get(preview_id)
        if not preview:
            raise HTTPException(status_code=404, detail="预览不存在")
        return preview

    async def optimize_apply(self, resume_id: str, request: OptimizeApplyRequest, user_id: Optional[str]) -> ResumeResponse:
        # 简化实现：返回原简历
        resume = self.resume_store.get(resume_id)
        if not resume:
            raise HTTPException(status_code=404, detail="简历不存在")
        
        from ..store.resume_store import record_to_response
        return record_to_response(resume)

    async def generate_study_plan_async(
        self, resume_id: str, commonality_id: Optional[str], 
        user_id: Optional[str], background_tasks: BackgroundTasks
    ) -> TaskResponse:
        task_id = f"study_{uuid4().hex[:8]}"
        task = self.task_store.create_task(task_id, TaskType.OPTIMIZE, user_id or "demo-user")
        
        background_tasks.add_task(self._mock_study_plan_background, task_id, resume_id)
        return task

    async def _mock_study_plan_background(self, task_id: str, resume_id: str):
        await asyncio.sleep(1)
        plan_id = f"study_{uuid4().hex[:8]}"
        
        self._study_plans[plan_id] = StudyPlanResponse(
            id=plan_id,
            resume_id=resume_id,
            knowledge_items=[
                KnowledgeItem(
                    title="Python进阶编程",
                    url="https://www.bilibili.com/video/BV1xx411c7mu",
                    why="提升编程技能，匹配JD要求",
                    source="bilibili"
                ),
                KnowledgeItem(
                    title="数据结构与算法",
                    url="https://www.bilibili.com/video/BV1yy4y1a7Km", 
                    why="面试常考内容，提升技术深度",
                    source="bilibili"
                )
            ],
            created_at=datetime.utcnow()
        )
        
        self.task_store.update_task_result(task_id, TaskStatus.DONE, {"plan_id": plan_id})

    def get_study_plan(self, plan_id: str, user_id: Optional[str]) -> StudyPlanResponse:
        plan = self._study_plans.get(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="学习计划不存在")
        return plan

    async def generate_interview_qa_async(
        self, resume_id: str, commonality_id: Optional[str],
        user_id: Optional[str], background_tasks: BackgroundTasks
    ) -> TaskResponse:
        task_id = f"qa_{uuid4().hex[:8]}"
        task = self.task_store.create_task(task_id, TaskType.OPTIMIZE, user_id or "demo-user")
        
        background_tasks.add_task(self._mock_interview_qa_background, task_id, resume_id)
        return task

    async def _mock_interview_qa_background(self, task_id: str, resume_id: str):
        await asyncio.sleep(1)
        qa_id = f"qa_{uuid4().hex[:8]}"
        
        self._interview_qas[qa_id] = InterviewQAResponse(
            id=qa_id,
            resume_id=resume_id,
            questions=[
                InterviewQuestion(
                    question="请介绍一下你最有挑战性的项目经历？",
                    category="项目经验",
                    difficulty="中等",
                    follow_ups=["项目中遇到的最大困难是什么？", "如何解决的？"]
                ),
                InterviewQuestion(
                    question="你对我们公司的了解有多少？",
                    category="公司了解",
                    difficulty="基础",
                    follow_ups=["为什么选择我们公司？"]
                )
            ],
            created_at=datetime.utcnow()
        )
        
        self.task_store.update_task_result(task_id, TaskStatus.DONE, {"qa_id": qa_id})

    def get_interview_qa(self, qa_id: str, user_id: Optional[str]) -> InterviewQAResponse:
        qa = self._interview_qas.get(qa_id)
        if not qa:
            raise HTTPException(status_code=404, detail="面试问答不存在")
        return qa


class ExportService:
    """导出服务"""
    
    def __init__(self, resume_store: ResumeStore, task_store: TaskStore):
        self.resume_store = resume_store
        self.task_store = task_store
        self._exports = {}

    async def export_async(
        self, request: ExportRequest, user_id: Optional[str], background_tasks: BackgroundTasks
    ) -> TaskResponse:
        task_id = f"export_{uuid4().hex[:8]}"
        task = self.task_store.create_task(task_id, TaskType.EXPORT, user_id or "demo-user")
        
        background_tasks.add_task(self._mock_export_background, task_id, request)
        return task

    async def _mock_export_background(self, task_id: str, request: ExportRequest):
        await asyncio.sleep(2)  # 模拟导出时间
        export_id = f"export_{uuid4().hex[:8]}"
        
        self._exports[export_id] = ExportResponse(
            id=export_id,
            resume_id=request.resume_id,
            format=request.format,
            file_url=f"https://example.com/exports/{export_id}.{request.format}",
            file_size=1024000,
            created_at=datetime.utcnow()
        )
        
        self.task_store.update_task_result(task_id, TaskStatus.DONE, {"export_id": export_id})

    def get_export(self, export_id: str, user_id: Optional[str]) -> ExportResponse:
        export = self._exports.get(export_id)
        if not export:
            raise HTTPException(status_code=404, detail="导出记录不存在")
        return export

    def list_exports(self, user_id: Optional[str], resume_id: Optional[str]) -> List[ExportResponse]:
        exports = list(self._exports.values())
        if resume_id:
            exports = [e for e in exports if e.resume_id == resume_id]
        return exports


class UploadService:
    """上传服务"""
    
    def __init__(self, resume_service, task_store: TaskStore):
        self.resume_service = resume_service
        self.task_store = task_store

    async def generate_presign_url(self, request: PresignRequest, user_id: Optional[str]) -> PresignResponse:
        # 模拟预签名URL生成
        object_key = f"uploads/{user_id or 'demo'}/{uuid4().hex[:8]}_{request.file_name}"
        
        return PresignResponse(
            upload_url=f"https://example-bucket.s3.amazonaws.com/{object_key}",
            object_key=object_key,
            expires_in=3600,
            fields={"key": object_key, "Content-Type": request.content_type}
        )

    async def create_resume_from_upload(
        self, object_key: str, user_id: Optional[str], 
        title: Optional[str], template_key: Optional[str]
    ) -> Dict[str, Any]:
        # 模拟从对象存储读取文件并创建简历
        task_id = f"upload_{uuid4().hex[:8]}"
        task = self.task_store.create_task(task_id, TaskType.OCR, user_id or "demo-user")
        
        return {"task_id": task_id, "message": "简历创建任务已提交"}


class TaskService:
    """任务服务"""
    
    def __init__(self, task_store: TaskStore):
        self.task_store = task_store

    def get_task(self, task_id: str, user_id: Optional[str]) -> TaskResponse:
        task = self.task_store.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
        return task

    def list_tasks(
        self, user_id: Optional[str], task_type: Optional[str], 
        status: Optional[str], limit: int
    ) -> List[TaskResponse]:
        return self.task_store.list_by_user(
            user_id or "demo-user", task_type, status, limit
        )


class WebSocketService:
    """WebSocket服务"""
    
    def __init__(self, task_store: TaskStore):
        self.task_store = task_store
        self.connections = {}

    async def register_connection(self, websocket, user_id: Optional[str], task_id: Optional[str]) -> str:
        connection_id = uuid4().hex[:8]
        self.connections[connection_id] = {
            "websocket": websocket,
            "user_id": user_id,
            "task_id": task_id
        }
        return connection_id

    async def unregister_connection(self, connection_id: str):
        self.connections.pop(connection_id, None)

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        task = self.task_store.get_task(task_id)
        return task.model_dump() if task else None

    async def handle_client_message(self, connection_id: str, message: Dict[str, Any]):
        # 处理客户端消息
        pass