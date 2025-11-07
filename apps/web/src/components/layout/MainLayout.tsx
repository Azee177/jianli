'use client';

import { ReactNode, useState } from 'react';

import { ActivityBar, NavigationItem } from './ActivityBar';
import { FeaturePanel } from './FeaturePanel';
import {
  ResumeEditor,
  type ResumeEditorApi,
  type SelectionInfo,
} from './ResumeEditor';
import { SmartAssistant } from './SmartAssistant';

interface MainLayoutProps {
  // Layout state
  activePanel: string | null;
  leftPanelWidth: number;
  rightPanelWidth: number;
  onPanelChange: (panel: string | null) => void;
  onLeftPanelResize: (width: number) => void;
  onRightPanelResize: (width: number) => void;

  // Navigation
  navItems: NavigationItem[];

  // Resume editor
  resumeContent: string;
  onResumeChange: (content: string) => void;
  onSelectionChange?: (selection: SelectionInfo | null) => void;
  onEditorReady?: (api: ResumeEditorApi | null) => void;

  // Panel content
  leftPanelContent: ReactNode;
  rightPanelContent?: ReactNode;
}

export function MainLayout({
  activePanel,
  leftPanelWidth,
  rightPanelWidth,
  onPanelChange,
  onLeftPanelResize,
  onRightPanelResize,
  navItems,
  resumeContent,
  onResumeChange,
  onSelectionChange,
  onEditorReady,
  leftPanelContent,
  rightPanelContent
}: MainLayoutProps) {
  const [showRightPanel, setShowRightPanel] = useState(true);

  // 计算布局尺寸
  const activityBarWidth = 56;
  const leftPanelActualWidth = activePanel ? leftPanelWidth : 0;
  const rightPanelActualWidth = showRightPanel ? rightPanelWidth : 0;

  const leftOffset = activityBarWidth + leftPanelActualWidth;
  const rightOffset = rightPanelActualWidth;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Activity Bar - 固定左侧 */}
      <ActivityBar
        activePanel={activePanel}
        onPanelChange={onPanelChange}
        navItems={navItems}
      />

      {/* Left Panel - 可调整宽度 */}
      {activePanel && (
        <FeaturePanel
          activePanel={activePanel}
          width={leftPanelWidth}
          onResize={onLeftPanelResize}
          position="left"
          offset={activityBarWidth}
        >
          {leftPanelContent}
        </FeaturePanel>
      )}

      {/* Center - Resume Editor */}
      <div
        className="fixed top-[56px] bottom-0 transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          left: `${leftOffset}px`,
          right: `${rightOffset}px`
        }}
      >
        <ResumeEditor
          content={resumeContent}
          onChange={onResumeChange}
          onSelectionChange={onSelectionChange}
        />
      </div>

      {/* Right Panel - Smart Assistant */}
      {showRightPanel && (
        <div
          className="fixed top-[56px] right-0 bottom-0 transition-all duration-300 ease-in-out"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <SmartAssistant
            width={rightPanelWidth}
            onResize={onRightPanelResize}
            onToggle={() => setShowRightPanel(!showRightPanel)}
          >
            {rightPanelContent}
          </SmartAssistant>
        </div>
      )}

      {/* Right Panel Toggle Button - 当面板隐藏时显示 */}
      {!showRightPanel && (
        <button
          onClick={() => setShowRightPanel(true)}
          className="fixed top-[72px] right-4 z-20 p-2 rounded-lg bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 transition-all duration-200"
          title="显示智能助手"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
