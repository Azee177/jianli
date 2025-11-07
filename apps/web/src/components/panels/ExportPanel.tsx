'use client';

import { Download, FileText } from 'lucide-react';

interface ExportPanelProps {
  onExportPDF: () => void;
  onExportWord: () => void;
}

export function ExportPanel({ onExportPDF, onExportWord }: ExportPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Download className="h-4 w-4" />
        导出与投递
      </div>
      <div className="mt-3 flex items-center gap-2">
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
      </div>
      <div className="mt-3 text-xs text-slate-400">
        导出完成后可前往官网投递，系统将提供投递链接和更新提醒。
      </div>
    </div>
  );
}