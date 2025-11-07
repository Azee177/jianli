"""配置验证脚本"""
import sys
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.config import get_settings, SecureLogger


def validate_config():
    """验证配置"""
    print("=" * 60)
    print("配置验证工具")
    print("=" * 60)
    print()
    
    try:
        settings = get_settings()
    except Exception as e:
        print(f"❌ 配置加载失败: {e}")
        return False
    
    print("✓ 配置文件加载成功")
    print()
    
    # 验证LLM配置
    print("检查LLM配置...")
    print(f"  默认提供者: {settings.default_llm_provider}")
    
    has_valid_provider = False
    
    # 检查Qwen
    if settings.get_qwen_api_key():
        masked_key = settings.mask_api_key(settings.get_qwen_api_key())
        print(f"  ✓ Qwen API Key: {masked_key}")
        has_valid_provider = True
    else:
        print(f"  ✗ Qwen API Key: 未配置")
    
    # 检查DeepSeek
    if settings.get_deepseek_api_key():
        masked_key = settings.mask_api_key(settings.get_deepseek_api_key())
        print(f"  ✓ DeepSeek API Key: {masked_key}")
        has_valid_provider = True
    else:
        print(f"  ✗ DeepSeek API Key: 未配置")
    
    # 检查OpenAI
    if settings.get_openai_api_key():
        masked_key = settings.mask_api_key(settings.get_openai_api_key())
        print(f"  ✓ OpenAI API Key: {masked_key}")
        has_valid_provider = True
    else:
        print(f"  ✗ OpenAI API Key: 未配置")
    
    print()
    
    if not has_valid_provider:
        print("❌ 错误: 至少需要配置一个LLM提供者的API Key")
        print()
        print("请按照以下步骤配置：")
        print("1. 复制 .env.example 为 .env")
        print("2. 编辑 .env 文件")
        print("3. 填入 QWEN_API_KEY")
        print()
        return False
    
    # 验证默认提供者
    if not settings.validate_llm_config():
        print(f"❌ 警告: 默认提供者 '{settings.default_llm_provider}' 的API Key未配置")
        print()
        return False
    
    print(f"✓ 默认提供者 '{settings.default_llm_provider}' 配置正确")
    print()
    
    # 检查安全配置
    print("检查安全配置...")
    
    secret_key = settings.secret_key.get_secret_value()
    if secret_key == "your-secret-key-change-in-production":
        print("  ⚠️  警告: SECRET_KEY 使用默认值，生产环境请更改")
    else:
        print("  ✓ SECRET_KEY: 已自定义")
    
    if settings.debug:
        print("  ⚠️  警告: DEBUG模式已启用")
    else:
        print("  ✓ DEBUG: 已禁用")
    
    if settings.mask_sensitive_data:
        print("  ✓ 敏感数据屏蔽: 已启用")
    else:
        print("  ⚠️  警告: 敏感数据屏蔽已禁用")
    
    print()
    
    # 检查存储配置
    print("检查存储配置...")
    print(f"  存储类型: {settings.storage_type}")
    if settings.storage_type == "local":
        print(f"  存储路径: {settings.storage_path}")
    print()
    
    # 总结
    print("=" * 60)
    print("✅ 配置验证通过！")
    print("=" * 60)
    print()
    print("下一步:")
    print("1. 启动API服务: uvicorn app.main:app --reload")
    print("2. 查看日志确认LLM服务初始化成功")
    print()
    
    return True


if __name__ == "__main__":
    success = validate_config()
    sys.exit(0 if success else 1)

