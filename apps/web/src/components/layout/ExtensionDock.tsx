'use client';

import { useState } from 'react';
import { 
  Building2, 
  Lightbulb, 
  GraduationCap, 
  MessageSquare,
  Plus,
  Settings
} from 'lucide-react';
import { Extension } from '@/types/extensions';

interface ExtensionDockProps {
  extensions: Extension[];
  activeExtension: string | null;
  onExtensionSelect: (extensionId: string) => void;
  onNewResume: () => void;
}

export function ExtensionDock({
  extensions,
  activeExtension,
  onExtensionSelect,
  onNewResume
}: ExtensionDockProps) {
  const [hoveredExtension, setHoveredExtension] = useState<string | null>(null);

  const coreExtensions = extensions.filter(ext => ext.category === 'core');
  const auxiliaryExtensions = extensions.filter(ext => ext.category === 'auxiliary');

  const DockButton = ({ 
    extension, 
    isActive, 
    onClick 
  }: { 
    extension: Extension; 
    isActive: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      onMouseEnter={() => setHoveredExtension(extension.id)}
      onMouseLeave={() => setHoveredExtension(null)}
      className={`
        relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200
        ${isActive 
          ? 'border-blue-300 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100' 
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600'
        }
      `}
      title={extension.name}
    >
      <div className="relative">
        {extension.icon}
        {extension.badge && (
          <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {typeof extension.badge === 'number' && extension.badge > 99 ? '99+' : extension.badge}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      {hoveredExtension === extension.id && (
        <div className="absolute left-full ml-2 z-50 rounded-lg bg-gray-800 px-2 py-1 text-xs text-white shadow-lg">
          {extension.name}
        </div>
      )}
    </button>
  );

  return (
    <aside className="flex w-16 flex-col border-r border-gray-200 bg-gray-50 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-3 p-3">
        {/* 新建简历按钮 */}
        <button
          onClick={onNewResume}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          title="新建简历"
        >
          <Plus className="h-5 w-5" />
        </button>

        <div className="h-px w-8 bg-gray-200" />

        {/* 核心扩展 */}
        <div className="flex flex-col gap-2">
          {coreExtensions.map((extension) => (
            <DockButton
              key={extension.id}
              extension={extension}
              isActive={activeExtension === extension.id}
              onClick={() => onExtensionSelect(extension.id)}
            />
          ))}
        </div>

        {auxiliaryExtensions.length > 0 && (
          <>
            <div className="h-px w-8 bg-gray-200" />
            
            {/* 辅助扩展 */}
            <div className="flex flex-col gap-2">
              {auxiliaryExtensions.map((extension) => (
                <DockButton
                  key={extension.id}
                  extension={extension}
                  isActive={activeExtension === extension.id}
                  onClick={() => onExtensionSelect(extension.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 底部设置 */}
      <div className="mt-auto p-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          title="设置"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}