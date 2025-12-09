import { useState } from 'react';
import { Button } from '../common';
import type { MergeResult } from '../../services/merge-service';
import './ConflictResolutionDialog.css';

export interface ConflictResolutionDialogProps {
  mergeResult: MergeResult;
  onResolve: (resolutions: Map<string, 'local' | 'incoming'>) => void;
  onCancel: () => void;
}

export function ConflictResolutionDialog({
  mergeResult,
  onResolve,
  onCancel,
}: ConflictResolutionDialogProps) {
  const [resolutions, setResolutions] = useState<Map<string, 'local' | 'incoming'>>(new Map());

  const handleResolutionChange = (criterionId: string, choice: 'local' | 'incoming') => {
    const newResolutions = new Map(resolutions);
    newResolutions.set(criterionId, choice);
    setResolutions(newResolutions);
  };

  const handleResolveAll = (choice: 'local' | 'incoming') => {
    const newResolutions = new Map<string, 'local' | 'incoming'>();
    mergeResult.conflicts.forEach((conflict) => {
      newResolutions.set(conflict.criterionId, choice);
    });
    setResolutions(newResolutions);
  };

  const canProceed = resolutions.size === mergeResult.conflicts.length;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="conflict-resolution-dialog">
      <div
        className="conflict-resolution-dialog__overlay"
        onClick={onCancel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onCancel();
          }
        }}
        aria-label="Close dialog"
      />

      <div
        className="conflict-resolution-dialog__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-dialog-title"
      >
        <div className="conflict-resolution-dialog__header">
          <h2 id="conflict-dialog-title" className="conflict-resolution-dialog__title">
            🔀 Resolve Merge Conflicts
          </h2>
          <button
            className="conflict-resolution-dialog__close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="conflict-resolution-dialog__body">
          {/* Summary */}
          <div className="merge-summary">
            <h3>Merge Summary</h3>
            <div className="merge-summary__stats">
              <span className="merge-stat merge-stat--success">
                ✓ {mergeResult.summary.autoMerged + mergeResult.summary.new} auto-merged
              </span>
              <span className="merge-stat merge-stat--warning">
                ⚠ {mergeResult.conflicts.length} conflicts
              </span>
              <span className="merge-stat merge-stat--info">
                → {resolutions.size}/{mergeResult.conflicts.length} resolved
              </span>
            </div>
            <p className="merge-summary__text">
              {mergeResult.summary.autoMerged} tests were automatically merged (using newer
              version).
              {mergeResult.summary.new > 0 &&
                ` ${mergeResult.summary.new} new tests will be added.`}{' '}
              Please resolve the conflicts below to complete the merge.
            </p>
          </div>

          {/* Bulk actions */}
          {mergeResult.conflicts.length > 1 && (
            <div className="bulk-actions">
              <span className="bulk-actions__label">Quick resolve all:</span>
              <Button size="sm" variant="secondary" onClick={() => handleResolveAll('local')}>
                Keep All Mine
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleResolveAll('incoming')}>
                Use All Theirs
              </Button>
            </div>
          )}

          {/* Conflicts list */}
          <div className="conflicts-list">
            {mergeResult.conflicts.map((conflict, index) => (
              <div key={conflict.criterionId} className="conflict-card">
                <div className="conflict-card__header">
                  <h4 className="conflict-card__title">
                    <span className="conflict-number">#{index + 1}</span>
                    {conflict.criterionNumber} - {conflict.criterionName}
                  </h4>
                  <div className="conflict-card__status">
                    {resolutions.has(conflict.criterionId) ? (
                      <span className="resolution-badge resolution-badge--resolved">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="resolution-badge resolution-badge--pending">⚠ Pending</span>
                    )}
                  </div>
                </div>

                <div className="conflict-comparison">
                  {/* Local version */}
                  <div
                    className={`conflict-option ${
                      resolutions.get(conflict.criterionId) === 'local'
                        ? 'conflict-option--selected'
                        : ''
                    }`}
                  >
                    <div className="conflict-option__header">
                      <input
                        type="radio"
                        name={`conflict-${conflict.criterionId}`}
                        id={`${conflict.criterionId}-local`}
                        checked={resolutions.get(conflict.criterionId) === 'local'}
                        onChange={() => handleResolutionChange(conflict.criterionId, 'local')}
                      />
                      <label
                        htmlFor={`${conflict.criterionId}-local`}
                        className="conflict-option__label"
                      >
                        <strong>Your Version</strong>
                        <span className="conflict-option__meta">
                          by {conflict.local.testedBy || 'Unknown'} •{' '}
                          {conflict.local.testedDate
                            ? formatDate(conflict.local.testedDate)
                            : 'No date'}
                        </span>
                      </label>
                    </div>
                    <div className="conflict-option__content">
                      <div className="conflict-field">
                        <span className="field-label">Status:</span>
                        <span
                          className={`status-badge status-badge--${conflict.local.conformance.toLowerCase().replace(/ /g, '-')}`}
                        >
                          {conflict.local.conformance}
                        </span>
                      </div>
                      {conflict.local.customNotes && (
                        <div className="conflict-field">
                          <span className="field-label">Notes:</span>
                          <p className="field-value">{conflict.local.customNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Incoming version */}
                  <div
                    className={`conflict-option ${
                      resolutions.get(conflict.criterionId) === 'incoming'
                        ? 'conflict-option--selected'
                        : ''
                    }`}
                  >
                    <div className="conflict-option__header">
                      <input
                        type="radio"
                        name={`conflict-${conflict.criterionId}`}
                        id={`${conflict.criterionId}-incoming`}
                        checked={resolutions.get(conflict.criterionId) === 'incoming'}
                        onChange={() => handleResolutionChange(conflict.criterionId, 'incoming')}
                      />
                      <label
                        htmlFor={`${conflict.criterionId}-incoming`}
                        className="conflict-option__label"
                      >
                        <strong>Their Version</strong>
                        <span className="conflict-option__meta">
                          by {conflict.incoming.testedBy || 'Unknown'} •{' '}
                          {conflict.incoming.testedDate
                            ? formatDate(conflict.incoming.testedDate)
                            : 'No date'}
                        </span>
                      </label>
                    </div>
                    <div className="conflict-option__content">
                      <div className="conflict-field">
                        <span className="field-label">Status:</span>
                        <span
                          className={`status-badge status-badge--${conflict.incoming.conformance.toLowerCase().replace(/ /g, '-')}`}
                        >
                          {conflict.incoming.conformance}
                        </span>
                      </div>
                      {conflict.incoming.customNotes && (
                        <div className="conflict-field">
                          <span className="field-label">Notes:</span>
                          <p className="field-value">{conflict.incoming.customNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Differences indicator */}
                {(conflict.differences.status || conflict.differences.notes) && (
                  <div className="conflict-differences">
                    <strong>Differences:</strong>
                    {conflict.differences.status && <span className="diff-tag">Status</span>}
                    {conflict.differences.notes && <span className="diff-tag">Notes</span>}
                    {conflict.timeDiffHours > 0 && (
                      <span className="diff-tag">
                        {Math.round(conflict.timeDiffHours)}h time difference
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="conflict-resolution-dialog__footer">
          <Button variant="secondary" onClick={onCancel}>
            Cancel Merge
          </Button>
          <Button variant="primary" onClick={() => onResolve(resolutions)} disabled={!canProceed}>
            Apply Merge ({resolutions.size}/{mergeResult.conflicts.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
