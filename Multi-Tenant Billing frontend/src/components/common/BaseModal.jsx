import React from 'react';
import { X } from 'lucide-react';

const BaseModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-100 w-full ${maxWidth} overflow-hidden my-auto max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 pr-2 min-w-0">
            {Icon && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center shadow-md shrink-0">
                <Icon size={18} className="sm:hidden" />
                <Icon size={20} className="hidden sm:block" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{title}</h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-300 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X size={18} className="sm:hidden" />
            <X size={20} className="hidden sm:block" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
