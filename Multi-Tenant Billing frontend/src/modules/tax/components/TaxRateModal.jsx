import React, { useState, useEffect } from 'react';
import { X, Percent, Check } from 'lucide-react';
import { useCreateTaxMutation, useUpdateTaxMutation } from '../hooks/useTaxQueries';
import { useToast } from '../../../context/ToastContext';

const TaxRateModal = ({ isOpen, onClose, editingTax = null }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    percentage: '',
    status: 'ACTIVE',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useCreateTaxMutation();
  const updateMutation = useUpdateTaxMutation();

  useEffect(() => {
    if (editingTax) {
      setFormData({
        name: editingTax.name || '',
        percentage: editingTax.percentage !== undefined ? String(editingTax.percentage) : '',
        status: editingTax.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        percentage: '',
        status: 'ACTIVE',
      });
    }
    setErrorMsg('');
  }, [editingTax, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Tax name is required.');
      toast?.error('Tax name is required.');
      return;
    }

    const pct = parseFloat(formData.percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setErrorMsg('Tax percentage must be between 0% and 100%.');
      toast?.error('Tax percentage must be between 0% and 100%.');
      return;
    }

    try {
      if (editingTax) {
        await updateMutation.mutateAsync({
          taxId: editingTax.id,
          data: {
            name: formData.name.trim(),
            percentage: pct,
            status: formData.status,
          },
        });
        toast?.success(`Tax rate "${formData.name.trim()}" updated successfully!`);
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          percentage: pct,
          status: formData.status,
        });
        toast?.success(`Tax rate "${formData.name.trim()}" created successfully!`);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save tax rate.';
      setErrorMsg(msg);
      toast?.error(msg);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Percent size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTax ? 'Edit Tax Rate' : 'Add Custom Tax Rate'}
              </h3>
              <p className="text-xs text-slate-400">Configure GST / Tax Rate slab for products</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tax Slab Name *
            </label>
            <input
              type="text"
              placeholder="e.g. GST 18% or Cess 12%"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tax Percentage (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="18.00"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-semibold bg-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Check size={16} />
              {isSubmitting ? 'Saving...' : 'Save Tax Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxRateModal;
