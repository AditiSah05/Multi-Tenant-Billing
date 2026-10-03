import React from 'react';
import { Star, CheckCircle2, Quote, Store } from 'lucide-react';

export const LandingTestimonialsSection = ({ testimonialsData }) => {
  return (
    <section id="testimonials" className="py-20 bg-slate-50/70 border-t border-slate-200/80 px-6 sm:px-10 lg:px-16 max-w-full mx-auto">
      
      <div className="text-center max-w-5xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold tracking-wider uppercase">
          {testimonialsData.sectionTag}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0f172a]">
          {testimonialsData.sectionTitle}
        </h2>
        <p className="text-slate-500 text-base sm:text-lg font-medium">
          {testimonialsData.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonialsData.testimonials.map((item) => (
          <div
            key={item.id}
            className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
          >
            <div className="space-y-4">
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>Verified Outlet</span>
                </span>
              </div>

              {/* Quote Text */}
              <div className="relative">
                <Quote size={24} className="text-indigo-200 absolute -top-2 -left-2 -z-0 opacity-60" />
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed relative z-10 italic">
                  "{item.quote}"
                </p>
              </div>
            </div>

            {/* Customer Profile Details */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${item.avatarColor} text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0`}>
                {item.name.charAt(0)}
              </div>
              <div className="truncate flex-1">
                <h4 className="font-extrabold text-sm text-[#0f172a] truncate">{item.name}</h4>
                <p className="text-xs text-slate-500 font-semibold truncate">{item.role}, {item.business}</p>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-indigo-600 font-bold">{item.location}</span>
                  {item.outlets && (
                    <span className="text-[9px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Store className="w-2.5 h-2.5 text-indigo-600" />
                      <span>{item.outlets}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default LandingTestimonialsSection;

