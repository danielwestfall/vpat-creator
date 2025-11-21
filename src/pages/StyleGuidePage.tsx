import React, { useState } from 'react';
import { Button, Input, Select } from '../components/common';
import './StyleGuidePage.css';

export interface StyleSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingStyle: 'bold' | 'normal';
  tableStyle: 'bordered' | 'striped' | 'minimal';
}

export const StyleGuidePage: React.FC = () => {
  const [settings, setSettings] = useState<StyleSettings>({
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    fontFamily: 'Helvetica',
    headingStyle: 'bold',
    tableStyle: 'bordered',
  });

  const handleSave = () => {
    // TODO: Save to global store/context
    alert('Style settings saved! (Placeholder)');
  };

  return (
    <div className="style-guide-container">
      <header className="page-header">
        <h1>🎨 Report Style Guide</h1>
        <p>Customize the visual appearance of your VPAT reports.</p>
      </header>

      <div className="style-controls">
        <section className="control-section">
          <h2>Colors</h2>
          <div className="control-group">
            <Input
              label="Primary Color"
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            />
            <Input
              label="Secondary Color"
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
            />
          </div>
        </section>

        <section className="control-section">
          <h2>Typography</h2>
          <div className="control-group">
            <Select
              label="Font Family"
              value={settings.fontFamily}
              onValueChange={(val) => setSettings({ ...settings, fontFamily: val })}
              options={[
                { value: 'Helvetica', label: 'Helvetica' },
                { value: 'Times New Roman', label: 'Times New Roman' },
                { value: 'Arial', label: 'Arial' },
              ]}
            />
            <Select
              label="Heading Style"
              value={settings.headingStyle}
              onValueChange={(val) => setSettings({ ...settings, headingStyle: val as any })}
              options={[
                { value: 'bold', label: 'Bold' },
                { value: 'normal', label: 'Normal' },
              ]}
            />
          </div>
        </section>

        <section className="control-section">
          <h2>Tables</h2>
          <div className="control-group">
            <Select
              label="Table Style"
              value={settings.tableStyle}
              onValueChange={(val) => setSettings({ ...settings, tableStyle: val as any })}
              options={[
                { value: 'bordered', label: 'Bordered' },
                { value: 'striped', label: 'Striped' },
                { value: 'minimal', label: 'Minimal' },
              ]}
            />
          </div>
        </section>

        <div className="action-bar">
          <Button onClick={handleSave} variant="primary">
            Save Settings
          </Button>
        </div>
      </div>

      <div className="preview-section">
        <h2>Preview</h2>
        <div 
          className="preview-card"
          style={{
            fontFamily: settings.fontFamily,
            borderColor: settings.primaryColor,
          }}
        >
          <h3 style={{ 
            color: settings.primaryColor, 
            fontWeight: settings.headingStyle === 'bold' ? 'bold' : 'normal' 
          }}>
            Sample Heading
          </h3>
          <p>This is how your text will look in the generated report.</p>
          
          <table className={`preview-table ${settings.tableStyle}`}>
            <thead>
              <tr style={{ backgroundColor: settings.secondaryColor, color: 'white' }}>
                <th>Criteria</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.1.1 Non-text Content</td>
                <td>Supports</td>
              </tr>
              <tr>
                <td>1.2.1 Audio-only</td>
                <td>Not Applicable</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
