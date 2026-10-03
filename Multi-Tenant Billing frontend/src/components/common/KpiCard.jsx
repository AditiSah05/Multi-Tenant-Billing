import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const colorStyles = {
  purple: 'bg-indigo-100 text-indigo-600',
  blue: 'bg-sky-100 text-sky-600',
  green: 'bg-emerald-100 text-emerald-600',
  orange: 'bg-amber-100 text-amber-600',
  pink: 'bg-purple-100 text-purple-600',
};

const KpiCard = ({ icon: Icon, label, value, change, trend = 'up', subtext, color = 'purple' }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorStyles[color] || colorStyles.purple}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-500">{label}</div>
        <div className="text-xl font-extrabold text-slate-900 my-0.5">{value}</div>
        {change && (
          <div className={`text-xs font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change} {subtext && <span className="text-slate-400 font-normal ml-1">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
