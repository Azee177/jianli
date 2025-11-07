#!/usr/bin/env python3
"""
测试简历上传和OCR解析功能
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from app.services.resume_service import ResumeService
from app.store import ResumeStore
from app.templates import load_templates


async def test_text_upload():
    """测试文本上传"""
    print("=" * 60)
    print("测试1: 文本直接上传")
    print("=" * 60)
    
    store = ResumeStore()
    templates = load_templates()
    service = ResumeService(store, templates)
    
    test_text = """
张三
电话: 13800138000
邮箱: zhangsan@example.com
地址: 北京

求职意向：Python后端工程师

教育背景
清华大学 · 计算机科学与技术专业 | 本科 | 2018.9 - 2022.6
GPA: 3.8/4.0

工作经历
字节跳动 · 后端开发工程师 | 2022.7 - 至今
- 负责推荐系统后端开发，支持日均10亿次请求
- 优化数据库查询性能，响应时间降低40%
- 参与微服务架构升级，系统可用性提升到99.99%

项目经历
分布式任务调度系统 | 2023.1 - 2023.6
- 使用Python、Redis、Celery构建分布式任务调度系统
- 支持10万+并发任务，任务执行成功率99.5%
- 实现任务重试、失败告警等容错机制

技能
Python, Java, Go, TypeScript, React, Vue, SQL, PostgreSQL, 
MySQL, Redis, MongoDB, Docker, Kubernetes, LLM, 机器学习
    """
    
    try:
        result = await service.create_resume(
            user_id="test-user-001",
            text=test_text,
            file_bytes=None,
            file_name=None,
            mime_type=None,
            template_key="modern-cn",
            title="张三的简历"
        )
        
        print(f"[SUCCESS] 简历创建成功!")
        print(f"简历ID: {result.id}")
        print(f"用户姓名: {result.contacts.name}")
        print(f"邮箱: {result.contacts.email}")
        print(f"电话: {result.contacts.phone}")
        print(f"地址: {result.contacts.location}")
        print(f"技能: {', '.join(result.skills)}")
        print(f"语言: {result.metadata.language}")
        print(f"模板: {result.metadata.templateKey}")
        print(f"分块数量: {len(result.parsed_blocks)}")
        
        print("\n分块内容预览:")
        for i, block in enumerate(result.parsed_blocks[:3], 1):
            preview = block.text[:100] + "..." if len(block.text) > 100 else block.text
            print(f"  {i}. [{block.type}] {preview}")
        
        return result
        
    except Exception as e:
        print(f"[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return None


async def test_pdf_upload():
    """测试PDF文件上传"""
    print("\n" + "=" * 60)
    print("测试2: PDF文件上传 (如果存在测试PDF)")
    print("=" * 60)
    
    # 检查是否有测试PDF文件
    test_pdf_path = Path("../../docs/个人简历_叶子姐姐.pdf")
    
    if not test_pdf_path.exists():
        print("[WARNING] 未找到测试PDF文件，跳过此测试")
        print(f"   预期路径: {test_pdf_path.absolute()}")
        return None
    
    print(f"找到测试PDF: {test_pdf_path}")
    
    store = ResumeStore()
    templates = load_templates()
    service = ResumeService(store, templates)
    
    try:
        with open(test_pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        print(f"PDF文件大小: {len(pdf_bytes)} 字节")
        
        result = await service.create_resume(
            user_id="test-user-002",
            text=None,
            file_bytes=pdf_bytes,
            file_name=test_pdf_path.name,
            mime_type="application/pdf",
            template_key="modern-cn",
            title="叶子姐姐的简历"
        )
        
        print(f"[SUCCESS] PDF解析成功!")
        print(f"简历ID: {result.id}")
        print(f"OCR引擎: {result.metadata.ocrEngine}")
        print(f"页数: {result.metadata.pageCount}")
        print(f"置信度: {result.metadata.confidence}")
        print(f"用户姓名: {result.contacts.name}")
        print(f"邮箱: {result.contacts.email}")
        print(f"电话: {result.contacts.phone}")
        print(f"技能: {', '.join(result.skills)}")
        
        print("\n提取的文本预览 (前500字符):")
        print(result.raw_text[:500])
        
        return result
        
    except Exception as e:
        print(f"[ERROR] PDF解析失败: {e}")
        import traceback
        traceback.print_exc()
        return None


async def test_template_filling():
    """测试模板填充功能"""
    print("\n" + "=" * 60)
    print("测试3: 模板填充")
    print("=" * 60)
    
    store = ResumeStore()
    templates = load_templates()
    service = ResumeService(store, templates)
    
    # 列出所有模板
    all_templates = service.list_templates()
    print(f"可用模板数量: {len(all_templates)}")
    for tpl in all_templates:
        print(f"  - {tpl.id}: {tpl.name} ({tpl.locale})")
        print(f"    描述: {tpl.description}")
    
    # 实例化模板
    try:
        result = await service.instantiate_template(
            template_id="modern-cn",
            user_id="test-user-003",
            title="我的新简历"
        )
        
        print(f"\n[SUCCESS] 模板实例化成功!")
        print(f"简历ID: {result.id}")
        print(f"模板: {result.metadata.templateKey}")
        print(f"标题: {result.metadata.title}")
        
        return result
        
    except Exception as e:
        print(f"[ERROR] 模板实例化失败: {e}")
        import traceback
        traceback.print_exc()
        return None


async def test_resume_list():
    """测试简历列表功能"""
    print("\n" + "=" * 60)
    print("测试4: 简历列表查询")
    print("=" * 60)
    
    store = ResumeStore()
    templates = load_templates()
    service = ResumeService(store, templates)
    
    # 列出用户的所有简历
    for user_id in ["test-user-001", "test-user-002", "test-user-003"]:
        resumes = service.list_resumes(user_id)
        print(f"\n用户 {user_id} 的简历数量: {len(resumes)}")
        for resume in resumes:
            print(f"  - {resume.id}: {resume.metadata.title or '(无标题)'}")
            print(f"    来源: {resume.source}, 技能数: {len(resume.skills)}")


async def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("开始测试简历上传和OCR解析功能")
    print("=" * 60 + "\n")
    
    # 测试1: 文本上传
    await test_text_upload()
    
    # 测试2: PDF上传
    await test_pdf_upload()
    
    # 测试3: 模板填充
    await test_template_filling()
    
    # 测试4: 列出所有简历
    await test_resume_list()
    
    print("\n" + "=" * 60)
    print("所有测试完成!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

