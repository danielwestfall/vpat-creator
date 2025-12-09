import React, { useEffect, useState } from 'react';
import { toast } from '../../store/toast-store';
import { Button, Input } from '../common';
import type { VPATTemplate } from '../../models/template-types';
import {
  getAllTemplates,
  deleteTemplate,
  duplicateTemplate,
  setDefaultTemplate,
  exportTemplate,
  importTemplate,
} from '../../services/template-service';
import './TemplateLibrary.css';

interface TemplateLibraryProps {
  onEdit: (template: VPATTemplate) => void;
  onCreate: () => void;
  onApply: (template: VPATTemplate) => void;
  onClose: () => void;
}

export function TemplateLibrary({ onEdit, onCreate, onApply, onClose }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<VPATTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const allTemplates = await getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importTemplate(file);
      await loadTemplates();
      toast.success('✅ Template imported successfully!');
    } catch (error) {
      toast.error(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    event.target.value = '';
  };

  const handleExport = (template: VPATTemplate) => {
    exportTemplate(template);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTemplate(id);
      await loadTemplates();
    } catch {
      toast.error('Failed to duplicate template');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete template "${name}"? This cannot be undone.`)) {
      try {
        await deleteTemplate(id);
        await loadTemplates();
      } catch {
        toast.error('Failed to delete template');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultTemplate(id);
      await loadTemplates();
    } catch {
      toast.error('Failed to set default template');
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="template-library">
      <div
        className="template-library__overlay"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close template library"
      />

      <div
        className="template-library__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-library-title"
      >
        <div className="template-library__header">
          <h2 id="template-library-title">Template Library</h2>
          <button className="template-library__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="template-library__toolbar">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="template-library__search"
          />

          <Button variant="primary" size="sm" onClick={onCreate}>
            ➕ Create New
          </Button>

          <label htmlFor="import-template" style={{ display: 'inline-block' }}>
            <Button variant="secondary" size="sm">
              📥 Import Template
            </Button>
          </label>
          <input
            id="import-template"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>

        <div className="template-library__body">
          {isLoading ? (
            <div className="template-library__loading">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="template-library__empty">
              {searchQuery ? 'No templates match your search' : 'No templates available'}
            </div>
          ) : (
            <div className="template-library__grid">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-card__header">
                    <h3 className="template-card__title">
                      {template.name}
                      {template.isDefault && <span className="template-card__badge">Default</span>}
                    </h3>
                    <p className="template-card__description">{template.description}</p>
                  </div>

                  <div className="template-card__details">
                    <div className="template-card__detail">
                      <span className="template-card__label">Company:</span>
                      <span className="template-card__value">{template.header.companyName}</span>
                    </div>
                    <div className="template-card__detail">
                      <span className="template-card__label">Color:</span>
                      <span
                        className="template-card__color"
                        style={{ backgroundColor: template.styling.primaryColor }}
                      />
                    </div>
                    <div className="template-card__detail">
                      <span className="template-card__label">Modified:</span>
                      <span className="template-card__value">
                        {new Date(template.modifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="template-card__actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onApply(template);
                        onClose();
                      }}
                    >
                      Use Template
                    </Button>

                    <div className="template-card__secondary-actions">
                      <button
                        className="template-card__action-btn"
                        onClick={() => {
                          onEdit(template);
                          onClose();
                        }}
                        title="Edit template"
                      >
                        ✏️
                      </button>
                      <button
                        className="template-card__action-btn"
                        onClick={() => handleExport(template)}
                        title="Export template"
                      >
                        📤
                      </button>
                      <button
                        className="template-card__action-btn"
                        onClick={() => handleDuplicate(template.id)}
                        title="Duplicate template"
                      >
                        📋
                      </button>
                      {!template.isDefault && (
                        <>
                          <button
                            className="template-card__action-btn"
                            onClick={() => handleSetDefault(template.id)}
                            title="Set as default"
                          >
                            ⭐
                          </button>
                          <button
                            className="template-card__action-btn template-card__action-btn--danger"
                            onClick={() => handleDelete(template.id, template.name)}
                            title="Delete template"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="template-library__footer">
          <p className="template-library__footer-text">
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
