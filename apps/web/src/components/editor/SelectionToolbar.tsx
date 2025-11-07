'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  ArrowUpDown,
  Bold,
  ChevronDown,
  ChevronRight,
  List,
  ListOrdered,
  Palette,
  Sparkles,
  Strikethrough,
  Type,
  Underline,
  X,
  Italic,
} from 'lucide-react';

import { SelectionInfo } from '../layout/ResumeEditor';

interface SelectionToolbarProps {
  selection: SelectionInfo | null;
  onClose: () => void;
  onAIExplain: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onTextColor: (color: string) => void;
  onBackgroundColor: (color: string) => void;
  onFontSize: (fontSize: string | null) => void;
  onLineHeight: (lineHeight: string | null) => void;
  onToggleOrderedList: () => void;
  onToggleBulletList: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right') => void;
}

const textColors = [
  { name: '默认', value: '#000000' },
  { name: '红色', value: '#ef4444' },
  { name: '橙色', value: '#f97316' },
  { name: '黄色', value: '#eab308' },
  { name: '绿色', value: '#22c55e' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '紫色', value: '#a855f7' },
  { name: '灰色', value: '#6b7280' },
];

const backgroundColors = [
  { name: '无背景', value: 'transparent' },
  { name: '浅灰', value: '#f3f4f6' },
  { name: '浅红', value: '#fecaca' },
  { name: '浅橙', value: '#fed7aa' },
  { name: '浅黄', value: '#fef3c7' },
  { name: '浅绿', value: '#bbf7d0' },
  { name: '浅蓝', value: '#bfdbfe' },
  { name: '浅紫', value: '#e9d5ff' },
];

const fontSizes = [
  { label: '默认', value: null },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
];

const lineHeights = [
  { label: '默认', value: null },
  { label: '0.5', value: '0.5' },
  { label: '1.2', value: '1.2' },
  { label: '1.5', value: '1.5' },
  { label: '1.8', value: '1.8' },
  { label: '2.0', value: '2' },
  { label: '2.4', value: '2.4' },
];

export function SelectionToolbar({
  selection,
  onClose,
  onAIExplain,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onTextColor,
  onBackgroundColor,
  onFontSize,
  onLineHeight,
  onToggleOrderedList,
  onToggleBulletList,
  onAlign,
}: SelectionToolbarProps) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'font-size' | 'line-height' | null>(null);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const submenuCloseTimeoutRef = useRef<number | null>(null);

  const clearSubmenuCloseTimeout = () => {
    if (submenuCloseTimeoutRef.current !== null) {
      window.clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }
  };

  const openSubmenu = (key: 'font-size' | 'line-height') => {
    clearSubmenuCloseTimeout();
    setActiveSubmenu(key);
  };

  const delayCloseSubmenu = (key: 'font-size' | 'line-height') => {
    clearSubmenuCloseTimeout();
    submenuCloseTimeoutRef.current = window.setTimeout(() => {
      setActiveSubmenu(current => (current === key ? null : current));
      submenuCloseTimeoutRef.current = null;
    }, 320);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.selection-toolbar')) {
        setShowTextColorPicker(false);
        setShowTypographyMenu(false);
        setActiveSubmenu(null);
        setShowAlignMenu(false);
      }
    };

    if (
      showTextColorPicker ||
      showTypographyMenu ||
      showAlignMenu ||
      activeSubmenu
    ) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTextColorPicker, showTypographyMenu, activeSubmenu, showAlignMenu]);

  useEffect(
    () => () => {
      clearSubmenuCloseTimeout();
    },
    [],
  );

  if (!selection || !selection.text || selection.text.trim().length === 0) {
    return null;
  }

  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 800;

  const toolbarWidth = 520;
  const toolbarHeight = 44;

  let top = selection.rect.top - toolbarHeight - 8;
  if (top < 12) {
    top = selection.rect.bottom + 8;
  }

  let left = selection.rect.left + selection.rect.width / 2 - toolbarWidth / 2;
  if (left < 12) {
    left = 12;
  } else if (left + toolbarWidth > viewportWidth - 12) {
    left = viewportWidth - toolbarWidth - 12;
  }

  const style = {
    position: 'fixed' as const,
    left: Math.max(12, left),
    top: Math.max(12, Math.min(top, viewportHeight - toolbarHeight - 12)),
    zIndex: 9999,
  };

  const closeAll = () => {
    clearSubmenuCloseTimeout();
    setShowTextColorPicker(false);
    setShowTypographyMenu(false);
    setActiveSubmenu(null);
    setShowAlignMenu(false);
  };

  return (
    <div
      style={style}
      className="selection-toolbar rounded-xl bg-white text-gray-700"
      onMouseDown={event => event.preventDefault()}
      onClick={event => event.stopPropagation()}
    >
      <div className="flex items-center">
        <div className="toolbar-section px-3 py-2">
          <button
            onClick={() => {
              closeAll();
              onAIExplain();
            }}
            className="ai-button inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
            type="button"
            title="AI解释：专业概念、面试问题与学习资源"
          >
            <Sparkles className="h-4 w-4" />
            AI解释
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section px-3 py-2 relative">
          <button
            onClick={() => {
              const next = !showTypographyMenu;
              closeAll();
              setShowTypographyMenu(next);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm"
            type="button"
          >
            <Type className="h-4 w-4" />
            <span className="sr-only">文本工具</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showTypographyMenu && (
            <div
              className="dropdown-menu"
              onMouseDown={event => event.preventDefault()}
              onClick={event => event.stopPropagation()}
            >
              <div className="relative">
                <div
                  className="relative"
                  onMouseEnter={() => openSubmenu('font-size')}
                  onMouseLeave={() => delayCloseSubmenu('font-size')}
                >
                  <button
                    className="flex w-full items-center justify-between"
                    onClick={() => openSubmenu('font-size')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      字号
                    </span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  {activeSubmenu === 'font-size' && (
                    <div
                      className="dropdown-menu dropdown-submenu"
                      onMouseDown={event => event.preventDefault()}
                      onClick={event => event.stopPropagation()}
                      onMouseEnter={() => openSubmenu('font-size')}
                      onMouseLeave={() => delayCloseSubmenu('font-size')}
                    >
                      {fontSizes.map(option => (
                        <button
                          key={option.label}
                          onClick={() => {
                            console.log('Font size option clicked:', option.value);
                            onFontSize(option.value);
                            closeAll();
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="flex w-full items-center gap-2"
                  onClick={() => {
                    console.log('Ordered list button clicked');
                    onToggleOrderedList();
                    closeAll();
                  }}
                >
                  <ListOrdered className="h-4 w-4" />
                  有序列表
                </button>

                <button
                  className="flex w-full items-center gap-2"
                  onClick={() => {
                    console.log('Bullet list button clicked');
                    onToggleBulletList();
                    closeAll();
                  }}
                >
                  <List className="h-4 w-4" />
                  无序列表
                </button>

                <div
                  className="relative"
                  onMouseEnter={() => openSubmenu('line-height')}
                  onMouseLeave={() => delayCloseSubmenu('line-height')}
                >
                  <button
                    className="flex w-full items-center justify-between"
                    onClick={() => openSubmenu('line-height')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      段落间距
                    </span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  {activeSubmenu === 'line-height' && (
                    <div
                      className="dropdown-menu dropdown-submenu"
                      onMouseDown={event => event.preventDefault()}
                      onClick={event => event.stopPropagation()}
                      onMouseEnter={() => openSubmenu('line-height')}
                      onMouseLeave={() => delayCloseSubmenu('line-height')}
                    >
                      {lineHeights.map(option => (
                        <button
                          key={option.label}
                          onClick={() => {
                            console.log('Line height option clicked:', option.value);
                            onLineHeight(option.value);
                            closeAll();
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section px-3 py-2 relative">
          <button
            onClick={() => {
              const next = !showAlignMenu;
              closeAll();
              setShowAlignMenu(next);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm"
            type="button"
          >
            <AlignCenter className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>

          {showAlignMenu && (
            <div
              className="dropdown-menu"
              onMouseDown={event => event.preventDefault()}
              onClick={event => event.stopPropagation()}
            >
              <button
                onClick={() => {
                  onAlign('left');
                  closeAll();
                }}
              >
                左对齐
              </button>
              <button
                onClick={() => {
                  onAlign('center');
                  closeAll();
                }}
              >
                居中对齐
              </button>
              <button
                onClick={() => {
                  onAlign('right');
                  closeAll();
                }}
              >
                右对齐
              </button>
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section px-3 py-2 flex items-center gap-1">
          <button
            onClick={() => {
              closeAll();
              onBold();
            }}
            className="format-button"
            type="button"
            title="加粗"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              closeAll();
              onStrikethrough();
            }}
            className="format-button"
            type="button"
            title="删除线"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              closeAll();
              onItalic();
            }}
            className="format-button"
            type="button"
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              closeAll();
              onUnderline();
            }}
            className="format-button"
            type="button"
            title="下划线"
          >
            <Underline className="h-4 w-4" />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section px-3 py-2 relative">
          <button
            onClick={() => {
              const next = !showTextColorPicker;
              closeAll();
              setShowTextColorPicker(next);
            }}
            className="color-button inline-flex items-center gap-1 px-2 py-1.5"
            type="button"
            title="字体颜色与背景颜色"
          >
            <Palette className="h-4 w-4" />
            A
          </button>

          {showTextColorPicker && (
            <div
              className="color-picker-panel dropdown-menu right-0"
              onMouseDown={event => event.preventDefault()}
              onClick={event => event.stopPropagation()}
            >
              <div className="color-picker-section">
                <h4 className="color-picker-title">字体颜色</h4>
                <div className="color-grid">
                  {textColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        onTextColor(color.value);
                        closeAll();
                      }}
                      className="color-option"
                      style={{ color: color.value }}
                      title={color.name}
                      onMouseDown={event => event.preventDefault()}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>

              <div className="color-picker-section">
                <h4 className="color-picker-title">背景颜色</h4>
                <div className="color-grid">
                  {backgroundColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        onBackgroundColor(color.value);
                        closeAll();
                      }}
                      className={`color-option ${
                        color.value === 'transparent' ? 'transparent' : ''
                      }`}
                      style={{
                        backgroundColor:
                          color.value === 'transparent'
                            ? 'transparent'
                            : color.value,
                      }}
                      title={color.name}
                      onMouseDown={event => event.preventDefault()}
                    >
                      {color.value === 'transparent' && (
                        <span className="text-xs text-gray-400">无</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section px-2 py-2">
          <button
            onClick={() => {
              closeAll();
              onClose();
            }}
            className="format-button"
            type="button"
            title="关闭工具栏"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
