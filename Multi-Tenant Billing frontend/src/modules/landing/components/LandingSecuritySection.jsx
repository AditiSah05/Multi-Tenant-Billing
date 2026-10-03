import React from 'react';
import { ShieldCheck, Lock, Award, Server, CheckCircle2 } from 'lucide-react';

const ICON_MAP = {
  ShieldCheck: ShieldCheck,
  Lock: Lock,
  Award: Award,
  Server: Server
};

export const LandingSecuritySection = ({ securityItems }) => {
  return (
    <section id="security" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0b132a] via-[#0f172a] to-[#090d1a] text-white p-8 sm:p-14 shadow-2xl overflow-hidden border border-slate-800/80">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-extrabold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Bank-Grade Enterprise Protection</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Built For Multi-Tenant Isolation & Total Compliance
            </h2>
            <p className="text-slate-300 text-base sm:text-lg font-normal">
              Every transaction, customer phone number, and tax audit record in Softfyr BillPro is secured with strict enterprise tenant isolation and 256-bit SSL encryption.
            </p>
          </div>

          {/* Security Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityItems.map((item, idx) => {
              const IconComp = ICON_MAP[item.iconName] || ShieldCheck;

              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 space-y-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Trust Seal Banner */}
          <div className="p-6 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">Official GST Suvidha Provider (GSP) Ready</div>
                <div className="text-slate-300 text-xs">Full compatibility with Central Board of Indirect Taxes and Customs (CBIC) rules.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-indigo-200">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">ISO 27001 Certified Architecture</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">99.99% Uptime Guarantee</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingSecuritySection;

