import React from 'react';
import { Store, FileSpreadsheet, Check } from 'lucide-react';

export const LandingFeaturesSection = ({ featureData }) => {
  return (
    <section id="features" className="py-20 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dbeafe] border border-sky-200 text-[#0284c7] text-xs font-extrabold tracking-wider uppercase">
          {featureData.sectionTag}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0f172a]">
          {featureData.sectionTitle}
        </h2>
        <p className="text-slate-500 text-base sm:text-lg font-medium">
          {featureData.subtitle}
        </p>
      </div>

      {featureData.cards.map((card, cardIdx) => {
        const IconComp = card.iconType === 'tax' ? FileSpreadsheet : Store;
        const leftBg = card.iconType === 'tax' 
          ? 'bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white' 
          : 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white';
        const iconBg = card.iconType === 'tax' ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30';
        const checkBg = card.iconType === 'tax' ? 'bg-teal-100 text-teal-800' : 'bg-sky-100 text-[#0284c7]';

        return (
          <div key={cardIdx} className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 hover:shadow-2xl transition-all duration-300">
            {/* Left Gradient Panel */}
            <div className={`lg:col-span-4 ${leftBg} p-8 flex flex-col justify-center items-center text-center space-y-4`}>
              <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                <IconComp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">{card.leftTitle}</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs font-normal">{card.leftDesc}</p>
            </div>

            {/* Right White Panel */}
            <div className="lg:col-span-8 bg-white p-8 space-y-6">
              <h4 className="text-xl font-extrabold text-[#0f172a]">{card.rightTitle}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {card.features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                    <div className={`w-5 h-5 rounded-full ${checkBg} flex items-center justify-center shrink-0`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

    </section>
  );
};

export default LandingFeaturesSection;

