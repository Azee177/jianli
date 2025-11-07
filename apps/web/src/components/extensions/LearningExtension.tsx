'use client';

import { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  Clock, 
  Star, 
  Bookmark, 
  ExternalLink,
  CheckCircle,
  BookOpen,
  Target,
  Filter,
  Search
} from 'lucide-react';
import { ExtensionProps } from '@/types/extensions';

interface LearningResource {
  id: string;
  title: string;
  platform: 'bilibili' | 'youtube' | 'article' | 'course';
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  views: string;
  author: string;
  tags: string[];
  relatedJDClauses: string[];
  estimatedBenefit: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'bookmarked';
  progress?: number;
  notes?: string;
}

export function LearningExtension({ context, onContextChange }: ExtensionProps) {
  const [filter, setFilter] = useState<'all' | 'recommended' | 'bookmarked' | 'completed'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Mock learning resources
  const mockResources: LearningResource[] = [
    {
      id: '1',
      title: 'Go语言高并发编程实战',
      platform: 'bilibili',
      url: 'https://www.bilibili.com/video/BV1234567890',
      duration: '2小时30分',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '15.2万',
      author: '技术UP主',
      tags: ['Go', '并发编程', '性能优化'],
      relatedJDClauses: ['熟练掌握Go语言开发', '具备高并发系统设计经验'],
      estimatedBenefit: 85,
      status: 'not-started'
    },
    {
      id: '2',
      title: '微服务架构设计与实践',
      platform: 'bilibili',
      url: 'https://www.bilibili.com/video/BV0987654321',
      duration: '3小时15分',
      difficulty: 'advanced',
      rating: 4.9,
      views: '8.7万',
      author: '架构师老王',
      tags: ['微服务', '分布式', '系统设计'],
      relatedJDClauses: ['熟悉微服务架构', '分布式系统开发经验'],
      estimatedBenefit: 92,
      status: 'in-progress',
      progress: 65
    },
    {
      id: '3',
      title: 'Redis性能调优完全指南',
      platform: 'bilibili',
      url: 'https://www.bilibili.com/video/BV1122334455',
      duration: '1小时45分',
      difficulty: 'intermediate',
      rating: 4.7,
      views: '12.3万',
      author: '数据库专家',
      tags: ['Redis', '性能调优', '缓存'],
      relatedJDClauses: ['熟悉Redis等缓存技术', '数据库性能优化经验'],
      estimatedBenefit: 78,
      status: 'bookmarked'
    },
    {
      id: '4',
      title: 'Docker容器化部署实战',
      platform: 'bilibili',
      url: 'https://www.bilibili.com/video/BV5566778899',
      duration: '2小时',
      difficulty: 'beginner',
      rating: 4.6,
      views: '20.1万',
      author: 'DevOps工程师',
      tags: ['Docker', '容器化', 'DevOps'],
      relatedJDClauses: ['熟悉Docker容器技术', '具备DevOps经验'],
      estimatedBenefit: 70,
      status: 'completed'
    }
  ];

  const [resources, setResources] = useState(mockResources);

  const filteredResources = resources.filter(resource => {
    const matchesFilter = filter === 'all' || 
      (filter === 'recommended' && resource.estimatedBenefit > 75) ||
      (filter === 'bookmarked' && resource.status === 'bookmarked') ||
      (filter === 'completed' && resource.status === 'completed');
    
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    
    return matchesFilter && matchesSearch && matchesDifficulty;
  });

  const handleUpdateStatus = (resourceId: string, status: LearningResource['status']) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, status } : r
    ));
  };

  const handleGenerateFlashcard = (resourceId: string) => {
    // TODO: Generate flashcard
    console.log('Generate flashcard for:', resourceId);
  };

  const handlePreview = (resource: LearningResource) => {
    // TODO: Open preview in right drawer
    console.log('Preview resource:', resource);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'bilibili': return '📺';
      case 'youtube': return '🎥';
      case 'article': return '📄';
      case 'course': return '🎓';
      default: return '📚';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-400" />;
      case 'bookmarked': return <Bookmark className="h-4 w-4 text-yellow-400" />;
      default: return <BookOpen className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-100">学习资源</h3>
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
              {resources.filter(r => r.status === 'not-started').length} 待学习
            </span>
          </div>
          {context.target && (
            <div className="text-xs text-slate-400">
              基于 {context.target.company} 需求推荐
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索学习资源..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          {[
            { key: 'recommended', label: '推荐' },
            { key: 'all', label: '全部' },
            { key: 'bookmarked', label: '收藏' },
            { key: 'completed', label: '已完成' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                filter === key
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-3 w-3 text-slate-400" />
          <span className="text-slate-400">难度：</span>
          {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`hover:text-slate-200 ${selectedDifficulty === diff ? 'text-sky-400' : 'text-slate-400'}`}
            >
              {diff === 'all' ? '全部' : diff === 'beginner' ? '入门' : diff === 'intermediate' ? '进阶' : '高级'}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-3">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getPlatformIcon(resource.platform)}</span>
                  <h4 className="font-medium text-slate-100">{resource.title}</h4>
                  {getStatusIcon(resource.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {resource.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    {resource.rating}
                  </div>
                  <span>{resource.views} 播放</span>
                  <span>@{resource.author}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty === 'beginner' ? '入门' : resource.difficulty === 'intermediate' ? '进阶' : '高级'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">收益 +{resource.estimatedBenefit}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {resource.relatedJDClauses.length > 0 && (
                  <div className="rounded bg-blue-500/10 p-2 mb-3">
                    <div className="text-xs text-blue-300 mb-1">关联JD要求</div>
                    <ul className="text-xs text-blue-200 space-y-1">
                      {resource.relatedJDClauses.map((clause, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-blue-400" />
                          {clause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {resource.status === 'in-progress' && resource.progress && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>学习进度</span>
                      <span>{resource.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${resource.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(resource)}
                className="flex-1 flex items-center justify-center gap-2 rounded bg-sky-500 px-3 py-2 text-sm text-white hover:bg-sky-600"
              >
                <Play className="h-4 w-4" />
                预览
              </button>
              
              {resource.status === 'not-started' && (
                <button
                  onClick={() => handleUpdateStatus(resource.id, 'bookmarked')}
                  className="rounded bg-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/20"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              )}
              
              {resource.status === 'completed' && (
                <button
                  onClick={() => handleGenerateFlashcard(resource.id)}
                  className="rounded bg-green-500/20 px-3 py-2 text-sm text-green-300 hover:bg-green-500/30"
                >
                  生成速记卡
                </button>
              )}
              
              <button
                onClick={() => window.open(resource.url, '_blank')}
                className="rounded bg-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="font-medium text-slate-300 mb-2">暂无学习资源</h3>
            <p className="text-sm text-slate-400">
              {context.target ? '正在为您推荐相关学习内容...' : '请先选择目标岗位以获取个性化学习推荐'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="border-t border-white/10 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {resources.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-xs text-slate-400">已完成</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {resources.filter(r => r.status === 'in-progress').length}
            </div>
            <div className="text-xs text-slate-400">学习中</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {resources.filter(r => r.status === 'bookmarked').length}
            </div>
            <div className="text-xs text-slate-400">已收藏</div>
          </div>
        </div>
      </div>
    </div>
  );
}
