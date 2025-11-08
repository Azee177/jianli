"""
测试后端启动和基本功能
"""
import sys
import os

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 添加项目路径
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """测试所有模块导入"""
    print("[OK] 测试模块导入...")
    
    try:
        from app import main
        print("  [OK] main模块导入成功")
        
        from app.config import get_settings
        print("  [OK] config模块导入成功")
        
        from app.agents.llm_service import get_llm_service
        print("  [OK] llm_service模块导入成功")
        
        from app.llm_parser import get_llm_parser
        print("  [OK] llm_parser模块导入成功")
        
        from app.services.smart_suggestion_service import get_suggestion_service
        print("  [OK] smart_suggestion_service模块导入成功")
        
        from app.routes import render, suggestions
        print("  [OK] 新路由模块导入成功")
        
        return True
    except Exception as e:
        print(f"  [FAIL] 导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_config():
    """测试配置"""
    print("\n[OK] 测试配置...")
    
    try:
        from app.config import get_settings
        settings = get_settings()
        
        print(f"  [OK] 应用名称: {settings.app_name}")
        print(f"  [OK] 默认LLM提供者: {settings.default_llm_provider}")
        print(f"  [OK] Debug模式: {settings.debug}")
        
        # 检查API key配置
        if settings.get_qwen_api_key():
            masked_key = settings.mask_api_key(settings.get_qwen_api_key())
            print(f"  [OK] Qwen API Key: {masked_key}")
        else:
            print("  [WARN] Qwen API Key未配置")
        
        return True
    except Exception as e:
        print(f"  [FAIL] 配置测试失败: {e}")
        return False


def test_app_creation():
    """测试FastAPI应用创建"""
    print("\n[OK] 测试应用创建...")
    
    try:
        from app.main import app
        
        print(f"  [OK] FastAPI应用创建成功")
        print(f"  [OK] 应用标题: {app.title}")
        print(f"  [OK] 应用版本: {app.version}")
        
        # 检查路由注册
        routes = [route.path for route in app.routes]
        print(f"  [OK] 注册路由数: {len(routes)}")
        
        # 检查关键路由
        key_routes = [
            "/resumes",
            "/resumes/{resume_id}/render",
            "/resumes/{resume_id}/structured",
            "/suggestions/analyze",
            "/health"
        ]
        
        for route in key_routes:
            if any(route in r for r in routes):
                print(f"    [OK] {route}")
            else:
                print(f"    [WARN] {route} 未找到")
        
        return True
    except Exception as e:
        print(f"  [FAIL] 应用创建失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_services():
    """测试服务初始化"""
    print("\n[OK] 测试服务初始化...")
    
    try:
        from app.agents.llm_service import get_llm_service
        from app.llm_parser import get_llm_parser
        from app.services.smart_suggestion_service import get_suggestion_service
        
        llm_service = get_llm_service()
        print("  [OK] LLM服务初始化成功")
        
        llm_parser = get_llm_parser()
        print("  [OK] LLM解析器初始化成功")
        
        suggestion_service = get_suggestion_service()
        print("  [OK] 智能建议服务初始化成功")
        
        return True
    except Exception as e:
        print(f"  [FAIL] 服务初始化失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主测试函数"""
    print("=" * 60)
    print("后端启动测试")
    print("=" * 60)
    
    results = []
    
    # 运行测试
    results.append(("模块导入", test_imports()))
    results.append(("配置检查", test_config()))
    results.append(("应用创建", test_app_creation()))
    results.append(("服务初始化", test_services()))
    
    # 汇总结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("[SUCCESS] 所有测试通过！后端可以正常启动。")
        print("\n启动命令:")
        print("  cd apps/api")
        print("  python start.py")
        print("\n或使用uvicorn:")
        print("  uvicorn app.main:app --reload --port 8000")
        return 0
    else:
        print("[ERROR] 部分测试失败，请检查上述错误。")
        return 1


if __name__ == "__main__":
    sys.exit(main())

