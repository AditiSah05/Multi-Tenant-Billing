import React, { useState } from 'react';
import {
  X,
  Package,
  Tag,
  IndianRupee,
  CheckCircle2,
  Loader2,
  Settings,
} from 'lucide-react';
import { useCreateProductMutation, useCategoriesQuery } from '../hooks/useProductsQueries';
import { useToast } from '../../../context/ToastContext';
import BrandSelectInput from './BrandSelectInput';
import UnitSelectInput from './UnitSelectInput';

const units = ['Nos', 'Pcs', 'Kg', 'Ltr', 'Box', 'Pack', 'Ream', 'Meter', 'Set'];

const AddProductModal = ({ isOpen, onClose, onSaveProduct, toast: toastProp }) => {
  const toastContext = useToast();
  const activeToast = toastProp || toastContext;

  const { data: categoryRes } = useCategoriesQuery();
  const createProductMutation = useCreateProductMutation();

  const categories = Array.isArray(categoryRes?.categories)
    ? categoryRes.categories
    : Array.isArray(categoryRes?.data?.categories)
      ? categoryRes.data.categories
      : Array.isArray(categoryRes?.data)
        ? categoryRes.data
        : [];

  const [formData, setFormData] = useState({
    name: '',
    sku: `SKU-${Date.now().toString().slice(-6)}`,
    brand: '',
    categoryId: '',
    purchasePrice: '',
    sellingPrice: '',
    openingStock: '0',
    minStockLevel: '5',
    unit: 'Nos',
    hasSecondaryUnit: false,
    secondaryUnit: 'Box',
    conversionFactor: '1',
    secondaryPurchasePrice: '',
    description: '',
    taxPercent: '18',
    taxMode: 'INCLUSIVE'
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (activeToast) activeToast.error('Product name is required.');
      return;
    }
    if (!formData.hsnCode || !formData.hsnCode.trim()) {
      if (activeToast) activeToast.error('HSN / SAC Code is required.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === formData.categoryId) || categories[0];
    const subCat = selectedCategory?.subCategories?.[0] || {};

    const generatedSku = `SKU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalSku = formData.sku && formData.sku.trim() ? formData.sku.trim() : generatedSku;

    const parsedStock = parseInt(formData.openingStock || '0', 10);
    const hasSec = Boolean(formData.hasSecondaryUnit);
    const factor = parseFloat(formData.conversionFactor || '1') || 1;

    const payload = {
      name: formData.name,
      sku: finalSku,
      hsnCode: formData.hsnCode.trim(),
      hsn: formData.hsnCode.trim(),
      brand: formData.brand || undefined,
      categoryId: selectedCategory?.id || formData.categoryId || undefined,
      subCategoryId: subCat?.id || undefined,
      purchasePrice: parseFloat(formData.purchasePrice || formData.sellingPrice || '0'),
      sellingPrice: parseFloat(formData.sellingPrice || formData.purchasePrice || '0'),
      hasSecondaryUnit: hasSec,
      secondaryUnit: hasSec ? (formData.secondaryUnit || 'Box') : null,
      conversionFactor: hasSec ? factor : 1,
      secondaryPurchasePrice: hasSec ? (parseFloat(formData.secondaryPurchasePrice || '0') || null) : null,
      openingStock: parsedStock,
      currentStock: parsedStock,
      minStockLevel: parseInt(formData.minStockLevel || '0', 10),
      unit: formData.unit,
      description: formData.description,
      taxPercent: parseFloat(formData.taxPercent || '18'),
      taxRate: parseFloat(formData.taxPercent || '18'),
      taxType: formData.taxMode || 'INCLUSIVE',
      taxMode: formData.taxMode || 'INCLUSIVE',
      isTaxInclusive: formData.taxMode === 'INCLUSIVE',
      status: 'ACTIVE'
    };

    try {
      const res = await createProductMutation.mutateAsync(payload);
      const newProduct = res?.data || res?.product || res;
      if (activeToast) activeToast.success(`Product "${formData.name}" created successfully!`);
      if (onSaveProduct) {
        onSaveProduct(newProduct || payload);
      }
      onClose();
    } catch (err) {
      if (activeToast) activeToast.error(err?.response?.data?.message || err?.message || 'Failed to create product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              <p className="text-xs text-slate-500">Create a catalog item for purchase and inventory tracking</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. HP LaserJet Printer"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
            />
          </div>

          {/* SKU, HSN, Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SKU
                </label>
                <button
                  type="button"
                  onClick={() => {
                    let prefix = 'SKU';
                    if (formData.name && formData.name.trim()) {
                      const words = formData.name.trim().split(/\s+/);
                      const initials = words.map(w => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                      if (initials.length >= 2) prefix = `SKU-${initials}`;
                    }
                    const randomNum = Math.floor(100000 + Math.random() * 900000);
                    handleChange('sku', `${prefix}-${randomNum}`);
                  }}
                  className="text-[10px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                  title="Auto Generate SKU"
                >
                  <Settings size={12} />
                  <span>Auto</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="SKU"
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    let prefix = 'SKU';
                    if (formData.name && formData.name.trim()) {
                      const words = formData.name.trim().split(/\s+/);
                      const initials = words.map(w => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                      if (initials.length >= 2) prefix = `SKU-${initials}`;
                    }
                    const randomNum = Math.floor(100000 + Math.random() * 900000);
                    handleChange('sku', `${prefix}-${randomNum}`);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                  title="Auto Generate SKU"
                >
                  <Settings size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                HSN / SAC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.hsnCode || ''}
                onChange={(e) => handleChange('hsnCode', e.target.value)}
                placeholder="e.g. 0405, 8517"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <BrandSelectInput
              value={formData.brand || ''}
              onChange={(e) => handleChange('brand', e.target.value)}
            />
          </div>

          {/* Purchase Price, Selling Price, Unit & Opening Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Price (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  placeholder="500.00"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', e.target.value)}
                  placeholder="750.00"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <UnitSelectInput
              value={formData.unit ?? 'Nos'}
              onChange={(e) => handleChange('unit', e.target.value)}
              unitsList={units}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity / Stock
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formData.openingStock}
                  onChange={(e) => handleChange('openingStock', e.target.value)}
                  placeholder="0"
                  className="w-full pl-3 pr-11 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-[11px]">
                  {formData.unit || 'Nos'}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Unit Packaging System */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.hasSecondaryUnit}
                onChange={(e) => handleChange('hasSecondaryUnit', e.target.checked)}
                className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-900">Enable Bulk / Secondary Packaging (e.g. 1 Box = 50 Pcs)</span>
            </label>

            {formData.hasSecondaryUnit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">Secondary Unit</label>
                  <select
                    value={formData.secondaryUnit}
                    onChange={(e) => handleChange('secondaryUnit', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900 outline-none"
                  >
                    {['Box', 'Carton', 'Case', 'Pack', 'Dozen', 'Bag', 'Tin'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                    Conversion (1 {formData.secondaryUnit || 'Box'} = ? {formData.unit || 'Pcs'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.conversionFactor}
                    onChange={(e) => handleChange('conversionFactor', e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* GST, Tax Mode & Min Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                GST Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxPercent}
                  onChange={(e) => handleChange('taxPercent', e.target.value)}
                  placeholder="18"
                  className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {[0, 3, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleChange('taxPercent', rate.toString())}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${Number(formData.taxPercent) === rate
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tax Calculation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => handleChange('taxMode', 'INCLUSIVE')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${formData.taxMode === 'INCLUSIVE'
                    ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 font-extrabold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-semibold'
                    }`}
                >
                  <input
                    type="radio"
                    name="modalTaxMode"
                    value="INCLUSIVE"
                    checked={formData.taxMode === 'INCLUSIVE'}
                    onChange={() => handleChange('taxMode', 'INCLUSIVE')}
                    className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-xs truncate">
                    <span>Tax Inclusive</span>
                    <span className="block text-[10px] text-slate-400 font-normal">GST in Price</span>
                  </div>
                </label>

                <label
                  onClick={() => handleChange('taxMode', 'EXCLUSIVE')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${formData.taxMode === 'EXCLUSIVE'
                    ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 font-extrabold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-semibold'
                    }`}
                >
                  <input
                    type="radio"
                    name="modalTaxMode"
                    value="EXCLUSIVE"
                    checked={formData.taxMode === 'EXCLUSIVE'}
                    onChange={() => handleChange('taxMode', 'EXCLUSIVE')}
                    className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-xs truncate">
                    <span>Tax Exclusive</span>
                    <span className="block text-[10px] text-slate-400 font-normal">GST Added Extra</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Low Stock Limit
              </label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleChange('minStockLevel', e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving Product...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Save & Select Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
