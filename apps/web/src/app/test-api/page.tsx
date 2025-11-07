'use client';

import { useState } from 'react';
import { uploadResume, parseJD, runPipeline, useTask } from '@/lib/hooks';
import { Resume, JD, Task } from '@/lib/types';

export default function TestAPIPage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [jd, setJD] = useState<JD | null>(null);
  const [taskId, setTaskId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { task, isLoading: isTaskLoading } = useTask(taskId);

  const handleUploadResume = async () => {
    setIsLoading(true);
    try {
      const result = await uploadResume({ 
        text: `张三
邮箱：zhangsan@example.com
电话：138-0000-0000

工作经历：
2022.03 - 至今 | 腾讯科技 | 高级产品经理
- 负责政企数据产品规划，DAU 提升 25%
- 推动跨部门协作项目，项目交付周期缩短 30%

2020.06 - 2022.02 | 字节跳动 | 产品经理  
- 负责 ToB 产品线规划与执行，年度营收 +40%
- 优化用户体验流程，客户满意度提升至 95%

技能：
产品规划、数据分析、项目管理、用户体验设计、Python、SQL` 
      });
      setResume(result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseJD = async () => {
    setIsLoading(true);
    try {
      const result = await parseJD({ 
        text: `腾讯科技 - 高级产品经理

岗位职责：
1. 负责政企数据产品的中长期规划，定义核心指标与体验目标
2. 与数据、研发、运营团队合作，构建面向 ToB 客户的增长解决方案
3. 推动跨团队项目落地，协调资源并跟进项目执行与复盘

任职要求：
1. 5年以上互联网产品经验，熟悉大数据或政企行业
2. 具备良好的量化分析能力，能独立构建业务指标体系
3. 擅长跨部门沟通与项目管理，推动复杂项目上线落地` 
      });
      setJD(result);
    } catch (error) {
      console.error('Parse JD failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!resume || !jd) {
      alert('请先上传简历和解析JD');
      return;
    }

    setIsLoading(true);
    try {
      const result = await runPipeline(resume.id, jd.id);
      setTaskId(result.id);
    } catch (error) {
      console.error('Run pipeline failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0e13] via-[#0b0e13] to-[#0f1220] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">API 测试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 上传简历 */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">1. 上传简历</h2>
            <button
              onClick={handleUploadResume}
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 px-4 py-2 rounded-lg"
            >
              {isLoading ? '上传中...' : '上传测试简历'}
            </button>
            {resume && (
              <div className="mt-4 text-sm">
                <div className="text-green-400">✓ 简历已上传</div>
                <div>ID: {resume.id}</div>
                <div>技能: {resume.skills.join(', ')}</div>
              </div>
            )}
          </div>

          {/* 解析JD */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">2. 解析JD</h2>
            <button
              onClick={handleParseJD}
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded-lg"
            >
              {isLoading ? '解析中...' : '解析测试JD'}
            </button>
            {jd && (
              <div className="mt-4 text-sm">
                <div className="text-green-400">✓ JD已解析</div>
                <div>ID: {jd.id}</div>
                <div>公司: {jd.company}</div>
                <div>职位: {jd.title}</div>
                <div>技能: {jd.must_have_skills.join(', ')}</div>
              </div>
            )}
          </div>

          {/* 运行流水线 */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">3. 运行流水线</h2>
            <button
              onClick={handleRunPipeline}
              disabled={isLoading || !resume || !jd}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 px-4 py-2 rounded-lg"
            >
              {isLoading ? '启动中...' : '启动AI流水线'}
            </button>
            {taskId && (
              <div className="mt-4 text-sm">
                <div className="text-green-400">✓ 任务已创建</div>
                <div>任务ID: {taskId}</div>
              </div>
            )}
          </div>
        </div>

        {/* 任务状态 */}
        {task && (
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">任务状态</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span>状态:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  task.status === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {task.status}
                </span>
                {isTaskLoading && <span className="text-slate-400">轮询中...</span>}
              </div>
              
              {task.cost && (
                <div>成本: ¥{task.cost.toFixed(3)}</div>
              )}
              
              {task.latency_ms && (
                <div>耗时: {(task.latency_ms / 1000).toFixed(1)}s</div>
              )}
              
              {task.error && (
                <div className="text-red-400">错误: {task.error}</div>
              )}

              {task.output && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">优化后简历:</h3>
                    <div className="bg-black/20 p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {task.output.resume_md}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">面试问题 ({task.output.interview_questions.length}):</h3>
                    <ul className="space-y-2">
                      {task.output.interview_questions.map((q, i) => (
                        <li key={i} className="bg-black/20 p-3 rounded-lg text-sm">
                          {i + 1}. {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">知识点推荐 ({task.output.knowledge_items.length}):</h3>
                    <ul className="space-y-2">
                      {task.output.knowledge_items.map((item, i) => (
                        <li key={i} className="bg-black/20 p-3 rounded-lg text-sm">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-slate-400 mt-1">{item.why}</div>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 mt-1 inline-block"
                          >
                            查看资源 →
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}