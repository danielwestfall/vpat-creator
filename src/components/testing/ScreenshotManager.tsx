import { useState } from 'react';
import type { Screenshot } from '../../models/types';
import { ImageUpload, type UploadedImage } from '../common/ImageUpload';
import { toast } from '../../store/toast-store';
import './ScreenshotManager.css';

export interface ScreenshotManagerProps {
  testResultId: string;
  componentId: string;
  screenshots: Screenshot[];
  onAdd: (screenshot: Omit<Screenshot, 'id' | 'createdAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateCaption: (id: string, caption: string) => Promise<void>;
}

export function ScreenshotManager({
  testResultId,
  componentId,
  screenshots,
  onAdd,
  onDelete,
  onUpdateCaption,
}: ScreenshotManagerProps) {
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');

  const handleUpload = async (images: UploadedImage[]) => {
    try {
      for (const image of images) {
        await onAdd({
          testResultId,
          componentId,
          filename: image.fileName,
          dataUrl: image.base64Data,
          caption: '',
          uploadedDate: new Date(),
        });
      }
    } catch (error) {
      toast.error('Failed to save screenshots');
      console.error('Screenshot save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this screenshot?')) {
      try {
        await onDelete(id);
        toast.success('Screenshot deleted');
        if (previewIndex !== -1) {
          setPreviewIndex(-1);
        }
      } catch (error) {
        toast.error('Failed to delete screenshot');
        console.error('Screenshot delete error:', error);
      }
    }
  };

  const handleSaveCaption = async (id: string) => {
    try {
      await onUpdateCaption(id, captionText);
      setEditingCaption(null);
      setCaptionText('');
      toast.success('Caption updated');
    } catch (error) {
      toast.error('Failed to update caption');
      console.error('Caption update error:', error);
    }
  };

  const startEditCaption = (screenshot: Screenshot) => {
    setEditingCaption(screenshot.id);
    setCaptionText(screenshot.caption || '');
  };

  const openPreview = (index: number) => {
    setPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewIndex(-1);
  };

  const nextPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewIndex < screenshots.length - 1) {
      setPreviewIndex(previewIndex + 1);
    }
  };

  const prevPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const currentPreview = previewIndex !== -1 ? screenshots[previewIndex] : null;

  return (
    <div className="screenshot-manager">
      <div className="screenshot-manager__header">
        <h3 className="screenshot-manager__title">Screenshots</h3>
        <p className="screenshot-manager__count">
          {screenshots.length} {screenshots.length === 1 ? 'image' : 'images'}
        </p>
      </div>

      <ImageUpload onUpload={handleUpload} maxFiles={10} maxSizeMB={10} />

      {screenshots.length > 0 && (
        <div className="screenshot-manager__grid">
          {screenshots.map((screenshot, index) => (
            <div key={screenshot.id} className="screenshot-card">
              <div className="screenshot-card__image-container">
                <button
                  type="button"
                  className="screenshot-card__image-button"
                  onClick={() => openPreview(index)}
                  aria-label={`View screenshot: ${screenshot.caption || screenshot.filename}`}
                >
                  <img src={screenshot.dataUrl} alt="" className="screenshot-card__image" />
                </button>
                <button
                  className="screenshot-card__delete"
                  onClick={() => handleDelete(screenshot.id)}
                  aria-label={`Delete ${screenshot.filename}`}
                  title="Delete screenshot"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4l8 8m0-8l-8 8"
                    />
                  </svg>
                </button>
              </div>

              <div className="screenshot-card__info">
                <p className="screenshot-card__filename">{screenshot.filename}</p>

                {editingCaption === screenshot.id ? (
                  <div className="screenshot-card__caption-edit">
                    <input
                      type="text"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Add caption..."
                      className="screenshot-card__caption-input"
                      aria-label="Screenshot caption"
                    />
                    <div className="screenshot-card__caption-actions">
                      <button
                        onClick={() => handleSaveCaption(screenshot.id)}
                        className="screenshot-card__caption-save"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCaption(null);
                          setCaptionText('');
                        }}
                        className="screenshot-card__caption-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditCaption(screenshot)}
                    className="screenshot-card__caption-button"
                  >
                    {screenshot.caption || 'Add caption...'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {currentPreview && (
        <div
          className="screenshot-preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePreview();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closePreview();
            }
            if (e.key === 'ArrowRight') {
              nextPreview();
            }
            if (e.key === 'ArrowLeft') {
              prevPreview();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close preview"
        >
          <div
            className="screenshot-preview__content"
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot preview"
          >
            <button
              className="screenshot-preview__close"
              onClick={closePreview}
              aria-label="Close preview"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6l12 12m0-12L6 18"
                />
              </svg>
            </button>

            {previewIndex > 0 && (
              <button
                className="screenshot-preview__nav screenshot-preview__nav--prev"
                onClick={prevPreview}
                aria-label="Previous screenshot"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {previewIndex < screenshots.length - 1 && (
              <button
                className="screenshot-preview__nav screenshot-preview__nav--next"
                onClick={nextPreview}
                aria-label="Next screenshot"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            <img
              src={currentPreview.dataUrl}
              alt={currentPreview.caption || currentPreview.filename}
              className="screenshot-preview__image"
            />

            <div className="screenshot-preview__footer">
              <p className="screenshot-preview__counter">
                {previewIndex + 1} / {screenshots.length}
              </p>
              {currentPreview.caption && (
                <p className="screenshot-preview__caption">{currentPreview.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
