import { Info, Upload, QrCode, Calendar, Layers, Settings, ShieldCheck } from 'lucide-react';
import BrandSelectInput from './BrandSelectInput';
import UnitSelectInput from './UnitSelectInput';

const ProductBasicInfoCard = ({
  formData,
  onInputChange,
  additionalValues = {},
  onAdditionalValueChange,
  categories = [],
  subCategories = [],
  brands = ['Dell', 'HP', 'Logitech', 'Zebronics', 'Canon', 'LG', 'SanDisk', 'boAt'],
  units = ['Pcs', 'Nos', 'Kg', 'Ltr', 'Box', 'Pack', 'Meter',],
  imagePreview,
  onImageChange,
  onScanBarcode,
}) => {
  const selectedSubCategory = subCategories.find((s) => s.id === formData.subCategoryId);
  const customFields = selectedSubCategory?.additionalFields || [];
  const enableExpiry = selectedSubCategory?.enableExpiryDate ?? false;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Info size={18} />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Span 2: Input fields */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
          <div className="sm:col-span-2">
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={onInputChange}
              placeholder="Enter product name"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block uppercase text-[11px] font-extrabold text-slate-700">
                SKU <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Stock Keeping Unit)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  let prefix = 'SKU';
                  if (formData.name && formData.name.trim()) {
                    const words = formData.name.trim().split(/\s+/);
                    const initials = words.map(w => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
                    if (initials.length >= 2) prefix = `SKU-${initials}`;
                  }
                  const randomNum = Math.floor(100000 + Math.random() * 900000);
                  const generatedSku = `${prefix}-${randomNum}`;
                  onInputChange({ target: { name: 'sku', value: generatedSku } });
                }}
                className="text-[11px] text-indigo-600 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                title="Auto Generate SKU"
              >
                <Settings size={13} className="text-indigo-600 animate-spin-slow" />
                <span>Auto Generate SKU</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                name="sku"
                value={formData.sku || ''}
                onChange={onInputChange}
                onBlur={(e) => onInputChange({ target: { name: 'sku', value: (e.target.value || '').toUpperCase() } })}
                placeholder="Enter SKU or click settings icon to generate"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  let prefix = 'SKU';
                  if (formData.name && formData.name.trim()) {
                    const words = formData.name.trim().split(/\s+/);
                    const initials = words.map(w => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
                    if (initials.length >= 2) prefix = `SKU-${initials}`;
                  }
                  const randomNum = Math.floor(100000 + Math.random() * 900000);
                  const generatedSku = `${prefix}-${randomNum}`;
                  onInputChange({ target: { name: 'sku', value: generatedSku } });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Click to Auto-generate SKU"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
              HSN / SAC Code <span className="text-rose-500">*</span> <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(GST Tax Classification Code)</span>
            </label>
            <input
              type="text"
              name="hsnCode"
              value={formData.hsnCode ?? formData.hsn ?? ''}
              onChange={onInputChange}
              placeholder="e.g. 0405, 8517, 1905"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={onInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none cursor-pointer"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
              Sub Category <span className="text-slate-400 font-normal text-[10px] normal-case ml-1">(Optional)</span>
            </label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId || ''}
              onChange={onInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="">Select sub category</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <BrandSelectInput
            value={formData.brand || ''}
            onChange={onInputChange}
            brandsList={brands}
          />

          <UnitSelectInput
            value={formData.unit ?? 'Nos'}
            onChange={onInputChange}
            unitsList={units}
          />

          {/* Multi-Unit Packaging System */}
          <div className="sm:col-span-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasSecondaryUnit"
                  checked={!!formData.hasSecondaryUnit}
                  onChange={(e) => onInputChange({ target: { name: 'hasSecondaryUnit', value: e.target.checked } })}
                  className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-black text-slate-900">Enable Multi-Unit Packaging</span>
                  <p className="text-[11px] text-slate-500 font-medium">e.g. Buy in Box / Carton, Sell in Pieces (Pcs)</p>
                </div>
              </label>
            </div>

            {formData.hasSecondaryUnit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-100/70 text-xs font-bold">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-extrabold text-indigo-900">
                    Bulk / Secondary Unit
                  </label>
                  <select
                    name="secondaryUnit"
                    value={formData.secondaryUnit || 'Box'}
                    onChange={onInputChange}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-900 font-extrabold focus:outline-none cursor-pointer"
                  >
                    {['Box', 'Carton', 'Case', 'Pack', 'Dozen', 'Bag', 'Tin', 'Container', 'Crate'].map((su) => (
                      <option key={su} value={su}>{su}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-extrabold text-indigo-900">
                    Conversion Factor (1 {formData.secondaryUnit || 'Box'} = ? {formData.unit || 'Pcs'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="conversionFactor"
                      min="1"
                      step="1"
                      value={formData.conversionFactor ?? 1}
                      onChange={onInputChange}
                      placeholder="e.g. 50"
                      className="w-full pl-3 pr-16 py-2 bg-white border border-indigo-200 rounded-xl text-slate-900 font-black focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 font-black text-[11px]">
                      {formData.unit || 'Pcs'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 p-2.5 bg-white border border-indigo-200/80 rounded-xl text-[11px] text-indigo-900 font-medium flex items-center gap-2">
                  <span className="font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] uppercase shrink-0">Rule</span>
                  <span>
                    1 {formData.secondaryUnit || 'Box'} contains <strong>{formData.conversionFactor || 1} {formData.unit || 'Pcs'}</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
              <span>Opening Quantity</span>
              <span className="text-[10px] text-indigo-600 font-extrabold">(Initial Stock)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="openingStock"
                min="0"
                value={formData.openingStock ?? ''}
                onChange={onInputChange}
                placeholder={`0 ${formData.unit || 'Nos'}`}
                className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs">
                {formData.unit || 'Nos'}
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
              <span>Low Stock Alert Limit</span>
              <span className="text-[10px] text-amber-600 font-extrabold">(Alert Limit)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="minStockLevel"
                min="0"
                value={formData.minStockLevel ?? ''}
                onChange={onInputChange}
                placeholder="e.g. 5"
                className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs">
                {formData.unit || 'Nos'}
              </span>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="sm:col-span-2">
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description || ''}
              onChange={onInputChange}
              placeholder="Enter product description or specifications..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none"
            ></textarea>
          </div>

          {/* Product Warranty Management */}
          <div className="sm:col-span-2 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900">Enable Product Warranty</span>
                  <p className="text-[11px] text-slate-500 font-medium">Specify warranty period and terms for customers</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="hasWarranty"
                  checked={!!formData.hasWarranty}
                  onChange={(e) => onInputChange({ target: { name: 'hasWarranty', value: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {formData.hasWarranty && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-100 text-xs font-bold">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-extrabold text-slate-700">
                    Warranty Period
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod ?? '12'}
                    onChange={onInputChange}
                    placeholder="12"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-extrabold text-slate-700">
                    Warranty Unit
                  </label>
                  <select
                    name="warrantyUnit"
                    value={formData.warrantyUnit || 'MONTHS'}
                    onChange={onInputChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:outline-none cursor-pointer"
                  >
                    <option value="DAYS">Days</option>
                    <option value="MONTHS">Months</option>
                    <option value="YEARS">Years</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1 uppercase text-[10px] font-extrabold text-slate-700">
                    Warranty Terms & Conditions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="warrantyTerms"
                    rows="2"
                    value={formData.warrantyTerms || ''}
                    onChange={onInputChange}
                    placeholder="e.g. 1 Year Brand Warranty / Onsite Replacement"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Optional Expiry Date Picker if enabled or generic */}
          {enableExpiry && (
            <div className="sm:col-span-2">
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                onChange={onInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {/* Dynamic Sub-Category Fields */}
          {customFields.length > 0 && (
            <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} />
                <span>Sub-Category Custom Fields</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customFields.map((field) => (
                  <div key={field.id || field.labelName}>
                    <label className="block mb-1 uppercase text-[10px] font-extrabold text-slate-600">
                      {field.labelName} {field.isRequired && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                      value={additionalValues[field.labelName] || ''}
                      onChange={(e) => onAdditionalValueChange && onAdditionalValueChange(field.labelName, e.target.value)}
                      placeholder={`Enter ${field.labelName}`}
                      className="w-full px-3 py-2 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                      required={field.isRequired}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Span 1: Product Image Box */}
        <div className="flex flex-col justify-start space-y-2">
          <label className="block uppercase text-[11px] font-extrabold text-slate-700">Product Image</label>
          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[220px] relative group cursor-pointer">
            {imagePreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={imagePreview} alt="Product Preview" className="max-h-40 object-contain rounded-xl" />
                <button
                  type="button"
                  onClick={() => onImageChange(null)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <Upload size={22} />
                </div>
                <div className="text-xs font-extrabold text-indigo-600">Upload Product image</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1">JPG, PNG or WEBP (Max. 2MB)</div>
                <label className="mt-4 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-xl hover:bg-indigo-100 cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onImageChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBasicInfoCard;
