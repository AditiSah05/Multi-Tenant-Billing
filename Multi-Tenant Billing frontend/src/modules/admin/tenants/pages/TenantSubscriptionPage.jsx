import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Crown,
  Zap,
  Gift,
  RefreshCw,
  Calendar,
  Clock,
  ChevronDown
} from 'lucide-react';

const mockSubscriptionHistory = [];

const TenantSubscriptionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <button onClick={() => navigate('/admin/tenants')} className="hover:text-indigo-600 flex items-center gap-1 cursor-pointer">
              <ArrowLeft size={14} /> Tenant Management
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/admin/tenants/${id}`)} className="hover:text-indigo-600 font-bold cursor-pointer">Sharma Traders</button>
            <span>›</span>
            <span className="text-indigo-600 font-bold">Subscription Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Subscription Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>25 May 2025 - 31 May 2025</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <button onClick={() => navigate(`/admin/tenants/${id}`)} className="px-4 py-2 border border-indigo-200 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-50 transition-all cursor-pointer">
            ← Back to Tenant Details
          </button>
        </div>
      </div>

      {/* Tenant Header Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black shrink-0">
            ST
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Sharma Traders</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>📧 amit@sharmatraders.in</span>
              <span>•</span>
              <span>📞 +91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Current Subscription Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">Current Subscription</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Package Name</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-indigo-600">Professional</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] sm:text-[11px] font-bold">Yearly</span>
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

          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Days Remaining</div>
            <div className="text-lg sm:text-xl font-black text-indigo-600 mt-0.5">356 Days</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Manage Subscription</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Zap size={18} /></div>
              <div className="font-bold text-sm text-slate-900">Assign Package</div>
              <div className="text-xs text-slate-400">Assign a new package</div>
            </button>

            <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><RefreshCw size={18} /></div>
              <div className="font-bold text-sm text-slate-900">Upgrade Package</div>
              <div className="text-xs text-slate-400">Upgrade to higher plan</div>
            </button>

            <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><Crown size={18} /></div>
              <div className="font-bold text-sm text-slate-900">Change Package</div>
              <div className="text-xs text-slate-400">Change to another plan</div>
            </button>

            <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Gift size={18} /></div>
              <div className="font-bold text-sm text-slate-900">Extend Free Trial</div>
              <div className="text-xs text-slate-400">Add more free trial days</div>
            </button>

            <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Calendar size={18} /></div>
              <div className="font-bold text-sm text-slate-900">Extend Subscription</div>
              <div className="text-xs text-slate-400">Extend current subscription</div>
            </button>

            <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-left space-y-2 shadow-sm transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Clock size={18} /></div>
              <div className="font-bold text-sm text-slate-900">Change Expiry Date</div>
              <div className="text-xs text-slate-400">Manually update expiry date</div>
            </button>
          </div>

          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">💡 About Subscription Management</div>
            <p className="text-slate-600">• Changes made here will reflect immediately for this tenant.</p>
            <p className="text-slate-600">• If tenant upgrades through payment gateway, subscription updates automatically.</p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Subscription Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Current Package</span>
                <span className="font-bold text-slate-900">Professional (Yearly)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Subscription Status</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Start Date</span>
                <span className="font-semibold text-slate-800">12 Apr 2025</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Expiry Date</span>
                <span className="font-semibold text-slate-800">12 Apr 2026</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Days Remaining</span>
                <span className="font-bold text-indigo-600">356 Days</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Amount</span>
                <span className="font-extrabold text-slate-900">₹11,999.00</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Subscription History</h3>
            <div className="space-y-2 text-xs">
              {mockSubscriptionHistory.map((item) => (
                <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{item.action}</span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">Package: {item.package} ({item.duration})</div>
                  <div className="text-[10px] text-slate-400">{item.remarks}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSubscriptionPage;
