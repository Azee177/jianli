'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import {
  Image as ImageIcon,
  Plus,
} from 'lucide-react';

type HoverState = {
  top: number;
  left: number;
  height: number;
  width: number;
  pos: number;
};

interface EmptyLineToolbarProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DEFAULT_DIVIDER_COLOR = '#d1d5db'; // 默认灰色

// 三条横线的分割线图标组件
function DividerIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="3" y="9" width="14" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="3" y="13" width="14" height="1.5" rx="0.75" fill="currentColor"/>
    </svg>
  );
}

const scrubText = (value?: string | null) =>
  (value ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

const isParagraphEmpty = (element: HTMLElement | null) => {
  if (!element) {
    return false;
  }
  if (element.querySelector('img, figure, hr, table, ul, ol')) {
    return false;
  }
  if (element.childElementCount === 0) {
    return scrubText(element.textContent).length === 0;
  }
  if (element.childElementCount === 1 && element.firstElementChild?.tagName === 'BR') {
    return true;
  }
  return scrubText(element.textContent).length === 0;
};

export function EmptyLineToolbar({
  editor,
  containerRef,
}: EmptyLineToolbarProps) {
  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hoveredParagraphRef = useRef<HTMLElement | null>(null);
  const pendingImageAnchorRef = useRef<HoverState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const cancelPendingHide = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const resetHoverState = useCallback(() => {
    hoveredParagraphRef.current = null;
    setHoverState(null);
    setMenuVisible(false);
    setShowHighlight(false);
  }, []);

  const clearHover = useCallback(() => {
    cancelPendingHide();
    resetHoverState();
  }, [cancelPendingHide, resetHoverState]);

  const scheduleClearHover = useCallback(() => {
    cancelPendingHide();
    hideTimeoutRef.current = window.setTimeout(() => {
      hideTimeoutRef.current = null;
      resetHoverState();
    }, 220);
  }, [cancelPendingHide, resetHoverState]);

  const updateHoverFromParagraph = useCallback(
    (paragraph: HTMLElement) => {
      const container = containerRef.current;
      if (!container) return;

      const paragraphRect = paragraph.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const docRect = editor.view.dom.getBoundingClientRect();

      let pos = 0;
      try {
        pos = editor.view.posAtDOM(paragraph, 0);
      } catch {
        return;
      }

      cancelPendingHide();
      
      // 使用段落的实际位置，让工具栏跟随段落移动
      const paragraphLeft = paragraphRect.left - containerRect.left;
      const paragraphTop = paragraphRect.top - containerRect.top;
      
      // 确保位置值是合理的
      if (paragraphTop < 0 || paragraphLeft < -100) {
        return; // 如果位置不合理，不显示工具栏
      }

      setHoverState({
        pos,
        top: paragraphTop,
        left: paragraphLeft,
        height: paragraphRect.height || 24,
        width: paragraphRect.width,
      });
    },
    [containerRef, editor, cancelPendingHide],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor) {
      return;
    }

    const shouldRetainHover = (event: MouseEvent) => {
      if (!hoverState) {
        return false;
      }
      
      // 检查鼠标是否在工具栏区域内（缩小容差范围）
      if (overlayRef.current) {
        const toolbarRect = overlayRef.current.getBoundingClientRect();
        const inToolbar = 
          event.clientX >= toolbarRect.left - 60 &&
          event.clientX <= toolbarRect.right + 10 &&
          event.clientY >= toolbarRect.top - 5 &&
          event.clientY <= toolbarRect.bottom + 5;
        if (inToolbar) {
          return true;
        }
      }
      
      return false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      
      // 检查鼠标是否在工具栏内
      if (
        overlayRef.current &&
        target &&
        overlayRef.current.contains(target)
      ) {
        cancelPendingHide();
        return;
      }

      // 检查鼠标是否在空白段落上
      const paragraph = target?.closest('p');
      if (paragraph && isParagraphEmpty(paragraph)) {
        if (hoveredParagraphRef.current !== paragraph) {
          // 切换到新段落，重置菜单和高亮状态
          hoveredParagraphRef.current = paragraph;
          setMenuVisible(false);
          setShowHighlight(false);
        } else {
          // 在同一段落上移动，但不在工具栏上，隐藏菜单和高亮
          if (!shouldRetainHover(event)) {
            setMenuVisible(false);
            setShowHighlight(false);
          }
        }
        updateHoverFromParagraph(paragraph);
        return;
      }

      // 鼠标不在空白段落上，检查是否在工具栏附近
      if (shouldRetainHover(event)) {
        cancelPendingHide();
        return;
      }

      // 鼠标既不在段落上也不在工具栏附近，立即清除
      scheduleClearHover();
    };

    const handleMouseLeave = (event: MouseEvent) => {
      const relatedTarget = event.relatedTarget as Node | null;
      
      // 如果鼠标移到工具栏上，不清除
      if (overlayRef.current && relatedTarget && overlayRef.current.contains(relatedTarget)) {
        cancelPendingHide();
        return;
      }

      // 鼠标离开容器，立即清除工具栏
      clearHover();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [editor, containerRef, menuVisible, updateHoverFromParagraph, hoverState, scheduleClearHover, cancelPendingHide]);

  useEffect(() => {
    if (!hoverState || !hoveredParagraphRef.current) {
      return;
    }

    const paragraph = hoveredParagraphRef.current;
    const handleReposition = () => updateHoverFromParagraph(paragraph);

    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    const resizeObserver = new ResizeObserver(handleReposition);
    resizeObserver.observe(paragraph);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
      resizeObserver.disconnect();
    };
  }, [hoverState, updateHoverFromParagraph]);

  // 监听编辑器内容变化，当空白段落被填充内容时立即隐藏工具栏
  useEffect(() => {
    if (!editor || !hoverState || !hoveredParagraphRef.current) {
      return;
    }

    const handleUpdate = () => {
      const paragraph = hoveredParagraphRef.current;
      if (paragraph && !isParagraphEmpty(paragraph)) {
        // 段落不再为空，立即清除工具栏
        clearHover();
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, hoverState, clearHover]);



  const getReplacementRange = useCallback(
    (target?: HoverState | null) => {
      const anchor = target ?? hoverState;
      if (!anchor) {
        return null;
      }
      const node = editor.state.doc.nodeAt(anchor.pos);
      if (node?.type.name === 'paragraph') {
        return { from: anchor.pos, to: anchor.pos + node.nodeSize };
      }
      return { from: anchor.pos, to: anchor.pos };
    },
    [editor, hoverState],
  );

  const replaceEmptyParagraph = useCallback(
    (content: JSONContent | JSONContent[], target?: HoverState | null) => {
      const range = getReplacementRange(target);
      if (!range) return;

      const nodes = Array.isArray(content) ? content : [content];
      editor.chain().focus().insertContentAt(range, nodes).run();
      
      // 延迟清除hover状态，确保内容已经插入
      setTimeout(() => {
      clearHover();
      }, 50);
    },
    [editor, getReplacementRange, clearHover],
  );

  const handleDividerInsert = useCallback(() => {
    replaceEmptyParagraph([
      {
        type: 'coloredDivider',
        attrs: { color: DEFAULT_DIVIDER_COLOR, width: 100 },
      },
      { type: 'paragraph' },
    ]);
  }, [replaceEmptyParagraph]);

  const insertImageFromSource = useCallback(
    (src: string, target?: HoverState | null) => {
      const anchor = target ?? hoverState;
      if (!anchor || !src) {
        return;
      }

      // 设置一个合理的默认宽度（200px），类似Word中的内联图片
      const defaultWidth = 200;
      
      // 在当前位置插入图片（浮动方式）
      editor.chain().focus().insertContent({
            type: 'image',
            attrs: {
              src,
              alt: '',
          width: defaultWidth,
              height: null,
              cropX: 0,
              cropY: 0,
              zoom: 1,
          posX: anchor.left + 50,  // 默认位置在段落附近
          posY: anchor.top,
        },
      }).run();
      
      clearHover();
      pendingImageAnchorRef.current = null;
    },
    [editor, hoverState, clearHover],
  );

  const handleImageUploadClick = useCallback(() => {
    if (!hoverState) {
      return;
    }
    pendingImageAnchorRef.current = hoverState;
    fileInputRef.current?.click();
  }, [hoverState]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const reader = new FileReader();
      const anchor = pendingImageAnchorRef.current;
      reader.onload = () => {
        insertImageFromSource((reader.result as string) || '', anchor);
      };
      reader.readAsDataURL(file);
    },
    [insertImageFromSource],
  );




  if (!hoverState) {
    return null;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div
        ref={overlayRef}
        className="empty-line-toolbar"
        style={{
          top: hoverState.top,
          left: hoverState.left,
          width: hoverState.width,
          height: Math.max(hoverState.height, 28),
        }}
      >
        {showHighlight && (
        <div
          className="empty-line-highlight-bar"
          style={{ height: Math.max(hoverState.height, 28) }}
        />
        )}
        <div
          className="empty-line-actions"
          style={{ left: -48 }}
          onMouseEnter={() => {
            cancelPendingHide();
            setMenuVisible(true);
            setShowHighlight(true);
          }}
          onMouseLeave={() => {
            // 延迟一点再隐藏，给鼠标移到菜单上的时间
            hideTimeoutRef.current = window.setTimeout(() => {
              setMenuVisible(false);
              setShowHighlight(false);
            }, 100);
          }}
        >
          <button
            type="button"
            className={`empty-line-plus ${menuVisible ? 'active' : ''}`}
            title="插入内容"
          >
            <Plus className="h-4 w-4" />
          </button>
          {menuVisible && (
            <div 
              ref={menuRef} 
              className="empty-line-menu-simple"
              onMouseEnter={() => {
                cancelPendingHide();
                setMenuVisible(true);
                setShowHighlight(true);
              }}
              onMouseLeave={() => {
                setMenuVisible(false);
                setShowHighlight(false);
                scheduleClearHover();
              }}
            >
                    <button
                      type="button"
                className="empty-line-icon-button"
                title="插入图片"
                onClick={handleImageUploadClick}
              >
                <ImageIcon className="h-5 w-5" />
              </button>
                <button
                  type="button"
                className="empty-line-icon-button"
                title="插入分隔线"
                  onClick={handleDividerInsert}
                >
                <DividerIcon className="h-5 w-5" />
                  </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

