import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../../hooks/useCategoryQueries';
import { useToast } from '../../../../context/ToastContext';

const CategoryModal = ({ isOpen, onClose, categoryToEdit = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enableWarranty, setEnableWarranty] = useState(false);
  const [defaultWarrantyPeriod, setDefaultWarrantyPeriod] = useState('12');
  const [defaultWarrantyUnit, setDefaultWarrantyUnit] = useState('MONTHS');
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useToast();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setDescription(categoryToEdit.description || '');
      setEnableWarranty(Boolean(categoryToEdit.enableWarranty));
      setDefaultWarrantyPeriod(categoryToEdit.defaultWarrantyPeriod ? String(categoryToEdit.defaultWarrantyPeriod) : '12');
      setDefaultWarrantyUnit(categoryToEdit.defaultWarrantyUnit || 'MONTHS');
    } else {
      setName('');
      setDescription('');
      setEnableWarranty(false);
      setDefaultWarrantyPeriod('12');
      setDefaultWarrantyUnit('MONTHS');
    }
    setErrorMsg('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      toast.error('Category name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      enableWarranty,
      defaultWarrantyPeriod: enableWarranty && defaultWarrantyPeriod ? parseInt(defaultWarrantyPeriod) : null,
      defaultWarrantyUnit: enableWarranty ? defaultWarrantyUnit : 'MONTHS',
    };

    try {
      if (categoryToEdit) {
        await updateMutation.mutateAsync({
          id: categoryToEdit.id,
          data: payload,
        });
        toast.success(`Master Category "${name.trim()}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Master Category "${name.trim()}" created successfully!`);
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save category.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {categoryToEdit ? 'Edit Master Category' : 'Create Master Category'}
              </h3>
              <p className="text-xs text-slate-300">
                {categoryToEdit ? 'Update details of existing top-level category' : 'Add a new main parent category'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics, Groceries, FMCG"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of products falling under this master category..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Warranty Default Configuration Toggle & Inputs */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Default Warranty</div>
                  <div className="text-[11px] text-slate-500">
                    Products in this category will default to warranty period.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableWarranty}
                  onChange={(e) => setEnableWarranty(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {enableWarranty && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Default Warranty Period
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={defaultWarrantyPeriod}
                    onChange={(e) => setDefaultWarrantyPeriod(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Warranty Unit
                  </label>
                  <select
                    value={defaultWarrantyUnit}
                    onChange={(e) => setDefaultWarrantyUnit(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="DAYS">Days</option>
                    <option value="MONTHS">Months</option>
                    <option value="YEARS">Years</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{isPending ? 'Saving...' : categoryToEdit ? 'Update Category' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
