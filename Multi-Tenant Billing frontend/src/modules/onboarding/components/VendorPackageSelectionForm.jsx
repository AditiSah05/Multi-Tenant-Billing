import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Crown,
  ArrowLeft,
  LayoutDashboard,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { SUBSCRIPTION_PACKAGES_MOCK } from '../../auth/data/authMockData';

const VendorPackageSelectionForm = ({ onComplete, onBack, loading }) => {
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PACKAGES_MOCK[1]); // Default to Growth Pro
  const [billingCycle, setBillingCycle] = useState('yearly');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ selectedPlan, billingCycle });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <div className="text-xs font-extrabold flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-400" /> Choose Subscription Plan
          </div>
          <div className="text-[11px] text-indigo-200 mt-0.5">Select a plan to activate your store partition</div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="px-2.5 py-1 rounded-lg bg-indigo-800/80 border border-indigo-700 text-[11px] font-bold flex items-center gap-1.5 hover:bg-indigo-700"
        >
          <span>{billingCycle === 'yearly' ? 'Yearly (-20%)' : 'Monthly'}</span>
        </button>
      </div>

      {/* Plan Cards List */}
      <div className="space-y-2">
        {SUBSCRIPTION_PACKAGES_MOCK.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const displayPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${plan.badgeClass}`}>
                    {plan.badge}
                  </span>
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    {plan.name}
                    {plan.id === 'enterprise-unlimited' && <Crown size={14} className="text-amber-500" />}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">
                    {displayPrice === 0 ? '₹0' : `₹${displayPrice.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-slate-500">/{plan.durationText}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600 font-medium overflow-x-auto">
                {plan.features.map((feat, idx) => (
                  <span key={idx} className="flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={12} className={isSelected ? 'text-indigo-600' : 'text-emerald-500'} />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Guarantee Note */}
      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
        <span>14-day risk-free trial. Upgrade, downgrade, or cancel anytime.</span>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Activating Store...
            </>
          ) : (
            <>
              <LayoutDashboard size={16} />
              Activate & Launch Dashboard
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default VendorPackageSelectionForm;
