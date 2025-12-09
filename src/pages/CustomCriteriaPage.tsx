import React, { useState, useEffect } from 'react';
import { toast } from '../store/toast-store';
import { Button, Input, Select } from '../components/common';
import { wcagService } from '../services/wcag-service';
import type { WCAGSuccessCriterion, ConformanceLevel } from '../models/types';
import './CustomCriteriaPage.css';

export const CustomCriteriaPage: React.FC = () => {
  const [criteria, setCriteria] = useState<WCAGSuccessCriterion[]>([]);
  const [newCriterion, setNewCriterion] = useState<Partial<WCAGSuccessCriterion>>({
    num: '',
    title: '',
    level: 'A',
    content: '',
  });

  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = () => {
    // Find the custom principle and get its criteria
    const principles = wcagService.getPrinciples();
    const customPrinciple = principles.find((p) => p.id === 'custom');
    if (customPrinciple && customPrinciple.guidelines.length > 0) {
      setCriteria(customPrinciple.guidelines[0].successcriteria);
    } else {
      setCriteria([]);
    }
  };

  const handleAdd = () => {
    if (!newCriterion.num || !newCriterion.title || !newCriterion.content) {
      toast.error('Please fill in all fields');
      return;
    }

    const id = `custom-${newCriterion.num?.replace(/\./g, '-')}`;

    const criterion: WCAGSuccessCriterion = {
      id,
      num: newCriterion.num!,
      handle: newCriterion.title!, // Using title as handle for simplicity
      title: newCriterion.title!,
      content: newCriterion.content!,
      level: newCriterion.level as ConformanceLevel,
      versions: ['2.2'],
    };

    try {
      wcagService.addCustomCriterion(criterion);
      setNewCriterion({ num: '', title: '', level: 'A', content: '' });
      loadCriteria();
      toast.success('Custom criterion added successfully!');
    } catch {
      toast.error('Failed to add criterion. ID might already exist.');
    }
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to delete this criterion?')) {
      wcagService.removeCustomCriterion(id);
      loadCriteria();
    }
  };

  return (
    <div className="custom-criteria-container">
      <header className="page-header">
        <h1>🛠️ Custom WCAG Criteria</h1>
        <p>Define additional success criteria specific to your organization or project.</p>
      </header>

      <div className="criteria-content">
        <div className="criteria-form">
          <h2>Add New Criterion</h2>
          <div className="form-group">
            <div className="form-row">
              <Input
                label="Number"
                value={newCriterion.num}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCriterion({ ...newCriterion, num: e.target.value })
                }
                placeholder="e.g., 5.1.1"
              />
              <Select
                label="Level"
                value={newCriterion.level}
                onValueChange={(val) =>
                  setNewCriterion({ ...newCriterion, level: val as ConformanceLevel })
                }
                options={[
                  { value: 'A', label: 'Level A' },
                  { value: 'AA', label: 'Level AA' },
                  { value: 'AAA', label: 'Level AAA' },
                ]}
              />
            </div>
            <Input
              label="Title"
              value={newCriterion.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCriterion({ ...newCriterion, title: e.target.value })
              }
              placeholder="e.g., Brand Color Contrast"
            />
            <div className="input-wrapper">
              <label htmlFor="criteria-content">Description / Requirements</label>
              <textarea
                id="criteria-content"
                className="criteria-textarea"
                value={newCriterion.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewCriterion({ ...newCriterion, content: e.target.value })
                }
                rows={4}
              />
            </div>
            <Button onClick={handleAdd} variant="primary">
              Add Criterion
            </Button>
          </div>
        </div>

        <div className="criteria-list">
          <h2>Existing Custom Criteria</h2>
          {criteria.length === 0 ? (
            <div className="empty-state">No custom criteria added yet.</div>
          ) : (
            <div className="list-container">
              {criteria.map((c) => (
                <div key={c.id} className="criterion-card">
                  <div className="criterion-header">
                    <span className="criterion-num">{c.num}</span>
                    <span className={`level-badge level-${c.level}`}>{c.level}</span>
                    <button
                      className="delete-btn"
                      onClick={() => handleRemove(c.id)}
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
