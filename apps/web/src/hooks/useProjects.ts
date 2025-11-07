'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResumeData } from '@/types/resume';

interface UserProject {
  id: string;
  userId: string;
  name: string;
  resumeData: ResumeData;
  targets: any[];
  currentTarget?: any;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
import { useStorage } from '@/lib/storage/storage-context';
import { useAuth } from '@/lib/auth/auth-context';

export function useProjects() {
  const storage = useStorage();
  const { user } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [currentProject, setCurrentProject] = useState<UserProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setCurrentProject(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const userProjects = await storage.getProjects(user.id);
      setProjects(userProjects);
      
      // Set current project to the most recently updated active project
      const activeProject = userProjects
        .filter(p => p.isActive)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
      
      setCurrentProject(activeProject || null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [storage, user]);

  const createProject = useCallback(async (name: string, resumeData: ResumeData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const newProject = await storage.createProject(user.id, name, resumeData);
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      
      // Log activity
      await storage.logActivity({
        userId: user.id,
        projectId: newProject.id,
        type: 'resume_edit',
        data: { action: 'project_created', projectName: name },
      });
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [storage, user]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<UserProject>) => {
    try {
      setError(null);
      const updatedProject = await storage.updateProject(projectId, updates);
      
      setProjects(prev => 
        prev.map(p => p.id === projectId ? updatedProject : p)
      );
      
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      // Log activity if it's a significant update
      if (user && (updates.resumeData || updates.targets)) {
        await storage.logActivity({
          userId: user.id,
          projectId,
          type: 'resume_edit',
          data: { action: 'project_updated', updates: Object.keys(updates) },
        });
      }
      
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [storage, user, currentProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      setError(null);
      await storage.deleteProject(projectId);
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (currentProject?.id === projectId) {
        // Set current project to the next available project
        const remainingProjects = projects.filter(p => p.id !== projectId);
        const nextProject = remainingProjects
          .filter(p => p.isActive)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
        
        setCurrentProject(nextProject || null);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [storage, currentProject, projects]);

  const switchProject = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      
      // Update the project's updatedAt to mark it as recently accessed
      await updateProject(projectId, { updatedAt: new Date() });
    }
  }, [projects, updateProject]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    currentProject,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    switchProject,
    refreshProjects: loadProjects,
  };
}
