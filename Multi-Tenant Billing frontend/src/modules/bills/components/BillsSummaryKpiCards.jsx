import React from 'react';
import { FileText, Wallet, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const BillsSummaryKpiCards = ({
  totalBills = 0,
  totalSalesAmount = 0,
  paidAmount = 0,
  dueAmount = 0,
  draftCount = 0,
  onSelectFilter,
}) => {
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* KPI 1: Total Invoices */}
      <div
        onClick={() => onSelectFilter && onSelectFilter('ALL')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
          <FileText size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Total Invoices
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {Number(totalBills || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-purple-600 font-extrabold group-hover:underline mt-0.5">
            View all
          </div>
        </div>
      </div>

      {/* KPI 2: Total Sales */}
      <div
        onClick={() => onSelectFilter && onSelectFilter('ALL')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
          <Wallet size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Total Sales
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
            {formatCurrency(totalSalesAmount)}
          </div>
          <div className="text-[11px] text-blue-600 font-extrabold group-hover:underline mt-0.5">
            View total
          </div>
        </div>
      </div>

      {/* KPI 3: Paid Amount */}
      <div
        onClick={() => onSelectFilter && onSelectFilter('PAID')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
          <CheckCircle size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Collected / Paid
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 tracking-tight mt-0.5 truncate">
            {formatCurrency(paidAmount)}
          </div>
          <div className="text-[11px] text-emerald-600 font-extrabold group-hover:underline mt-0.5">
            View paid
          </div>
        </div>
      </div>

      {/* KPI 4: Pending Receivables */}
      <div
        onClick={() => onSelectFilter && onSelectFilter('UNPAID')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
          <Clock size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Pending Dues
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
            {formatCurrency(dueAmount)}
          </div>
          <div className="text-[11px] text-amber-600 font-extrabold group-hover:underline mt-0.5">
            View unpaid
          </div>
        </div>
      </div>

      {/* KPI 5: Draft / Pending Bills */}
      <div
        onClick={() => onSelectFilter && onSelectFilter('DRAFT')}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
          <AlertCircle size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Draft Bills
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {Number(draftCount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-600 font-extrabold group-hover:underline mt-0.5">
            View drafts
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsSummaryKpiCards;
