import React, { useState } from 'react';
import { Plus, Minus, Quote } from 'lucide-react';

export const LandingTestimonialFaqSection = ({ testimonialsData, faqItems }) => {
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);

  return (
    <section id="testimonials-faq" className="py-8 sm:py-12 md:py-14 px-4 sm:px-10 lg:px-16 max-w-full mx-auto border-t border-slate-200/80 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column: Testimonials */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0284c7]">
              TESTIMONIALS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0f172a] mt-0.5 sm:mt-1">
              Trusted By <span className="text-[#0284c7]">Store Owners</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {testimonialsData.testimonials.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="text-indigo-600 font-black text-xl sm:text-2xl leading-none block">”</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.quote}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${item.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                    {item.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold truncate">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Frequently Asked Questions */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0284c7]">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3 pt-1">
            {faqItems.slice(0, 6).map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className={`border rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all duration-200 ${
                    isOpen
                      ? 'bg-slate-50/80 border-indigo-300 shadow-2xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-xs sm:text-sm text-slate-900 gap-2">
                    <span className="leading-snug">{faq.q}</span>
                    <div className="text-slate-500 shrink-0">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </div>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-200/60 leading-relaxed font-medium animate-fadeIn">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default LandingTestimonialFaqSection;
