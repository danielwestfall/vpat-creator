import { useState, useEffect } from 'react';
import { TestingWorkflow } from './components/testing/TestingWorkflow';
import { Button } from './components/common/Button';
import { TemplateLibrary } from './components/templates/TemplateLibrary';
import { TemplateEditor } from './components/templates/TemplateEditor';
import { HelpCenter } from './components/help/HelpCenter';
import { getDefaultTemplate } from './services/template-service';
import type { VPATTemplate } from './models/template-types';
import './App.css';

type View = 'testing' | 'templates';

function App() {
  console.log('App mounted');
  const [view, setView] = useState<View>('testing');
  const [showHelp, setShowHelp] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<VPATTemplate | undefined>(undefined);
  const [editingTemplate, setEditingTemplate] = useState<VPATTemplate | undefined>(undefined);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  useEffect(() => {
    // Initialize default template if needed
    const init = async () => {
      const defaultTemplate = await getDefaultTemplate();
      if (defaultTemplate) {
        setActiveTemplate(defaultTemplate);
      }
    };
    init().catch(console.error);
  }, []);

  const handleEditTemplate = (template: VPATTemplate) => {
    setEditingTemplate(template);
    setIsCreatingTemplate(false);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setIsCreatingTemplate(true);
  };

  const handleApplyTemplate = (template: VPATTemplate) => {
    setActiveTemplate(template);
    setView('testing');
  };

  const handleSaveTemplate = (template: VPATTemplate) => {
    setEditingTemplate(undefined);
    setIsCreatingTemplate(false);
    // If the saved template is the active one, update it
    if (activeTemplate && activeTemplate.id === template.id) {
      setActiveTemplate(template);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__logo">
          <h1>VPAT Creator</h1>
          <span className="app-header__version">v1.0</span>
        </div>
        <nav className="app-header__nav gap-2">
          <Button
            variant={view === 'testing' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('testing')}
            icon="📊"
          >
            Audit
          </Button>
          <Button
            variant={view === 'templates' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('templates')}
            icon="📝"
          >
            Templates
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHelp(true)}
            aria-label="Open Help Center"
            icon="❓"
          >
            Help
          </Button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'testing' ? (
          <TestingWorkflow activeTemplate={activeTemplate} />
        ) : (
          <TemplateLibrary
            onEdit={handleEditTemplate}
            onCreate={handleCreateTemplate}
            onApply={handleApplyTemplate}
            onClose={() => setView('testing')}
          />
        )}
      </main>

      {(editingTemplate || isCreatingTemplate) && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setEditingTemplate(undefined);
            setIsCreatingTemplate(false);
          }}
        />
      )}

      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
