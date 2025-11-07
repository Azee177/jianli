import { ResumeData } from './resume';

export interface UserProject {
  id: string;
  userId: string;
  name: string;
  resumeData: ResumeData;
  targets: Target[];
  currentTarget?: Target;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Target {
  id: string;
  name: string;
  company?: string;
  position?: string;
  description?: string;
  requirements?: string[];
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'dark' | 'light' | 'auto';
  language: 'zh' | 'en';
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  extensionSettings: Record<string, any>;
  panelWidths: {
    left: number;
    right: number;
  };
  activeExtensions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  projectId?: string;
  type: 'login' | 'logout' | 'resume_edit' | 'export' | 'share';
  data: Record<string, any>;
  timestamp: Date;
}

export interface StorageService {
  // Projects
  getProjects(userId: string): Promise<UserProject[]>;
  createProject(userId: string, name: string, resumeData: ResumeData): Promise<UserProject>;
  updateProject(projectId: string, updates: Partial<UserProject>): Promise<UserProject>;
  deleteProject(projectId: string): Promise<void>;
  
  // Settings
  getSettings(userId: string): Promise<UserSettings | null>;
  updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
  
  // Activities
  logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void>;
  getActivities(userId: string, limit?: number): Promise<UserActivity[]>;
}