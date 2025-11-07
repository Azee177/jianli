# Structured Document Model and Serialization System

This module provides a comprehensive structured document model and serialization system for the Resume Copilot rich text editor. It implements a Word-like editing experience with proper state management, validation, and migration capabilities.

## Overview

The system consists of several key components:

- **Document Model**: Hierarchical structure representing document content
- **Serialization**: Convert between different formats (ProseMirror, HTML, JSON)
- **Validation**: Ensure document integrity and content consistency
- **Migration**: Convert legacy resume content to the new format
- **Document Utilities**: Helper functions for document manipulation

## Document Structure

### Core Types

```typescript
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
```

### Example Document

```typescript
const document: DocumentNode = {
  type: 'document',
  children: [
    {
      type: 'heading',
      id: 'block_1',
      children: [
        {
          type: 'text',
          content: 'John Doe',
          marks: [{ type: 'bold' }],
        },
      ],
      attributes: { level: 1 },
    },
    {
      type: 'paragraph',
      id: 'block_2',
      children: [
        {
          type: 'text',
          content: 'Software Engineer with experience in ',
          marks: [],
        },
        {
          type: 'text',
          content: 'React',
          marks: [{ type: 'bold' }],
        },
      ],
      attributes: {},
    },
  ],
  styles: defaultDocumentStyles,
};
```

## Serialization

### Format Conversion

```typescript
import {
  documentNodeToHTML,
  htmlToDocumentNode,
  documentNodeToJSON,
  jsonToDocumentNode,
  proseMirrorToDocumentNode,
  documentNodeToProseMirror,
} from './serialization';

// Convert to HTML
const html = documentNodeToHTML(document);

// Convert from HTML
const docFromHtml = htmlToDocumentNode(html);

// Convert to JSON
const json = documentNodeToJSON(document);

// Convert from JSON
const docFromJson = jsonToDocumentNode(json);

// ProseMirror integration
const pmDoc = documentNodeToProseMirror(document);
const docFromPM = proseMirrorToDocumentNode(pmDoc);
```

### Complete Editor Content

```typescript
import { createEditorContent } from './serialization';

const editorContent = createEditorContent(document, {
  title: 'My Resume',
  author: 'John Doe',
});

// editorContent contains:
// - document: DocumentNode
// - html: string
// - plainText: string
// - metadata: DocumentMetadata
```

## Validation

### Document Validation

```typescript
import { validateDocument } from './validation';

const result = validateDocument(editorContent);

if (result.isValid) {
  console.log('Document is valid');
} else {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

### Validation Features

- **Structure Validation**: Ensures proper document hierarchy
- **Content Validation**: Checks for consistency between formats
- **Reference Validation**: Validates links and image sources
- **Format Validation**: Checks heading levels and formatting consistency

## Migration

### Legacy Content Migration

```typescript
import { migrateResumeContent } from './migration';

// Migrate HTML content
const htmlResult = migrateResumeContent({
  html: '<h1>John Doe</h1><p>Software Engineer</p>',
  format: 'html',
});

// Migrate plain text
const textResult = migrateResumeContent({
  content: 'John Doe\n\nSoftware Engineer',
  format: 'plain',
});

// Migrate Markdown
const markdownResult = migrateResumeContent({
  content: '# John Doe\n\nSoftware Engineer',
  format: 'markdown',
});

if (htmlResult.success) {
  const document = htmlResult.document;
  // Use migrated document
}
```

### Supported Migration Formats

- **HTML**: Full HTML with formatting preservation
- **Plain Text**: Automatic paragraph detection
- **Markdown**: Basic Markdown syntax support
- **JSON**: Structured data formats
- **Legacy Sections**: Section-based resume formats

## Document Utilities

### Creating Documents

```typescript
import {
  createEmptyDocument,
  createHeading,
  createParagraph,
  createList,
} from './document-utils';

// Create empty document
const document = createEmptyDocument();

// Create content blocks
const heading = createHeading('John Doe', 1);
const paragraph = createParagraph('Software Engineer');
const skills = createList(['React', 'TypeScript', 'Node.js']);
```

### Document Manipulation

```typescript
import {
  insertBlock,
  removeBlock,
  replaceBlock,
  findBlockById,
} from './document-utils';

// Insert block at position
const newDoc = insertBlock(document, heading, 0);

// Remove block by ID
const withoutBlock = removeBlock(document, 'block_1');

// Replace block
const replaced = replaceBlock(document, 'block_1', newHeading);

// Find block
const block = findBlockById(document, 'block_1');
```

### Document Analysis

```typescript
import {
  getDocumentStats,
  extractTextContent,
  countWords,
  createDocumentOutline,
} from './document-utils';

// Get statistics
const stats = getDocumentStats(document);
// Returns: { blocks, paragraphs, headings, lists, words, characters }

// Extract text
const text = extractTextContent(document);

// Count words
const wordCount = countWords(document);

// Create outline
const outline = createDocumentOutline(document);
// Returns: [{ level: 1, text: 'John Doe', id: 'block_1' }]
```

## ProseMirror Integration

### Schema Definition

The system uses a custom ProseMirror schema that supports:

- **Basic Nodes**: paragraph, heading, text
- **List Support**: bullet_list, ordered_list, list_item
- **Marks**: strong, em, underline, strikethrough, highlight, textColor
- **Custom Attributes**: alignment, indentation, heading levels

### State Synchronization

```typescript
import { useProseMirrorSync } from './useProseMirrorSync';

const MyEditor = () => {
  const [document, setDocument] = useState(createEmptyDocument());
  
  const { editorState, view } = useProseMirrorSync(
    document,
    setDocument
  );
  
  // Editor automatically syncs between ProseMirror and React state
};
```

## Error Handling

### Validation Errors

```typescript
interface ValidationError {
  type: 'structure' | 'content' | 'reference' | 'format';
  message: string;
  path?: string;
  severity: 'error' | 'warning';
}
```

### Migration Errors

```typescript
interface MigrationResult {
  success: boolean;
  document: DocumentNode | null;
  errors: string[];
  warnings: string[];
  originalFormat: string;
}
```

## Performance Considerations

### Optimization Features

- **Lazy Loading**: Heavy components are loaded on demand
- **Memoization**: Expensive operations are cached
- **Efficient Serialization**: Minimal data transformation overhead
- **Incremental Updates**: Only changed parts are re-processed

### Best Practices

1. **Use Document Utilities**: Prefer utility functions over manual manipulation
2. **Validate Early**: Run validation before critical operations
3. **Handle Errors**: Always check migration and validation results
4. **Clean Documents**: Use `cleanupDocument()` to remove empty blocks
5. **Batch Operations**: Group multiple changes for better performance

## Examples

See `examples.ts` for comprehensive usage examples including:

- Creating sample resume documents
- Serialization round-trips
- Migration from different formats
- Document validation
- Programmatic document manipulation

## Testing

The system includes comprehensive validation and error handling:

```typescript
// Run examples to test functionality
import { runExamples } from './examples';
runExamples();

// Test specific functionality
import { demonstrateSerializationRoundTrip } from './examples';
const results = demonstrateSerializationRoundTrip();
```

## Integration with Resume Editor

This system integrates with the main resume editor through:

1. **EditorWrapper Component**: Uses ProseMirror integration
2. **State Management**: Syncs with React component state
3. **Selection Tools**: Works with floating toolbar and editing actions
4. **Content Persistence**: Handles save/load operations
5. **Export Functions**: Generates final resume formats

## Future Enhancements

Planned improvements include:

- **Collaborative Editing**: Real-time multi-user support
- **Advanced Tables**: Complex table editing capabilities
- **Custom Styles**: User-defined formatting options
- **Template System**: Pre-built resume templates
- **Export Formats**: Additional output formats (PDF, DOCX)
- **Performance Optimization**: Further speed improvements
- **Accessibility**: Enhanced screen reader support