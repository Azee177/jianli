import { Node, mergeAttributes } from '@tiptap/core';

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

export const BlockContainer = Node.create({
  name: 'blockContainer',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div' },
      { tag: 'section' },
      { tag: 'article' },
      { tag: 'header' },
      { tag: 'footer' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },

  addAttributes() {
    return {
      style: attribute('style'),
      class: attribute('class'),
      id: attribute('id'),
    };
  },
});

export default BlockContainer;

