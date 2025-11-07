import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useState, useRef, useCallback } from 'react';
import { Palette, Minus, Plus } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    coloredDivider: {
      insertColoredDivider: (attrs?: { color?: string; thickness?: number; width?: number; marginTop?: string; marginBottom?: string }) => ReturnType;
    };
  }
}

const COLOR_PRESETS = [
  '#d1d5db', // 灰色
  '#e2e8f0', // 柔和灰
  '#0f172a', // 深黑
  '#38bdf8', // 天蓝
  '#14b8a6', // 青绿
  '#fb923c', // 琥珀
  '#f472b6', // 玫瑰
];

function ColoredDividerView({ node, updateAttributes, selected }: NodeViewProps) {
  const [showControls, setShowControls] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const color = node.attrs.color || '#d1d5db';
  const thickness = node.attrs.thickness || 2;
  const width = node.attrs.width || 100; // 百分比
  const marginTop = node.attrs.marginTop || '0em';
  const marginBottom = node.attrs.marginBottom || '0em';

  const cancelHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHideTimeout();
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
      setShowColorPicker(false);
      hideTimeoutRef.current = null;
    }, 500); // 500ms 延迟
  }, [cancelHideTimeout]);

  const handleColorChange = (newColor: string) => {
    updateAttributes({ color: newColor });
  };

  const adjustThickness = (delta: number) => {
    const newThickness = Math.max(1, Math.min(10, thickness + delta));
    updateAttributes({ thickness: newThickness });
  };

  const adjustWidth = (delta: number) => {
    const newWidth = Math.max(20, Math.min(100, width + delta));
    updateAttributes({ width: newWidth });
  };

  const adjustSpacing = (delta: number) => {
    // 解析当前的 em 值
    const currentTop = parseFloat(marginTop);
    const currentBottom = parseFloat(marginBottom);
    const newValue = Math.max(0, Math.min(3, currentTop + delta * 0.25)); // 步进 0.25em
    updateAttributes({ 
      marginTop: `${newValue}em`, 
      marginBottom: `${newValue}em` 
    });
  };

  const handleWrapperMouseLeave = () => {
    // 延迟隐藏工具栏
    scheduleHide();
  };

  return (
    <NodeViewWrapper
      className={`colored-divider-wrapper ${selected ? 'is-selected' : ''}`}
      data-drag-handle
      style={{
        marginTop,
        marginBottom,
      }}
      onMouseEnter={() => {
        cancelHideTimeout();
        setShowControls(true);
      }}
      onMouseLeave={handleWrapperMouseLeave}
    >
      <div className="colored-divider-container">
        <hr
          className="colored-divider-line"
          style={{
            borderTopColor: color,
            borderTopWidth: `${thickness}px`,
            width: `${width}%`,
          }}
        />
        {(showControls || selected) && (
          <div 
            className="colored-divider-toolbar"
            onMouseEnter={cancelHideTimeout}
            onMouseLeave={scheduleHide}
          >
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="改变颜色"
              className="divider-tool-btn"
            >
              <Palette className="h-4 w-4" />
            </button>
            
            <div className="divider-control-group">
              <button
                type="button"
                onClick={() => adjustThickness(-1)}
                title="减小粗细"
                className="divider-tool-btn"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="divider-value">{thickness}px</span>
              <button
                type="button"
                onClick={() => adjustThickness(1)}
                title="增加粗细"
                className="divider-tool-btn"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="divider-control-group">
              <button
                type="button"
                onClick={() => adjustWidth(-10)}
                title="减小长度"
                className="divider-tool-btn"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="divider-value">{width}%</span>
              <button
                type="button"
                onClick={() => adjustWidth(10)}
                title="增加长度"
                className="divider-tool-btn"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="divider-control-group">
              <button
                type="button"
                onClick={() => adjustSpacing(-1)}
                title="减小间距"
                className="divider-tool-btn"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="divider-value">{parseFloat(marginTop).toFixed(2)}em</span>
              <button
                type="button"
                onClick={() => adjustSpacing(1)}
                title="增加间距"
                className="divider-tool-btn"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {showColorPicker && (
              <div 
                className="divider-color-palette"
                onMouseEnter={cancelHideTimeout}
                onMouseLeave={scheduleHide}
              >
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    className={`color-preset ${color === preset ? 'active' : ''}`}
                    style={{ backgroundColor: preset }}
                    onClick={() => handleColorChange(preset)}
                    title={preset}
                  />
                ))}
                <label className="color-custom" title="自定义颜色">
                  <Palette className="h-3 w-3" />
                  <input
                    type="color"
                    value={color}
                    onChange={e => handleColorChange(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ColoredDivider = HorizontalRule.extend({
  name: 'coloredDivider',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'editor-colored-divider',
      },
    };
  },

  draggable: true,

  addAttributes() {
    return {
      color: {
        default: '#d1d5db',
        parseHTML: element => element.getAttribute('data-color') ?? '#d1d5db',
        renderHTML: attributes => ({
          'data-color': attributes.color,
        }),
      },
      thickness: {
        default: 2,
        parseHTML: element => {
          const value = element.getAttribute('data-thickness');
          return value ? parseInt(value, 10) || 2 : 2;
        },
        renderHTML: attributes => ({
          'data-thickness': attributes.thickness,
        }),
      },
      width: {
        default: 100,
        parseHTML: element => {
          const value = element.getAttribute('data-width');
          return value ? parseInt(value, 10) || 100 : 100;
        },
        renderHTML: attributes => ({
          'data-width': attributes.width,
        }),
      },
      marginTop: {
        default: '0em',
        parseHTML: element => element.getAttribute('data-margin-top') ?? '0em',
        renderHTML: attributes => ({
          'data-margin-top': attributes.marginTop,
        }),
      },
      marginBottom: {
        default: '0em',
        parseHTML: element => element.getAttribute('data-margin-bottom') ?? '0em',
        renderHTML: attributes => ({
          'data-margin-bottom': attributes.marginBottom,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes, node }) {
    const color = node.attrs.color || '#d1d5db';
    const thickness = node.attrs.thickness || 2;
    const width = node.attrs.width || 100;
    const marginTop = node.attrs.marginTop || '0em';
    const marginBottom = node.attrs.marginBottom || '0em';
    
    const style = [
      HTMLAttributes.style,
      `border-top-color:${color}`,
      `border-top-width:${thickness}px`,
      `width:${width}%`,
      'margin-left:auto',
      'margin-right:auto',
      `margin-top:${marginTop}`,
      `margin-bottom:${marginBottom}`,
    ]
      .filter(Boolean)
      .join(';');

    return [
      'hr',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColoredDividerView);
  },
});

