import React from 'react';

const IconButton = ({ icon: Icon, onClick, title, color }) => {
  return (
    <button
      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 inline-flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all mr-1"
      onClick={onClick}
      title={title}
      style={{ color: color || undefined }}
    >
      {Icon && <Icon size={14} />}
    </button>
  );
};

export default IconButton;
