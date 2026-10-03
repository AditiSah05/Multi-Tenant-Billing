import React, { useState, useEffect } from 'react';
import { X, Layers, Plus, Minus, CheckCircle2, Loader2, Scale, AlertOctagon, ShieldAlert } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import {
  useAdjustStockMutation,
  useReconcileStockMutation,
  useDamageStockMutation,
  useLostStockMutation,
} from '../hooks/useInventoryQueries';

const AdjustStockModal = ({ isOpen, onClose, product, initialType = 'ADD', toast: toastProp }) => {
  const toastContext = useToast();
  const toast = toastProp || toastContext;

  const adjustStockMutation = useAdjustStockMutation();
  const reconcileStockMutation = useReconcileStockMutation();
  const damageStockMutation = useDamageStockMutation();
  const lostStockMutation = useLostStockMutation();

  const [adjustmentType, setAdjustmentType] = useState('ADD'); // 'ADD', 'REMOVE', 'RECONCILE', 'DAMAGE', 'LOST'
  const [quantity, setQuantity] = useState('10');
  const [selectedUnit, setSelectedUnit] = useState('Pcs');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (product) {
      setAdjustmentType(initialType || 'ADD');
      const primary = product.unit || 'Pcs';
      setSelectedUnit(primary);
      const current = product.currentStock !== undefined ? product.currentStock : (product.qty !== undefined ? product.qty : (product.stock || 0));
      if (initialType === 'RECONCILE') {
        setQuantity(String(current));
      } else if (initialType === 'DAMAGE' || initialType === 'LOST') {
        setQuantity('1');
      } else if (initialType === 'REMOVE') {
        setQuantity('5');
      } else {
        setQuantity('10');
      }
      setNotes('');
    }
  }, [product, initialType, isOpen]);

  if (!isOpen || !product) return null;

  const currentQty = product.currentStock !== undefined ? product.currentStock : (product.qty !== undefined ? product.qty : (product.stock || 0));
  const primaryUnit = product.unit || 'Pcs';
  const hasSecondary = Boolean(product.hasSecondaryUnit && product.secondaryUnit);
  const secondaryUnit = product.secondaryUnit || '';
  const conversionFactor = Number(product.conversionFactor) || 1;

  const isPending =
    adjustStockMutation.isPending ||
    reconcileStockMutation.isPending ||
    damageStockMutation.isPending ||
    lostStockMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qtyVal = parseFloat(quantity);
    if (isNaN(qtyVal) || qtyVal < 0) {
      if (toast) toast.error('Please enter a valid non-negative quantity.');
      return;
    }

    const productId = product.id || product._id;

    if (adjustmentType === 'RECONCILE') {
      reconcileStockMutation.mutate(
        { productId, physicalCount: qtyVal, unit: selectedUnit, notes: notes || 'Physical Stock Audit Reconciliation' },
        {
          onSuccess: (res) => {
            if (toast) toast.success(res?.message || `Physical stock reconciled to ${qtyVal} ${selectedUnit}!`);
            onClose();
          },
          onError: (err) => {
            if (toast) toast.error(err?.response?.data?.message || 'Reconciliation failed.');
          },
        }
      );
      return;
    }

    if (adjustmentType === 'DAMAGE') {
      if (qtyVal <= 0) {
        if (toast) toast.error('Damaged quantity must be greater than zero.');
        return;
      }
      damageStockMutation.mutate(
        { productId, damagedQuantity: qtyVal, unit: selectedUnit, notes: notes || 'Damaged stock write-off' },
        {
          onSuccess: () => {
            if (toast) toast.success(`Wrote off ${qtyVal} ${selectedUnit} damaged stock for "${product.name || product.product}"!`);
            onClose();
          },
          onError: (err) => {
            if (toast) toast.error(err?.response?.data?.message || 'Failed to write-off damaged stock.');
          },
        }
      );
      return;
    }

    if (adjustmentType === 'LOST') {
      if (qtyVal <= 0) {
        if (toast) toast.error('Lost quantity must be greater than zero.');
        return;
      }
      lostStockMutation.mutate(
        { productId, lostQuantity: qtyVal, unit: selectedUnit, notes: notes || 'Lost/Stolen stock write-off' },
        {
          onSuccess: () => {
            if (toast) toast.success(`Wrote off ${qtyVal} ${selectedUnit} lost/stolen stock for "${product.name || product.product}"!`);
            onClose();
          },
          onError: (err) => {
            if (toast) toast.error(err?.response?.data?.message || 'Failed to write-off lost stock.');
          },
        }
      );
      return;
    }

    // Manual Add / Remove
    let qtyChange = 0;
    if (adjustmentType === 'ADD') qtyChange = qtyVal;
    else if (adjustmentType === 'REMOVE') qtyChange = -qtyVal;

    if (qtyChange === 0) {
      if (toast) toast.info('No quantity change specified.');
      return;
    }

    adjustStockMutation.mutate(
      { productId, quantityChange: qtyChange, unit: selectedUnit, reason: notes.trim() || (qtyChange > 0 ? 'STOCK_ADJUSTMENT' : 'MANUAL_ADJUSTMENT'), customReason: notes.trim() || null },
      {
        onSuccess: () => {
          if (toast) toast.success(`Stock for "${product.name || product.product}" updated successfully!`);
          onClose();
        },
        onError: (err) => {
          if (toast) toast.error(err?.response?.data?.message || 'Failed to update stock.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Adjust Inventory Stock</h3>
              <p className="text-xs text-slate-500 font-semibold">
                {product.name || product.product} • Current: <strong className="text-slate-900 font-black">{currentQty} {primaryUnit}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Type Mode Selector Buttons */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Select Adjustment Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setAdjustmentType('ADD'); setQuantity('10'); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'ADD'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Plus size={14} /> Add Stock
              </button>

              <button
                type="button"
                onClick={() => { setAdjustmentType('REMOVE'); setQuantity('5'); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'REMOVE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Minus size={14} /> Reduce
              </button>

              <button
                type="button"
                onClick={() => { setAdjustmentType('RECONCILE'); setQuantity(String(currentQty)); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'RECONCILE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Scale size={14} /> Physical Audit
              </button>

              <button
                type="button"
                onClick={() => { setAdjustmentType('DAMAGE'); setQuantity('1'); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'DAMAGE'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <AlertOctagon size={14} /> Damaged
              </button>

              <button
                type="button"
                onClick={() => { setAdjustmentType('LOST'); setQuantity('1'); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentType === 'LOST'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert size={14} /> Lost / Stolen
              </button>
            </div>
          </div>

          {/* Multi-Unit Selector & Quantity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {adjustmentType === 'RECONCILE'
                  ? 'Actual Physical Count'
                  : adjustmentType === 'DAMAGE'
                  ? 'Damaged Quantity'
                  : adjustmentType === 'LOST'
                  ? 'Lost Quantity'
                  : 'Quantity'}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none cursor-pointer"
              >
                <option value={primaryUnit}>{primaryUnit}</option>
                {hasSecondary && <option value={secondaryUnit}>{secondaryUnit}</option>}
              </select>
            </div>
          </div>

          {hasSecondary && (
            <p className="text-[11px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
              Unit Conversion: 1 {secondaryUnit} = {conversionFactor} {primaryUnit}
            </p>
          )}

          {adjustmentType === 'RECONCILE' && (
            <p className="text-[11px] text-indigo-600 font-bold">
              System count is {currentQty} {primaryUnit}. Physical difference will be auto-calculated upon confirmation.
            </p>
          )}

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Audit Notes / Reason (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                adjustmentType === 'RECONCILE'
                  ? 'e.g. Monthly Physical Stocktake Audit'
                  : adjustmentType === 'DAMAGE'
                  ? 'e.g. Broken in transit / Expired discard'
                  : adjustmentType === 'LOST'
                  ? 'e.g. Discrepancy during stock count'
                  : 'e.g. Restock shipment, Manual adjustment'
              }
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Confirm Adjustment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
