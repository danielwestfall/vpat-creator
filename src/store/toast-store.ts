import { create } from 'zustand';
import type { ToastProps, ToastVariant } from '../components/common/Toast';

interface Toast extends ToastProps {
  id: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = {
      ...toast,
      id,
      onClose: () => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
        toast.onClose?.();
      },
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}));

// Helper functions for common toast types
export const toast = {
  success: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      variant: 'success' as ToastVariant,
    });
  },

  error: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      variant: 'error' as ToastVariant,
    });
  },

  warning: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      variant: 'warning' as ToastVariant,
    });
  },

  info: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      variant: 'info' as ToastVariant,
    });
  },
};
