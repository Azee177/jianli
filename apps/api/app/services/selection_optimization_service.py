"""选区优化服务 - 优化选中文本"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional, List, Dict
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class OptimizationVersion:
    """优化版本"""
    version_name: str  # 'conservative', 'balanced', 'aggressive'
    content: str
    changes_description: str
    risk_level: str  # 'low', 'medium', 'high'
    

@dataclass
class OptimizationResult:
    """优化结果"""
    id: str
    original_text: str
    optimization_type: str
    versions: List[OptimizationVersion]
    recommendations: str
    diff_highlights: List[Dict[str, any]]  # diff高亮信息
    created_at: datetime
    

class SelectionOptimizationService:
    """选区优化服务"""
    
    def __init__(self):
        self._optimization_cache = {}  # optimization_id -> OptimizationResult
        
    async def optimize_selection(
        self,
        text: str,
        optimization_type: str,
        context: Optional[Dict] = None
    ) -> str:
        """优化选中文本
        
        Args:
            text: 选中的文本
            optimization_type: 优化类型
                - 'star': STAR法则化
                - 'quantify': 量化
                - 'reduce_duplicate': 降重
                - 'translate': 翻译
                - 'company_style': 公司风格
            context: 上下文信息（可选）
            
        Returns:
            optimization_id
        """
        logger.info(f"Optimizing selection with type: {optimization_type}")
        
        # 模拟LLM优化过程
        await asyncio.sleep(1.2)
        
        # 生成三个版本
        versions = await self._generate_three_versions(text, optimization_type, context)
        
        # 生成diff高亮
        diff_highlights = self._generate_diff_highlights(text, versions)
        
        # 创建结果
        optimization_id = f"opt_{uuid4().hex[:8]}"
        result = OptimizationResult(
            id=optimization_id,
            original_text=text,
            optimization_type=optimization_type,
            versions=versions,
            recommendations=self._generate_recommendations(optimization_type, versions),
            diff_highlights=diff_highlights,
            created_at=datetime.utcnow()
        )
        
        self._optimization_cache[optimization_id] = result
        
        return optimization_id
    
    async def _generate_three_versions(
        self,
        text: str,
        optimization_type: str,
        context: Optional[Dict]
    ) -> List[OptimizationVersion]:
        """生成稳健/优化/激进三个版本
        
        Args:
            text: 原始文本
            optimization_type: 优化类型
            context: 上下文
            
        Returns:
            三个版本
        """
        versions = []
        
        if optimization_type == 'star':
            # STAR法则化
            versions = [
                OptimizationVersion(
                    version_name='conservative',
                    content=self._apply_star_conservative(text),
                    changes_description='基础STAR结构，保持原文风格',
                    risk_level='low'
                ),
                OptimizationVersion(
                    version_name='balanced',
                    content=self._apply_star_balanced(text),
                    changes_description='完整STAR结构，增强表达',
                    risk_level='medium'
                ),
                OptimizationVersion(
                    version_name='aggressive',
                    content=self._apply_star_aggressive(text),
                    changes_description='深度STAR化，重构描述',
                    risk_level='high'
                )
            ]
            
        elif optimization_type == 'quantify':
            # 量化
            versions = [
                OptimizationVersion(
                    version_name='conservative',
                    content=self._quantify_conservative(text),
                    changes_description='添加基础量化指标',
                    risk_level='low'
                ),
                OptimizationVersion(
                    version_name='balanced',
                    content=self._quantify_balanced(text),
                    changes_description='多维度量化，数据充实',
                    risk_level='medium'
                ),
                OptimizationVersion(
                    version_name='aggressive',
                    content=self._quantify_aggressive(text),
                    changes_description='全面量化，突出成果',
                    risk_level='high'
                )
            ]
            
        elif optimization_type == 'reduce_duplicate':
            # 降重
            versions = [
                OptimizationVersion(
                    version_name='conservative',
                    content=self._reduce_duplicate_conservative(text),
                    changes_description='同义词替换',
                    risk_level='low'
                ),
                OptimizationVersion(
                    version_name='balanced',
                    content=self._reduce_duplicate_balanced(text),
                    changes_description='句式重构，表达多样化',
                    risk_level='medium'
                ),
                OptimizationVersion(
                    version_name='aggressive',
                    content=self._reduce_duplicate_aggressive(text),
                    changes_description='全新角度重写',
                    risk_level='high'
                )
            ]
            
        elif optimization_type == 'translate':
            # 翻译（中英互译）
            is_chinese = any('\u4e00' <= char <= '\u9fff' for char in text)
            
            if is_chinese:
                versions = [
                    OptimizationVersion(
                        version_name='conservative',
                        content=self._translate_to_english_simple(text),
                        changes_description='直译',
                        risk_level='low'
                    ),
                    OptimizationVersion(
                        version_name='balanced',
                        content=self._translate_to_english_balanced(text),
                        changes_description='意译，符合英文表达习惯',
                        risk_level='medium'
                    ),
                    OptimizationVersion(
                        version_name='aggressive',
                        content=self._translate_to_english_native(text),
                        changes_description='母语化表达',
                        risk_level='high'
                    )
                ]
            else:
                versions = [
                    OptimizationVersion(
                        version_name='conservative',
                        content=self._translate_to_chinese_simple(text),
                        changes_description='直译',
                        risk_level='low'
                    ),
                    OptimizationVersion(
                        version_name='balanced',
                        content=self._translate_to_chinese_balanced(text),
                        changes_description='符合中文表达习惯',
                        risk_level='medium'
                    ),
                    OptimizationVersion(
                        version_name='aggressive',
                        content=self._translate_to_chinese_native(text),
                        changes_description='本地化表达',
                        risk_level='high'
                    )
                ]
                
        elif optimization_type == 'company_style':
            # 公司风格
            company = context.get('company') if context else None
            
            versions = [
                OptimizationVersion(
                    version_name='conservative',
                    content=self._apply_company_style_light(text, company),
                    changes_description='微调术语和表达',
                    risk_level='low'
                ),
                OptimizationVersion(
                    version_name='balanced',
                    content=self._apply_company_style_moderate(text, company),
                    changes_description='呼应公司文化和价值观',
                    risk_level='medium'
                ),
                OptimizationVersion(
                    version_name='aggressive',
                    content=self._apply_company_style_strong(text, company),
                    changes_description='深度定制，镜像公司语言',
                    risk_level='high'
                )
            ]
        
        else:
            # 默认通用优化
            versions = [
                OptimizationVersion(
                    version_name='conservative',
                    content=text + " [保守优化]",
                    changes_description='最小改动',
                    risk_level='low'
                ),
                OptimizationVersion(
                    version_name='balanced',
                    content=text + " [平衡优化]",
                    changes_description='适度优化',
                    risk_level='medium'
                ),
                OptimizationVersion(
                    version_name='aggressive',
                    content=text + " [激进优化]",
                    changes_description='大幅改进',
                    risk_level='high'
                )
            ]
        
        return versions
    
    # STAR法则化实现
    def _apply_star_conservative(self, text: str) -> str:
        return f"【情境】{text[:30]}...\n【任务】...\n【行动】{text}\n【结果】..."
    
    def _apply_star_balanced(self, text: str) -> str:
        return f"**情境**: 在项目背景下\n**任务**: 负责核心功能开发\n**行动**: {text}\n**结果**: 显著提升了系统性能"
    
    def _apply_star_aggressive(self, text: str) -> str:
        return f"**情境**: 面对业务快速增长的挑战\n**任务**: 负责核心系统架构升级，目标提升30%性能\n**行动**: {text}，采用分布式架构，引入缓存机制\n**结果**: 成功支撑10倍流量增长，系统响应时间降低50%，用户满意度提升40%"
    
    # 量化实现
    def _quantify_conservative(self, text: str) -> str:
        return text + "，提升了系统性能"
    
    def _quantify_balanced(self, text: str) -> str:
        return text + "，使系统性能提升30%，响应时间降低50%"
    
    def _quantify_aggressive(self, text: str) -> str:
        return text + "，使系统TPS从1000提升至3000+，P99延迟从500ms降至100ms，服务可用性达99.99%，为公司节省成本200万元/年"
    
    # 降重实现
    def _reduce_duplicate_conservative(self, text: str) -> str:
        return text.replace('负责', '承担').replace('开发', '研发').replace('优化', '改进')
    
    def _reduce_duplicate_balanced(self, text: str) -> str:
        return f"通过创新的技术方案，{text.replace('负责', '主导').replace('开发', '构建')}"
    
    def _reduce_duplicate_aggressive(self, text: str) -> str:
        return f"从零到一搭建了完整的技术体系，{text}，并最终交付了高质量的解决方案"
    
    # 翻译实现
    def _translate_to_english_simple(self, text: str) -> str:
        return f"[Translated] {text}"
    
    def _translate_to_english_balanced(self, text: str) -> str:
        return f"[English Version] {text}"
    
    def _translate_to_english_native(self, text: str) -> str:
        return f"[Native English] {text}"
    
    def _translate_to_chinese_simple(self, text: str) -> str:
        return f"[中文翻译] {text}"
    
    def _translate_to_chinese_balanced(self, text: str) -> str:
        return f"[中文版本] {text}"
    
    def _translate_to_chinese_native(self, text: str) -> str:
        return f"[本地化中文] {text}"
    
    # 公司风格实现
    def _apply_company_style_light(self, text: str, company: Optional[str]) -> str:
        if company:
            return f"{text} (符合{company}技术文化)"
        return text
    
    def _apply_company_style_moderate(self, text: str, company: Optional[str]) -> str:
        if company == "字节跳动":
            return f"{text}，追求极致的用户体验和技术创新"
        elif company == "阿里巴巴":
            return f"{text}，让天下没有难做的生意"
        return text
    
    def _apply_company_style_strong(self, text: str, company: Optional[str]) -> str:
        if company == "字节跳动":
            return f"以用户价值为核心，{text}，通过技术创新持续提升产品竞争力"
        elif company == "阿里巴巴":
            return f"秉承客户第一的理念，{text}，用技术赋能商业"
        return text + " [定制化]"
    
    def _generate_diff_highlights(
        self,
        original: str,
        versions: List[OptimizationVersion]
    ) -> List[Dict]:
        """生成diff高亮信息"""
        highlights = []
        
        for version in versions:
            # 简单的diff（实际应该用专业的diff算法）
            highlights.append({
                'version': version.version_name,
                'added_words': len(version.content.split()) - len(original.split()),
                'modified_rate': 0.3 if version.risk_level == 'low' else (0.6 if version.risk_level == 'medium' else 0.9)
            })
        
        return highlights
    
    def _generate_recommendations(
        self,
        optimization_type: str,
        versions: List[OptimizationVersion]
    ) -> str:
        """生成推荐说明"""
        if optimization_type == 'star':
            return "建议使用平衡版本，既保持真实性又能体现STAR结构"
        elif optimization_type == 'quantify':
            return "推荐平衡版本，量化数据需基于真实情况"
        elif optimization_type == 'reduce_duplicate':
            return "稳健版本最安全，激进版本需谨慎使用"
        else:
            return "请根据实际情况选择合适的版本"
    
    def get_optimization_result(self, optimization_id: str) -> Optional[OptimizationResult]:
        """获取优化结果"""
        return self._optimization_cache.get(optimization_id)
    
    async def validate_factuality(
        self,
        original: str,
        optimized: str
    ) -> Dict[str, any]:
        """防虚构校验
        
        Args:
            original: 原始文本
            optimized: 优化后文本
            
        Returns:
            校验结果
        """
        logger.info("Validating factuality")
        
        # 模拟LLM校验
        await asyncio.sleep(0.8)
        
        # 简单的虚构检测
        original_words = set(original.split())
        optimized_words = set(optimized.split())
        
        new_words = optimized_words - original_words
        new_words_count = len(new_words)
        
        # 检查是否添加了具体数字
        import re
        original_numbers = set(re.findall(r'\d+', original))
        optimized_numbers = set(re.findall(r'\d+', optimized))
        new_numbers = optimized_numbers - original_numbers
        
        is_safe = new_words_count < 20 and len(new_numbers) < 5
        
        return {
            'is_safe': is_safe,
            'risk_level': 'low' if is_safe else 'high',
            'new_words_count': new_words_count,
            'new_numbers': list(new_numbers),
            'warnings': [] if is_safe else ['检测到较多新增内容，请确保真实性']
        }

