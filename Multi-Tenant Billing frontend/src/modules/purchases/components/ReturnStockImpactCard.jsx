import React from 'react';
import { ShieldCheck } from 'lucide-react';

const ReturnStockImpactCard = ({
  itemsReturning = 5,
  stockToBeDeducted = 5,
  estimatedAdjustment = '- 5 Units',
}) => {
  return (
    <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-200/80 space-y-3">
      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
        <ShieldCheck size={18} className="text-emerald-600" />
        <span>Stock Impact (After Return)</span>
      </div>

      <div className="space-y-2 text-xs font-semibold text-slate-700 bg-white p-3.5 rounded-2xl border border-emerald-100">
        <div className="flex items-center justify-between">
          <span>Items Returning</span>
          <span className="font-bold text-slate-900">{itemsReturning}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Stock To Be Deducted</span>
          <span className="font-bold text-slate-900">{stockToBeDeducted}</span>
        </div>

        <div className="flex items-center justify-between text-rose-600 font-extrabold pt-2 border-t border-slate-100">
          <span>Estimated Stock Adjustment</span>
          <span>{estimatedAdjustment}</span>
        </div>
      </div>

      <p className="text-[11px] font-semibold text-emerald-800 leading-relaxed pt-1">
        After confirming return, stock will be reduced and supplier outstanding will be adjusted automatically.
      </p>
    </div>
  );
};

export default ReturnStockImpactCard;
