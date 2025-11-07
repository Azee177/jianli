'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useProjects } from './useProjects';
import { useSettings } from './useSettings';

interface UseAutoSaveOptions {
  data: any;
  onSave?: (data: any) => Promise<void>;
  delay?: number;
}

export function useAutoSave({ data, onSave, delay = 2000 }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const { settings } = useSettings();

  const save = useCallback(async () => {
    if (onSave && settings?.autoSave) {
      try {
        await onSave(data);
        lastSavedRef.current = JSON.stringify(data);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [data, onSave, settings?.autoSave]);

  useEffect(() => {
    if (!settings?.autoSave) return;

    const currentData = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (currentData === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, settings.autoSaveInterval * 1000 || delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, delay, settings?.autoSaveInterval, settings?.autoSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await save();
  }, [save]);

  return { saveNow };
}

export function useResumeAutoSave(resumeData: any) {
  const { currentProject, updateProject } = useProjects();

  const handleSave = useCallback(async (data: any) => {
    if (currentProject) {
      await updateProject(currentProject.id, { resumeData: data });
    }
  }, [currentProject, updateProject]);

  return useAutoSave({
    data: resumeData,
    onSave: handleSave,
  });
}