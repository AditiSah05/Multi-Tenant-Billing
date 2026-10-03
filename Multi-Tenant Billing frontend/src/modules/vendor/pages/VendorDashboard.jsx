import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  ShoppingCart,
  Wallet,
  CreditCard,
  TrendingUp,
  Eye,
  Printer,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  useVendorDashboardQuery,
  useRecentInvoicesQuery
} from '../hooks/useVendorQueries';
import KpiCard from '../../../components/common/KpiCard';
import StatusBadge from '../../../components/common/StatusBadge';
import IconButton from '../../../components/common/IconButton';
import LineChartCard from '../../../components/common/LineChartCard';
import DonutChartCard from '../../../components/common/DonutChartCard';

const salesData = [
  { name: '19 May', sales: 0 },
  { name: '20 May', sales: 18000 },
  { name: '21 May', sales: 14000 },
  { name: '22 May', sales: 29000 },
  { name: '23 May', sales: 17500 },
  { name: '24 May', sales: 27000 },
  { name: '25 May', sales: 19500 },
  { name: '26 May', sales: 34000 },
  { name: '27 May', sales: 37000 },
];

const pieData = [
  { name: 'Sales', value: 124560, color: '#4f46e5', percent: '45%' },
  { name: 'Purchases', value: 86230, color: '#0284c7', percent: '31%' },
  { name: 'Expenses', value: 24360, color: '#ea580c', percent: '9%' },
  { name: 'Income', value: 110340, color: '#16a34a', percent: '15%' },
];

const lowStockItems = [
  { id: 1, name: 'HP LaserJet 1020', sku: 'PRD-1020', stock: 3, icon: '🖨️' },
  { id: 2, name: 'A4 Paper 500 Sheet', sku: 'PRD-2001', stock: 12, icon: '📄' },
  { id: 3, name: 'HP Ink Cartridge 803', sku: 'PRD-3003', stock: 5, icon: '🖨️' },
  { id: 4, name: 'USB Pen Drive 32GB', sku: 'PRD-4005', stock: 7, icon: '💾' },
];

const VendorDashboard = () => {
  const { user } = useAuth();
  // TanStack Queries
  const { data: dashboardData, isLoading: isDashboardLoading } = useVendorDashboardQuery();
  const { data: rawInvoices, isLoading: isInvoicesLoading } = useRecentInvoicesQuery();

  const storeName = user?.tenant?.businessName || user?.name || 'Apex Retail Store';

  const safeInvoices = Array.isArray(rawInvoices)
    ? rawInvoices
    : (Array.isArray(rawInvoices?.bills)
      ? rawInvoices.bills
      : (Array.isArray(rawInvoices?.data) ? rawInvoices.data : []));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <div className="text-sm text-slate-500 font-medium">Welcome back,</div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
          {storeName} 👋
        </h1>
        <div className="text-sm text-slate-400">Here's what's happening with your business today.</div>
      </div>

      {/* Reusable 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KpiCard
          icon={FileText}
          label="Today's Sales"
          value={isDashboardLoading ? '...' : (dashboardData?.kpis?.todaySales !== undefined ? `₹${dashboardData.kpis.todaySales.toLocaleString()}` : (dashboardData?.totalSales || '₹0'))}
          change="18.5%"
          subtext="vs last 7 days"
          color="purple"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Total Bills"
          value={isDashboardLoading ? '...' : (dashboardData?.kpis?.totalBills !== undefined ? dashboardData.kpis.totalBills : (dashboardData?.totalBills || '0'))}
          change="6.4%"
          trend="up"
          subtext="total generated"
          color="blue"
        />
        <KpiCard
          icon={Wallet}
          label="Total Products"
          value={isDashboardLoading ? '...' : (dashboardData?.kpis?.totalProducts !== undefined ? dashboardData.kpis.totalProducts : (dashboardData?.totalProducts || '0'))}
          change="12.7%"
          subtext="in catalog"
          color="green"
        />
        <KpiCard
          icon={CreditCard}
          label="Low Stock Items"
          value={isDashboardLoading ? '...' : (dashboardData?.kpis?.lowStockProducts !== undefined ? dashboardData.kpis.lowStockProducts : (dashboardData?.lowStockProducts || '0'))}
          change="3.1%"
          trend="down"
          subtext="needs restock"
          color="orange"
        />
        <KpiCard
          icon={TrendingUp}
          label="Pending Dues"
          value={isDashboardLoading ? '...' : (dashboardData?.kpis?.pendingDueAmount !== undefined ? `₹${dashboardData.kpis.pendingDueAmount.toLocaleString()}` : (dashboardData?.totalProfit || '₹0'))}
          change="16.3%"
          subtext="uncollected"
          color="pink"
        />
      </div>

      {/* Reusable Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChartCard
            title="Sales Overview"
            subtitleValue="₹1,24,560"
            subtitleBadgeText="18.5%"
            subtitleSubtext="vs last 7 days"
            dropdownLabel="Last 7 Days"
            data={salesData}
            xKey="name"
            yKey="sales"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutChartCard
            title="Business Summary"
            dropdownLabel="This Month"
            data={pieData}
            summaryTitle="Net Profit"
            summaryValue="₹85,980"
            summaryBadge="16.3%"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Recent Invoices {isInvoicesLoading && <Loader2 size={16} className="animate-spin text-indigo-600" />}
            </h3>
            <NavLink to="/vendor/invoices" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All
            </NavLink>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice No.</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">{inv.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {typeof inv.customer === 'object' && inv.customer !== null
                        ? (inv.customer.name || inv.customer.businessName || inv.customer.contactPerson || 'Cash Customer')
                        : (inv.customer || inv.customerName || inv.businessName || 'Cash Customer')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{inv.date}</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-slate-900">{inv.amount}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-sm flex items-center gap-1">
                      <IconButton icon={Eye} title="View Invoice" />
                      <IconButton icon={Printer} title="Print Invoice" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Low Stock Alert</h3>
            <NavLink to="/vendor/inventory" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All
            </NavLink>
          </div>

          <div className="flex flex-col gap-3.5">
            {lowStockItems.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400">SKU: {item.sku}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">Stock: {item.stock}</div>
                  <StatusBadge status="Low Stock" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
