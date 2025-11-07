import { renderHook, act } from '@testing-library/react';
import { useStateSyncConflicts } from '../useStateSyncConflicts';
import { stateSyncManager, StateConflict } from '../state-sync';
import { EditorContent } from '../../../types/editor';

// Mock the state sync manager
jest.mock('../state-sync');

describe('useStateSyncConflicts', () => {
  let mockStateSyncManager: jest.Mocked<typeof stateSyncManager>;
  let mockConflict: StateConflict;
  let mockEditorContent: EditorContent;

  beforeEach(() => {
    mockStateSyncManager = stateSyncManager as jest.Mocked<typeof stateSyncManager>;
    
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
        createdAt: new Date('2023-01-01'),
        modifiedAt: new Date('2023-01-01'),
        version: 1,
      },
    };

    mockConflict = {
      type: 'version',
      localContent: {
        ...mockEditorContent,
        html: '<p>Local content</p>',
        plainText: 'Local content',
        metadata: { ...mockEditorContent.metadata, version: 1 },
      },
      remoteContent: {
        ...mockEditorContent,
        html: '<p>Remote content</p>',
        plainText: 'Remote content',
        metadata: { ...mockEditorContent.metadata, version: 2 },
      },
      conflictTime: new Date('2023-01-02'),
    };

    // Reset mocks
    jest.clearAllMocks();
    mockStateSyncManager.getStoredConflicts.mockReturnValue([]);
    mockStateSyncManager.addConflictHandler.mockImplementation(() => {});
    mockStateSyncManager.removeConflictHandler.mockImplementation(() => {});
    mockStateSyncManager.resolveConflict.mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should load existing conflicts on mount', () => {
      const existingConflicts = [mockConflict];
      mockStateSyncManager.getStoredConflicts.mockReturnValue(existingConflicts);

      const { result } = renderHook(() => useStateSyncConflicts());

      expect(result.current.conflicts).toEqual(existingConflicts);
      expect(result.current.hasConflicts).toBe(true);
    });

    it('should register and unregister conflict handler', () => {
      const { unmount } = renderHook(() => useStateSyncConflicts());

      expect(mockStateSyncManager.addConflictHandler).toHaveBeenCalledWith(
        expect.any(Function)
      );

      unmount();

      expect(mockStateSyncManager.removeConflictHandler).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('conflict handling', () => {
    it('should add new conflicts to state', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Get the conflict handler that was registered
      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];

      act(() => {
        conflictHandler(mockConflict);
      });

      expect(result.current.conflicts).toContain(mockConflict);
      expect(result.current.hasConflicts).toBe(true);
    });

    it('should auto-resolve conflicts when enabled', (done) => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Enable auto-resolve
      act(() => {
        result.current.toggleAutoResolve();
      });

      expect(result.current.autoResolveEnabled).toBe(true);

      // Get the conflict handler
      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];

      act(() => {
        conflictHandler(mockConflict);
      });

      // Auto-resolve should trigger after a delay
      setTimeout(() => {
        expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledWith(0, true);
        done();
      }, 1100);
    });
  });

  describe('conflict resolution', () => {
    it('should resolve individual conflicts', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Add a conflict first
      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];
      act(() => {
        conflictHandler(mockConflict);
      });

      // Resolve the conflict
      act(() => {
        const success = result.current.resolveConflict(0, true);
        expect(success).toBe(true);
      });

      expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledWith(0, true);
      expect(result.current.conflicts).toHaveLength(0);
      expect(result.current.lastResolvedConflict).toEqual(mockConflict);
    });

    it('should handle invalid conflict indices', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      act(() => {
        const success = result.current.resolveConflict(999, true);
        expect(success).toBe(false);
      });

      expect(mockStateSyncManager.resolveConflict).not.toHaveBeenCalled();
    });

    it('should resolve conflicts using function indices', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Add conflicts
      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];
      act(() => {
        conflictHandler(mockConflict);
        conflictHandler({ ...mockConflict, type: 'timestamp' });
      });

      // Resolve using function
      act(() => {
        result.current.resolveConflict(
          (conflicts) => conflicts.findIndex(c => c.type === 'timestamp'),
          false
        );
      });

      expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledWith(1, false);
    });
  });

  describe('batch resolution', () => {
    beforeEach(() => {
      // Mock multiple conflicts
      const conflicts = [
        { ...mockConflict, type: 'version' as const },
        { ...mockConflict, type: 'timestamp' as const },
        { ...mockConflict, type: 'concurrent' as const },
      ];

      mockStateSyncManager.getStoredConflicts
        .mockReturnValueOnce(conflicts) // Initial load
        .mockReturnValue([]); // After resolution
    });

    it('should resolve all conflicts with local strategy', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      act(() => {
        const resolved = result.current.resolveAllConflicts('local');
        expect(resolved).toBe(3);
      });

      expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledTimes(3);
      expect(mockStateSyncManager.resolveConflict).toHaveBeenNthCalledWith(1, 0, true);
      expect(mockStateSyncManager.resolveConflict).toHaveBeenNthCalledWith(2, 0, true);
      expect(mockStateSyncManager.resolveConflict).toHaveBeenNthCalledWith(3, 0, true);
    });

    it('should resolve all conflicts with remote strategy', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      act(() => {
        result.current.resolveAllConflicts('remote');
      });

      expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledTimes(3);
      // All should use remote (false)
      expect(mockStateSyncManager.resolveConflict).toHaveBeenNthCalledWith(1, 0, false);
      expect(mockStateSyncManager.resolveConflict).toHaveBeenNthCalledWith(2, 0, false);
      expect(mockStateSyncManager.resolveConflict).toHaveBeenNthCalledWith(3, 0, false);
    });

    it('should resolve all conflicts with newest strategy', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Mock conflicts with different timestamps
      const newerLocal = {
        ...mockConflict,
        localContent: {
          ...mockConflict.localContent,
          metadata: { ...mockConflict.localContent.metadata, modifiedAt: new Date('2023-01-03') },
        },
        remoteContent: {
          ...mockConflict.remoteContent,
          metadata: { ...mockConflict.remoteContent.metadata, modifiedAt: new Date('2023-01-02') },
        },
      };

      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];
      act(() => {
        conflictHandler(newerLocal);
      });

      act(() => {
        result.current.resolveAllConflicts('newest');
      });

      // Should choose local because it's newer
      expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledWith(0, true);
    });

    it('should resolve all conflicts with largest strategy', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Mock conflicts with different sizes
      const largerRemote = {
        ...mockConflict,
        localContent: {
          ...mockConflict.localContent,
          html: '<p>Short</p>',
        },
        remoteContent: {
          ...mockConflict.remoteContent,
          html: '<p>This is a much longer content that should be preferred</p>',
        },
      };

      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];
      act(() => {
        conflictHandler(largerRemote);
      });

      act(() => {
        result.current.resolveAllConflicts('largest');
      });

      // Should choose remote because it's larger
      expect(mockStateSyncManager.resolveConflict).toHaveBeenCalledWith(0, false);
    });
  });

  describe('conflict analysis', () => {
    it('should provide conflict summary', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      const summary = result.current.getConflictSummary(mockConflict);

      expect(summary).toEqual({
        type: 'version',
        conflictTime: mockConflict.conflictTime,
        local: {
          version: 1,
          modifiedAt: new Date('2023-01-01'),
          size: '<p>Local content</p>'.length,
          preview: 'Local content...',
        },
        remote: {
          version: 2,
          modifiedAt: new Date('2023-01-01'),
          size: '<p>Remote content</p>'.length,
          preview: 'Remote content...',
        },
        recommendation: expect.objectContaining({
          useLocal: false,
          reason: expect.stringContaining('Remote version (2) is newer than local (1)'),
          confidence: 'high',
        }),
      });
    });

    it('should provide recommendations for version conflicts', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      const recommendation = result.current.getConflictRecommendation(mockConflict);

      expect(recommendation).toEqual({
        useLocal: false,
        reason: 'Remote version (2) is newer than local (1)',
        confidence: 'high',
      });
    });

    it('should provide recommendations for timestamp conflicts', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      const timestampConflict: StateConflict = {
        ...mockConflict,
        type: 'timestamp',
        localContent: {
          ...mockConflict.localContent,
          metadata: { ...mockConflict.localContent.metadata, modifiedAt: new Date('2023-01-03') },
        },
        remoteContent: {
          ...mockConflict.remoteContent,
          metadata: { ...mockConflict.remoteContent.metadata, modifiedAt: new Date('2023-01-02') },
        },
      };

      const recommendation = result.current.getConflictRecommendation(timestampConflict);

      expect(recommendation).toEqual({
        useLocal: true,
        reason: 'Local content was modified more recently',
        confidence: 'high',
      });
    });

    it('should provide recommendations for concurrent conflicts', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      const concurrentConflict: StateConflict = {
        ...mockConflict,
        type: 'concurrent',
        localContent: {
          ...mockConflict.localContent,
          html: '<p>Short local content</p>',
        },
        remoteContent: {
          ...mockConflict.remoteContent,
          html: '<p>This is much longer remote content that has significantly more text and should be preferred based on size</p>',
        },
      };

      const recommendation = result.current.getConflictRecommendation(concurrentConflict);

      expect(recommendation.useLocal).toBe(false);
      expect(recommendation.reason).toContain('Remote content has significantly more content');
      expect(recommendation.confidence).toBe('medium');
    });
  });

  describe('utility functions', () => {
    it('should toggle auto-resolve setting', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      expect(result.current.autoResolveEnabled).toBe(false);

      act(() => {
        result.current.toggleAutoResolve();
      });

      expect(result.current.autoResolveEnabled).toBe(true);

      act(() => {
        result.current.toggleAutoResolve();
      });

      expect(result.current.autoResolveEnabled).toBe(false);
    });

    it('should clear last resolved conflict', () => {
      const { result } = renderHook(() => useStateSyncConflicts());

      // Add and resolve a conflict
      const conflictHandler = mockStateSyncManager.addConflictHandler.mock.calls[0][0];
      act(() => {
        conflictHandler(mockConflict);
      });

      act(() => {
        result.current.resolveConflict(0, true);
      });

      expect(result.current.lastResolvedConflict).toEqual(mockConflict);

      act(() => {
        result.current.clearLastResolvedConflict();
      });

      expect(result.current.lastResolvedConflict).toBeUndefined();
    });

    it('should get storage info', () => {
      const mockStorageInfo = {
        hasContent: true,
        hasBackup: false,
        hasConflicts: true,
        conflictCount: 2,
        lastSyncTime: Date.now(),
        isOnline: true,
        syncInProgress: false,
        sessionId: 'test-session',
      };

      mockStateSyncManager.getStorageInfo.mockReturnValue(mockStorageInfo);

      const { result } = renderHook(() => useStateSyncConflicts());

      const storageInfo = result.current.getStorageInfo();
      expect(storageInfo).toEqual(mockStorageInfo);
    });
  });
});