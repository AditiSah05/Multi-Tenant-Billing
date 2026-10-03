import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  { id: 1, short: 'Jan', full: 'January' },
  { id: 2, short: 'Feb', full: 'February' },
  { id: 3, short: 'Mar', full: 'March' },
  { id: 4, short: 'Apr', full: 'April' },
  { id: 5, short: 'May', full: 'May' },
  { id: 6, short: 'Jun', full: 'June' },
  { id: 7, short: 'Jul', full: 'July' },
  { id: 8, short: 'Aug', full: 'August' },
  { id: 9, short: 'Sep', full: 'September' },
  { id: 10, short: 'Oct', full: 'October' },
  { id: 11, short: 'Nov', full: 'November' },
  { id: 12, short: 'Dec', full: 'December' },
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028];

const AuditPeriodPicker = ({ month = new Date().getMonth() + 1, year = new Date().getFullYear(), onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedMonthObj = MONTHS.find((m) => m.id === month) || MONTHS[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMonth = (mId) => {
    if (onChange) {
      onChange(mId, year);
    }
    setIsOpen(false);
  };

  const handleYearChange = (newYear) => {
    if (onChange) {
      onChange(month, newYear);
    }
  };

  const handleQuickPreset = (preset) => {
    const now = new Date();
    if (preset === 'current') {
      onChange(now.getMonth() + 1, now.getFullYear());
    } else if (preset === 'prev') {
      let prevM = now.getMonth();
      let prevY = now.getFullYear();
      if (prevM === 0) {
        prevM = 12;
        prevY -= 1;
      }
      onChange(prevM, prevY);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
      >
        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Calendar size={14} />
        </div>
        <span>
          {selectedMonthObj.full} <strong className="text-indigo-600">{year}</strong>
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Year Stepper */}
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Audit Year
            </span>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => handleYearChange(year - 1)}
                disabled={year <= AVAILABLE_YEARS[0]}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-xs font-black text-indigo-600">{year}</span>
              <button
                type="button"
                onClick={() => handleYearChange(year + 1)}
                disabled={year >= AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Month Selection Grid */}
          <div className="p-3">
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m) => {
                const isSelected = m.id === month;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMonth(m.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-extrabold scale-[1.02]'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <span>{m.short}</span>
                    {isSelected && <Check size={12} className="stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="p-2 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <button
              type="button"
              onClick={() => handleQuickPreset('current')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-200/60 text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('prev')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Last Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditPeriodPicker;
