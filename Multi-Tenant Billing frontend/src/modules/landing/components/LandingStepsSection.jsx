import React from 'react';

export const LandingStepsSection = ({ stepsData }) => {
  return (
    <section id="how-it-works" className="py-8 sm:py-12 md:py-14 bg-white border-y border-slate-200/80 relative">
      <div className="max-w-full mx-auto px-4 sm:px-10 lg:px-16">
        
        <div className="text-center max-w-5xl mx-auto space-y-2 sm:space-y-3 mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-[#0284c7] text-[11px] sm:text-xs font-extrabold tracking-wider uppercase border border-sky-200">
            {stepsData.sectionTag}
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0f172a]">
            {stepsData.sectionTitle}
          </h2>
          <p className="text-slate-500 text-sm sm:text-lg font-medium">
            {stepsData.subtitle}
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-16 right-16 h-0.5 bg-gradient-to-r from-indigo-200 via-sky-300 to-indigo-200 -z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {stepsData.steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 hover:bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 text-center space-y-3 group cursor-default"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-indigo-900 bg-white flex items-center justify-center font-black text-lg sm:text-xl text-[#0f172a] mx-auto shadow-md group-hover:border-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white group-hover:scale-105 sm:group-hover:scale-110 transition-all duration-300">
                  {step.number}
                </div>
                <div className="text-[#0284c7] font-extrabold text-[10px] sm:text-[11px] tracking-wider uppercase">
                  {step.tag}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0f172a] leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-normal">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default LandingStepsSection;

