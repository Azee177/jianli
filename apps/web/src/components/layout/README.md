# 三栏布局系统

## 概述

新的三栏布局系统提供了更加灵活和用户友好的界面，支持可调整的面板宽度和智能的内容管理。

## 布局结构

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (固定顶部)                                                │
├─────────────┬─────────────────────────┬─────────────────────────┤
│ Activity    │ Left Panel              │ Right Panel             │
│ Bar         │ (项目进度 + 功能面板)    │ (智能助手)              │
│ (固定)      │ (可调整宽度)            │ (可调整宽度 + 可隐藏)   │
│             ├─────────────────────────┤                         │
│             │ Resume Editor           │                         │
│             │ (中央编辑区)            │                         │
│             │ (A4格式 + 响应式缩放)   │                         │
└─────────────┴─────────────────────────┴─────────────────────────┘
```

## 核心特性

### 1. 可调整面板宽度
- **左侧面板**: 280px - 600px (默认 360px)
- **右侧面板**: 320px - 600px (默认 400px)
- **拖拽调整**: 鼠标悬停在面板边缘显示调整手柄
- **双击重置**: 双击调整手柄恢复默认宽度

### 2. A4格式简历编辑
- **固定尺寸**: 794px × 1123px (A4 at 96 DPI)
- **响应式缩放**: 根据可用空间自动缩放显示
- **导出保真**: 导出时保持原始A4尺寸
- **实时预览**: 支持编辑/预览模式切换

### 3. 智能助手面板
- **上下文感知**: 根据选中内容提供建议
- **实时对话**: 支持连续对话和历史记录
- **快捷操作**: 预设常用优化建议
- **可隐藏设计**: 不需要时可完全隐藏

### 4. 进度指示器
- **可视化进度**: 清晰显示当前完成状态
- **快速导航**: 点击步骤快速跳转到对应面板
- **状态同步**: 根据实际操作自动更新进度

## 组件架构

### MainLayout.tsx
主布局容器，管理三个区域的尺寸和状态：
- Activity Bar (固定 56px)
- Left Panel (可调整)
- Center Area (自适应)
- Right Panel (可调整 + 可隐藏)

### FeaturePanel.tsx
通用面板容器，支持左右两侧定位：
- 拖拽调整宽度
- 位置自适应 (left/right)
- 最小/最大宽度限制

### SmartAssistant.tsx
右侧智能助手面板：
- 聊天界面
- 快捷操作
- 隐藏/显示切换

### ResumeEditor.tsx
中央简历编辑器：
- A4格式编辑
- 响应式缩放
- 导出功能 (PDF/Word)
- 选择文本交互

### ProgressIndicator.tsx
进度指示器组件：
- 步骤状态管理
- 点击导航
- 进度条显示

## 使用方法

### 基本用法

```tsx
import { MainLayout } from '@/components/layout/MainLayout';

function App() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(360);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  
  return (
    <MainLayout
      activePanel="upload"
      leftPanelWidth={leftPanelWidth}
      rightPanelWidth={rightPanelWidth}
      onLeftPanelResize={setLeftPanelWidth}
      onRightPanelResize={setRightPanelWidth}
      // ... 其他props
    />
  );
}
```

### 导出功能

```tsx
import { exportResume, getResumeContent, cleanResumeContent } from '@/lib/export';

// 导出PDF
const handleExportPDF = () => {
  const content = getResumeContent();
  const cleanContent = cleanResumeContent(content);
  exportResume(cleanContent, { format: 'pdf', filename: '我的简历' });
};

// 导出Word
const handleExportWord = () => {
  const content = getResumeContent();
  const cleanContent = cleanResumeContent(content);
  exportResume(cleanContent, { format: 'word', filename: '我的简历' });
};
```

## 样式系统

### CSS变量
```css
:root {
  --activity-bar-width: 56px;
  --panel-min-width: 280px;
  --panel-max-width: 600px;
  --a4-width: 794px;
  --a4-height: 1123px;
}
```

### 响应式断点
- `1200px`: 缩放至 80%
- `1000px`: 缩放至 70%  
- `800px`: 缩放至 60%

### 动画效果
- 面板调整: `transition: all 300ms ease`
- 缩放变化: `transition: transform 300ms ease`
- 悬停效果: `transition: all 200ms ease`

## 性能优化

1. **虚拟化滚动**: 长列表使用虚拟滚动
2. **懒加载**: 面板内容按需加载
3. **防抖处理**: 调整大小事件防抖
4. **内存管理**: 及时清理事件监听器

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 已知限制

1. **移动端**: 当前主要针对桌面端优化
2. **打印**: 某些浏览器的打印预览可能有差异
3. **缩放**: 极小屏幕下可能需要水平滚动

## 未来改进

1. **移动端适配**: 响应式布局优化
2. **主题系统**: 支持多种颜色主题
3. **快捷键**: 键盘快捷键支持
4. **插件系统**: 支持自定义面板扩展