import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className={`breadcrumb-item ${item.isActive ? 'active' : ''}`}>
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
            {item.onClick && !item.isActive ? (
              <button onClick={item.onClick} className="breadcrumb-link" type="button">
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-text" aria-current={item.isActive ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
