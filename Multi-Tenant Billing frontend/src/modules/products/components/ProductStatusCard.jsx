import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const ProductStatusCard = ({ status = 'ACTIVE', onStatusChange }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <ShieldCheck size={18} />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">Product Status</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Radio Options */}
        <div className="space-y-4">
          <label className="block uppercase text-[11px] font-extrabold text-slate-700">
            Status <span className="text-rose-500">*</span>
          </label>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={status === 'ACTIVE'}
                onChange={() => onStatusChange('ACTIVE')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-extrabold text-slate-900">Active</div>
                <div className="text-[11px] text-slate-400 font-semibold">Product will be available for purchase and sale</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="status"
                value="INACTIVE"
                checked={status === 'INACTIVE'}
                onChange={() => onStatusChange('INACTIVE')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-extrabold text-slate-900">Inactive</div>
                <div className="text-[11px] text-slate-400 font-semibold">Product will be inactive and hidden</div>
              </div>
            </label>
          </div>
        </div>

        {/* Status Callout Banner matching Screenshot 1 */}
        <div>
          {status === 'ACTIVE' ? (
            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Active Product</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                Active products are visible in purchase, sales and inventory modules.
              </p>
            </div>
          ) : (
            <div className="p-5 bg-slate-100 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-extrabold text-xs">
                <ShieldCheck size={18} className="text-slate-500" />
                <span>Inactive Product</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Inactive products will be hidden from new purchase bills and billing screens.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductStatusCard;
