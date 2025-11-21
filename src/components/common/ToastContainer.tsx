import React from 'react';
import { useToastStore } from '../../store/toast-store';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  );
};
