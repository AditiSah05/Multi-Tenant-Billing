import React from 'react';
import { IndianRupee } from 'lucide-react';
import AuthHeroPanel from '../../auth/components/AuthHeroPanel';

const OnboardingLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans">
      <div className="flex-1 flex w-full min-h-screen">
        {/* 1. Left Hero Panel (Same as Login Page) */}
        <AuthHeroPanel role="VENDOR" />

        {/* 2. Right Form Card Section (Same as Login Page) */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10 w-full pt-6 lg:pt-0">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 transition-all duration-300">
            {/* Mobile Header Logo */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <IndianRupee size={20} color="#ffffff" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-lg leading-none text-slate-900">Softfyr BillPro</div>
                <div className="text-[10px] font-bold text-slate-400">Multi-Tenant SaaS Billing</div>
              </div>
            </div>

            {/* Step Page Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
 