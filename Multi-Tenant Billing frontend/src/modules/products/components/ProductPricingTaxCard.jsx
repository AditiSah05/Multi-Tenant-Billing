import React from 'react';
import { Tag, Info, Calculator, Percent, Sparkles, CheckCircle2 } from 'lucide-react';

const ProductPricingTaxCard = ({ formData, onInputChange }) => {
  const purchasePrice = Number(formData.purchasePrice) || 0;
  const sellingPrice = Number(formData.sellingPrice) || 0;
  const mrp = Number(formData.mrp) || 0;
  const taxType = formData.taxType || 'GST';
  const taxMode = formData.taxMode || 'INCLUSIVE'; // 'INCLUSIVE' or 'EXCLUSIVE'
  const taxPercent = taxType === 'GST' ? (Number(formData.taxPercent) || 0) : 0;
  const discountPercent = Number(formData.discountPercent) || 0;

  // Discount Calculation on Selling Price
  const discountAmount = discountPercent > 0 ? (sellingPrice * discountPercent) / 100 : 0;
  const effectiveSellingPrice = Math.max(0, sellingPrice - discountAmount);

  const isInclusive = taxMode === 'INCLUSIVE';

  // 1. MRP Tax-Cut Base Price & Tax
  let baseMrp = mrp;
  let mrpTaxAmount = 0;
  if (mrp > 0 && taxPercent > 0) {
    if (isInclusive) {
      baseMrp = mrp / (1 + taxPercent / 100);
      mrpTaxAmount = mrp - baseMrp;
    } else {
      baseMrp = mrp;
      mrpTaxAmount = (mrp * taxPercent) / 100;
    }
  }

  // 2. Purchase Price Tax-Cut Base Cost & Tax
  let basePurchasePrice = purchasePrice;
  let purchaseTaxAmount = 0;
  if (purchasePrice > 0 && taxPercent > 0) {
    if (isInclusive) {
      basePurchasePrice = purchasePrice / (1 + taxPercent / 100);
      purchaseTaxAmount = purchasePrice - basePurchasePrice;
    } else {
      basePurchasePrice = purchasePrice;
      purchaseTaxAmount = (purchasePrice * taxPercent) / 100;
    }
  }

  // 3. Selling Price Tax-Cut Base Revenue & Tax
  let baseSellingPrice = effectiveSellingPrice;
  let sellingTaxAmount = 0;
  let finalCustomerPrice = effectiveSellingPrice;

  if (effectiveSellingPrice > 0) {
    if (isInclusive) {
      baseSellingPrice = taxPercent > 0 ? effectiveSellingPrice / (1 + taxPercent / 100) : effectiveSellingPrice;
      sellingTaxAmount = effectiveSellingPrice - baseSellingPrice;
      finalCustomerPrice = effectiveSellingPrice;
    } else {
      baseSellingPrice = effectiveSellingPrice;
      sellingTaxAmount = taxPercent > 0 ? (effectiveSellingPrice * taxPercent) / 100 : 0;
      finalCustomerPrice = effectiveSellingPrice + sellingTaxAmount;
    }
  }

  const cgstAmount = sellingTaxAmount / 2;
  const sgstAmount = sellingTaxAmount / 2;

  // 4. Tax-Deducted Real Net Profit (Tax Cut Karke)
  // Net Tax-Free Profit = Base Selling Price (Excl. Tax) - Base Purchase Price (Excl. Tax)
  const netTaxDeductedProfit = baseSellingPrice > 0 && basePurchasePrice > 0 ? baseSellingPrice - basePurchasePrice : 0;
  const taxDeductedProfitMargin = basePurchasePrice > 0 ? ((netTaxDeductedProfit / basePurchasePrice) * 100).toFixed(2) : '0.00';
  const mrpDiscountAmount = mrp > finalCustomerPrice ? mrp - finalCustomerPrice : 0;

  // Quick Margin Preset Helper
  const handleApplyMargin = (marginPct) => {
    if (!purchasePrice) return;
    const calculatedSelling = (purchasePrice * (1 + marginPct / 100)).toFixed(2);
    onInputChange({
      target: {
        name: 'sellingPrice',
        value: calculatedSelling,
        type: 'number',
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Tag size={18} />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Pricing & Tax Information</h2>
        </div>
        <span className="text-[11px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 size={13} /> Tax-Deducted Profit Engine
        </span>
      </div>

      <div className="space-y-5 text-xs font-bold text-slate-700">
        {/* ========================================== */}
        {/* SECTION 1: TAX MODE, TAX TYPE & GST RATE  */}
        {/* ========================================== */}
        <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-4">
          <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/70 pb-2">
            <Percent size={15} className="text-indigo-600" />
            <span>Step 1: Set Tax Mode, Type & GST Rate</span>
          </div>

          {/* 1. Tax Calculation Mode (Placed at the VERY TOP) */}
          <div className="space-y-2 pb-1">
            <label className="block uppercase text-[11px] font-extrabold text-slate-700 tracking-wider">
              Tax Calculation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Tax Inclusive */}
              <label
                onClick={() => {
                  if (taxType === 'GST') {
                    onInputChange({ target: { name: 'taxMode', value: 'INCLUSIVE' } });
                  }
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  taxMode === 'INCLUSIVE'
                    ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                } ${taxType !== 'GST' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="taxMode"
                  value="INCLUSIVE"
                  checked={taxMode === 'INCLUSIVE'}
                  onChange={onInputChange}
                  disabled={taxType !== 'GST'}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="font-extrabold text-xs flex items-center gap-2">
                    <span className="text-slate-900">Tax Inclusive</span>
                    {taxMode === 'INCLUSIVE' && (
                      <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                    Entered prices ALREADY INCLUDE GST ({taxPercent}%).
                  </div>
                </div>
              </label>

              {/* Option 2: Tax Exclusive */}
              <label
                onClick={() => {
                  if (taxType === 'GST') {
                    onInputChange({ target: { name: 'taxMode', value: 'EXCLUSIVE' } });
                  }
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  taxMode === 'EXCLUSIVE'
                    ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                } ${taxType !== 'GST' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="taxMode"
                  value="EXCLUSIVE"
                  checked={taxMode === 'EXCLUSIVE'}
                  onChange={onInputChange}
                  disabled={taxType !== 'GST'}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="font-extrabold text-xs flex items-center gap-2">
                    <span className="text-slate-900">Tax Exclusive</span>
                    {taxMode === 'EXCLUSIVE' && (
                      <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                    GST ({taxPercent}%) will be ADDED EXTRA on top of entered prices.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Tax Type & GST Rate Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/70 pt-3">
            {/* Tax Type */}
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
                Tax Type
              </label>
              <select
                name="taxType"
                value={taxType}
                onChange={onInputChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="GST">GST Applicable</option>
                <option value="Non-GST">Non-GST</option>
                <option value="Exempted">Exempted / Zero Tax</option>
              </select>
            </div>

            {/* GST Rate (%) */}
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
                GST Rate (%) <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Custom or select)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="taxPercent"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={taxType !== 'GST'}
                  value={taxType === 'GST' ? (formData.taxPercent ?? '') : 0}
                  onChange={onInputChange}
                  placeholder="e.g. 18 or 12 or 5"
                  className={`w-full pl-3.5 pr-8 py-2.5 border rounded-xl font-extrabold focus:outline-none transition-colors ${
                    taxType === 'GST'
                      ? 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>

              {/* Quick Preset Buttons */}
              {taxType === 'GST' && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold">Presets:</span>
                  {[0, 3, 5, 12, 18, 28].map((rate) => {
                    const isSelected = Number(formData.taxPercent) === rate;
                    return (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => {
                          onInputChange({
                            target: { name: 'taxPercent', value: rate, type: 'number' },
                          });
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {rate}%
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 2: MRP, PURCHASE, SELLING & DISCOUNT */}
        {/* ========================================== */}
        <div className="space-y-4">
          <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Tag size={15} className="text-indigo-600" />
            <span>Step 2: Enter Product Prices & Customer Discount</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MRP (Maximum Retail Price) */}
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
                MRP (₹) <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Maximum Retail Price)</span>
              </label>
              <input
                type="number"
                name="mrp"
                step="0.01"
                min="0"
                value={formData.mrp ?? ''}
                onChange={onInputChange}
                placeholder="e.g. 500.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {/* Dynamic Base Price Display under MRP */}
              {mrp > 0 && taxPercent > 0 && (
                <div className="mt-1.5 px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between text-[10px] text-indigo-900 font-extrabold">
                  <span>{isInclusive ? `Taxable Base: ₹${baseMrp.toFixed(2)}` : `Taxable MRP: ₹${mrp.toFixed(2)}`}</span>
                  <span className="text-indigo-600">{isInclusive ? `GST Included (${taxPercent}%): ₹${mrpTaxAmount.toFixed(2)}` : `GST Extra (${taxPercent}%): ₹${mrpTaxAmount.toFixed(2)}`}</span>
                </div>
              )}
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
                <span>Purchase Price (₹)</span>
                <span className="text-[10px] text-indigo-600 font-extrabold">Per {formData.unit || 'Pcs'}</span>
              </label>
              <input
                type="number"
                name="purchasePrice"
                step="0.01"
                min="0"
                value={formData.purchasePrice ?? ''}
                onChange={(e) => {
                  onInputChange(e);
                  if (formData.hasSecondaryUnit && (Number(formData.conversionFactor) || 1) > 0) {
                    const baseVal = Number(e.target.value) || 0;
                    const factor = Number(formData.conversionFactor) || 1;
                    onInputChange({
                      target: {
                        name: 'secondaryPurchasePrice',
                        value: (baseVal * factor).toFixed(2),
                      },
                    });
                  }
                }}
                placeholder={`Cost price per ${formData.unit || 'Pcs'}`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {/* Dynamic Base Price Display under Purchase Price */}
              {purchasePrice > 0 && taxPercent > 0 && (
                <div className="mt-1.5 px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between text-[10px] text-indigo-900 font-extrabold">
                  <span>{isInclusive ? `Taxable Cost: ₹${basePurchasePrice.toFixed(2)}` : `Taxable Cost: ₹${purchasePrice.toFixed(2)}`}</span>
                  <span className="text-indigo-600">{isInclusive ? `GST Included (${taxPercent}%): ₹${purchaseTaxAmount.toFixed(2)}` : `GST Extra (${taxPercent}%): ₹${purchaseTaxAmount.toFixed(2)}`}</span>
                </div>
              )}
            </div>

            {/* Secondary Unit Bulk Purchase Price (if enabled) */}
            {formData.hasSecondaryUnit && (
              <div className="sm:col-span-2">
                <label className="block mb-1 uppercase text-[11px] font-extrabold text-indigo-900 flex items-center justify-between">
                  <span>Bulk Purchase Price (₹)</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded">
                    Per {formData.secondaryUnit || 'Box'}
                  </span>
                </label>
                <input
                  type="number"
                  name="secondaryPurchasePrice"
                  step="0.01"
                  min="0"
                  value={formData.secondaryPurchasePrice ?? ''}
                  onChange={(e) => {
                    onInputChange(e);
                    const bulkVal = Number(e.target.value) || 0;
                    const factor = Number(formData.conversionFactor) || 1;
                    if (factor > 0) {
                      onInputChange({
                        target: {
                          name: 'purchasePrice',
                          value: (bulkVal / factor).toFixed(2),
                        },
                      });
                    }
                  }}
                  placeholder={`e.g. 500 per ${formData.secondaryUnit || 'Box'}`}
                  className="w-full px-3.5 py-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-indigo-950 font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {Number(formData.secondaryPurchasePrice) > 0 && (Number(formData.conversionFactor) || 1) > 0 && (
                  <div className="mt-1.5 px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between text-[10px] text-indigo-900 font-extrabold">
                    <span>Derived Cost per {formData.unit || 'Pcs'}: ₹{(Number(formData.secondaryPurchasePrice) / (Number(formData.conversionFactor) || 1)).toFixed(2)}</span>
                    <span className="text-indigo-600">1 {formData.secondaryUnit || 'Box'} = {formData.conversionFactor || 1} {formData.unit || 'Pcs'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Selling Price */}
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
                <span>Selling Price (₹) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-indigo-600 font-extrabold">Per {formData.unit || 'Pcs'}</span>
              </label>
              <input
                type="number"
                name="sellingPrice"
                step="0.01"
                min="0"
                value={formData.sellingPrice ?? ''}
                onChange={onInputChange}
                placeholder={`Sale price per ${formData.unit || 'Pcs'}`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              {/* Dynamic Base Price Display under Selling Price */}
              {sellingPrice > 0 && taxPercent > 0 && (
                <div className="mt-1.5 px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between text-[10px] text-indigo-900 font-extrabold">
                  <span>{isInclusive ? `Taxable Sale: ₹${baseSellingPrice.toFixed(2)}` : `Taxable Sale: ₹${sellingPrice.toFixed(2)}`}</span>
                  <span className="text-indigo-600">{isInclusive ? `GST Included (${taxPercent}%): ₹${sellingTaxAmount.toFixed(2)}` : `GST Extra (${taxPercent}%): ₹${sellingTaxAmount.toFixed(2)}`}</span>
                </div>
              )}
            </div>

            {/* Discount (%) */}
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
                Customer Discount (%) <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountPercent"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discountPercent ?? ''}
                  onChange={onInputChange}
                  placeholder="e.g. 5 or 10"
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Margin Presets Helper when Purchase Price is set */}
      {purchasePrice > 0 && (
        <div className="p-3 bg-indigo-50/60 border border-indigo-100/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-extrabold text-indigo-900">
            <Sparkles size={15} className="text-indigo-600" />
            <span>Quick Margin Presets:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[10, 20, 25, 30, 50].map((margin) => (
              <button
                key={margin}
                type="button"
                onClick={() => handleApplyMargin(margin)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold border border-indigo-200 rounded-lg text-[11px] transition-all cursor-pointer shadow-2xs"
              >
                +{margin}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REAL-TIME TAX & PROFIT BREAKDOWN SUMMARY BAR */}
      {/* ========================================================= */}
      {(effectiveSellingPrice > 0 || purchasePrice > 0) && (
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 font-semibold text-xs animate-fadeIn">
          <div className="flex items-center justify-between text-slate-800 font-extrabold pb-2 border-b border-slate-200/70">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Calculator size={16} /> Summary & Net Profit
            </span>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 font-extrabold">
              {taxType === 'GST' ? `${taxPercent}% GST (${isInclusive ? 'Inclusive' : 'Exclusive'})` : taxType}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Base Cost</span>
              <span className="text-slate-900 font-extrabold text-xs">₹{basePurchasePrice.toFixed(2)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Base Sale</span>
              <span className="text-slate-900 font-extrabold text-xs">₹{baseSellingPrice.toFixed(2)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">GST ({taxPercent}%)</span>
              <span className="text-indigo-600 font-extrabold text-xs">₹{sellingTaxAmount.toFixed(2)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Customer Price</span>
              <span className="text-slate-900 font-extrabold text-xs">₹{finalCustomerPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* NET PROFIT BAR */}
          {purchasePrice > 0 && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-emerald-950">Net Profit (After Tax):</span>
              <div className="flex items-center gap-2">
                <span className={`text-base font-black ${netTaxDeductedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  ₹{netTaxDeductedProfit.toFixed(2)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${netTaxDeductedProfit >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {netTaxDeductedProfit >= 0 ? '+' : ''}{taxDeductedProfitMargin}% Margin
                </span>
              </div>
            </div>
          )}

          {mrpDiscountAmount > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>Customer MRP Discount:</span>
              <span className="font-extrabold text-indigo-600">₹{mrpDiscountAmount.toFixed(2)} OFF</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPricingTaxCard;
