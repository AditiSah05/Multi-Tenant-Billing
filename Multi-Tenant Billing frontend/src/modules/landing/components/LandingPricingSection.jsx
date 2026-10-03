import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Crown, CheckCircle2, ArrowRight, Building2, PhoneCall } from 'lucide-react';

export const LandingPricingSection = ({ pricingPackages, onOpenDemoModal }) => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');

  return (
    <section id="pricing" className="py-20 bg-slate-50/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wider uppercase">
          Simple & Transparent Pricing
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0f172a]">
          Choose The Perfect Subscription Plan
        </h2>
        <p className="text-slate-500 text-base sm:text-lg">
          14-day free trial on all plans. No credit card required to start.
        </p>

        {/* Billing Cycle Toggle Switcher */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center border border-slate-300">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500 text-white rounded-md">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPackages.map((pkg) => {
          const price = billingCycle === 'yearly' ? pkg.yearlyPrice : pkg.monthlyPrice;

          return (
            <div
              key={pkg.id}
              className={`relative p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                pkg.popular
                  ? 'bg-gradient-to-b from-indigo-50/90 via-white to-purple-50/50 border-2 border-indigo-600 shadow-2xl shadow-indigo-500/15 scale-[1.03]'
                  : 'bg-white border-slate-200 hover:shadow-lg'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-[11px] uppercase border shadow-xs ${pkg.badgeStyle}`}>
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-xl font-extrabold text-[#0f172a] flex items-center gap-2">
                    {pkg.name}
                    {pkg.popular && <Sparkles size={16} className="text-indigo-600" />}
                    {pkg.id.includes('enterprise') && <Crown size={16} className="text-amber-500" />}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#0f172a]">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-indigo-500/30 hover:opacity-95'
                      : 'bg-[#0f172a] hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Custom Store Chain Callout Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Store Chains & Franchises (10+ Outlets)</span>
          </div>
          <h3 className="text-2xl font-black">Need Custom Multi-Tenant Isolation & Dedicated SLA?</h3>
          <p className="text-slate-300 text-xs sm:text-sm font-normal">
            We provide custom ERP integrations, dedicated database clusters, custom GST filing workflows, and on-site staff training for large supermarket chains and distributors.
          </p>
        </div>

        <button
          onClick={onOpenDemoModal}
          className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Request Custom Enterprise Quote</span>
        </button>
      </div>

    </section>
  );
};

export default LandingPricingSection;

