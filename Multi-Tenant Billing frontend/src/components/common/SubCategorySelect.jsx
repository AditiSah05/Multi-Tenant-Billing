import React from 'react';
import { useSubCategoriesQuery } from '../../modules/admin/hooks/useCategoryQueries';

export const SubCategorySelect = ({
  categoryId = null,
  value,
  onChange,
  label = 'Sub-Category',
  required = false,
  disabled = false,
  className = '',
  placeholder = '-- Select Sub-Category --',
}) => {
  const { data: subCategories = [], isLoading } = useSubCategoriesQuery(categoryId);

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
        <option value="">{isLoading ? 'Loading Sub-Categories...' : placeholder}</option>
        {subCategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubCategorySelect;
