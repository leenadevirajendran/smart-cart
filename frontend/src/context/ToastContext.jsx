import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed inset-x-0 top-24 z-[100] flex justify-center px-4 pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg text-white font-medium text-base animate-toast-in ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-signal'
            }`}
          >
            <span className="text-xl">{toast.type === 'error' ? '⚠️' : '✓'}</span>
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}