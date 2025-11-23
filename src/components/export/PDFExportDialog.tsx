import { useState } from 'react';
import { Button } from '../common/Button';
import { toast } from '../../store/toast-store';
import { generateVPATPDF, downloadPDF } from '../../services/pdf-export-service';
import type { Project, Component, TestResult, Screenshot } from '../../models/types';
import type { VPATTemplate } from '../../models/template-types';
import './PDFExportDialog.css';

export interface PDFExportDialogProps {
  project: Project;
  components: Component[];
  results: TestResult[];
  screenshots: Screenshot[];
  template?: VPATTemplate;
  onClose: () => void;
}

export function PDFExportDialog({
  project,
  components,
  results,
  screenshots,
  template,
  onClose,
}: PDFExportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    format: '2.4' as '2.4' | '2.5-international',
    tone: 'formal' as 'formal' | 'friendly',
    includeExecutiveSummary: true,
    includeScreenshots: true,
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating PDF...');

      const pdfBlob = await generateVPATPDF(project, results, screenshots, options, template);

      const filename = `VPAT_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);

      toast.success('PDF generated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pdf-export-dialog">
      <div 
        className="pdf-export-dialog__overlay" 
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        aria-label="Close dialog"
      />

      <div className="pdf-export-dialog__content" role="dialog" aria-modal="true" aria-labelledby="pdf-export-title">
        <div className="pdf-export-dialog__header">
          <h2 id="pdf-export-title" className="pdf-export-dialog__title">
            Export VPAT PDF
          </h2>
          <button
            className="pdf-export-dialog__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="pdf-export-dialog__body">
          <div className="pdf-export-option">
            <label htmlFor="format-select" className="pdf-export-option__label">
              VPAT Format
            </label>
            <select
              id="format-select"
              value={options.format}
              onChange={(e) =>
                setOptions({ ...options, format: e.target.value as '2.4' | '2.5-international' })
              }
              className="pdf-export-option__select"
            >
              <option value="2.4">VPAT 2.4</option>
              <option value="2.5-international">VPAT 2.5 International</option>
            </select>
          </div>

          <div className="pdf-export-option">
            <label htmlFor="tone-select" className="pdf-export-option__label">
              Report Tone
            </label>
            <select
              id="tone-select"
              value={options.tone}
              onChange={(e) =>
                setOptions({ ...options, tone: e.target.value as 'formal' | 'friendly' })
              }
              className="pdf-export-option__select"
            >
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div className="pdf-export-option">
            <label className="pdf-export-option__checkbox-label">
              <input
                type="checkbox"
                checked={options.includeExecutiveSummary}
                onChange={(e) =>
                  setOptions({ ...options, includeExecutiveSummary: e.target.checked })
                }
                className="pdf-export-option__checkbox"
              />
              Include Executive Summary
            </label>
          </div>

          <div className="pdf-export-option">
            <label className="pdf-export-option__checkbox-label">
              <input
                type="checkbox"
                checked={options.includeScreenshots}
                onChange={(e) =>
                  setOptions({ ...options, includeScreenshots: e.target.checked })
                }
                className="pdf-export-option__checkbox"
                disabled={screenshots.length === 0}
              />
              Include Screenshots
              {screenshots.length === 0 && (
                <span className="pdf-export-option__badge disabled">(No screenshots)</span>
              )}
            </label>
          </div>
          <div className="pdf-export-info">
            <p className="pdf-export-info__text">
              <strong>Project:</strong> {project.name}
            </p>
            <p className="pdf-export-info__text">
              <strong>Template:</strong> {template ? template.name : 'Default (Standard)'}
            </p>
            <p className="pdf-export-info__text">
              <strong>Criteria Tested:</strong> {results.length}
            </p>
            <p className="pdf-export-info__text">
              <strong>Components:</strong> {components.length}
            </p>
          </div>
        </div>

        <div className="pdf-export-dialog__footer">
          <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerate} loading={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}
