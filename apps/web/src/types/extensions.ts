'use client';

import { ReactNode } from 'react';
import { JD, Task } from '@/lib/types';

export interface AppContext {
  resume?: any;
  jd?: JDItem | JD;
  target?: Target;
  task?: Task | null;
  selectedText?: string;
}

export interface Command {
  id: string;
  name: string;
  shortcut?: string;
  action: () => void;
}

export interface ExtensionProps {
  context: AppContext;
  onContextChange: (ctx: Partial<AppContext>) => void;
}

export interface Extension {
  id: string;
  name: string;
  icon: ReactNode;
  badge?: number | string;
  category: 'core' | 'auxiliary';
  surfaces: {
    leftPanel?: React.FC<ExtensionProps>;
    rightDrawer?: React.FC<ExtensionProps>;
    commands?: Command[];
  };
  permissions: ('readResume' | 'writeResume' | 'callLLM' | 'openLink')[];
  onContextChange?: (ctx: AppContext) => void;
}

export interface Target {
  id: string;
  company: string;
  role: string;
  location?: string;
  jdText: string;
  sourceUrl?: string;
  culture: string[];
  fitScore: number;
  createdAt: Date;
}

export interface JDItem {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  fitScore: number;
  keySkills: string[];
  requirements: string[];
  culture: string[];
  updatedDays: number;
  isRemote?: boolean;
  hasReferral?: boolean;
}

export interface FitReport {
  score: number;
  strengths: string[];
  gaps: string[];
  improvements: {
    action: string;
    impact: number;
    section: string;
  }[];
}
