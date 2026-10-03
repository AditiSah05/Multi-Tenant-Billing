import React, { useState, useEffect } from 'react';
import { X, Layers, Plus, Trash2, Calendar, AlertCircle, Save, CheckSquare, Square, ShieldCheck } from 'lucide-react';
import { useCreateSubCategoryMutation, useUpdateSubCategoryMutation } from '../../hooks/useCategoryQueries';
import { useToast } from '../../../../context/ToastContext';

const INPUT_TYPES = [
  { value: 'TEXT', label: 'Text Field' },
  { value: 'NUMBER', label: 'Numeric Value' },
  { value: 'DATE', label: 'Date Picker' },
  { value: 'DROPDOWN', label: 'Dropdown Selector' },
  { value: 'BOOLEAN', label: 'Yes/No Toggle' },
];

const SubCategoryModal = ({ isOpen, onClose, masterCategories = [], preselectedCategoryId = '', subCategoryToEdit = null }) => {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enableExpiryDate, setEnableExpiryDate] = useState(false);
  const [enableWarranty, setEnableWarranty] = useState(false);
  const [defaultWarrantyPeriod, setDefaultWarrantyPeriod] = useState('12');
  const [defaultWarrantyUnit, setDefaultWarrantyUnit] = useState('MONTHS');
  const [additionalFields, setAdditionalFields] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useToast();
  const createMutation = useCreateSubCategoryMutation();
  const updateMutation = useUpdateSubCategoryMutation();

  useEffect(() => {
    if (subCategoryToEdit) {
      setCategoryId(subCategoryToEdit.categoryId || preselectedCategoryId || '');
      setName(subCategoryToEdit.name || '');
      setDescription(subCategoryToEdit.description || '');
      setEnableExpiryDate(Boolean(subCategoryToEdit.enableExpiryDate));
      setEnableWarranty(Boolean(subCategoryToEdit.enableWarranty));
      setDefaultWarrantyPeriod(subCategoryToEdit.defaultWarrantyPeriod ? String(subCategoryToEdit.defaultWarrantyPeriod) : '12');
      setDefaultWarrantyUnit(subCategoryToEdit.defaultWarrantyUnit || 'MONTHS');
      setAdditionalFields(subCategoryToEdit.additionalFields || []);
    } else {
      const initialCatId = preselectedCategoryId || (masterCategories[0]?.id || '');
      setCategoryId(initialCatId);
      setName('');
      setDescription('');
      setEnableExpiryDate(false);

      const parentCat = masterCategories.find((c) => c.id === initialCatId);
      if (parentCat) {
        setEnableWarranty(Boolean(parentCat.enableWarranty));
        setDefaultWarrantyPeriod(parentCat.defaultWarrantyPeriod ? String(parentCat.defaultWarrantyPeriod) : '12');
        setDefaultWarrantyUnit(parentCat.defaultWarrantyUnit || 'MONTHS');
      } else {
        setEnableWarranty(false);
        setDefaultWarrantyPeriod('12');
        setDefaultWarrantyUnit('MONTHS');
      }
      setAdditionalFields([]);
    }
    setErrorMsg('');
  }, [subCategoryToEdit, preselectedCategoryId, masterCategories, isOpen]);

  const handleCategorySelectChange = (newCatId) => {
    setCategoryId(newCatId);
    if (!subCategoryToEdit) {
      const parentCat = masterCategories.find((c) => c.id === newCatId);
      if (parentCat) {
        setEnableWarranty(Boolean(parentCat.enableWarranty));
        setDefaultWarrantyPeriod(parentCat.defaultWarrantyPeriod ? String(parentCat.defaultWarrantyPeriod) : '12');
        setDefaultWarrantyUnit(parentCat.defaultWarrantyUnit || 'MONTHS');
      }
    }
  };

  if (!isOpen) return null;

  const handleAddFieldRow = () => {
    setAdditionalFields([
      ...additionalFields,
      { labelName: '', inputType: 'TEXT', isRequired: false, status: 'ACTIVE' },
    ]);
  };

  const handleRemoveFieldRow = (index) => {
    setAdditionalFields(additionalFields.filter((_, idx) => idx !== index));
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...additionalFields];
    updated[index][key] = value;
    setAdditionalFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Please select a Parent Master Category.');
      toast.error('Please select a Parent Master Category.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Sub-Category name is required.');
      toast.error('Sub-Category name is required.');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        enableExpiryDate,
        enableWarranty,
        defaultWarrantyPeriod: enableWarranty && defaultWarrantyPeriod ? parseInt(defaultWarrantyPeriod) : null,
        defaultWarrantyUnit: enableWarranty ? defaultWarrantyUnit : 'MONTHS',
      };

      if (subCategoryToEdit) {
        await updateMutation.mutateAsync({
          id: subCategoryToEdit.id,
          data: payload,
        });
        toast.success(`Sub-Category "${name.trim()}" updated successfully!`);
      } else {
        const validFields = additionalFields.filter((f) => f.labelName && f.labelName.trim());
        await createMutation.mutateAsync({
          ...payload,
          categoryId,
          additionalFields: validFields,
        });
        toast.success(`Sub-Category "${name.trim()}" created successfully!`);
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save sub-category.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {subCategoryToEdit ? 'Edit Sub-Category' : 'Create Sub-Category'}
              </h3>
              <p className="text-xs text-slate-300">
                {subCategoryToEdit ? 'Update sub-category metadata and options' : 'Add sub-category under parent category'}
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

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Master Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Parent Master Category <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={Boolean(subCategoryToEdit)}
              value={categoryId}
              onChange={(e) => handleCategorySelectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-60"
            >
              <option value="">-- Select Master Category --</option>
              {masterCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Category Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Sub-Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smartphones, Packaged Biscuits, Dairy"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe sub-category classification..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Enable Expiry Date Feature Toggle */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Expiry Date for Products</div>
                <div className="text-[11px] text-slate-500">
                  Products under this sub-category will require expiration dates on stock creation (Ideal for Food, Medicine, FMCG).
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableExpiryDate}
                onChange={(e) => setEnableExpiryDate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
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
                    Products under this sub-category will default to warranty period.
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

          {/* Dynamic Additional Fields Section (only for new sub-categories) */}
          {!subCategoryToEdit && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Dynamic Custom Fields <span className="text-slate-400 font-normal">(Optional)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Define custom attributes for products in this sub-category (e.g. Serial No, RAM, Storage).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddFieldRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-indigo-200"
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>

              {additionalFields.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No custom attributes added yet. Click "+ Add Field" above if needed.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {additionalFields.map((field, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs"
                    >
                      <input
                        type="text"
                        placeholder="Label (e.g. IMEI / Warranty)"
                        value={field.labelName}
                        onChange={(e) => handleFieldChange(idx, 'labelName', e.target.value)}
                        className="flex-1 min-w-[140px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <select
                        value={field.inputType}
                        onChange={(e) => handleFieldChange(idx, 'inputType', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      >
                        {INPUT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleFieldChange(idx, 'isRequired', !field.isRequired)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          field.isRequired
                            ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {field.isRequired ? <CheckSquare size={14} /> : <Square size={14} />}
                        <span>Required</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveFieldRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Field"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
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
              <span>{isPending ? 'Saving...' : subCategoryToEdit ? 'Update Sub-Category' : 'Create Sub-Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryModal;
