# 扩展系统 (Extension System)

## 概述

这是一个类似 ChatGPT 的扩展系统，将原来的"智能侧栏"升级为可扩展的 Dock + Panel 两段式布局。

## 架构设计

### 四区布局

1. **左一：扩展 Dock** (64px)
   - 图标列，每个图标代表一个扩展
   - 支持徽标显示（红点数字）
   - 可拖拽排序、开关控制

2. **左二：扩展 Panel** (320-400px)
   - 智能侧栏容器
   - 显示选中扩展的 UI
   - 可调整宽度

3. **中间：主舞台**
   - 简历编辑/预览
   - 支持 Diff、高亮与锚点
   - 与扩展双向联动

4. **右侧：对话/模拟面试**
   - 可被扩展唤起或接管
   - 支持模拟面试模式

## 核心扩展

### 1. 公司/岗位扩展 (CompanyJobExtension)

**功能**：
- JD 解析（链接/文本/截图 OCR）
- 智能匹配度分析
- 公司文化要点提取
- 目标设定与变体管理

**交互流程**：
1. 上传简历 → 自动激活此扩展
2. 输入 JD → 解析并显示匹配结果
3. 选择目标 → 触发其他扩展生成内容

### 2. 建议扩展 (SuggestionsExtension)

**功能**：
- 基于 JD 缺口生成改写建议
- 按优先级/部分/影响分组
- 一键应用/生成变体/忽略
- 实时预览改写效果

**建议类型**：
- 量化成果（+15分）
- 技术栈对齐（+8分）
- 突出协作能力（+12分）
- 删除冗余信息（+3分）

### 3. 学习扩展 (LearningExtension)

**功能**：
- B站视频推荐（基于 JD 缺口）
- 学习进度跟踪
- 速记卡生成
- 2/7/21 天复习提醒

**资源特性**：
- 难度标签（入门/进阶/高级）
- 收益评估（+85% 匹配度）
- 关联 JD 条款
- 预览播放器

### 4. 面试扩展 (InterviewExtension)

**功能**：
- 问题库（基础/技术/行为/场景）
- AI 模拟面试（20分钟快速模式）
- 回答草稿生成
- 练习记录与进步跟踪

**问题特性**：
- 考察要点提示
- 常见误区警告
- 优质回答模板
- 录音练习支持

## 技术实现

### 扩展接口定义

```typescript
interface Extension {
  id: string;
  name: string;
  icon: ReactNode;
  badge?: number | string;
  category: 'core' | 'auxiliary';
  surfaces: {
    leftPanel?: React.FC<ExtensionProps>;
    rightDrawer?: React.FC<ExtensionProps>;
    commands?: Command[];
  };
  permissions: ('readResume' | 'writeResume' | 'callLLM' | 'openLink')[];
  onContextChange?: (ctx: AppContext) => void;
}
```

### 应用上下文

```typescript
interface AppContext {
  resume?: any;
  jd?: JDItem;
  target?: Target;
  selectedText?: string;
}
```

### 扩展通信

- **上下文共享**：通过 `AppContext` 在扩展间共享状态
- **事件广播**：`onContextChange` 监听全局状态变化
- **双向联动**：选中简历段落 ↔ 侧栏显示相关内容

## 使用方式

### 1. 注册扩展

```typescript
// lib/extensions.tsx
export const coreExtensions: Extension[] = [
  {
    id: 'company-job',
    name: '公司/岗位',
    icon: <Building2 className="h-4 w-4" />,
    surfaces: { leftPanel: CompanyJobExtension },
    permissions: ['readResume', 'writeResume', 'callLLM'],
  },
  // ... 其他扩展
];
```

### 2. 扩展组件实现

```typescript
export function MyExtension({ context, onContextChange }: ExtensionProps) {
  // 访问全局上下文
  const { target, jd } = context;
  
  // 更新上下文
  const handleUpdate = () => {
    onContextChange({ target: newTarget });
  };
  
  return <div>扩展内容</div>;
}
```

### 3. 布局集成

```typescript
<ExtensionLayout
  resumeContent={content}
  onResumeChange={setContent}
  onSelectionChange={setSelection}
  onEditorReady={setEditorApi}
/>
```

## 扩展开发指南

### 最小可行扩展

1. 创建扩展组件文件
2. 实现 `ExtensionProps` 接口
3. 在 `lib/extensions.tsx` 中注册
4. 添加图标和权限声明

### 权限系统

- `readResume`: 读取简历内容
- `writeResume`: 修改简历内容
- `callLLM`: 调用 AI 服务
- `openLink`: 打开外部链接

### 状态管理

- 使用 `context` 读取全局状态
- 使用 `onContextChange` 更新状态
- 避免直接操作 DOM，通过上下文通信

## 未来扩展

### 辅助扩展

- **库/模板**：简历模板和变体管理
- **投递跟踪**：导出记录、投递状态、提醒设置
- **搜索 JD**：自动抓取岗位信息
- **GPT Studio**：自定义 Prompt 工作台
- **插件市场**：第三方扩展生态

### 高级功能

- 扩展热插拔
- 权限细粒度控制
- 扩展间通信协议
- 性能监控与优化

## 文件结构

```
src/
├── types/
│   └── extensions.ts          # 扩展类型定义
├── lib/
│   └── extensions.tsx         # 扩展注册管理
├── components/
│   ├── layout/
│   │   ├── ExtensionDock.tsx     # 扩展图标栏
│   │   ├── ExtensionPanel.tsx    # 扩展面板容器
│   │   └── ExtensionLayout.tsx   # 整体布局
│   └── extensions/
│       ├── CompanyJobExtension.tsx
│       ├── SuggestionsExtension.tsx
│       ├── LearningExtension.tsx
│       └── InterviewExtension.tsx
└── app/
    └── page.tsx               # 主页面集成
```

## 设计原则

1. **模块化**：每个扩展独立开发和维护
2. **可扩展**：易于添加新扩展和功能
3. **用户友好**：符合现代应用交互习惯
4. **性能优先**：按需加载，避免冗余渲染
5. **类型安全**：完整的 TypeScript 类型定义

这个扩展系统为简历编辑器提供了强大的可扩展性，同时保持了高效的工作流程。