import React, { useState } from 'react';
import { Download } from 'lucide-react';
import TenantStatCards from '../components/TenantStatCards';
import TenantFiltersBar from '../components/TenantFiltersBar';
import TenantTable from '../components/TenantTable';
import { useTenantsQuery } from '../../hooks/useAdminQueries';

const TenantsPage = () => {
  const [activeTabFilter, setActiveTabFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('All Packages');
  const [selectedTenantStatus, setSelectedTenantStatus] = useState('All Tenant Status');
  const [selectedAccountStatus, setSelectedAccountStatus] = useState('All Account Status');

  const { data: rawTenants = [] } = useTenantsQuery();
  const tenantsList = Array.isArray(rawTenants) ? rawTenants : [];

  const filteredTenants = tenantsList.filter((t) => {
    const bName = t.businessName || t.name || '';
    const oName = t.ownerName || t.owner || '';
    const emailStr = t.email || '';
    const pkg = t.currentPackage || t.plan || 'Free Trial';
    const tStatus = t.tenantStatus || t.subscriptionStatus || 'Active';
    const aStatus = t.accountStatus || t.status || 'Active';

    const matchesTab =
      activeTabFilter === 'All' ||
      tStatus.toLowerCase() === activeTabFilter.toLowerCase();

    const matchesSearch =
      bName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPackage = selectedPackage === 'All Packages' || pkg === selectedPackage;
    const matchesTenantStatus = selectedTenantStatus === 'All Tenant Status' || tStatus === selectedTenantStatus;
    const matchesAccountStatus = selectedAccountStatus === 'All Account Status' || aStatus === selectedAccountStatus;

    return matchesTab && matchesSearch && matchesPackage && matchesTenantStatus && matchesAccountStatus;
  });

  const handleResetFilters = () => {
    setActiveTabFilter('All');
    setSearchQuery('');
    setSelectedPackage('All Packages');
    setSelectedTenantStatus('All Tenant Status');
    setSelectedAccountStatus('All Account Status');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tenant Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage all registered tenants and their subscription & account status.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Status Tabs (All, Free Trial, Free Trial Ended, Upgraded, Plan Expired) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs font-bold">
        {['All', 'Free Trial', 'Free Trial Ended', 'Upgraded', 'Plan Expired'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTabFilter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 5 Stat Cards */}
      <TenantStatCards />

      {/* Filters Bar */}
      <TenantFiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPackage={selectedPackage}
        setSelectedPackage={setSelectedPackage}
        selectedTenantStatus={selectedTenantStatus}
        setSelectedTenantStatus={setSelectedTenantStatus}
        selectedAccountStatus={selectedAccountStatus}
        setSelectedAccountStatus={setSelectedAccountStatus}
        onReset={handleResetFilters}
      />

      {/* Main Data Table */}
      <TenantTable tenants={filteredTenants} />
    </div>
  );
};

export default TenantsPage;
