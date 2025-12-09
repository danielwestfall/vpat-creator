import React, { useState } from 'react';
import { Button } from '../common';
import {
  externalImportService,
  type ExternalImportResult,
} from '../../services/external-import-service';
import type { MappedResult } from '../../services/axe-service';
import './ExternalImportDialog.css';

interface ExternalImportDialogProps {
  onClose: () => void;
  onImport: (results: MappedResult[]) => void;
}

export function ExternalImportDialog({ onClose, onImport }: ExternalImportDialogProps) {
  const [importResult, setImportResult] = useState<ExternalImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await externalImportService.parseImportFile(file);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        errors: ['Unexpected error during import'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (importResult?.data) {
      onImport(importResult.data);
      onClose();
    }
  };

  return (
    <div className="external-import-dialog">
      <div
        className="external-import-dialog__overlay"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close dialog"
      />

      <div className="external-import-dialog__content" role="dialog" aria-modal="true">
        <div className="external-import-dialog__header">
          <h2>🤖 Import Tool Results</h2>
          <button className="external-import-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="external-import-dialog__body">
          {!importResult ? (
            <div className="import-upload-area">
              <label htmlFor="tool-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                <h3>Upload Tool Export</h3>
                <p style={{ color: '#64748b' }}>
                  Select a JSON file from a supported accessibility tool.
                  <br />
                  <small>Supported: axe-core (JSON)</small>
                </p>
                <Button variant="primary" style={{ marginTop: '1rem', pointerEvents: 'none' }}>
                  Select JSON File
                </Button>
              </label>
              <input
                id="tool-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {isLoading && <p style={{ marginTop: '1rem', color: '#6366f1' }}>Processing...</p>}
            </div>
          ) : (
            <>
              <div className="import-summary">
                <h3>Import Analysis ({importResult.source})</h3>
                <div className="import-stats">
                  <div className="stat-item">
                    <div className="stat-value">{importResult.summary?.total || 0}</div>
                    <div className="stat-label">Total Rules</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: '#ef4444' }}>
                      {importResult.summary?.violations || 0}
                    </div>
                    <div className="stat-label">Violations</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: '#10b981' }}>
                      {importResult.summary?.passes || 0}
                    </div>
                    <div className="stat-label">Passes</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: '#f59e0b' }}>
                      {importResult.summary?.incomplete || 0}
                    </div>
                    <div className="stat-label">Incomplete</div>
                  </div>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="import-errors">
                  <h4>⚠️ Issues Found</h4>
                  <ul>
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
                Importing will map these automated results to the corresponding WCAG Success
                Criteria. Violations will be marked as "Does Not Support" with details in the notes.
              </p>
            </>
          )}
        </div>

        <div className="external-import-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {importResult?.success && (importResult.data?.length || 0) > 0 && (
            <Button variant="primary" onClick={handleConfirmImport}>
              Import {importResult.data?.length} Mapped Issues
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
