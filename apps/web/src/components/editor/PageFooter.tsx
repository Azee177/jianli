'use client';

import { DocumentMetadata } from '../../types/editor';

interface PageFooterProps {
  metadata?: DocumentMetadata;
  pageNumber: number;
  totalPages: number;
  showPageNumbers?: boolean;
  showDate?: boolean;
  customFooter?: string;
}

export function PageFooter({
  metadata,
  pageNumber,
  totalPages,
  showPageNumbers = true,
  showDate = false,
  customFooter,
}: PageFooterProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="page-footer flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-2 mt-4">
      <div className="footer-left">
        {showDate && metadata?.modifiedAt && (
          <span>更新于 {formatDate(metadata.modifiedAt)}</span>
        )}
      </div>
      
      <div className="footer-center">
        {customFooter && (
          <span>{customFooter}</span>
        )}
      </div>
      
      <div className="footer-right">
        {showPageNumbers && (
          <span>{pageNumber} / {totalPages}</span>
        )}
      </div>
    </div>
  );
}