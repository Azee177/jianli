import { describe, it, expect } from 'vitest'
import { createEditor } from '@tiptap/core'
import { ParagraphSpacing } from '../ParagraphSpacing'

describe('ParagraphSpacing Extension', () => {
  it('should set paragraph spacing correctly', () => {
    const editor = createEditor({
      extensions: [ParagraphSpacing],
      content: '<p>Hello world</p>',
    })

    // 设置段落间距
    editor.commands.setParagraphSpacing({
      lineHeight: '1.8',
      marginTop: '16px',
      marginBottom: '12px'
    })
    
    const html = editor.getHTML()
    expect(html).toContain('line-height: 1.8')
    expect(html).toContain('margin-top: 16px')
    expect(html).toContain('margin-bottom: 12px')
  })

  it('should unset paragraph spacing correctly', () => {
    const editor = createEditor({
      extensions: [ParagraphSpacing],
      content: '<p style="line-height: 1.8; margin-top: 16px;">Hello world</p>',
    })

    // 取消段落间距设置
    editor.commands.unsetParagraphSpacing()
    
    const html = editor.getHTML()
    expect(html).not.toContain('line-height')
    expect(html).not.toContain('margin-top')
    expect(html).not.toContain('margin-bottom')
  })
})