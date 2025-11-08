'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { ExtensionLayout } from '@/components/layout/ExtensionLayout';
import {
  type ResumeEditorApi,
  type SelectionInfo,
} from '@/components/layout/ResumeEditor';
import { SelectionToolbar } from '@/components/editor/SelectionToolbar';
import { AIExplanationDialog } from '@/components/editor/AIExplanationDialog';
import {
  defaultProgressSteps,
  type ProgressStep,
} from '@/components/layout/ProgressIndicator';
import { DEFAULT_RESUME_CONTENT } from '@/lib/constants';
import { deriveResumeContent } from '@/lib/resume-utils';
import { AuthProvider } from '@/lib/auth/auth-context';
import { StorageProvider } from '@/lib/storage/storage-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/auth/auth-context';
import { useProjects } from '@/hooks/useProjects';
import { useSettings } from '@/hooks/useSettings';

function EditorApp() {
  const { user, isLoading: authLoading } = useAuth();
  const { currentProject, isLoading: projectsLoading } = useProjects();
  const { settings, isLoading: settingsLoading } = useSettings();
  
  const [isMounted, setIsMounted] = useState(false);
  const [resumeContent, setResumeContent] = useState(DEFAULT_RESUME_CONTENT);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const editorApiRef = useRef<ResumeEditorApi | null>(null);

  // Progress tracking
  const [uploaded, setUploaded] = useState(false);
  const [target, setTarget] = useState<any>(null);
  const [lockDims, setLockDims] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update resume content when current project changes
  useEffect(() => {
    if (currentProject?.resumeData) {
      setResumeContent(deriveResumeContent(currentProject.resumeData));
      return;
    }

    if (!projectsLoading) {
      setResumeContent(DEFAULT_RESUME_CONTENT);
    }
  }, [currentProject, projectsLoading]);

  // Show auth modal if user is not authenticated
  useEffect(() => {
    if (isMounted && !authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [isMounted, authLoading, user]);

  const handleResumeChange = (content: string) => {
    setResumeContent(content);
  };

  const handleSelectionChange = (next: SelectionInfo | null) => {
    setSelection(next);
  };

  const handleEditorReady = useCallback((api: ResumeEditorApi | null) => {
    editorApiRef.current = api;
  }, []);

  // Progress steps for header
  const progressSteps = useMemo<ProgressStep[]>(() => {
    return defaultProgressSteps.map(step => {
      if (step.id === 'upload') {
        return { ...step, status: uploaded ? 'completed' : 'current' };
      }
      if (step.id === 'analysis') {
        return {
          ...step,
          status: uploaded && target ? 'completed' : uploaded ? 'current' : 'pending',
        };
      }
      if (step.id === 'matching') {
        return {
          ...step,
          status: lockDims ? 'completed' : target ? 'current' : 'pending',
        };
      }
      if (step.id === 'optimization') {
        return {
          ...step,
          status: lockDims ? 'current' : 'pending',
        };
      }
      return { ...step, status: step.status ?? 'pending' };
    });
  }, [uploaded, target, lockDims]);

  const handleProgressSelect = useCallback((stepId: string) => {
    // TODO: Handle progress step selection
    console.log('Progress step selected:', stepId);
  }, []);

  // Selection toolbar handlers
  const handleAIExplain = useCallback(() => {
    setShowAIDialog(true);
  }, []);

  const handleBold = useCallback(() => {
    editorApiRef.current?.toggleBold();
  }, []);

  const handleItalic = useCallback(() => {
    editorApiRef.current?.toggleItalic();
  }, []);

  const handleUnderline = useCallback(() => {
    editorApiRef.current?.toggleUnderline();
  }, []);

  const handleStrikethrough = useCallback(() => {
    editorApiRef.current?.toggleStrikethrough();
  }, []);

  const handleTextColor = useCallback((color: string) => {
    editorApiRef.current?.setTextColor(color);
  }, []);

  const handleBackgroundColor = useCallback((color: string) => {
    editorApiRef.current?.setBackgroundColor(color);
  }, []);

  const handleFontSize = useCallback((fontSize: string | null) => {
    editorApiRef.current?.setFontSize(fontSize ?? null);
  }, []);

  const handleLineHeight = useCallback((lineHeight: string | null) => {
    if (lineHeight) {
      editorApiRef.current?.setParagraphSpacing({ lineHeight });
    } else {
      editorApiRef.current?.setParagraphSpacing(null);
    }
  }, []);

  const handleOrderedList = useCallback(() => {
    editorApiRef.current?.toggleOrderedList();
  }, []);

  const handleBulletList = useCallback(() => {
    editorApiRef.current?.toggleBulletList();
  }, []);

  const handleAlign = useCallback((alignment: 'left' | 'center' | 'right') => {
    editorApiRef.current?.setTextAlign(alignment);
  }, []);

  if (!isMounted || authLoading || projectsLoading || settingsLoading) {
    return (
      <div className="min-h-screen w-full bg-white text-gray-900 antialiased flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-white text-gray-900 antialiased flex items-center justify-center">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-white text-gray-900 antialiased">
        <Header
          onMenuToggle={() => {}} // Not used in extension layout
          isMenuOpen={false}
          progressSteps={progressSteps}
          onProgressSelect={handleProgressSelect}
        />

        <ErrorBoundary>
          <ExtensionLayout
            resumeContent={resumeContent}
            onResumeChange={handleResumeChange}
            onSelectionChange={handleSelectionChange}
            onEditorReady={handleEditorReady}
            onResumeImported={() => setUploaded(true)}
          />
        </ErrorBoundary>

        <SelectionToolbar
          selection={selection}
          onClose={() => setSelection(null)}
          onAIExplain={handleAIExplain}
          onBold={handleBold}
          onItalic={handleItalic}
          onUnderline={handleUnderline}
          onStrikethrough={handleStrikethrough}
          onTextColor={handleTextColor}
          onBackgroundColor={handleBackgroundColor}
          onFontSize={handleFontSize}
          onLineHeight={handleLineHeight}
          onToggleOrderedList={handleOrderedList}
          onToggleBulletList={handleBulletList}
          onAlign={handleAlign}
        />

        <AIExplanationDialog
          isOpen={showAIDialog}
          onClose={() => setShowAIDialog(false)}
          selectedText={selection?.text || ''}
        />

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default function EditorPage() {
  return (
    <AuthProvider>
      <StorageProvider>
        <EditorApp />
      </StorageProvider>
    </AuthProvider>
  );
}

