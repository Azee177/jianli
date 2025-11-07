// Rich Text Editor Types for ProseMirror integration

export interface EditorContent {
  document: DocumentNode;
  html: string;
  plainText: string;
  metadata: DocumentMetadata;
}

// Validation and migration types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'structure' | 'content' | 'reference' | 'format';
  message: string;
  path?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning';
  suggestion?: string;
}

export interface MigrationResult {
  success: boolean;
  document: DocumentNode | null;
  errors: string[];
  warnings: string[];
  originalFormat: string;
}

export interface DocumentNode {
  type: 'document';
  children: BlockNode[];
  styles: DocumentStyles;
}

export interface BlockNode {
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'pageBreak' | 'page_break';
  id: string;
  children: InlineNode[];
  attributes: BlockAttributes;
}

export interface InlineNode {
  type: 'text' | 'link' | 'image';
  content: string;
  marks: TextMark[];
}

export interface TextMark {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'highlight' | 'color';
  attributes?: Record<string, any>;
}

export interface BlockAttributes {
  level?: number; // for headings
  listType?: 'bullet' | 'ordered'; // for lists
  alignment?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
  [key: string]: any;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  version?: number;
}

export interface DocumentStyles {
  pageSize: 'A4' | 'Letter';
  margins: Margins;
  defaultFont: FontSettings;
  headingStyles: Record<number, TextStyle>;
  paragraphStyles: Record<string, ParagraphStyle>;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FontSettings {
  family: string;
  size: number;
  weight: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  color: string;
  textDecoration: string[];
}

export interface ParagraphStyle extends TextStyle {
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  indentLeft: number;
  indentRight: number;
}

export interface EditorRange {
  start: EditorPosition;
  end: EditorPosition;
  collapsed: boolean;
}

export interface EditorPosition {
  blockId: string;
  offset: number;
}

export interface EditorCommand {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
  description?: string;
  groupId?: string; // For grouping related commands
}

export interface EditorHistory {
  undoStack: EditorCommand[];
  redoStack: EditorCommand[];
  currentIndex: number;
}

export interface CommandGroup {
  id: string;
  description: string;
  commands: EditorCommand[];
  timestamp: number;
}

// Command execution context
export interface CommandContext {
  state: any; // EditorState from ProseMirror
  dispatch?: (tr: any) => void; // Transaction dispatcher
  view?: any; // EditorView from ProseMirror
}

// Command execution result
export interface CommandResult {
  success: boolean;
  error?: string;
  transaction?: any; // ProseMirror Transaction
}

export interface SelectionInfo {
  rect: DOMRect;
  text: string;
  range: EditorRange;
  blocks: BlockNode[];
}

// Pagination types
export interface PageInfo {
  pageNumber: number;
  startPos: number;
  endPos: number;
  height: number;
  hasPageBreak: boolean;
}

export interface PaginationState {
  pages: PageInfo[];
  totalPages: number;
  currentPage: number;
  pageHeight: number;
  contentHeight: number;
}

export interface PageBreakInfo {
  position: number;
  type: 'automatic' | 'manual';
  reason?: string;
}

export interface PageSettings {
  showHeaders: boolean;
  showFooters: boolean;
  showPageNumbers: boolean;
  enableAutoPagination: boolean;
  customHeader?: string;
  customFooter?: string;
}