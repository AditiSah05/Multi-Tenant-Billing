import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  containerClassName = '',
  uppercase = false,
  value,
  onChange,
  ...props
}, ref) => {
  const handleInputChange = (e) => {
    if (uppercase && onChange) {
      e.target.value = e.target.value.toUpperCase();
    }
    if (onChange) onChange(e);
  };

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
        <input
          ref={ref}
          value={value}
          onChange={handleInputChange}
          className={`w-full py-2 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none transition-all ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500'
          } ${uppercase ? 'uppercase' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
