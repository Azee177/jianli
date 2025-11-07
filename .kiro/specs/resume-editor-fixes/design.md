# Design Document

## Overview

This design document outlines the technical approach for fixing critical issues in the Resume Copilot editor interface. The solution focuses on three main areas: implementing seamless automatic pagination, applying a professional dark theme template based on the provided reference design, and restoring full text editing functionality that has disappeared from the frontend.

The design maintains compatibility with the existing ProseMirror-based editor architecture while introducing enhanced pagination logic, comprehensive dark theme styling, and robust editor component initialization.

## Architecture

### Automatic Pagination System

The automatic pagination system will be redesigned to operate transparently without user controls:

```
AutoPaginationEngine
├── ContentMeasurement
│   ├── PageHeightCalculator
│   ├── ContentFlowAnalyzer
│   └── BreakPointDetector
├── PageManagement
│   ├── DynamicPageCreator
│   ├── ContentDistributor
│   └── EmptyPageRemover
└── RealTimeUpdater
    ├── ContentChangeListener
    ├── ReflowTrigger
    └── StatePreserver
```

### Dark Theme Template System

The dark theme implementation will use a structured approach:

```
DarkThemeTemplate
├── ColorSystem
│   ├── BackgroundGradients
│   ├── TextColors
│   └── AccentColors
├── LayoutComponents
│   ├── HeaderSection
│   ├── ProfileImage
│   ├── ContactInfo
│   └── ContentSections
└── TypographySystem
    ├── FontHierarchy
    ├── LineSpacing
    └── SectionDividers
```

### Editor Restoration Architecture

The text editing functionality will be restored through:

```
EditorRestoration
├── ComponentInitialization
│   ├── SelectionToolbar
│   ├── FormattingControls
│   └── EditableAreas
├── StateManagement
│   ├── EditorStateSync
│   ├── SelectionTracking
│   └── ChangeDetection
└── InteractionHandlers
    ├── ClickHandlers
    ├── KeyboardEvents
    └── FocusManagement
```

## Components and Interfaces

### Enhanced Pagination Components

#### AutoPaginationProvider
**Purpose**: Manages automatic pagination without user controls
**Props**:
```typescript
interface AutoPaginationProviderProps {
  content: EditorContent;
  pageHeight: number;
  onPaginationChange: (pages: PageInfo[]) => void;
  children: React.ReactNode;
}

interface PageInfo {
  id: string;
  startOffset: number;
  endOffset: number;
  height: number;
  contentBlocks: BlockNode[];
}
```

#### SeamlessPageContainer
**Purpose**: Renders pages as continuous vertical flow
**Props**:
```typescript
interface SeamlessPageContainerProps {
  pages: PageInfo[];
  darkTheme: boolean;
  onContentChange: (content: EditorContent) => void;
}
```

### Dark Theme Components

#### DarkResumeTemplate
**Purpose**: Implements the dark theme styling based on reference design
**Props**:
```typescript
interface DarkResumeTemplateProps {
  content: ResumeContent;
  profileImage?: string;
  contactInfo: ContactInfo;
  sections: ResumeSection[];
}

interface ResumeContent {
  header: HeaderContent;
  sections: ContentSection[];
  styling: ThemeConfig;
}

interface ThemeConfig {
  background: GradientConfig;
  textColors: ColorPalette;
  spacing: SpacingConfig;
  typography: TypographyConfig;
}

interface GradientConfig {
  primary: string; // Dark purple/black gradient
  secondary: string;
  direction: string;
}

interface ColorPalette {
  primary: string; // White text
  secondary: string; // Light gray
  accent: string; // Highlight colors
  divider: string; // Section separators
}
```

#### ProfileSection
**Purpose**: Renders the circular profile image with "HELLO" branding
**Props**:
```typescript
interface ProfileSectionProps {
  name: string;
  image?: string;
  contactInfo: ContactInfo;
  theme: ThemeConfig;
}

interface ContactInfo {
  gender?: string;
  birthDate?: string;
  location?: string;
  phone?: string;
  email?: string;
  position?: string;
  experience?: string;
  expectedSalary?: string;
}
```

### Restored Editor Components

#### EnhancedSelectionToolbar
**Purpose**: Fully functional floating toolbar for text selection
**Props**:
```typescript
interface EnhancedSelectionToolbarProps {
  selection: SelectionInfo;
  onAction: (action: EditingAction) => void;
  visible: boolean;
  position: ToolbarPosition;
  darkTheme: boolean;
}

interface EditingAction {
  type: 'polish' | 'star' | 'quantify' | 'mirror' | 'translate';
  payload?: any;
}

interface ToolbarPosition {
  x: number;
  y: number;
  alignment: 'top' | 'bottom' | 'left' | 'right';
}
```

#### RestoreEditorCore
**Purpose**: Ensures all editing functionality is properly initialized
**Props**:
```typescript
interface RestoreEditorCoreProps {
  initialContent: EditorContent;
  onContentChange: (content: EditorContent) => void;
  onSelectionChange: (selection: SelectionInfo) => void;
  darkTheme: boolean;
  autoSave: boolean;
}
```

## Data Models

### Pagination Data Types

```typescript
interface AutoPaginationConfig {
  pageHeight: number; // A4 height in pixels
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  automaticBreaks: boolean; // Always true
  intelligentBreaking: boolean; // Avoid orphans/widows
}

interface PageBreakInfo {
  pageNumber: number;
  breakPoint: number; // Character offset
  breakType: 'automatic' | 'section' | 'intelligent';
  contentBefore: BlockNode[];
  contentAfter: BlockNode[];
}

interface ContentFlowState {
  totalPages: number;
  currentPage: number;
  pageBreaks: PageBreakInfo[];
  overflowContent: BlockNode[];
  lastUpdateTimestamp: number;
}
```

### Dark Theme Data Types

```typescript
interface DarkThemeColors {
  background: {
    primary: '#1a1a2e'; // Dark purple
    secondary: '#16213e'; // Darker blue
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  };
  text: {
    primary: '#ffffff'; // White
    secondary: '#e0e0e0'; // Light gray
    muted: '#b0b0b0'; // Muted gray
  };
  accent: {
    divider: '#ffffff'; // White divider lines
    highlight: '#4a9eff'; // Blue accent
  };
}

interface TemplateLayout {
  header: {
    height: number;
    profileImageSize: number;
    namePosition: 'right' | 'below';
    contactLayout: 'horizontal' | 'vertical';
  };
  sections: {
    spacing: number;
    dividerStyle: 'line' | 'space';
    titleStyle: 'bold' | 'normal';
  };
  typography: {
    nameFont: FontConfig;
    sectionFont: FontConfig;
    contentFont: FontConfig;
  };
}

interface FontConfig {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing?: number;
}
```

### Editor Restoration Data Types

```typescript
interface EditorComponentState {
  selectionToolbar: {
    initialized: boolean;
    visible: boolean;
    position: ToolbarPosition;
    availableActions: EditingAction[];
  };
  formattingControls: {
    initialized: boolean;
    activeFormats: TextMark[];
    availableFormats: FormatOption[];
  };
  editableAreas: {
    initialized: boolean;
    activeArea: string | null;
    cursorPosition: EditorPosition;
  };
}

interface RestorationStatus {
  componentsLoaded: boolean;
  stateInitialized: boolean;
  eventHandlersAttached: boolean;
  interactionEnabled: boolean;
  lastRestorationAttempt: number;
  errors: RestorationError[];
}

interface RestorationError {
  component: string;
  error: string;
  timestamp: number;
  resolved: boolean;
}
```

## Implementation Strategy

### Phase 1: Automatic Pagination Implementation

1. **Remove Manual Controls**: Eliminate all pagination buttons and controls from the UI
2. **Implement Content Measurement**: Create system to measure content height and determine page breaks
3. **Add Real-time Reflow**: Implement automatic page adjustment as content changes
4. **Optimize Performance**: Ensure pagination calculations don't impact editing performance

### Phase 2: Dark Theme Template Application

1. **Extract Design Colors**: Analyze the provided reference image for exact color values
2. **Create Theme System**: Build comprehensive dark theme configuration
3. **Implement Template Components**: Create header, profile, and section components
4. **Apply Responsive Styling**: Ensure theme works across different screen sizes

### Phase 3: Editor Functionality Restoration

1. **Diagnose Missing Components**: Identify which editor components are not rendering
2. **Fix Initialization Issues**: Ensure proper component mounting and state initialization
3. **Restore Selection Tools**: Make floating toolbar and editing actions fully functional
4. **Test Interaction Flow**: Verify all editing workflows work correctly

### Phase 4: Integration and Testing

1. **Combine Systems**: Integrate automatic pagination with dark theme and restored editor
2. **Cross-component Testing**: Ensure all systems work together seamlessly
3. **Performance Optimization**: Optimize for smooth editing experience
4. **User Experience Polish**: Fine-tune interactions and visual feedback

## Error Handling

### Pagination Error Handling
- **Content Overflow**: Gracefully handle content that exceeds maximum page limits
- **Calculation Errors**: Fallback to simple page breaks if intelligent breaking fails
- **Performance Issues**: Throttle pagination calculations during rapid content changes

### Theme Application Errors
- **Missing Assets**: Provide fallback styling if theme resources fail to load
- **Color Contrast Issues**: Ensure minimum contrast ratios are maintained
- **Layout Breakage**: Detect and recover from CSS layout issues

### Editor Restoration Errors
- **Component Mounting Failures**: Retry initialization with exponential backoff
- **State Synchronization Issues**: Implement conflict resolution for state mismatches
- **Event Handler Failures**: Gracefully degrade functionality if handlers fail to attach

## Testing Strategy

### Automatic Pagination Testing
- **Content Flow Tests**: Verify content distributes correctly across pages
- **Performance Tests**: Ensure pagination doesn't impact editing responsiveness
- **Edge Case Tests**: Test with very long content, empty content, and rapid changes

### Dark Theme Testing
- **Visual Regression Tests**: Compare rendered output with reference design
- **Accessibility Tests**: Verify color contrast and readability
- **Cross-browser Tests**: Ensure consistent appearance across browsers

### Editor Restoration Testing
- **Component Initialization Tests**: Verify all editor components load correctly
- **Interaction Tests**: Test all editing actions and toolbar functionality
- **State Management Tests**: Verify proper synchronization between editor and display

## Performance Considerations

### Pagination Performance
- **Lazy Calculation**: Only calculate page breaks when content changes
- **Debounced Updates**: Batch pagination updates to avoid excessive recalculation
- **Virtual Scrolling**: Consider virtual scrolling for very long documents

### Theme Performance
- **CSS Optimization**: Use efficient selectors and minimize style recalculation
- **Asset Loading**: Optimize font and image loading for dark theme
- **Render Optimization**: Minimize repaints when applying theme changes

### Editor Performance
- **Component Memoization**: Use React.memo for expensive editor components
- **Event Throttling**: Throttle selection and input events to maintain responsiveness
- **State Optimization**: Optimize editor state updates to minimize re-renders

## Accessibility Considerations

### Dark Theme Accessibility
- **Color Contrast**: Ensure WCAG AA compliance for all text on dark backgrounds
- **High Contrast Mode**: Support system high contrast preferences
- **Color Blindness**: Ensure information isn't conveyed through color alone

### Editor Accessibility
- **Keyboard Navigation**: Ensure all editing functions are keyboard accessible
- **Screen Reader Support**: Provide proper ARIA labels for editing controls
- **Focus Management**: Maintain clear focus indicators throughout editing workflow

### Pagination Accessibility
- **Page Navigation**: Provide accessible ways to navigate between pages
- **Content Structure**: Maintain semantic structure across page boundaries
- **Print Accessibility**: Ensure automatic pagination works well with assistive technologies