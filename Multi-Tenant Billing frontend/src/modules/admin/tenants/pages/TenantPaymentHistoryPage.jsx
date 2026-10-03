import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Download,
  Search,
  FileText
} from 'lucide-react';

const mockPaymentHistory = [];

const TenantPaymentHistoryPage = () => {
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
            <span className="text-indigo-600 font-bold">Payment History</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payment History</h1>
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

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:flex lg:items-center gap-2.5 sm:gap-3">
        <div className="relative col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-1 lg:flex-1 lg:min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-600"
            placeholder="Search by Transaction ID or Plan Name..."
          />
        </div>

        <select className="w-full lg:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer">
          <option>All Status</option>
          <option>Paid</option>
          <option>Failed</option>
          <option>Refunded</option>
        </select>

        <select className="w-full lg:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer">
          <option>All Payment Method</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Net Banking</option>
        </select>

        <select className="w-full lg:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer">
          <option>All Packages</option>
          <option>Professional</option>
          <option>Basic</option>
        </select>

        <button className="w-full lg:w-auto px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30 col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-1">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Payment History Data Table */}
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
                      : item.status === 'Failed'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : item.status === 'Refunded'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-sky-50 text-sky-600 border-sky-200'
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
                  <span className="font-semibold text-slate-700">{item.method} {item.cardBrand && `(${item.cardBrand})`}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gateway</span>
                  <span className="font-semibold text-slate-700">{item.gateway}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {item.status === 'Paid' ? (
                  <button className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 hover:underline cursor-pointer">
                    <FileText size={14} /> Download Invoice
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
                <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer">
                  View
                </button>
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
                <th className="px-4 py-3 text-center">Action</th>
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
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {item.method} {item.cardBrand && <span className="text-[10px] text-indigo-600 font-bold">({item.cardBrand})</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.gateway}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        item.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : item.status === 'Failed'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : item.status === 'Refunded'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-sky-50 text-sky-600 border-sky-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.status === 'Paid' && <FileText size={16} className="mx-auto text-indigo-600 cursor-pointer" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantPaymentHistoryPage;
