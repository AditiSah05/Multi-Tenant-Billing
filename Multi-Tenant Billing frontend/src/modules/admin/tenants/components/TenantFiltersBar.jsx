import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const TenantFiltersBar = ({
  searchQuery,
  setSearchQuery,
  selectedPackage,
  setSelectedPackage,
  selectedTenantStatus,
  setSelectedTenantStatus,
  selectedAccountStatus,
  setSelectedAccountStatus,
  onReset
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-2.5 sm:gap-3">
      {/* Search */}
      <div className="relative col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 lg:flex-1 lg:min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
          placeholder="Search by business name, owner or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Dropdown 1: Packages */}
      <select
        className="w-full lg:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600 cursor-pointer"
        value={selectedPackage}
        onChange={(e) => setSelectedPackage(e.target.value)}
      >
        <option value="All Packages">All Packages</option>
        <option value="Professional">Professional</option>
        <option value="Basic">Basic</option>
        <option value="Enterprise">Enterprise</option>
        <option value="Free Trial">Free Trial</option>
      </select>

      {/* Filter Dropdown 2: Tenant Status */}
      <select
        className="w-full lg:w-44 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600 cursor-pointer"
        value={selectedTenantStatus}
        onChange={(e) => setSelectedTenantStatus(e.target.value)}
      >
        <option value="All Tenant Status">All Tenant Status</option>
        <option value="Active">Active</option>
        <option value="Free Trial">Free Trial</option>
        <option value="Upgraded">Upgraded</option>
        <option value="Free Trial Ended">Free Trial Ended</option>
      </select>

      {/* Filter Dropdown 3: Account Status */}
      <select
        className="w-full lg:w-44 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600 cursor-pointer"
        value={selectedAccountStatus}
        onChange={(e) => setSelectedAccountStatus(e.target.value)}
      >
        <option value="All Account Status">All Account Status</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
      </select>

      {/* Filter Dropdown 4: Date Range */}
      <select className="w-full lg:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-600 cursor-pointer">
        <option value="Date Range">Date Range</option>
        <option value="Last 7 Days">Last 7 Days</option>
        <option value="Last 30 Days">Last 30 Days</option>
        <option value="This Year">This Year</option>
      </select>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full lg:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1"
      >
        <RotateCcw size={14} /> Reset
      </button>
    </div>
  );
};

export default TenantFiltersBar;
