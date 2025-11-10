'use client';

import { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';

interface ExportButtonProps {
  resumeId?: string;
}

export function ExportButton({ resumeId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!resumeId) {
      alert('请先上传或创建简历');
      return;
    }

    setIsExporting(true);
    setShowMenu(false);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/exports/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'demo-user',
        },
        body: JSON.stringify({
          resume_id: resumeId,
        }),
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const data = await response.json();
      
      // 轮询任务状态
      const taskId = data.task_id;
      const checkStatus = async () => {
        const statusResponse = await fetch(`${API_BASE}/tasks/${taskId}`, {
          headers: {
            'X-User-ID': 'demo-user',
          },
        });
        const taskData = await statusResponse.json();

        if (taskData.status === 'completed') {
          // 获取导出结果
          const exportResponse = await fetch(`${API_BASE}/exports/${data.export_id}`, {
            headers: {
              'X-User-ID': 'demo-user',
            },
          });
          const exportData = await exportResponse.json();

          // 下载文件
          if (exportData.download_url) {
            window.open(exportData.download_url, '_blank');
          }
          setIsExporting(false);
        } else if (taskData.status === 'failed') {
          throw new Error(taskData.error || '导出失败');
        } else {
          // 继续轮询
          setTimeout(checkStatus, 1000);
        }
      };

      checkStatus();
    } catch (error) {
      console.error('Export error:', error);
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !resumeId}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        title="导出简历"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isExporting ? '导出中...' : '导出'}
        </span>
      </button>

      {showMenu && !isExporting && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <button
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">导出为 PDF</div>
              <div className="text-xs text-gray-500">适合打印和分享</div>
            </div>
          </button>

          <div className="border-t border-gray-100" />

          <button
            onClick={() => handleExport('docx')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
          >
            <File className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">导出为 Word</div>
              <div className="text-xs text-gray-500">可继续编辑</div>
            </div>
          </button>
        </div>
      )}

      {/* 点击外部关闭菜单 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

