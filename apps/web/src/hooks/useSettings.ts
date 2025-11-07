'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '@/types/storage';
import { useStorage } from '@/lib/storage/storage-context';
import { useAuth } from '@/lib/auth/auth-context';

export function useSettings() {
  const storage = useStorage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      let userSettings = await storage.getSettings(user.id);
      
      // Create default settings if none exist
      if (!userSettings) {
        userSettings = await storage.updateSettings(user.id, {});
      }
      
      setSettings(userSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [storage, user]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const updatedSettings = await storage.updateSettings(user.id, updates);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      console.error('Error updating settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [storage, user]);

  const updateTheme = useCallback(async (theme: 'dark' | 'light' | 'auto') => {
    return updateSettings({ theme });
  }, [updateSettings]);

  const updateLanguage = useCallback(async (language: 'zh' | 'en') => {
    return updateSettings({ language });
  }, [updateSettings]);

  const updateAutoSave = useCallback(async (autoSave: boolean, autoSaveInterval?: number) => {
    const updates: Partial<UserSettings> = { autoSave };
    if (autoSaveInterval !== undefined) {
      updates.autoSaveInterval = autoSaveInterval;
    }
    return updateSettings(updates);
  }, [updateSettings]);

  const updatePanelWidths = useCallback(async (panelWidths: { left: number; right: number }) => {
    return updateSettings({ panelWidths });
  }, [updateSettings]);

  const updateExtensionSettings = useCallback(async (extensionId: string, extensionSettings: any) => {
    if (!settings) return;
    
    const newExtensionSettings = {
      ...settings.extensionSettings,
      [extensionId]: extensionSettings,
    };
    
    return updateSettings({ extensionSettings: newExtensionSettings });
  }, [settings, updateSettings]);

  const updateActiveExtensions = useCallback(async (activeExtensions: string[]) => {
    return updateSettings({ activeExtensions });
  }, [updateSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateTheme,
    updateLanguage,
    updateAutoSave,
    updatePanelWidths,
    updateExtensionSettings,
    updateActiveExtensions,
    refreshSettings: loadSettings,
  };
}