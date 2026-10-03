import React from 'react';
import { Shield, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PortalSwitcher = ({ role, setRole, onResetError }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 flex bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-lg max-w-[92vw] overflow-x-auto">
      <button
        type="button"
        className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          role === 'ADMIN'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        onClick={() => {
          setRole('ADMIN');
          onResetError();
          navigate('/admin/login', { replace: true });
        }}
      >
        <Shield size={14} /> Admin Login
      </button>
      <button
        type="button"
        className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          role === 'VENDOR'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        onClick={() => {
          setRole('VENDOR');
          onResetError();
          navigate('/login', { replace: true });
        }}
      >
        <Store size={14} /> Vendor Login
      </button>
    </div>
  );
};

export default PortalSwitcher;
