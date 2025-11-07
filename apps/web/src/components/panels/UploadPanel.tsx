'use client';

import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Resume } from '@/lib/types';

interface UploadPanelProps {
  resume: Resume | null;
  isUploading: boolean;
  uploadError: string | null;
  onUpload: (input: { file?: File; text?: string }) => Promise<Resume>;
}

export const UploadPanel = React.memo(function UploadPanel({ 
  resume, 
  isUploading, 
  uploadError, 
  onUpload 
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onUpload({ file });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Upload className="h-4 w-4" />
        上传 & 解析
      </div>
      <div className="mt-2 text-xs text-slate-400">
        支持 PDF、Word 文档或直接粘贴文本
      </div>
      
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-200 hover:bg-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? '上传中...' : '选择文件'}
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
          type="button"
        >
          <FileText className="h-4 w-4" />
          模板
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="mt-3 flex items-center gap-2 text-xs">
        {uploadError ? (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-red-400">{uploadError}</span>
          </>
        ) : resume ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">简历已上传</span>
            <span className="mx-1 text-slate-400">·</span>
            <span className="text-slate-400">ID: {resume.id}</span>
          </>
        ) : (
          <span className="text-slate-400">尚未上传</span>
        )}
      </div>
      
      {resume && (
        <div className="mt-2 text-xs text-slate-500">
          <div>技能: {resume.skills.length > 0 ? resume.skills.join(', ') : '未识别'}</div>
          {resume.contacts.name && (
            <div>姓名: {resume.contacts.name}</div>
          )}
        </div>
      )}
    </div>
  );
});