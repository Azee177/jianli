#!/usr/bin/env python3
"""
Resume Copilot FastAPI 快速启动脚本
用于测试和开发
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """检查必要的依赖"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'httpx',
        'python-dotenv',
        'pydantic'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ 缺少依赖: {', '.join(missing)}")
        print("请运行: pip install " + " ".join(missing))
        return False
    
    return True

def create_env_file():
    """创建默认的.env文件"""
    env_file = Path(__file__).parent / ".env"
    
    if not env_file.exists():
        env_content = """# Resume Copilot API 配置
PORT=3002
OCR_SERVICE_BASE_URL=

# JD抓取配置（可选）
SHIXISENG_APP_ID=
SHIXISENG_APP_SECRET=

# LLM配置（可选）
OPENAI_API_KEY=
QWEN_API_KEY=
DEEPSEEK_API_KEY=

# 数据库配置（可选）
DATABASE_URL=

# 调试模式
DEBUG=true
"""
        env_file.write_text(env_content, encoding='utf-8')
        print(f"✅ 已创建默认配置文件: {env_file}")

def test_api_endpoints():
    """测试API端点"""
    import httpx
    
    base_url = "http://localhost:3002"
    
    print("\n🧪 测试API端点...")
    
    try:
        # 测试健康检查
        response = httpx.get(f"{base_url}/health", timeout=5.0)
        if response.status_code == 200:
            print("✅ 健康检查: OK")
            data = response.json()
            print(f"   状态: {data.get('status')}")
            print(f"   适配器: {data.get('adapters', {})}")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            
        # 测试根路径
        response = httpx.get(f"{base_url}/", timeout=5.0)
        if response.status_code == 200:
            print("✅ 根路径: OK")
        else:
            print(f"❌ 根路径失败: {response.status_code}")
            
        # 测试文档
        response = httpx.get(f"{base_url}/docs", timeout=5.0)
        if response.status_code == 200:
            print("✅ API文档: OK")
        else:
            print(f"❌ API文档失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ API测试失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    print("🚀 Resume Copilot FastAPI 快速启动")
    print("=" * 50)
    
    # 切换到API目录
    api_dir = Path(__file__).parent
    os.chdir(api_dir)
    
    # 检查依赖
    if not check_dependencies():
        print("\n💡 安装依赖:")
        print("   pip install fastapi uvicorn httpx python-dotenv pydantic")
        return 1
    
    # 创建配置文件
    create_env_file()
    
    # 启动服务
    port = int(os.getenv("PORT", "3002"))
    
    print(f"\n🌟 启动FastAPI服务...")
    print(f"   端口: {port}")
    print(f"   文档: http://localhost:{port}/docs")
    print(f"   ReDoc: http://localhost:{port}/redoc")
    print(f"   健康检查: http://localhost:{port}/health")
    print("\n按 Ctrl+C 停止服务")
    print("-" * 50)
    
    try:
        # 启动uvicorn
        cmd = [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", str(port),
            "--log-level", "info"
        ]
        
        process = subprocess.Popen(cmd)
        
        # 等待服务启动
        time.sleep(3)
        
        # 测试API
        if test_api_endpoints():
            print("\n🎉 服务启动成功！")
            print(f"   访问 http://localhost:{port}/docs 查看API文档")
        
        # 等待进程结束
        process.wait()
        
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
        if 'process' in locals():
            process.terminate()
        return 0
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())