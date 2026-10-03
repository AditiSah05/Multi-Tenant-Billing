import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Calculator, Layers, FileSpreadsheet, Check, ArrowRight, Printer, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Receipt: Receipt,
  Calculator: Calculator,
  Layers: Layers,
  FileSpreadsheet: FileSpreadsheet
};

export const LandingProductShowcase = ({ tabsData }) => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState(tabsData[0]?.id || 'pos-counter');
  const activeTab = tabsData.find(t => t.id === activeTabId) || tabsData[0];

  return (
    <section id="product-tour" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wider uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Interactive Enterprise Tour</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0f172a]">
          Experience The Enterprise Counter Platform
        </h2>
        <p className="text-slate-600 text-base sm:text-lg font-medium">
          Click through the core modules below to see how Softfyr BillPro handles rush-hour billing, automated GST splits, catalog hierarchy, and CA tax filings.
        </p>
      </div>

      {/* Tab Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-200/70 p-2 rounded-2xl max-w-4xl mx-auto border border-slate-300/80">
        {tabsData.map((tab) => {
          const IconComponent = ICON_MAP[tab.iconName] || Receipt;
          const isActive = activeTabId === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0284c7]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Showcase Stage Card */}
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 rounded-3xl blur-xl opacity-20"></div>

        <div className="relative rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Feature Description Panel */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0b132a] text-white space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                {activeTab.badge}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                {activeTab.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {activeTab.description}
              </p>

              <div className="pt-2 space-y-2.5">
                {activeTab.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-extrabold text-xs sm:text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Try {activeTab.label} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Simulated Screen Visualizer */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 flex flex-col justify-center">
            
            {activeTabId === 'pos-counter' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md space-y-4 font-sans">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">POS Counter Terminal #01</span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    SCANNER READY
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">Sony Wireless Headphones 1000XM5</div>
                      <div className="text-[10px] text-slate-500">HSN: 8518 • Warranty: 12 Months</div>
                    </div>
                    <div className="text-right font-black text-slate-900">
                      ₹24,990.00
                    </div>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">Samsung Curved Gaming Monitor 27"</div>
                      <div className="text-[10px] text-slate-500">HSN: 8471 • Warranty: 36 Months</div>
                    </div>
                    <div className="text-right font-black text-slate-900">
                      ₹18,500.00
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal Taxable:</span>
                    <span className="font-bold text-slate-900">₹43,490.00</span>
                  </div>
                  <div className="flex justify-between text-indigo-700 font-bold">
                    <span>Intrastate Tax (CGST 9% + SGST 9%):</span>
                    <span>₹7,828.20</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-black text-sm pt-1 border-t border-indigo-200/60">
                    <span>Total Amount Payable:</span>
                    <span>₹51,318.20</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3-Inch Thermal Receipt Ready</span>
                  </span>
                  <span className="text-indigo-600 font-mono">/public/bills/INV-2026-9042</span>
                </div>
              </div>
            )}

            {activeTabId === 'tax-engine' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Automated Tax Evaluator</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    STATE MATCH VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Store State</span>
                    <div className="font-black text-slate-800 text-sm">27 - Maharashtra</div>
                    <span className="text-[10px] text-emerald-600 font-bold">GSTIN Validated</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Customer State</span>
                    <div className="font-black text-slate-800 text-sm">27 - Maharashtra</div>
                    <span className="text-[10px] text-indigo-600 font-bold">Same State Identified</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-indigo-300">
                    <span>Applied Tax Rules</span>
                    <span className="text-[10px] bg-indigo-500/30 px-2 py-0.5 rounded border border-indigo-400/40">CGST + SGST SPLIT</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Central GST (CGST 9%):</span>
                    <span className="font-extrabold text-white">₹3,914.10</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>State GST (SGST 9%):</span>
                    <span className="font-extrabold text-white">₹3,914.10</span>
                  </div>
                </div>
              </div>
            )}

            {activeTabId === 'multi-catalog' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Catalog & Warranty Hierarchy</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    RULES INHERITED
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Master Category</span>
                      <div className="font-black text-slate-900">Consumer Electronics</div>
                    </div>
                    <span className="text-[10px] font-bold bg-white px-2.5 py-1 rounded border border-slate-200">Default GST: 18%</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white ml-4 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-sky-600 uppercase">Sub-Category</span>
                      <div className="font-extrabold text-slate-800">Laptops & Accessories</div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200">
                      Warranty: 24 Months
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTabId === 'ca-audit' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">CA Audit Return Package</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    READY FOR EXPORT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Output Sales Tax</span>
                    <div className="text-lg font-black text-indigo-900">₹1,48,200</div>
                    <div className="text-[10px] text-slate-500">GSTR-1 Sales Invoices</div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Input ITC Claimed</span>
                    <div className="text-lg font-black text-teal-900">₹94,500</div>
                    <div className="text-[10px] text-slate-500">Purchase Bills Ledger</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold">Net GST Payable (Sales - ITC):</div>
                    <div className="text-xs text-slate-400 font-mono">HSN Code 8471 aggregated</div>
                  </div>
                  <div className="text-base font-black text-emerald-400">
                    ₹53,700.00
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </section>
  );
};

export default LandingProductShowcase;
