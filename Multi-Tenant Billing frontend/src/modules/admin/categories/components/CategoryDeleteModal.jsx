import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useDeleteCategoryMutation, useDeleteSubCategoryMutation } from '../../hooks/useCategoryQueries';
import { useToast } from '../../../../context/ToastContext';

const CategoryDeleteModal = ({ isOpen, onClose, targetToDelete = null, type = 'category' }) => {
  const toast = useToast();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const deleteSubCategoryMutation = useDeleteSubCategoryMutation();

  if (!isOpen || !targetToDelete) return null;

  const isMasterCategory = type === 'category';

  const handleConfirmDelete = async () => {
    try {
      if (isMasterCategory) {
        await deleteCategoryMutation.mutateAsync(targetToDelete.id);
        toast.success(`Master Category "${targetToDelete.name}" deleted successfully.`);
      } else {
        await deleteSubCategoryMutation.mutateAsync(targetToDelete.id);
        toast.success(`Sub-Category "${targetToDelete.name}" deleted successfully.`);
      }
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Delete failed.';
      toast.error(msg);
    }
  };

  const isPending = deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle size={30} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Delete {isMasterCategory ? 'Master Category' : 'Sub-Category'}?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete <strong className="text-slate-900">"{targetToDelete.name}"</strong>?
            </p>
          </div>

          {isMasterCategory && targetToDelete.subCategories?.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-left">
              <strong>Warning:</strong> Deleting this category will automatically cascade delete{' '}
              <strong className="font-bold underline">{targetToDelete.subCategories.length} sub-categories</strong> and their custom dynamic fields!
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              <span>{isPending ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDeleteModal;
