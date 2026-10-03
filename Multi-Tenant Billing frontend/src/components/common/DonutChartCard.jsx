import React from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DonutChartCard = ({
  title,
  dropdownLabel = 'This Month',
  data = [],
  summaryTitle = 'Net Profit',
  summaryValue = '₹85,980',
  summaryBadge = '16.3%'
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-all">
          {dropdownLabel} <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex items-center gap-4 flex-1">
        {/* Donut Graphic */}
        <div style={{ width: 170, height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Data List */}
        <div className="flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-slate-500 font-medium">{item.name}</span>
              </div>
              <div className="font-bold text-slate-900">
                ₹{item.value.toLocaleString()}{' '}
                {item.percent && <span className="text-slate-400 font-normal ml-1">({item.percent})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer Box */}
      {summaryValue && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-center justify-between mt-auto">
          <div>
            <div className="text-xs font-semibold text-sky-700">{summaryTitle}</div>
            <div className="text-xl font-extrabold text-slate-900">{summaryValue}</div>
          </div>
          {summaryBadge && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> {summaryBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DonutChartCard;
