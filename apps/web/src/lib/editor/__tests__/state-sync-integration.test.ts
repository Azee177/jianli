import { stateSyncManager } from '../state-sync';
import { contentOperationsManager } from '../content-operations';
import { EditorContent } from '../../../types/editor';

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('State Synchronization Integration Tests', () => {
  let mockEditorContent: EditorContent;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue('test-session-id');

    mockEditorContent = {
      document: {
        type: 'document',
        children: [
          {
            type: 'paragraph',
            id: 'block-1',
            children: [
              {
                type: 'text',
                content: 'Test content',
                marks: [],
              },
            ],
            attributes: {},
          },
        ],
        styles: {
          pageSize: 'A4',
          margins: { top: 32, right: 32, bottom: 32, left: 32 },
          defaultFont: {
            family: 'Arial',
            size: 14,
            weight: 400,
          },
          headingStyles: {},
          paragraphStyles: {},
        },
      },
      html: '<p>Test content</p>',
      plainText: 'Test content',
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        version: 1,
      },
    };
  });

  describe('Cross-tab synchronization', () => {
    it('should handle storage events from other tabs', (done) => {
      const listener = jest.fn();
      stateSyncManager.addSyncListener(listener);

      // Simulate storage event from another tab
      const newContent = {
        ...mockEditorContent,
        html: '<p>Updated from another tab</p>',
        metadata: { ...mockEditorContent.metadata, version: 2 },
      };

      const saveData = {
        content: newContent,
        timestamp: Date.now(),
        version: 2,
        checksum: 'test-checksum',
        sessionId: 'other-session',
      };

      // Mock the storage event
      const storageEvent = new StorageEvent('storage', {
        key: 'resume-editor-content',
        newValue: JSON.stringify(saveData),
        oldValue: null,
        storageArea: localStorage,
      });

      window.dispatchEvent(storageEvent);

      // Wait for event processing
      setTimeout(() => {
        expect(listener).toHaveBeenCalledWith(newContent);
        done();
      }, 100);
    });

    it('should handle malformed storage events gracefully', () => {
      const listener = jest.fn();
      stateSyncManager.addSyncListener(listener);

      // Simulate malformed storage event
      const storageEvent = new StorageEvent('storage', {
        key: 'resume-editor-content',
        newValue: 'invalid json',
        oldValue: null,
        storageArea: localStorage,
      });

      expect(() => {
        window.dispatchEvent(storageEvent);
      }).not.toThrow();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Network state transitions', () => {
    it('should handle online/offline transitions', () => {
      const syncListener = jest.fn();
      stateSyncManager.addSyncListener(syncListener);

      // Save content while online
      const result1 = stateSyncManager.saveContent(mockEditorContent);
      expect(result1.success).toBe(true);

      // Go offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));

      // Save content while offline (should still work locally)
      const offlineContent = {
        ...mockEditorContent,
        html: '<p>Offline content</p>',
      };
      const result2 = stateSyncManager.saveContent(offlineContent);
      expect(result2.success).toBe(true);

      // Come back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      
      // Mock stored content for sync
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        content: offlineContent,
        timestamp: Date.now(),
        version: 1,
        checksum: 'test-checksum',
      }));

      window.dispatchEvent(new Event('online'));

      // Should trigger sync
      setTimeout(() => {
        expect(syncListener).toHaveBeenCalled();
      }, 100);
    });
  });

  describe('Concurrent editing scenarios', () => {
    it('should detect and resolve concurrent editing conflicts', () => {
      const conflictHandler = jest.fn();
      stateSyncManager.addConflictHandler(conflictHandler);

      // Session 1 saves content
      sessionStorageMock.getItem.mockReturnValue('session-1');
      const content1 = {
        ...mockEditorContent,
        html: '<p>Session 1 content</p>',
        metadata: { ...mockEditorContent.metadata, modifiedAt: new Date() },
      };
      
      const saveData1 = {
        content: content1,
        timestamp: Date.now(),
        version: 1,
        checksum: 'checksum-1',
        sessionId: 'session-1',
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(saveData1));
      const result1 = stateSyncManager.saveContent(content1);
      expect(result1.success).toBe(true);

      // Session 2 tries to save content immediately (concurrent editing)
      sessionStorageMock.getItem.mockReturnValue('session-2');
      const content2 = {
        ...mockEditorContent,
        html: '<p>Session 2 content</p>',
        metadata: { ...mockEditorContent.metadata, modifiedAt: new Date() },
      };

      const result2 = stateSyncManager.saveContent(content2);
      expect(result2.success).toBe(false);
      expect(result2.conflict).toBeDefined();
      expect(result2.conflict?.type).toBe('concurrent');
      expect(conflictHandler).toHaveBeenCalled();
    });

    it('should resolve conflicts by choosing the correct version', () => {
      // Create a conflict scenario
      const localContent = {
        ...mockEditorContent,
        html: '<p>Local changes</p>',
        metadata: { ...mockEditorContent.metadata, version: 1 },
      };

      const remoteContent = {
        ...mockEditorContent,
        html: '<p>Remote changes</p>',
        metadata: { ...mockEditorContent.metadata, version: 2 },
      };

      // Save remote content first
      stateSyncManager.saveContent(remoteContent);

      // Try to save local content (should create conflict)
      const result = stateSyncManager.saveContent(localContent);
      expect(result.conflict).toBeDefined();

      // Resolve conflict choosing remote version
      const resolved = stateSyncManager.resolveConflict(0, false);
      expect(resolved).toBe(true);

      // Verify remote content is preserved
      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.content?.html).toBe('<p>Remote changes</p>');
    });
  });

  describe('Data corruption and recovery', () => {
    it('should recover from corrupted main storage using backup', () => {
      // Set up valid backup
      const backupData = {
        content: mockEditorContent,
        timestamp: Date.now(),
        version: 1,
        checksum: 'backup-checksum',
        backupTimestamp: Date.now(),
      };

      localStorageMock.getItem
        .mockReturnValueOnce('corrupted data') // Main storage corrupted
        .mockReturnValueOnce(JSON.stringify(backupData)); // Backup is valid

      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.success).toBe(true);
      expect(loadResult.recoveredFromBackup).toBe(true);
      expect(loadResult.content).toEqual(mockEditorContent);
    });

    it('should handle complete data loss gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.success).toBe(true);
      expect(loadResult.content).toBeNull();
    });

    it('should repair and save corrupted content', () => {
      const corruptedContent = {
        ...mockEditorContent,
        html: '', // Missing HTML
        document: null, // Missing document
        metadata: null, // Missing metadata
      };

      const result = stateSyncManager.saveContent(corruptedContent);
      expect(result.success).toBe(true);

      // Content should be repaired during save
      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.content?.html).toBeTruthy();
      expect(loadResult.content?.document).toBeTruthy();
      expect(loadResult.content?.metadata).toBeTruthy();
    });
  });

  describe('Performance and memory management', () => {
    it('should handle rapid successive saves without memory leaks', () => {
      const contents = Array.from({ length: 100 }, (_, i) => ({
        ...mockEditorContent,
        html: `<p>Content ${i}</p>`,
        metadata: { ...mockEditorContent.metadata, version: i + 1 },
      }));

      // Save all contents rapidly
      const results = contents.map(content => stateSyncManager.saveContent(content));

      // All should succeed (or be queued)
      expect(results.every(r => r.success || r.error === 'Sync in progress, content queued')).toBe(true);

      // Final content should be the last one
      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.content?.html).toBe('<p>Content 99</p>');
    });

    it('should clean up listeners properly', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const conflictHandler = jest.fn();

      stateSyncManager.addSyncListener(listener1);
      stateSyncManager.addSyncListener(listener2);
      stateSyncManager.addConflictHandler(conflictHandler);

      // Remove listeners
      stateSyncManager.removeSyncListener(listener1);
      stateSyncManager.removeConflictHandler(conflictHandler);

      // Trigger events
      stateSyncManager.saveContent(mockEditorContent);

      // Only listener2 should be called
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(conflictHandler).not.toHaveBeenCalled();
    });
  });

  describe('Integration with content operations', () => {
    it('should sync state after programmatic content operations', () => {
      const mockView = {
        state: {
          selection: { empty: false, from: 0, to: 5 },
          tr: {
            replaceSelection: jest.fn().mockReturnThis(),
            setMeta: jest.fn().mockReturnThis(),
          },
          doc: {
            textContent: 'test content',
            content: {},
          },
        },
        dispatch: jest.fn(),
      } as any;

      const mockOnContentChange = jest.fn();

      contentOperationsManager.setView(mockView);
      contentOperationsManager.setOnContentChange(mockOnContentChange);

      // Mock DOMParser
      const mockFragment = { content: 'parsed content' };
      require('prosemirror-model').DOMParser = {
        fromSchema: jest.fn().mockReturnValue({
          parseSlice: jest.fn().mockReturnValue(mockFragment),
        }),
      };

      // Perform content operation
      const result = contentOperationsManager.replaceSelectionWithHTML('<p>New content</p>');

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(mockView.dispatch).toHaveBeenCalled();
    });

    it('should handle operation queue during sync conflicts', () => {
      const mockView = {
        state: {
          selection: { empty: false, from: 0, to: 5 },
          tr: {
            insert: jest.fn().mockReturnThis(),
            setMeta: jest.fn().mockReturnThis(),
          },
        },
        dispatch: jest.fn(),
      } as any;

      contentOperationsManager.setView(mockView);

      // Start multiple operations
      const result1 = contentOperationsManager.insertContentAtCursor('<p>First</p>');
      const result2 = contentOperationsManager.insertContentAtCursor('<p>Second</p>');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false); // Queued
      expect(contentOperationsManager.getPendingOperationsCount()).toBe(1);
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle localStorage quota exceeded', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const result = stateSyncManager.saveContent(mockEditorContent);
      expect(result.success).toBe(false);
      expect(result.error).toBe('QuotaExceededError');
    });

    it('should handle invalid JSON in storage', () => {
      localStorageMock.getItem.mockReturnValue('{"invalid": json}');

      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toBeTruthy();
    });

    it('should handle missing required fields in stored data', () => {
      const invalidData = {
        // Missing content field
        timestamp: Date.now(),
        version: 1,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.success).toBe(false);
      expect(loadResult.recoveredFromBackup).toBe(false);
    });

    it('should handle checksum validation failures', () => {
      const saveData = {
        content: mockEditorContent,
        timestamp: Date.now(),
        version: 1,
        checksum: 'wrong-checksum',
      };

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(saveData)) // Main storage with wrong checksum
        .mockReturnValueOnce(null); // No backup available

      const loadResult = stateSyncManager.loadContent();
      expect(loadResult.success).toBe(false);
      expect(loadResult.recoveredFromBackup).toBe(false);
    });
  });
});