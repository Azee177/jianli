'use client';

import { Target, Link2, Check } from 'lucide-react';

export interface JobCard {
  company: string;
  role: string;
  city: string;
  link: string;
}

interface IntentPanelProps {
  jobCards: JobCard[];
  target: JobCard | null;
  onTargetSelect: (job: JobCard) => void;
}

export function IntentPanel({ jobCards, target, onTargetSelect }: IntentPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Target className="h-4 w-4" />
        单目标确认
      </div>
      <div className="mt-2 space-y-3">
        {jobCards.map((job) => (
          <div 
            key={`${job.company}-${job.role}`} 
            className="rounded-xl border border-white/10 bg-black/20 p-3"
          >
            <div className="text-sm font-medium">{job.company}</div>
            <div className="text-xs text-slate-400">{job.role}</div>
            <div className="text-xs text-slate-400 mt-1">{job.city}</div>
            <div className="mt-2 flex items-center justify-between">
              <a 
                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300" 
                href={job.link} 
                target="_blank" 
                rel="noreferrer"
              >
                <Link2 className="h-3 w-3" />
                JD
              </a>
              <button 
                disabled={Boolean(target)} 
                onClick={() => onTargetSelect(job)} 
                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs ${
                  target 
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-500" 
                    : "border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20"
                }`}
                type="button"
              >
                <Check className="h-3.5 w-3.5" />
                确认
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}