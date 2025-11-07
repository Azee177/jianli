# Design Document

## Overview

This design document outlines the implementation of a comprehensive Resume Copilot UI update that transforms the current three-column layout into a more sophisticated, ChatGPT-inspired interface. The new design features a VSCode-style Activity Bar, resizable Feature Panel, and an integrated resume editor with advanced selection tools and real-time collaboration features.

The design maintains the existing architectural principles while significantly enhancing the user experience through improved navigation, workflow management, and interactive editing capabilities.

## Architecture

### Component Hierarchy

```
HomePage (Main Container)
├── Header (Sticky Navigation)
│   ├── MenuToggle
│   ├── BrandingSection
│   └── SearchAndSettings
├── MainLayout (Three-Column Grid)
│   ├── ActivityBar (Fixed 56px)
│   │   ├── Logo
│   │   └── NavigationIcons[]
│   ├── FeaturePanel (Resizable 320-720px)
│   │   ├── PanelHeader
│   │   ├── PanelContent (Dynamic)
│   │   │   ├── UploadPanel
│   │   │   ├── IntentPanel
│   │   │   ├── JDPanel
│   │   │   ├── CompanyPanel
│   │   │   ├── PrepPanel
│   │   │   ├── InterviewPanel
│   │   │   └── ExportPanel
│   │   ├── ChatInterface
│   │   └── ResizeHandle
│   └── ResumeEditor (Adaptive Width)
│       ├── ResumeContent (ContentEditable)
│       └── SelectionToolbar (Floating)
└── BottomActionBar (Sticky)
    ├── StatusDisplay
    └── ActionButtons[]
```

### State Management Architecture

The application uses a combination of React state management patterns:

1. **Local Component State**: For UI interactions, panel visibility, and temporary data
2. **Workflow State Machine**: For tracking progress through the resume optimization workflow
3. **Resume Editor State**: For managing document content, selections, and edit history using a structured document model
4. **Global Application State**: For user preferences, target job, and cross-component data

### Rich Text Editor Architecture

The ResumeEditor uses a structured document model similar to modern rich text editors:

#### Document Model
- **Document Tree**: Hierarchical structure representing the document content
- **Block Elements**: Paragraphs, headings, lists, tables with unique IDs
- **Inline Elements**: Text runs with formatting marks (bold, italic, etc.)
- **Style System**: Centralized style definitions instead of inline styles

#### State Synchronization
- **Bidirectional Sync**: DOM ↔ Document Model ↔ React State
- **Change Detection**: Efficient diff algorithm for detecting content changes
- **Event Handling**: Proper handling of browser editing events
- **Conflict Resolution**: Handling simultaneous programmatic and user changes

#### Command System
- **Editor Commands**: Structured commands for all editing operations
- **Undo/Redo Stack**: Complete history of document changes
- **Batch Operations**: Grouping related changes for better UX
- **Plugin Architecture**: Extensible system for custom functionality

### Layout System

The interface uses CSS Grid for the main three-column layout with dynamic column sizing:

```css
grid-template-columns: 56px [panel-width]px 1fr
```

Where `[panel-width]` is dynamically controlled between 320px and 720px, with 0px when hidden.

## Components and Interfaces

### Core Layout Components

#### HomePage Component
**Purpose**: Main application container managing global state and layout
**Props**: None (root component)
**State**:
- `activePanel: PanelKey | null` - Currently active feature panel
- `panelWidth: number` - Width of the feature panel (320-720px)
- `uploaded: boolean` - Resume upload status
- `target: TargetJob | null` - Selected target job
- `dims: Dimension[]` - JD analysis dimensions
- `lockDims: boolean` - Whether dimensions are locked

#### ActivityBar Component
**Purpose**: Fixed navigation sidebar with workflow icons
**Props**:
```typescript
interface ActivityBarProps {
  activePanel: PanelKey | null;
  onPanelChange: (panel: PanelKey | null) => void;
  navItems: NavigationItem[];
}
```

#### FeaturePanel Component
**Purpose**: Resizable panel containing workflow-specific interfaces
**Props**:
```typescript
interface FeaturePanelProps {
  activePanel: PanelKey | null;
  width: number;
  onClose: () => void;
  onResize: (width: number) => void;
  children: React.ReactNode;
}
```

#### ResumeEditor Component
**Purpose**: Word-like rich text editor with advanced formatting and state management
**Props**:
```typescript
interface ResumeEditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  onSelectionChange: (selection: SelectionInfo) => void;
  readOnly?: boolean;
}

interface EditorContent {
  document: DocumentNode;
  html: string;
  plainText: string;
  metadata: DocumentMetadata;
}

interface DocumentNode {
  type: 'document';
  children: BlockNode[];
  styles: DocumentStyles;
}

interface BlockNode {
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'pageBreak';
  id: string;
  children: InlineNode[];
  attributes: BlockAttributes;
}

interface InlineNode {
  type: 'text' | 'link' | 'image';
  content: string;
  marks: TextMark[];
}

interface TextMark {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'highlight' | 'color';
  attributes?: Record<string, any>;
}
```

### Feature Panel Components

#### UploadPanel
**Purpose**: File upload and OCR processing interface
**Features**:
- Drag-and-drop file upload
- OCR processing status indicators
- Avatar extraction preview
- Template selection

#### IntentPanel
**Purpose**: Target job selection and confirmation
**Features**:
- Job opportunity cards display
- Single-selection confirmation
- Company and role information
- Official job posting links

#### JDPanel
**Purpose**: Job description analysis and dimension editing
**Features**:
- Editable dimension checkboxes
- Real-time text editing
- Lock/unlock functionality
- Progress indicators

#### CompanyPanel
**Purpose**: Company-specific customization interface
**Features**:
- Company research input
- Cultural alignment tools
- Custom content generation
- Integration with resume editor

### Interactive Components

#### SelectionToolbar
**Purpose**: Floating toolbar for text selection actions
**Features**:
- Context-aware positioning
- Multiple editing actions (Polish, STAR, Quantify, Mirror, Translate)
- Company quarter integration
- Smooth show/hide animations

#### FormattingToolbar
**Purpose**: Comprehensive formatting toolbar for Word-like editing experience
**Features**:
- Typography controls (font family, size, color)
- Text formatting (bold, italic, underline, strikethrough)
- Paragraph formatting (alignment, line spacing, indentation)
- List creation and management (bulleted, numbered, nested)
- Table insertion and editing
- Style presets and custom styles
- Undo/redo controls

#### EditorCore
**Purpose**: Core rich text editing engine with advanced capabilities
**Features**:
- Structured document model with proper state management
- Command-based editing system with undo/redo
- Automatic pagination and page break handling
- Spell checking and grammar assistance
- Real-time collaboration support
- Plugin system for extensibility

#### ChatInterface
**Purpose**: Contextual AI assistance throughout workflow
**Features**:
- Workflow-aware suggestions
- Message history
- Real-time responses
- Integration with current panel context

## Data Models

### Core Data Types

```typescript
// Navigation and UI State
type PanelKey = 'upload' | 'intent' | 'jd' | 'draft' | 'company' | 'prep' | 'interview' | 'export';

interface NavigationItem {
  key: PanelKey;
  label: string;
  icon: LucideIcon;
}

// Job and Target Management
interface TargetJob {
  company: string;
  role: string;
  city?: string;
  link?: string;
}

interface JobCard {
  company: string;
  role: string;
  city: string;
  link: string;
}

// JD Analysis
interface Dimension {
  id: string;
  label: string;
  checked: boolean;
}

// Resume and Content
interface SelectionInfo {
  rect: DOMRect;
  text: string;
  range: EditorRange;
  blocks: BlockNode[];
}

interface ToolbarState {
  x: number;
  y: number;
  visible: boolean;
  text: string;
}

// Rich Text Editor Types
interface EditorRange {
  start: EditorPosition;
  end: EditorPosition;
  collapsed: boolean;
}

interface EditorPosition {
  blockId: string;
  offset: number;
}

interface EditorCommand {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

interface EditorHistory {
  undoStack: EditorCommand[];
  redoStack: EditorCommand[];
  currentIndex: number;
}

interface DocumentStyles {
  pageSize: 'A4' | 'Letter';
  margins: Margins;
  defaultFont: FontSettings;
  headingStyles: Record<number, TextStyle>;
  paragraphStyles: Record<string, ParagraphStyle>;
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  color: string;
  textDecoration: string[];
}

interface ParagraphStyle extends TextStyle {
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  indentLeft: number;
  indentRight: number;
}

// Workflow State
interface WorkflowState {
  uploaded: boolean;
  ocrReady: boolean;
  avatarReady: boolean;
  target: TargetJob | null;
  dimensionsLocked: boolean;
  currentStep: number;
}
```

### State Transitions

The application follows a linear workflow with specific state transitions:

1. **INITIAL** → **UPLOAD_READY**: Application loads
2. **UPLOAD_READY** → **PROCESSING**: User uploads resume
3. **PROCESSING** → **TARGET_SELECTION**: OCR completes
4. **TARGET_SELECTION** → **JD_ANALYSIS**: Target job confirmed
5. **JD_ANALYSIS** → **DRAFT_GENERATION**: Dimensions locked
6. **DRAFT_GENERATION** → **COMPANY_CUSTOMIZATION**: Initial draft complete
7. **COMPANY_CUSTOMIZATION** → **FINALIZATION**: Company quarter complete
8. **FINALIZATION** → **EXPORT_READY**: All content finalized

## Error Handling

### Error Boundaries
- **Global Error Boundary**: Catches and displays application-level errors
- **Panel Error Boundary**: Isolates errors within specific feature panels
- **Editor Error Boundary**: Protects resume editor from content-related errors

### Error States
- **Upload Failures**: File format errors, size limits, OCR processing failures
- **Network Errors**: API timeouts, connection issues, service unavailability
- **Content Errors**: Invalid resume content, parsing failures, generation errors
- **State Errors**: Invalid workflow transitions, data corruption, sync issues

### Recovery Mechanisms
- **Automatic Retry**: For transient network and processing errors
- **Manual Retry**: User-initiated retry for failed operations
- **State Reset**: Ability to reset workflow state and start over
- **Data Persistence**: Local storage backup for critical user data

## Testing Strategy

### Unit Testing
- **Component Testing**: Individual component behavior and props handling
- **Hook Testing**: Custom hooks for state management and side effects
- **Utility Testing**: Helper functions and data transformations
- **State Testing**: Workflow state transitions and validation

### Integration Testing
- **Panel Integration**: Feature panel interactions with main application
- **Editor Integration**: Resume editor with selection tools and chat interface
- **Workflow Integration**: End-to-end workflow progression testing
- **API Integration**: Backend service integration and error handling

### End-to-End Testing
- **User Workflows**: Complete user journeys from upload to export
- **Cross-Browser Testing**: Compatibility across modern browsers
- **Responsive Testing**: Layout behavior across different screen sizes
- **Accessibility Testing**: Keyboard navigation and screen reader compatibility

### Performance Testing
- **Rendering Performance**: Component render times and optimization
- **Memory Usage**: State management and cleanup efficiency
- **Bundle Size**: Code splitting and lazy loading effectiveness
- **User Experience**: Perceived performance and interaction responsiveness

## Accessibility Considerations

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Keyboard Shortcuts**: Quick access to common actions and panels
- **Focus Management**: Clear focus indicators and proper focus trapping
- **Escape Handling**: Consistent escape key behavior for modals and panels

### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling for all interactive elements
- **Semantic HTML**: Proper use of headings, landmarks, and form elements
- **Live Regions**: Dynamic content updates announced to screen readers
- **Alternative Text**: Descriptive alt text for images and icons

### Visual Accessibility
- **Color Contrast**: WCAG AA compliance for all text and interactive elements
- **Focus Indicators**: High-contrast focus rings for keyboard users
- **Reduced Motion**: Respect for user motion preferences
- **Scalable Text**: Support for browser zoom up to 200%

## Performance Optimizations

### Code Splitting
- **Route-Based Splitting**: Separate bundles for different application sections
- **Component Lazy Loading**: Dynamic imports for heavy components
- **Feature Panel Splitting**: Individual bundles for each feature panel
- **Third-Party Splitting**: Separate vendor bundles for external libraries

### State Optimization
- **Memoization**: React.memo and useMemo for expensive computations
- **State Normalization**: Efficient data structures for complex state
- **Update Batching**: Grouped state updates to minimize re-renders
- **Selective Subscriptions**: Component-specific state subscriptions

### Asset Optimization
- **Image Optimization**: WebP format with fallbacks, responsive images
- **Font Loading**: Optimized web font loading with display swap
- **CSS Optimization**: Critical CSS inlining and unused CSS removal
- **Bundle Compression**: Gzip and Brotli compression for production builds

## Security Considerations

### Content Security
- **XSS Prevention**: Sanitization of user-generated content in resume editor
- **Content Validation**: Server-side validation of all user inputs
- **File Upload Security**: Type validation and size limits for uploaded files
- **DOM Manipulation**: Safe HTML insertion and content replacement

### Data Protection
- **Local Storage**: Encryption of sensitive data in browser storage
- **Session Management**: Secure session handling and timeout policies
- **API Security**: Authentication tokens and request validation
- **Privacy Compliance**: GDPR and privacy regulation adherence

## Rich Text Editor Implementation

### Editor Architecture Options

#### Option 1: Custom Implementation
**Pros**: Full control, lightweight, tailored to resume editing
**Cons**: High development cost, complex state management, browser compatibility issues

#### Option 2: ProseMirror Integration
**Pros**: Mature, extensible, excellent state management, collaborative editing support
**Cons**: Learning curve, larger bundle size, may be overkill for basic resume editing

#### Option 3: Draft.js Integration
**Pros**: React-native, immutable state, good documentation
**Cons**: Facebook deprecated, limited modern features, complex for simple use cases

#### Option 4: Slate.js Integration
**Pros**: React-first, modern architecture, customizable
**Cons**: API instability, smaller community, documentation gaps

**Recommended Approach**: ProseMirror with React wrapper for the best balance of features, stability, and maintainability.

### ProseMirror Integration Design

#### Core Components
```typescript
// Editor wrapper component
interface ProseMirrorEditor {
  schema: Schema;
  state: EditorState;
  view: EditorView;
  plugins: Plugin[];
}

// React integration
interface EditorWrapper {
  content: DocumentNode;
  onChange: (content: DocumentNode) => void;
  plugins: EditorPlugin[];
  readOnly: boolean;
}
```

#### Schema Definition
- **Document Structure**: Define allowed block and inline elements
- **Attributes**: Specify formatting options and constraints
- **Validation**: Ensure content integrity and consistency
- **Serialization**: Convert between ProseMirror and HTML/JSON

#### Plugin System
- **History Plugin**: Undo/redo functionality with proper grouping
- **Keymap Plugin**: Keyboard shortcuts for common operations
- **Input Rules**: Auto-formatting (e.g., markdown-style shortcuts)
- **Collaboration Plugin**: Real-time editing support (future)
- **Spell Check Plugin**: Browser-native or custom spell checking

#### State Management Integration
```typescript
// Bidirectional sync between ProseMirror and React
const useProseMirrorSync = (
  initialContent: DocumentNode,
  onChange: (content: DocumentNode) => void
) => {
  const [editorState, setEditorState] = useState<EditorState>();
  const [view, setView] = useState<EditorView>();
  
  // Sync ProseMirror changes to React state
  const handleTransaction = (tr: Transaction) => {
    const newState = editorState.apply(tr);
    setEditorState(newState);
    
    if (tr.docChanged) {
      const content = serializeToDocumentNode(newState.doc);
      onChange(content);
    }
  };
  
  // Sync React state changes to ProseMirror
  useEffect(() => {
    if (view && hasExternalChanges(initialContent)) {
      const newDoc = parseFromDocumentNode(initialContent);
      const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc);
      view.dispatch(tr);
    }
  }, [initialContent, view]);
};
```

### Advanced Features Implementation

#### Automatic Pagination
- **Page Break Detection**: Calculate content height and insert page breaks
- **Header/Footer Support**: Persistent elements across pages
- **Print Optimization**: Ensure proper page breaks for PDF export

#### Spell Checking
- **Browser Integration**: Use native spell checking APIs where available
- **Custom Dictionary**: Resume-specific terminology and proper nouns
- **Grammar Assistance**: Integration with grammar checking services

#### Collaboration Features
- **Operational Transform**: Conflict resolution for simultaneous edits
- **Presence Awareness**: Show other users' cursors and selections
- **Comment System**: Inline comments and suggestions
- **Version History**: Track document changes over time

## Browser Compatibility

### Supported Browsers
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### Polyfills and Fallbacks
- **CSS Grid**: Flexbox fallbacks for older browsers
- **Modern JavaScript**: Babel transpilation for ES6+ features
- **Web APIs**: Polyfills for newer browser APIs
- **Progressive Enhancement**: Core functionality without JavaScript

## Deployment Considerations

### Build Process
- **Next.js Build**: Optimized production builds with static generation
- **Environment Configuration**: Separate configs for development, staging, production
- **Asset Pipeline**: Automated asset optimization and CDN deployment
- **Bundle Analysis**: Regular bundle size monitoring and optimization

### Monitoring and Analytics
- **Error Tracking**: Real-time error monitoring and alerting
- **Performance Monitoring**: Core Web Vitals and user experience metrics
- **Usage Analytics**: Feature usage tracking and user behavior analysis
- **A/B Testing**: Framework for testing UI variations and improvements