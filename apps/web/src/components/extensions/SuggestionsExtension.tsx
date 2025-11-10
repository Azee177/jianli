'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap, 
  Check, 
  X, 
  Edit3,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { ExtensionProps } from '@/types/extensions';
import { analyzeSuggestions } from '@/lib/fastapi-hooks';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: number;
  section: string;
  type: 'rewrite' | 'add' | 'remove' | 'restructure';
  priority: 'high' | 'medium' | 'low';
  jdClause?: string;
  currentText?: string;
  suggestedText?: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export function SuggestionsExtension({ context, onContextChange }: ExtensionProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [groupBy, setGroupBy] = useState<'priority' | 'section' | 'impact'>('priority');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 当简历或目标改变时，自动分析建议
  useEffect(() => {
    if (context.resume?.id && context.target?.id) {
      loadSuggestions();
    }
  }, [context.resume?.id, context.target?.id]);

  const loadSuggestions = async () => {
    if (!context.resume?.id) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeSuggestions(
        context.resume.id,
        context.target?.id
      );
      
      // 转换后端返回的建议格式为前端格式
      const formattedSuggestions: Suggestion[] = (result.suggestions || []).map((item: any, index: number) => ({
        id: `${index + 1}`,
        title: item.title || item.suggestion || '优化建议',
        description: item.description || item.rationale || '',
        impact: item.score || item.impact || 10,
        section: item.section || '未分类',
        type: item.type || 'rewrite',
        priority: item.priority || (item.score > 12 ? 'high' : item.score > 7 ? 'medium' : 'low'),
        jdClause: item.jd_clause || item.jdClause,
        currentText: item.current_text || item.currentText,
        suggestedText: item.suggested_text || item.suggestedText,
        status: 'pending'
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // 使用Mock数据作为降级方案
      setSuggestions(getMockSuggestions());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock suggestions data（作为降级方案）
  const getMockSuggestions = (): Suggestion[] => [
    {
      id: '1',
      title: '量化项目成果',
      description: 'JD强调"高并发与性能调优"，建议把项目A的QPS/延迟指标量化并前置',
      impact: 15,
      section: '项目经历',
      type: 'rewrite',
      priority: 'high',
      jdClause: '具备高并发系统设计和性能调优经验',
      currentText: '负责系统架构设计和性能优化',
      suggestedText: '负责日均1000万+请求的系统架构设计，将响应延迟从200ms优化至50ms，QPS提升300%',
      status: 'pending'
    },
    {
      id: '2',
      title: '突出团队协作',
      description: 'JD要求"跨部门协作能力"，建议在工作经历中补充具体的协作案例',
      impact: 12,
      section: '工作经历',
      type: 'add',
      priority: 'high',
      jdClause: '具备良好的跨部门沟通协作能力',
      suggestedText: '与产品、运营、测试等5个部门协作，推动3个核心项目按期交付，获得季度最佳协作奖',
      status: 'pending'
    },
    {
      id: '3',
      title: '技术栈对齐',
      description: 'JD提到Go语言，建议在技能部分突出Go相关项目经验',
      impact: 8,
      section: '技能证书',
      type: 'rewrite',
      priority: 'medium',
      jdClause: '熟练掌握Go语言开发',
      currentText: '熟悉多种编程语言',
      suggestedText: '精通Go语言开发，具备2年+微服务架构实战经验，熟悉Gin、GORM等主流框架',
      status: 'pending'
    },
    {
      id: '4',
      title: '删除冗余信息',
      description: '教育背景中的课程成绩对该岗位价值不大，建议精简',
      impact: 3,
      section: '教育背景',
      type: 'remove',
      priority: 'low',
      currentText: '主要课程：高等数学(95)、线性代数(92)、概率统计(88)',
      status: 'pending'
    }
  ];

  const filteredSuggestions = suggestions.filter(s => 
    filter === 'all' || s.priority === filter
  );

  const groupedSuggestions = filteredSuggestions.reduce((groups, suggestion) => {
    const key = groupBy === 'priority' ? suggestion.priority : 
                groupBy === 'section' ? suggestion.section :
                suggestion.impact >= 10 ? 'high-impact' : 'low-impact';
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(suggestion);
    return groups;
  }, {} as Record<string, Suggestion[]>);

  const handleApplySuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, status: 'applied' } : s
    ));
    // TODO: Apply to resume
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, status: 'dismissed' } : s
    ));
  };

  const handleGenerateVariants = (suggestionId: string) => {
    // TODO: Generate multiple versions
    console.log('Generate variants for:', suggestionId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border border-green-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rewrite': return <Edit3 className="h-4 w-4" />;
      case 'add': return <TrendingUp className="h-4 w-4" />;
      case 'remove': return <X className="h-4 w-4" />;
      case 'restructure': return <ArrowRight className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  // 如果没有简历或目标，显示提示
  if (!context.resume) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">请先上传简历</p>
          <p className="text-sm text-gray-400">上传简历后才能获取优化建议</p>
        </div>
      </div>
    );
  }

  if (!context.target) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">请先设置目标岗位</p>
          <p className="text-sm text-gray-400">设置目标岗位后系统将为您生成针对性优化建议</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-blue-100 p-4 bg-white/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">建议队列</h3>
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white font-bold shadow-sm">
              {suggestions.filter(s => s.status === 'pending').length}
            </span>
          </div>
          
          <button
            onClick={loadSuggestions}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 disabled:opacity-50 transition-all"
            title="刷新建议"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-sm ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50'
              }`}
            >
              {f === 'all' ? '全部' : f === 'high' ? '高优先级' : f === 'medium' ? '中优先级' : '低优先级'}
            </button>
          ))}
        </div>

        {/* Group By */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">分组：</span>
          {['priority', 'section', 'impact'].map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g as any)}
              className={`hover:text-blue-600 font-medium ${groupBy === g ? 'text-blue-600' : ''}`}
            >
              {g === 'priority' ? '优先级' : g === 'section' ? '部分' : '影响'}
            </button>
          ))}
        </div>
        
        {context.target && (
          <div className="text-xs text-gray-500 mt-2">
            基于 {context.target.company} JD
          </div>
        )}
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">正在生成优化建议...</p>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">暂无建议</p>
              <p className="text-xs text-gray-400 mt-1">点击刷新按钮重新生成</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedSuggestions).map(([group, groupSuggestions]) => (
            <div key={group}>
              <h4 className="font-semibold text-blue-900 mb-3 capitalize text-sm">
                {group.replace('-', ' ')}
              </h4>
              <div className="space-y-3">
                {groupSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`rounded-xl border p-4 transition-all shadow-sm ${
                      suggestion.status === 'applied'
                        ? 'border-green-300 bg-green-50'
                        : suggestion.status === 'dismissed'
                        ? 'border-gray-300 bg-gray-50 opacity-60'
                        : 'border-blue-200 bg-white hover:shadow-md hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">{getTypeIcon(suggestion.type)}</div>
                        <h5 className="font-semibold text-gray-900">{suggestion.title}</h5>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getPriorityColor(suggestion.priority)}`}>
                          +{suggestion.impact}分
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                      {suggestion.status === 'applied' && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {suggestion.status === 'dismissed' && (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{suggestion.description}</p>

                  {suggestion.jdClause && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-3">
                      <div className="text-xs text-blue-600 font-medium mb-1">📋 JD要求</div>
                      <div className="text-sm text-blue-800">{suggestion.jdClause}</div>
                    </div>
                  )}

                  {suggestion.currentText && (
                    <div className="space-y-2 mb-3">
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                        <div className="text-xs text-red-600 font-medium mb-1">❌ 当前</div>
                        <div className="text-sm text-red-700">{suggestion.currentText}</div>
                      </div>
                      {suggestion.suggestedText && (
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                          <div className="text-xs text-green-600 font-medium mb-1">✅ 建议</div>
                          <div className="text-sm text-green-700 font-medium">{suggestion.suggestedText}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplySuggestion(suggestion.id)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                      >
                        一键应用
                      </button>
                      <button
                        onClick={() => handleGenerateVariants(suggestion.id)}
                        className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        生成变体
                      </button>
                      <button
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                        className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-all"
                      >
                        忽略
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500 font-medium">{suggestion.section}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>刚刚</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}
