'use client';

import { useState } from 'react';
import { ExtensionProps } from '@/types/extensions';
import { useWorkflow } from '@/hooks/useWorkflow';
import { UploadPanel } from '@/components/panels/UploadPanel';
import { JDPanel } from '@/components/panels/JDPanel';
import { PipelinePanel } from '@/components/panels/PipelinePanel';
import { InterviewPanel } from '@/components/panels/InterviewPanel';
import { KnowledgePanel } from '@/components/panels/KnowledgePanel';

export interface Dimension {
  id: string;
  label: string;
  checked: boolean;
}

const defaultDimensions: Dimension[] = [
  { id: '1', label: '以指标驱动的产品规划与验收', checked: true },
  { id: '2', label: '跨部门协同与项目推进能力', checked: true },
  { id: '3', label: 'ToB 客户洞察与业务理解', checked: false },
  { id: '4', label: '风险防控与上线后复盘机制', checked: false },
  { id: '5', label: '数据分析与用户增长策略', checked: false },
];

export function WorkflowExtension({ context, onContextChange }: ExtensionProps) {
  const workflow = useWorkflow();
  const [dimensions, setDimensions] = useState<Dimension[]>(defaultDimensions);
  const [lockDims, setLockDims] = useState(false);

  const handleToggleDim = (id: string) => {
    if (lockDims) return;
    setDimensions(prev => 
      prev.map(dim => 
        dim.id === id ? { ...dim, checked: !dim.checked } : dim
      )
    );
  };

  const handleUpdateDimLabel = (id: string, label: string) => {
    if (lockDims) return;
    setDimensions(prev => 
      prev.map(dim => 
        dim.id === id ? { ...dim, label } : dim
      )
    );
  };

  const handleToggleLock = () => {
    setLockDims(prev => !prev);
  };

  const handleUploadResume = async (input: { file?: File; text?: string }) => {
    const resume = await workflow.uploadResume(input);
    onContextChange({ resume });
    return resume;
  };

  const handleParseJD = async (input: { url?: string; text?: string }) => {
    const jd = await workflow.parseJD(input);
    onContextChange({ jd });
    return jd;
  };

  const handleRunPipeline = async () => {
    const task = await workflow.runPipeline();
    onContextChange({ task });
  };

  return (
    <div className="flex h-full flex-col space-y-4 p-4">
      {/* 上传面板 */}
      <UploadPanel
        resume={workflow.resume}
        isUploading={workflow.isUploading}
        uploadError={workflow.uploadError}
        onUpload={handleUploadResume}
      />

      {/* JD解析面板 */}
      <JDPanel
        jd={workflow.jd}
        isParsingJD={workflow.isParsingJD}
        jdError={workflow.jdError}
        dimensions={dimensions}
        lockDims={lockDims}
        onParseJD={handleParseJD}
        onToggleDim={handleToggleDim}
        onUpdateDimLabel={handleUpdateDimLabel}
        onToggleLock={handleToggleLock}
      />

      {/* 流水线控制面板 */}
      <PipelinePanel
        canRunPipeline={workflow.canRunPipeline}
        isProcessing={workflow.isProcessing}
        task={workflow.task}
        onRunPipeline={handleRunPipeline}
        onReset={workflow.resetWorkflow}
      />

      {/* 面试问题面板 */}
      <InterviewPanel
        task={workflow.task}
        isProcessing={workflow.isProcessing}
      />

      {/* 知识点推荐面板 */}
      <KnowledgePanel
        task={workflow.task}
        isProcessing={workflow.isProcessing}
      />
    </div>
  );
}