import React, { useState, useMemo } from 'react';
import { Input } from '../common';
import { HELP_TOPICS } from '../../data/help-content';
import './HelpCenter.css';

interface HelpCenterProps {
  onClose: () => void;
}

export function HelpCenter({ onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(HELP_TOPICS[0].id);

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return HELP_TOPICS;
    
    const lowerQuery = searchQuery.toLowerCase();
    return HELP_TOPICS.filter(topic => 
      topic.title.toLowerCase().includes(lowerQuery) || 
      topic.content.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const selectedTopic = HELP_TOPICS.find(t => t.id === selectedTopicId) || HELP_TOPICS[0];

  const categories = {
    basics: 'Basics',
    testing: 'Testing',
    collaboration: 'Collaboration',
    advanced: 'Advanced'
  };

  return (
    <div className="help-center">
      <div 
        className="help-center__overlay" 
        onClick={onClose}
        role="button"
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close help center"
      />
      
      <div className="help-center__content" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <div className="help-center__header">
          <h2 id="help-title">Help Center</h2>
          <button className="help-center__close" onClick={onClose} aria-label="Close help">
            ×
          </button>
        </div>

        <div className="help-center__body">
          <div className="help-center__sidebar">
            <div className="help-center__search">
              <Input
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                fullWidth
              />
            </div>

            <nav className="help-center__nav">
              {Object.entries(categories).map(([catKey, catLabel]) => {
                const catTopics = filteredTopics.filter(t => t.category === catKey);
                if (catTopics.length === 0) return null;

                return (
                  <div key={catKey} className="help-center__category">
                    <h3 className="help-center__category-title">{catLabel}</h3>
                    <ul className="help-center__topic-list">
                      {catTopics.map(topic => (
                        <li key={topic.id}>
                          <button
                            className={`help-center__topic-btn ${selectedTopicId === topic.id ? 'active' : ''}`}
                            onClick={() => setSelectedTopicId(topic.id)}
                            aria-current={selectedTopicId === topic.id ? 'page' : undefined}
                          >
                            <span className="help-center__topic-icon" aria-hidden="true">{topic.icon}</span>
                            {topic.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              
              {filteredTopics.length === 0 && (
                <div className="help-center__no-results">
                  No topics found matching "{searchQuery}"
                </div>
              )}
            </nav>
          </div>

          <main className="help-center__main">
            <div className="help-center__article">
              <div className="help-center__article-header">
                <span className="help-center__article-icon">{selectedTopic.icon}</span>
                <h1>{selectedTopic.title}</h1>
              </div>
              
              <div 
                className="help-center__article-content"
                dangerouslySetInnerHTML={{ __html: selectedTopic.content }} 
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
