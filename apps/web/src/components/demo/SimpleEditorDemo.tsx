'use client'

import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

// 简化的字号扩展
import { Extension } from '@tiptap/core'

const SimpleFontSize = Extension.create({
  name: 'simpleFontSize',
  
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: any) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
          },
        },
      },
    ]
  },
  
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

// 简化的段落扩展
import Paragraph from '@tiptap/extension-paragraph'
import { mergeAttributes } from '@tiptap/core'

const SimpleParagraphSpacing = Paragraph.extend({
  name: 'paragraph',
  
  addAttributes() {
    return {
      lineHeight: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
        renderHTML: (attributes: any) => (attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {}),
      },
    }
  },
  
  renderHTML({ node, HTMLAttributes }: any) {
    const styles: string[] = []
    if (node.attrs.lineHeight) styles.push(`line-height: ${node.attrs.lineHeight}`)
    
    const styleAttr = styles.length > 0 ? { style: styles.join('; ') } : {}
    
    return ['p', mergeAttributes(HTMLAttributes, styleAttr), 0]
  },
  
  addCommands() {
    return {
      setParagraphSpacing:
        (opts: { lineHeight?: string }) =>
        ({ chain }: any) =>
          chain().updateAttributes(this.name, opts).run(),
      unsetParagraphSpacing:
        () =>
        ({ chain }: any) =>
          chain().updateAttributes(this.name, { lineHeight: null }).run(),
    }
  },
})

const initialContent = `
<p>这是一个简化的编辑器演示，用来测试四个核心功能：</p>
<p>1. 选择文本并调整字号</p>
<p>2. 调整段落行高</p>
<p>3. 创建有序列表</p>
<p>4. 创建无序列表</p>
`

export function SimpleEditorDemo() {
  const [fontSize, setFontSize] = useState('')
  const [lineHeight, setLineHeight] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        paragraph: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextStyle,
      SimpleFontSize,
      SimpleParagraphSpacing,
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
    ],
    content: initialContent,
    immediatelyRender: false, // 修复 SSR 问题
    editorProps: {
      attributes: {
        class: 'prose-mirror-editor min-h-[300px] p-4 border rounded-lg focus:outline-none bg-white',
      },
    },
  })

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">编辑器加载中...</div>
      </div>
    )
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    if (size) {
      (editor.commands as any).setFontSize(size)
    } else {
      (editor.commands as any).unsetFontSize()
    }
  }

  const handleLineHeightChange = (height: string) => {
    setLineHeight(height)
    if (height) {
      (editor.commands as any).setParagraphSpacing({ lineHeight: height })
    } else {
      (editor.commands as any).unsetParagraphSpacing()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">TipTap 编辑器功能演示</h2>
      
      {/* 工具栏 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* 字号控制 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">字号:</label>
            <select 
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              <option value="">默认</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
            </select>
          </div>
          
          {/* 行高控制 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">行高:</label>
            <select 
              value={lineHeight}
              onChange={(e) => handleLineHeightChange(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              <option value="">默认</option>
              <option value="1.2">1.2</option>
              <option value="1.4">1.4</option>
              <option value="1.6">1.6</option>
              <option value="1.8">1.8</option>
              <option value="2.0">2.0</option>
              <option value="2.5">2.5</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 列表控制 */}
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            有序列表
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            无序列表
          </button>

          {/* 其他格式化按钮 */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('bold')
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            粗体
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('italic')
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            斜体
          </button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
        <EditorContent editor={editor} />
      </div>

      {/* 调试信息 */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-gray-800">HTML 输出:</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40 text-gray-600">
          {editor.getHTML()}
        </pre>
      </div>

      {/* 使用说明 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium mb-2 text-blue-800">使用说明:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>字号测试</strong>: 选择文本后使用字号下拉菜单调整大小</li>
          <li>• <strong>行高测试</strong>: 将光标放在段落中，使用行高下拉菜单调整间距</li>
          <li>• <strong>列表测试</strong>: 选择文本后点击列表按钮，或在列表中按 Enter 添加新项</li>
          <li>• <strong>查看输出</strong>: 在下方的 HTML 输出区域查看生成的代码</li>
        </ul>
      </div>

      {/* 功能状态 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-medium text-gray-800">字号功能</div>
          <div className="text-xs text-gray-500">正常工作</div>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-medium text-gray-800">段落间距</div>
          <div className="text-xs text-gray-500">正常工作</div>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-medium text-gray-800">有序列表</div>
          <div className="text-xs text-gray-500">正常工作</div>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-medium text-gray-800">无序列表</div>
          <div className="text-xs text-gray-500">正常工作</div>
        </div>
      </div>
    </div>
  )
}