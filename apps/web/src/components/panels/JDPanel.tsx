'use client';

import { useState } from 'react';
import { FileText, CheckCircle2, Lock, Unlock, Loader2, AlertCircle, Link, Type } from 'lucide-react';
import { JD } from '@/lib/types';

export interface Dimension {
  id: string;
  label: string;
  checked: boolean;
}

interface JDPanelProps {
  jd: JD | null;
  isParsingJD: boolean;
  jdError: string | null;
  dimensions: Dimension[];
  lockDims: boolean;
  onParseJD: (input: { url?: string; text?: string }) => Promise<JD>;
  onToggleDim: (id: string) => void;
  onUpdateDimLabel: (id: string, label: string) => void;
  onToggleLock: () => void;
}

export function JDPanel({ 
  jd,
  isParsingJD,
  jdError,
  dimensions, 
  lockDims, 
  onParseJD,
  onToggleDim, 
  onUpdateDimLabel, 
  onToggleLock 
}: JDPanelProps) {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleParseJD = async () => {
    try {
      if (inputMode === 'url' && urlInput.trim()) {
        await onParseJD({ url: urlInput.trim() });
      } else if (inputMode === 'text' && textInput.trim()) {
        await onParseJD({ text: textInput.trim() });
      }
    } catch (error) {
      console.error('JD parse failed:', error);
    }
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4" />
        JD 解析 & 共性
      </div>
      
      {/* JD 输入区域 */}
      {!jd && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('url')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                inputMode === 'url' 
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-200' 
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Link className="h-3.5 w-3.5" />
              URL
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                inputMode === 'text' 
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-200' 
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              文本
            </button>
          </div>
          
          {inputMode === 'url' ? (
            <input
              type="url"
              placeholder="粘贴 JD 链接..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder-slate-500 outline-none focus:border-sky-500/30"
            />
          ) : (
            <textarea
              placeholder="粘贴 JD 内容..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder-slate-500 outline-none focus:border-sky-500/30 resize-none"
            />
          )}
          
          <button
            onClick={handleParseJD}
            disabled={isParsingJD || (inputMode === 'url' ? !urlInput.trim() : !textInput.trim())}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-200 hover:bg-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isParsingJD ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {isParsingJD ? '解析中...' : '解析 JD'}
          </button>
        </div>
      )}

      {/* 错误显示 */}
      {jdError && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {jdError}
        </div>
      )}

      {/* JD 信息显示 */}
      {jd && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">JD 已解析</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
            <div className="font-medium text-slate-200">{jd.company} · {jd.title}</div>
            <div className="mt-1 text-slate-400">
              必备技能: {jd.must_have_skills.length > 0 ? jd.must_have_skills.join(', ') : '未识别'}
            </div>
          </div>
        </div>
      )}

      {/* 维度选择 */}
      {jd && (
        <>
          <div className="mt-4 text-xs font-medium text-slate-300">共性维度（4~5）</div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {dimensions.map((dim) => (
              <label 
                key={dim.id} 
                className={`group flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                  dim.checked 
                    ? "border-emerald-500/30 bg-emerald-500/5" 
                    : "border-white/10 bg-white/5"
                } ${
                  lockDims ? "opacity-60" : "hover:bg-white/10"
                }`}
              >
                <input 
                  type="checkbox" 
                  className="mt-1" 
                  checked={dim.checked} 
                  onChange={() => onToggleDim(dim.id)} 
                  disabled={lockDims} 
                />
                <input 
                  className="flex-1 bg-transparent outline-none" 
                  value={dim.label} 
                  onChange={(event) => onUpdateDimLabel(dim.id, event.target.value)} 
                  disabled={lockDims} 
                />
                {dim.checked && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              锁定后将基于这些维度生成首稿
            </div>
            <button 
              onClick={onToggleLock} 
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                lockDims 
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20" 
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
              }`}
              type="button"
            >
              {lockDims ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {lockDims ? "解锁" : "锁定"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}