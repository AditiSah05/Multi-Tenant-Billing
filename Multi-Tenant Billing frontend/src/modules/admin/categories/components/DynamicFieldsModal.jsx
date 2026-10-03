import React, { useState } from 'react';
import { X, SlidersHorizontal, Plus, Trash2, Edit3, CheckCircle, AlertCircle, Save, CheckSquare, Square } from 'lucide-react';
import {
  useAddAdditionalFieldMutation,
  useUpdateAdditionalFieldMutation,
  useDeleteAdditionalFieldMutation,
} from '../../hooks/useCategoryQueries';
import { useToast } from '../../../../context/ToastContext';

const INPUT_TYPES = [
  { value: 'TEXT', label: 'Text Field' },
  { value: 'NUMBER', label: 'Numeric Value' },
  { value: 'DATE', label: 'Date Picker' },
  { value: 'DROPDOWN', label: 'Dropdown Selector' },
  { value: 'BOOLEAN', label: 'Yes/No Toggle' },
];

const DynamicFieldsModal = ({ isOpen, onClose, subCategory = null }) => {
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [labelName, setLabelName] = useState('');
  const [inputType, setInputType] = useState('TEXT');
  const [isRequired, setIsRequired] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useToast();
  const addMutation = useAddAdditionalFieldMutation();
  const updateMutation = useUpdateAdditionalFieldMutation();
  const deleteMutation = useDeleteAdditionalFieldMutation();

  if (!isOpen || !subCategory) return null;

  const resetForm = () => {
    setEditingFieldId(null);
    setLabelName('');
    setInputType('TEXT');
    setIsRequired(false);
    setStatus('ACTIVE');
    setErrorMsg('');
  };

  const handleStartEdit = (field) => {
    setEditingFieldId(field.id);
    setLabelName(field.labelName);
    setInputType(field.inputType || 'TEXT');
    setIsRequired(Boolean(field.isRequired));
    setStatus(field.status || 'ACTIVE');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!labelName.trim()) {
      setErrorMsg('Field label name is required.');
      toast.error('Field label name is required.');
      return;
    }

    try {
      if (editingFieldId) {
        await updateMutation.mutateAsync({
          fieldId: editingFieldId,
          fieldData: {
            labelName: labelName.trim(),
            inputType,
            isRequired,
            status,
          },
        });
        toast.success(`Attribute field "${labelName.trim()}" updated successfully!`);
      } else {
        await addMutation.mutateAsync({
          subCategoryId: subCategory.id,
          fieldData: {
            labelName: labelName.trim(),
            inputType,
            isRequired,
            status,
          },
        });
        toast.success(`Attribute field "${labelName.trim()}" added successfully!`);
      }
      resetForm();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save field.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (fieldId) => {
    try {
      await deleteMutation.mutateAsync(fieldId);
      toast.info('Attribute field deleted.');
      if (editingFieldId === fieldId) resetForm();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete field.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Dynamic Custom Fields</h3>
              <p className="text-xs text-slate-300">
                Sub-Category: <strong className="text-indigo-300">{subCategory.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add / Edit Form Card */}
          <form onSubmit={handleSave} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                {editingFieldId ? 'Edit Attribute Field' : 'Add New Attribute Field'}
              </span>
              {editingFieldId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Add New Field Instead
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Field Label Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMEI 1, Warranty Months, Fabric"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Input Data Type</label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {INPUT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsRequired(!isRequired)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    isRequired
                      ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {isRequired ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Required Field</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>{status}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>{editingFieldId ? 'Update Field' : 'Add Field'}</span>
              </button>
            </div>
          </form>

          {/* Existing Configured Fields List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Configured Attribute Fields</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {subCategory.additionalFields?.length || 0} Fields
              </span>
            </h4>

            {(!subCategory.additionalFields || subCategory.additionalFields.length === 0) ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                No dynamic fields configured yet. Use the form above to add custom product input fields.
              </div>
            ) : (
              <div className="space-y-2">
                {subCategory.additionalFields.map((field) => (
                  <div
                    key={field.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      editingFieldId === field.id
                        ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {field.inputType === 'NUMBER' ? '#' : field.inputType === 'DATE' ? '📅' : 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{field.labelName}</span>
                          {field.isRequired && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                              Required
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                              field.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {field.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Input Type: {field.inputType}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(field)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Field"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicFieldsModal;
