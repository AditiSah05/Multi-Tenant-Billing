import React from 'react';
import { Package } from 'lucide-react';

const ProductInventoryCard = ({ formData, onInputChange }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Package size={18} />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">Inventory Information</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
            <span>Opening Stock / Quantity</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold border border-indigo-100 uppercase">
              In {formData.unit || 'Nos'}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="openingStock"
              min="0"
              value={formData.openingStock ?? ''}
              onChange={onInputChange}
              placeholder={`e.g. 500 ${formData.unit || 'Pcs'}`}
              className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs">
              {formData.unit || 'Nos'}
            </span>
          </div>
          {formData.hasSecondaryUnit && Number(formData.conversionFactor) > 1 && (
            <div className="mt-1.5 text-[11px] text-indigo-700 font-extrabold bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span>Equivalent Bulk Stock:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-900 font-extrabold">
                {(Number(formData.openingStock || 0) / Number(formData.conversionFactor || 1)).toFixed(1)} {formData.secondaryUnit || 'Box'}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
            <span>Maximum Stock Level</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{formData.unit || 'Nos'}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="maxStockLevel"
              min="0"
              value={formData.maxStockLevel ?? ''}
              onChange={onInputChange}
              placeholder="0"
              className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {formData.unit || 'Nos'}
            </span>
          </div>
        </div>

        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
            <span>Minimum Stock Level</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{formData.unit || 'Nos'}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="minStockLevel"
              min="0"
              value={formData.minStockLevel ?? ''}
              onChange={onInputChange}
              placeholder="0"
              className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {formData.unit || 'Nos'}
            </span>
          </div>
        </div>

        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
            <span>Stock Alert Quantity</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{formData.unit || 'Nos'}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="stockAlertQuantity"
              min="0"
              value={formData.stockAlertQuantity ?? ''}
              onChange={onInputChange}
              placeholder="0"
              className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {formData.unit || 'Nos'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="enableStockAlert"
            checked={!!formData.enableStockAlert}
            onChange={(e) => onInputChange({ target: { name: 'enableStockAlert', value: e.target.checked } })}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-xs font-extrabold text-slate-900">Enable stock alert</span>
            <p className="text-[11px] text-slate-400 font-semibold">Get notified when stock goes below minimum level</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ProductInventoryCard;
