'use client';

import { ReactNode, useCallback } from 'react';

interface FeaturePanelProps {
  activePanel: string | null;
  width: number;
  onResize: (width: number) => void;
  children: ReactNode;
  position?: 'left' | 'right';
  offset?: number;
  panelMinWidth?: number;
  panelMaxWidth?: number;
}

export function FeaturePanel({
  activePanel,
  width,
  onResize,
  children,
  position = 'left',
  offset = 0,
  panelMinWidth = 280,
  panelMaxWidth = 600
}: FeaturePanelProps) {
  const handlePanelResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startWidth = width;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = position === 'left' 
          ? moveEvent.clientX - startX 
          : startX - moveEvent.clientX;
        const nextWidth = Math.min(
          panelMaxWidth,
          Math.max(panelMinWidth, startWidth + delta),
        );
        onResize(nextWidth);
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp, { once: true });
      window.addEventListener('pointercancel', handlePointerUp, { once: true });
    },
    [panelMaxWidth, panelMinWidth, width, onResize, position],
  );

  const handleDoubleClick = () => {
    onResize(360); // Reset to default width
  };

  if (!activePanel) {
    return null;
  }

  const positionStyles = position === 'left' 
    ? { left: `${offset}px` }
    : { right: 0 };

  const borderClass = position === 'left' 
    ? 'border-r border-white/10' 
    : 'border-l border-white/10';

  const resizeHandleClass = position === 'left'
    ? 'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-sky-500/20 transition-all duration-200 hover:w-2'
    : 'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-sky-500/20 transition-all duration-200 hover:w-2';

  return (
    <section
      className={`fixed top-[56px] h-[calc(100vh-56px)] overflow-hidden z-10`}
      style={{ width: `${width}px`, ...positionStyles }}
      aria-hidden={false}
    >
      <div className={`relative flex h-full flex-col ${borderClass} bg-[rgba(10,12,20,0.95)] shadow-2xl backdrop-blur-xl`}>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </div>

        {/* Resize handle */}
        <div
          className={resizeHandleClass}
          onPointerDown={handlePanelResizeStart}
          onDoubleClick={handleDoubleClick}
        />
      </div>
    </section>
  );
}
