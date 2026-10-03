import React, { useState, useRef, useEffect } from 'react';
import { Receipt, Plus, Trash2, Search } from 'lucide-react';

const SalesItemsTable = ({
  billType,
  items,
  productsList = [],
  onAddProductRow,
  onSelectProduct,
  onUpdateItem,
  onRemoveItem,
}) => {
  const isB2B = billType === 'B2B';
  const [productSearchQuery, setProductSearchQuery] = useState('');
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
    ? productsList.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(queryLower) ||
          (p.sku && p.sku.toLowerCase().includes(queryLower)) ||
          (p.barcode && p.barcode.includes(queryLower)) ||
          ((p.hsnCode || p.hsn) && (p.hsnCode || p.hsn).toLowerCase().includes(queryLower))
      )
    : productsList;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4 p-5 sm:p-6">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Receipt className="text-indigo-600" size={18} />
          <span>Products & Line Items</span>
        </div>
        <button
          type="button"
          onClick={onAddProductRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Empty Row</span>
        </button>
      </div>

      {/* Inline Product Autocomplete Search Bar (PurchaseItemsTable style) */}
      <div className="relative w-full" ref={searchContainerRef}>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Click to view all products or search by name, SKU, HSN code..."
            value={productSearchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setProductSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          />
        </div>

        {/* Inline Autocomplete Scrollable Dropdown (Matches PurchaseItemsTable) */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar animate-fadeIn">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-500 sticky top-0 z-10 backdrop-blur-md">
              <span>{queryLower ? `Search Results (${matches.length})` : `All Catalog Products (${productsList.length})`}</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">
                {matches.length} {matches.length === 1 ? 'product' : 'products'} available
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-slate-600">
                No product matching <span className="text-indigo-600 font-extrabold">"{productSearchQuery}"</span> in Catalog.
              </div>
            ) : (
              matches.map((product) => {
                const price = Number(product.sellingPrice || product.price || 0);
                const stock = product.stockQty ?? product.stock ?? product.quantity ?? 'N/A';
                return (
                  <div
                    key={product.id || product._id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(product);
                      }
                      setProductSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-indigo-50/70 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <span>{product.name}</span>
                        {product.sku && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        <span className="text-indigo-600 font-bold">HSN: {product.hsnCode || product.hsn || '1234'}</span>
                        {product.unit ? ` | Unit: ${product.unit}` : ''}
                        <span> | Stock: {stock}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-indigo-600 text-sm">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-indigo-500 font-extrabold">
                        + Click to Add
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Scrollable Products Table Container (Fits Full Screen Width) */}
      <div className="overflow-x-auto max-h-[380px] sm:max-h-[420px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl">
        <table className="w-full text-left border-collapse min-w-full">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-1.5 w-7 text-center">#</th>
              <th className="py-2.5 px-1.5 min-w-[130px]">Product Name</th>
              {isB2B && <th className="py-2.5 px-1.5 w-20 text-center min-w-[70px]">HSN/SAC</th>}
              <th className="py-2.5 px-1.5 w-24 text-center min-w-[80px]">Qty</th>
              <th className="py-2.5 px-1.5 w-20 min-w-[70px]">Rate (₹)</th>
              <th className="py-2.5 px-1.5 w-16 min-w-[60px]">Disc (₹)</th>
              <th className="py-2.5 px-1.5 w-24 text-center min-w-[85px]">{isB2B ? 'GST %' : 'Tax %'}</th>
              <th className="py-2.5 px-1.5 w-24 text-right min-w-[80px]">Amount (₹)</th>
              <th className="py-2.5 px-1.5 w-7 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
            {items.map((item, idx) => {
              const qty = Number(item.qty) || 0;
              const rate = Number(item.rate) || 0;
              const disc = Number(item.discount) || 0;
              const gstRate = item.gst !== undefined && item.gst !== null ? Number(item.gst) : 18;
              const isInclusive = (item.taxMode || 'INCLUSIVE').toUpperCase() === 'INCLUSIVE';

              const net = Math.max(0, qty * rate - disc);
              let lineTotal = net;
              if (!isInclusive && gstRate > 0) {
                const tax = net * (gstRate / 100);
                lineTotal = Math.round(net + tax);
              } else {
                lineTotal = Math.round(net);
              }

              return (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-1.5 text-center font-bold text-slate-400 text-xs">{idx + 1}</td>
                  
                  <td className="py-2.5 px-1.5 min-w-[130px]">
                    <div className="space-y-0.5">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                        placeholder="Product name..."
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-extrabold text-slate-900 outline-none transition-all"
                      />
                      {item.sku && (
                        <div className="text-[9px] text-slate-400 font-mono font-bold px-1 truncate max-w-[150px]">
                          SKU: {item.sku}
                        </div>
                      )}
                    </div>
                  </td>

                  {isB2B && (
                    <td className="py-2.5 px-1.5 text-center min-w-[70px]">
                      <input
                        type="text"
                        value={item.hsnCode}
                        onChange={(e) => onUpdateItem(item.id, 'hsnCode', e.target.value)}
                        className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-center text-slate-900 outline-none"
                      />
                    </td>
                  )}

                  <td className="py-2.5 px-1.5 text-center min-w-[80px]">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={item.qty}
                        onChange={(e) => onUpdateItem(item.id, 'qty', e.target.value)}
                        className="w-14 px-1 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 outline-none"
                      />
                      {item.hasSecondaryUnit && item.secondaryUnit ? (
                        <select
                          value={item.unit || item.primaryUnit || 'Pcs'}
                          onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                          className="px-1 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-[9px] font-black outline-none cursor-pointer"
                        >
                          <option value={item.primaryUnit || 'Pcs'}>{item.primaryUnit || 'Pcs'}</option>
                          <option value={item.secondaryUnit}>{item.secondaryUnit}</option>
                        </select>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.unit || 'Pcs'}</span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-1.5 min-w-[70px]">
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => onUpdateItem(item.id, 'rate', e.target.value)}
                      className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </td>

                  <td className="py-2.5 px-1.5 min-w-[60px]">
                    <input
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => onUpdateItem(item.id, 'discount', e.target.value)}
                      className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </td>

                  <td className="py-2.5 px-1.5 text-center space-y-1 min-w-[85px]">
                    <select
                      value={item.gst !== undefined && item.gst !== null ? item.gst : 18}
                      onChange={(e) => onUpdateItem(item.id, 'gst', e.target.value)}
                      className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-center text-slate-900 outline-none cursor-pointer"
                    >
                      {[0, 5, 12, 18, 28].map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>

                    <select
                      value={(item.taxMode || 'INCLUSIVE').toUpperCase()}
                      onChange={(e) => onUpdateItem(item.id, 'taxMode', e.target.value)}
                      className={`w-full px-1 py-0.5 border rounded-lg text-[9px] font-black cursor-pointer text-center ${
                        (item.taxMode || 'INCLUSIVE').toUpperCase() === 'INCLUSIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="INCLUSIVE">Incl.</option>
                      <option value="EXCLUSIVE">Excl.</option>
                    </select>
                  </td>

                  <td className="py-2.5 px-1.5 text-right font-black text-slate-900 text-xs min-w-[80px] whitespace-nowrap">
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-1.5 text-center w-7">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesItemsTable;
