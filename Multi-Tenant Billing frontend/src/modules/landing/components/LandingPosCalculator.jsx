import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Globe2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

const HSN_PRESETS = [
  { name: 'Electronics / Laptops', hsn: '8471', price: 45000, tax: 18 },
  { name: 'Mobile Handsets', hsn: '8517', price: 18000, tax: 18 },
  { name: 'Packaged Grocery', hsn: '1001', price: 1500, tax: 5 },
  { name: 'Luxury Goods / AC', hsn: '8415', price: 32000, tax: 28 }
];

export const LandingPosCalculator = ({ brandConfig, calcConfig }) => {
  const navigate = useNavigate();
  const [calcPrice, setCalcPrice] = useState(calcConfig.defaultPrice);
  const [calcTaxPercent, setCalcTaxPercent] = useState(calcConfig.defaultTaxPercent);
  const [calcStateType, setCalcStateType] = useState('INTRASTATE');
  const [discountPercent, setDiscountPercent] = useState(0);

  const rawPrice = parseFloat(calcPrice) || 0;
  const discountAmount = (rawPrice * (parseFloat(discountPercent) || 0)) / 100;
  const baseTaxable = Math.max(0, rawPrice - discountAmount);
  
  const totalTaxAmount = (baseTaxable * calcTaxPercent) / 100;
  const cgstAmount = calcStateType === 'INTRASTATE' ? totalTaxAmount / 2 : 0;
  const sgstAmount = calcStateType === 'INTRASTATE' ? totalTaxAmount / 2 : 0;
  const igstAmount = calcStateType === 'INTERSTATE' ? totalTaxAmount : 0;
  const grandTotal = baseTaxable + totalTaxAmount;

  const applyPreset = (preset) => {
    setCalcPrice(preset.price);
    setCalcTaxPercent(preset.tax);
  };

  return (
    <div className="mt-14 relative max-w-5xl mx-auto">
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-25"></div>
      
      <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-blue-500/15 overflow-hidden">
        
        {/* Top Mock Window Bar */}
        <div className="h-11 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div className="text-xs font-mono text-slate-500 flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-200 font-semibold">
            <Globe2 className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>{brandConfig.domainUrl}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-extrabold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>POS Tax Engine Active</span>
          </div>
        </div>

        {/* Interactive Live Tax Engine Calculator Widget */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/70">
          
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-5 space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-[#0284c7] font-extrabold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4" /> Live POS Tax Engine Simulator
            </div>

            {/* Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Quick HSN Presets</label>
              <div className="grid grid-cols-2 gap-1.5">
                {HSN_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-2 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 transition-all text-left flex flex-col cursor-pointer"
                  >
                    <span className="truncate text-slate-900">{preset.name}</span>
                    <span className="text-[9px] text-[#0284c7]">HSN {preset.hsn} • {preset.tax}%</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Header Disc (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  placeholder="Discount %"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select GST Slab %</label>
              <div className="grid grid-cols-4 gap-2">
                {calcConfig.taxSlabs.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCalcTaxPercent(pct)}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      calcTaxPercent === pct
                        ? 'bg-[#2563eb] text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Location Match</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcStateType('INTRASTATE')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                    calcStateType === 'INTRASTATE'
                      ? 'bg-[#2563eb] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Intrastate (CGST + SGST)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcStateType('INTERSTATE')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                    calcStateType === 'INTERSTATE'
                      ? 'bg-[#2563eb] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Interstate (IGST)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Tax Receipt Calculation Output */}
          <div className="lg:col-span-7 bg-[#0b132a] text-white p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">POS Bill Breakdown</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>12 MONTHS WARRANTY</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Gross Item Amount:</span>
                  <span className="font-bold text-white">₹{rawPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Header Discount ({discountPercent}%):</span>
                    </span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300 font-medium pt-1 border-t border-slate-800/60">
                  <span>Net Taxable Base Value:</span>
                  <span className="font-extrabold text-white">₹{baseTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {calcStateType === 'INTRASTATE' ? (
                  <>
                    <div className="flex justify-between text-indigo-300 font-medium pl-3 border-l-2 border-indigo-500">
                      <span>CGST ({calcTaxPercent / 2}%):</span>
                      <span className="font-extrabold">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-indigo-300 font-medium pl-3 border-l-2 border-indigo-500">
                      <span>SGST ({calcTaxPercent / 2}%):</span>
                      <span className="font-extrabold">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sky-300 font-medium pl-3 border-l-2 border-sky-500">
                    <span>IGST ({calcTaxPercent}%):</span>
                    <span className="font-extrabold">₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grand Total Invoice Payable</div>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Test Full POS Counter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default LandingPosCalculator;

