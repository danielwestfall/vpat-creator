import React, { useState } from 'react';
import { Button } from '../common';
import type { Project, TestResult } from '../../models/types';
import { comparisonService, type ComparisonSummary } from '../../services/comparison-service';
import { wcagService } from '../../services/wcag-service';
import './ComparisonDialog.css';

interface ComparisonDialogProps {
  currentProject: Project;
  currentResults: TestResult[];
  onClose: () => void;
}

export function ComparisonDialog({ currentProject, currentResults, onClose }: ComparisonDialogProps) {
  const [comparison, setComparison] = useState<ComparisonSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate structure
        if (!importedData.auditScope || !importedData.wcagResults) {
          alert('Invalid VPAT file format.');
          setIsLoading(false);
          return;
        }

        // Construct "Previous" Project object from imported data
        // Note: The imported JSON structure is slightly different from internal Project model
        // We need to map it back or adjust the service.
        // The service expects Project and TestResult[].
        
        // Let's reconstruct a minimal Project object for the previous audit
        const prevProject: Project = {
          id: 'imported-prev',
          name: importedData.auditScope.pageTitle,
          description: importedData.auditScope.pageUrl,
          targetConformanceLevel: importedData.auditScope.conformanceLevels[0] || 'AA',
          status: 'completed',
          createdAt: new Date(importedData.testDate),
          modifiedAt: new Date(importedData.testDate),
          testingEnvironment: { browsers: [], assistiveTech: [], operatingSystems: [], devices: [] },
          vpatConfig: { tone: 'formal', customColumns: [], additionalPages: [], styleGuide: {}, includeExecutiveSummary: true, includeRoadmap: false, productName: '', productVersion: '', reportDate: new Date() },
          components: [],
          testingMode: 'by-criterion'
        };

        // Reconstruct TestResults
        const prevResults: TestResult[] = importedData.wcagResults.map((r: { scNumber: string; scLevel: 'A' | 'AA' | 'AAA'; status: string; notes: string }) => {
          // Map SC Number to internal ID
          const sc = wcagService.getSuccessCriterionByNumber(r.scNumber);
          const scId = sc ? sc.id : r.scNumber; // Fallback to number if not found (though comparison might fail)

          return {
            id: scId,
            successCriterionId: scId,
            level: r.scLevel,
            conformance: r.status,
            observations: r.notes,
            barriers: [],
            testingMethod: { type: 'Manual', tools: [] },
            customNotes: r.notes
          } as TestResult;
        });

        // Run comparison
        const result = comparisonService.compareAudits(
          prevProject, // Base (Old)
          prevResults,
          currentProject, // Target (New)
          currentResults
        );
        
        setComparison(result);
      } catch (error) {
        console.error(error);
        alert('Failed to parse comparison file.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const getStatusBadgeClass = (status: string) => {
    return `status-badge ${status.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <div className="comparison-dialog">
      <div 
        className="comparison-dialog__overlay" 
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close dialog"
      />

      <div className="comparison-dialog__content" role="dialog" aria-modal="true">
        <div className="comparison-dialog__header">
          <h2>⚖️ Compare Audits</h2>
          <button className="comparison-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="comparison-dialog__body">
          {!comparison ? (
            <div className="comparison-upload-area">
              <label htmlFor="compare-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <h3>Upload Previous Audit</h3>
                <p style={{ color: '#64748b' }}>Select a JSON file exported from VPAT Creator to compare with your current progress.</p>
                <Button variant="primary" style={{ marginTop: '1rem', pointerEvents: 'none' }}>
                  Select File
                </Button>
              </label>
              <input
                id="compare-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {isLoading && <p style={{ marginTop: '1rem', color: '#6366f1' }}>Analyzing...</p>}
            </div>
          ) : (
            <>
              <div className="comparison-stats">
                <div className="stat-card improved">
                  <div className="stat-value">{comparison.improvedCount}</div>
                  <div className="stat-label">Improved</div>
                </div>
                <div className="stat-card regressed">
                  <div className="stat-value">{comparison.regressedCount}</div>
                  <div className="stat-label">Regressed</div>
                </div>
                <div className="stat-card new">
                  <div className="stat-value">{comparison.newCount}</div>
                  <div className="stat-label">New Items</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{comparison.totalChanges}</div>
                  <div className="stat-label">Total Differences</div>
                </div>
              </div>

              <h3>Detailed Differences</h3>
              {comparison.diffs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No differences found. The audits are identical in conformance status.
                </p>
              ) : (
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      <th>Previous Status</th>
                      <th>Current Status</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.diffs.map((diff) => (
                      <tr key={diff.scId} className={`comparison-row ${diff.changeType}`}>
                        <td>
                          <strong>{diff.scNumber}</strong> {diff.scTitle}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(diff.oldStatus)}>
                            {diff.oldStatus}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(diff.newStatus)}>
                            {diff.newStatus}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {diff.changeType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        <div className="comparison-dialog__footer">
          {comparison && (
            <Button variant="secondary" onClick={() => setComparison(null)}>
              Compare Another
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
