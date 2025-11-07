#!/usr/bin/env python3
"""
Resume Copilot FastAPI 启动脚本
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """启动FastAPI服务"""
    
    # 确保在正确的目录
    api_dir = Path(__file__).parent
    os.chdir(api_dir)
    
    # 检查虚拟环境
    venv_path = api_dir / ".venv"
    if not venv_path.exists():
        print("❌ 虚拟环境不存在，请先运行:")
        print("   python -m venv .venv")
        print("   .venv\\Scripts\\activate  # Windows")
        print("   source .venv/bin/activate  # Linux/Mac")
        print("   pip install -r requirements.txt")
        return 1
    
    # 检查依赖
    try:
        import fastapi
        import uvicorn
    except ImportError:
        print("❌ 依赖未安装，请运行:")
        print("   pip install -r requirements.txt")
        return 1
    
    # 检查环境变量
    env_file = api_dir / ".env"
    if not env_file.exists():
        print("⚠️  .env文件不存在，将使用默认配置")
        print("   建议创建.env文件配置API密钥")
    
    # 启动服务
    port = int(os.getenv("PORT", "3002"))
    
    print(f"🚀 启动Resume Copilot API服务...")
    print(f"   端口: {port}")
    print(f"   文档: http://localhost:{port}/docs")
    print(f"   健康检查: http://localhost:{port}/health")
    print()
    
    try:
        # 使用uvicorn启动
        cmd = [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--reload",
            "--host", "0.0.0.0", 
            "--port", str(port)
        ]
        
        subprocess.run(cmd, check=True)
        
    except KeyboardInterrupt:
        print("\n👋 服务已停止")
        return 0
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())