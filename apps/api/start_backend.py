#!/usr/bin/env python3
"""
Resume Copilot 后端启动脚本
支持自动检测和激活conda环境
"""

import os
import sys
import subprocess
import platform
from pathlib import Path


class BackendStarter:
    """后端服务启动器"""
    
    def __init__(self):
        self.api_dir = Path(__file__).parent
        self.project_root = self.api_dir.parent.parent
        self.is_windows = platform.system() == "Windows"
        
    def find_conda_python(self):
        """查找conda环境中的Python路径"""
        
        # 常见的conda安装路径
        possible_paths = [
            Path("E:/anaconda/envs/jianli/python.exe"),
            Path(os.path.expanduser("~/anaconda3/envs/jianli/bin/python")),
            Path(os.path.expanduser("~/miniconda3/envs/jianli/bin/python")),
            Path("C:/ProgramData/Anaconda3/envs/jianli/python.exe"),
            Path("C:/Users") / os.getenv("USERNAME", "") / "anaconda3/envs/jianli/python.exe",
        ]
        
        # 检查路径
        for path in possible_paths:
            if path.exists():
                print(f"[OK] 找到conda环境: {path}")
                return str(path)
        
        # 尝试通过conda命令查找
        try:
            result = subprocess.run(
                ["conda", "env", "list"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if 'jianli' in line:
                        parts = line.split()
                        if len(parts) >= 2:
                            env_path = parts[-1]
                            python_exe = "python.exe" if self.is_windows else "bin/python"
                            python_path = Path(env_path) / python_exe
                            if python_path.exists():
                                print(f"[OK] 通过conda命令找到环境: {python_path}")
                                return str(python_path)
        except Exception as e:
            print(f"[WARN] 无法通过conda命令查找: {e}")
        
        return None
    
    def check_dependencies(self, python_path):
        """检查依赖是否安装"""
        try:
            result = subprocess.run(
                [python_path, "-c", "import fastapi, uvicorn; print('ok')"],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=self.api_dir
            )
            return result.returncode == 0 and "ok" in result.stdout
        except Exception:
            return False
    
    def check_env_file(self):
        """检查.env文件"""
        env_file = self.api_dir / ".env"
        if not env_file.exists():
            print("[WARN] .env文件不存在")
            print("   建议创建.env文件并配置以下内容:")
            print("   - QWEN_API_KEY=your_api_key")
            print("   - OCR_SERVICE_URL=your_ocr_url")
            print()
            return False
        return True
    
    def get_port(self):
        """获取端口配置"""
        # 从环境变量读取，默认8000
        port = os.getenv("BACKEND_PORT", "8000")
        return int(port)
    
    def start_server(self, python_path, port):
        """启动uvicorn服务器"""
        
        print("=" * 50)
        print("启动Resume Copilot后端服务")
        print("=" * 50)
        print()
        print(f"[+] 工作目录: {self.api_dir}")
        print(f"[+] Python路径: {python_path}")
        print(f"[+] 端口: {port}")
        print(f"[+] API文档: http://127.0.0.1:{port}/docs")
        print(f"[+] 健康检查: http://127.0.0.1:{port}/health")
        print()
        print("按 Ctrl+C 停止服务")
        print("=" * 50)
        print()
        
        try:
            # 构建启动命令
            cmd = [
                python_path, "-m", "uvicorn",
                "app.main:app",
                "--reload",
                "--host", "127.0.0.1",
                "--port", str(port)
            ]
            
            # 启动服务
            process = subprocess.run(
                cmd,
                cwd=self.api_dir,
                env=os.environ.copy()
            )
            
            return process.returncode
            
        except KeyboardInterrupt:
            print("\n")
            print("=" * 50)
            print("[INFO] 服务已停止")
            print("=" * 50)
            return 0
        except Exception as e:
            print(f"\n[ERROR] 启动失败: {e}")
            return 1
    
    def run(self):
        """主运行函数"""
        
        print()
        print("[INFO] 检查环境...")
        print()
        
        # 1. 查找conda Python
        python_path = self.find_conda_python()
        
        if not python_path:
            print("[ERROR] 未找到conda的jianli环境")
            print()
            print("请按以下步骤操作:")
            print()
            print("1. 创建conda环境:")
            print("   conda create -n jianli python=3.11")
            print()
            print("2. 激活环境:")
            print("   conda activate jianli")
            print()
            print("3. 安装依赖:")
            print("   cd apps/api")
            print("   pip install -r requirements.txt")
            print()
            print("4. 再次运行本脚本:")
            print("   python start_backend.py")
            print()
            return 1
        
        # 2. 检查依赖
        print("[INFO] 检查依赖...")
        if not self.check_dependencies(python_path):
            print("[ERROR] 依赖未安装或不完整")
            print()
            print("请安装依赖:")
            print(f"   {python_path} -m pip install -r requirements.txt")
            print()
            return 1
        
        print("[OK] 依赖检查通过")
        print()
        
        # 3. 检查环境变量
        self.check_env_file()
        
        # 4. 获取端口
        port = self.get_port()
        
        # 5. 启动服务
        return self.start_server(python_path, port)


def main():
    """主函数"""
    starter = BackendStarter()
    sys.exit(starter.run())


if __name__ == "__main__":
    main()

