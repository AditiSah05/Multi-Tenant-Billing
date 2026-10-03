import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Clock, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { useExpiryAlertsQuery } from '../hooks/useInventoryQueries';

const ExpiryAlertsModal = ({ isOpen, onClose, onSelectProductForAdjust }) => {
  const [selectedDays, setSelectedDays] = useState(30);
  const { data: rawAlerts, isLoading } = useExpiryAlertsQuery({ days: selectedDays });

  if (!isOpen) return null;

  const alertsData = rawAlerts?.data || rawAlerts || {};
  const buckets = alertsData.buckets || {};
  const expiredProducts = Array.isArray(alertsData.expiredProducts) ? alertsData.expiredProducts : [];
  const expiringSoonProducts = Array.isArray(alertsData.expiringSoonProducts) ? alertsData.expiringSoonProducts : [];

  const expiredCount = Number(buckets.expiredCount ?? expiredProducts.length) || 0;
  const within30Count = Number(buckets.within30DaysCount ?? expiringSoonProducts.length) || 0;

  const displayList = selectedDays === 0 ? expiredProducts : expiringSoonProducts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Product Expiry Risk Intelligence</h3>
              <p className="text-xs text-slate-500">Monitor batch expiry dates, early warning alerts, and prevent losses.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <button
            onClick={() => setSelectedDays(0)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedDays === 0
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertCircle size={14} /> Expired Items ({expiredCount})
          </button>

          {[7, 15, 30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedDays(days)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedDays === days
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Expiring in {days} Days
            </button>
          ))}
        </div>

        {/* Products Table Area */}
        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-2xl">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-amber-600" />
              <span>Checking product expiry dates...</span>
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs">
              {selectedDays === 0
                ? 'No expired products found in stock.'
                : `No products expiring within the next ${selectedDays} days.`}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {displayList.map((prod) => {
                  const expDate = prod.expiryDate ? new Date(prod.expiryDate).toLocaleDateString('en-IN') : 'N/A';
                  const isExpired = prod.expiryDate && new Date(prod.expiryDate) < new Date();
                  const qty = prod.currentStock ?? 0;
                  const unitLabel = prod.unit || 'Pcs';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{prod.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{prod.sku || 'N/A'}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-800">{expDate}</td>
                      <td className="py-3 px-4 text-center font-black text-slate-900">
                        {qty} <span className="text-slate-500 text-xs font-semibold">{unitLabel}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isExpired
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : 'EXPIRING SOON'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            onClose();
                            if (onSelectProductForAdjust) onSelectProductForAdjust(prod);
                          }}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] rounded-xl border border-rose-200 cursor-pointer transition-all inline-flex items-center gap-1"
                          title="Write Off / Discard Stock"
                        >
                          <Trash2 size={12} /> Discard Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold shrink-0">
          <span>
            Showing {displayList.length} product{displayList.length !== 1 ? 's' : ''} for selected timeframe
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiryAlertsModal;
