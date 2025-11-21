import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import './Toast.css';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'info',
  duration = 5000,
  onClose,
}) => {
  return (
    <ToastPrimitive.Root
      className={`toast toast--${variant}`}
      duration={duration}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <div className="toast__content">
        <ToastPrimitive.Title className="toast__title">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="toast__description">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="toast__close" aria-label="Close">
        <span aria-hidden="true">✕</span>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="toast-viewport" />
    </ToastPrimitive.Provider>
  );
};
