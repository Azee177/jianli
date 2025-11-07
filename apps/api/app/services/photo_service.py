"""照片提取和处理服务"""
from __future__ import annotations

import io
import logging
from typing import Optional, Tuple
from uuid import uuid4
from dataclasses import dataclass
from PIL import Image

logger = logging.getLogger(__name__)


@dataclass
class PhotoExtractionResult:
    """照片提取结果"""
    photo_bytes: Optional[bytes]
    photo_format: str  # 'png', 'jpeg', etc.
    width: int
    height: int
    page_number: int
    confidence: float  # 0.0-1.0, 判断是否为人像照片的置信度
    

class PhotoService:
    """照片提取服务"""
    
    def __init__(self):
        self._storage = {}  # 简单内存存储，实际应该用对象存储
        
    def extract_photo_from_pdf(self, pdf_bytes: bytes) -> Optional[PhotoExtractionResult]:
        """从PDF中提取用户照片
        
        Args:
            pdf_bytes: PDF文件的字节数据
            
        Returns:
            PhotoExtractionResult或None
        """
        try:
            import fitz  # PyMuPDF
            
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            # 遍历每一页查找图片
            for page_num, page in enumerate(doc):
                images = page.get_images(full=True)
                
                for img_index, img_info in enumerate(images):
                    xref = img_info[0]
                    
                    # 提取图片
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # 打开图片检查尺寸和特征
                    try:
                        img = Image.open(io.BytesIO(image_bytes))
                        width, height = img.size
                        
                        # 判断是否可能是证件照
                        # 通常证件照比例接近3:4或1:1，尺寸在100-500像素之间
                        aspect_ratio = width / height if height > 0 else 0
                        is_portrait_size = 100 < width < 800 and 100 < height < 800
                        is_portrait_aspect = 0.6 < aspect_ratio < 1.2
                        
                        # 计算置信度
                        confidence = 0.0
                        if is_portrait_size and is_portrait_aspect:
                            confidence = 0.8
                            # 如果在第一页，置信度更高
                            if page_num == 0:
                                confidence = 0.9
                            
                            # 如果图片位置在右上角，置信度更高（简历常见布局）
                            bbox = page.get_image_bbox(img_info)
                            if bbox:
                                page_rect = page.rect
                                x_ratio = bbox.x0 / page_rect.width
                                y_ratio = bbox.y0 / page_rect.height
                                
                                # 右上角位置
                                if x_ratio > 0.7 and y_ratio < 0.3:
                                    confidence = 0.95
                        
                        # 如果置信度足够高，返回这张照片
                        if confidence >= 0.7:
                            return PhotoExtractionResult(
                                photo_bytes=image_bytes,
                                photo_format=image_ext,
                                width=width,
                                height=height,
                                page_number=page_num + 1,
                                confidence=confidence
                            )
                            
                    except Exception as e:
                        logger.warning(f"Failed to process image {img_index} on page {page_num}: {e}")
                        continue
            
            doc.close()
            return None
            
        except ImportError:
            logger.error("PyMuPDF not installed, cannot extract photos")
            return None
        except Exception as e:
            logger.error(f"Failed to extract photo from PDF: {e}")
            return None
    
    def save_photo_to_storage(self, photo_bytes: bytes, user_id: str, photo_format: str = "png") -> str:
        """保存照片到存储
        
        Args:
            photo_bytes: 照片字节数据
            user_id: 用户ID
            photo_format: 照片格式
            
        Returns:
            photo_id: 照片的唯一标识
        """
        photo_id = f"photo_{user_id}_{uuid4().hex[:8]}.{photo_format}"
        
        # TODO: 实际应该上传到对象存储（如MinIO、S3等）
        self._storage[photo_id] = photo_bytes
        
        logger.info(f"Saved photo {photo_id} for user {user_id}")
        return photo_id
    
    def get_photo(self, photo_id: str) -> Optional[bytes]:
        """获取照片数据
        
        Args:
            photo_id: 照片ID
            
        Returns:
            照片字节数据或None
        """
        return self._storage.get(photo_id)
    
    def apply_photo_to_template(
        self, 
        template_id: str, 
        photo_url: str,
        resume_data: dict
    ) -> dict:
        """将照片应用到简历模板
        
        Args:
            template_id: 模板ID
            photo_url: 照片URL或ID
            resume_data: 简历数据
            
        Returns:
            更新后的简历数据
        """
        # 在简历数据中添加照片信息
        resume_data_with_photo = resume_data.copy()
        resume_data_with_photo["photo"] = {
            "url": photo_url,
            "template_id": template_id
        }
        
        return resume_data_with_photo
    
    def crop_and_resize_photo(
        self, 
        photo_bytes: bytes, 
        target_width: int = 300,
        target_height: int = 400
    ) -> bytes:
        """裁剪和调整照片尺寸
        
        Args:
            photo_bytes: 原始照片字节
            target_width: 目标宽度
            target_height: 目标高度
            
        Returns:
            处理后的照片字节
        """
        try:
            img = Image.open(io.BytesIO(photo_bytes))
            
            # 转换为RGB模式（如果是RGBA等）
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 计算裁剪区域（居中裁剪）
            width, height = img.size
            aspect_ratio = target_width / target_height
            
            if width / height > aspect_ratio:
                # 图片太宽，裁剪宽度
                new_width = int(height * aspect_ratio)
                left = (width - new_width) // 2
                img = img.crop((left, 0, left + new_width, height))
            else:
                # 图片太高，裁剪高度
                new_height = int(width / aspect_ratio)
                top = (height - new_height) // 2
                img = img.crop((0, top, width, top + new_height))
            
            # 调整尺寸
            img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # 转换为字节
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=95)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Failed to crop and resize photo: {e}")
            raise

