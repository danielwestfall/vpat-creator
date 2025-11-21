import { useState } from 'react';
import { ComponentDemo } from './ComponentDemo';
import { TestingSchedulePreview } from './components/testing/TestingSchedulePreview';
import { TestingWorkflow } from './components/testing/TestingWorkflow';
import { StyleGuidePage } from './pages/StyleGuidePage';
import { RoadmapPage } from './pages/RoadmapPage';
import { CustomCriteriaPage } from './pages/CustomCriteriaPage';
import { Button } from './components/common';
import './App.css';

function App() {
  const [view, setView] = useState<'components' | 'schedule' | 'workflow' | 'style-guide' | 'roadmap' | 'custom-criteria'>('schedule');

  return (
    <div>
      <div style={{ 
        position: 'fixed', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 1000,
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        padding: '0.5rem',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Button 
          variant={view === 'schedule' ? 'primary' : 'secondary'}
          onClick={() => setView('schedule')}
          size="sm"
        >
          Schedules
        </Button>
        <Button 
          variant={view === 'workflow' ? 'primary' : 'secondary'}
          onClick={() => setView('workflow')}
          size="sm"
        >
          Workflow
        </Button>
        <Button 
          variant={view === 'style-guide' ? 'primary' : 'secondary'}
          onClick={() => setView('style-guide')}
          size="sm"
        >
          Style Guide
        </Button>
        <Button 
          variant={view === 'roadmap' ? 'primary' : 'secondary'}
          onClick={() => setView('roadmap')}
          size="sm"
        >
          Roadmap
        </Button>
        <Button 
          variant={view === 'custom-criteria' ? 'primary' : 'secondary'}
          onClick={() => setView('custom-criteria')}
          size="sm"
        >
          Custom Criteria
        </Button>
        <Button 
          variant={view === 'components' ? 'primary' : 'secondary'}
          onClick={() => setView('components')}
          size="sm"
        >
          Demo
        </Button>
      </div>
      <div style={{ paddingTop: '4rem' }}>
        {view === 'components' && <ComponentDemo />}
        {view === 'workflow' && <TestingWorkflow />}
        {view === 'schedule' && <TestingSchedulePreview />}
        {view === 'style-guide' && <StyleGuidePage />}
        {view === 'roadmap' && <RoadmapPage />}
        {view === 'custom-criteria' && <CustomCriteriaPage />}
      </div>
    </div>
  );
}

export default App;
