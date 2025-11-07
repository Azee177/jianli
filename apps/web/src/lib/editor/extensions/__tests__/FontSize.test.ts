import { describe, it, expect } from 'vitest'
import { createEditor } from '@tiptap/core'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '../FontSize'

describe('FontSize Extension', () => {
  it('should set font size correctly', () => {
    const editor = createEditor({
      extensions: [TextStyle, FontSize],
      content: '<p>Hello world</p>',
    })

    // 选择文本
    editor.commands.selectAll()
    
    // 设置字号
    editor.commands.setFontSize('18px')
    
    const html = editor.getHTML()
    expect(html).toContain('font-size: 18px')
  })

  it('should unset font size correctly', () => {
    const editor = createEditor({
      extensions: [TextStyle, FontSize],
      content: '<p><span style="font-size: 18px">Hello world</span></p>',
    })

    // 选择文本
    editor.commands.selectAll()
    
    // 取消字号设置
    editor.commands.unsetFontSize()
    
    const html = editor.getHTML()
    expect(html).not.toContain('font-size')
  })
})