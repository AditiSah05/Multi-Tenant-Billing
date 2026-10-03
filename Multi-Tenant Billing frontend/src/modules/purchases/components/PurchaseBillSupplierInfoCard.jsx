import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PurchaseBillSupplierInfoCard = ({ supplier }) => {
  const navigate = useNavigate();

  if (!supplier) return null;

  return (
    <div className="lg:col-span-2 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Supplier Details</span>
        <button
          onClick={() => navigate(`/vendor/suppliers/${supplier.id}`)}
          className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
        >
          View Supplier Profile
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
            {supplier.name?.slice(0, 2).toUpperCase() || 'RS'}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">{supplier.name}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 mt-0.5">
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-slate-400" /> {supplier.mobile}
              </span>
              {supplier.email && (
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> {supplier.email}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{supplier.city}, {supplier.state}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Total Purchases</div>
            <div className="font-black text-slate-900">₹{(supplier.totalPurchases || 0).toLocaleString('en-IN')}.00</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[10px] text-slate-400 uppercase">Total Paid</div>
            <div className="font-black text-emerald-600">₹{(supplier.totalPaid || 0).toLocaleString('en-IN')}.00</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[10px] text-slate-400 uppercase">Outstanding</div>
            <div className="font-black text-rose-600">₹{(supplier.outstandingDue || 0).toLocaleString('en-IN')}.00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBillSupplierInfoCard;
