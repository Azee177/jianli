import { EditorContent, DocumentNode } from '../../types/editor';

export interface StateConflict {
    type: 'version' | 'timestamp' | 'content' | 'concurrent';
    localContent: EditorContent;
    remoteContent: EditorContent;
    conflictTime: Date;
}

export interface SyncOptions {
    forceSync?: boolean;
    skipValidation?: boolean;
    createBackup?: boolean;
}

export interface SyncResult {
    success: boolean;
    conflict?: StateConflict;
    error?: string;
    recoveredFromBackup?: boolean;
}

// Enhanced state synchronization manager for handling content persistence and conflict resolution
export class StateSyncManager {
    private static instance: StateSyncManager;
    private storageKey = 'resume-editor-content';
    private backupKey = 'resume-editor-backup';
    private conflictKey = 'resume-editor-conflicts';
    private lastSyncTime = 0;
    private syncInterval = 1000; // Sync every 1 second
    private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    private syncInProgress = false;
    private pendingSync: EditorContent | null = null;
    private conflictHandlers: ((conflict: StateConflict) => void)[] = [];
    private syncListeners: ((content: EditorContent) => void)[] = [];

    // Safe localStorage access for SSR compatibility
    private getLocalStorage(): Storage | null {
        return typeof localStorage !== 'undefined' ? localStorage : null;
    }

    private getSessionStorage(): Storage | null {
        return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
    }

    private constructor() {
        // Only initialize browser-specific features on client side
        if (typeof window !== 'undefined') {
            // Listen for online/offline events
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.syncFromStorage();
            });

            window.addEventListener('offline', () => {
                this.isOnline = false;
            });

            // Listen for storage changes from other tabs
            window.addEventListener('storage', (e) => {
                if (e.key === this.storageKey && e.newValue) {
                    this.handleExternalChange(e.newValue);
                }
            });

            // Auto-backup every 30 seconds
            setInterval(() => {
                this.createBackup();
            }, 30000);
        }
    }

    static getInstance(): StateSyncManager {
        if (!StateSyncManager.instance) {
            StateSyncManager.instance = new StateSyncManager();
        }
        return StateSyncManager.instance;
    }

    // Safe method to check if we're in browser environment
    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    // Enhanced save content with conflict detection and recovery
    saveContent(content: EditorContent, options: SyncOptions = {}): SyncResult {
        // Skip saving on server side
        if (!this.isBrowser()) {
            return { success: true };
        }

        if (this.syncInProgress && !options.forceSync) {
            this.pendingSync = content;
            return { success: false, error: 'Sync in progress, content queued' };
        }

        this.syncInProgress = true;

        try {
            // Check for conflicts before saving
            if (!options.skipValidation) {
                const conflict = this.detectConflict(content);
                if (conflict) {
                    this.handleConflict(conflict);
                    this.syncInProgress = false;
                    return { success: false, conflict };
                }
            }

            // Create backup if requested
            if (options.createBackup) {
                this.createBackup();
            }

            const saveData = {
                content,
                timestamp: Date.now(),
                version: content.metadata?.version || 1,
                checksum: this.generateChecksum(content.html),
                sessionId: this.getSessionId(),
            };

            const storage = this.getLocalStorage();
      if (storage) {
        storage.setItem(this.storageKey, JSON.stringify(saveData));
      }
            this.lastSyncTime = Date.now();

            // Notify listeners
            this.notifySyncListeners(content);

            // Process pending sync if any
            if (this.pendingSync) {
                const pending = this.pendingSync;
                this.pendingSync = null;
                setTimeout(() => this.saveContent(pending), 100);
            }

            this.syncInProgress = false;
            return { success: true };
        } catch (error) {
            console.error('Failed to save content:', error);
            this.syncInProgress = false;

            // Attempt recovery from backup
            const recovered = this.attemptRecovery();
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                recoveredFromBackup: recovered
            };
        }
    }

    // Enhanced load content with validation and recovery
    loadContent(): SyncResult & { content?: EditorContent | null } {
        // Return null on server side
        if (!this.isBrowser()) {
            return { success: true, content: null };
        }

        try {
            const storage = this.getLocalStorage();
            if (!storage) {
                return { success: true, content: null };
            }

            const saved = storage.getItem(this.storageKey);
            if (!saved) {
                return { success: true, content: null };
            }

            const saveData = JSON.parse(saved);

            // Validate data structure
            if (!saveData.content || !saveData.timestamp || !saveData.checksum) {
                console.warn('Invalid save data structure, attempting backup recovery');
                const backupResult = this.loadBackup();
                return {
                    success: !!backupResult,
                    content: backupResult,
                    recoveredFromBackup: !!backupResult
                };
            }

            // Validate checksum
            const expectedChecksum = this.generateChecksum(saveData.content.html);
            if (saveData.checksum !== expectedChecksum) {
                console.warn('Content checksum mismatch, attempting recovery from backup');
                const backupResult = this.loadBackup();
                return {
                    success: !!backupResult,
                    content: backupResult,
                    recoveredFromBackup: !!backupResult
                };
            }

            // Validate content integrity
            if (!this.validateContentIntegrity(saveData.content)) {
                console.warn('Content integrity check failed, attempting repair');
                const repairedContent = this.repairContent(saveData.content);
                if (repairedContent) {
                    // Save repaired content
                    this.saveContent(repairedContent, { skipValidation: true });
                    return { success: true, content: repairedContent };
                } else {
                    const backupResult = this.loadBackup();
                    return {
                        success: !!backupResult,
                        content: backupResult,
                        recoveredFromBackup: !!backupResult
                    };
                }
            }

            return { success: true, content: saveData.content };
        } catch (error) {
            console.error('Failed to load content:', error);
            const backupResult = this.loadBackup();
            return {
                success: !!backupResult,
                content: backupResult,
                error: error instanceof Error ? error.message : 'Unknown error',
                recoveredFromBackup: !!backupResult
            };
        }
    }

    // Create backup copy
    private createBackup(): void {
        try {
            const storage = this.getLocalStorage();
            if (!storage) return;

            const current = storage.getItem(this.storageKey);
            if (current) {
                const backupData = {
                    ...JSON.parse(current),
                    backupTimestamp: Date.now(),
                };
                storage.setItem(this.backupKey, JSON.stringify(backupData));
            }
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }

    // Load from backup
    private loadBackup(): EditorContent | null {
        try {
            const storage = this.getLocalStorage();
            if (!storage) return null;

            const backup = storage.getItem(this.backupKey);
            if (!backup) return null;

            const backupData = JSON.parse(backup);
            return backupData.content;
        } catch (error) {
            console.error('Failed to load backup:', error);
            return null;
        }
    }

    // Handle external changes (from other tabs)
    private handleExternalChange(newValue: string): void {
        try {
            const saveData = JSON.parse(newValue);
            // Emit custom event for components to handle (only in browser)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('resume-content-external-change', {
                    detail: saveData.content
                }));
            }
        } catch (error) {
            console.error('Failed to handle external change:', error);
        }
    }

    // Sync from storage (called when coming back online)
    private syncFromStorage(): void {
        const loadResult = this.loadContent();
        if (loadResult.success && loadResult.content && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('resume-content-sync', {
                detail: loadResult.content
            }));
        }
    }

    // Generate simple checksum for content validation
    private generateChecksum(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    // Detect conflicts between current and stored content
    private detectConflict(content: EditorContent): StateConflict | null {
        try {
            const storage = this.getLocalStorage();
            if (!storage) return null;

            const saved = storage.getItem(this.storageKey);
            if (!saved) return null;

            const saveData = JSON.parse(saved);
            const storedContent = saveData.content;

            // Check version conflicts
            if (content.metadata?.version && storedContent.metadata?.version) {
                if (content.metadata.version < storedContent.metadata.version) {
                    return {
                        type: 'version',
                        localContent: content,
                        remoteContent: storedContent,
                        conflictTime: new Date(),
                    };
                }
            }

            // Check timestamp conflicts
            if (content.metadata?.modifiedAt && storedContent.metadata?.modifiedAt) {
                const localTime = new Date(content.metadata.modifiedAt).getTime();
                const storedTime = new Date(storedContent.metadata.modifiedAt).getTime();

                if (Math.abs(localTime - storedTime) > 5000 && localTime < storedTime) {
                    return {
                        type: 'timestamp',
                        localContent: content,
                        remoteContent: storedContent,
                        conflictTime: new Date(),
                    };
                }
            }

            // Check concurrent editing (different session IDs with recent timestamps)
            if (saveData.sessionId && saveData.sessionId !== this.getSessionId()) {
                const timeDiff = Date.now() - saveData.timestamp;
                if (timeDiff < 30000) { // Within 30 seconds
                    return {
                        type: 'concurrent',
                        localContent: content,
                        remoteContent: storedContent,
                        conflictTime: new Date(),
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('Error detecting conflict:', error);
            return null;
        }
    }

    // Handle detected conflicts
    private handleConflict(conflict: StateConflict): void {
        // Store conflict for later resolution
        try {
            const storage = this.getLocalStorage();
            if (!storage) return;

            const conflicts = this.getStoredConflicts();
            conflicts.push(conflict);
            storage.setItem(this.conflictKey, JSON.stringify(conflicts));
        } catch (error) {
            console.error('Failed to store conflict:', error);
        }

        // Notify conflict handlers
        this.conflictHandlers.forEach(handler => {
            try {
                handler(conflict);
            } catch (error) {
                console.error('Error in conflict handler:', error);
            }
        });
    }

    // Get stored conflicts
    getStoredConflicts(): StateConflict[] {
        try {
            const storage = this.getLocalStorage();
            if (!storage) return [];

            const stored = storage.getItem(this.conflictKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load conflicts:', error);
            return [];
        }
    }

    // Resolve conflict by choosing a version
    resolveConflict(conflictIndex: number, useLocal: boolean): boolean {
        try {
            const conflicts = this.getStoredConflicts();
            if (conflictIndex < 0 || conflictIndex >= conflicts.length) {
                return false;
            }

            const conflict = conflicts[conflictIndex];
            const chosenContent = useLocal ? conflict.localContent : conflict.remoteContent;

            // Save chosen content
            const result = this.saveContent(chosenContent, { skipValidation: true, createBackup: true });

            if (result.success) {
                // Remove resolved conflict
                conflicts.splice(conflictIndex, 1);
                const storage = this.getLocalStorage();
                if (storage) {
                    storage.setItem(this.conflictKey, JSON.stringify(conflicts));
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to resolve conflict:', error);
            return false;
        }
    }

    // Validate content integrity
    private validateContentIntegrity(content: EditorContent): boolean {
        try {
            // Check required fields
            if (!content.html || !content.plainText || !content.document) {
                return false;
            }

            // Check document structure
            if (!content.document.type || !Array.isArray(content.document.children)) {
                return false;
            }

            // Check metadata
            if (!content.metadata || !content.metadata.modifiedAt) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Content integrity validation failed:', error);
            return false;
        }
    }

    // Repair corrupted content
    private repairContent(content: EditorContent): EditorContent | null {
        try {
            const repaired: EditorContent = { ...content };

            // Repair missing HTML
            if (!repaired.html) {
                repaired.html = repaired.plainText ? `<p>${repaired.plainText}</p>` : '<p></p>';
            }

            // Repair missing plain text
            if (!repaired.plainText) {
                repaired.plainText = repaired.html.replace(/<[^>]*>/g, '');
            }

            // Repair missing document
            if (!repaired.document) {
                repaired.document = {
                    type: 'document',
                    children: [
                        {
                            type: 'paragraph',
                            id: `block-${Date.now()}`,
                            children: [
                                {
                                    type: 'text',
                                    content: repaired.plainText || '',
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
                            family: '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
                            size: 14,
                            weight: 400,
                        },
                        headingStyles: {},
                        paragraphStyles: {},
                    },
                };
            }

            // Repair missing metadata
            if (!repaired.metadata) {
                repaired.metadata = {
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    version: 1,
                };
            }

            return repaired;
        } catch (error) {
            console.error('Failed to repair content:', error);
            return null;
        }
    }

    // Attempt recovery from various sources
    private attemptRecovery(): boolean {
        try {
            // Try backup first
            const backup = this.loadBackup();
            if (backup) {
                this.saveContent(backup, { skipValidation: true });
                return true;
            }

            // Try to recover from conflicts
            const conflicts = this.getStoredConflicts();
            if (conflicts.length > 0) {
                const latestConflict = conflicts[conflicts.length - 1];
                const content = latestConflict.remoteContent || latestConflict.localContent;
                this.saveContent(content, { skipValidation: true });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Recovery attempt failed:', error);
            return false;
        }
    }

    // Get unique session ID
    private getSessionId(): string {
        const storage = this.getSessionStorage();
        if (!storage) {
            // Fallback to a temporary session ID when sessionStorage is not available
            return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        let sessionId = storage.getItem('resume-editor-session');
        if (!sessionId) {
            sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            storage.setItem('resume-editor-session', sessionId);
        }
        return sessionId;
    }

    // Add conflict handler
    addConflictHandler(handler: (conflict: StateConflict) => void): void {
        this.conflictHandlers.push(handler);
    }

    // Remove conflict handler
    removeConflictHandler(handler: (conflict: StateConflict) => void): void {
        const index = this.conflictHandlers.indexOf(handler);
        if (index > -1) {
            this.conflictHandlers.splice(index, 1);
        }
    }

    // Add sync listener
    addSyncListener(listener: (content: EditorContent) => void): void {
        this.syncListeners.push(listener);
    }

    // Remove sync listener
    removeSyncListener(listener: (content: EditorContent) => void): void {
        const index = this.syncListeners.indexOf(listener);
        if (index > -1) {
            this.syncListeners.splice(index, 1);
        }
    }

    // Notify sync listeners
    private notifySyncListeners(content: EditorContent): void {
        this.syncListeners.forEach(listener => {
            try {
                listener(content);
            } catch (error) {
                console.error('Error in sync listener:', error);
            }
        });
    }

    // Force sync with conflict resolution
    forceSyncContent(content: EditorContent): SyncResult {
        return this.saveContent(content, { forceSync: true, createBackup: true });
    }

    // Clear all stored data including conflicts
    clearStorage(): void {
        const storage = this.getLocalStorage();
        if (storage) {
            storage.removeItem(this.storageKey);
            storage.removeItem(this.backupKey);
            storage.removeItem(this.conflictKey);
        }
    }

    // Enhanced storage info
    getStorageInfo(): {
        hasContent: boolean;
        hasBackup: boolean;
        hasConflicts: boolean;
        conflictCount: number;
        lastSyncTime: number;
        isOnline: boolean;
        syncInProgress: boolean;
        sessionId: string;
    } {
        const conflicts = this.getStoredConflicts();
        const storage = this.getLocalStorage();
        return {
            hasContent: storage ? !!storage.getItem(this.storageKey) : false,
            hasBackup: storage ? !!storage.getItem(this.backupKey) : false,
            hasConflicts: conflicts.length > 0,
            conflictCount: conflicts.length,
            lastSyncTime: this.lastSyncTime,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            sessionId: this.getSessionId(),
        };
    }
}

// Export singleton instance
export const stateSyncManager = StateSyncManager.getInstance();