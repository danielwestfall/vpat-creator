import React, { useState } from 'react';
import { Button } from '../common';
import { csvImportService, type ImportResult } from '../../services/csv-import-service';
import type { TestResult } from '../../models/types';
import './BatchImportDialog.css';

interface BatchImportDialogProps {
  onClose: () => void;
  onImport: (results: TestResult[]) => void;
}

export function BatchImportDialog({ onClose, onImport }: BatchImportDialogProps) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await csvImportService.parseCSV(file);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        errors: ['Unexpected error during import']
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
    <div className="batch-import-dialog">
      <div 
        className="batch-import-dialog__overlay" 
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close dialog"
      />

      <div className="batch-import-dialog__content" role="dialog" aria-modal="true">
        <div className="batch-import-dialog__header">
          <h2>📥 Batch Import Results</h2>
          <button className="batch-import-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="batch-import-dialog__body">
          {!importResult ? (
            <div className="import-upload-area">
              <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3>Upload CSV File</h3>
                <p style={{ color: '#64748b' }}>
                  Select a CSV file to import test results. 
                  <br />
                  <small>Required columns: "SC Number", "Conformance Status"</small>
                </p>
                <Button variant="primary" style={{ marginTop: '1rem', pointerEvents: 'none' }}>
                  Select CSV File
                </Button>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {isLoading && <p style={{ marginTop: '1rem', color: '#6366f1' }}>Processing...</p>}
            </div>
          ) : (
            <>
              <div className="import-summary">
                <h3>Import Analysis</h3>
                <div className="import-stats">
                  <div className="stat-item">
                    <div className="stat-value">{importResult.summary?.total || 0}</div>
                    <div className="stat-label">Total Rows</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: '#10b981' }}>
                      {importResult.summary?.imported || 0}
                    </div>
                    <div className="stat-label">Valid Results</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: '#f59e0b' }}>
                      {importResult.summary?.skipped || 0}
                    </div>
                    <div className="stat-label">Skipped</div>
                  </div>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="import-errors">
                  <h4>⚠️ Issues Found</h4>
                  <ul>
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>...and {importResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
                Clicking "Import" will merge these results into your current audit. 
                Existing results for the same criteria will be overwritten.
              </p>
            </>
          )}
        </div>

        <div className="batch-import-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {importResult?.success && (importResult.data?.length || 0) > 0 && (
            <Button variant="primary" onClick={handleConfirmImport}>
              Import {importResult.data?.length} Results
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
