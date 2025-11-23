import React from 'react';
import { Button, Input, Checkbox } from '../common';
import { toast } from '../../store/toast-store';
import { auditScopeSchema } from '../../utils/validators';
import type { ConformanceLevel } from '../../models/types';
import './AuditScopeConfig.css';

export interface AuditScope {
  pageTitle: string;
  pageUrl: string;
  wcagVersion: '2.1' | '2.2';
  conformanceLevels: ConformanceLevel[];
  includeEN301549: boolean;
  includeSection508: boolean;
  testingTools: string[];
  evaluationMethods: string[];
  customColumns: string[];
}

interface AuditScopeConfigProps {
  onScopeConfirmed: (scope: AuditScope) => void;
}

export const AuditScopeConfig: React.FC<AuditScopeConfigProps> = ({ onScopeConfirmed }) => {
  const [pageTitle, setPageTitle] = React.useState('');
  const [pageUrl, setPageUrl] = React.useState('');
  const [wcagVersion, setWcagVersion] = React.useState<'2.1' | '2.2'>('2.2');
  const [selectedLevels, setSelectedLevels] = React.useState<ConformanceLevel[]>(['A', 'AA']);
  const [includeEN301549, setIncludeEN301549] = React.useState(false);
  const [includeSection508, setIncludeSection508] = React.useState(false);
  const [testingTools, setTestingTools] = React.useState<string[]>([]);
  const [newTool, setNewTool] = React.useState('');
  const [evaluationMethods, setEvaluationMethods] = React.useState<string[]>([]);
  const [newMethod, setNewMethod] = React.useState('');
  const [customColumns, setCustomColumns] = React.useState<string[]>([]);
  const [newColumn, setNewColumn] = React.useState('');

  const toggleLevel = (level: ConformanceLevel) => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        return prev.filter((l) => l !== level);
      } else {
        // Keep levels in order: A, AA, AAA
        const levels: ConformanceLevel[] = ['A', 'AA', 'AAA'];
        return [...prev, level].sort((a, b) => levels.indexOf(a) - levels.indexOf(b));
      }
    });
  };

  const addTestingTool = () => {
    if (newTool.trim()) {
      setTestingTools((prev) => [...prev, newTool.trim()]);
      setNewTool('');
    }
  };

  const removeTestingTool = (index: number) => {
    setTestingTools((prev) => prev.filter((_, i) => i !== index));
  };

  const addEvaluationMethod = () => {
    if (newMethod.trim()) {
      setEvaluationMethods((prev) => [...prev, newMethod.trim()]);
      setNewMethod('');
    }
  };

  const removeEvaluationMethod = (index: number) => {
    setEvaluationMethods((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomColumn = () => {
    if (newColumn.trim()) {
      setCustomColumns((prev) => [...prev, newColumn.trim()]);
      setNewColumn('');
    }
  };

  const removeCustomColumn = (index: number) => {
    setCustomColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartAudit = () => {
    const scopeData = {
      pageTitle: pageTitle.trim(),
      pageUrl: pageUrl.trim(),
      wcagVersion,
      conformanceLevels: selectedLevels,
      includeEN301549,
      includeSection508,
      testingTools,
      evaluationMethods,
      customColumns,
    };

    // Validate using Zod schema
    const result = auditScopeSchema.safeParse(scopeData);

    if (!result.success) {
      // Show first validation error
      const firstError = result.error.issues[0];
      toast.error('Validation Error', firstError.message);
      return;
    }

    onScopeConfirmed(scopeData);
  };

  return (
    <div className="scope-config-container">
      <div className="scope-config-content">
        <header className="scope-header">
          <h1>Configure Audit Scope</h1>
          <p>Define what you'll be testing and the standards to check against</p>
        </header>

        <div className="scope-form">
          <section className="scope-section">
            <h2>Page/Component Information</h2>
            <Input
              label="Page or Component Name"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="e.g., Home Page, Login Form, Shopping Cart"
              helperText="Enter a descriptive name for what you're testing"
              required
              fullWidth
            />
            <Input
              label="Page URL (optional)"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://example.com/page"
              helperText="Include the URL if testing a specific page"
              fullWidth
            />
          </section>

          <section className="scope-section">
            <h2>WCAG Standard</h2>
            <div className="radio-group" role="radiogroup" aria-label="WCAG Standard Version">
              <label className={`radio-option ${wcagVersion === '2.1' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="wcag-version"
                  value="2.1"
                  checked={wcagVersion === '2.1'}
                  onChange={() => setWcagVersion('2.1')}
                  aria-label="WCAG 2.1"
                />
                <div className="radio-content">
                  <strong>WCAG 2.1</strong>
                  <span className="radio-description">
                    W3C Recommendation (June 2018) - Includes mobile, low vision, and cognitive improvements
                  </span>
                </div>
              </label>
              <label className={`radio-option ${wcagVersion === '2.2' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="wcag-version"
                  value="2.2"
                  checked={wcagVersion === '2.2'}
                  onChange={() => setWcagVersion('2.2')}
                  aria-label="WCAG 2.2"
                />
                <div className="radio-content">
                  <strong>WCAG 2.2</strong>
                  <span className="radio-description">
                    W3C Recommendation (October 2023) - Latest version with additional success criteria
                  </span>
                </div>
              </label>
            </div>
          </section>

          <section className="scope-section">
            <h2>Conformance Levels</h2>
            <p className="section-description">
              Select which levels to test. Higher levels include all lower level requirements.
            </p>
            <div className="checkbox-group">
              <Checkbox
                label="Level A (Minimum)"
                checked={selectedLevels.includes('A')}
                onCheckedChange={() => toggleLevel('A')}
              />
              <div className="level-description">
                Essential accessibility features. If not met, assistive technology users will find it very difficult to access content.
              </div>

              <Checkbox
                label="Level AA (Mid Range)"
                checked={selectedLevels.includes('AA')}
                onCheckedChange={() => toggleLevel('AA')}
              />
              <div className="level-description">
                Deals with the biggest and most common barriers. This is the level most organizations aim for (recommended).
              </div>

              <Checkbox
                label="Level AAA (Highest)"
                checked={selectedLevels.includes('AAA')}
                onCheckedChange={() => toggleLevel('AAA')}
              />
              <div className="level-description">
                The highest level of accessibility. Not all content can meet this level, but apply where possible.
              </div>
            </div>
          </section>

          <section className="scope-section">
            <h2>Additional Standards</h2>
            <p className="section-description">
              Include other accessibility standards (results will be derived from WCAG testing where applicable)
            </p>
            <div className="checkbox-group">
              <Checkbox
                label="EN 301 549 (European Standard)"
                checked={includeEN301549}
                onCheckedChange={setIncludeEN301549}
              />
              <div className="level-description">
                European accessibility requirements for ICT products and services. Harmonized with WCAG 2.1 Level AA.
              </div>

              <Checkbox
                label="Section 508 (U.S. Federal Standard)"
                checked={includeSection508}
                onCheckedChange={setIncludeSection508}
              />
              <div className="level-description">
                U.S. federal accessibility standards. Updated 2017 standards incorporate WCAG 2.0 Level AA.
              </div>
            </div>
          </section>

          <section className="scope-section">
            <h2>Testing Tools</h2>
            <p className="section-description">
              Document the tools you'll use for testing (e.g., screen readers, browser extensions, automated scanners)
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Input
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                placeholder="e.g., NVDA, JAWS, axe DevTools, WAVE..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTestingTool();
                  }
                }}
                fullWidth
              />
              <Button onClick={addTestingTool} variant="secondary">
                Add
              </Button>
            </div>
            {testingTools.length === 0 && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                <strong>Common tools:</strong> NVDA, JAWS, VoiceOver, TalkBack, axe DevTools, WAVE, Lighthouse, Colour Contrast Analyser
              </div>
            )}
            {testingTools.length > 0 && (
              <div className="tool-list">
                {testingTools.map((tool, index) => (
                  <div key={index} className="tool-item">
                    <span>{tool}</span>
                    <button
                      type="button"
                      onClick={() => removeTestingTool(index)}
                      className="remove-button"
                      aria-label={`Remove ${tool}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="scope-section">
            <h2>Custom Report Columns</h2>
            <p className="section-description">
              Add extra columns to your VPAT report (e.g., "Internal Ticket", "Remediation Date")
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Input
                value={newColumn}
                onChange={(e) => setNewColumn(e.target.value)}
                placeholder="e.g., Ticket Number"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomColumn();
                  }
                }}
                fullWidth
              />
              <Button onClick={addCustomColumn} variant="secondary">
                Add
              </Button>
            </div>
            {customColumns.length > 0 && (
              <div className="tool-list">
                {customColumns.map((col, index) => (
                  <div key={index} className="tool-item">
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomColumn(index)}
                      className="remove-button"
                      aria-label={`Remove ${col}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="scope-section">
            <h2>Evaluation Methods Used</h2>
            <p className="section-description">
              Describe how you conducted the evaluation (e.g., manual testing, keyboard navigation, automated scans, user testing)
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Input
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                placeholder="e.g., Manual keyboard testing, Screen reader testing..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEvaluationMethod();
                  }
                }}
                fullWidth
              />
              <Button onClick={addEvaluationMethod} variant="secondary">
                Add
              </Button>
            </div>
            {evaluationMethods.length === 0 && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                <strong>Common methods:</strong> Manual keyboard navigation testing, Screen reader testing, Automated scanning, Visual inspection, Code review, User testing with assistive technology users
              </div>
            )}
            {evaluationMethods.length > 0 && (
              <div className="tool-list">
                {evaluationMethods.map((method, index) => (
                  <div key={index} className="tool-item">
                    <span>{method}</span>
                    <button
                      type="button"
                      onClick={() => removeEvaluationMethod(index)}
                      className="remove-button"
                      aria-label={`Remove ${method}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="scope-actions">
            <div className="scope-summary">
              <strong>Testing scope:</strong>
              {selectedLevels.length > 0 ? (
                <span>
                  WCAG {wcagVersion} Level {selectedLevels.join(', ')}
                  {includeEN301549 && ' + EN 301 549'}
                  {includeSection508 && ' + Section 508'}
                </span>
              ) : (
                <span className="text-muted">No levels selected</span>
              )}
            </div>
            <Button onClick={handleStartAudit} variant="primary" size="lg">
              Start Audit →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
