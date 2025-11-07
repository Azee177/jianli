'use client';

import React, { useState } from 'react';
import { Plus, FolderOpen, Calendar, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedCard } from '@/components/ui/EnhancedCard';
import { DEFAULT_RESUME_DATA } from '@/lib/constants';

export function ProjectSelector() {
  const { 
    projects, 
    currentProject, 
    createProject, 
    switchProject, 
    deleteProject,
    isLoading 
  } = useProjects();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await createProject(newProjectName.trim(), DEFAULT_RESUME_DATA);
      setNewProjectName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      try {
        await deleteProject(projectId);
        setShowProjectMenu(null);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-20 bg-white/10 rounded"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">我的项目</h2>
        <EnhancedButton
          onClick={() => setShowCreateForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </EnhancedButton>
      </div>

      {showCreateForm && (
        <EnhancedCard className="p-4">
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                项目名称
              </label>
              <EnhancedInput
                value={newProjectName}
                onChange={(value) => setNewProjectName(value)}
                placeholder="输入项目名称"
                disabled={isCreating}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <EnhancedButton
                type="submit"
                size="sm"
                disabled={!newProjectName.trim() || isCreating}
                loading={isCreating}
              >
                创建
              </EnhancedButton>
              <EnhancedButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProjectName('');
                }}
                disabled={isCreating}
              >
                取消
              </EnhancedButton>
            </div>
          </form>
        </EnhancedCard>
      )}

      <div className="space-y-2">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>还没有项目</p>
            <p className="text-sm">创建第一个项目开始使用</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`relative group rounded-lg border p-3 cursor-pointer transition-all ${
                currentProject?.id === project.id
                  ? 'border-sky-500/50 bg-sky-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => switchProject(project.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-200 truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </span>
                    <span>
                      {project.targets.length} 个目标职位
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProjectMenu(
                        showProjectMenu === project.id ? null : project.id
                      );
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>

                  {showProjectMenu === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl z-10">
                      <div className="p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                            setShowProjectMenu(null);
                          }}
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          重命名
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentProject?.id === project.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}