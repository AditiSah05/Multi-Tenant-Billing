import React from 'react';
import { Info } from 'lucide-react';

const PurchaseBillSummaryCard = ({
  subTotal,
  totalDiscount,
  taxableAmount,
  cgst,
  sgst,
  igst,
  otherCharges,
  onOtherChargesChange,
  roundOff,
  grandTotal,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
          4
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-900">Bill Summary</h2>
      </div>

      <div className="space-y-3 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span>Sub Total</span>
          <span className="font-bold text-slate-900">₹{Math.round(subTotal).toLocaleString('en-IN')}.00</span>
        </div>

        <div className="flex items-center justify-between text-rose-600">
          <span>Discount</span>
          <span className="font-bold">- ₹{Math.round(totalDiscount).toLocaleString('en-IN')}.00</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Taxable Amount</span>
          <span className="font-bold text-slate-900">₹{Math.round(taxableAmount).toLocaleString('en-IN')}.00</span>
        </div>

        <div className="flex items-center justify-between">
          <span>CGST (₹)</span>
          <span className="font-bold text-slate-900">₹{Math.round(cgst).toLocaleString('en-IN')}.00</span>
        </div>

        <div className="flex items-center justify-between">
          <span>SGST (₹)</span>
          <span className="font-bold text-slate-900">₹{Math.round(sgst).toLocaleString('en-IN')}.00</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>IGST (₹)</span>
          <span>₹0.00</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            Other Charges (+) <Info size={13} className="text-slate-400 cursor-pointer" />
          </span>
          <input
            type="number"
            value={otherCharges}
            onChange={(e) => onOtherChargesChange(parseFloat(e.target.value) || 0)}
            className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Round Off</span>
          <span className="font-bold text-slate-900">{roundOff}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
          <span>Grand Total</span>
          <span className="text-base font-black">₹{grandTotal.toLocaleString('en-IN')}.00</span>
        </div>
      </div>

      {/* Highlight Total Payable Banner */}
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
        <span className="text-xs font-black text-indigo-900 uppercase">Total Payable</span>
        <span className="text-xl font-black text-indigo-700">₹{grandTotal.toLocaleString('en-IN')}.00</span>
      </div>
    </div>
  );
};

export default PurchaseBillSummaryCard;
