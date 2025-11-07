import Paragraph from '@tiptap/extension-paragraph'
import { mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setParagraphSpacing: (opts: { lineHeight?: string; marginTop?: string; marginBottom?: string }) => ReturnType
      unsetParagraphSpacing: () => ReturnType
    }
  }
}

export const ParagraphSpacing = Paragraph.extend({
  name: 'paragraph', // 保持原来的 paragraph 名称
  
  addAttributes() {
    return {
      lineHeight: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
        renderHTML: (attributes: any) => (attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {}),
      },
      marginTop: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.marginTop || null,
        renderHTML: (attributes: any) => (attributes.marginTop ? { style: `margin-top: ${attributes.marginTop}` } : {}),
      },
      marginBottom: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.marginBottom || null,
        renderHTML: (attributes: any) => (attributes.marginBottom ? { style: `margin-bottom: ${attributes.marginBottom}` } : {}),
      },
    }
  },
  
  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: any }) {
    // 合并所有样式属性
    const styles: string[] = []
    if (node.attrs.lineHeight) styles.push(`line-height: ${node.attrs.lineHeight}`)
    if (node.attrs.marginTop) styles.push(`margin-top: ${node.attrs.marginTop}`)
    if (node.attrs.marginBottom) styles.push(`margin-bottom: ${node.attrs.marginBottom}`)
    
    const styleAttr = styles.length > 0 ? { style: styles.join('; ') } : {}
    
    return ['p', mergeAttributes(HTMLAttributes, styleAttr), 0]
  },
  
  addCommands() {
    return {
      setParagraphSpacing:
        (opts: { lineHeight?: string; marginTop?: string; marginBottom?: string }) =>
        ({ chain }: { chain: any }) =>
          chain().updateAttributes(this.name, opts).run(),
      unsetParagraphSpacing:
        () =>
        ({ chain }: { chain: any }) =>
          chain().updateAttributes(this.name, { lineHeight: null, marginTop: null, marginBottom: null }).run(),
    }
  },
})