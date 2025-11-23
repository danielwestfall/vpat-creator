import React from 'react';
import { testingScheduleService } from '../../services/testing-schedule-service';
import { Button } from '../common';
import './TestingSchedulePreview.css';

export const TestingSchedulePreview: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'sc' | 'component'>('sc');
  const [scSchedule, setScSchedule] = React.useState<ReturnType<
    typeof testingScheduleService.generateSCSchedule
  > | null>(null);
  const [componentSchedule, setComponentSchedule] = React.useState<ReturnType<
    typeof testingScheduleService.generateComponentSchedule
  > | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    generateSchedules();
  }, []);

  const generateSchedules = () => {
    setLoading(true);
    try {
      const sc = testingScheduleService.generateSCSchedule({
        levels: ['A', 'AA'],
        includeAdvisory: true,
        includeFailures: true,
      });
      setScSchedule(sc);

      const comp = testingScheduleService.generateComponentSchedule({
        levels: ['A', 'AA'],
        includeAdvisory: true,
        includeFailures: true,
      });
      setComponentSchedule(comp);
    } catch (error) {
      console.error('Error generating schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = (type: 'sc' | 'component') => {
    if (type === 'sc' && scSchedule) {
      const markdown = testingScheduleService.exportSCScheduleAsMarkdown(scSchedule);
      downloadFile(markdown, 'wcag-testing-schedule-sc.md', 'text/markdown');
    } else if (type === 'component' && componentSchedule) {
      const markdown =
        testingScheduleService.exportComponentScheduleAsMarkdown(componentSchedule);
      downloadFile(markdown, 'wcag-testing-schedule-component.md', 'text/markdown');
    }
  };

  const downloadJSON = (type: 'sc' | 'component') => {
    if (type === 'sc' && scSchedule) {
      const json = JSON.stringify(scSchedule, null, 2);
      downloadFile(json, 'wcag-testing-schedule-sc.json', 'application/json');
    } else if (type === 'component' && componentSchedule) {
      const json = JSON.stringify(componentSchedule, null, 2);
      downloadFile(json, 'wcag-testing-schedule-component.json', 'application/json');
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !scSchedule || !componentSchedule) {
    return (
      <div className="schedule-preview-loading">
        <p>Loading testing schedules...</p>
      </div>
    );
  }

  const scStats = testingScheduleService.getScheduleStats(scSchedule);
  const componentStats = testingScheduleService.getComponentStats(componentSchedule);

  return (
    <div className="schedule-preview">
      <header className="schedule-preview-header">
        <h1>WCAG 2.2 Testing Schedules</h1>
        <p>Two approaches to organize your accessibility testing workflow</p>
      </header>

      <div className="schedule-tabs">
        <button
          className={`schedule-tab ${activeTab === 'sc' ? 'active' : ''}`}
          onClick={() => setActiveTab('sc')}
        >
          Success Criteria Based
        </button>
        <button
          className={`schedule-tab ${activeTab === 'component' ? 'active' : ''}`}
          onClick={() => setActiveTab('component')}
        >
          Component/Technique Based
        </button>
      </div>

      {activeTab === 'sc' && (
        <div className="schedule-content">
          <div className="schedule-stats">
            <h2>Success Criteria Schedule Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{scStats.totalSC}</div>
                <div className="stat-label">Success Criteria</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{scStats.totalTechniques}</div>
                <div className="stat-label">Techniques</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{scStats.totalFailures}</div>
                <div className="stat-label">Failures to Check</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{scStats.estimatedTimeHours}h</div>
                <div className="stat-label">Estimated Time</div>
              </div>
            </div>

            <div className="level-breakdown">
              <h3>By Conformance Level</h3>
              <div className="level-stats">
                <span className="level-stat">Level A: {scStats.byLevel.A}</span>
                <span className="level-stat">Level AA: {scStats.byLevel.AA}</span>
                <span className="level-stat">Level AAA: {scStats.byLevel.AAA}</span>
              </div>
            </div>
          </div>

          <div className="schedule-actions">
            <Button onClick={() => downloadMarkdown('sc')} variant="primary">
              Download as Markdown
            </Button>
            <Button onClick={() => downloadJSON('sc')} variant="secondary">
              Download as JSON
            </Button>
          </div>

          <div className="getting-started-guide">
            <h3>🚀 Getting Started</h3>
            <div className="instruction-steps">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Go to the Workflow Tab</h4>
                  <p>Click the <strong>"Workflow"</strong> button in the top navigation bar</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Start a New Audit</h4>
                  <p>Click <strong>"Start New Audit"</strong> and configure your audit scope (WCAG version, conformance levels, etc.)</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Begin Testing</h4>
                  <p>Work through each success criterion, recording conformance status, notes, and screenshots</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Export Your Results</h4>
                  <p>Generate a VPAT PDF report, share with team members, or export JSON for backup</p>
                </div>
              </div>
            </div>
            <div className="getting-started-features">
              <h4>✨ Key Features</h4>
              <ul>
                <li><strong>Auto-save:</strong> Your progress is automatically saved in your browser</li>
                <li><strong>Team Collaboration:</strong> Assign test criteria to team members and share audits</li>
                <li><strong>Screenshots:</strong> Capture and annotate evidence directly in the app</li>
                <li><strong>Bug Reports:</strong> Automatically generate bug reports from failed criteria</li>
                <li><strong>Export Options:</strong> PDF VPAT, JSON backup, or Markdown formats</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'component' && (
        <div className="schedule-content">
          <div className="schedule-stats">
            <h2>Component Schedule Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{componentStats.totalCategories}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{componentStats.totalComponents}</div>
                <div className="stat-label">Components</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{componentStats.totalTechniques}</div>
                <div className="stat-label">Techniques</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{componentStats.estimatedTimeHours}h</div>
                <div className="stat-label">Estimated Time</div>
              </div>
            </div>
          </div>

          <div className="schedule-actions">
            <Button onClick={() => downloadMarkdown('component')} variant="primary">
              Download as Markdown
            </Button>
            <Button onClick={() => downloadJSON('component')} variant="secondary">
              Download as JSON
            </Button>
          </div>

          <div className="component-categories">
            <h3>Categories</h3>
            {componentSchedule.map((category) => (
              <div key={category.category} className="category-card">
                <h4>{category.category}</h4>
                <p>{category.description}</p>
                <div className="category-meta">
                  <span>🧩 {category.components.length} components</span>
                  <span>⏱️ {Math.round(category.totalTime / 60)}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
