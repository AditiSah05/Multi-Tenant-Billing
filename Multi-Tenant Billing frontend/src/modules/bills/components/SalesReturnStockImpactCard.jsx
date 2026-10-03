import React from 'react';
import { PackageCheck, ArrowUpRight } from 'lucide-react';

const SalesReturnStockImpactCard = ({
  itemsReturning = 0,
  stockToBeRestocked = 0,
  estimatedAdjustment = '+ 0 Units',
}) => {
  return (
    <div className="bg-indigo-50/70 rounded-3xl p-5 border border-indigo-200/80 space-y-3 font-sans">
      <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
        <PackageCheck size={18} className="text-indigo-600" />
        <span>Inventory Restock Impact</span>
      </div>

      <div className="space-y-2 text-xs font-semibold text-slate-700 bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <span>Items Returning</span>
          <span className="font-extrabold text-slate-900">{itemsReturning} Items</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Inventory Units to Restock</span>
          <span className="font-extrabold text-slate-900">{stockToBeRestocked} Pcs</span>
        </div>

        <div className="flex items-center justify-between text-emerald-600 font-black pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <ArrowUpRight size={14} /> Estimated Stock Increase
          </span>
          <span>{estimatedAdjustment}</span>
        </div>
      </div>

      <p className="text-[11px] font-semibold text-indigo-800 leading-relaxed pt-1">
        Upon confirming return or cancellation, returned items will be automatically restocked into product inventory stock.
      </p>
    </div>
  );
};

export default SalesReturnStockImpactCard;
