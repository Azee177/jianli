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

export function CompanyJobExtension({ context, onContextChange }: ExtensionProps) {
  const [inputMode, setInputMode] = useState<'link' | 'text' | 'image'>('link');
  const [jdInput, setJdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jdResults, setJdResults] = useState<JDItem[]>([]);
  const [selectedJD, setSelectedJD] = useState<JDItem | null>(null);
  const [fitReport, setFitReport] = useState<FitReport | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (searchQuery) {
      setJdResults(mockJDResults.filter(jd => 
        jd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jd.company.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setJdResults(mockJDResults);
    }
  }, [searchQuery]);

  const handleJDParse = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setJdResults(mockJDResults);
      setIsLoading(false);
    }, 1000);
  };

  const handleSetTarget = (jd: JDItem) => {
    const target: TargetType = {
      id: jd.id,
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
    onContextChange({ target, jd });
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索公司名 / 岗位关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          />
        </div>

        {/* Smart Recommendations */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Zap className="h-3 w-3" />
          <span>智能推荐：基于简历自动匹配相关岗位</span>
        </div>
      </div>

      {/* Current Target */}
      {context.target && (
        <div className="border-b border-white/10 bg-sky-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-sky-400" />
              <div>
                <div className="font-medium text-sky-200">
                  {context.target.company} · {context.target.role}
                </div>
                <div className="text-xs text-sky-300">
                  匹配度 {context.target.fitScore}% · 解析置信度 0.82
                </div>
              </div>
            </div>
            <button className="text-xs text-sky-300 hover:text-sky-200">
              重新选择
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-3">
        {jdResults.map((jd) => (
          <div
            key={jd.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-slate-100">{jd.title}</h3>
                  {jd.hasReferral && (
                    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                      内推
                    </span>
                  )}
                  {jd.isRemote && (
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                      远程
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {jd.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {jd.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {jd.updatedDays}天前
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium text-slate-200">{jd.fitScore}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {jd.keySkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {jd.keySkills.length > 3 && (
                      <span className="text-xs text-slate-400">
                        +{jd.keySkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  来源：{jd.source}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleCompare(jd)}
                  className="rounded bg-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/20"
                >
                  对比
                </button>
                <button
                  onClick={() => handleSetTarget(jd)}
                  className="rounded bg-sky-500 px-3 py-1 text-xs text-white hover:bg-sky-600"
                >
                  设为目标
                </button>
              </div>
            </div>
          </div>
        ))}
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
