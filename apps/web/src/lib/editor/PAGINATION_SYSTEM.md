# Pagination System Documentation

## Overview

The pagination system provides automatic page layout and page break management for the resume editor. It includes automatic pagination, manual page break insertion, page headers/footers, and print optimization.

## Features

### 1. Automatic Pagination
- **Auto-detection**: Automatically detects when content would overflow a page
- **Smart breaks**: Avoids breaking headings and short paragraphs
- **Configurable**: Can be enabled/disabled per document
- **Real-time**: Updates as content changes

### 2. Manual Page Breaks
- **Insert**: Users can manually insert page breaks at any position
- **Toggle**: Toggle page breaks on/off at cursor position
- **Remove**: Remove automatic page breaks while keeping manual ones
- **Visual indicators**: Page breaks are visually indicated in the editor

### 3. Page Layout
- **Multiple formats**: Support for A4 and Letter page sizes
- **Configurable margins**: Adjustable page margins
- **Headers/footers**: Optional page headers and footers with metadata
- **Page numbering**: Automatic page numbering with customizable format

### 4. Print Optimization
- **Print styles**: Optimized CSS for printing
- **Page breaks**: Proper page break handling in print
- **Hidden UI**: UI elements hidden during print
- **Typography**: Print-optimized typography and spacing

## Architecture

### Core Components

#### 1. Pagination Utilities (`pagination.ts`)
```typescript
// Calculate available content height
getContentHeight(styles: DocumentStyles): number

// Find positions where page breaks are needed
findPageBreaks(view: EditorView, styles: DocumentStyles): PageBreakInfo[]

// Insert automatic page breaks
insertPageBreaks(state: EditorState, pageBreaks: PageBreakInfo[]): Transaction

// Calculate pagination state
calculatePagination(view: EditorView, styles: DocumentStyles): PaginationState

// Auto-paginate document
autoPaginate(view: EditorView, styles: DocumentStyles): boolean
```

#### 2. Pagination Commands (`pagination-commands.ts`)
```typescript
// Insert manual page break
insertPageBreakCommand(): EditorCommand

// Remove page break at cursor
removePageBreakCommand(): EditorCommand

// Auto-paginate entire document
autoPaginateCommand(styles: DocumentStyles): EditorCommand

// Remove all automatic page breaks
removeAutomaticPageBreaksCommand(): EditorCommand

// Toggle page break at cursor
togglePageBreakCommand(): EditorCommand
```

#### 3. UI Components
- **PaginatedEditor**: Main wrapper component with pagination logic
- **PageHeader**: Configurable page header with metadata
- **PageFooter**: Configurable page footer with page numbers
- **Pagination controls**: UI controls for pagination management

### Schema Integration

The pagination system extends the ProseMirror schema with a `page_break` node:

```typescript
page_break: {
  group: 'block',
  attrs: {
    type: { default: 'manual' } // 'manual' or 'automatic'
  },
  content: '',
  marks: '',
  atom: true,
  selectable: false,
}
```

## Usage

### Basic Setup

```typescript
import { PaginatedEditor } from './components/editor/PaginatedEditor';
import { EditorWrapper } from './components/editor/EditorWrapper';

function MyEditor() {
  return (
    <EditorWrapper
      content={editorContent}
      onChange={handleChange}
    >
      <PaginatedEditor
        view={view}
        styles={documentStyles}
        metadata={metadata}
        enableAutoPagination={true}
        showHeaders={true}
        showFooters={true}
        showPageNumbers={true}
      >
        {/* Editor content */}
      </PaginatedEditor>
    </EditorWrapper>
  );
}
```

### Command Usage

```typescript
import { CommandType, executeEditorCommand } from './lib/editor/commands';

// Insert page break
executeEditorCommand(CommandType.INSERT_PAGE_BREAK, context);

// Auto-paginate document
executeEditorCommand(CommandType.AUTO_PAGINATE, context, { styles });

// Remove automatic page breaks
executeEditorCommand(CommandType.REMOVE_AUTO_PAGE_BREAKS, context);
```

### Toolbar Integration

The pagination commands are integrated into the FormattingToolbar:

- **Insert Page Break**: FileText icon - Insert manual page break
- **Toggle Page Break**: Scissors icon - Toggle page break at cursor
- **Remove Auto Breaks**: RotateCcw icon - Remove automatic page breaks

## Configuration

### Page Settings

```typescript
interface PageSettings {
  showHeaders: boolean;
  showFooters: boolean;
  showPageNumbers: boolean;
  enableAutoPagination: boolean;
  customHeader?: string;
  customFooter?: string;
}
```

### Document Styles

```typescript
interface DocumentStyles {
  pageSize: 'A4' | 'Letter';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // ... other style properties
}
```

## Page Dimensions

### A4 (210mm × 297mm)
- Width: 794px (at 96 DPI)
- Height: 1123px (at 96 DPI)

### Letter (8.5" × 11")
- Width: 816px (at 96 DPI)
- Height: 1056px (at 96 DPI)

## CSS Classes

### Editor Styles
- `.prose-mirror-editor`: Main editor container
- `.page-break`: Page break styling
- `.page-break[data-type="automatic"]`: Automatic page break styling
- `.page-container`: Individual page container
- `.page-header`: Page header styling
- `.page-footer`: Page footer styling

### Print Styles
- Print-optimized typography and spacing
- Hidden UI elements during print
- Proper page break handling
- Optimized margins and fonts

## Events and Callbacks

### Pagination State Changes
The system provides callbacks for pagination state changes:

```typescript
interface PaginationCallbacks {
  onPageChange?: (currentPage: number, totalPages: number) => void;
  onPaginationUpdate?: (paginationState: PaginationState) => void;
  onPageBreakInsert?: (position: number, type: 'manual' | 'automatic') => void;
}
```

## Performance Considerations

### Debounced Updates
- Pagination calculations are debounced to avoid excessive recalculation
- Default debounce delay: 500ms for auto-pagination
- Immediate updates for manual operations

### Efficient Calculations
- Height calculations use cached DOM measurements
- Page break detection optimized for large documents
- Minimal DOM manipulation during updates

## Browser Compatibility

### Supported Features
- CSS Grid for layout
- CSS `page-break-after` for print
- Modern JavaScript features (ES6+)
- ProseMirror compatibility

### Fallbacks
- Flexbox fallback for older browsers
- Polyfills for missing APIs
- Progressive enhancement approach

## Testing

### Unit Tests
- Pagination utility functions
- Command execution
- Page dimension calculations
- Content height calculations

### Integration Tests
- Full pagination workflow
- Command integration
- UI component interaction
- Print functionality

## Future Enhancements

### Planned Features
1. **Advanced page breaks**: Widow/orphan control
2. **Multi-column layout**: Support for multi-column pages
3. **Page templates**: Customizable page templates
4. **Export optimization**: Better PDF/Word export with pagination
5. **Collaborative editing**: Real-time pagination in collaborative mode

### Performance Improvements
1. **Virtual pagination**: Render only visible pages for large documents
2. **Background calculation**: Web worker for pagination calculations
3. **Caching**: Intelligent caching of pagination state
4. **Lazy loading**: Lazy load page content for better performance

## Troubleshooting

### Common Issues

#### Page breaks not appearing
- Check if auto-pagination is enabled
- Verify document styles are properly configured
- Ensure content height exceeds page height

#### Incorrect page dimensions
- Verify page size setting (A4 vs Letter)
- Check margin configuration
- Ensure DPI calculations are correct

#### Print issues
- Check print CSS media queries
- Verify page break CSS properties
- Test in different browsers

### Debug Tools

```typescript
// Enable pagination debugging
window.paginationDebug = true;

// Log pagination state
console.log(calculatePagination(view, styles));

// Check page break positions
console.log(findPageBreaks(view, styles));
```

## API Reference

See the individual component and utility files for detailed API documentation:

- `pagination.ts` - Core pagination utilities
- `pagination-commands.ts` - Pagination commands
- `PaginatedEditor.tsx` - Main pagination component
- `PageHeader.tsx` - Page header component
- `PageFooter.tsx` - Page footer component