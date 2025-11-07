'use client';

import { Building2, Lightbulb, GraduationCap, MessageSquare, Zap } from 'lucide-react';
import { Extension } from '@/types/extensions';
import { CompanyJobExtension } from '@/components/extensions/CompanyJobExtension';
import { WorkflowExtension } from '@/components/extensions/WorkflowExtension';
import { SuggestionsExtension } from '@/components/extensions/SuggestionsExtension';
import { LearningExtension } from '@/components/extensions/LearningExtension';
import { InterviewExtension } from '@/components/extensions/InterviewExtension';

export const coreExtensions: Extension[] = [
  {
    id: 'workflow',
    name: 'AI 工作流',
    icon: <Zap className="h-4 w-4" />,
    category: 'core',
    surfaces: {
      leftPanel: WorkflowExtension,
    },
    permissions: ['readResume', 'writeResume', 'callLLM', 'openLink'],
  },
  {
    id: 'company-job',
    name: '公司/岗位',
    icon: <Building2 className="h-4 w-4" />,
    category: 'core',
    surfaces: {
      leftPanel: CompanyJobExtension,
    },
    permissions: ['readResume', 'writeResume', 'callLLM', 'openLink'],
  },
  {
    id: 'suggestions',
    name: '建议',
    icon: <Lightbulb className="h-4 w-4" />,
    badge: 5, // Mock badge count
    category: 'core',
    surfaces: {
      leftPanel: SuggestionsExtension,
    },
    permissions: ['readResume', 'writeResume', 'callLLM'],
  },
  {
    id: 'learning',
    name: '学习',
    icon: <GraduationCap className="h-4 w-4" />,
    badge: 3, // Mock badge count
    category: 'core',
    surfaces: {
      leftPanel: LearningExtension,
    },
    permissions: ['readResume', 'callLLM', 'openLink'],
  },
  {
    id: 'interview',
    name: '面试',
    icon: <MessageSquare className="h-4 w-4" />,
    badge: 8, // Mock badge count
    category: 'core',
    surfaces: {
      leftPanel: InterviewExtension,
    },
    permissions: ['readResume', 'callLLM'],
  },
];

export const auxiliaryExtensions: Extension[] = [
  // Future extensions like templates, tracking, etc.
];

export const allExtensions = [...coreExtensions, ...auxiliaryExtensions];

export function getExtensionById(id: string): Extension | undefined {
  return allExtensions.find(ext => ext.id === id);
}

export function getExtensionsByCategory(category: 'core' | 'auxiliary'): Extension[] {
  return allExtensions.filter(ext => ext.category === category);
}