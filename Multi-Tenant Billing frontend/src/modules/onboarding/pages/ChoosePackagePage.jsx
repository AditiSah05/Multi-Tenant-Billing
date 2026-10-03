import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  useGetSubscriptionPackagesQuery,
  useChoosePackageMutation
} from '../hooks/useOnboardingQueries';
import OnboardingLayout from '../components/OnboardingLayout';
import OnboardingHeader from '../components/OnboardingHeader';
import {
  CheckCircle2,
  Crown,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react';

const SAAS_PRICING_PACKAGES = [
  {
    id: 'starter-plan',
    name: 'Starter Retail',
    tagline: 'Ideal for single retail shops & small billing counters',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    badge: '14-Day Free Trial',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    popular: false,
    features: [
      '1 Active POS Terminal',
      'Barcode Scanning & Thermal Receipts',
      'Basic Inventory & Stock Alerts',
      'Standard GST Tax Reports',
      'Email & Community Support'
    ]
  },
  {
    id: 'growth-pro-plan',
    name: 'Growth Pro',
    tagline: 'Best for growing multi-store businesses & supermarkets',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    badge: '★ MOST POPULAR',
    badgeStyle: 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-200',
    popular: true,
    features: [
      'Unlimited POS Terminals & Counters',
      'Multi-Warehouse & Stock Transfers',
      'WhatsApp & SMS Instant Invoicing',
      'Detailed P&L Analytics & Profit Margin',
      'Supplier Purchase Returns & Credit Bills',
      '24/7 Priority WhatsApp & Call Support'
    ]
  },
  {
    id: 'enterprise-plan',
    name: 'Enterprise Unlimited',
    tagline: 'For large chains, franchises & white-label setups',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    badge: '👑 BEST VALUE',
    badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
    popular: false,
    features: [
      'Unlimited Store Outlets & Partitions',
      'Custom Store Domain & Logo Branding',
      'White-Label Receipt Customization',
      'Custom API & Tally ERP Integration',
      'Dedicated Account Manager & SLA'
    ]
  }
];

export default function ChoosePackagePage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const toast = useToast();

  const { data: apiPackages, isLoading: isFetchingPackages } = useGetSubscriptionPackagesQuery();
  const choosePackageMutation = useChoosePackageMutation();

  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [selectedPackageId, setSelectedPackageId] = useState('growth-pro-plan');

  const packagesList = (Array.isArray(apiPackages) && apiPackages.length > 0)
    ? apiPackages
    : (apiPackages?.packages && Array.isArray(apiPackages.packages) && apiPackages.packages.length > 0)
    ? apiPackages.packages
    : SAAS_PRICING_PACKAGES;

  const activePlanObj = packagesList.find((p) => (p.id || p._id || p.packageId) === selectedPackageId) || packagesList[1] || packagesList[0];
  const activePlanName = activePlanObj?.name || activePlanObj?.packageName || activePlanObj?.title || 'Selected Plan';

  const handleActivatePlan = (e) => {
    e.preventDefault();

    if (!selectedPackageId) {
      toast?.error('Please select a subscription package plan.');
      return;
    }

    choosePackageMutation.mutate(selectedPackageId, {
      onSuccess: (resData) => {
        toast?.success(`Plan Activated! Launching ${activePlanName}... 🚀`);
        localStorage.setItem('hasSelectedPackage', 'true');
        localStorage.setItem('isProfileComplete', 'true');

        const updatedUser = {
          ...user,
          hasSelectedPackage: true,
          isProfileComplete: true,
          currentPackageId: selectedPackageId,
          billingCycle
        };
        login(updatedUser, localStorage.getItem('token'));

        setTimeout(() => {
          navigate('/vendor/dashboard', { replace: true });
        }, 800);
      },
      onError: (err) => {
        const errorMsg = err?.response?.data?.message || err?.message || 'Failed to activate subscription plan. Please try again.';
        toast?.error(errorMsg);
      }
    });
  };

  return (
    <OnboardingLayout>
      <OnboardingHeader currentStep={3} />

      <div className="space-y-4">
        {/* Billing Cycle Switcher Toggle */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-between border border-slate-200">
          <div className="text-xs font-bold text-slate-700 pl-2 flex items-center gap-1.5">
            <Zap size={14} className="text-indigo-600" />
            <span>Select Billing Cycle</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-inner border border-slate-200/60">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-500 text-white rounded-md">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isFetchingPackages ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Loading available SaaS subscription tiers...</p>
          </div>
        ) : (
          /* SaaS Pricing Plan Cards Grid */
          <div className="space-y-3">
            {packagesList.map((pkg) => {
              const pkgId = pkg.id || pkg._id || pkg.packageId;
              const isSelected = selectedPackageId === pkgId;
              const pkgName = pkg.name || pkg.packageName || pkg.title || 'Subscription Plan';
              const price = billingCycle === 'yearly'
                ? (pkg.yearlyPrice || (pkg.amount ? pkg.amount * 10 : pkg.price ? pkg.price * 10 : 4990))
                : (pkg.monthlyPrice || pkg.amount || pkg.price || 499);

              return (
                <div
                  key={pkgId}
                  onClick={() => setSelectedPackageId(pkgId)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/40 border-indigo-600 ring-2 ring-indigo-500/20 shadow-lg scale-[1.01]'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {/* Top Badge */}
                  {pkg.badge && (
                    <div className="absolute -top-2.5 right-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase border shadow-sm ${pkg.badgeStyle || 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold'}`}>
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                          {pkgName}
                          {pkg.popular && <Sparkles size={14} className="text-indigo-600" />}
                          {pkgName.toLowerCase().includes('enterprise') && <Crown size={14} className="text-amber-500" />}
                        </h4>
                        {pkg.tagline && (
                          <p className="text-[11px] text-slate-500">{pkg.tagline}</p>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="flex items-baseline gap-1 sm:justify-end">
                        <span className="text-lg sm:text-xl font-black text-slate-900">
                          ₹{typeof price === 'number' ? price.toLocaleString() : price}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-[9px] font-bold text-emerald-600">
                          Equivalent to ₹{Math.round((typeof price === 'number' ? price : 4990) / 12).toLocaleString()}/mo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features Bullet List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/60 mt-2">
                    {(pkg.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <CheckCircle2 size={12} className={isSelected ? 'text-indigo-600 shrink-0' : 'text-emerald-500 shrink-0'} />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Guarantee Note */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span>14-day risk-free money-back guarantee. No credit card required to start.</span>
        </div>

        {/* Primary Activation CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleActivatePlan}
            disabled={choosePackageMutation.isPending}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {choosePackageMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Activating {activePlanName}...</span>
              </>
            ) : (
              <>
                <LayoutDashboard size={18} />
                <span>Activate {activePlanName} & Launch Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
