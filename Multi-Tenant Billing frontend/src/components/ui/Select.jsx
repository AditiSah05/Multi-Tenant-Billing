import React from 'react';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  containerClassName = '',
  value,
  onChange,
  children,
  ...props
}, ref) => {
  return (
    <div className={`w-full space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={15} />
          </div>
        )}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`w-full py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none transition-all ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-rose-500 focus:border-rose-600'
              : 'border-slate-200 focus:border-indigo-600'
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt, idx) => (
                <option key={opt.value || idx} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      </div>
      {error && <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
