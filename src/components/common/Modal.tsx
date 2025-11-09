import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import './Modal.css';

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  showCloseButton = true,
  size = 'md',
  className = '',
}) => {
  const contentClasses = ['modal-content', `modal-content--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={contentClasses}>
          {(title || description) && (
            <div className="modal-header">
              {title && (
                <Dialog.Title className="modal-title">{title}</Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="modal-description">
                  {description}
                </Dialog.Description>
              )}
            </div>
          )}
          <div className="modal-body">{children}</div>
          {showCloseButton && (
            <Dialog.Close className="modal-close" aria-label="Close">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => {
  return <div className={`modal-footer ${className}`}>{children}</div>;
};

Modal.displayName = 'Modal';
ModalFooter.displayName = 'ModalFooter';
