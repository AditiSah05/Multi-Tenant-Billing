import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export const LandingFaqSection = ({ faqItems, faqCategories = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);

  const filteredFaqs = selectedCategory === 'ALL'
    ? faqItems
    : faqItems.filter(item => item.category === selectedCategory);

  return (
    <section id="faq" className="py-20 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-[#0284c7] text-xs font-extrabold tracking-wider uppercase border border-sky-200">
          <HelpCircle size={14} />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0f172a]">
          Everything You Need To Know
        </h2>
        <p className="text-slate-500 text-sm">
          Got questions about billing, POS setup, GST returns, or store subscriptions? We've got answers.
        </p>

        {/* Category Tabs */}
        {faqCategories.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveFaqIndex(0);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3.5">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = activeFaqIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
              className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                isOpen
                  ? 'bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 border-indigo-300 shadow-md'
                  : 'bg-[#f1f5f9] border-slate-200/80 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center justify-between font-extrabold text-sm sm:text-base text-[#0f172a]">
                <span>{faq.q}</span>
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-all ${
                  isOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'
                }`}>
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
              </div>
              {isOpen && (
                <p className="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200/80 leading-relaxed font-medium animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LandingFaqSection;

