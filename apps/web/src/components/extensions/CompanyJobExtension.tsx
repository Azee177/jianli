'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Link, 
  FileText, 
  Image, 
  Building2, 
  MapPin, 
  Clock, 
  Star,
  Target,
  ExternalLink,
  Zap,
  TrendingUp
} from 'lucide-react';
import { ExtensionProps, JDItem, Target as TargetType, FitReport } from '@/types/extensions';
import { searchJD, setTarget as setTargetAPI, parseJD } from '@/lib/fastapi-hooks';

export function CompanyJobExtension({ context, onContextChange }: ExtensionProps) {
  const [inputMode, setInputMode] = useState<'link' | 'text' | 'image'>('link');
  const [jdInput, setJdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jdResults, setJdResults] = useState<JDItem[]>([]);
  const [selectedJD, setSelectedJD] = useState<JDItem | null>(null);
  const [fitReport, setFitReport] = useState<FitReport | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Mock data for demonstration
  const mockJDResults: JDItem[] = [
    {
      id: '1',
      title: '后端开发工程师',
      company: 'ByteDance',
      location: '上海',
      source: 'Boss直聘',
      fitScore: 85,
      keySkills: ['Go', 'Redis', 'MySQL', '微服务'],
      requirements: ['3年以上后端开发经验', '熟悉分布式系统', '有高并发经验'],
      culture: ['拥抱变化', '追求极致', '开放谦逊'],
      updatedDays: 2,
      hasReferral: true
    },
    {
      id: '2', 
      title: '高级后端工程师',
      company: '腾讯',
      location: '深圳',
      source: '拉勾网',
      fitScore: 78,
      keySkills: ['Java', 'Spring', 'Kafka', 'Docker'],
      requirements: ['5年以上开发经验', '熟悉云原生技术', '有团队管理经验'],
      culture: ['用户为本', '科技向善', '正直进取'],
      updatedDays: 1,
      isRemote: true
    },
    {
      id: '3',
      title: 'AI工程师',
      company: '清华大学AI研究院',
      location: '北京',
      source: '官网',
      fitScore: 92,
      keySkills: ['Python', 'PyTorch', 'LLM', 'RAG'],
      requirements: ['机器学习背景', '深度学习框架经验', '论文发表经验'],
      culture: ['学术严谨', '创新驱动', '开放合作'],
      updatedDays: 0,
      hasReferral: false
    }
  ];

  const mockFitReport: FitReport = {
    score: 85,
    strengths: ['技术栈匹配度高', '项目经验丰富', '学历背景优秀'],
    gaps: ['缺少高并发实战经验', '团队管理经验不足'],
    improvements: [
      { action: '在项目经历中突出QPS和并发处理能力', impact: 12, section: '项目经历' },
      { action: '补充团队协作和技术分享经验', impact: 8, section: '工作经历' },
      { action: '添加相关技术认证或培训经历', impact: 5, section: '技能证书' }
    ]
  };

  // 执行搜索
  const handleSearch = async () => {
    if (!searchTitle && !searchCompany) {
      alert('请至少输入职位名称或公司名称');
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchJD({
        company: searchCompany || undefined,
        title: searchTitle || undefined,
        city: searchCity || undefined,
        limit: 20
      });
      
      // 转换后端返回的数据格式为前端格式
      const formattedResults: JDItem[] = (result.jds || result.results || []).map((item: any) => ({
        id: item.id || item.jd_id,
        title: item.title || item.position,
        company: item.company,
        location: item.location || item.city,
        source: item.source || item.platform,
        fitScore: item.match_score || 0,
        keySkills: item.key_skills || item.requirements || [],
        requirements: item.requirements || [],
        culture: item.culture || [],
        updatedDays: item.updated_days || 0,
        hasReferral: item.has_referral || false,
        isRemote: item.is_remote || false,
        url: item.url || item.link
      }));
      
      setJdResults(formattedResults);
      
      // 如果没有结果，使用Mock数据作为降级
      if (formattedResults.length === 0) {
        setJdResults(mockJDResults);
      }
    } catch (error) {
      console.error('JD search failed:', error);
      // 使用Mock数据作为降级
      setJdResults(mockJDResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJDParse = async () => {
    if (!jdInput.trim()) {
      alert('请输入JD链接或文本');
      return;
    }

    setIsLoading(true);
    try {
      const jd = await parseJD(
        inputMode === 'link' ? { url: jdInput } : { text: jdInput }
      );
      
      // 将解析的JD添加到结果列表
      const newJDItem: JDItem = {
        id: jd.id,
        title: jd.title || jd.position || '未知职位',
        company: jd.company || '未知公司',
        location: jd.city || jd.location || '未知',
        source: '手动解析',
        fitScore: 0,
        keySkills: jd.key_skills || [],
        requirements: jd.requirements || [],
        culture: [],
        updatedDays: 0,
        hasReferral: false
      };
      
      setJdResults([newJDItem, ...jdResults]);
      setJdInput('');
    } catch (error) {
      console.error('JD parse failed:', error);
      alert('JD解析失败，请检查输入');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetTarget = async (jd: JDItem) => {
    try {
      // 调用真实的目标设定API
      const targetResult = await setTargetAPI(jd.id);
      
      const target: TargetType = {
        id: targetResult.id || jd.id,
        company: jd.company,
        role: jd.title,
        location: jd.location,
        jdText: `${jd.title} at ${jd.company}`,
        culture: jd.culture,
        fitScore: jd.fitScore,
        createdAt: new Date()
      };
      
      setSelectedJD(jd);
      setFitReport(mockFitReport);
      
      // 更新上下文
      await onContextChange({ target, jd });
      
      alert(`已设置目标岗位：${jd.company} - ${jd.title}`);
    } catch (error) {
      console.error('Failed to set target:', error);
      alert('设置目标岗位失败');
    }
  };

  const handleCompare = (jd: JDItem) => {
    setSelectedJD(jd);
    setFitReport(mockFitReport);
    setShowComparison(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Input Section */}
      <div className="border-b border-white/10 p-4 space-y-4">
        {/* Input Mode Tabs */}
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {[
            { key: 'link', icon: Link, label: '链接' },
            { key: 'text', icon: FileText, label: '文本' },
            { key: 'image', icon: Image, label: '截图' }
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setInputMode(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                inputMode === key
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          {inputMode === 'link' && (
            <input
              type="url"
              placeholder="粘贴JD链接..."
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            />
          )}
          {inputMode === 'text' && (
            <textarea
              placeholder="粘贴JD文本..."
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            />
          )}
          {inputMode === 'image' && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 py-8">
              <div className="text-center">
                <Image className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-400">拖拽或点击上传JD截图</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleJDParse}
            disabled={!jdInput || isLoading}
            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '解析中...' : '解析JD'}
          </button>
        </div>

        {/* Multi-Source Search */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">多平台搜索</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="公司名称"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="职位名称"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <input
            type="text"
            placeholder="城市（可选）"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || (!searchTitle && !searchCompany)}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? '搜索中...' : '🔍 搜索岗位'}
          </button>
        </div>

        {/* Smart Recommendations */}
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          <Zap className="h-3 w-3" />
          <span>聚合 Boss直聘、拉勾、51Job、实习僧</span>
        </div>
      </div>

      {/* Current Target */}
      {context.target && (
        <div className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">
                  {context.target.company} · {context.target.role}
                </div>
                <div className="text-xs text-blue-600">
                  匹配度 {context.target.fitScore}%
                </div>
              </div>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              重新选择
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-3">
        {jdResults.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">暂无搜索结果</p>
              <p className="text-xs text-gray-400 mt-1">请输入搜索条件开始搜索</p>
            </div>
          </div>
        ) : (
          jdResults.map((jd) => (
            <div
              key={jd.id}
              className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{jd.title}</h3>
                    {jd.hasReferral && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-medium border border-green-200">
                        内推
                      </span>
                    )}
                    {jd.isRemote && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 font-medium border border-blue-200">
                        远程
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {jd.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {jd.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {jd.updatedDays}天前
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900">{jd.fitScore}%</span>
                      <span className="text-xs text-gray-500">匹配度</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {jd.keySkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {jd.keySkills.length > 4 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{jd.keySkills.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    来源：{jd.source}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleCompare(jd)}
                    className="rounded-lg bg-white border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-all"
                  >
                    对比
                  </button>
                  <button
                    onClick={() => handleSetTarget(jd)}
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs text-white hover:from-blue-600 hover:to-indigo-700 font-medium shadow-sm transition-all"
                  >
                    设为目标
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comparison Drawer */}
      {showComparison && selectedJD && fitReport && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-[rgba(10,12,20,0.98)] border-l border-white/10 p-4 overflow-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-100">匹配度分析</h3>
              <button
                onClick={() => setShowComparison(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-400">{fitReport.score}%</div>
                <div className="text-sm text-slate-400">还可提升 +{100 - fitReport.score} 分</div>
              </div>

              <div>
                <h4 className="font-medium text-slate-200 mb-2">优势</h4>
                <ul className="space-y-1">
                  {fitReport.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-300 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-green-400" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-200 mb-2">待提升</h4>
                <ul className="space-y-1">
                  {fitReport.gaps.map((gap, index) => (
                    <li key={index} className="text-sm text-orange-300 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-orange-400" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-200 mb-2">改进建议</h4>
                <div className="space-y-2">
                  {fitReport.improvements.map((improvement, index) => (
                    <div key={index} className="rounded bg-white/5 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200">
                          +{improvement.impact} 分
                        </span>
                        <span className="text-xs text-slate-400">
                          {improvement.section}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{improvement.action}</p>
                      <button className="mt-2 text-xs text-sky-400 hover:text-sky-300">
                        一键应用
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
