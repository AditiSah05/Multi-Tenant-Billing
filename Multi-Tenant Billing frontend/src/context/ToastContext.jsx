import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast('success', msg, duration),
    error: (msg, duration) => addToast('error', msg, duration),
    info: (msg, duration) => addToast('info', msg, duration),
    warning: (msg, duration) => addToast('warning', msg, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Stack Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              t.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100 shadow-emerald-950/20'
                : t.type === 'error'
                ? 'bg-rose-900/90 border-rose-700 text-rose-100 shadow-rose-950/20'
                : t.type === 'warning'
                ? 'bg-amber-900/90 border-amber-700 text-amber-100 shadow-amber-950/20'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle size={20} className="text-rose-400 shrink-0" />}
              {t.type === 'warning' && <AlertCircle size={20} className="text-amber-400 shrink-0" />}
              {t.type === 'info' && <Info size={20} className="text-sky-400 shrink-0" />}
              <span className="text-xs font-semibold leading-snug">{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
