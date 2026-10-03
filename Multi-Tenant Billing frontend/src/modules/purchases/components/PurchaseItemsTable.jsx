import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Barcode, Trash2, Upload, Package } from 'lucide-react';

const PurchaseItemsTable = ({
  items = [],
  products = [],
  productSearchQuery,
  onProductSearchChange,
  onSelectProduct,
  onAddItemRow,
  onRemoveItemRow,
  onItemChange,
  onSelectProductInRow,
  onOpenProductModal,
  onScanBarcode,
  notes,
  onNotesChange,
  totalItemsCount,
  totalQuantityCount,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const queryLower = (productSearchQuery || '').trim().toLowerCase();
  const matches = queryLower
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          (p.sku && p.sku.toLowerCase().includes(queryLower)) ||
          (p.barcode && p.barcode.includes(queryLower)) ||
          ((p.hsnCode || p.hsn) && (p.hsnCode || p.hsn).toLowerCase().includes(queryLower))
      )
    : products;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Simple Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-900">Purchase Items</h2>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span>Total Items: <strong className="text-indigo-600 font-black">{totalItemsCount}</strong></span>
          <span>Total Qty: <strong className="text-indigo-600 font-black">{totalQuantityCount}</strong></span>
        </div>
      </div>

      {/* Product Autocomplete Bar & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1" ref={searchContainerRef}>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Click to view all products or search by name, SKU, HSN code..."
            value={productSearchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              onProductSearchChange(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-500 sticky top-0 z-10 backdrop-blur-md">
                <span>{queryLower ? `Search Results (${matches.length})` : `All Catalog Products (${products.length})`}</span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">
                  {matches.length} {matches.length === 1 ? 'product' : 'products'} available
                </span>
              </div>

              {matches.length === 0 ? (
                <div className="p-4 text-center space-y-2">
                  <div className="text-xs font-bold text-slate-600">
                    No product matching <span className="text-indigo-600 font-extrabold">"{productSearchQuery}"</span> in Catalog.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProductModal();
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add "{productSearchQuery}" to Product Catalog</span>
                  </button>
                </div>
              ) : (
                matches.map((product) => (
                  <div
                    key={product.id || product._id}
                    onClick={() => {
                      onSelectProduct(product);
                      setIsDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-indigo-50/70 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        SKU: {product.sku || 'N/A'} | <span className="text-indigo-600 font-bold">HSN: {product.hsnCode || product.hsn || 'N/A'}</span>
                        {product.unit ? ` | Unit: ${product.unit}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-indigo-600 text-sm">
                        ₹{(product.purchasePrice || product.sellingPrice || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {['INCLUSIVE', 'GST_INCLUSIVE', 'INCL', 'TRUE'].includes(String(product.taxType || product.taxMode || '').toUpperCase()) || product.isTaxInclusive ? 'Tax Incl.' : 'Tax Excl.'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenProductModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>

        <button
          type="button"
          onClick={onScanBarcode}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0"
        >
          <Barcode size={16} />
          <span>Scan Barcode</span>
        </button>
      </div>

      {/* Clean Light Desktop Items Table */}
      <div className="hidden md:block overflow-x-auto max-h-[380px] sm:max-h-[420px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl">
        <table className="w-full text-left border-collapse min-w-[850px] text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
            <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3">Product Name</th>
              <th className="py-3 px-3">SKU / HSN Code</th>
              <th className="py-3 px-3 w-24">Unit</th>
              <th className="py-3 px-3 w-20 text-center">Qty</th>
              <th className="py-3 px-3 w-32 text-right">Purchase Price (₹)</th>
              <th className="py-3 px-3 w-24 text-center">Disc (%)</th>
              <th className="py-3 px-3 w-24">Tax (GST)</th>
              <th className="py-3 px-3 w-28 text-right">Amount (₹)</th>
              <th className="py-3 px-3 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {items.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-slate-400">
                  No items added yet. Search product above or scan barcode to add items to bill.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>

                  <td className="py-3.5 px-3">
                    {(() => {
                      const targetProduct = products.find((p) => p.id === item.productId || p._id === item.productId);
                      const baseUnit = targetProduct?.unit || 'Pcs';
                      const isSec = Boolean(targetProduct?.hasSecondaryUnit && targetProduct?.secondaryUnit && item.unit === targetProduct?.secondaryUnit);
                      const conversionFactor = isSec ? (Number(targetProduct?.conversionFactor) || 1) : 1;
                      const baseQuantity = item.quantity * conversionFactor;
                      const baseUnitPrice = conversionFactor > 0 ? (item.purchasePrice / conversionFactor) : item.purchasePrice;

                      return (
                        <div>
                          <div className="font-extrabold text-slate-900 px-1 py-0.5">
                            {item.name || 'Catalog Item'}
                          </div>
                          {targetProduct?.hasSecondaryUnit && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] flex-wrap">
                              <span className="bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded border border-indigo-100">
                                1 {targetProduct.secondaryUnit || 'Box'} = {targetProduct.conversionFactor || 1} {baseUnit}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100">
                                Stock: +{baseQuantity} {baseUnit}
                              </span>
                              <span className="text-slate-500 font-bold">
                                (Cost: ₹{baseUnitPrice.toFixed(2)}/{baseUnit})
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                    <div className="font-extrabold text-slate-800">SKU: {item.sku || '-'}</div>
                    <div className="text-indigo-600 font-bold text-[10px]">HSN: {item.hsnCode || item.hsn || '-'}</div>
                    {item.barcode && <div className="text-slate-400 text-[10px]">BC: {item.barcode}</div>}
                  </td>

                  <td className="py-3.5 px-3">
                    {(() => {
                      const targetProduct = products.find((p) => p.id === item.productId || p._id === item.productId);
                      const baseUnit = targetProduct?.unit || item.unit || 'Nos';
                      const secUnit = targetProduct?.hasSecondaryUnit ? targetProduct.secondaryUnit : null;
                      const unitOptions = Array.from(new Set([baseUnit, secUnit, 'Nos', 'Pcs', 'Box', 'Kg', 'Ltr', 'Ream', 'Meter', 'Set'].filter(Boolean)));

                      return (
                        <select
                          value={item.unit || baseUnit}
                          onChange={(e) => {
                            const newUnit = e.target.value;
                            let newPrice = item.purchasePrice;
                            if (targetProduct && targetProduct.hasSecondaryUnit) {
                              if (newUnit === targetProduct.secondaryUnit && targetProduct.secondaryPurchasePrice) {
                                newPrice = Number(targetProduct.secondaryPurchasePrice);
                              } else if (newUnit === targetProduct.unit && targetProduct.purchasePrice) {
                                newPrice = Number(targetProduct.purchasePrice);
                              }
                            }
                            onItemChange(idx, 'unit', newUnit);
                            if (newPrice !== item.purchasePrice) {
                              onItemChange(idx, 'purchasePrice', newPrice);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                        >
                          {unitOptions.map((u) => (
                            <option key={u} value={u}>
                              {u} {u === secUnit ? `(Bulk Box)` : (u === baseUnit && secUnit ? `(Base Pcs)` : '')}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>

                  <td className="py-3.5 px-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 text-center focus:bg-white focus:outline-none"
                    />
                  </td>

                  <td className="py-3.5 px-3">
                    <input
                      type="number"
                      value={item.purchasePrice}
                      onChange={(e) => onItemChange(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 text-right focus:bg-white focus:outline-none"
                    />
                  </td>

                  <td className="py-3.5 px-3">
                    <input
                      type="number"
                      value={item.discountPercent}
                      onChange={(e) => onItemChange(idx, 'discountPercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none"
                    />
                  </td>

                  <td className="py-3.5 px-3 space-y-1">
                    <select
                      value={item.taxRate ?? item.taxPercent ?? 18}
                      onChange={(e) => onItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="18">18% GST</option>
                      <option value="12">12% GST</option>
                      <option value="5">5% GST</option>
                      <option value="0">0% GST</option>
                    </select>

                    <select
                      value={(item.taxMode || 'EXCLUSIVE').toUpperCase()}
                      onChange={(e) => onItemChange(idx, 'taxMode', e.target.value)}
                      className={`w-full px-1.5 py-0.5 border rounded text-[10px] font-black cursor-pointer ${
                        (item.taxMode || '').toUpperCase() === 'INCLUSIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="EXCLUSIVE">Excl.</option>
                      <option value="INCLUSIVE">Incl.</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-slate-900">
                    ₹{Number(item.amount || 0).toLocaleString('en-IN')}.00
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItemRow(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="block md:hidden space-y-3.5">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Item #{idx + 1}</span>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onItemChange(idx, 'name', e.target.value)}
                  className="w-full font-extrabold text-slate-900 text-sm bg-white px-2 py-1 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveItemRow(idx)}
                className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Unit</label>
                <select
                  value={item.unit}
                  onChange={(e) => onItemChange(idx, 'unit', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                >
                  <option value="Nos">Nos</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Ream">Ream</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-extrabold text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Price (₹)</label>
                <input
                  type="number"
                  value={item.purchasePrice}
                  onChange={(e) => onItemChange(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-extrabold text-right"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Tax (GST)</label>
                <select
                  value={item.taxRate}
                  onChange={(e) => onItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-xs"
                >
                  <option value="18">18%</option>
                  <option value="12">12%</option>
                  <option value="5">5%</option>
                  <option value="0">0%</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-600">Item Total Amount:</span>
              <span className="font-black text-indigo-700 text-sm">₹{Number(item.amount || 0).toLocaleString('en-IN')}.00</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer Actions & Metrics */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-500">
          Search or scan products above to add items to bill.
        </div>

        <div className="flex items-center gap-6 text-xs font-extrabold text-slate-700">
          <div>Total Items: <span className="text-indigo-600 font-black">{totalItemsCount}</span></div>
          <div>Total Qty: <span className="text-indigo-600 font-black">{totalQuantityCount}</span></div>
        </div>
      </div>

      {/* Notes & Optional File Upload */}
      <div className="pt-3 border-t border-slate-100 text-xs">
        <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Bill Notes / Remarks</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Enter optional notes for this bill..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};

export default PurchaseItemsTable;
