'use client';

import { Extension, ExtensionProps } from '@/types/extensions';

interface ExtensionPanelProps {
  extension: Extension | null;
  width: number;
  onResize: (width: number) => void;
  extensionProps: ExtensionProps;
}

export function ExtensionPanel({
  extension,
  width,
  onResize,
  extensionProps
}: ExtensionPanelProps) {
  const handlePanelResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = width;
    const handle = event.currentTarget;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.min(600, Math.max(320, startWidth + delta));
      onResize(nextWidth);
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore if capture was not set
      }
    };

    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // setPointerCapture may throw if the pointer is already captured
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', cleanup);
    window.addEventListener('pointercancel', cleanup);
  };

  if (!extension || !extension.surfaces.leftPanel) {
    return null;
  }

  const PanelComponent = extension.surfaces.leftPanel;

  return (
    <section
      className="fixed top-[56px] left-16 h-[calc(100vh-56px)] overflow-hidden z-10"
      style={{ width: `${width}px` }}
    >
      <div className="relative flex h-full flex-col border-r border-gray-200 bg-white shadow-lg backdrop-blur-xl">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              {extension.icon}
            </div>
            <h2 className="font-medium text-gray-900">{extension.name}</h2>
            {extension.badge && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {typeof extension.badge === 'number' && extension.badge > 99 ? '99+' : extension.badge}
              </div>
            )}
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <PanelComponent {...extensionProps} />
        </div>

        {/* Resize Handle */}
        <div
          className="absolute -right-2 top-0 bottom-0 w-3 cursor-col-resize rounded-l-full transition-all duration-200 hover:bg-blue-200"
          onPointerDown={handlePanelResizeStart}
        />
      </div>
    </section>
  );
}
