import React from 'react';
import { Button } from '../common/Button';
import { DropdownMenu } from '../common/DropdownMenu';
import './TestingWorkflow.css'; // Inherit styles for now

interface WorkflowToolbarProps {
  // Auto Scan & Quick Actions
  onShowAutoScan: () => void;
  onMarkRemainingNA: () => void;
  onMarkRemainingSupports: () => void;

  // Pagination
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;

  // Data Actions
  onImportResults: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportResults: () => void;
  onShowBatchImport: () => void;
  onShowExternalImport: () => void;
  onMergeResults: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAudit: () => void;

  // Report Actions
  onOpenExportDialog: (type: 'pdf' | 'email' | 'bug' | 'comparison') => void;
  onExportCSV: () => void;
  onShowShareDialog: () => void;
  failureCount: number;

  // Tools
  scheduleView: 'sc-based' | 'component-based';
  onToggleScheduleView: () => void;
  onShowHistory: () => void;
  onShowIssueTracker: () => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onShowAutoScan,
  onMarkRemainingNA,
  onMarkRemainingSupports,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onImportResults,
  onExportResults,
  onShowBatchImport,
  onShowExternalImport,
  onMergeResults,
  onClearAudit,
  onOpenExportDialog,
  onExportCSV,
  onShowShareDialog,
  failureCount,
  scheduleView,
  onToggleScheduleView,
  onShowHistory,
  onShowIssueTracker,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group left">
        <Button
          onClick={onShowAutoScan}
          size="sm"
          variant="secondary"
          className="auto-scan-btn"
          icon="🤖"
        >
          Auto Scan
        </Button>

        <DropdownMenu
          label="Quick Actions"
          icon="⚡"
          variant="secondary"
          items={[
            {
              label: 'Mark Remaining N/A',
              onClick: onMarkRemainingNA,
            },
            {
              label: 'Mark Remaining Supports',
              onClick: onMarkRemainingSupports,
            },
          ]}
        />
      </div>

      <div className="toolbar-group center">
        <div className="pagination-controls">
          <Button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            size="sm"
            variant="secondary"
            title="Previous Criteria (Ctrl+Left)"
          >
            ← Prev
          </Button>
          <span className="pagination-text">
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="font-medium">{totalCount}</span>
          </span>
          <Button
            onClick={onNext}
            disabled={currentIndex >= totalCount - 1}
            size="sm"
            variant="secondary"
            title="Next Criteria (Ctrl+Right)"
          >
            Next →
          </Button>
        </div>
      </div>

      <div className="toolbar-group right">
        <DropdownMenu
          label="Data"
          icon="💾"
          variant="secondary"
          items={[
            {
              label: 'Resume Audit (Load JSON)',
              icon: '📂',
              onClick: () => document.getElementById('import-results-toolbar')?.click(),
            },
            { label: 'Backup / Save JSON', icon: '💾', onClick: onExportResults },
            {
              label: 'Batch Import (Excel/CSV)',
              icon: '📥',
              onClick: onShowBatchImport,
            },
            {
              label: 'Tool Import (Axe, etc.)',
              icon: '🤖',
              onClick: onShowExternalImport,
            },
            {
              label: 'Import & Merge',
              icon: '🔀',
              onClick: () => document.getElementById('merge-upload-toolbar')?.click(),
            },
            {
              label: 'Clear Audit Data',
              icon: '🗑️',
              onClick: onClearAudit,
              variant: 'danger',
            },
          ]}
        />

        <DropdownMenu
          label="Reports"
          icon="📄"
          variant="secondary"
          items={[
            {
              label: 'Export PDF Report',
              icon: '📄',
              onClick: () => onOpenExportDialog('pdf'),
            },
            { label: 'Export CSV Data', icon: '📊', onClick: onExportCSV },
            {
              label: 'Email Report',
              icon: '📧',
              onClick: () => onOpenExportDialog('email'),
            },
            { label: 'Share Link', icon: '📤', onClick: onShowShareDialog },
            {
              label: `Bug Report (${failureCount})`,
              icon: '🐛',
              onClick: () => onOpenExportDialog('bug'),
              disabled: failureCount === 0,
            },
          ]}
        />

        <DropdownMenu
          label="Tools"
          icon="⚙️"
          variant="secondary"
          items={[
            {
              label: scheduleView === 'sc-based' ? 'Switch to Component View' : 'Switch to SC View',
              icon: '🔄',
              onClick: onToggleScheduleView,
            },
            {
              label: 'Compare Audits',
              icon: '⚖️',
              onClick: () => onOpenExportDialog('comparison'),
            },
            { label: 'Version History', icon: '🕒', onClick: onShowHistory },
            {
              label: 'Configure Issue Tracker',
              icon: '⚙️',
              onClick: onShowIssueTracker,
            },
          ]}
        />
      </div>

      <input
        id="import-results-toolbar"
        type="file"
        accept=".json"
        onChange={onImportResults}
        style={{ display: 'none' }}
      />
      <input
        id="merge-upload-toolbar"
        type="file"
        accept=".json"
        onChange={onMergeResults}
        style={{ display: 'none' }}
      />
    </div>
  );
};
