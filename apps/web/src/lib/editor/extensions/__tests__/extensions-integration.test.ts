import { describe, it, expect } from 'vitest'
import { createEditor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

import { FontSize } from '../FontSize'
import { ParagraphSpacing } from '../ParagraphSpacing'

describe('Editor Extensions Integration', () => {
  it('should create editor with all extensions without errors', () => {
    const extensions = [
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
    ]

    expect(() => {
      const editor = createEditor({
        extensions,
        content: '<p>Hello world</p>',
      })
      return editor
    }).not.toThrow()
  })

  it('should support all four features: font size, paragraph spacing, ordered list, bullet list', () => {
    const extensions = [
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
      OrderedList,
      BulletList,
      ListItem,
    ]

    const editor = createEditor({
      extensions,
      content: '<p>Test content</p>',
    })

    // 测试字号功能
    editor.commands.selectAll()
    editor.commands.setFontSize('18px')
    expect(editor.getHTML()).toContain('font-size: 18px')

    // 测试段落间距功能
    editor.commands.setParagraphSpacing({ lineHeight: '1.8' })
    expect(editor.getHTML()).toContain('line-height: 1.8')

    // 测试有序列表
    editor.commands.selectAll()
    editor.commands.toggleOrderedList()
    expect(editor.getHTML()).toContain('<ol>')

    // 测试无序列表
    editor.commands.toggleBulletList()
    expect(editor.getHTML()).toContain('<ul>')
  })
})