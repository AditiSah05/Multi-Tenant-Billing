import React from 'react';
import { CreditCard, Wallet, Banknote } from 'lucide-react';

const SalesReturnRefundCard = ({
  refundType,
  onRefundTypeChange,
  refundAmount,
  onRefundAmountChange,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 font-sans">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
          <CreditCard size={14} />
        </div>
        <h2 className="text-base font-black text-slate-900">Customer Refund / Credit Adjustment</h2>
      </div>

      <div className="space-y-3.5 text-xs font-bold text-slate-700">
        <div>
          <label className="block mb-1.5 uppercase text-[11px] font-extrabold text-slate-500">
            Refund Mode <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                refundType === 'Cash Refund'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-extrabold shadow-2xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="salesRefundType"
                checked={refundType === 'Cash Refund'}
                onChange={() => onRefundTypeChange('Cash Refund')}
                className="accent-indigo-600"
              />
              <Banknote size={15} className="text-emerald-600" />
              <span>Cash / Direct Refund</span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                refundType === 'Customer Credit Ledger'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-extrabold shadow-2xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="salesRefundType"
                checked={refundType === 'Customer Credit Ledger'}
                onChange={() => onRefundTypeChange('Customer Credit Ledger')}
                className="accent-indigo-600"
              />
              <Wallet size={15} className="text-indigo-600" />
              <span>Adjust Customer Ledger</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-500">
              Refund Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={refundAmount}
              onChange={(e) => onRefundAmountChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-500">Payment Channel</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none cursor-pointer"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / Digital Wallet</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Store Credit">Store Credit / Coupon</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReturnRefundCard;
