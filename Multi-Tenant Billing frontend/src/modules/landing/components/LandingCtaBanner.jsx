import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const LandingCtaBanner = ({ ctaData, onOpenDemoModal }) => {
  const navigate = useNavigate();

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-10 lg:px-16 max-w-full mx-auto bg-white">
      <div className="bg-gradient-to-r from-[#2563eb] via-[#0284c7] to-[#06b6d4] rounded-2xl py-5 px-5 sm:py-8 sm:px-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-extrabold uppercase">
            <Sparkles className="w-3 h-3" />
            <span>{ctaData.badge}</span>
          </div>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug">
            {ctaData.title}
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm font-medium">
            {ctaData.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto bg-white text-[#2563eb] font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:bg-slate-100 transition-all cursor-pointer text-xs sm:text-sm text-center"
          >
            {ctaData.primaryCtaText}
          </button>
          <button
            onClick={onOpenDemoModal}
            className="w-full sm:w-auto border border-white/70 bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all cursor-pointer text-xs sm:text-sm text-center"
          >
            {ctaData.secondaryCtaText}
          </button>
        </div>

      </div>
    </section>
  );
};

export default LandingCtaBanner;
