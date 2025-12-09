import React, { useState } from 'react';
import { Button, Input } from '../components/common';
import './RoadmapPage.css';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'planned' | 'in-progress' | 'completed';
}

export const RoadmapPage: React.FC = () => {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<RoadmapItem>>({
    title: '',
    description: '',
    targetDate: '',
    status: 'planned',
  });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.targetDate) return;

    const item: RoadmapItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description || '',
      targetDate: newItem.targetDate,
      status: newItem.status as any,
    };

    setItems([...items, item]);
    setNewItem({ title: '', description: '', targetDate: '', status: 'planned' });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="roadmap-container">
      <header className="page-header">
        <h1>🗺️ Accessibility Roadmap</h1>
        <p>Plan and track future accessibility improvements for your product.</p>
      </header>

      <div className="roadmap-content">
        <div className="roadmap-form">
          <h2>Add Roadmap Item</h2>
          <div className="form-group">
            <Input
              label="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="e.g., Fix keyboard navigation in menu"
            />
            <div className="form-row">
              <Input
                label="Target Date"
                type="date"
                value={newItem.targetDate}
                onChange={(e) => setNewItem({ ...newItem, targetDate: e.target.value })}
              />
              <div className="select-wrapper">
                <label htmlFor="status-select">Status</label>
                <select
                  id="status-select"
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                  className="status-select"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <label htmlFor="description-input" className="sr-only">
              Description
            </label>
            <textarea
              id="description-input"
              className="description-input"
              placeholder="Description..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              rows={3}
            />
            <Button
              onClick={handleAddItem}
              variant="primary"
              disabled={!newItem.title || !newItem.targetDate}
            >
              Add Item
            </Button>
          </div>
        </div>

        <div className="roadmap-list">
          <h2>Planned Improvements</h2>
          {items.length === 0 ? (
            <div className="empty-state">No roadmap items added yet.</div>
          ) : (
            <div className="timeline">
              {items
                .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                .map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(item.targetDate).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <div className="item-header">
                        <h3>{item.title}</h3>
                        <span className={`status-badge status-${item.status}`}>{item.status}</span>
                      </div>
                      <p>{item.description}</p>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
