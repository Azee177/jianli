'use client';

import { DocumentMetadata } from '../../types/editor';

interface PageHeaderProps {
  metadata?: DocumentMetadata;
  pageNumber: number;
  totalPages: number;
  showPageNumbers?: boolean;
  customHeader?: string;
}

export function PageHeader({
  metadata,
  pageNumber,
  totalPages,
  showPageNumbers = true,
  customHeader,
}: PageHeaderProps) {
  return (
    <div className="page-header flex justify-between items-center text-xs text-gray-500 border-b border-gray-200 pb-2 mb-4">
      <div className="header-left">
        {customHeader || metadata?.title || '简历'}
      </div>
      
      <div className="header-center">
        {metadata?.author && (
          <span>{metadata.author}</span>
        )}
      </div>
      
      <div className="header-right">
        {showPageNumbers && (
          <span>第 {pageNumber} 页，共 {totalPages} 页</span>
        )}
      </div>
    </div>
  );
}