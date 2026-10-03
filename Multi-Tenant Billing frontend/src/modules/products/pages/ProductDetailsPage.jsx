import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Package,
  Tag,
  ArrowLeft,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  Loader2,
  Building2,
  Boxes,
  Copy,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useProductDetailsQuery, useDeleteProductMutation } from '../hooks/useProductsQueries';
import ProductDeleteModal from '../components/ProductDeleteModal';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: responseData, isLoading, isError, error } = useProductDetailsQuery(id);
  const deleteProductMutation = useDeleteProductMutation();

  const product = responseData?.product || responseData?.data || responseData || null;

  const handleConfirmDelete = async () => {
    if (!product) return;
    const targetId = product.id || product._id || id;
    const targetName = product.name || 'Product';
    setIsDeleting(true);
    try {
      await deleteProductMutation.mutateAsync(targetId);
      toast.success(`Product "${targetName}" deleted successfully.`);
      setDeleteModalOpen(false);
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <div className="text-xs font-bold text-slate-700">Loading product details...</div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="w-full py-12 text-center space-y-3">
        <AlertTriangle size={36} className="mx-auto text-amber-500" />
        <h2 className="text-lg font-extrabold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {error?.response?.data?.message || 'The requested product could not be retrieved from the catalog.'}
        </p>
        <button
          onClick={() => navigate('/vendor/products')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Calculated Metrics
  const purchasePrice = Number(product.purchasePrice) || 0;
  const sellingPrice = Number(product.sellingPrice) || 0;
  const mrp = Number(product.mrp) || 0;
  const taxPercent = Number(product.taxPercent ?? product.taxRate ?? product.tax?.percentage) || 0;
  const discountPercent = Number(product.discountPercent) || 0;
  const currentStock = Number(product.currentStock) || 0;
  const minStockLevel = Number(product.minStockLevel ?? product.stockAlertQuantity ?? product.minStock ?? product.lowStockThreshold ?? 5);

  const isInclusive = (product.taxType || product.taxMode || '').toUpperCase() === 'INCLUSIVE';
  const effectiveSellingPrice = discountPercent > 0 ? sellingPrice - (sellingPrice * discountPercent) / 100 : sellingPrice;

  // Tax-Deducted Base Prices (Pricing & Tax Engine Alignment)
  let basePurchasePrice = purchasePrice;
  if (purchasePrice > 0 && taxPercent > 0 && isInclusive) {
    basePurchasePrice = purchasePrice / (1 + taxPercent / 100);
  }

  let baseSellingPrice = effectiveSellingPrice;
  let totalTaxAmount = 0;
  let finalPriceWithTax = effectiveSellingPrice;

  if (isInclusive) {
    baseSellingPrice = taxPercent > 0 ? effectiveSellingPrice / (1 + taxPercent / 100) : effectiveSellingPrice;
    totalTaxAmount = effectiveSellingPrice - baseSellingPrice;
    finalPriceWithTax = effectiveSellingPrice;
  } else {
    baseSellingPrice = effectiveSellingPrice;
    totalTaxAmount = taxPercent > 0 ? (effectiveSellingPrice * taxPercent) / 100 : 0;
    finalPriceWithTax = effectiveSellingPrice + totalTaxAmount;
  }

  const taxableValue = baseSellingPrice;
  const cgstAmount = totalTaxAmount / 2;
  const sgstAmount = totalTaxAmount / 2;

  // Tax-Deducted Real Net Profit (Base Selling Price - Base Purchase Price)
  const profitAmount = (baseSellingPrice > 0 && basePurchasePrice > 0) ? baseSellingPrice - basePurchasePrice : (sellingPrice - purchasePrice);
  const profitMarginPercent = basePurchasePrice > 0 ? ((profitAmount / basePurchasePrice) * 100).toFixed(2) : '0.00';

  // Resolve Image URL
  let imgSrc = product.imageUrl || product.productImage || product.image || product.thumbnail || product.photo || product.img || null;
  if (imgSrc && typeof imgSrc === 'string' && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const baseUrl = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    imgSrc = `${baseUrl}/${imgSrc.replace(/^\//, '')}`;
  }

  const getStatusBadge = () => {
    const statusStr = String(product.status || '').toUpperCase();
    if (currentStock === 0 || statusStr === 'OUT_OF_STOCK') {
      return (
        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-extrabold text-[11px] flex items-center gap-1">
          <AlertTriangle size={12} /> Out of Stock
        </span>
      );
    }
    if ((currentStock > 0 && currentStock <= minStockLevel) || statusStr === 'LOW_STOCK') {
      return (
        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-extrabold text-[11px] flex items-center gap-1">
          <AlertTriangle size={12} /> Low Stock ({currentStock})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-extrabold text-[11px] flex items-center gap-1">
        <CheckCircle2 size={12} /> Active ({currentStock})
      </span>
    );
  };

  const categoryName = product.category?.name || product.categoryName || 'Master Category';
  const subCategoryName = product.subCategory?.name || product.subCategoryName || '-';

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Breadcrumb Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/vendor/products" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Products
          </Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-900 font-extrabold truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Link
            to={`/vendor/products/edit/${product.id || id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Edit Product</span>
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Compact Top Banner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Span 2: Compact Product Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            {imgSrc ? (
              <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={28} className="text-slate-400" />
            )}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[11px] rounded-full border border-indigo-100">
                {categoryName}
              </span>
              {subCategoryName !== '-' && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-full border border-slate-200">
                  {subCategoryName}
                </span>
              )}
              {product.brand && (
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 font-extrabold text-[11px] rounded-full border border-purple-100 flex items-center gap-1">
                  <Building2 size={12} /> {product.brand}
                </span>
              )}
              {product.hasWarranty && (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={12} /> {product.warrantyPeriod || 12} {product.warrantyUnit || 'MONTHS'} Warranty
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium line-clamp-2">
              {product.description || 'No additional description provided.'}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black block">Unit</span>
                <span>{product.unit || 'Nos'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black block">Tax Slab</span>
                <span>{taxPercent}% GST</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black block">Created</span>
                <span>{product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN') : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Span 1: Compact Side-by-Side KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-4 shadow-sm space-y-0.5 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-black text-indigo-200 tracking-wider">Selling Price</span>
            <div className="text-xl sm:text-2xl font-black">₹{sellingPrice.toLocaleString('en-IN')}.00</div>
            {mrp > sellingPrice && (
              <div className="text-[11px] text-indigo-200 line-through">MRP: ₹{mrp.toLocaleString('en-IN')}</div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-0.5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-extrabold">
              <span>ESTIMATED PROFIT</span>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-600">
              ₹{profitAmount.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold">
              Margin: <span className="text-emerald-600 font-extrabold">+{profitMarginPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Cards Grid - Compact Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Pricing & Tax Breakdown */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Tag size={15} />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900">Pricing & Tax Breakdown</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-slate-700">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Purchase Cost</span>
              <span className="text-xs font-black text-slate-900">₹{purchasePrice.toLocaleString('en-IN')}.00</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Selling Price</span>
              <span className="text-xs font-black text-indigo-600">₹{sellingPrice.toLocaleString('en-IN')}.00</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Taxable Base Price</span>
              <span className="text-xs font-black text-slate-900">₹{taxableValue.toFixed(2)}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Total Tax ({taxPercent}%)</span>
              <span className="text-xs font-black text-indigo-600">₹{totalTaxAmount.toFixed(2)}</span>
            </div>
          </div>

          {taxPercent > 0 && (
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] text-indigo-600 font-extrabold block uppercase">CGST ({(taxPercent / 2).toFixed(1)}%)</span>
                <span className="text-slate-900 font-extrabold text-xs">₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] text-indigo-600 font-extrabold block uppercase">SGST ({(taxPercent / 2).toFixed(1)}%)</span>
                <span className="text-slate-900 font-extrabold text-xs">₹{sgstAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Inventory & Stock Controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Boxes size={15} />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900">Inventory & Stock Controls</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-slate-700">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Current Live Stock</span>
              <span className={`text-sm font-black ${currentStock === 0 ? 'text-rose-600' : currentStock <= minStockLevel ? 'text-amber-600' : 'text-emerald-600'}`}>
                {currentStock} {product.unit || 'Nos'}
              </span>
              {product.hasSecondaryUnit && Number(product.conversionFactor) > 1 && (
                <span className="block text-[10px] font-extrabold text-indigo-600 mt-0.5">
                  ({(currentStock / Number(product.conversionFactor)).toFixed(1)} {product.secondaryUnit || 'Box'})
                </span>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Opening Stock</span>
              <span className="text-xs font-black text-slate-900">
                {product.openingStock ?? 0} {product.unit || 'Nos'}
              </span>
              {product.hasSecondaryUnit && Number(product.conversionFactor) > 1 && (
                <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">
                  ({((product.openingStock ?? 0) / Number(product.conversionFactor)).toFixed(1)} {product.secondaryUnit || 'Box'})
                </span>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Min Stock Level</span>
              <span className="text-xs font-black text-slate-900">{minStockLevel}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Max Stock Level</span>
              <span className="text-xs font-black text-slate-900">{product.maxStockLevel ?? 'Unlimited'}</span>
            </div>
          </div>

          {/* Multi-Unit Details Banner */}
          {product.hasSecondaryUnit && Number(product.conversionFactor) > 1 && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between text-indigo-950 font-black">
                <span className="uppercase text-[10px] text-indigo-700 tracking-wider">Multi-Unit Packaging</span>
                <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <div className="text-[11px] font-bold text-slate-800">
                1 {product.secondaryUnit || 'Box'} = <span className="text-indigo-600 font-extrabold">{product.conversionFactor} {product.unit || 'Pcs'}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-600 font-semibold pt-1 border-t border-indigo-100">
                <span>Box Purchase: <strong className="text-slate-900 font-mono">₹{product.secondaryPurchasePrice || (purchasePrice * product.conversionFactor).toFixed(2)}</strong></span>
                <span>Box Selling: <strong className="text-indigo-600 font-mono">₹{(sellingPrice * product.conversionFactor).toFixed(2)}</strong></span>
              </div>
            </div>
          )}

          {/* Dynamic Extra / Custom Subcategory Fields */}
          {(product.expiryDate || (product.additionalValues && Object.keys(product.additionalValues).length > 0)) && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Layers size={13} /> Additional Attributes
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                {product.expiryDate && (
                  <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Expiry Date</span>
                    <span className="text-slate-900 font-extrabold text-[11px]">{new Date(product.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                {product.additionalValues &&
                  Object.entries(product.additionalValues).map(([key, val]) => (
                    <div key={key} className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <span className="text-[9px] text-slate-500 uppercase block font-extrabold">{key}</span>
                      <span className="text-slate-900 font-extrabold text-[11px]">{String(val)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ProductDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={product?.name || 'this product'}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductDetailsPage;
