#!/usr/bin/env python3
"""
测试智能模板填充功能
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.parser import parse_resume
from app.templates import load_templates
from app.services.template_filler import fill_resume_template


async def test_template_filling():
    """测试模板智能填充"""
    print("=" * 60)
    print("测试：智能模板填充")
    print("=" * 60)
    
    # 示例简历文本
    resume_text = """
叶美如
电话: 19825000780
邮箱: yemr22@mails.tsinghua.edu.cn

教育背景
南京理工大学 · 测控技术与仪器专业 | 本科 | 2018.9 - 2022.6
GPA: 3.94 / 4.0（年级前 3%）
连续两年获国家奖学金
江苏省数学竞赛一等奖
MathorCup 商业数据挑战赛二等奖（国家级）

清华大学 · 智能制造 | 硕士 | 2022.9 - 2025.6
GPA: 3.99/4.0
管理制造，排名：33/1215

项目经历
自主执行任务的Mobile phone Agent（Agent、多模态） 2025.2-2025.4
目标：以自然语言操控手机完成任务，减少用户手动操作，提高效率
工具：python、cv2、yolo、adb、多模态监督微调、llama factory
对接 OmniParser、Even-Map 等 5 种多模态接口，构建任务分解与流程管控模块
收集 398 条样本进行 LoRA 微调实验，验证了 LLMs 在任务执行上的效果

双层结构化自动化提示词工具（Prompt、微调、Agent协作） 2024.9-2024.10
目标：自动化提示词生成与优化
工具：AutoDL、ubuntu22.04、python3.10、langchain、ollama、LLaMA-Factory、streamlit
开发了基于双层结构的提示词工程，收集了 398 条样本进行 LoRA 微调实验

科研经历
气动关节：基于可控折痕的模块化执行器（软体机器人） 2023.8-2024.6
项目背景：软体机器人的折痕可调整性研究，导师指导下进行的研究项目
主要内容：从折痕可调整性的角度，探索了折痕可调整性对软体机器人性能的影响
成果：期刊一作：Soft Robotics在投（IF：8）

实习经历
清华大学AIR智能产业研究院 2024.7-2024.11
职位：算法研发实习生
工作内容：探索LMM能力边界与落地场景；上线多项示范应用

综合素养
编程技能：C++、C、python、MATLAB
外语水平：CET6（日常会话）
校园工作：2019 年入选南京理工大学本科生"先锋计划"
个人评价：具有较强的分析问题和解决问题的能力；善于学习新技术的能力；学习能力强
    """
    
    # 解析简历
    print("\n步骤1: 解析简历文本...")
    parsed = parse_resume(resume_text)
    print(f"  - 姓名: {parsed.contacts.name}")
    print(f"  - 邮箱: {parsed.contacts.email}")
    print(f"  - 电话: {parsed.contacts.phone}")
    print(f"  - 分块数: {len(parsed.blocks)}")
    for i, block in enumerate(parsed.blocks[:5], 1):
        preview = block.text[:50].replace('\n', ' ') + "..." if len(block.text) > 50 else block.text.replace('\n', ' ')
        print(f"    {i}. [{block.type}] {preview}")
    
    # 加载模板
    print("\n步骤2: 加载简历模板...")
    templates = load_templates()
    template = templates[0]  # 使用第一个模板
    print(f"  - 模板ID: {template.id}")
    print(f"  - 模板名称: {template.name}")
    
    # 填充模板
    print("\n步骤3: 智能填充模板...")
    filled_html = fill_resume_template(template.markdown, parsed)
    
    # 保存结果
    output_file = Path("test_output_resume.html")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(filled_html)
    
    print(f"  [SUCCESS] 模板填充完成!")
    print(f"  - 输出文件: {output_file.absolute()}")
    print(f"  - 文件大小: {len(filled_html)} 字符")
    
    # 显示部分填充结果
    print("\n步骤4: 预览填充结果（前500字符）...")
    print("-" * 60)
    print(filled_html[:500])
    print("...")
    print("-" * 60)
    
    # 检查关键信息是否正确填充
    print("\n步骤5: 验证填充内容...")
    checks = {
        '姓名': parsed.contacts.name in filled_html if parsed.contacts.name else False,
        '邮箱': parsed.contacts.email in filled_html if parsed.contacts.email else False,
        '电话': parsed.contacts.phone in filled_html if parsed.contacts.phone else False,
        '教育背景': '教育背景' in filled_html,
        '项目经历': '项目经历' in filled_html,
        '科研经历': '科研经历' in filled_html,
        '实习经历': '实习经历' in filled_html,
        '综合素养': '综合素养' in filled_html,
    }
    
    for key, passed in checks.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"  {status} {key}")
    
    all_passed = all(checks.values())
    if all_passed:
        print("\n[SUCCESS] 所有验证通过！")
    else:
        print("\n[WARNING] 部分验证未通过，请检查")
    
    return filled_html


async def main():
    """运行测试"""
    print("\n" + "=" * 60)
    print("开始测试智能模板填充功能")
    print("=" * 60 + "\n")
    
    try:
        await test_template_filling()
        print("\n" + "=" * 60)
        print("测试完成！")
        print("=" * 60)
    except Exception as e:
        print(f"\n[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())




