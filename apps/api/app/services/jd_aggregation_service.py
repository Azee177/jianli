"""JD聚合分析服务 - 抓取15条JD并分析共性"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class JDItem:
    """JD项"""
    id: str
    company: str
    title: str
    location: str
    jd_text: str
    requirements: List[str]  # 提取的要求列表
    source: str  # 'official_site' or 'job_board'
    is_target_company: bool  # 是否为目标公司
    

@dataclass
class AtomicRequirement:
    """原子能力点"""
    text: str
    category: str  # '技能', '经验', '教育', '软技能'等
    frequency: int  # 出现频率
    jd_sources: List[str]  # 来源JD的ID列表
    

@dataclass
class CommonalityDimension:
    """共性维度"""
    id: str
    title: str
    description: str
    importance: float  # 0.0-1.0
    frequency: int  # 在多少条JD中出现
    total_jds: int  # 总JD数
    evidence_sentences: List[str]  # 原始JD中的证据句
    is_locked: bool = False  # 是否已锁定
    

class JDAggregationService:
    """JD聚合分析服务"""
    
    def __init__(self):
        self._jd_cache = {}  # jd_id -> JDItem
        self._commonalities_cache = {}  # analysis_id -> List[CommonalityDimension]
        
        # 大厂官网配置
        self.official_sites = {
            "字节跳动": "https://jobs.bytedance.com",
            "腾讯": "https://careers.tencent.com",
            "阿里巴巴": "https://talent.alibaba.com",
            "百度": "https://talent.baidu.com",
            "美团": "https://zhaopin.meituan.com",
            "京东": "https://zhaopin.jd.com",
            "拼多多": "https://careers.pinduoduo.com"
        }
    
    async def fetch_multiple_jds(
        self,
        position: str,
        company: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 15
    ) -> List[JDItem]:
        """抓取15条相同岗位的JD
        
        Args:
            position: 岗位名称
            company: 目标公司（可选）
            city: 城市（可选）
            limit: 抓取数量
            
        Returns:
            JD列表
        """
        logger.info(f"Fetching {limit} JDs for position: {position}, company: {company}")
        
        jds = []
        
        # 如果指定了目标公司，优先从官网抓取
        if company and company in self.official_sites:
            official_jds = await self._fetch_from_official_site(company, position, city)
            jds.extend(official_jds)
        
        # 从各大招聘网站补充
        if len(jds) < limit:
            job_board_jds = await self._fetch_from_job_boards(
                position, 
                company, 
                city, 
                limit - len(jds)
            )
            jds.extend(job_board_jds)
        
        # 缓存结果
        for jd in jds:
            self._jd_cache[jd.id] = jd
        
        return jds[:limit]
    
    async def _fetch_from_official_site(
        self,
        company: str,
        position: str,
        city: Optional[str] = None
    ) -> List[JDItem]:
        """从大厂官网抓取JD
        
        Args:
            company: 公司名称
            position: 岗位名称
            city: 城市
            
        Returns:
            JD列表
        """
        # 模拟从官网抓取
        await asyncio.sleep(1.5)
        
        official_site = self.official_sites.get(company)
        if not official_site:
            return []
        
        # 这里应该实际调用爬虫，现在返回模拟数据
        jds = []
        
        # 模拟官网JD
        jd_id = f"jd_{company}_{uuid4().hex[:8]}"
        jds.append(JDItem(
            id=jd_id,
            company=company,
            title=position,
            location=city or "北京",
            jd_text=self._generate_mock_jd_text(company, position, is_official=True),
            requirements=self._extract_requirements_from_text(
                self._generate_mock_jd_text(company, position, is_official=True)
            ),
            source="official_site",
            is_target_company=True
        ))
        
        return jds
    
    async def _fetch_from_job_boards(
        self,
        position: str,
        company: Optional[str],
        city: Optional[str],
        limit: int
    ) -> List[JDItem]:
        """从招聘网站抓取JD
        
        Args:
            position: 岗位名称
            company: 公司名称（可选，用于过滤）
            city: 城市（可选）
            limit: 数量
            
        Returns:
            JD列表
        """
        # 模拟从招聘网站抓取
        await asyncio.sleep(2)
        
        jds = []
        
        # 模拟其他公司的类似岗位
        similar_companies = [
            "字节跳动", "腾讯", "阿里巴巴", "百度", "美团", 
            "京东", "拼多多", "小米", "华为", "网易"
        ]
        
        for i, comp in enumerate(similar_companies[:limit]):
            if comp == company:
                continue
            
            jd_id = f"jd_{comp}_{uuid4().hex[:8]}"
            jds.append(JDItem(
                id=jd_id,
                company=comp,
                title=position,
                location=city or "北京",
                jd_text=self._generate_mock_jd_text(comp, position, is_official=False),
                requirements=self._extract_requirements_from_text(
                    self._generate_mock_jd_text(comp, position, is_official=False)
                ),
                source="job_board",
                is_target_company=(comp == company)
            ))
        
        return jds
    
    def _generate_mock_jd_text(
        self,
        company: str,
        position: str,
        is_official: bool
    ) -> str:
        """生成模拟的JD文本"""
        return f"""
{company} - {position}

岗位职责：
1. 负责{company}核心业务系统的设计和开发
2. 参与技术方案评审和系统架构设计
3. 优化系统性能，提升用户体验
4. 协同产品、运营团队，推动项目落地

任职要求：
1. 本科及以上学历，计算机相关专业
2. 3-5年相关工作经验
3. 熟练掌握Python/Java等主流编程语言
4. 熟悉MySQL、Redis等数据库
5. 具备良好的代码规范和文档习惯
6. 有分布式系统经验者优先
7. 具备良好的团队协作和沟通能力
8. 学习能力强，能快速适应新技术
        """.strip()
    
    def _extract_requirements_from_text(self, jd_text: str) -> List[str]:
        """从JD文本中提取要求"""
        requirements = []
        
        # 简单的规则提取
        lines = jd_text.split('\n')
        in_requirements = False
        
        for line in lines:
            line = line.strip()
            
            if '任职要求' in line or '岗位要求' in line or 'Requirements' in line:
                in_requirements = True
                continue
            
            if in_requirements:
                if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                    # 这是一条要求
                    # 清理行号和标记
                    cleaned = line.lstrip('0123456789.-•、 ')
                    if cleaned:
                        requirements.append(cleaned)
        
        return requirements
    
    async def analyze_15_jds(self, jd_list: List[JDItem]) -> str:
        """分析15条JD，返回分析ID
        
        Args:
            jd_list: JD列表
            
        Returns:
            analysis_id
        """
        # 提取原子能力点
        atomic_requirements = await self._extract_atomic_requirements(jd_list)
        
        # 聚合为共性维度
        commonalities = await self._cluster_to_commonalities(atomic_requirements, len(jd_list))
        
        # 生成分析ID
        analysis_id = f"analysis_{uuid4().hex[:8]}"
        
        # 缓存结果
        self._commonalities_cache[analysis_id] = commonalities
        
        return analysis_id
    
    async def _extract_atomic_requirements(
        self,
        jd_list: List[JDItem]
    ) -> List[AtomicRequirement]:
        """提取原子能力点
        
        Args:
            jd_list: JD列表
            
        Returns:
            原子能力点列表
        """
        # 模拟LLM提取过程
        await asyncio.sleep(1)
        
        # 统计所有要求的出现频率
        requirement_map = {}  # requirement_text -> (category, jd_ids)
        
        for jd in jd_list:
            for req in jd.requirements:
                # 简化的分类逻辑（实际应该用LLM）
                category = self._categorize_requirement(req)
                
                key = req.strip()
                if key in requirement_map:
                    requirement_map[key]['jd_sources'].append(jd.id)
                    requirement_map[key]['frequency'] += 1
                else:
                    requirement_map[key] = {
                        'text': key,
                        'category': category,
                        'frequency': 1,
                        'jd_sources': [jd.id]
                    }
        
        # 转换为AtomicRequirement列表
        atomic_reqs = []
        for req_data in requirement_map.values():
            atomic_reqs.append(AtomicRequirement(
                text=req_data['text'],
                category=req_data['category'],
                frequency=req_data['frequency'],
                jd_sources=req_data['jd_sources']
            ))
        
        return atomic_reqs
    
    def _categorize_requirement(self, requirement: str) -> str:
        """对要求进行分类"""
        req_lower = requirement.lower()
        
        if any(keyword in req_lower for keyword in ['学历', '本科', '硕士', '博士', 'bachelor', 'master']):
            return '教育'
        elif any(keyword in req_lower for keyword in ['年', 'year', '经验', 'experience']):
            return '经验'
        elif any(keyword in req_lower for keyword in ['python', 'java', 'go', 'javascript', 'mysql', 'redis']):
            return '技术技能'
        elif any(keyword in req_lower for keyword in ['沟通', '协作', '团队', '学习', '创新']):
            return '软技能'
        else:
            return '其他'
    
    async def _cluster_to_commonalities(
        self,
        atomic_reqs: List[AtomicRequirement],
        total_jds: int
    ) -> List[CommonalityDimension]:
        """将原子能力点聚合为4-5条共性维度
        
        Args:
            atomic_reqs: 原子能力点列表
            total_jds: 总JD数
            
        Returns:
            共性维度列表
        """
        # 模拟LLM聚合过程
        await asyncio.sleep(1)
        
        # 按类别分组
        category_groups = {}
        for req in atomic_reqs:
            if req.category not in category_groups:
                category_groups[req.category] = []
            category_groups[req.category].append(req)
        
        # 生成共性维度
        commonalities = []
        
        # 1. 教育背景
        if '教育' in category_groups:
            edu_reqs = category_groups['教育']
            most_common = max(edu_reqs, key=lambda x: x.frequency)
            commonalities.append(CommonalityDimension(
                id=f"dim_{uuid4().hex[:8]}",
                title="教育背景要求",
                description="本科及以上学历，计算机相关专业优先",
                importance=0.9,
                frequency=most_common.frequency,
                total_jds=total_jds,
                evidence_sentences=[most_common.text]
            ))
        
        # 2. 工作经验
        if '经验' in category_groups:
            exp_reqs = category_groups['经验']
            most_common = max(exp_reqs, key=lambda x: x.frequency)
            commonalities.append(CommonalityDimension(
                id=f"dim_{uuid4().hex[:8]}",
                title="工作经验要求",
                description="3-5年相关工作经验",
                importance=0.95,
                frequency=most_common.frequency,
                total_jds=total_jds,
                evidence_sentences=[req.text for req in exp_reqs[:3]]
            ))
        
        # 3. 技术技能
        if '技术技能' in category_groups:
            skill_reqs = sorted(category_groups['技术技能'], key=lambda x: x.frequency, reverse=True)
            top_skills = skill_reqs[:5]
            commonalities.append(CommonalityDimension(
                id=f"dim_{uuid4().hex[:8]}",
                title="核心技术能力",
                description="熟练掌握主流编程语言和技术栈",
                importance=1.0,
                frequency=sum(s.frequency for s in top_skills) // len(top_skills),
                total_jds=total_jds,
                evidence_sentences=[req.text for req in top_skills]
            ))
        
        # 4. 软技能
        if '软技能' in category_groups:
            soft_reqs = category_groups['软技能']
            most_common = max(soft_reqs, key=lambda x: x.frequency)
            commonalities.append(CommonalityDimension(
                id=f"dim_{uuid4().hex[:8]}",
                title="综合素质要求",
                description="具备良好的沟通协作能力和学习能力",
                importance=0.85,
                frequency=most_common.frequency,
                total_jds=total_jds,
                evidence_sentences=[req.text for req in soft_reqs[:3]]
            ))
        
        return commonalities[:5]  # 最多返回5条
    
    def get_commonalities(self, analysis_id: str) -> List[CommonalityDimension]:
        """获取共性维度"""
        return self._commonalities_cache.get(analysis_id, [])
    
    async def update_commonality(
        self,
        analysis_id: str,
        dimension_id: str,
        updates: dict
    ) -> CommonalityDimension:
        """更新共性维度（用户编辑）
        
        Args:
            analysis_id: 分析ID
            dimension_id: 维度ID
            updates: 更新内容
            
        Returns:
            更新后的维度
        """
        commonalities = self._commonalities_cache.get(analysis_id)
        if not commonalities:
            raise ValueError(f"Analysis {analysis_id} not found")
        
        # 查找并更新
        for i, dim in enumerate(commonalities):
            if dim.id == dimension_id:
                # 更新字段
                if 'title' in updates:
                    dim.title = updates['title']
                if 'description' in updates:
                    dim.description = updates['description']
                if 'importance' in updates:
                    dim.importance = updates['importance']
                
                return dim
        
        raise ValueError(f"Dimension {dimension_id} not found")
    
    async def lock_dimensions(self, analysis_id: str) -> dict:
        """锁定共性维度
        
        Args:
            analysis_id: 分析ID
            
        Returns:
            锁定结果
        """
        commonalities = self._commonalities_cache.get(analysis_id)
        if not commonalities:
            raise ValueError(f"Analysis {analysis_id} not found")
        
        # 锁定所有维度
        for dim in commonalities:
            dim.is_locked = True
        
        return {
            "success": True,
            "locked_count": len(commonalities),
            "locked_at": datetime.utcnow().isoformat()
        }
    
    def prioritize_target_company(
        self,
        jds: List[JDItem],
        target_company: str
    ) -> List[JDItem]:
        """优先排序目标公司的JD
        
        Args:
            jds: JD列表
            target_company: 目标公司
            
        Returns:
            排序后的JD列表
        """
        # 目标公司的JD排在前面
        target_jds = [jd for jd in jds if jd.company == target_company]
        other_jds = [jd for jd in jds if jd.company != target_company]
        
        return target_jds + other_jds

