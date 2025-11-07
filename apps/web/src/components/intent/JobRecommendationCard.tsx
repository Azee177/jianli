'use client';

import React, { useState } from 'react';

interface JobSuggestion {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  match_score: number;
  match_reasons: string[];
  source: string;
  requirements?: string[];
}

interface JobRecommendationCardProps {
  job: JobSuggestion;
  onConfirm?: (jobId: string) => Promise<void>;
  isSelected?: boolean;
  showDetails?: boolean;
}

export function JobRecommendationCard({
  job,
  onConfirm,
  isSelected = false,
  showDetails = false
}: JobRecommendationCardProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;

    setIsConfirming(true);
    try {
      await onConfirm(job.id);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to confirm job:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.9) return '#10b981'; // green
    if (score >= 0.8) return '#3b82f6'; // blue
    if (score >= 0.7) return '#f59e0b'; // orange
    return '#6b7280'; // gray
  };

  const getSourceBadge = (source: string) => {
    if (source === 'official_site') {
      return { text: '官网', color: '#8b5cf6' };
    }
    return { text: '招聘网站', color: '#6b7280' };
  };

  const sourceBadge = getSourceBadge(job.source);

  return (
    <>
      <div className={`job-card ${isSelected ? 'job-card-selected' : ''}`}>
        {/* 头部 */}
        <div className="job-header">
          <div className="job-header-left">
            <h3 className="job-title">{job.title}</h3>
            <div className="job-meta">
              <span className="job-company">{job.company}</span>
              <span className="job-divider">•</span>
              <span className="job-location">{job.location}</span>
              {job.salary_range && (
                <>
                  <span className="job-divider">•</span>
                  <span className="job-salary">{job.salary_range}</span>
                </>
              )}
            </div>
          </div>

          <div className="job-badges">
            <span
              className="source-badge"
              style={{ background: sourceBadge.color }}
            >
              {sourceBadge.text}
            </span>
          </div>
        </div>

        {/* 匹配度 */}
        <div className="match-section">
          <div className="match-score-container">
            <div className="match-score-label">匹配度</div>
            <div className="match-score-bar">
              <div
                className="match-score-fill"
                style={{
                  width: `${job.match_score * 100}%`,
                  background: getMatchScoreColor(job.match_score)
                }}
              />
            </div>
            <div
              className="match-score-value"
              style={{ color: getMatchScoreColor(job.match_score) }}
            >
              {Math.round(job.match_score * 100)}%
            </div>
          </div>
        </div>

        {/* 匹配原因 */}
        <div className="match-reasons">
          <div className="match-reasons-title">匹配原因</div>
          <ul className="match-reasons-list">
            {job.match_reasons.map((reason, index) => (
              <li key={index} className="match-reason-item">
                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* 展开的详情 */}
        {expanded && job.requirements && job.requirements.length > 0 && (
          <div className="job-details">
            <div className="job-details-title">岗位要求</div>
            <ul className="requirements-list">
              {job.requirements.map((req, index) => (
                <li key={index} className="requirement-item">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="job-actions">
          <button
            onClick={() => setExpanded(!expanded)}
            className="action-button action-button-secondary"
          >
            {expanded ? '收起' : '查看详情'}
          </button>

          <button
            onClick={() => setShowConfirmDialog(true)}
            className="action-button action-button-primary"
            disabled={isConfirming}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            确认为目标岗位
          </button>
        </div>

        {isSelected && (
          <div className="selected-badge">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            已选择
          </div>
        )}
      </div>

      {/* 确认对话框 */}
      {showConfirmDialog && (
        <div className="dialog-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">确认目标岗位</h3>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="dialog-close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="dialog-content">
              <div className="warning-box">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="warning-title">确认后将开始针对性优化</p>
                  <p className="warning-text">
                    系统将为您抓取相关JD、分析共性、优化简历。<br />
                    如果重新选择，已生成的数据将被清空。
                  </p>
                </div>
              </div>

              <div className="job-summary">
                <div className="job-summary-title">选择的岗位：</div>
                <div className="job-summary-info">
                  <div><strong>{job.title}</strong></div>
                  <div>{job.company} • {job.location}</div>
                  {job.salary_range && <div>{job.salary_range}</div>}
                </div>
              </div>
            </div>

            <div className="dialog-actions">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="dialog-button dialog-button-secondary"
                disabled={isConfirming}
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="dialog-button dialog-button-primary"
                disabled={isConfirming}
              >
                {isConfirming ? '确认中...' : '确认选择'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .job-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
          position: relative;
        }

        .job-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .job-card-selected {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .job-header-left {
          flex: 1;
        }

        .job-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .job-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .job-company {
          font-weight: 500;
          color: #374151;
        }

        .job-divider {
          color: #d1d5db;
        }

        .job-salary {
          color: #10b981;
          font-weight: 500;
        }

        .job-badges {
          display: flex;
          gap: 8px;
        }

        .source-badge {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .match-section {
          margin-bottom: 20px;
        }

        .match-score-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .match-score-label {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          min-width: 60px;
        }

        .match-score-bar {
          flex: 1;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .match-score-fill {
          height: 100%;
          transition: width 0.6s ease;
          border-radius: 4px;
        }

        .match-score-value {
          font-size: 16px;
          font-weight: 600;
          min-width: 50px;
          text-align: right;
        }

        .match-reasons {
          margin-bottom: 20px;
        }

        .match-reasons-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .match-reasons-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .match-reason-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .job-details {
          margin-bottom: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .job-details-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .requirement-item {
          font-size: 14px;
          color: #6b7280;
          padding-left: 16px;
          position: relative;
        }

        .requirement-item::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #9ca3af;
        }

        .job-actions {
          display: flex;
          gap: 12px;
        }

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .action-button-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .action-button-secondary:hover {
          background: #e5e7eb;
        }

        .action-button-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .selected-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #10b981;
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        /* 对话框样式 */
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dialog {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .dialog-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .dialog-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .dialog-close:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .dialog-content {
          padding: 24px;
        }

        .warning-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          margin-bottom: 20px;
          color: #92400e;
        }

        .warning-box svg {
          flex-shrink: 0;
        }

        .warning-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .warning-text {
          font-size: 14px;
          line-height: 1.5;
        }

        .job-summary {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .job-summary-title {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .job-summary-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          color: #374151;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .dialog-button {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .dialog-button-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .dialog-button-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .dialog-button-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .dialog-button-primary:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .dialog-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

