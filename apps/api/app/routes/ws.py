from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import json
import asyncio
import logging

from ..schemas import WSMessage
from ..services import WebSocketService

logger = logging.getLogger(__name__)


def create_ws_router(ws_service: WebSocketService) -> APIRouter:
    router = APIRouter()

    @router.websocket("/ws/tasks")
    async def websocket_tasks(
        websocket: WebSocket,
        user_id: Optional[str] = Query(default=None),
        task_id: Optional[str] = Query(default=None)
    ):
        """WebSocket任务进度推送"""
        await websocket.accept()
        
        try:
            # 注册连接
            connection_id = await ws_service.register_connection(
                websocket, user_id, task_id
            )
            
            logger.info(f"WebSocket connected: {connection_id}, user: {user_id}, task: {task_id}")
            
            # 发送欢迎消息
            welcome_msg = WSMessage(
                type="connected",
                data={"connection_id": connection_id, "user_id": user_id}
            )
            await websocket.send_text(welcome_msg.model_dump_json())
            
            # 如果指定了task_id，发送当前状态
            if task_id:
                task_status = ws_service.get_task_status(task_id)
                if task_status:
                    status_msg = WSMessage(
                        type="task_status",
                        task_id=task_id,
                        data=task_status
                    )
                    await websocket.send_text(status_msg.model_dump_json())
            
            # 保持连接并处理消息
            while True:
                try:
                    # 等待客户端消息或超时
                    data = await asyncio.wait_for(
                        websocket.receive_text(), 
                        timeout=30.0
                    )
                    
                    # 处理客户端消息
                    try:
                        message = json.loads(data)
                        await ws_service.handle_client_message(
                            connection_id, message
                        )
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON from client: {data}")
                        
                except asyncio.TimeoutError:
                    # 发送心跳
                    ping_msg = WSMessage(type="ping")
                    await websocket.send_text(ping_msg.model_dump_json())
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {connection_id}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            # 清理连接
            if 'connection_id' in locals():
                await ws_service.unregister_connection(connection_id)

    return router