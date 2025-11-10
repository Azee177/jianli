'use client';

import { useCallback, useRef, useState } from 'react';

import { allExtensions } from '@/lib/extensions';
import { extractEditorHtmlFromResume, fetchRenderedResumeHtml } from '@/lib/resume-utils';
import { AppContext, ExtensionProps } from '@/types/extensions';

import { VerticalNavBar } from './VerticalNavBar';
import { MultiChatPanel } from './MultiChatPanel';
import {
  ResumeEditor,
  type ResumeEditorApi,
  type SelectionInfo,
} from './ResumeEditor';
import { ExportButton } from '../editor/ExportButton';

interface TwoColumnLayoutProps {
  resumeContent: string;
  onResumeChange: (content: string) => void;
  onSelectionChange: (selection: SelectionInfo | null) => void;
  onEditorReady: (api: ResumeEditorApi | null) => void;
  onResumeImported?: (content: string) => void;
}

export function TwoColumnLayout({
  resumeContent,
  onResumeChange,
  onSelectionChange,
  onEditorReady,
  onResumeImported,
}: TwoColumnLayoutProps) {
  const [activeFunction, setActiveFunction] = useState<string>('chat');
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [sideBarWidth, setSideBarWidth] = useState(650); // 默认宽度
  const newSessionTriggerRef = useRef<(() => void) | null>(null);

  const [appContext, setAppContext] = useState<AppContext>({});

  const handleContextChange = useCallback(
    async (updates: Partial<AppContext>) => {
      setAppContext(prev => ({ ...prev, ...updates }));

      if (updates.resume) {
        // 优先尝试从后端获取格式化的HTML
        let html: string;
        
        if (updates.resume.id) {
          try {
            console.log('Fetching rendered HTML from API for resume:', updates.resume.id);
            html = await fetchRenderedResumeHtml(updates.resume.id);
            console.log('Successfully fetched rendered HTML');
          } catch (error) {
            console.warn('Failed to fetch rendered HTML, falling back to raw text:', error);
            html = extractEditorHtmlFromResume(updates.resume);
          }
        } else {
          html = extractEditorHtmlFromResume(updates.resume);
        }
        
        onResumeChange(html);
        onResumeImported?.(html);
      }

      if (updates.target) {
        console.log('Target set, generating suggestions...');
      }
    },
    [onResumeChange, onResumeImported],
  );

  const extensionProps: ExtensionProps = {
    context: appContext,
    onContextChange: handleContextChange,
  };

  // VS Code 风格布局
  const activityBarWidth = 48; // 图标栏宽度
  const currentSideBarWidth = showChatPanel ? sideBarWidth : 0; // 侧边面板宽度

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 最左侧：Activity Bar（图标栏） */}
      <VerticalNavBar
        activeItem={activeFunction}
        onItemChange={(itemId) => {
          // 如果点击的是当前激活的项，则关闭侧边栏
          if (itemId === activeFunction && showChatPanel) {
            setShowChatPanel(false);
          } else {
            setActiveFunction(itemId);
            if (!showChatPanel) {
              setShowChatPanel(true);
              setSideBarWidth(650); // 重新打开时恢复默认宽度
            }
          }
        }}
      />

      {/* 中间：侧边面板（Side Bar） */}
      {showChatPanel && (
        <MultiChatPanel
          activeFunction={activeFunction}
          width={sideBarWidth}
          onResize={(width) => {
            setSideBarWidth(width);
          }}
          onClose={() => setShowChatPanel(false)}
          extensions={allExtensions}
          extensionProps={extensionProps}
          appContext={appContext}
          activityBarWidth={activityBarWidth}
          onNewSessionTrigger={(trigger) => {
            newSessionTriggerRef.current = trigger;
          }}
        />
      )}

      {/* 右侧：编辑器 */}
      <div
        className="flex-1 transition-all duration-150 overflow-hidden flex flex-col"
        style={{
          marginLeft: `${activityBarWidth + currentSideBarWidth}px`,
        }}
      >
        {/* 顶部工具栏 */}
        <div className="flex-shrink-0 h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-700">简历编辑器</h2>
            {appContext.resume && (
              <span className="text-xs text-gray-400">
                {appContext.resume.title || '未命名简历'}
              </span>
            )}
          </div>
          <ExportButton resumeId={appContext.resume?.id} />
        </div>

        {/* 编辑器区域 */}
        <div className="flex-1 overflow-hidden">
          <ResumeEditor
            content={resumeContent}
            onChange={onResumeChange}
            onSelectionChange={onSelectionChange}
            onEditorReady={onEditorReady}
          />
        </div>
      </div>
    </div>
  );
}

