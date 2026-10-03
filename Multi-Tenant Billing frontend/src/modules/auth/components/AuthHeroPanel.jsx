import React from 'react';
import { IndianRupee, Shield, Zap, Printer, ShieldCheck, ShoppingCart, Package } from 'lucide-react';

const AuthHeroPanel = ({ role }) => {
  return (
    <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#070a21] to-[#0c1236] text-white p-10 lg:p-12 flex-col justify-center relative overflow-hidden [clip-path:polygon(0_0,93%_0,100%_100%,0_100%)]">
      <div className="absolute top-12 right-16 text-white/[0.03] text-7xl font-black pointer-events-none">₹</div>
      <div className="absolute top-1/2 right-12 text-white/[0.03] pointer-events-none"><ShoppingCart size={70} /></div>
      <div className="absolute bottom-20 right-24 text-white/[0.03] pointer-events-none"><Package size={60} /></div>

      <div className="max-w-xl relative z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
            <IndianRupee size={22} color="#ffffff" />
          </div>
          <div>
            <div className="font-extrabold text-xl leading-none text-white">BillPro</div>
            <div className="text-xs text-slate-400">Smart Billing Solution</div>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1 mb-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Welcome Back!</h1>
          <h3 className="text-base lg:text-lg font-bold text-slate-300">Login to your {role === 'ADMIN' ? 'admin' : 'vendor'} account</h3>
          <p className="text-xs lg:text-sm text-slate-400 max-w-md">Manage your business, inventory, sales, purchases and customers all in one place.</p>
        </div>

        {/* Feature Bullet Items */}
        <div className="space-y-3.5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#141c4d] border border-white/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Secure Login</h4>
              <p className="text-xs text-slate-400">{role === 'ADMIN' ? 'Encrypted admin email & password access.' : 'OTP authentication keeps your account secure.'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#141c4d] border border-white/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Multi-Tenant Management</h4>
              <p className="text-xs text-slate-400">Complete control over tenant subscriptions, billing, and store operations.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#141c4d] border border-white/10 text-purple-400 flex items-center justify-center shrink-0">
              <Printer size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Thermal & POS Billing</h4>
              <p className="text-xs text-slate-400">Instant barcode scanning and thermal printer receipt generation.</p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-xs text-slate-500 pt-4 border-t border-white/10 flex items-center gap-2">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>256-bit SSL Encrypted SaaS Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroPanel;
