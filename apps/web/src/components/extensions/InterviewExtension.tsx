'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Play, 
  Clock, 
  Target, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Mic,
  Video,
  FileText,
  Star,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { ExtensionProps } from '@/types/extensions';
import { getInterviewQA } from '@/lib/fastapi-hooks';

interface InterviewQuestion {
  id: string;
  category: 'basic' | 'technical' | 'behavioral' | 'scenario';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  keyPoints: string[];
  commonMistakes: string[];
  sampleAnswer?: string;
  relatedJDRequirements: string[];
  status: 'not-answered' | 'drafted' | 'practiced' | 'mastered';
  userAnswer?: string;
  feedback?: string;
  practiceCount: number;
}

interface MockInterview {
  id: string;
  title: string;
  duration: number; // minutes
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  status: 'available' | 'in-progress' | 'completed';
  score?: number;
}

export function InterviewExtension({ context, onContextChange }: ExtensionProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'mock' | 'history'>('questions');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showQuestionDetail, setShowQuestionDetail] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock interview questions
  const mockQuestions: InterviewQuestion[] = [
    {
      id: '1',
      category: 'technical',
      question: '请介绍一下Go语言的并发模型，以及goroutine和channel的使用场景',
      difficulty: 'medium',
      keyPoints: [
        'CSP并发模型概念',
        'goroutine轻量级线程特性',
        'channel通信机制',
        '实际项目应用场景'
      ],
      commonMistakes: [
        '混淆goroutine和传统线程',
        '不了解channel的阻塞特性',
        '缺少实际项目经验描述'
      ],
      relatedJDRequirements: ['熟练掌握Go语言开发', '具备高并发系统设计经验'],
      status: 'not-answered',
      practiceCount: 0
    },
    {
      id: '2',
      category: 'behavioral',
      question: '描述一次你在项目中遇到技术难题，是如何解决的？',
      difficulty: 'medium',
      keyPoints: [
        '问题背景和影响',
        '分析和解决思路',
        '具体实施步骤',
        '结果和收获'
      ],
      commonMistakes: [
        '问题描述不够具体',
        '缺少量化的结果',
        '没有体现个人贡献'
      ],
      relatedJDRequirements: ['具备独立解决问题的能力', '有复杂项目经验'],
      status: 'drafted',
      practiceCount: 2,
      userAnswer: '在上个项目中，我们遇到了系统性能瓶颈...'
    },
    {
      id: '3',
      category: 'scenario',
      question: '如果让你设计一个高并发的秒杀系统，你会如何考虑？',
      difficulty: 'hard',
      keyPoints: [
        '流量削峰策略',
        '库存扣减方案',
        '缓存设计',
        '数据一致性保证'
      ],
      commonMistakes: [
        '只考虑技术不考虑业务',
        '忽略数据一致性',
        '缺少监控和降级方案'
      ],
      relatedJDRequirements: ['系统架构设计能力', '高并发场景经验'],
      status: 'practiced',
      practiceCount: 5
    }
  ];

  const mockInterviews: MockInterview[] = [
    {
      id: '1',
      title: '后端开发综合面试',
      duration: 45,
      questionCount: 12,
      difficulty: 'intermediate',
      focus: ['技术基础', '项目经验', '系统设计'],
      status: 'available'
    },
    {
      id: '2',
      title: 'Go语言专项面试',
      duration: 30,
      questionCount: 8,
      difficulty: 'advanced',
      focus: ['Go语言', '并发编程', '性能优化'],
      status: 'available'
    },
    {
      id: '3',
      title: '行为面试专场',
      duration: 25,
      questionCount: 6,
      difficulty: 'beginner',
      focus: ['团队协作', '问题解决', '职业规划'],
      status: 'completed',
      score: 85
    }
  ];

  const [interviews, setInterviews] = useState(mockInterviews);

  // 当简历改变时，加载面试问答
  useEffect(() => {
    if (context.resume?.id) {
      loadInterviewQuestions();
    }
  }, [context.resume?.id]);

  const loadInterviewQuestions = async () => {
    if (!context.resume?.id) return;

    setIsLoading(true);
    try {
      const qaData = await getInterviewQA(context.resume.id);
      
      // 转换后端返回的问答为前端格式
      const formattedQuestions: InterviewQuestion[] = (qaData.questions || qaData.qa_pairs || []).map((item: any, index: number) => ({
        id: `${index + 1}`,
        category: item.category || item.type || 'technical',
        question: item.question || item.q,
        difficulty: item.difficulty || item.level || 'medium',
        keyPoints: item.key_points || item.tips || [],
        commonMistakes: item.common_mistakes || item.pitfalls || [],
        sampleAnswer: item.sample_answer || item.answer || item.a,
        relatedJDRequirements: item.related_requirements || [],
        status: 'not-answered',
        practiceCount: 0
      }));
      
      setQuestions(formattedQuestions.length > 0 ? formattedQuestions : mockQuestions);
    } catch (error) {
      console.error('Failed to load interview questions:', error);
      // 使用Mock数据作为降级
      setQuestions(mockQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    selectedCategory === 'all' || q.category === selectedCategory
  );

  const handleStartMockInterview = (interviewId: string) => {
    // TODO: Start mock interview in right drawer
    console.log('Start mock interview:', interviewId);
  };

  const handleGenerateAnswer = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, status: 'drafted', userAnswer: '正在生成个性化回答草稿...' }
        : q
    ));
  };

  const handlePracticeQuestion = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, practiceCount: q.practiceCount + 1, status: 'practiced' }
        : q
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'text-green-400 bg-green-500/20';
      case 'technical': return 'text-blue-400 bg-blue-500/20';
      case 'behavioral': return 'text-purple-400 bg-purple-500/20';
      case 'scenario': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'practiced': return <Target className="h-4 w-4 text-blue-400" />;
      case 'drafted': return <FileText className="h-4 w-4 text-yellow-400" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-100">面试准备</h3>
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
              {questions.filter(q => q.status === 'not-answered').length} 待练习
            </span>
          </div>
          {context.target && (
            <div className="text-xs text-slate-400">
              针对 {context.target.company} 定制
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-white/5 p-1 mb-4">
          {[
            { key: 'questions', label: '问题库', icon: MessageSquare },
            { key: 'mock', label: '模拟面试', icon: Video },
            { key: 'history', label: '练习记录', icon: Clock }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                activeTab === key
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Category Filter for Questions */}
        {activeTab === 'questions' && (
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'basic', label: '基础' },
              { key: 'technical', label: '技术' },
              { key: 'behavioral', label: '行为' },
              { key: 'scenario', label: '场景' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                  selectedCategory === key
                    ? 'bg-sky-500/20 text-sky-200'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === 'questions' && (
          <div className="p-4 space-y-3">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`rounded px-2 py-0.5 text-xs ${getCategoryColor(question.category)}`}>
                        {question.category === 'basic' ? '基础' : 
                         question.category === 'technical' ? '技术' :
                         question.category === 'behavioral' ? '行为' : '场景'}
                      </span>
                      <span className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty === 'easy' ? '简单' : 
                         question.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      {getStatusIcon(question.status)}
                      {question.practiceCount > 0 && (
                        <span className="text-xs text-slate-400">
                          练习 {question.practiceCount} 次
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-slate-100 mb-2">{question.question}</h4>
                    
                    {question.relatedJDRequirements.length > 0 && (
                      <div className="rounded bg-blue-500/10 p-2 mb-3">
                        <div className="text-xs text-blue-300 mb-1">考察要点</div>
                        <ul className="text-xs text-blue-200 space-y-1">
                          {question.relatedJDRequirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <div className="h-1 w-1 rounded-full bg-blue-400" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {showQuestionDetail === question.id && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <h5 className="text-sm font-medium text-slate-200 mb-2">回答要点</h5>
                          <ul className="text-sm text-slate-300 space-y-1">
                            {question.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Lightbulb className="h-3 w-3 text-yellow-400" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-slate-200 mb-2">常见误区</h5>
                          <ul className="text-sm text-red-300 space-y-1">
                            {question.commonMistakes.map((mistake, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-red-400" />
                                {mistake}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {question.userAnswer && (
                          <div className="rounded bg-green-500/10 p-3">
                            <h5 className="text-sm font-medium text-green-300 mb-2">我的回答</h5>
                            <p className="text-sm text-green-200">{question.userAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuestionDetail(
                      showQuestionDetail === question.id ? null : question.id
                    )}
                    className="rounded bg-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/20"
                  >
                    {showQuestionDetail === question.id ? '收起' : '详情'}
                  </button>
                  
                  {question.status === 'not-answered' && (
                    <button
                      onClick={() => handleGenerateAnswer(question.id)}
                      className="rounded bg-sky-500 px-3 py-2 text-sm text-white hover:bg-sky-600"
                    >
                      生成草稿
                    </button>
                  )}
                  
                  <button
                    onClick={() => handlePracticeQuestion(question.id)}
                    className="flex items-center gap-2 rounded bg-green-500/20 px-3 py-2 text-sm text-green-300 hover:bg-green-500/30"
                  >
                    <Mic className="h-4 w-4" />
                    练习
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mock' && (
          <div className="p-4 space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-sky-500/20 to-purple-500/20 p-4 border border-sky-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Video className="h-6 w-6 text-sky-400" />
                <div>
                  <h3 className="font-medium text-slate-100">AI模拟面试</h3>
                  <p className="text-sm text-slate-300">真实面试环境，实时反馈</p>
                </div>
              </div>
              <button
                onClick={() => handleStartMockInterview('quick')}
                className="w-full rounded-lg bg-sky-500 px-4 py-3 text-white font-medium hover:bg-sky-600 transition-colors"
              >
                开始 20 分钟快速模拟
              </button>
            </div>

            <div className="space-y-3">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-100 mb-1">{interview.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{interview.duration} 分钟</span>
                        <span>{interview.questionCount} 题</span>
                        <span className={getDifficultyColor(interview.difficulty)}>
                          {interview.difficulty === 'beginner' ? '入门' : 
                           interview.difficulty === 'intermediate' ? '进阶' : '高级'}
                        </span>
                      </div>
                    </div>
                    {interview.status === 'completed' && interview.score && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-400">{interview.score}</div>
                        <div className="text-xs text-slate-400">分数</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {interview.focus.map((focus) => (
                      <span
                        key={focus}
                        className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStartMockInterview(interview.id)}
                    disabled={interview.status === 'in-progress'}
                    className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      interview.status === 'completed'
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : interview.status === 'in-progress'
                        ? 'bg-yellow-500/20 text-yellow-300 cursor-not-allowed'
                        : 'bg-sky-500 text-white hover:bg-sky-600'
                    }`}
                  >
                    {interview.status === 'completed' ? '重新面试' :
                     interview.status === 'in-progress' ? '进行中...' : '开始面试'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="font-medium text-slate-300 mb-2">练习记录</h3>
              <p className="text-sm text-slate-400">
                开始练习后，这里会显示你的面试记录和进步轨迹
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="border-t border-white/10 p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {questions.filter(q => q.status === 'mastered').length}
            </div>
            <div className="text-xs text-slate-400">已掌握</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {questions.filter(q => q.status === 'practiced').length}
            </div>
            <div className="text-xs text-slate-400">已练习</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {questions.reduce((sum, q) => sum + q.practiceCount, 0)}
            </div>
            <div className="text-xs text-slate-400">练习次数</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">
              {interviews.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-xs text-slate-400">模拟次数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
