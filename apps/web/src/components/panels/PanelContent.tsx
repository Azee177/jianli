'use client';

import { ReactNode } from 'react';

import { PanelKey } from '@/lib/constants';
import { JD, Resume, Task } from '@/lib/types';
import { CompanyPanel } from './CompanyPanel';
import { ExportPanel } from './ExportPanel';
import { IntentPanel, JobCard } from './IntentPanel';
import { JDPanel, Dimension } from './JDPanel';
import { InterviewPanel } from './InterviewPanel';
import { PrepPanel } from './PrepPanel';
import { UploadPanel } from './UploadPanel';

interface PanelContentProps {
  activePanel: PanelKey | null;
  children?: ReactNode;
  resume?: Resume | null;
  isUploading?: boolean;
  uploadError?: string | null;
  onUpload?: (input: { file?: File; text?: string }) => Promise<Resume>;
  jobCards?: JobCard[];
  target?: JobCard | null;
  onTargetSelect?: (job: JobCard) => void;
  jd?: JD | null;
  isParsingJD?: boolean;
  jdError?: string | null;
  onParseJD?: (input: { url?: string; text?: string }) => Promise<JD>;
  dimensions?: Dimension[];
  lockDims?: boolean;
  onToggleDim?: (id: string) => void;
  onUpdateDimLabel?: (id: string, label: string) => void;
  onToggleLock?: () => void;
  companyContent?: string;
  onCompanyContentChange?: (content: string) => void;
  onExportPDF?: () => void;
  onExportWord?: () => void;
  task?: Task | null;
  isProcessing?: boolean;
}

export function PanelContent({
  activePanel,
  children,
  resume = null,
  isUploading = false,
  uploadError = null,
  onUpload = async () => {
    if (resume) {
      return resume;
    }
    throw new Error('Upload handler not provided');
  },
  jobCards = [],
  target = null,
  onTargetSelect = () => {},
  jd = null,
  isParsingJD = false,
  jdError = null,
  onParseJD = async () => {
    if (jd) {
      return jd;
    }
    throw new Error('Parse JD handler not provided');
  },
  dimensions = [],
  lockDims = false,
  onToggleDim = () => {},
  onUpdateDimLabel = () => {},
  onToggleLock = () => {},
  companyContent = '',
  onCompanyContentChange = () => {},
  onExportPDF = () => {},
  onExportWord = () => {},
  task = null,
  isProcessing = false,
}: PanelContentProps) {
  if (!activePanel) {
    return null;
  }

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'upload':
        return (
          <UploadPanel
            resume={resume}
            isUploading={isUploading}
            uploadError={uploadError}
            onUpload={onUpload}
          />
        );
      case 'intent':
        return (
          <IntentPanel
            jobCards={jobCards}
            target={target}
            onTargetSelect={onTargetSelect}
          />
        );
      case 'jd':
        return (
          <JDPanel
            jd={jd}
            isParsingJD={isParsingJD}
            jdError={jdError}
            dimensions={dimensions}
            lockDims={lockDims}
            onParseJD={onParseJD}
            onToggleDim={onToggleDim}
            onUpdateDimLabel={onUpdateDimLabel}
            onToggleLock={onToggleLock}
          />
        );
      case 'company':
        return (
          <CompanyPanel
            companyContent={companyContent}
            onContentChange={onCompanyContentChange}
          />
        );
      case 'prep':
        return <PrepPanel />;
      case 'interview':
        return <InterviewPanel task={task} isProcessing={isProcessing} />;
      case 'export':
        return (
          <ExportPanel onExportPDF={onExportPDF} onExportWord={onExportWord} />
        );
      case 'draft':
        return (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
            <div className="text-sm font-medium text-slate-200">首稿生成</div>
            <div className="mt-2 text-xs text-slate-400">
              基于锁定的维度生成简历首稿，请先完成前面的步骤。
            </div>
          </div>
        );
      default:
        return (
          children ?? (
            <div className="p-4 text-center text-slate-400">
              <p>Panel content for {activePanel} will be implemented later.</p>
            </div>
          )
        );
    }
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <div className="space-y-3 p-3 text-sm">{renderPanelContent()}</div>
    </div>
  );
}
