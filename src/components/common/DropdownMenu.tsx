import React, { useRef, useState, useEffect } from 'react';
import { Button, type ButtonProps } from './Button';
import './DropdownMenu.css';

export interface DropdownMenuItem {
  label: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface DropdownMenuProps {
  label: React.ReactNode;
  items: DropdownMenuItem[];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  icon?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  items,
  variant = 'secondary',
  size = 'sm',
  icon,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className={`dropdown-menu ${className}`} ref={menuRef}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
        icon={icon}
      >
        {label}
        <span className="dropdown-caret">▼</span>
      </Button>

      {isOpen && (
        <div className={`dropdown-content dropdown-content--${align}`}>
          {items.map((item, index) => (
            <button
              key={index}
              className={`dropdown-item ${item.variant ? `dropdown-item--${item.variant}` : ''}`}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
