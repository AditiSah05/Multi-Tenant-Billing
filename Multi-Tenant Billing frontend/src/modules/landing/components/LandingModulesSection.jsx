import React from 'react';
import { Receipt, Calculator, Layers, PackageCheck, ShoppingCart, BarChart3 } from 'lucide-react';

const ICON_MAP = {
  receipt: Receipt,
  calculator: Calculator,
  layers: Layers,
  package: PackageCheck,
  cart: ShoppingCart,
  chart: BarChart3
};

export const LandingModulesSection = ({ modulesData }) => {
  return (
    <section id="services" className="py-8 sm:py-12 md:py-14 px-4 sm:px-10 lg:px-16 max-w-full mx-auto">
      
      <div className="text-center max-w-5xl mx-auto space-y-2.5 sm:space-y-4 mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 text-[#0284c7] text-[11px] sm:text-xs font-extrabold tracking-wider uppercase border border-sky-200/80 shadow-2xs">
          {modulesData.sectionTag}
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
          {modulesData.sectionTitle}
        </h2>
        <p className="text-slate-600 text-sm sm:text-lg font-medium">
          {modulesData.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {modulesData.modules.map((item) => {
          const IconComp = ICON_MAP[item.iconType] || Receipt;
          const iconBg = item.iconColor === 'teal' 
            ? 'bg-gradient-to-r from-teal-600 to-emerald-600' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600';

          return (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5 sm:space-y-3 cursor-default"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${iconBg} text-white flex items-center justify-center shadow-md`}>
                <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.description}</p>
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default LandingModulesSection;
