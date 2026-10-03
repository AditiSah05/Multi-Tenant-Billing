import React from 'react';

const SalesBillSummaryCard = ({
  billType,
  rawSubtotal,
  rawTotalDiscount,
  rawTaxableAmount,
  rawTotalGst,
  grandTotal,
}) => {
  const isB2B = billType === 'B2B';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
      <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-2.5">
        <span>{isB2B ? 'GST Summary Breakdown' : 'Bill Summary'}</span>
        <span className="text-xs font-extrabold text-indigo-600">{billType} MODE</span>
      </div>

      {isB2B ? (
        <div className="space-y-2 text-xs font-semibold text-slate-700">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Taxable Amount</span>
            <span className="font-bold text-slate-900">₹{Math.round(rawTaxableAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>CGST 2.5%</span>
            <span className="font-bold text-slate-800">₹{Math.round(rawTotalGst / 2).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>SGST 2.5%</span>
            <span className="font-bold text-slate-800">₹{Math.round(rawTotalGst / 2).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-900 font-extrabold">
            <span>Total GST</span>
            <span className="text-indigo-600">₹{Math.round(rawTotalGst).toLocaleString('en-IN')}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs font-semibold text-slate-700">
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">₹{Math.round(rawSubtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1 text-emerald-600">
            <span>Discount</span>
            <span className="font-bold">-₹{Math.round(rawTotalDiscount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-slate-100">
            <span>Taxable Amount</span>
            <span className="font-bold text-slate-900">₹{Math.round(rawTaxableAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Tax (GST)</span>
            <span className="font-bold text-indigo-600">₹{Math.round(rawTotalGst).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <div className="pt-2 flex items-center justify-between text-base font-black text-slate-900 border-t border-slate-200">
        <span>Grand Total</span>
        <span className="text-xl text-indigo-600 font-mono">₹{grandTotal.toLocaleString('en-IN')}.00</span>
      </div>
    </div>
  );
};

export default SalesBillSummaryCard;
