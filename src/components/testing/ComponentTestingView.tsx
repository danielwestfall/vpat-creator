import React from 'react';
import type { ComponentCategory } from '../../utils/testing-schedule-generator';
import type { ConformanceStatus } from '../../models/types';
import './ComponentTestingView.css';

// Interface matching the local state in TestingWorkflow
export interface UITestResult {
  scId: string;
  status: ConformanceStatus | 'Not Tested';
  notes: string;
  testedBy: string;
  testedDate: Date;
  techniquesUsed: string[];
  failuresFound: string[];
  customTechniques: Array<{ description: string }>;
  toolsUsed: string;
  screenshots: string[];
  needsRecheck?: boolean;
}

interface ComponentTestingViewProps {
  schedule: ComponentCategory[];
  results: Map<string, UITestResult>;
  scLookup: Map<string, string>; // Maps SC Number (e.g. "1.1.1") to SC ID
  onUpdateResult: (scId: string, status: ConformanceStatus, notes: string) => void;
}

export const ComponentTestingView: React.FC<ComponentTestingViewProps> = ({
  schedule,
  results,
  scLookup,
  onUpdateResult,
}) => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = React.useState(0);
  const [selectedComponentIndex, setSelectedComponentIndex] = React.useState(0);

  const currentCategory = schedule[selectedCategoryIndex];
  const currentComponent = currentCategory?.components[selectedComponentIndex];

  if (!currentCategory || !currentComponent) {
    return <div className="component-testing-container">No components found.</div>;
  }

  return (
    <div className="component-testing-container">
      <aside className="component-sidebar">
        <div className="component-sidebar-header">
          <h3>Components</h3>
        </div>
        <div className="category-list">
          {schedule.map((category, catIndex) => (
            <div key={category.category} className="category-item">
              <div className="category-title">{category.category}</div>
              {category.components.map((component, compIndex) => (
                <button
                  key={`${category.category}-${component.component}-${compIndex}`}
                  className={`component-btn ${
                    catIndex === selectedCategoryIndex && compIndex === selectedComponentIndex
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedCategoryIndex(catIndex);
                    setSelectedComponentIndex(compIndex);
                  }}
                >
                  <span className="component-name">{component.component}</span>
                  <span className="count-badge">{component.techniques.length}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <main className="component-main">
        <div className="component-header">
          <h2>{currentComponent.component}</h2>
          <div className="component-meta">
            {currentComponent.htmlElement && (
              <span className="tag">HTML: &lt;{currentComponent.htmlElement}&gt;</span>
            )}
            <span>⏱️ {currentComponent.estimatedTime} min</span>
          </div>
        </div>

        <div className="techniques-list">
          {currentComponent.techniques.map((tech) => (
            <div key={tech.techniqueId} className="technique-card">
              <div className="technique-header">
                <h3>{tech.title}</h3>
                <span className="technique-id">{tech.techniqueId}</span>
              </div>
              <div className="technique-body">
                <div className="technique-instructions">
                  {tech.testingInstructions}
                </div>

                <div className="related-sc-list">
                  <h4>Related Success Criteria</h4>
                  {tech.relatedSC.map((sc) => {
                    const scId = scLookup.get(sc.scNumber);
                    if (!scId) return null;

                    return (
                      <RelatedSCItem
                        key={sc.scNumber}
                        scId={scId}
                        scNumber={sc.scNumber}
                        scTitle={sc.scTitle}
                        level={sc.level}
                        result={results.get(scId)}
                        onUpdateResult={onUpdateResult}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

interface RelatedSCItemProps {
  scId: string;
  scNumber: string;
  scTitle: string;
  level: string;
  result?: UITestResult;
  onUpdateResult: (scId: string, status: ConformanceStatus, notes: string) => void;
}

const RelatedSCItem: React.FC<RelatedSCItemProps> = ({
  scId,
  scNumber,
  scTitle,
  level,
  result,
  onUpdateResult,
}) => {
  const currentStatus = result?.status || 'Not Tested';
  const currentNotes = result?.notes || '';

  const handleStatusChange = (status: ConformanceStatus) => {
    onUpdateResult(scId, status, currentNotes);
  };

  const handleNotesChange = (notes: string) => {
    if (currentStatus !== 'Not Tested') {
      onUpdateResult(scId, currentStatus, notes);
    }
  };

  return (
    <div className="related-sc-item">
      <div className="related-sc-header">
        <div className="sc-label">
          <span>{scNumber}</span>
          <span>{scTitle}</span>
          <span className={`level-badge level-${level.toLowerCase()}`}>{level}</span>
        </div>
        <div className="status-actions">
          <button
            className={`status-btn supports ${currentStatus === 'Supports' ? 'active' : ''}`}
            onClick={() => handleStatusChange('Supports')}
            title="Supports"
          >
            ✓
          </button>
          <button
            className={`status-btn partially-supports ${currentStatus === 'Partially Supports' ? 'active' : ''}`}
            onClick={() => handleStatusChange('Partially Supports')}
            title="Partially Supports"
          >
            ⚠
          </button>
          <button
            className={`status-btn does-not-support ${currentStatus === 'Does Not Support' ? 'active' : ''}`}
            onClick={() => handleStatusChange('Does Not Support')}
            title="Does Not Support"
          >
            ✗
          </button>
          <button
            className={`status-btn not-applicable ${currentStatus === 'Not Applicable' ? 'active' : ''}`}
            onClick={() => handleStatusChange('Not Applicable')}
            title="Not Applicable"
          >
            —
          </button>
        </div>
      </div>
      <textarea
        className="sc-notes"
        value={currentNotes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder={`Notes for ${scNumber}...`}
      />
    </div>
  );
};
