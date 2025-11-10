'use client';

import { useState, useEffect } from 'react';
import { 
  X,
  Plus,
  Settings,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { SmartChatInterface } from '@/components/chat/SmartChatInterface';
import { Extension, ExtensionProps, AppContext } from '@/types/extensions';

interface ChatSession {
  id: string;
  title: string;
  type: string; // 'workflow', 'company', 'suggestions', etc.
  timestamp: Date;
}

interface MultiChatPanelProps {
  activeFunction: string; // 当前激活的功能（workflow, company, suggestions等）
  width: number;
  onResize: (width: number) => void;
  onClose: () => void;
  extensions: Extension[];
  extensionProps: ExtensionProps;
  appContext: AppContext;
  activityBarWidth: number; // 左侧图标栏宽度
  onNewSessionTrigger?: (trigger: () => void) => void; // 传递新建会话函数给父组件
}

export function MultiChatPanel({
  activeFunction,
  width,
  onResize,
  onClose,
  extensions,
  extensionProps,
  appContext,
  activityBarWidth,
  onNewSessionTrigger,
}: MultiChatPanelProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: '对话 1',
      type: activeFunction,
      timestamp: new Date(),
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = width;

    // 最大宽度固定为 650px
    const maxWidth = 650;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      // 最小宽度为0（可以拖到完全消失），最大宽度为 650px
      const nextWidth = Math.min(maxWidth, Math.max(0, startWidth + delta));
      onResize(nextWidth);
      
      // 如果拖到小于100px，自动关闭面板
      if (nextWidth < 100 && onClose) {
        onClose();
      }
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', cleanup);
    window.addEventListener('pointercancel', cleanup);
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `对话 ${chatSessions.length + 1}`,
      type: activeFunction,
      timestamp: new Date(),
    };
    setChatSessions([...chatSessions, newSession]);
    setActiveSessionId(newSession.id);
  };

  const handleCloseSession = (sessionId: string) => {
    const newSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(newSessions);
    
    // 如果关闭的是当前激活的会话，切换到第一个会话
    if (sessionId === activeSessionId && newSessions.length > 0) {
      setActiveSessionId(newSessions[0].id);
    }
  };

  // 将新建会话函数传递给父组件
  useEffect(() => {
    if (onNewSessionTrigger) {
      onNewSessionTrigger(handleNewSession);
    }
  }, [onNewSessionTrigger, chatSessions.length, activeFunction]);

  const activeExtension = extensions.find(ext => ext.id === activeFunction);
  const models = ['GPT-4', 'GPT-3.5', 'Claude-3', 'Gemini'];

  // 根据功能显示不同的面板标题
  const getPanelTitle = () => {
    switch (activeFunction) {
      case 'chat': return '对话';
      case 'workflow': return 'AI 工作流';
      case 'company': return '公司/岗位';
      case 'suggestions': return '建议';
      case 'learning': return '学习';
      case 'interview': return '面试';
      default: return '面板';
    }
  };

  return (
    <aside
      className="fixed top-0 z-20 h-screen border-r border-blue-100 bg-gradient-to-br from-white to-blue-50/30 flex flex-col shadow-xl"
      style={{ 
        width: `${width}px`,
        left: `${activityBarWidth}px`
      }}
    >
      {/* 调整手柄 */}
      <div
        className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-30 group"
        onPointerDown={handleResizeStart}
      >
        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-colors" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500/30 group-hover:bg-blue-500 rounded-full transition-all" />
      </div>

      {/* 顶部：面板标题和操作 */}
      <div className="flex-shrink-0 h-12 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
          {getPanelTitle()}
        </h2>
        {activeFunction === 'chat' && (
          <button
            onClick={handleNewSession}
            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all hover:shadow-sm"
            title="新建对话"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 对话会话选项卡（仅在 chat 模式下显示） */}
      {activeFunction === 'chat' && (
        <div className="flex-shrink-0 border-b border-blue-100 bg-blue-50/50">
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-hidden">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer
                  ${activeSessionId === session.id
                    ? 'bg-white text-blue-700 shadow-sm font-medium'
                    : 'bg-transparent text-blue-600 hover:bg-blue-100'
                  }
                `}
                onClick={() => setActiveSessionId(session.id)}
              >
                <MessageSquare className="h-3 w-3 flex-shrink-0" />
                <span className="max-w-[100px] truncate">{session.title}</span>
                {chatSessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-blue-200 rounded transition-opacity"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
        {activeFunction === 'chat' ? (
          <SmartChatInterface
            selectedText={appContext.selectedText}
            onOptimize={(text) => {
              console.log('Optimized text:', text);
            }}
            onFileUpload={async (file) => {
              try {
                // 调用真实的上传API
                const { uploadResume } = await import('@/lib/fastapi-hooks');
                const resume = await uploadResume({ file });
                
                // 更新应用上下文
                if (extensionProps.onContextChange) {
                  await extensionProps.onContextChange({ resume });
                }
                
                console.log('Resume uploaded successfully:', resume.id);
              } catch (error) {
                console.error('Failed to upload resume:', error);
                alert('简历上传失败，请重试');
              }
            }}
          />
        ) : activeExtension && activeExtension.surfaces.leftPanel ? (
          <div className="h-full overflow-auto custom-scrollbar p-6">
            <div className="space-y-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-blue-900 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-indigo-800 [&_h3]:mb-2 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_button]:bg-gradient-to-r [&_button]:from-blue-500 [&_button]:to-indigo-600 [&_button]:text-white [&_button]:font-medium [&_button]:px-6 [&_button]:py-2.5 [&_button]:rounded-lg [&_button]:shadow-md [&_button]:hover:shadow-lg [&_button]:hover:from-blue-600 [&_button]:hover:to-indigo-700 [&_button]:transition-all [&_button]:duration-200 [&_ul]:space-y-2 [&_li]:text-gray-700 [&_input]:border-blue-200 [&_input]:focus:border-blue-500 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-200 [&_input]:rounded-lg [&_input]:px-4 [&_input]:py-2 [&_label]:text-sm [&_label]:font-medium [&_label]:text-gray-700 [&_label]:mb-1">
              <activeExtension.surfaces.leftPanel {...extensionProps} />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">暂无内容</p>
              <p className="text-xs text-gray-400 mt-1">请选择其他功能查看</p>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏（仅在 chat 模式下显示） */}
      {activeFunction === 'chat' && (
        <div className="flex-shrink-0 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="p-3">
            {/* 模型选择 */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-xs text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all shadow-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  <span>模型: {selectedModel}</span>
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* 模型选择下拉菜单 */}
              {showModelMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-blue-200 rounded-lg shadow-xl overflow-hidden">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelMenu(false);
                      }}
                      className={`
                        w-full px-3 py-2 text-left text-xs transition-all
                        ${selectedModel === model
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold'
                          : 'text-blue-700 hover:bg-blue-50'
                        }
                      `}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

