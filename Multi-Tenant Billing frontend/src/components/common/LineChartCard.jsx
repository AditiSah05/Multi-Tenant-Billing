import React from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const LineChartCard = ({
  title,
  subtitleValue,
  subtitleBadgeText,
  subtitleSubtext,
  dropdownLabel = 'Last 7 Days',
  data = [],
  xKey = 'name',
  yKey = 'sales',
  strokeColor = '#4f46e5',
  height = 260
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitleValue && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-extrabold text-slate-900">{subtitleValue}</span>
              {subtitleBadgeText && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight size={14} /> {subtitleBadgeText}
                </span>
              )}
              {subtitleSubtext && <span className="text-xs text-slate-400">{subtitleSubtext}</span>}
            </div>
          )}
        </div>

        <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-all">
          {dropdownLabel} <ChevronDown size={14} />
        </button>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `₹${v / 1000}K` : v)}
            />
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}`, title]}
              contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={strokeColor}
              strokeWidth={3}
              dot={{ r: 4, fill: strokeColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartCard;
