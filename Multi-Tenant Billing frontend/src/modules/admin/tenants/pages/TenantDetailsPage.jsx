import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Crown,
  CreditCard,
  FileText,
  Calendar,
  ShieldCheck,
  Zap,
  Gift,
  RefreshCw,
  Clock,
  Download,
  Search,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  Activity,
  User,
  Filter
} from 'lucide-react';
import {
  AccountControlModal,
  ExtendSubscriptionModal,
  AssignUpgradePackageModal
} from '../components/TenantModals';

const mockPaymentHistory = [];
const mockSubscriptionHistory = [];
const mockActivityLogs = [];

const TenantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Overview');
  const [tenantStatusState, setTenantStatusState] = useState('Active');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState('All Activity');

  // Modal Visibility States
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showExtendSubModal, setShowExtendSubModal] = useState(false);
  const [showAssignPkgModal, setShowAssignPkgModal] = useState(false);

  const tenantObj = {
    id: id || 'TEN-000248',
    businessName: 'Sharma Traders',
    ownerName: 'Amit Sharma',
    email: 'amit@sharmatraders.in',
    mobile: '+91 98765 43210',
    accountStatus: tenantStatusState
  };

  const handleConfirmAccountStatus = (tenantId, newStatus) => {
    setTenantStatusState(newStatus);
  };

  const filteredLogs = mockActivityLogs.filter((log) => {
    return selectedActivityCategory === 'All Activity' || log.category === selectedActivityCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <button onClick={() => navigate('/admin/tenants')} className="hover:text-indigo-600 flex items-center gap-1 cursor-pointer">
              <ArrowLeft size={14} /> Tenant Management
            </button>
            <span>›</span>
            <span className="text-slate-600 font-bold">Sharma Traders</span>
            {activeTab !== 'Overview' && (
              <>
                <span>›</span>
                <span className="text-indigo-600 font-bold">{activeTab}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {activeTab === 'Payment History' ? 'Payment History' : activeTab === 'Subscription' ? 'Subscription Management' : activeTab === 'Tenant Activity' ? 'Tenant Activity Log' : activeTab === 'Employee Summary' ? 'Employee Summary' : 'Tenant Details'}
          </h1>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {activeTab === 'Overview' && (
            <>
              {/* Interactive Account Control Trigger */}
              <button
                onClick={() => setShowAccountModal(true)}
                className={`px-3.5 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                  tenantStatusState === 'Active' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                {tenantStatusState === 'Active' ? <ShieldAlert size={14} /> : <UserCheck size={14} />}
                {tenantStatusState === 'Active' ? 'Suspend Tenant' : 'Reactivate Tenant'}
              </button>

              {/* Manage Subscription Trigger */}
              <button
                onClick={() => setShowAssignPkgModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Zap size={14} /> Manage Subscription
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tenant Header Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black shrink-0">
            ST
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">Sharma Traders</h2>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${
                tenantStatusState === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                {tenantStatusState}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="break-all">📧 amit@sharmatraders.in</span>
              <span className="hidden sm:inline">•</span>
              <span>📞 +91 98765 43210</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Registered on 12 Apr 2025 • Tenant ID: TEN-000248
            </div>
          </div>
        </div>
      </div>

      {/* 5 Navigation Sub-Tabs (Screen 1 to Screen 5) */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
        {['Overview', 'Subscription', 'Payment History', 'Tenant Activity', 'Employee Summary'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SCREEN 2: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Business Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Business Information
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-slate-400">Business Name</div>
                  <div className="font-bold text-slate-900">Sharma Traders</div>
                </div>
                <div>
                  <div className="text-slate-400">Business Type</div>
                  <div className="font-semibold text-slate-800">Trading</div>
                </div>
                <div>
                  <div className="text-slate-400">Address</div>
                  <div className="font-medium text-slate-700 break-words">123, Exhibition Road, Patna, Bihar - 800001, India</div>
                </div>
                <div>
                  <div className="text-slate-400">GST Number</div>
                  <div className="font-bold text-slate-900 break-all">10ABCDE1234F1Z5</div>
                </div>
                <div>
                  <div className="text-slate-400">PAN Number</div>
                  <div className="font-bold text-slate-900 break-all">ABCDE1234F</div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Owner Information
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-slate-400">Owner Name</div>
                  <div className="font-bold text-slate-900">Amit Sharma</div>
                </div>
                <div>
                  <div className="text-slate-400">Email</div>
                  <div className="font-semibold text-slate-800 break-all">amit@sharmatraders.in</div>
                </div>
                <div>
                  <div className="text-slate-400">Mobile</div>
                  <div className="font-bold text-slate-900">+91 98765 43210</div>
                </div>
              </div>
            </div>

            {/* Current Subscription */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Crown size={14} className="text-indigo-600" /> Current Subscription
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-indigo-600">Professional</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">Yearly</span>
                </div>
                <div>
                  <div className="text-slate-400">Status</div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-slate-400">Start Date</div>
                    <div className="font-bold text-slate-900">12 Apr 2025</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Expiry Date</div>
                    <div className="font-bold text-slate-900">12 Apr 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status Control */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" /> Account Control
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    tenantStatusState === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {tenantStatusState}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Status: {tenantStatusState === 'Active' ? 'Full Access' : 'Access Restricted'}</p>
                </div>
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Change Account Status
                </button>
              </div>
            </div>
          </div>

          {/* Usage Summary & Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" /> Usage Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center">
                  <div className="text-xl font-black text-indigo-600">28</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">Total Employees</div>
                </div>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
                  <div className="text-xl font-black text-emerald-600">156</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">Total Invoices</div>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
                  <div className="text-xl font-black text-amber-600">342</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">Total Customers</div>
                </div>
                <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl text-center">
                  <div className="text-xl font-black text-sky-600">89</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">Total Products</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-indigo-600" /> Quick Action Modals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setShowAssignPkgModal(true)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                  <RefreshCw size={18} className="mx-auto text-indigo-600 mb-1" />
                  <div className="text-[11px] font-bold text-slate-700">Assign / Upgrade Package</div>
                </button>
                <button onClick={() => setShowExtendSubModal(true)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                  <Calendar size={18} className="mx-auto text-indigo-600 mb-1" />
                  <div className="text-[11px] font-bold text-slate-700">Extend Subscription</div>
                </button>
                <button onClick={() => setShowAccountModal(true)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                  <ShieldAlert size={18} className="mx-auto text-rose-600 mb-1" />
                  <div className="text-[11px] font-bold text-slate-700">Suspend Account</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: SUBSCRIPTION MANAGEMENT */}
      {activeTab === 'Subscription' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">Current Subscription</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Package Name</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg sm:text-xl font-black text-indigo-600">Professional</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">Yearly</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Status</div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold">
                  Active
                </span>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Start Date</div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">12 Apr 2025</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Expiry Date</div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">12 Apr 2026</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Manage Subscription Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setShowAssignPkgModal(true)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Zap size={18} /></div>
                  <div className="font-bold text-sm text-slate-900">Assign Package</div>
                  <div className="text-xs text-slate-400">Assign a new package</div>
                </button>

                <button onClick={() => setShowAssignPkgModal(true)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><RefreshCw size={18} /></div>
                  <div className="font-bold text-sm text-slate-900">Upgrade Package</div>
                  <div className="text-xs text-slate-400">Upgrade to higher plan</div>
                </button>

                <button onClick={() => setShowExtendSubModal(true)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Calendar size={18} /></div>
                  <div className="font-bold text-sm text-slate-900">Extend Subscription</div>
                  <div className="text-xs text-slate-400">Extend current subscription</div>
                </button>
              </div>
            </div>

            {/* Subscription History Table (Matching Screen 3 Spec) */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Subscription History</h3>
              <div className="space-y-2 text-xs">
                {mockSubscriptionHistory.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.action}</span>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Package: {item.package} ({item.duration})</div>
                    <div className="text-[10px] text-indigo-600 font-semibold">By: {item.by} • {item.remarks}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 4: PAYMENT HISTORY */}
      {activeTab === 'Payment History' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* MOBILE CARD VIEW (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {mockPaymentHistory.map((item) => (
                <div key={item.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.txnId}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.date}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                        item.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Package</span>
                      <span className="font-semibold text-slate-800">{item.package} ({item.cycle})</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                      <span className="font-extrabold text-slate-900">{item.amount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Method</span>
                      <span className="font-semibold text-slate-700">{item.method}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Gateway</span>
                      <span className="font-semibold text-slate-700">{item.gateway}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {item.status === 'Paid' && (
                      <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline cursor-pointer">
                        <FileText size={14} /> Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (>= 768px) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Billing Cycle</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Payment Gateway</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {mockPaymentHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-400">{item.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.txnId}</td>
                      <td className="px-4 py-3 text-slate-500">{item.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{item.package}</td>
                      <td className="px-4 py-3 text-slate-600">{item.cycle}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">{item.amount}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{item.method}</td>
                      <td className="px-4 py-3 text-slate-500">{item.gateway}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FileText size={16} className="mx-auto text-indigo-600 cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 5: TENANT ACTIVITY AUDIT LOG (Screen 5 Spec) */}
      {activeTab === 'Tenant Activity' && (
        <div className="space-y-6">
          {/* Category Filter Pills (Matching Screen 5 Spec) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
            <span className="text-slate-400 mr-2 flex items-center gap-1 shrink-0"><Filter size={14} /> Filter Activity:</span>
            {['All Activity', 'Login', 'Subscription', 'Payment', 'Profile', 'Account Status', 'System Actions'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedActivityCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedActivityCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Activity Log Audit Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" /> Audit Log Timeline
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-7 sm:pl-8">
              {filteredLogs.map((log) => (
                <div key={log.id} className="relative group">
                  <div className="absolute -left-[23px] sm:-left-[27px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-125 transition-transform" />
                  <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="text-xs font-extrabold text-slate-900">{log.title}</div>
                      <div className="text-[10px] font-bold text-slate-400">{log.date}</div>
                    </div>
                    <div className="text-xs text-slate-600 break-words">{log.description}</div>
                    <div className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                      {log.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 6: EMPLOYEE SUMMARY */}
      {activeTab === 'Employee Summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Total Employees</div>
                <div className="text-2xl font-black text-indigo-600">28</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <UserCheck size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Active Staff</div>
                <div className="text-2xl font-black text-emerald-600">26</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Inactive Staff</div>
                <div className="text-2xl font-black text-amber-600">2</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-indigo-600" /> Tenant Employee Roster
              </h3>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff members..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* MOBILE CARD VIEW (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {[
                { name: 'Ramesh Verma', role: 'Store Manager', email: 'ramesh@sharmatraders.in', phone: '+91 98765 11111', date: '15 Apr 2025', status: 'Active' },
                { name: 'Priya Sharma', role: 'Billing Clerk', email: 'priya@sharmatraders.in', phone: '+91 98765 22222', date: '18 Apr 2025', status: 'Active' },
                { name: 'Sunita Roy', role: 'Inventory Specialist', email: 'sunita@sharmatraders.in', phone: '+91 98765 33333', date: '01 May 2025', status: 'Active' },
                { name: 'Vikas Deep', role: 'Accountant', email: 'vikas@sharmatraders.in', phone: '+91 98765 44444', date: '10 May 2025', status: 'Inactive' },
                { name: 'Aakash Singh', role: 'Sales Executive', email: 'aakash@sharmatraders.in', phone: '+91 98765 55555', date: '20 May 2025', status: 'Active' },
              ].map((emp, i) => (
                <div key={i} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{emp.name}</h4>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {emp.role}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                      emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                    <div className="break-all">📧 {emp.email}</div>
                    <div>📞 {emp.phone}</div>
                    <div className="text-[11px] text-slate-400">Joined: {emp.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (>= 768px) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {[
                    { name: 'Ramesh Verma', role: 'Store Manager', email: 'ramesh@sharmatraders.in', phone: '+91 98765 11111', date: '15 Apr 2025', status: 'Active' },
                    { name: 'Priya Sharma', role: 'Billing Clerk', email: 'priya@sharmatraders.in', phone: '+91 98765 22222', date: '18 Apr 2025', status: 'Active' },
                    { name: 'Sunita Roy', role: 'Inventory Specialist', email: 'sunita@sharmatraders.in', phone: '+91 98765 33333', date: '01 May 2025', status: 'Active' },
                    { name: 'Vikas Deep', role: 'Accountant', email: 'vikas@sharmatraders.in', phone: '+91 98765 44444', date: '10 May 2025', status: 'Inactive' },
                    { name: 'Aakash Singh', role: 'Sales Executive', email: 'aakash@sharmatraders.in', phone: '+91 98765 55555', date: '20 May 2025', status: 'Active' },
                  ].map((emp, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{emp.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">{emp.role}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{emp.email}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{emp.phone}</td>
                      <td className="px-4 py-3 text-slate-400">{emp.date}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Action Modals */}
      <AccountControlModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        tenant={tenantObj}
        onConfirm={handleConfirmAccountStatus}
      />

      <ExtendSubscriptionModal
        isOpen={showExtendSubModal}
        onClose={() => setShowExtendSubModal(false)}
        onConfirm={(days, reason) => {
          alert(`Subscription extended by ${days} days! Reason: ${reason}`);
        }}
      />

      <AssignUpgradePackageModal
        isOpen={showAssignPkgModal}
        onClose={() => setShowAssignPkgModal(false)}
        onConfirm={(plan, cycle) => {
          alert(`Package upgraded to ${plan} (${cycle})!`);
        }}
      />
    </div>
  );
};

export default TenantDetailsPage;
