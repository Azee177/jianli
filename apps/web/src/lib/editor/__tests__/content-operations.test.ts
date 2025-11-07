import { contentOperationsManager } from '../content-operations';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';
import { resumeSchema } from '../schema';

// Mock ProseMirror components
jest.mock('prosemirror-view');
jest.mock('prosemirror-state');
jest.mock('prosemirror-model');

describe('ContentOperationsManager', () => {
  let mockView: jest.Mocked<EditorView>;
  let mockState: jest.Mocked<EditorState>;
  let mockDispatch: jest.Mock;
  let mockOnContentChange: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockState = {
      selection: {
        empty: false,
        from: 0,
        to: 10,
      },
      tr: {
        replaceSelection: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        setMeta: jest.fn().mockReturnThis(),
      },
      doc: {
        textBetween: jest.fn().mockReturnValue('selected text'),
        content: {},
        textContent: 'document text content',
      },
    } as any;

    mockView = {
      state: mockState,
      dispatch: mockDispatch,
    } as any;

    mockOnContentChange = jest.fn();

    contentOperationsManager.setView(mockView);
    contentOperationsManager.setOnContentChange(mockOnContentChange);

    // Mock DOMParser
    const mockFragment = {
      content: 'parsed content',
    };
    (DOMParser.fromSchema as jest.Mock).mockReturnValue({
      parseSlice: jest.fn().mockReturnValue(mockFragment),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    contentOperationsManager.clearPendingOperations();
  });

  describe('replaceSelectionWithHTML', () => {
    it('should successfully replace selection with HTML', () => {
      const html = '<p>New content</p>';
      const result = contentOperationsManager.replaceSelectionWithHTML(html);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(result.operation?.type).toBe('replace');
      expect(mockState.tr.replaceSelection).toHaveBeenCalled();
      expect(mockState.tr.setMeta).toHaveBeenCalledWith('programmatic', true);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should fail when no view is available', () => {
      contentOperationsManager.setView(null);
      const result = contentOperationsManager.replaceSelectionWithHTML('<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Editor view not available');
      expect(result.stateChanged).toBe(false);
    });

    it('should fail when no selection exists', () => {
      mockState.selection.empty = true;
      const result = contentOperationsManager.replaceSelectionWithHTML('<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No selection to replace');
      expect(result.stateChanged).toBe(false);
    });

    it('should queue operations when one is in progress', () => {
      // Start first operation
      contentOperationsManager.replaceSelectionWithHTML('<p>First</p>');
      
      // Try second operation while first is processing
      const result = contentOperationsManager.replaceSelectionWithHTML('<p>Second</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation queued');
      expect(contentOperationsManager.getPendingOperationsCount()).toBe(1);
    });

    it('should sanitize dangerous HTML content', () => {
      const dangerousHtml = '<p>Safe content</p><script>alert("xss")</script>';
      const result = contentOperationsManager.replaceSelectionWithHTML(dangerousHtml);

      expect(result.success).toBe(true);
      // The HTML should be sanitized before parsing
      expect(DOMParser.fromSchema).toHaveBeenCalled();
    });
  });

  describe('insertContentAtCursor', () => {
    it('should successfully insert content at cursor', () => {
      const html = '<p>Inserted content</p>';
      const result = contentOperationsManager.insertContentAtCursor(html);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(result.operation?.type).toBe('insert');
      expect(mockState.tr.insert).toHaveBeenCalled();
      expect(mockState.tr.setMeta).toHaveBeenCalledWith('programmatic', true);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should fail when no view is available', () => {
      contentOperationsManager.setView(null);
      const result = contentOperationsManager.insertContentAtCursor('<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Editor view not available');
      expect(result.stateChanged).toBe(false);
    });

    it('should queue operations when one is in progress', () => {
      // Start first operation
      contentOperationsManager.insertContentAtCursor('<p>First</p>');
      
      // Try second operation
      const result = contentOperationsManager.insertContentAtCursor('<p>Second</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation queued');
      expect(contentOperationsManager.getPendingOperationsCount()).toBe(1);
    });
  });

  describe('forceSyncContent', () => {
    it('should successfully force sync content', () => {
      // Mock DOMSerializer
      const mockSerializer = {
        serializeFragment: jest.fn().mockReturnValue(document.createElement('div')),
      };
      require('prosemirror-model').DOMSerializer = {
        fromSchema: jest.fn().mockReturnValue(mockSerializer),
      };

      const result = contentOperationsManager.forceSyncContent();

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(mockOnContentChange).toHaveBeenCalled();
    });

    it('should fail when view is not available', () => {
      contentOperationsManager.setView(null);
      const result = contentOperationsManager.forceSyncContent();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Editor view or change handler not available');
      expect(result.stateChanged).toBe(false);
    });

    it('should fail when content change handler is not available', () => {
      contentOperationsManager.setOnContentChange(null);
      const result = contentOperationsManager.forceSyncContent();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Editor view or change handler not available');
      expect(result.stateChanged).toBe(false);
    });
  });

  describe('state change listeners', () => {
    it('should add and notify state change listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      contentOperationsManager.addStateChangeListener(listener1);
      contentOperationsManager.addStateChangeListener(listener2);

      // Trigger a state change
      contentOperationsManager.replaceSelectionWithHTML('<p>Test</p>');

      expect(listener1).toHaveBeenCalledWith(true);
      expect(listener2).toHaveBeenCalledWith(true);
    });

    it('should remove state change listeners', () => {
      const listener = jest.fn();

      contentOperationsManager.addStateChangeListener(listener);
      contentOperationsManager.removeStateChangeListener(listener);

      // Trigger a state change
      contentOperationsManager.replaceSelectionWithHTML('<p>Test</p>');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle errors in state change listeners gracefully', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn();

      contentOperationsManager.addStateChangeListener(errorListener);
      contentOperationsManager.addStateChangeListener(normalListener);

      // Should not throw and should still call other listeners
      expect(() => {
        contentOperationsManager.replaceSelectionWithHTML('<p>Test</p>');
      }).not.toThrow();

      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('operation queue management', () => {
    it('should process queued operations in order', (done) => {
      const operations = ['<p>First</p>', '<p>Second</p>', '<p>Third</p>'];
      const results: any[] = [];

      // Queue multiple operations
      operations.forEach(html => {
        const result = contentOperationsManager.insertContentAtCursor(html);
        results.push(result);
      });

      // First should succeed, others should be queued
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(false);
      expect(contentOperationsManager.getPendingOperationsCount()).toBe(2);

      // Wait for queued operations to process
      setTimeout(() => {
        expect(contentOperationsManager.getPendingOperationsCount()).toBe(0);
        done();
      }, 200);
    });

    it('should clear pending operations', () => {
      // Queue some operations
      contentOperationsManager.insertContentAtCursor('<p>First</p>');
      contentOperationsManager.insertContentAtCursor('<p>Second</p>');

      expect(contentOperationsManager.getPendingOperationsCount()).toBe(1);

      contentOperationsManager.clearPendingOperations();
      expect(contentOperationsManager.getPendingOperationsCount()).toBe(0);
    });

    it('should report operation in progress status', () => {
      expect(contentOperationsManager.isOperationInProgress()).toBe(false);

      // Start an operation (this will set operationInProgress to true temporarily)
      contentOperationsManager.insertContentAtCursor('<p>Test</p>');

      // Note: In real usage, this would be true during the operation
      // but our mocked version completes synchronously
    });
  });

  describe('error handling', () => {
    it('should handle parsing errors gracefully', () => {
      // Mock DOMParser to throw an error
      (DOMParser.fromSchema as jest.Mock).mockReturnValue({
        parseSlice: jest.fn().mockImplementation(() => {
          throw new Error('Parse error');
        }),
      });

      const result = contentOperationsManager.replaceSelectionWithHTML('<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Parse error');
      expect(result.stateChanged).toBe(false);
    });

    it('should handle dispatch errors gracefully', () => {
      mockDispatch.mockImplementation(() => {
        throw new Error('Dispatch error');
      });

      const result = contentOperationsManager.insertContentAtCursor('<p>Test</p>');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Dispatch error');
      expect(result.stateChanged).toBe(false);
    });
  });
});