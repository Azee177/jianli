'use client';

import { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap, 
  Check, 
  X, 
  Edit3,
  ArrowRight,
  Clock
} from 'lucide-react';
import { ExtensionProps } from '@/types/extensions';

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

  // Mock suggestions data
  const mockSuggestions: Suggestion[] = [
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

  const [suggestions, setSuggestions] = useState(mockSuggestions);

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
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-100">建议队列</h3>
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {suggestions.filter(s => s.status === 'pending').length}
            </span>
          </div>
          {context.target && (
            <div className="text-xs text-slate-400">
              基于 {context.target.company} JD
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                filter === f
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'high' ? '高优先级' : f === 'medium' ? '中优先级' : '低优先级'}
            </button>
          ))}
        </div>

        {/* Group By */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>分组：</span>
          {['priority', 'section', 'impact'].map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g as any)}
              className={`hover:text-slate-200 ${groupBy === g ? 'text-sky-400' : ''}`}
            >
              {g === 'priority' ? '优先级' : g === 'section' ? '部分' : '影响'}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
        {Object.entries(groupedSuggestions).map(([group, groupSuggestions]) => (
          <div key={group}>
            <h4 className="font-medium text-slate-300 mb-3 capitalize">
              {group.replace('-', ' ')}
            </h4>
            <div className="space-y-3">
              {groupSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`rounded-lg border p-4 transition-all ${
                    suggestion.status === 'applied'
                      ? 'border-green-500/30 bg-green-500/10'
                      : suggestion.status === 'dismissed'
                      ? 'border-slate-500/30 bg-slate-500/10 opacity-60'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suggestion.type)}
                      <h5 className="font-medium text-slate-100">{suggestion.title}</h5>
                      <span className={`rounded px-2 py-0.5 text-xs ${getPriorityColor(suggestion.priority)}`}>
                        +{suggestion.impact}分
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {suggestion.status === 'applied' && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                      {suggestion.status === 'dismissed' && (
                        <X className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">{suggestion.description}</p>

                  {suggestion.jdClause && (
                    <div className="rounded bg-blue-500/10 p-2 mb-3">
                      <div className="text-xs text-blue-300 mb-1">JD要求</div>
                      <div className="text-sm text-blue-200">{suggestion.jdClause}</div>
                    </div>
                  )}

                  {suggestion.currentText && (
                    <div className="space-y-2 mb-3">
                      <div className="rounded bg-red-500/10 p-2">
                        <div className="text-xs text-red-300 mb-1">当前</div>
                        <div className="text-sm text-red-200">{suggestion.currentText}</div>
                      </div>
                      {suggestion.suggestedText && (
                        <div className="rounded bg-green-500/10 p-2">
                          <div className="text-xs text-green-300 mb-1">建议</div>
                          <div className="text-sm text-green-200">{suggestion.suggestedText}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplySuggestion(suggestion.id)}
                        className="flex-1 rounded bg-sky-500 px-3 py-2 text-sm text-white hover:bg-sky-600"
                      >
                        一键应用
                      </button>
                      <button
                        onClick={() => handleGenerateVariants(suggestion.id)}
                        className="rounded bg-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/20"
                      >
                        生成变体
                      </button>
                      <button
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                        className="rounded bg-white/10 px-3 py-2 text-sm text-slate-400 hover:bg-white/20"
                      >
                        忽略
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-slate-400">{suggestion.section}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>2分钟前</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="font-medium text-slate-300 mb-2">暂无建议</h3>
            <p className="text-sm text-slate-400">
              {context.target ? '当前简历与JD匹配度很高！' : '请先选择目标岗位以获取个性化建议'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
