'use client'

import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

import { FontSize } from '@/lib/editor/extensions/FontSize'
import { ParagraphSpacing } from '@/lib/editor/extensions/ParagraphSpacing'

const initialContent = `
<p>这是一个测试段落，用来演示编辑器的四个核心功能。</p>
<p>请选择文本并使用下面的工具栏来测试：</p>
<ul>
  <li>字号调整</li>
  <li>段落间距</li>
  <li>有序列表</li>
  <li>无序列表</li>
</ul>
`

export function EditorDemo() {
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
      FontSize,
      ParagraphSpacing,
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
        class: 'prose-mirror-editor min-h-[300px] p-4 border rounded-lg focus:outline-none',
      },
    },
  })

  if (!editor) {
    return <div>Loading...</div>
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    if (size) {
      editor.chain().focus().setFontSize(size).run()
    } else {
      editor.chain().focus().unsetFontSize().run()
    }
  }

  const handleLineHeightChange = (height: string) => {
    setLineHeight(height)
    if (height) {
      editor.chain().focus().setParagraphSpacing({ lineHeight: height }).run()
    } else {
      editor.chain().focus().unsetParagraphSpacing().run()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">TipTap 编辑器功能演示</h2>
      
      {/* 工具栏 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* 字号控制 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">字号:</label>
            <select 
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
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
            <label className="text-sm font-medium">行高:</label>
            <select 
              value={lineHeight}
              onChange={(e) => handleLineHeightChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
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
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('orderedList')
                ? 'bg-blue-500 text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            有序列表
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('bulletList')
                ? 'bg-green-500 text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            无序列表
          </button>

          {/* 其他格式化按钮 */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('bold')
                ? 'bg-gray-800 text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            粗体
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm font-medium ${
              editor.isActive('italic')
                ? 'bg-gray-800 text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            斜体
          </button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="border rounded-lg bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* 调试信息 */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">HTML 输出:</h3>
        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
          {editor.getHTML()}
        </pre>
      </div>

      {/* 使用说明 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-blue-800">使用说明:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 选择文本后使用字号下拉菜单调整字体大小</li>
          <li>• 选择段落后使用行高下拉菜单调整行间距</li>
          <li>• 点击"有序列表"或"无序列表"按钮创建列表</li>
          <li>• 在列表中按 Enter 创建新的列表项，按 Tab 缩进</li>
        </ul>
      </div>
    </div>
  )
}