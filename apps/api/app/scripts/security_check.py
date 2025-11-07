"""安全检查脚本"""
import sys
import re
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


def check_hardcoded_secrets(directory: Path):
    """检查硬编码的密钥"""
    print("检查硬编码的密钥...")
    
    # 常见的密钥模式
    patterns = [
        (r'api[_-]?key\s*=\s*["\']([^"\']+)["\']', "API Key"),
        (r'secret\s*=\s*["\']([^"\']+)["\']', "Secret"),
        (r'password\s*=\s*["\']([^"\']+)["\']', "Password"),
        (r'token\s*=\s*["\']([^"\']+)["\']', "Token"),
        (r'sk-[a-zA-Z0-9]{32,}', "OpenAI Key"),
    ]
    
    issues = []
    
    # 遍历Python文件
    for py_file in directory.rglob("*.py"):
        # 跳过虚拟环境和缓存
        if any(part in py_file.parts for part in ['venv', '__pycache__', 'node_modules']):
            continue
        
        try:
            content = py_file.read_text(encoding='utf-8')
            
            for pattern, secret_type in patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    # 排除明显的示例和注释
                    line = content[max(0, match.start()-50):match.end()+50]
                    if 'example' not in line.lower() and 'your-' not in line.lower():
                        issues.append({
                            'file': py_file,
                            'type': secret_type,
                            'line': content[:match.start()].count('\n') + 1
                        })
        except Exception as e:
            print(f"  跳过文件 {py_file}: {e}")
    
    if issues:
        print(f"  ❌ 发现 {len(issues)} 个潜在的硬编码密钥:")
        for issue in issues:
            print(f"    - {issue['file']}:{issue['line']} ({issue['type']})")
        return False
    else:
        print("  ✓ 未发现硬编码密钥")
        return True


def check_gitignore():
    """检查.gitignore配置"""
    print("\n检查.gitignore...")
    
    gitignore_file = Path(".gitignore")
    
    if not gitignore_file.exists():
        print("  ❌ .gitignore 文件不存在")
        return False
    
    content = gitignore_file.read_text(encoding='utf-8')
    
    required_entries = [".env", "*.key", "*.pem"]
    missing = []
    
    for entry in required_entries:
        if entry not in content:
            missing.append(entry)
    
    if missing:
        print(f"  ⚠️  .gitignore 缺少以下条目: {', '.join(missing)}")
        return False
    else:
        print("  ✓ .gitignore 配置正确")
        return True


def check_env_file():
    """检查.env文件"""
    print("\n检查环境文件...")
    
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_example.exists():
        print("  ⚠️  .env.example 不存在")
    else:
        print("  ✓ .env.example 存在")
    
    if not env_file.exists():
        print("  ⚠️  .env 文件不存在，请从 .env.example 复制")
        return False
    
    # 检查文件权限（仅Unix系统）
    import platform
    if platform.system() != 'Windows':
        import stat
        mode = env_file.stat().st_mode
        if mode & stat.S_IRWXG or mode & stat.S_IRWXO:
            print("  ⚠️  .env 文件权限过宽，建议运行: chmod 600 .env")
        else:
            print("  ✓ .env 文件权限正确")
    
    return True


def check_dependencies():
    """检查依赖安全"""
    print("\n检查依赖...")
    
    requirements_file = Path("apps/api/requirements.txt")
    
    if not requirements_file.exists():
        print("  ⚠️  requirements.txt 不存在")
        return False
    
    content = requirements_file.read_text(encoding='utf-8')
    
    # 检查是否固定了版本
    lines = [line for line in content.split('\n') if line.strip() and not line.startswith('#')]
    unfixed = [line for line in lines if '>=' not in line and '==' not in line and '~=' not in line]
    
    if unfixed:
        print(f"  ⚠️  以下依赖未固定版本: {', '.join(unfixed)}")
    else:
        print("  ✓ 依赖版本已固定")
    
    return True


def main():
    """主函数"""
    print("=" * 60)
    print("安全检查工具")
    print("=" * 60)
    print()
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    checks = [
        check_hardcoded_secrets(project_root),
        check_gitignore(),
        check_env_file(),
        check_dependencies()
    ]
    
    print()
    print("=" * 60)
    
    if all(checks):
        print("✅ 所有安全检查通过！")
        print("=" * 60)
        return 0
    else:
        print("⚠️  发现安全问题，请修复后再部署")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())

