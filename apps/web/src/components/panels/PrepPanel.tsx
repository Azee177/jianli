'use client';

import { BookOpen } from 'lucide-react';

interface PrepItem {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
}

interface PrepPanelProps {
  prepItems?: PrepItem[];
}

const defaultPrepItems: PrepItem[] = [
  {
    id: '1',
    title: 'SQL/A-B 测试',
    description: '官方文档 + B站课程链接（自动摘要与练习）',
  },
  {
    id: '2',
    title: '指标口径',
    description: '留存/转化/DAU 定义校验',
  },
];

export function PrepPanel({ prepItems = defaultPrepItems }: PrepPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <BookOpen className="h-4 w-4" />
        准备清单
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {prepItems.map((item) => (
          <li key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="font-medium text-slate-200">{item.title}</div>
            <div className="text-xs text-slate-400 mt-1">{item.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}