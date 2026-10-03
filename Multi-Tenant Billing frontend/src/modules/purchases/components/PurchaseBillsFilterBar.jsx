import React from 'react';
import { Search, Filter } from 'lucide-react';

const PurchaseBillsFilterBar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  suppliers = [],
  activeTab,
  onTabChange,
  onResetFilters,
  totalBillsCount,
  paidCount,
  partialCount,
  unpaidCount,
  overdueCount,
  cancelledCount,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bill no., supplier, invoice no..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Payment Status Dropdown */}
        <select
          value={paymentStatusFilter}
          onChange={(e) => onPaymentStatusFilterChange(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Payment Status</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Unpaid</option>
        </select>

        {/* Supplier Dropdown */}
        <select
          value={supplierFilter}
          onChange={(e) => onSupplierFilterChange(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Suppliers</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>

        {/* Reset Filters */}
        <button
          onClick={onResetFilters}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-indigo-600 transition-colors cursor-pointer"
        >
          <Filter size={15} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Quick Status Tabs Row */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Bills', count: totalBillsCount },
          { id: 'PAID', label: 'Paid', count: paidCount },
          { id: 'PARTIAL', label: 'Partial', count: partialCount },
          { id: 'UNPAID', label: 'Unpaid', count: unpaidCount },
          { id: 'OVERDUE', label: 'Overdue', count: overdueCount },
          { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PurchaseBillsFilterBar;
