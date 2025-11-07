import { stateSyncManager } from '../state-sync';
import { EditorContent } from '../../../types/editor';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('StateSyncManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const mockEditorContent: EditorContent = {
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

  describe('saveContent', () => {
    it('should save content to localStorage', () => {
      const result = stateSyncManager.saveContent(mockEditorContent);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'resume-editor-content',
        expect.stringContaining('"content":')
      );
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = stateSyncManager.saveContent(mockEditorContent);
      
      expect(result).toBe(false);
    });
  });

  describe('loadContent', () => {
    it('should load content from localStorage', () => {
      const saveData = {
        content: mockEditorContent,
        timestamp: Date.now(),
        version: 1,
        checksum: 'test-checksum',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(saveData));
      
      // Mock checksum generation to match
      jest.spyOn(stateSyncManager as any, 'generateChecksum').mockReturnValue('test-checksum');

      const result = stateSyncManager.loadContent();
      
      expect(result).toEqual(mockEditorContent);
    });

    it('should return null when no content exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = stateSyncManager.loadContent();
      
      expect(result).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = stateSyncManager.loadContent();
      
      expect(result).toBeNull();
    });

    it('should attempt backup recovery on checksum mismatch', () => {
      const saveData = {
        content: mockEditorContent,
        timestamp: Date.now(),
        version: 1,
        checksum: 'wrong-checksum',
      };

      const backupData = {
        content: mockEditorContent,
        timestamp: Date.now(),
        version: 1,
        checksum: 'backup-checksum',
        backupTimestamp: Date.now(),
      };

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(saveData)) // First call for main content
        .mockReturnValueOnce(JSON.stringify(backupData)); // Second call for backup

      // Mock checksum generation
      jest.spyOn(stateSyncManager as any, 'generateChecksum')
        .mockReturnValueOnce('different-checksum') // For main content validation
        .mockReturnValueOnce('backup-checksum'); // For backup content validation

      const result = stateSyncManager.loadContent();
      
      expect(result).toEqual(mockEditorContent);
    });
  });

  describe('getStorageInfo', () => {
    it('should return correct storage information', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('{"content": "test"}') // Has content
        .mockReturnValueOnce('{"backup": "test"}'); // Has backup

      const info = stateSyncManager.getStorageInfo();
      
      expect(info).toEqual({
        hasContent: true,
        hasBackup: true,
        lastSyncTime: expect.any(Number),
        isOnline: true,
      });
    });
  });

  describe('clearStorage', () => {
    it('should clear all stored data', () => {
      stateSyncManager.clearStorage();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('resume-editor-content');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('resume-editor-backup');
    });
  });
});

describe('Enhanced State Synchronization', () => {
  it('should handle state synchronization edge cases', () => {
    // Test concurrent modifications
    const content1 = { ...mockEditorContent, metadata: { ...mockEditorContent.metadata, version: 1 } };
    const content2 = { ...mockEditorContent, metadata: { ...mockEditorContent.metadata, version: 2 } };

    const result1 = stateSyncManager.saveContent(content1);
    const result2 = stateSyncManager.saveContent(content2);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    const loadResult = stateSyncManager.loadContent();
    expect(loadResult.success).toBe(true);
    expect(loadResult.content?.metadata?.version).toBe(2);
  });

  it('should detect and handle version conflicts', () => {
    // Save newer version first
    const newerContent = { 
      ...mockEditorContent, 
      metadata: { ...mockEditorContent.metadata, version: 2, modifiedAt: new Date() }
    };
    stateSyncManager.saveContent(newerContent);

    // Try to save older version
    const olderContent = { 
      ...mockEditorContent, 
      metadata: { ...mockEditorContent.metadata, version: 1, modifiedAt: new Date(Date.now() - 10000) }
    };
    const result = stateSyncManager.saveContent(olderContent);

    expect(result.success).toBe(false);
    expect(result.conflict).toBeDefined();
    expect(result.conflict?.type).toBe('version');
  });

  it('should handle content corruption and recovery', () => {
    // Save valid content first
    stateSyncManager.saveContent(mockEditorContent);

    // Simulate corrupted data
    localStorageMock.getItem.mockReturnValue('{"invalid": "data"}');

    const loadResult = stateSyncManager.loadContent();
    expect(loadResult.success).toBe(false);
    expect(loadResult.recoveredFromBackup).toBe(true);
  });

  it('should handle concurrent editing sessions', () => {
    // Mock different session IDs
    const originalSessionStorage = global.sessionStorage;
    const mockSessionStorage = {
      getItem: jest.fn().mockReturnValue('session-1'),
      setItem: jest.fn(),
    };
    Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage });

    // Save content from session 1
    stateSyncManager.saveContent(mockEditorContent);

    // Switch to session 2
    mockSessionStorage.getItem.mockReturnValue('session-2');

    // Try to save from session 2 immediately (concurrent editing)
    const result = stateSyncManager.saveContent({
      ...mockEditorContent,
      html: '<p>Different content</p>',
    });

    expect(result.success).toBe(false);
    expect(result.conflict?.type).toBe('concurrent');

    // Restore original sessionStorage
    Object.defineProperty(global, 'sessionStorage', { value: originalSessionStorage });
  });

  it('should resolve conflicts correctly', () => {
    const localContent = { ...mockEditorContent, html: '<p>Local content</p>' };
    const remoteContent = { ...mockEditorContent, html: '<p>Remote content</p>' };

    // Create a conflict
    stateSyncManager.saveContent(remoteContent);
    const result = stateSyncManager.saveContent(localContent);

    expect(result.conflict).toBeDefined();

    // Resolve conflict choosing local version
    const resolved = stateSyncManager.resolveConflict(0, true);
    expect(resolved).toBe(true);

    const loadResult = stateSyncManager.loadContent();
    expect(loadResult.content?.html).toBe('<p>Local content</p>');
  });

  it('should handle offline/online transitions', () => {
    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    const result = stateSyncManager.saveContent(mockEditorContent);
    expect(result.success).toBe(true); // Should still save locally

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', { value: true });
    
    const info = stateSyncManager.getStorageInfo();
    expect(info.isOnline).toBe(true);
  });

  it('should handle content repair and validation', () => {
    const corruptedContent = {
      ...mockEditorContent,
      html: '', // Missing HTML
      plainText: '', // Missing plain text
      document: null as any, // Missing document
      metadata: null as any, // Missing metadata
    };

    const result = stateSyncManager.saveContent(corruptedContent);
    expect(result.success).toBe(true); // Should repair and save

    const loadResult = stateSyncManager.loadContent();
    expect(loadResult.success).toBe(true);
    expect(loadResult.content?.html).toBeTruthy();
    expect(loadResult.content?.document).toBeTruthy();
    expect(loadResult.content?.metadata).toBeTruthy();
  });

  it('should manage sync listeners correctly', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    stateSyncManager.addSyncListener(listener1);
    stateSyncManager.addSyncListener(listener2);

    stateSyncManager.saveContent(mockEditorContent);

    expect(listener1).toHaveBeenCalledWith(mockEditorContent);
    expect(listener2).toHaveBeenCalledWith(mockEditorContent);

    stateSyncManager.removeSyncListener(listener1);
    stateSyncManager.saveContent(mockEditorContent);

    expect(listener1).toHaveBeenCalledTimes(1); // Not called again
    expect(listener2).toHaveBeenCalledTimes(2); // Called again
  });

  it('should handle conflict handlers correctly', () => {
    const conflictHandler = jest.fn();
    stateSyncManager.addConflictHandler(conflictHandler);

    // Create a conflict scenario
    const content1 = { ...mockEditorContent, metadata: { ...mockEditorContent.metadata, version: 2 } };
    const content2 = { ...mockEditorContent, metadata: { ...mockEditorContent.metadata, version: 1 } };

    stateSyncManager.saveContent(content1);
    stateSyncManager.saveContent(content2);

    expect(conflictHandler).toHaveBeenCalled();
    expect(conflictHandler.mock.calls[0][0].type).toBe('version');
  });
});