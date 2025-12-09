import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders all items', () => {
    const items = [
      { label: 'Home', onClick: vi.fn() },
      { label: 'Section', onClick: vi.fn() },
      { label: 'Current', isActive: true },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('calls onClick when a link is clicked', () => {
    const handleClick = vi.fn();
    const items = [
      { label: 'Home', onClick: handleClick },
      { label: 'Current', isActive: true },
    ];
    render(<Breadcrumb items={items} />);

    fireEvent.click(screen.getByText('Home'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders active item as text, not button', () => {
    const items = [
      { label: 'Home', onClick: vi.fn() },
      { label: 'Current', isActive: true, onClick: vi.fn() },
    ];
    render(<Breadcrumb items={items} />);

    const activeItem = screen.getByText('Current');
    expect(activeItem.tagName).toBe('SPAN');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders separators between items', () => {
    const items = [{ label: 'Home' }, { label: 'Section' }, { label: 'Current' }];
    render(<Breadcrumb items={items} />);

    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });
});
