import React from 'react';
import { useCategoriesQuery } from '../../modules/admin/hooks/useCategoryQueries';

export const CategorySelect = ({
  value,
  onChange,
  label = 'Master Category',
  required = false,
  disabled = false,
  className = '',
  placeholder = '-- Select Category --',
}) => {
  const { data: categories = [], isLoading } = useCategoriesQuery();

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled || isLoading}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-60 ${className}`}
      >
        <option value="">{isLoading ? 'Loading Categories...' : placeholder}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;
