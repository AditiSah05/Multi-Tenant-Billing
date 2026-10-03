import React from 'react';

const ReturnRefundAdjustmentCard = ({
  refundType,
  onRefundTypeChange,
  refundAmount,
  onRefundAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  bankAccount,
  onBankAccountChange,
  totalReturnAmount = 0,
}) => {
  const isAdjustInNextPurchase = refundType === 'Adjust in Next Purchase';
  const totalVal = Number(totalReturnAmount || 0);
  const cashAmt = Number(refundAmount || 0);
  const remainingAdjustment = Math.max(0, totalVal - cashAmt);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
          4
        </div>
        <h2 className="text-base font-black text-slate-900">Refund / Adjustment</h2>
      </div>

      <div className="space-y-3 text-xs font-bold text-slate-700">
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold">
            Refund Type <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="refType"
                checked={refundType === 'Cash Refund'}
                onChange={() => onRefundTypeChange('Cash Refund')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Cash Refund</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="refType"
                checked={isAdjustInNextPurchase}
                onChange={() => onRefundTypeChange('Adjust in Next Purchase')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Adjust in Next Purchase</span>
            </label>
          </div>
        </div>

        {isAdjustInNextPurchase ? (
          <div className="space-y-3">
            <div>
              <label className="block mb-1 uppercase text-[11px]">
                Adjustment Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => onRefundAmountChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900"
              />
            </div>
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium flex items-start gap-2">
              <span className="font-bold text-amber-900">Note:</span>
              <span>
                ₹{Number(refundAmount || 0).toLocaleString()} will be credited to supplier account (Debit Note). It will automatically reduce supplier outstanding due and adjust against future purchase bills.
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 uppercase text-[11px]">
                  Cash Received Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => onRefundAmountChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1 uppercase text-[11px]">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => onPaymentMethodChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer text-slate-900"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            {paymentMethod === 'Bank Transfer' && (
              <div>
                <label className="block mb-1 uppercase text-[11px]">Bank Account</label>
                <select
                  value={bankAccount}
                  onChange={(e) => onBankAccountChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer text-slate-900"
                >
                  <option value="HDFC Bank - 502000xxxx1234">HDFC Bank - 502000xxxx1234</option>
                </select>
              </div>
            )}

            {/* Split Refund & Adjustment Summary Pill */}
            {totalVal > 0 && (
              <div className="p-3 bg-indigo-50/80 border border-indigo-200/90 rounded-2xl space-y-1.5 text-xs mt-2">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Total Return Value:</span>
                  <span className="font-extrabold text-slate-900">₹{totalVal.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span>💵 Cash Refund Received:</span>
                  <span className="font-extrabold">₹{cashAmt.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between items-center text-amber-700 font-extrabold pt-1 border-t border-indigo-200/60">
                  <span>🏷️ Adjust in Next Purchase (Credit Note):</span>
                  <span>₹{remainingAdjustment.toLocaleString('en-IN')}.00</span>
                </div>
                {remainingAdjustment > 0 && (
                  <p className="text-[11px] text-slate-600 font-medium pt-1">
                    ℹ️ <strong>₹{cashAmt.toLocaleString('en-IN')}</strong> cash received right now. Remaining <strong>₹{remainingAdjustment.toLocaleString('en-IN')}</strong> will be credited to supplier account as Debit Note to adjust in your next purchase bill!
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReturnRefundAdjustmentCard;
