import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

const TenantTable = ({ tenants = [] }) => {
  const navigate = useNavigate();

  const getPackageBadgeStyle = (pkg) => {
    switch (pkg) {
      case 'Professional':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Basic':
        return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'Enterprise':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Free Trial':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTenantStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Free Trial':
        return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'Upgraded':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Free Trial Ended':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAccountStatusBadgeStyle = (status) => {
    if (status === 'Active') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
    return 'bg-rose-50 text-rose-600 border-rose-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* MOBILE CARD VIEW (< 768px) */}
      <div className="md:hidden divide-y divide-slate-100">
        {tenants.map((t) => (
          <div key={t.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{t.businessName}</h4>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">{t.ownerName}</div>
                <div className="text-[11px] text-slate-400 break-all">{t.email}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border shrink-0 ${getPackageBadgeStyle(t.currentPackage)}`}>
                {t.currentPackage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile</span>
                <span className="font-semibold text-slate-800">{t.mobile}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reg. Date</span>
                <span className="font-semibold text-slate-800">{t.registrationDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sub. Start</span>
                <span className="font-semibold text-slate-700">{t.subStart || '12 Apr 2025'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sub. Expiry</span>
                <span className="font-semibold text-slate-700">{t.subExpiry || '12 Apr 2026'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTenantStatusBadgeStyle(t.tenantStatus)}`}>
                  {t.tenantStatus}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAccountStatusBadgeStyle(t.accountStatus)}`}>
                  {t.accountStatus}
                </span>
              </div>
              <button
                onClick={() => navigate(`/admin/tenants/${t.id}`)}
                className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                View Details <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Business Name</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Owner Name</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Email</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Mobile</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Registration Date</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Current Package</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Sub. Start</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Sub. Expiry</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Tenant Status</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Account Status</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 text-xs sm:text-sm font-bold text-slate-900">{t.businessName}</td>
                <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-700">{t.ownerName}</td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{t.email}</td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">{t.mobile}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{t.registrationDate}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getPackageBadgeStyle(t.currentPackage)}`}>
                    {t.currentPackage}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">{t.subStart || '12 Apr 2025'}</td>
                <td className="px-4 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">{t.subExpiry || '12 Apr 2026'}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getTenantStatusBadgeStyle(t.tenantStatus)}`}>
                    {t.tenantStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getAccountStatusBadgeStyle(t.accountStatus)}`}>
                    {t.accountStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-center whitespace-nowrap">
                  <button
                    onClick={() => navigate(`/admin/tenants/${t.id}`)}
                    className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    View Details <ArrowRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="text-center sm:text-left">Showing 1 to {tenants.length} of 248 tenants</div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">&lt;</button>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shadow-md">1</button>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">2</button>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">3</button>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">4</button>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">5</button>
          <span className="px-1 text-slate-400">...</span>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">31</button>
          <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">&gt;</button>
        </div>
        <div className="flex items-center gap-2">
          <span>10 / page</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
};

export default TenantTable;
