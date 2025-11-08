'use client';

import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { SmartChatInterface } from '@/components/chat/SmartChatInterface';
import { allExtensions, getExtensionById } from '@/lib/extensions';
import { extractEditorHtmlFromResume, fetchRenderedResumeHtml } from '@/lib/resume-utils';
import { AppContext, ExtensionProps } from '@/types/extensions';

import { ExtensionDock } from './ExtensionDock';
import { ExtensionPanel } from './ExtensionPanel';
import {
  ResumeEditor,
  type ResumeEditorApi,
  type SelectionInfo,
} from './ResumeEditor';

interface ExtensionLayoutProps {
  resumeContent: string;
  onResumeChange: (content: string) => void;
  onSelectionChange: (selection: SelectionInfo | null) => void;
  onEditorReady: (api: ResumeEditorApi | null) => void;
  onResumeImported?: (content: string) => void;
}

export function ExtensionLayout({
  resumeContent,
  onResumeChange,
  onSelectionChange,
  onEditorReady,
  onResumeImported,
}: ExtensionLayoutProps) {
  const [activeExtension, setActiveExtension] =
    useState<string>('workflow');
  const [leftPanelWidth, setLeftPanelWidth] = useState(380);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const [appContext, setAppContext] = useState<AppContext>({});

  const handleExtensionSelect = (extensionId: string) => {
    setActiveExtension(current =>
      current === extensionId ? '' : extensionId,
    );
  };

  const handleNewResume = () => {
    console.log('Create new resume');
  };

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

  const activeExtensionObj = getExtensionById(activeExtension);

  const extensionProps: ExtensionProps = {
    context: appContext,
    onContextChange: handleContextChange,
  };

  const handleRightPanelResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!showRightPanel) return;

      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = rightPanelWidth;
      const handle = event.currentTarget;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = startX - moveEvent.clientX;
        const nextWidth = Math.min(
          560,
          Math.max(280, startWidth + delta),
        );
        setRightPanelWidth(nextWidth);
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', cleanup);
        window.removeEventListener('pointercancel', cleanup);
        try {
          handle.releasePointerCapture(event.pointerId);
        } catch {
          /* ignore capture release errors */
        }
      };

      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        /* ignore capture set errors */
      }

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', cleanup);
    },
    [rightPanelWidth, showRightPanel],
  );

  const rightToggleOffset = showRightPanel ? rightPanelWidth + 16 : 16;

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <ExtensionDock
        extensions={allExtensions}
        activeExtension={activeExtension}
        onExtensionSelect={handleExtensionSelect}
        onNewResume={handleNewResume}
      />

      {activeExtensionObj && (
        <ExtensionPanel
          extension={activeExtensionObj}
          width={leftPanelWidth}
          onResize={setLeftPanelWidth}
          extensionProps={extensionProps}
        />
      )}

      <div
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: activeExtensionObj ? `${leftPanelWidth}px` : '0px',
          marginRight: showRightPanel ? `${rightPanelWidth}px` : '0px',
        }}
      >
        <ResumeEditor
          content={resumeContent}
          onChange={onResumeChange}
          onSelectionChange={onSelectionChange}
          onEditorReady={onEditorReady}
        />
      </div>

      {showRightPanel && (
        <aside
          className="fixed top-[56px] right-0 z-10 h-[calc(100vh-56px)] border-l border-gray-200 bg-white backdrop-blur-xl transition-[width] shadow-lg"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <div
            className="absolute -left-2 top-0 bottom-0 w-3 cursor-col-resize rounded-l-full transition-all duration-200 hover:bg-blue-200"
            onPointerDown={handleRightPanelResizeStart}
          />
          <SmartChatInterface
            selectedText={appContext.selectedText}
            onOptimize={optimizedText => {
              console.log('Optimized text:', optimizedText);
            }}
          />
        </aside>
      )}

      <button
        onClick={() => setShowRightPanel(value => !value)}
        className="fixed z-20 flex h-10 w-8 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-gray-200 bg-white text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50 shadow-md"
        style={{ top: '50%', right: `${rightToggleOffset}px` }}
        title={showRightPanel ? '隐藏对话' : '显示对话'}
      >
        {showRightPanel ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
