import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

const SalesPaymentDetailsCard = ({
  billType,
  paymentMode,
  onPaymentModeChange,
  amountReceived,
  onAmountReceivedChange,
  grandTotal,
  balanceDue,
  onSaveDraft,
  onGenerateBill,
}) => {
  const isB2B = billType === 'B2B';
  const modesList = isB2B
    ? ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CREDIT']
    : ['CASH', 'UPI', 'CARD', 'OTHER'];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <CreditCard className="text-indigo-600" size={18} />
          <span>Payment Mode & Amount</span>
        </div>

        {/* Payment Mode Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {modesList.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onPaymentModeChange(mode)}
              className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-center ${
                paymentMode === mode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Quick Payment Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onAmountReceivedChange(String(grandTotal))}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-lg border border-emerald-200 transition-colors"
          >
            Full Payment (₹{grandTotal})
          </button>
          <button
            type="button"
            onClick={() => onAmountReceivedChange(String(Math.round(grandTotal / 2)))}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-lg border border-amber-200 transition-colors"
          >
            50% Partial (₹{Math.round(grandTotal / 2)})
          </button>
          <button
            type="button"
            onClick={() => onAmountReceivedChange('0')}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-lg border border-rose-200 transition-colors"
          >
            Unpaid / Credit (₹0)
          </button>
        </div>

        {/* Received vs Balance Amount inputs */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount Received (₹)
            </label>
            <input
              type="number"
              min="0"
              max={grandTotal}
              value={amountReceived}
              onChange={(e) => onAmountReceivedChange(e.target.value)}
              placeholder={`₹${grandTotal}`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
            />
            {Number(amountReceived) > grandTotal && (
              <p className="text-[10px] font-bold text-rose-500 mt-1">
                Warning: Paid amount exceeds Grand Total!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isB2B ? 'Due Amount (₹)' : 'Balance (₹)'}
            </label>
            <div
              className={`px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black ${
                balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              ₹{balanceDue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
        >
          Save Draft
        </button>

        <button
          type="button"
          onClick={onGenerateBill}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <CheckCircle2 size={16} />
          <span>{isB2B ? 'Generate Invoice' : 'Generate Bill'}</span>
        </button>
      </div>
    </div>
  );
};

export default SalesPaymentDetailsCard;
