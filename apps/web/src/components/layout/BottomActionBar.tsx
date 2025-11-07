'use client';

import { Download, FileText, Globe, Bell } from 'lucide-react';
import { JobCard } from '../panels/IntentPanel';

interface BottomActionBarProps {
  target: JobCard | null;
  lockDims: boolean;
  onExportPDF: () => void;
  onExportWord: () => void;
  onGoToWebsite: () => void;
  onSetReminder: () => void;
}

export function BottomActionBar({
  target,
  lockDims,
  onExportPDF,
  onExportWord,
  onGoToWebsite,
  onSetReminder,
}: BottomActionBarProps) {
  const targetLabel = target 
    ? `${target.company} | ${target.role}${target.city ? ` · ${target.city}` : ''}` 
    : '未确认目标岗位';

  return (
    <div className="sticky bottom-3">
      <div className="mx-auto max-w-[1400px] px-3 md:px-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
          <div className="flex-1 text-xs text-slate-400">
            {target ? (
              <>
                当前目标：{targetLabel} · {lockDims ? '维度已锁定' : '维度未锁定'}
              </>
            ) : (
              <>未确认目标岗位</>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
              type="button"
            >
              <Download className="h-4 w-4" />
              导出 PDF
            </button>
            <button
              onClick={onExportWord}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
              type="button"
            >
              <FileText className="h-4 w-4" />
              导出 Word
            </button>
            <button
              onClick={onGoToWebsite}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
              type="button"
            >
              <Globe className="h-4 w-4" />
              前往官网投递
            </button>
            <button
              onClick={onSetReminder}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
              type="button"
            >
              <Bell className="h-4 w-4" />
              更新提醒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}