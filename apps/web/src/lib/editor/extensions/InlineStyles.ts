import { Extension } from '@tiptap/core';

const attribute = (name: string) => ({
  default: null,
  parseHTML: (element: HTMLElement) => {
    const value = element.getAttribute(name);
    return value && value.trim().length > 0 ? value : null;
  },
  renderHTML: (attributes: Record<string, any>) => {
    const value = attributes[name];
    return value ? { [name]: value } : {};
  },
});

export const InlineStyles = Extension.create({
  name: 'inlineStyles',

  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'blockquote',
          'bulletList',
          'orderedList',
          'listItem',
          'table',
          'tableRow',
          'tableCell',
          'tableHeader',
          'textStyle',
          'blockContainer',
        ],
        attributes: {
          style: attribute('style'),
          class: attribute('class'),
          id: attribute('id'),
        },
      },
    ];
  },
});

export default InlineStyles;

