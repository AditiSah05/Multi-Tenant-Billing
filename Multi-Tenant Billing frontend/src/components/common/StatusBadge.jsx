import React from 'react';

const StatusBadge = ({ status, onClick, title, className = '' }) => {
  const s = (status || '').toString().toUpperCase();
  
  // Check inactive/suspended state
  const isInactive = s === 'SUSPENDED' || s === 'INACTIVE' || s === 'DISABLED';
  const isPending = s === 'PENDING' || s === 'PARTIAL' || s === 'PARTIALLY PAID';
  const isDanger = s === 'CANCELLED' || s === 'UNPAID' || s === 'OVERDUE';

  let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
  let label = 'Active';

  if (isInactive) {
    badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
    label = 'Inactive';
  } else if (isPending) {
    badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
    label = status || 'Pending';
  } else if (isDanger) {
    badgeStyle = 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200';
    label = status || 'Unpaid';
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title || 'Click to change status'}
        className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer hover:scale-105 shadow-2xs ${badgeStyle} ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${badgeStyle} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
