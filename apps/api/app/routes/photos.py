"""照片相关路由"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from fastapi.responses import Response

from ..services.photo_service import PhotoService


def create_photo_router(photo_service: PhotoService) -> APIRouter:
    """创建照片路由"""
    router = APIRouter()
    
    def get_service() -> PhotoService:
        return photo_service
    
    @router.post("/extract-from-pdf")
    async def extract_photo_from_pdf(
        file: UploadFile = File(...),
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: PhotoService = Depends(get_service)
    ):
        """从PDF中提取照片"""
        if not file.filename or not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="只支持PDF文件")
        
        # 读取文件内容
        pdf_bytes = await file.read()
        
        # 提取照片
        result = svc.extract_photo_from_pdf(pdf_bytes)
        
        if not result:
            return {
                "success": False,
                "message": "未在PDF中找到合适的照片"
            }
        
        # 保存照片
        user = user_id or "demo-user"
        photo_id = svc.save_photo_to_storage(
            result.photo_bytes,
            user,
            result.photo_format
        )
        
        return {
            "success": True,
            "photo_id": photo_id,
            "width": result.width,
            "height": result.height,
            "page_number": result.page_number,
            "confidence": result.confidence,
            "format": result.photo_format
        }
    
    @router.get("/photos/{photo_id}")
    async def get_photo(
        photo_id: str,
        svc: PhotoService = Depends(get_service)
    ):
        """获取照片"""
        photo_bytes = svc.get_photo(photo_id)
        
        if not photo_bytes:
            raise HTTPException(status_code=404, detail="照片不存在")
        
        # 根据photo_id判断格式
        if photo_id.endswith('.png'):
            media_type = "image/png"
        elif photo_id.endswith('.jpg') or photo_id.endswith('.jpeg'):
            media_type = "image/jpeg"
        else:
            media_type = "image/jpeg"
        
        return Response(content=photo_bytes, media_type=media_type)
    
    @router.post("/photos/{photo_id}/crop")
    async def crop_photo(
        photo_id: str,
        width: int = 300,
        height: int = 400,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: PhotoService = Depends(get_service)
    ):
        """裁剪照片"""
        photo_bytes = svc.get_photo(photo_id)
        
        if not photo_bytes:
            raise HTTPException(status_code=404, detail="照片不存在")
        
        try:
            cropped_bytes = svc.crop_and_resize_photo(photo_bytes, width, height)
            
            # 保存裁剪后的照片
            user = user_id or "demo-user"
            new_photo_id = svc.save_photo_to_storage(cropped_bytes, user, "jpeg")
            
            return {
                "success": True,
                "photo_id": new_photo_id,
                "width": width,
                "height": height
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"裁剪失败: {str(e)}")
    
    @router.post("/photos/upload")
    async def upload_photo(
        file: UploadFile = File(...),
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: PhotoService = Depends(get_service)
    ):
        """上传照片"""
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="只支持图片文件")
        
        # 读取文件内容
        photo_bytes = await file.read()
        
        # 确定格式
        photo_format = "jpeg"
        if file.content_type == "image/png":
            photo_format = "png"
        
        # 保存照片
        user = user_id or "demo-user"
        photo_id = svc.save_photo_to_storage(photo_bytes, user, photo_format)
        
        return {
            "success": True,
            "photo_id": photo_id,
            "format": photo_format
        }
    
    return router

