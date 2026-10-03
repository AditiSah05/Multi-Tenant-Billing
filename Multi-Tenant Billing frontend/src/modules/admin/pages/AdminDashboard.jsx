import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  CreditCard,
  DollarSign,
  LifeBuoy,
  ShieldCheck,
  Eye,
  Ban,
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  useAdminDashboardQuery,
  useTenantsQuery,
  useToggleTenantStatusMutation
} from '../hooks/useAdminQueries';
import KpiCard from '../../../components/common/KpiCard';
import StatusBadge from '../../../components/common/StatusBadge';
import IconButton from '../../../components/common/IconButton';
import LineChartCard from '../../../components/common/LineChartCard';
import DonutChartCard from '../../../components/common/DonutChartCard';

const platformRevenueData = [
  { month: 'Jan', mrr: 120000 },
  { month: 'Feb', mrr: 145000 },
  { month: 'Mar', mrr: 165000 },
  { month: 'Apr', mrr: 190000 },
  { month: 'May', mrr: 215000 },
  { month: 'Jun', mrr: 230000 },
  { month: 'Jul', mrr: 245600 },
];

const planDistributionData = [
  { name: 'Enterprise', value: 120000, color: '#4f46e5', percent: '48%' },
  { name: 'Pro Plan', value: 85000, color: '#0284c7', percent: '35%' },
  { name: 'Starter', value: 25600, color: '#ea580c', percent: '10%' },
  { name: 'Free Trial', value: 15000, color: '#16a34a', percent: '7%' },
];

const supportTickets = [
  { id: 'TCK-501', tenant: 'Apex Distributors', issue: 'PDF Invoice Barcode Customization', priority: 'High', status: 'Open' },
  { id: 'TCK-502', tenant: 'Metro Fashion Hub', issue: 'Subscription Plan Upgrade Failure', priority: 'Medium', status: 'Pending' },
  { id: 'TCK-503', tenant: 'SuperMart Retail', issue: 'Bulk Excel Inventory Import Query', priority: 'Low', status: 'Open' },
];

const AdminDashboard = () => {
  // TanStack Queries & Mutations
  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboardQuery();
  const { data: tenantsList, isLoading: isTenantsLoading } = useTenantsQuery();
  const toggleStatusMutation = useToggleTenantStatusMutation();

  const tenantsArray = Array.isArray(tenantsList)
    ? tenantsList
    : Array.isArray(tenantsList?.tenants)
    ? tenantsList.tenants
    : Array.isArray(tenantsList?.items)
    ? tenantsList.items
    : Array.isArray(tenantsList?.data)
    ? tenantsList.data
    : [];

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Title Header */}
      <div>
        <div className="text-sm text-slate-500 font-medium">Welcome back,</div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
          Super Admin 👋
        </h1>
        <div className="text-sm text-slate-400">Here's what's happening across all vendor stores today.</div>
      </div>

      {/* Reusable 5 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KpiCard
          icon={Users}
          label="Total Tenants"
          value={isDashboardLoading ? '...' : `${dashboardData?.totalTenants || 48} Stores`}
          change="12.5%"
          subtext="vs last month"
          color="purple"
        />
        <KpiCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={isDashboardLoading ? '...' : `${dashboardData?.activeSubscriptions || 42} Active`}
          change="8.4%"
          subtext="renewal rate"
          color="blue"
        />
        <KpiCard
          icon={DollarSign}
          label="Platform MRR"
          value={isDashboardLoading ? '...' : `₹${(dashboardData?.mrr || 245600).toLocaleString()}`}
          change="18.2%"
          subtext="vs last month"
          color="green"
        />
        <KpiCard
          icon={LifeBuoy}
          label="Pending Tickets"
          value={isDashboardLoading ? '...' : `${dashboardData?.pendingTickets || 5} Tickets`}
          change="2"
          trend="down"
          subtext="resolved today"
          color="orange"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Server Uptime"
          value={dashboardData?.serverUptime || '99.98%'}
          change="All Systems OK"
          color="pink"
        />
      </div>

      {/* Reusable Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChartCard
            title="Platform Revenue Growth (MRR)"
            subtitleValue="₹2,45,600"
            subtitleBadgeText="18.2%"
            subtitleSubtext="vs last month"
            dropdownLabel="Year 2025"
            data={platformRevenueData}
            xKey="month"
            yKey="mrr"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutChartCard
            title="Plan Revenue Breakdown"
            dropdownLabel="All Plans"
            data={planDistributionData}
            summaryTitle="Total Net Platform Revenue"
            summaryValue="₹2,45,600"
            summaryBadge="18.2%"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registered Vendor Stores Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Registered Vendor Stores {isTenantsLoading && <Loader2 size={16} className="animate-spin text-indigo-600" />}
            </h3>
            <NavLink to="/admin/tenants" className="text-xs text-indigo-600 font-bold hover:text-indigo-700">
              View All Vendors
            </NavLink>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Store ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Business</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner / Email</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantsArray.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">{t.id}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{t.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-slate-800">{t.owner}</div>
                      <div className="text-xs text-slate-400">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={t.plan} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-sm flex items-center gap-1">
                      <IconButton icon={Eye} title="View Details" />
                      <IconButton
                        icon={t.status === 'ACTIVE' ? Ban : CheckCircle}
                        color={t.status === 'ACTIVE' ? '#dc2626' : '#16a34a'}
                        title={t.status === 'ACTIVE' ? 'Suspend Store' : 'Activate Store'}
                        onClick={() => handleToggleStatus(t.id, t.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Support Tickets Alert */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Vendor Support Tickets</h3>
            <NavLink to="/admin/support" className="text-xs text-indigo-600 font-bold hover:text-indigo-700">
              View Helpdesk
            </NavLink>
          </div>

          <div className="flex flex-col gap-3.5">
            {supportTickets.map((tck) => (
              <div key={tck.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{tck.id}</span>
                    <span className="text-xs text-slate-400">• {tck.tenant}</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5 font-medium">{tck.issue}</div>
                </div>

                <div className="text-right">
                  <StatusBadge status={tck.priority} />
                  <div className="text-xs text-slate-400 mt-1">{tck.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
