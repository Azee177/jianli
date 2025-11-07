'use client';

import { useEffect, useMemo, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import { FontSize } from '@/lib/editor/extensions/FontSize';
import { ParagraphSpacing } from '@/lib/editor/extensions/ParagraphSpacing';
import { InlineStyles } from '@/lib/editor/extensions/InlineStyles';
import { BlockContainer } from '@/lib/editor/extensions/BlockContainer';
import { DEFAULT_RESUME_CONTENT } from '@/lib/constants';
import { EmptyLineToolbar } from '../editor/EmptyLineToolbar';
import { ColoredDivider } from '@/lib/editor/extensions/ColoredDivider';
import { ResizableImage } from '@/lib/editor/extensions/ResizableImage';

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

export interface ResumeEditorApi {
  replaceSelectionWithHtml: (html: string) => boolean;
  appendToQuarter: (text: string) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrikethrough: () => void;
  setTextColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setFontSize: (fontSize: string | null) => void;
  toggleOrderedList: () => void;
  toggleBulletList: () => void;
  setParagraphSpacing: (opts: { lineHeight?: string; marginTop?: string; marginBottom?: string } | null) => void;
  setTextAlign: (alignment: 'left' | 'center' | 'right') => void;
}

interface ResumeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange?: (selection: SelectionInfo | null) => void;
  onEditorReady?: (api: ResumeEditorApi | null) => void;
  readOnly?: boolean;
}

const STORAGE_KEY = 'resume.tiptap.fullpage';

export function ResumeEditor({
  content,
  onChange,
  onSelectionChange,
  onEditorReady,
  readOnly = false,
}: ResumeEditorProps) {
  const initialContent = useMemo(() => {
    if (content && content.trim().length > 0) {
      return content;
    }
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return stored;
      }
    }
    return DEFAULT_RESUME_CONTENT;
  }, [content]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        // 禁用 StarterKit 中的默认列表，因为我们要单独配置
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
        // 禁用默认 paragraph，我们会用自定义的替换
        paragraph: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      BlockContainer,
      Underline,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      FontSize,
      ParagraphSpacing, // 使用自定义的段落扩展
      InlineStyles,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'tiptap-list-item',
        },
      }),
      ColoredDivider,
      ResizableImage,
    ],
    [],
  );

  const onChangeRef = useRef(onChange);
  const editorSurfaceRef = useRef<HTMLDivElement | null>(null);
  const isInternalUpdateRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor(
    {
      extensions,
      content: initialContent,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          // Ensure global ProseMirror styles (e.g. list bullets, typography) apply consistently.
          class: 'prose-mirror-editor resume-editor-content',
        },
      },
    },
    [],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleUpdate = () => {
      isInternalUpdateRef.current = true;
      const html = editor.getHTML();
      onChangeRef.current?.(html);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, html);
      }
      // 延迟重置标记，避免立即触发外部更新
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || isInternalUpdateRef.current) {
      return;
    }

    const nextContent = content && content.trim().length > 0 ? content : initialContent;
    if (nextContent && editor.getHTML() !== nextContent) {
      // 使用 queueMicrotask 避免 flushSync 错误
      queueMicrotask(() => {
        if (!isInternalUpdateRef.current) {
      editor.commands.setContent(nextContent);
        }
      });
    }
  }, [content, editor, initialContent]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor || !onSelectionChange) {
      return;
    }

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        onSelectionChange(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (!editor.view.dom.contains(range.commonAncestorContainer)) {
        onSelectionChange(null);
        return;
      }
      const text = selection.toString().trim();
      if (!text) {
        onSelectionChange(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      onSelectionChange({ text, rect });
    };

    const handleBlur = () => onSelectionChange(null);

    editor.on('selectionUpdate', handleSelection);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('selectionUpdate', handleSelection);
      editor.off('blur', handleBlur);
    };
  }, [editor, onSelectionChange]);

  useEffect(() => {
    if (!editor || !onEditorReady) {
      return;
    }

    const api: ResumeEditorApi = {
      replaceSelectionWithHtml: html => {
        if (!html.trim()) {
          return false;
        }
        return editor.commands.insertContent(html);
      },
      appendToQuarter: text => {
        if (!text.trim()) {
          return;
        }
        editor.commands.insertContent(`<p>${text}</p>`);
      },
      toggleBold: () => {
        editor.chain().focus().toggleBold().run();
      },
      toggleItalic: () => {
        editor.chain().focus().toggleItalic().run();
      },
      toggleUnderline: () => {
        editor.chain().focus().toggleUnderline().run();
      },
      toggleStrikethrough: () => {
        editor.chain().focus().toggleStrike().run();
      },
      setTextColor: color => {
        const chain = editor.chain().focus();
        if (!color || color.toLowerCase() === '#000000') {
          chain.unsetColor().run();
        } else {
          chain.setColor(color).run();
        }
      },
      setBackgroundColor: color => {
        const chain = editor.chain().focus();
        if (!color || color === 'transparent') {
          chain.unsetHighlight().run();
        } else {
          chain.setHighlight({ color }).run();
        }
      },
      setFontSize: fontSize => {
        if (!fontSize) {
          editor.chain().focus().unsetFontSize().run();
        } else {
          editor.chain().focus().setFontSize(fontSize).run();
        }
      },
      toggleOrderedList: () => {
        editor.chain().focus().toggleOrderedList().run();
      },
      toggleBulletList: () => {
        editor.chain().focus().toggleBulletList().run();
      },
      setParagraphSpacing: opts => {
        if (!opts) {
          editor.chain().focus().unsetParagraphSpacing().run();
        } else {
          editor.chain().focus().setParagraphSpacing(opts).run();
        }
      },
      setTextAlign: alignment => {
        const chain = editor.chain().focus();
        if (alignment === 'left') {
          chain.unsetTextAlign().run();
        } else {
          chain.setTextAlign(alignment).run();
        }
      },
    };

    onEditorReady(api);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  if (!editor) {
    return (
      <div className="h-full overflow-auto custom-scrollbar bg-[#f5f7fb] px-6 py-10">
        <div className="mx-auto w-[210mm] min-h-[297mm] rounded-[18px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar bg-[#f5f7fb] px-6 py-10">
      <div className="mx-auto w-[210mm] min-h-[297mm] rounded-[18px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]" style={{ fontFamily: "'Microsoft YaHei', '微软雅黑', sans-serif", lineHeight: 1.4, color: '#000', padding: '20px 30px 30px', position: 'relative' }}>
        <div className="editor-surface" ref={editorSurfaceRef}>
          <EditorContent editor={editor} className="resume-editor-fullpage" />
          <EmptyLineToolbar editor={editor} containerRef={editorSurfaceRef} />
        </div>
      </div>
    </div>
  );
}
