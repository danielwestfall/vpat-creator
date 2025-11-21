import { useState } from 'react';
import {
  extractBugsFromResults,
  exportBugsAsMarkdown,
  exportBugsAsCSV,
  exportBugsAsJSON,
  downloadFile,
} from '../../services/bug-export-service';
import type { TestResult, Component, Screenshot, BugReport } from '../../models/types';
import { Button } from '../common';
import { toast } from '../../store/toast-store';
import './BugReportGenerator.css';

export interface BugReportGeneratorProps {
  results: TestResult[];
  components: Component[];
  screenshots: Screenshot[];
  onClose: () => void;
  defaultComponentName?: string;
}

export function BugReportGenerator({
  results,
  components,
  screenshots,
  onClose,
  defaultComponentName,
}: BugReportGeneratorProps) {
  const [bugs, setBugs] = useState<BugReport[]>(() =>
    extractBugsFromResults(results, components, screenshots, defaultComponentName)
  );
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'csv' | 'json'>('markdown');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'major' | 'minor'>(
    'all'
  );

  const filteredBugs =
    severityFilter === 'all' ? bugs : bugs.filter((b) => b.severity === severityFilter);

  const handleExport = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (selectedFormat) {
        case 'markdown':
          content = exportBugsAsMarkdown(filteredBugs);
          filename = `accessibility-bugs_${timestamp}.md`;
          mimeType = 'text/markdown';
          break;
        case 'csv':
          content = exportBugsAsCSV(filteredBugs);
          filename = `accessibility-bugs_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = exportBugsAsJSON(filteredBugs);
          filename = `accessibility-bugs_${timestamp}.json`;
          mimeType = 'application/json';
          break;
      }

      downloadFile(content, filename, mimeType);
      toast.success(`Bug report exported as ${selectedFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export bug report');
      console.error('Bug export error:', error);
    }
  };

  const criticalCount = bugs.filter((b) => b.severity === 'critical').length;
  const majorCount = bugs.filter((b) => b.severity === 'major').length;
  const minorCount = bugs.filter((b) => b.severity === 'minor').length;

  return (
    <div className="bug-report-generator">
      <div className="bug-report-generator__overlay" onClick={onClose} />

      <div
        className="bug-report-generator__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-report-title"
      >
        <div className="bug-report-generator__header">
          <h2 id="bug-report-title" className="bug-report-generator__title">
            Bug Report Generator
          </h2>
          <button
            className="bug-report-generator__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="bug-report-generator__body">
          <div className="bug-summary">
            <h3 className="bug-summary__title">Summary</h3>
            <div className="bug-summary__stats">
              <div className="bug-stat bug-stat--critical">
                <span className="bug-stat__label">Critical</span>
                <span className="bug-stat__count">{criticalCount}</span>
              </div>
              <div className="bug-stat bug-stat--major">
                <span className="bug-stat__label">Major</span>
                <span className="bug-stat__count">{majorCount}</span>
              </div>
              <div className="bug-stat bug-stat--minor">
                <span className="bug-stat__label">Minor</span>
                <span className="bug-stat__count">{minorCount}</span>
              </div>
              <div className="bug-stat bug-stat--total">
                <span className="bug-stat__label">Total</span>
                <span className="bug-stat__count">{bugs.length}</span>
              </div>
            </div>
          </div>

          <div className="bug-filters">
            <div className="bug-filter">
              <label htmlFor="severity-filter" className="bug-filter__label">
                Filter by Severity
              </label>
              <select
                id="severity-filter"
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value as 'all' | 'critical' | 'major' | 'minor')
                }
                className="bug-filter__select"
              >
                <option value="all">All ({bugs.length})</option>
                <option value="critical">Critical ({criticalCount})</option>
                <option value="major">Major ({majorCount})</option>
                <option value="minor">Minor ({minorCount})</option>
              </select>
            </div>

            <div className="bug-filter">
              <label htmlFor="format-select" className="bug-filter__label">
                Export Format
              </label>
              <select
                id="format-select"
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as 'markdown' | 'csv' | 'json')
                }
                className="bug-filter__select"
              >
                <option value="markdown">Markdown (.md)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>
          </div>

          <div className="bug-list">
            <h3 className="bug-list__title">
              Issues ({filteredBugs.length})
            </h3>
            <div className="bug-list__items">
              {filteredBugs.map((bug, index) => (
                <div key={bug.id} className={`bug-item bug-item--${bug.severity}`}>
                  <div className="bug-item__header">
                    <span className="bug-item__number">#{index + 1}</span>
                    <span className={`bug-item__severity bug-item__severity--${bug.severity}`}>
                      {bug.severity}
                    </span>
                  </div>
                  <h4 className="bug-item__title">{bug.criterionName}</h4>
                  <p className="bug-item__criterion">
                    {bug.criterionNumber} (Level {bug.wcagLevel})
                  </p>
                  <p className="bug-item__component">{bug.componentName}</p>
                  <p className="bug-item__description">{bug.description}</p>
                  {bug.screenshots.length > 0 && (
                    <p className="bug-item__screenshots">
                      📷 {bug.screenshots.length} screenshot(s)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bug-report-generator__footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport} disabled={filteredBugs.length === 0}>
            Export {filteredBugs.length} Issue{filteredBugs.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
