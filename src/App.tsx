import { useState } from 'react';
import { ComponentDemo } from './ComponentDemo';
import { TestingSchedulePreview } from './components/testing/TestingSchedulePreview';
import { TestingWorkflow } from './components/testing/TestingWorkflow';
import { Button } from './components/common';
import './App.css';

function App() {
  const [view, setView] = useState<'components' | 'schedule' | 'workflow'>('schedule');

  return (
    <div>
      <div style={{ 
        position: 'fixed', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 1000,
        display: 'flex',
        gap: '0.5rem'
      }}>
        <Button 
          variant={view === 'schedule' ? 'primary' : 'secondary'}
          onClick={() => setView('schedule')}
        >
          Testing Schedules
        </Button>
        <Button 
          variant={view === 'workflow' ? 'primary' : 'secondary'}
          onClick={() => setView('workflow')}
        >
          Testing Workflow
        </Button>
        <Button 
          variant={view === 'components' ? 'primary' : 'secondary'}
          onClick={() => setView('components')}
        >
          Component Demo
        </Button>
      </div>
      {view === 'components' ? <ComponentDemo /> : view === 'workflow' ? <TestingWorkflow /> : <TestingSchedulePreview />}
    </div>
  );
}

export default App;
