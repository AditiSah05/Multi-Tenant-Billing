import React, { useState } from 'react';
import { X, ShieldAlert, Calendar, Zap, Gift, Clock, RefreshCw } from 'lucide-react';

// 1. Account Status Control Modal (Suspend / Reactivate / Deactivate)
export const AccountControlModal = ({ isOpen, onClose, tenant, onConfirm }) => {
  if (!isOpen) return null;
  const isCurrentlyActive = tenant?.accountStatus === 'Active';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <ShieldAlert size={20} />
            <span>{isCurrentlyActive ? 'Suspend Tenant Account' : 'Reactivate Tenant Account'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to {isCurrentlyActive ? 'suspend' : 'reactivate'}{' '}
            <strong className="text-slate-900">{tenant?.businessName || 'Sharma Traders'}</strong>?
          </p>
          {isCurrentlyActive ? (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
              ⚠️ This tenant and all associated store users will no longer be able to log in or process sales until reactivated.
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700">
              ✅ Access will be restored immediately for this tenant account.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(tenant?.id, isCurrentlyActive ? 'Suspended' : 'Active');
              onClose();
            }}
            className={`px-4 py-2 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer ${
              isCurrentlyActive ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isCurrentlyActive ? 'Suspend Tenant' : 'Reactivate Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Extend Subscription Modal
export const ExtendSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
  const [extendDays, setExtendDays] = useState('30');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-base">
            <Calendar size={20} />
            <span>Extend Subscription</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Current Expiry</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
              12 Apr 2026
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Extend By</label>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="365">1 Year (365 Days)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">New Expiry Date</label>
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl font-black text-indigo-600">
              {extendDays === '30' ? '12 May 2026' : extendDays === '60' ? '12 Jun 2026' : '12 May 2027'}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Reason / Note</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-indigo-600"
              placeholder="e.g. Special promotional extension provided by support"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(extendDays, reason);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            Confirm Extension
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Assign / Upgrade Package Modal
export const AssignUpgradePackageModal = ({ isOpen, onClose, onConfirm }) => {
  const [selectedPlan, setSelectedPlan] = useState('Pro Plan');
  const [billingCycle, setBillingCycle] = useState('Yearly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-base">
            <Zap size={20} />
            <span>Assign / Upgrade Package</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Package</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="Basic Plan">Basic Plan (₹999/mo)</option>
              <option value="Pro Plan">Pro Plan (₹1,499/mo)</option>
              <option value="Enterprise">Enterprise Plan (₹2,999/mo)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Billing Cycle</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBillingCycle('Monthly')}
                className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  billingCycle === 'Monthly' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('Yearly')}
                className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  billingCycle === 'Yearly' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Yearly (20% Off)
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedPlan, billingCycle);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            Apply Package
          </button>
        </div>
      </div>
    </div>
  );
};
