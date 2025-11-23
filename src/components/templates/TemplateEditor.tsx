import React, { useState } from 'react';
import { Button, Input, Select, Checkbox } from '../common';
import type { VPATTemplate } from '../../models/template-types';
import { saveTemplate, createTemplate } from '../../services/template-service';
import './TemplateEditor.css';

interface TemplateEditorProps {
  template?: VPATTemplate; // undefined for new template
  onSave: (template: VPATTemplate) => void;
  onCancel: () => void;
}

type TabName = 'branding' | 'sections' | 'styling' | 'columns';

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<TabName>('branding');
  const [formData, setFormData] = useState<Omit<VPATTemplate, 'id' | 'createdAt' | 'modifiedAt'>>(
    template || {
      name: 'New Template',
      description: '',
      version: '1.0',
      isDefault: false,
      header: {
        companyName: '',
        reportTitle: 'Accessibility Conformance Report',
        includeDate: true,
        includePageNumbers: true,
      },
      sections: {
        executiveSummary: { enabled: true, title: 'Executive Summary' },
        productInfo: { enabled: true, title: 'Product Information' },
        evaluationMethods: { enabled: true, title: 'Evaluation Methods' },
        applicableCriteria: { enabled: true, title: 'Applicable Standards' },
        legalDisclaimer: { 
          enabled: true, 
          content: 'This document is provided for information purposes only.' 
        },
      },
      styling: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'Arial',
        fontSize: 11,
        tableStyle: 'bordered',
        headerStyle: 'both',
      },
      columns: {
        criterionNumber: true,
        criterionName: true,
        levelColumn: true,
        conformanceStatus: true,
        remarks: true,
        customColumns: [],
      },
    }
  );

  const handleSave = async () => {
    try {
      let savedTemplate: VPATTemplate;
      
      if (template) {
        // Update existing
        savedTemplate = { ...template, ...formData };
        await saveTemplate(savedTemplate);
      } else {
        // Create new
        savedTemplate = await createTemplate(formData);
      }
      
      onSave(savedTemplate);
    } catch (error) {
      alert('Failed to save template');
      console.error(error);
    }
  };

  const tabs: { id: TabName; label: string; icon: string }[] = [
    { id: 'branding', label: 'Branding', icon: '🏢' },
    { id: 'sections', label: 'Sections', icon: '📄' },
    { id: 'styling', label: 'Styling', icon: '🎨' },
    { id: 'columns', label: 'Columns', icon: '📊' },
  ];

  return (
    <div className="template-editor">
      <div className="template-editor__overlay" onClick={onCancel} />

      <div className="template-editor__content" role="dialog" aria-modal="true">
        <div className="template-editor__header">
          <h2>{template ? 'Edit Template' : 'Create New Template'}</h2>
          <button className="template-editor__close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="template-editor__tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`template-editor__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="template-editor__tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="template-editor__body">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="template-editor__section">
              <h3>Template Information</h3>
              
              <Input
                label="Template Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Custom Template"
                required
              />

              <Input
                label="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template"
              />

              <h3 style={{ marginTop: '2rem' }}>Company Branding</h3>

              <Input
                label="Company Name"
                value={formData.header.companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                  ...formData,
                  header: { ...formData.header, companyName: e.target.value }
                })}
                placeholder="Your Company Name"
              />

              <Input
                label="Report Title"
                value={formData.header.reportTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                  ...formData,
                  header: { ...formData.header, reportTitle: e.target.value }
                })}
                placeholder="Accessibility Conformance Report"
              />

              <div className="template-editor__checkbox-group">
                <Checkbox
                  label="Include Date in Report"
                  checked={formData.header.includeDate}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    header: { ...formData.header, includeDate: checked }
                  })}
                />
                <Checkbox
                  label="Include Page Numbers"
                  checked={formData.header.includePageNumbers}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    header: { ...formData.header, includePageNumbers: checked }
                  })}
                />
              </div>
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="template-editor__section">
              <h3>Report Sections</h3>
              <p className="template-editor__hint">Choose which sections to include in your reports</p>

              <div className="template-editor__section-list">
                {Object.entries(formData.sections).map(([key, section]) => (
                  <div key={key} className="template-editor__section-item">
                    <Checkbox
                      label={section.title}
                      checked={section.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        sections: {
                          ...formData.sections,
                          [key]: { ...section, enabled: checked }
                        }
                      })}
                    />
                    <Input
                      value={section.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                        ...formData,
                        sections: {
                          ...formData.sections,
                          [key]: { ...section, title: e.target.value }
                        }
                      })}
                      placeholder="Section title"
                      className="template-editor__section-title-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Styling Tab */}
          {activeTab === 'styling' && (
            <div className="template-editor__section">
              <h3>Visual Styling</h3>

              <div className="template-editor__color-inputs">
                <div className="template-editor__color-field">
                  <label>Primary Color</label>
                  <div className="template-editor__color-picker">
                    <input
                      type="color"
                      value={formData.styling.primaryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                        ...formData,
                        styling: { ...formData.styling, primaryColor: e.target.value }
                      })}
                    />
                    <Input
                      value={formData.styling.primaryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                        ...formData,
                        styling: { ...formData.styling, primaryColor: e.target.value }
                      })}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                <div className="template-editor__color-field">
                  <label>Secondary Color</label>
                  <div className="template-editor__color-picker">
                    <input
                      type="color"
                      value={formData.styling.secondaryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                        ...formData,
                        styling: { ...formData.styling, secondaryColor: e.target.value }
                      })}
                    />
                    <Input
                      value={formData.styling.secondaryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                        ...formData,
                        styling: { ...formData.styling, secondaryColor: e.target.value }
                      })}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>

              <Select
                label="Font Family"
                value={formData.styling.fontFamily}
                onValueChange={(value) => setFormData({
                  ...formData,
                  styling: { ...formData.styling, fontFamily: value as any }
                })}
                options={[
                  { value: 'Arial', label: 'Arial' },
                  { value: 'Helvetica', label: 'Helvetica' },
                  { value: 'Times New Roman', label: 'Times New Roman' },
                  { value: 'Calibri', label: 'Calibri' },
                  { value: 'Georgia', label: 'Georgia' },
                ]}
              />

              <div className="template-editor__font-size">
                <label>Font Size: {formData.styling.fontSize}pt</label>
                <input
                  type="range"
                  min="9"
                  max="14"
                  value={formData.styling.fontSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                    ...formData,
                    styling: { ...formData.styling, fontSize: Number(e.target.value) }
                  })}
                />
              </div>

              <Select
                label="Table Style"
                value={formData.styling.tableStyle}
                onValueChange={(value) => setFormData({
                  ...formData,
                  styling: { ...formData.styling, tableStyle: value as any }
                })}
                options={[
                  { value: 'bordered', label: 'Bordered' },
                  { value: 'striped', label: 'Striped Rows' },
                  { value: 'minimal', label: 'Minimal' },
                ]}
              />
            </div>
          )}

          {/* Columns Tab */}
          {activeTab === 'columns' && (
            <div className="template-editor__section">
              <h3>Table Columns</h3>
              <p className="template-editor__hint">Select which columns to include in WCAG tables</p>

              <div className="template-editor__checkbox-group">
                <Checkbox
                  label="Criterion Number (e.g., 1.1.1)"
                  checked={formData.columns.criterionNumber}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    columns: { ...formData.columns, criterionNumber: checked }
                  })}
                />
                <Checkbox
                  label="Criterion Name"
                  checked={formData.columns.criterionName}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    columns: { ...formData.columns, criterionName: checked }
                  })}
                />
                <Checkbox
                  label="Level Column (A, AA, AAA)"
                  checked={formData.columns.levelColumn}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    columns: { ...formData.columns, levelColumn: checked }
                  })}
                />
                <Checkbox
                  label="Conformance Status"
                  checked={formData.columns.conformanceStatus}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    columns: { ...formData.columns, conformanceStatus: checked }
                  })}
                />
                <Checkbox
                  label="Remarks/Notes"
                  checked={formData.columns.remarks}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    columns: { ...formData.columns, remarks: checked }
                  })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="template-editor__footer">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}
