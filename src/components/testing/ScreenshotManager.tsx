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
  const [previewImage, setPreviewImage] = useState<Screenshot | null>(null);
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
          {screenshots.map((screenshot) => (
            <div key={screenshot.id} className="screenshot-card">
              <div className="screenshot-card__image-container">
                <img
                  src={screenshot.dataUrl}
                  alt={screenshot.caption || screenshot.filename}
                  className="screenshot-card__image"
                  onClick={() => setPreviewImage(screenshot)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreviewImage(screenshot);
                    }
                  }}
                />
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
      {previewImage && (
        <div
          className="screenshot-preview"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
        >
          <div className="screenshot-preview__content" onClick={(e) => e.stopPropagation()}>
            <button
              className="screenshot-preview__close"
              onClick={() => setPreviewImage(null)}
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

            <img
              src={previewImage.dataUrl}
              alt={previewImage.caption || previewImage.filename}
              className="screenshot-preview__image"
            />

            {previewImage.caption && (
              <p className="screenshot-preview__caption">{previewImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
