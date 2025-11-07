"""配置管理 - 包含API key等敏感信息"""
from __future__ import annotations

import os
from typing import Optional
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, SecretStr


class Settings(BaseSettings):
    """应用配置"""
    
    # 基础配置
    app_name: str = "智能简历助手"
    debug: bool = Field(default=False, validation_alias="DEBUG")
    
    # LLM配置 - 使用SecretStr保护敏感信息
    qwen_api_key: Optional[SecretStr] = Field(
        default=None, 
        validation_alias="QWEN_API_KEY"
    )
    qwen_model: str = Field(
        default="qwen-turbo",
        validation_alias="QWEN_MODEL"
    )
    
    deepseek_api_key: Optional[SecretStr] = Field(
        default=None,
        validation_alias="DEEPSEEK_API_KEY"
    )
    deepseek_model: str = Field(
        default="deepseek-chat",
        validation_alias="DEEPSEEK_MODEL"
    )
    
    openai_api_key: Optional[SecretStr] = Field(
        default=None,
        validation_alias="OPENAI_API_KEY"
    )
    openai_model: str = Field(
        default="gpt-4-turbo-preview",
        validation_alias="OPENAI_MODEL"
    )
    
    # 默认LLM提供者
    default_llm_provider: str = Field(
        default="qwen",
        validation_alias="DEFAULT_LLM_PROVIDER"
    )
    
    # LLM调用配置
    llm_timeout: int = Field(default=60, validation_alias="LLM_TIMEOUT")
    llm_max_retries: int = Field(default=3, validation_alias="LLM_MAX_RETRIES")
    llm_default_temperature: float = Field(
        default=0.7,
        validation_alias="LLM_DEFAULT_TEMPERATURE"
    )
    
    # OCR配置
    ocr_service_url: Optional[str] = Field(
        default=None,
        validation_alias="OCR_SERVICE_URL"
    )
    
    # 数据库配置
    database_url: Optional[str] = Field(
        default=None,
        validation_alias="DATABASE_URL"
    )
    
    # Redis配置（用于缓存）
    redis_url: Optional[str] = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL"
    )
    
    # 对象存储配置（用于照片等）
    storage_type: str = Field(
        default="local",  # local, s3, minio
        validation_alias="STORAGE_TYPE"
    )
    storage_path: str = Field(
        default="./storage",
        validation_alias="STORAGE_PATH"
    )
    
    # S3/MinIO配置
    s3_endpoint: Optional[str] = Field(default=None, validation_alias="S3_ENDPOINT")
    s3_access_key: Optional[SecretStr] = Field(default=None, validation_alias="S3_ACCESS_KEY")
    s3_secret_key: Optional[SecretStr] = Field(default=None, validation_alias="S3_SECRET_KEY")
    s3_bucket: Optional[str] = Field(default=None, validation_alias="S3_BUCKET")
    
    # 安全配置
    secret_key: SecretStr = Field(
        default=SecretStr("your-secret-key-change-in-production"),
        validation_alias="SECRET_KEY"
    )
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        validation_alias="ALLOWED_ORIGINS"
    )
    
    # 日志配置
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        validation_alias="LOG_FORMAT"
    )
    
    # Agent配置
    enable_agent_logging: bool = Field(
        default=True,
        validation_alias="ENABLE_AGENT_LOGGING"
    )
    mask_sensitive_data: bool = Field(
        default=True,  # 在日志中屏蔽敏感数据
        validation_alias="MASK_SENSITIVE_DATA"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"
    
    def get_qwen_api_key(self) -> Optional[str]:
        """安全获取Qwen API key"""
        if self.qwen_api_key:
            return self.qwen_api_key.get_secret_value()
        return None
    
    def get_deepseek_api_key(self) -> Optional[str]:
        """安全获取DeepSeek API key"""
        if self.deepseek_api_key:
            return self.deepseek_api_key.get_secret_value()
        return None
    
    def get_openai_api_key(self) -> Optional[str]:
        """安全获取OpenAI API key"""
        if self.openai_api_key:
            return self.openai_api_key.get_secret_value()
        return None
    
    def get_s3_access_key(self) -> Optional[str]:
        """安全获取S3 access key"""
        if self.s3_access_key:
            return self.s3_access_key.get_secret_value()
        return None
    
    def get_s3_secret_key(self) -> Optional[str]:
        """安全获取S3 secret key"""
        if self.s3_secret_key:
            return self.s3_secret_key.get_secret_value()
        return None
    
    def validate_llm_config(self) -> bool:
        """验证LLM配置是否完整"""
        provider = self.default_llm_provider
        
        if provider == "qwen":
            return self.qwen_api_key is not None
        elif provider == "deepseek":
            return self.deepseek_api_key is not None
        elif provider == "openai":
            return self.openai_api_key is not None
        
        return False
    
    def mask_api_key(self, key: str) -> str:
        """屏蔽API key用于日志"""
        if not key or len(key) < 8:
            return "***"
        return f"{key[:4]}...{key[-4:]}"


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


# 安全日志工具
class SecureLogger:
    """安全日志记录器 - 自动屏蔽敏感信息"""
    
    SENSITIVE_KEYS = [
        "api_key", "apikey", "password", "secret", "token",
        "access_key", "secret_key", "qwen_api_key", "openai_api_key"
    ]
    
    @staticmethod
    def mask_sensitive_data(data: any) -> any:
        """递归屏蔽敏感数据"""
        if isinstance(data, dict):
            masked = {}
            for key, value in data.items():
                if any(sensitive in key.lower() for sensitive in SecureLogger.SENSITIVE_KEYS):
                    masked[key] = "***MASKED***"
                else:
                    masked[key] = SecureLogger.mask_sensitive_data(value)
            return masked
        elif isinstance(data, list):
            return [SecureLogger.mask_sensitive_data(item) for item in data]
        elif isinstance(data, str) and len(data) > 20:
            # 可能是token或key
            for sensitive in SecureLogger.SENSITIVE_KEYS:
                if sensitive in data.lower():
                    return "***MASKED***"
        return data
    
    @staticmethod
    def safe_log(logger, level: str, message: str, data: any = None):
        """安全记录日志"""
        settings = get_settings()
        
        if settings.mask_sensitive_data and data:
            data = SecureLogger.mask_sensitive_data(data)
        
        log_func = getattr(logger, level.lower())
        if data:
            log_func(f"{message} | Data: {data}")
        else:
            log_func(message)
