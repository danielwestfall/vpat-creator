import React from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CheckboxComponent as Checkbox } from '../common/Checkbox';
import { SelectComponent as Select } from '../common/Select';
import { ScreenshotManager } from './ScreenshotManager';
import type {
  UITestResult,
  CustomTechnique,
  Screenshot,
  ConformanceStatus,
} from '../../models/types';
import type { TestingScheduleItem } from '../../utils/testing-schedule-generator';
import type { SCTemplate } from '../../data/sc-templates';
import './TestingWorkflow.css';

interface SCTestingFormProps {
  currentSC: TestingScheduleItem;
  result?: UITestResult;

  // Techniques
  selectedTechniques: string[];
  onToggleTechnique: (id: string) => void;
  customTechniques: CustomTechnique[];
  onAddCustomTechnique: () => void;
  onToggleCustomTechnique: (index: number) => void;
  onUpdateCustomTechnique: (index: number, desc: string) => void;
  onRemoveCustomTechnique: (index: number) => void;

  // Failures
  selectedFailures: string[];
  onToggleFailure: (id: string) => void;

  // Result
  notes: string;
  onNotesChange: (notes: string) => void;
  status: ConformanceStatus | 'Not Tested';
  onStatusChange: (status: ConformanceStatus | 'Not Tested') => void;

  // Templates
  templates?: SCTemplate;
  onApplyTemplate: (text: string) => void;

  // Screenshots
  screenshots: Screenshot[];
  onAddScreenshot: (screenshot: Omit<Screenshot, 'id'>) => Promise<void>;
  onDeleteScreenshot: (id: string) => Promise<void>;
  onUpdateScreenshotCaption: (id: string, caption: string) => Promise<void>;
  auditScopeTitle: string;

  // Actions
  onSave: () => void;
  onRecheck: () => void;

  // Shortcuts
  shortcutsEnabled: boolean;
  onConfigureShortcuts: () => void;
}

export const SCTestingForm: React.FC<SCTestingFormProps> = ({
  currentSC,
  result,
  selectedTechniques,
  onToggleTechnique,
  customTechniques,
  onAddCustomTechnique,
  onToggleCustomTechnique,
  onUpdateCustomTechnique,
  onRemoveCustomTechnique,
  selectedFailures,
  onToggleFailure,
  notes,
  onNotesChange,
  status,
  onStatusChange,
  templates,
  onApplyTemplate,
  screenshots,
  onAddScreenshot,
  onDeleteScreenshot,
  onUpdateScreenshotCaption,
  auditScopeTitle,
  onSave,
  onRecheck,
  shortcutsEnabled,
  onConfigureShortcuts,
}) => {
  return (
    <section className="workflow-main">
      <div className="sc-details">
        <div className="sc-header">
          <h2>
            {currentSC.scNumber} {currentSC.scTitle}
          </h2>
          <span className={`level-badge level-${currentSC.scLevel.toLowerCase()}`}>
            Level {currentSC.scLevel}
          </span>
        </div>

        {result?.needsRecheck && (
          <div className="recheck-banner">
            <span>
              🔄 This item needs rechecking. Review the result and click "Mark as Rechecked" when
              complete.
            </span>
            <Button onClick={onRecheck} variant="primary" size="sm">
              ✓ Mark as Rechecked
            </Button>
          </div>
        )}

        <div className="sc-info">
          <p className="sc-guideline">{currentSC.guideline}</p>
          <p className="sc-description">{currentSC.description}</p>
        </div>

        <div className="sc-metadata">
          <span>⏱️ Estimated: {currentSC.estimatedTime} min</span>
          {currentSC.componentsToTest.length > 0 && (
            <span>🧩 Components: {currentSC.componentsToTest.join(', ')}</span>
          )}
          <button
            className="keyboard-hint"
            onClick={onConfigureShortcuts}
            title="Click to configure keyboard shortcuts"
            aria-label="Configure keyboard shortcuts"
          >
            {shortcutsEnabled ? '⌨️ Shortcuts Active' : '⌨️ Shortcuts Disabled'}
          </button>
        </div>
      </div>

      <div className="testing-section">
        <h3>Testing Steps</h3>
        <ol className="testing-steps">
          {currentSC.testingSteps.map((step, index) => (
            <li key={index} className={step.startsWith(' ') ? 'sub-step' : ''}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="techniques-section">
        <h3>Sufficient Techniques (Select which were used)</h3>
        <div className="techniques-list">
          {currentSC.sufficientTechniques.map((tech) => (
            <Checkbox
              key={tech.id}
              label={`${tech.id}: ${tech.title}`}
              checked={selectedTechniques.includes(tech.id)}
              onCheckedChange={() => onToggleTechnique(tech.id)}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <strong>Custom Techniques</strong>
            <Button onClick={onAddCustomTechnique} size="sm" variant="secondary">
              + Add Custom
            </Button>
          </div>
          {customTechniques.map((custom, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                alignItems: 'flex-start',
              }}
            >
              <Checkbox
                label=""
                checked={custom.checked}
                onCheckedChange={() => onToggleCustomTechnique(index)}
              />
              <Input
                value={custom.description}
                onChange={(e) => onUpdateCustomTechnique(index, e.target.value)}
                placeholder="Describe the technique you used..."
                fullWidth
              />
              <Button onClick={() => onRemoveCustomTechnique(index)} size="sm" variant="secondary">
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      {currentSC.failures.length > 0 && (
        <div className="failures-section">
          <h3>Common Failures (Check if found)</h3>
          <div className="techniques-list">
            {currentSC.failures.map((failure) => (
              <Checkbox
                key={failure.id}
                label={`${failure.id}: ${failure.title}`}
                checked={selectedFailures.includes(failure.id)}
                onCheckedChange={() => onToggleFailure(failure.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="results-form">
        <h3>Record Results</h3>
        <Select
          label="Conformance Status"
          value={status}
          onValueChange={(value) => onStatusChange(value as ConformanceStatus | 'Not Tested')}
          options={[
            { value: 'Not Tested', label: 'Not Tested' },
            { value: 'Supports', label: 'Supports' },
            { value: 'Partially Supports', label: 'Partially Supports' },
            { value: 'Does Not Support', label: 'Does Not Support' },
            { value: 'Not Applicable', label: 'Not Applicable' },
          ]}
          required
          fullWidth
        />

        <div className="notes-field">
          <label>
            Observation Notes
            {result?.history && result.history.length > 0 && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Edited {result.history.length} times)
              </span>
            )}
          </label>
          <div className="template-buttons">
            <span className="text-xs text-gray-500 mr-2">Quick Insert:</span>
            {templates ? (
              <>
                <button
                  onClick={() => onApplyTemplate(templates.supports)}
                  className="template-chip"
                  title={templates.supports}
                >
                  Supports
                </button>
                <button
                  onClick={() => onApplyTemplate(templates.partial)}
                  className="template-chip"
                  title={templates.partial}
                >
                  Partial
                </button>
                <button
                  onClick={() => onApplyTemplate(templates.fails)}
                  className="template-chip"
                  title={templates.fails}
                >
                  Fail
                </button>
                <button
                  onClick={() => onApplyTemplate(templates.na)}
                  className="template-chip"
                  title={templates.na}
                >
                  N/A
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No templates available</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Describe what was tested, observed behavior, and reason for pass/fail..."
            rows={5}
          />
        </div>

        <div className="evidence-section">
          <h3>
            Evidence / Screenshots
            {screenshots.length > 0 && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--color-primary-light, #eef2ff)',
                  color: 'var(--color-primary, #6366f1)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: '500',
                }}
              >
                {screenshots.length}
              </span>
            )}
          </h3>
          <ScreenshotManager
            testResultId={currentSC.id}
            componentId={auditScopeTitle}
            screenshots={screenshots}
            onAdd={onAddScreenshot}
            onDelete={onDeleteScreenshot}
            onUpdateCaption={onUpdateScreenshotCaption}
          />
        </div>

        <div className="form-actions">
          <Button onClick={onSave} variant="primary" size="lg" fullWidth>
            Save & Continue
          </Button>
        </div>
      </div>
    </section>
  );
};
