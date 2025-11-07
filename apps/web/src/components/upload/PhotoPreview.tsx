'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

interface PhotoPreviewProps {
  photoId?: string;
  photoUrl?: string;
  onUpload?: (file: File) => Promise<void>;
  onCrop?: (photoId: string, width: number, height: number) => Promise<string>;
  onRemove?: () => void;
  editable?: boolean;
}

export function PhotoPreview({
  photoId,
  photoUrl,
  onUpload,
  onCrop,
  onRemove,
  editable = true
}: PhotoPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);
  const [error, setError] = useState<string | null>(null);

  // 处理文件上传
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      if (onUpload) {
        await onUpload(file);
        // 创建本地预览URL
        const previewUrl = URL.createObjectURL(file);
        setCurrentPhotoUrl(previewUrl);
      }
    } catch (err) {
      setError('上传失败，请重试');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  // 处理裁剪
  const handleCrop = useCallback(async () => {
    if (!photoId || !onCrop) return;

    setIsCropping(true);
    setError(null);

    try {
      const newPhotoId = await onCrop(photoId, 300, 400);
      // 更新照片URL
      setCurrentPhotoUrl(`/api/photos/${newPhotoId}`);
      setShowCropDialog(false);
    } catch (err) {
      setError('裁剪失败，请重试');
      console.error('Crop error:', err);
    } finally {
      setIsCropping(false);
    }
  }, [photoId, onCrop]);

  // 删除照片
  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
      setCurrentPhotoUrl(undefined);
    }
  }, [onRemove]);

  return (
    <div className="photo-preview-container">
      <div className="photo-preview-wrapper">
        {currentPhotoUrl ? (
          <div className="photo-display">
            <div className="photo-frame">
              <img
                src={currentPhotoUrl}
                alt="简历照片"
                className="photo-image"
              />
            </div>

            {editable && (
              <div className="photo-actions">
                <label className="action-button upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  重新上传
                </label>

                <button
                  onClick={() => setShowCropDialog(true)}
                  className="action-button crop-button"
                  disabled={isCropping}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  裁剪
                </button>

                <button
                  onClick={handleRemove}
                  className="action-button remove-button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="photo-upload-area">
            <label className="upload-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              <div className="upload-content">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="upload-text">
                  {isUploading ? '上传中...' : '点击上传照片'}
                </p>
                <p className="upload-hint">支持JPG、PNG格式，最大5MB</p>
              </div>
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* 裁剪对话框 */}
      {showCropDialog && (
        <div className="crop-dialog-overlay">
          <div className="crop-dialog">
            <h3 className="crop-dialog-title">裁剪照片</h3>
            <div className="crop-dialog-content">
              <p>将照片裁剪为标准证件照尺寸（3:4比例）</p>
              <div className="crop-preview">
                {currentPhotoUrl && (
                  <img src={currentPhotoUrl} alt="预览" className="crop-preview-image" />
                )}
              </div>
            </div>
            <div className="crop-dialog-actions">
              <button
                onClick={() => setShowCropDialog(false)}
                className="button-secondary"
                disabled={isCropping}
              >
                取消
              </button>
              <button
                onClick={handleCrop}
                className="button-primary"
                disabled={isCropping}
              >
                {isCropping ? '裁剪中...' : '确认裁剪'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .photo-preview-container {
          width: 100%;
          max-width: 400px;
        }

        .photo-preview-wrapper {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .photo-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .photo-frame {
          width: 200px;
          height: 267px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: #f9fafb;
        }

        .photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #d1d5db;
          background: white;
        }

        .action-button:hover {
          background: #f9fafb;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-button {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .crop-button {
          color: #8b5cf6;
          border-color: #8b5cf6;
        }

        .remove-button {
          color: #ef4444;
          border-color: #ef4444;
        }

        .photo-upload-area {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-zone {
          width: 100%;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 40px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-zone:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          color: #9ca3af;
        }

        .upload-text {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
        }

        .upload-hint {
          font-size: 14px;
          color: #6b7280;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          color: #dc2626;
          font-size: 14px;
        }

        .hidden {
          display: none;
        }

        .crop-dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .crop-dialog {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .crop-dialog-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .crop-dialog-content {
          margin-bottom: 24px;
        }

        .crop-preview {
          margin-top: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .crop-preview-image {
          width: 100%;
          height: auto;
        }

        .crop-dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .button-secondary {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button-secondary:hover {
          background: #f9fafb;
        }

        .button-primary {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          border: none;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button-primary:hover {
          background: #2563eb;
        }

        .button-primary:disabled,
        .button-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

