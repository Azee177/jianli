'use client';

import { UserProject, UserSettings, UserActivity, StorageService } from '@/types/storage';
import { ResumeData } from '@/types/resume';

class LocalStorageService implements StorageService {
  private getKey(type: string, userId: string, id?: string): string {
    return `resume_copilot_${type}_${userId}${id ? `_${id}` : ''}`;
  }

  private getData<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return null;
    }
  }

  private setData<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private removeData(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Projects
  async getProjects(userId: string): Promise<UserProject[]> {
    const key = this.getKey('projects', userId);
    const projects = this.getData<UserProject[]>(key) || [];
    
    // Convert date strings back to Date objects
    return projects.map(project => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
  }

  async getProject(projectId: string): Promise<UserProject | null> {
    // We need to search through all users' projects since we don't have userId
    // This is a limitation of localStorage approach
    if (typeof window === 'undefined') return null;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('resume_copilot_projects_')) {
        const projects = this.getData<UserProject[]>(key) || [];
        const project = projects.find(p => p.id === projectId);
        if (project) {
          return {
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          };
        }
      }
    }
    
    return null;
  }

  async createProject(userId: string, name: string, resumeData: ResumeData): Promise<UserProject> {
    const projects = await this.getProjects(userId);
    const now = new Date();
    
    const newProject: UserProject = {
      id: this.generateId(),
      userId,
      name,
      resumeData,
      targets: [],
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    projects.push(newProject);
    const key = this.getKey('projects', userId);
    this.setData(key, projects);
    
    return newProject;
  }

  async updateProject(projectId: string, updates: Partial<UserProject>): Promise<UserProject> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const projects = await this.getProjects(project.userId);
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };

    projects[index] = updatedProject;
    const key = this.getKey('projects', project.userId);
    this.setData(key, projects);
    
    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const projects = await this.getProjects(project.userId);
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    const key = this.getKey('projects', project.userId);
    this.setData(key, filteredProjects);
  }

  // Settings
  async getSettings(userId: string): Promise<UserSettings | null> {
    const key = this.getKey('settings', userId);
    const settings = this.getData<UserSettings>(key);
    
    if (!settings) return null;
    
    return {
      ...settings,
      createdAt: new Date(settings.createdAt),
      updatedAt: new Date(settings.updatedAt),
    };
  }

  async updateSettings(userId: string, settingsUpdate: Partial<UserSettings>): Promise<UserSettings> {
    const existingSettings = await this.getSettings(userId);
    const now = new Date();
    
    const settings: UserSettings = {
      id: existingSettings?.id || this.generateId(),
      userId,
      theme: 'auto',
      language: 'zh',
      autoSave: true,
      autoSaveInterval: 30,
      extensionSettings: {},
      panelWidths: { left: 300, right: 300 },
      activeExtensions: [],
      createdAt: existingSettings?.createdAt || now,
      updatedAt: now,
      ...existingSettings,
      ...settingsUpdate,
    };

    const key = this.getKey('settings', userId);
    this.setData(key, settings);
    
    return settings;
  }

  // Activities
  async logActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> {
    const key = this.getKey('activities', activity.userId);
    const activities = this.getData<UserActivity[]>(key) || [];
    
    const newActivity: UserActivity = {
      ...activity,
      id: this.generateId(),
      createdAt: new Date(),
    };

    activities.unshift(newActivity); // Add to beginning
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(1000);
    }
    
    this.setData(key, activities);
  }

  async getActivities(userId: string, limit = 50): Promise<UserActivity[]> {
    const key = this.getKey('activities', userId);
    const activities = this.getData<UserActivity[]>(key) || [];
    
    return activities
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        createdAt: new Date(activity.createdAt),
      }));
  }
}

export const localStorageService = new LocalStorageService();