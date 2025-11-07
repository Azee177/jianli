'use client';

import { Globe } from 'lucide-react';

interface CompanyPanelProps {
  companyContent: string;
  onContentChange: (content: string) => void;
}

export function CompanyPanel({ companyContent, onContentChange }: CompanyPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Globe className="h-4 w-4" />
        公司定制（1/4）
      </div>
      <textarea
        value={companyContent}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="将从官网/价值观/博客提炼语气与要点，镜像措辞。"
        className="mt-2 w-full min-h-[120px] rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-white/20"
      />
      <div className="mt-2 text-xs text-slate-500">
        提示：在页面中选中内容，点击工具条的「→ 1/4」可同步到右侧公司区。
      </div>
    </div>
  );
}