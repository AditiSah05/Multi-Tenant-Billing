import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, Play, ShieldCheck, Building2 } from 'lucide-react';

export const LandingHero = ({ heroData, trustStats, trustLogos, onOpenDemoModal }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center max-w-full mx-auto space-y-5 sm:space-y-6">
      
      {/* System Status Pill & Top Badge */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] sm:text-xs font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SaaS Status: 99.99% Operational</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#dbeafe] border border-sky-200 text-[#0284c7] text-[11px] sm:text-sm font-extrabold tracking-wider uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284c7]" />
          <span>{heroData.badge}</span>
        </div>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#0f172a] leading-[1.15] sm:leading-[1.12] max-w-6xl mx-auto px-2">
        {heroData.titlePrefix}{' '}
        <span className="bg-gradient-to-r from-[#00a3ff] via-[#0284c7] to-[#2563eb] bg-clip-text text-transparent">
          {heroData.gradientTitle}
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-sm sm:text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium px-2">
        {heroData.subtitle}
      </p>

      {/* Feature Bullets Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-800 font-bold px-2">
        {heroData.featureBullets.map((bullet, idx) => (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-200 shadow-xs hover:border-sky-300 transition-all text-xs sm:text-sm">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284c7] stroke-[3]" />
            <span>{bullet}</span>
          </div>
        ))}
      </div>

      {/* Hero Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
        
        {/* Primary CTA Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
        >
          <span>{heroData.primaryCtaText}</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary CTA Button */}
        <button
          onClick={onOpenDemoModal}
          className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base font-bold bg-white text-[#0284c7] border border-[#38bdf8] shadow-xs hover:bg-sky-50/80 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-100 flex items-center justify-center text-[#0284c7]">
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
          </div>
          <span>{heroData.secondaryCtaText}</span>
        </button>
      </div>

      {/* Enterprise Trust Stats Ticker Bar */}
      {trustStats && trustStats.length > 0 && (
        <div className="pt-6 sm:pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto px-1">
          {trustStats.map((stat, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all text-center space-y-0.5 sm:space-y-1">
              <div className="text-xl sm:text-3xl font-black text-[#0f172a] bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs font-extrabold text-slate-800 leading-tight">{stat.label}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">{stat.subtext}</div>
            </div>
          ))}
        </div>
      )}

      {/* Enterprise Client Brand Logos Strip */}
      {trustLogos && trustLogos.length > 0 && (
        <div className="pt-2 sm:pt-4 flex flex-col items-center space-y-2.5 sm:space-y-3 px-2">
          <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 sm:gap-2 text-center">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Trusted By Leading Retail Chains & Multi-Store Brands</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {trustLogos.map((logo, idx) => (
              <div key={idx} className="bg-white/60 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                <span>{logo.name}</span>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  {logo.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingHero;

