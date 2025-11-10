'use client';

import { 
  Briefcase,
  Lightbulb,
  GraduationCap,
  MessageSquare,
  Settings,
  User
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface VerticalNavBarProps {
  activeItem: string;
  onItemChange: (itemId: string) => void;
}

export function VerticalNavBar({
  activeItem,
  onItemChange,
}: VerticalNavBarProps) {
  const navItems: NavItem[] = [
    {
      id: 'chat',
      name: '对话',
      icon: <Logo className="w-6 h-6" />,
    },
    {
      id: 'workflow',
      name: 'AI 工作流',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'company',
      name: '公司/岗位',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      id: 'suggestions',
      name: '建议',
      icon: <Lightbulb className="h-5 w-5" />,
      badge: 3,
    },
    {
      id: 'learning',
      name: '学习',
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      id: 'interview',
      name: '面试',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 5,
    },
  ];

  return (
    <aside
      className="fixed left-0 top-0 z-30 h-screen w-12 border-r border-blue-200 bg-blue-50 flex flex-col shadow-md"
    >
      {/* 导航图标 */}
      <nav className="flex-1 py-2 overflow-y-hidden">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemChange(item.id)}
              className={`
                relative w-full h-12 flex items-center justify-center
                text-indigo-600 hover:text-blue-700 transition-all group
                ${activeItem === item.id ? 'text-blue-700' : ''}
              `}
              title={item.name}
            >
              {/* 激活指示器 */}
              {activeItem === item.id && (
                <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r shadow-md" />
              )}
              
              <div className="relative">
                {item.icon}
                {/* 徽章 */}
                {item.badge && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-md">
                    {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>

              {/* 悬停提示背景 */}
              <div className={`
                absolute left-0 w-full h-full -z-10 transition-all duration-200 rounded-lg
                ${activeItem === item.id ? 'bg-blue-100' : 'group-hover:bg-blue-100/60'}
              `} />
            </button>
          ))}
        </div>
      </nav>

      {/* 底部：用户和设置 */}
      <div className="border-t border-blue-200">
        <button
          className="relative w-full h-12 flex items-center justify-center text-indigo-600 hover:text-blue-700 hover:bg-blue-100/60 transition-all duration-200"
          title="设置"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="relative w-full h-12 flex items-center justify-center text-indigo-600 hover:text-blue-700 hover:bg-blue-100/60 transition-all duration-200"
          title="用户"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}

