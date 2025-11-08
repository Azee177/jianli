"""统一LLM服务"""
from __future__ import annotations

import json
import logging
from typing import Optional, Dict, Any, List
from abc import ABC, abstractmethod
import httpx

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """LLM提供者基类"""
    
    @abstractmethod
    async def complete(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None
    ) -> str:
        """生成completion"""
        pass


class QwenProvider(LLMProvider):
    """通义千问提供者 - 支持阿里云百炼平台"""
    
    def __init__(self, api_key: str, model: str = "qwen-max"):
        self.api_key = api_key
        self.model = model
        # 使用兼容OpenAI的API endpoint
        self.base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # 如果需要JSON格式，在system message中强制要求
        if response_format == "json":
            # 在第一个消息前添加JSON格式要求
            if messages and messages[0].get("role") == "system":
                messages[0]["content"] += "\n\n请以JSON格式返回结果。"
            else:
                messages.insert(0, {
                    "role": "system",
                    "content": "请以JSON格式返回结果。"
                })
        
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                
                # 使用OpenAI兼容格式
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Qwen API call failed: {e}")
            logger.error(f"Response: {response.text if 'response' in locals() else 'No response'}")
            raise


class DeepSeekProvider(LLMProvider):
    """DeepSeek提供者"""
    
    def __init__(self, api_key: str, model: str = "deepseek-chat"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}
        
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"DeepSeek API call failed: {e}")
            raise


class OpenAIProvider(LLMProvider):
    """OpenAI提供者"""
    
    def __init__(self, api_key: str, model: str = "gpt-4-turbo-preview"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.openai.com/v1/chat/completions"
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}
        
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise


class LLMService:
    """统一的LLM调用服务"""
    
    def __init__(
        self,
        qwen_api_key: Optional[str] = None,
        deepseek_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        default_provider: str = "qwen"
    ):
        self.providers: Dict[str, LLMProvider] = {}
        
        if qwen_api_key:
            self.providers["qwen"] = QwenProvider(qwen_api_key)
        if deepseek_api_key:
            self.providers["deepseek"] = DeepSeekProvider(deepseek_api_key)
        if openai_api_key:
            self.providers["openai"] = OpenAIProvider(openai_api_key)
        
        self.default_provider = default_provider
        
        if not self.providers:
            logger.warning("No LLM providers configured")
    
    async def complete(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None,
        provider: Optional[str] = None
    ) -> str:
        """
        通用completion调用
        
        Args:
            prompt: 用户提示词
            system_message: 系统消息（可选）
            temperature: 温度参数
            max_tokens: 最大token数
            response_format: 响应格式 ('json' 或 None)
            provider: 指定提供者 ('qwen', 'deepseek', 'openai')
            
        Returns:
            LLM生成的文本
        """
        provider_name = provider or self.default_provider
        
        if provider_name not in self.providers:
            raise ValueError(f"Provider {provider_name} not configured")
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        provider_instance = self.providers[provider_name]
        
        logger.info(f"Calling {provider_name} LLM")
        result = await provider_instance.complete(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format
        )
        
        return result
    
    async def complete_json(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        返回JSON格式的completion
        
        Returns:
            解析后的JSON字典
        """
        result = await self.complete(
            prompt=prompt,
            system_message=system_message,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format="json",
            provider=provider
        )
        
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response: {result}")
            raise
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        provider: Optional[str] = None
    ) -> str:
        """
        多轮对话
        
        Args:
            messages: 消息列表 [{"role": "user/assistant/system", "content": "..."}]
            temperature: 温度参数
            max_tokens: 最大token数
            provider: 指定提供者
            
        Returns:
            LLM生成的回复
        """
        provider_name = provider or self.default_provider
        
        if provider_name not in self.providers:
            raise ValueError(f"Provider {provider_name} not configured")
        
        provider_instance = self.providers[provider_name]
        
        return await provider_instance.complete(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )


# 全局单例
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """获取LLM服务单例 - 使用安全配置"""
    global _llm_service
    
    if _llm_service is None:
        # 从安全配置加载API keys
        from ..config import get_settings
        
        settings = get_settings()
        
        # 验证配置
        if not settings.validate_llm_config():
            logger.warning(
                f"LLM配置不完整，默认提供者 {settings.default_llm_provider} "
                f"的API key未配置"
            )
        
        _llm_service = LLMService(
            qwen_api_key=settings.get_qwen_api_key(),
            deepseek_api_key=settings.get_deepseek_api_key(),
            openai_api_key=settings.get_openai_api_key(),
            default_provider=settings.default_llm_provider
        )
        
        # 记录配置信息（不包含敏感数据）
        logger.info(f"LLM服务初始化完成，默认提供者: {settings.default_llm_provider}")
        if settings.get_qwen_api_key():
            logger.info(f"Qwen API key已配置: {settings.mask_api_key(settings.get_qwen_api_key())}")
    
    return _llm_service

