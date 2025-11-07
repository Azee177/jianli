import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const resizeHandles: Array<{ key: string; direction: 'left' | 'right' }> = [
  { key: 'left', direction: 'left' },
  { key: 'right', direction: 'right' },
  { key: 'top-left', direction: 'left' },
  { key: 'top-right', direction: 'right' },
  { key: 'bottom-left', direction: 'left' },
  { key: 'bottom-right', direction: 'right' },
];

const ResizableImageView = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const width = node.attrs.width ?? 420;
  const height =
    node.attrs.height ??
    Math.max(
      200,
      Math.round((naturalSize.height / naturalSize.width) * width) || 280,
    );
  const cropX = node.attrs.cropX ?? 0;
  const cropY = node.attrs.cropY ?? 0;
  const zoom = node.attrs.zoom ?? 1;
  const posX = node.attrs.posX ?? 0;
  const posY = node.attrs.posY ?? 0;

  const aspectRatio = useMemo(() => {
    if (node.attrs.width && node.attrs.height) {
      return node.attrs.height / node.attrs.width;
    }
    return naturalSize.height / naturalSize.width || 0.75;
  }, [node.attrs.height, node.attrs.width, naturalSize.height, naturalSize.width]);

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const { naturalWidth, naturalHeight } = imageRef.current;
    setNaturalSize({
      width: naturalWidth || naturalSize.width,
      height: naturalHeight || naturalSize.height,
    });
    if (!node.attrs.height) {
      const nextHeight = Math.round((node.attrs.width || width) * aspectRatio);
      updateAttributes({ height: nextHeight });
    }
  };

  const handleResizeStart = useCallback(
    (direction: 'left' | 'right') =>
      (event: React.PointerEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const baseWidth = width;

        const onMove = (moveEvent: PointerEvent) => {
          const delta =
            direction === 'left'
              ? startX - moveEvent.clientX
              : moveEvent.clientX - startX;
          const nextWidth = clamp(baseWidth + delta, 180, 640);
          const nextHeight = Math.max(160, Math.round(nextWidth * aspectRatio));
          updateAttributes({
            width: Math.round(nextWidth),
            height: nextHeight,
          });
        };

        const stop = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', stop);
          window.removeEventListener('pointercancel', stop);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', stop);
        window.addEventListener('pointercancel', stop);
      },
    [aspectRatio, width, updateAttributes],
  );

  const handlePanStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = cropX;
    const initialY = cropY;
    const limitX = Math.max(0, (width * zoom - width) / 2);
    const limitY = Math.max(0, (height * zoom - height) / 2);

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const nextX = clamp(initialX + deltaX, -limitX, limitX);
      const nextY = clamp(initialY + deltaY, -limitY, limitY);
      updateAttributes({ cropX: nextX, cropY: nextY });
    };

    const stop = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  const adjustZoom = (delta: number) => {
    const nextZoom = clamp((zoom || 1) + delta, 1, 3);
    const limitX = Math.max(0, (width * nextZoom - width) / 2);
    const limitY = Math.max(0, (height * nextZoom - height) / 2);
    updateAttributes({
      zoom: Number(nextZoom.toFixed(2)),
      cropX: clamp(cropX, -limitX, limitX),
      cropY: clamp(cropY, -limitY, limitY),
    });
  };

  const resetCrop = () => {
    updateAttributes({ cropX: 0, cropY: 0, zoom: 1 });
  };

  // 拖动图片位置
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: posX,
      posY: posY,
    };
  }, [posX, posY]);

  const handleDragMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    updateAttributes({
      posX: dragStartRef.current.posX + deltaX,
      posY: dragStartRef.current.posY + deltaY,
    });
  }, [isDragging, updateAttributes]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // 监听全局拖动事件
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => handleDragMove(e);
    const handleUp = () => handleDragEnd();

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleUp);

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <NodeViewWrapper
      className={`resizable-image-node ${selected ? 'is-active' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
      }}
    >
      <div
        ref={frameRef}
        className={`resizable-image-frame ${hovered ? 'is-hovered' : ''}`}
        style={{ width, height }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="resizable-image-canvas" onPointerDown={handlePanStart}>
          <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ''}
            draggable={false}
            onLoad={handleImageLoad}
            style={{
              transform: `translate(${cropX}px, ${cropY}px) scale(${zoom})`,
            }}
          />
        </div>

        {resizeHandles.map(handle => (
          <span
            key={handle.key}
            className={`resizable-image-handle resizable-image-handle--${handle.key}`}
            onPointerDown={handleResizeStart(handle.direction)}
          />
        ))}

        {(hovered || selected) && (
          <div className="resizable-image-toolbar">
            <button 
              type="button" 
              onPointerDown={handleDragStart}
              title="拖动位置"
              className="drag-handle-btn"
            >
              <Move className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => adjustZoom(-0.1)} title="缩小">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => adjustZoom(0.1)} title="放大">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={resetCrop} title="重置">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Image.extend({
  name: 'image',

  inline: true,
  group: 'inline',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      cropX: {
        default: 0,
      },
      cropY: {
        default: 0,
      },
      zoom: {
        default: 1,
      },
      posX: {
        default: 0,
        parseHTML: element => {
          const value = element.getAttribute('data-pos-x');
          return value ? parseInt(value, 10) : 0;
        },
        renderHTML: attributes => ({
          'data-pos-x': attributes.posX,
        }),
      },
      posY: {
        default: 0,
        parseHTML: element => {
          const value = element.getAttribute('data-pos-y');
          return value ? parseInt(value, 10) : 0;
        },
        renderHTML: attributes => ({
          'data-pos-y': attributes.posY,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { width, height, cropX, cropY, zoom, posX, posY, ...rest } = HTMLAttributes;
    const frameStyle = [
      width ? `width:${Number(width)}px` : '',
      height ? `height:${Number(height)}px` : '',
      posX ? `left:${Number(posX)}px` : '',
      posY ? `top:${Number(posY)}px` : '',
      'position:absolute',
    ]
      .filter(Boolean)
      .join(';');
    const imageStyle = [
      'width:100%',
      'height:100%',
      'object-fit:cover',
      `transform:translate(${cropX ?? 0}px, ${cropY ?? 0}px) scale(${zoom ?? 1})`,
    ].join(';');

    return [
      'figure',
      mergeAttributes(
        {
          class: 'resizable-image-output',
          'data-type': 'resizable-image',
          style: frameStyle,
        },
      ),
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, rest, { style: imageStyle }),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

