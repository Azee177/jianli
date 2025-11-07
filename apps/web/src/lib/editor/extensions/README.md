# TipTap 编辑器扩展

本目录包含了为 TipTap 编辑器实现的四个核心功能扩展：

## 1. 字号 (FontSize)

**文件**: `FontSize.ts`

**功能**: 允许用户设置和取消文本的字号

**命令**:
- `setFontSize(size: string)` - 设置字号，如 "16px", "1.2em", "120%"
- `unsetFontSize()` - 取消字号设置

**实现原理**: 
- 通过 `TextStyle` mark 承载 `fontSize` 属性
- 使用全局属性扩展，将字号信息附加到 textStyle 类型上
- 支持 HTML 解析和渲染

**使用示例**:
```javascript
editor.commands.setFontSize('18px')
editor.commands.unsetFontSize()
```

## 2. 段落间距 (ParagraphSpacing)

**文件**: `ParagraphSpacing.ts`

**功能**: 允许用户设置段落的行高、上边距和下边距

**命令**:
- `setParagraphSpacing(opts)` - 设置段落间距
  - `opts.lineHeight` - 行高，如 "1.6", "24px"
  - `opts.marginTop` - 上边距，如 "16px"
  - `opts.marginBottom` - 下边距，如 "12px"
- `unsetParagraphSpacing()` - 取消段落间距设置

**实现原理**:
- 继承 TipTap 的 Paragraph 扩展
- 添加 lineHeight、marginTop、marginBottom 三个属性
- 自定义 renderHTML 方法合并所有样式

**使用示例**:
```javascript
editor.commands.setParagraphSpacing({
  lineHeight: '1.8',
  marginTop: '16px',
  marginBottom: '12px'
})
editor.commands.unsetParagraphSpacing()
```

## 3. 有序列表 (OrderedList)

**功能**: 创建和管理有序列表（数字列表）

**命令**:
- `toggleOrderedList()` - 切换有序列表状态

**实现原理**:
- 使用 TipTap 官方的 `@tiptap/extension-ordered-list`
- 配置自定义 CSS 类名 `tiptap-ordered-list`
- 需要配合 `ListItem` 扩展使用

**使用示例**:
```javascript
editor.commands.toggleOrderedList()
```

## 4. 无序列表 (BulletList)

**功能**: 创建和管理无序列表（项目符号列表）

**命令**:
- `toggleBulletList()` - 切换无序列表状态

**实现原理**:
- 使用 TipTap 官方的 `@tiptap/extension-bullet-list`
- 配置自定义 CSS 类名 `tiptap-bullet-list`
- 需要配合 `ListItem` 扩展使用

**使用示例**:
```javascript
editor.commands.toggleBulletList()
```

## 编辑器配置

在 `ResumeEditor.tsx` 中的完整配置：

```typescript
const extensions = [
  StarterKit.configure({
    // 禁用默认的列表和段落，使用自定义版本
    bulletList: false,
    orderedList: false,
    listItem: false,
    paragraph: false,
    heading: { levels: [1, 2, 3, 4, 5, 6] },
  }),
  TextStyle, // 字号功能需要
  FontSize, // 自定义字号扩展
  ParagraphSpacing, // 自定义段落扩展
  OrderedList.configure({
    HTMLAttributes: { class: 'tiptap-ordered-list' },
  }),
  BulletList.configure({
    HTMLAttributes: { class: 'tiptap-bullet-list' },
  }),
  ListItem.configure({
    HTMLAttributes: { class: 'tiptap-list-item' },
  }),
]
```

## CSS 样式

相关样式定义在 `prosemirror.css` 中：

```css
/* 字号支持 */
.prose-mirror-editor span[style*="font-size"] {
  display: inline !important;
}

/* 段落间距支持 */
.prose-mirror-editor p[style*="line-height"],
.prose-mirror-editor p[style*="margin-top"],
.prose-mirror-editor p[style*="margin-bottom"] {
  /* 样式生效 */
}

/* 列表样式 */
.prose-mirror-editor .tiptap-ordered-list {
  list-style-type: decimal;
  padding-left: 24px;
  margin: 8px 0;
}

.prose-mirror-editor .tiptap-bullet-list {
  list-style-type: disc;
  padding-left: 24px;
  margin: 8px 0;
}
```

## 测试

- 单元测试: `__tests__/FontSize.test.ts`, `__tests__/ParagraphSpacing.test.ts`
- 集成测试: `__tests__/extensions-integration.test.ts`
- 演示页面: `/test-editor` 路由

## 依赖

```json
{
  "@tiptap/core": "^3.10.2",
  "@tiptap/extension-text-style": "^3.10.1",
  "@tiptap/extension-paragraph": "^3.10.2",
  "@tiptap/extension-ordered-list": "^3.10.1",
  "@tiptap/extension-bullet-list": "^3.10.1",
  "@tiptap/extension-list-item": "^3.10.2"
}
```