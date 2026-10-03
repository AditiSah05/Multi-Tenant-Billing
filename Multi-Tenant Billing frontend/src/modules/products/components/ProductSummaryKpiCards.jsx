import React from 'react';
import { Package, AlertTriangle, XCircle, DollarSign, ChevronRight } from 'lucide-react';

const ProductSummaryKpiCards = ({
  totalProducts = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
  totalStockValue = 0,
  currentStatusFilter = 'ALL',
  onFilterAll,
  onFilterLowStock,
  onFilterOutOfStock,
  onFilterStockValue,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* KPI 1: Total Products */}
      <div
        onClick={() => onFilterAll && onFilterAll()}
        className={`bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
          currentStatusFilter === 'ALL'
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200/90 hover:border-indigo-300'
        }`}
      >
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Products</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{totalProducts}</div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 group-hover:underline mt-1">
            <span>View all items</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Package size={22} />
        </div>
      </div>

      {/* KPI 2: Low Stock Items */}
      <div
        onClick={() => onFilterLowStock && onFilterLowStock()}
        className={`bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
          currentStatusFilter === 'LOW_STOCK'
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : 'border-slate-200/90 hover:border-amber-300'
        }`}
      >
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Low Stock Items</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{lowStockCount}</div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 group-hover:underline mt-1">
            <span>View low stock</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <AlertTriangle size={22} />
        </div>
      </div>

      {/* KPI 3: Out of Stock Items */}
      <div
        onClick={() => onFilterOutOfStock && onFilterOutOfStock()}
        className={`bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
          currentStatusFilter === 'OUT_OF_STOCK'
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : 'border-slate-200/90 hover:border-rose-300'
        }`}
      >
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Out of Stock Items</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{outOfStockCount}</div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 group-hover:underline mt-1">
            <span>View out of stock</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <XCircle size={22} />
        </div>
      </div>

      {/* KPI 4: Total Stock Value */}
      <div
        onClick={() => onFilterStockValue && onFilterStockValue()}
        className={`bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between transition-all cursor-pointer group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
          currentStatusFilter === 'ALL'
            ? 'border-slate-200/90 hover:border-emerald-300'
            : 'border-slate-200/90 hover:border-emerald-300'
        }`}
      >
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Stock Value</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{Number(totalStockValue).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 group-hover:underline mt-1">
            <span>View stock value</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <DollarSign size={22} />
        </div>
      </div>
    </div>
  );
};

export default ProductSummaryKpiCards;
