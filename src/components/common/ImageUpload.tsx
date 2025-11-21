import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { processImage, validateImageFile, type UploadedImage } from '../../utils/image-processing';
import { toast } from '../../store/toast-store';
import './ImageUpload.css';

export type { UploadedImage } from '../../utils/image-processing';

export interface ImageUploadProps {
  onUpload: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false,
}: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Validate file count
      if (acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setIsProcessing(true);
      setUploadProgress(0);

      const processedImages: UploadedImage[] = [];
      const errors: string[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        // Validate file
        const validation = validateImageFile(file, maxSizeMB);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
          continue;
        }

        try {
          // Process image
          const processed = await processImage(file, maxSizeMB / 2);
          processedImages.push(processed);

          // Update progress
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
        } catch (error) {
          errors.push(`${file.name}: Failed to process`);
        }
      }

      setIsProcessing(false);
      setUploadProgress(0);

      // Show results
      if (processedImages.length > 0) {
        onUpload(processedImages);
        toast.success(`${processedImages.length} image(s) uploaded successfully`);
      }

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }
    },
    [disabled, maxFiles, maxSizeMB, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
    },
    maxFiles,
    disabled: disabled || isProcessing,
  });

  return (
    <div className="image-upload">
      <div
        {...getRootProps()}
        className={`image-upload__dropzone ${
          isDragActive ? 'image-upload__dropzone--active' : ''
        } ${disabled || isProcessing ? 'image-upload__dropzone--disabled' : ''}`}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="image-upload__processing">
            <div className="image-upload__spinner" role="status" aria-live="polite">
              <span className="sr-only">Processing images...</span>
            </div>
            <p>Processing images... {Math.round(uploadProgress)}%</p>
            <div className="image-upload__progress-bar">
              <div
                className="image-upload__progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="image-upload__content">
            <svg
              className="image-upload__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {isDragActive ? (
              <p className="image-upload__text">Drop images here...</p>
            ) : (
              <>
                <p className="image-upload__text">
                  <span className="image-upload__text--primary">Click to upload</span> or drag and
                  drop
                </p>
                <p className="image-upload__hint">
                  PNG, JPG, WebP up to {maxSizeMB}MB (max {maxFiles} files)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
