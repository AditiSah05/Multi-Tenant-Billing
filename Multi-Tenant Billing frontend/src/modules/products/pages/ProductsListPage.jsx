import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Edit3,
  Eye,
  ChevronRight,
  Package,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useProductsQuery, useCategoriesQuery, useDeleteProductMutation } from '../hooks/useProductsQueries';
import productService from '../../../services/productService';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/common/Pagination';

// Sub-components
import ProductSummaryKpiCards from '../components/ProductSummaryKpiCards';
import ProductsFilterBar from '../components/ProductsFilterBar';
import ProductDeleteModal from '../components/ProductDeleteModal';

// Helper utilities for clean rendering & performance
const getProductImageUrl = (prod) => {
  let imgSrc = prod.imageUrl || prod.productImage || prod.image || prod.thumbnail || prod.photo || prod.img || null;
  if (imgSrc && typeof imgSrc === 'string' && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const baseUrl = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    return `${baseUrl}/${imgSrc.replace(/^\//, '')}`;
  }
  return imgSrc;
};

const getProductStock = (prod) => {
  return Number(prod.currentStock ?? prod.stock ?? prod.qty ?? prod.openingStock ?? 0);
};

const getProductPurchasePrice = (prod) => {
  return Number(prod.purchasePrice ?? prod.buyingPrice ?? prod.price ?? 0);
};

const getProductMinAlert = (prod) => {
  if (!prod) return 5;
  const val = Number(prod.minStockLevel || prod.stockAlertQuantity || prod.minStock || prod.lowStockThreshold);
  return (val && val > 0) ? val : 5;
};

const getProductTax = (prod) => {
  return prod.taxPercent ?? prod.taxRate ?? prod.tax?.percentage ?? (prod.taxType === 'EXEMPT' || prod.taxType === 'NON_GST' ? 0 : 18);
};

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}.00`;
};

const ProductsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [subCategoryFilter, setSubCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Queries
  const { data: categoryRes } = useCategoriesQuery();

  const isSpecialStockFilter = statusFilter === 'LOW_STOCK' || statusFilter === 'OUT_OF_STOCK';
  const backendStatus = statusFilter !== 'ALL' && !isSpecialStockFilter ? statusFilter : undefined;
  const fetchLimit = isSpecialStockFilter ? 1000 : pageSize;

  const { data: responseData, isLoading } = useProductsQuery({
    search: searchQuery,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
    subCategory: subCategoryFilter !== 'ALL' ? subCategoryFilter : undefined,
    brand: brandFilter !== 'ALL' ? brandFilter : undefined,
    status: backendStatus,
    page: isSpecialStockFilter ? 1 : currentPage,
    limit: fetchLimit,
  });

  const deleteProductMutation = useDeleteProductMutation();

  const categories = Array.isArray(categoryRes?.categories)
    ? categoryRes.categories
    : Array.isArray(categoryRes?.data?.categories)
      ? categoryRes.data.categories
      : Array.isArray(categoryRes?.data)
        ? categoryRes.data
        : [];

  const selectedCategory = categories.find((c) => c.id === categoryFilter);
  const subCategories = selectedCategory?.subCategories || [];

  const rawProducts = Array.isArray(responseData?.products)
    ? responseData.products
    : Array.isArray(responseData?.data?.products)
      ? responseData.data.products
      : Array.isArray(responseData?.data?.items)
        ? responseData.data.items
        : Array.isArray(responseData?.items)
          ? responseData.items
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

  const allProducts = rawProducts;

  const dynamicBrands = Array.from(
    new Set(
      allProducts
        .map((p) => p.brand || p.brandName)
        .filter((b) => b && typeof b === 'string' && b.trim() !== '')
    )
  ).sort();

  const filteredProducts = allProducts.filter((prod) => {
    const query = searchQuery.trim().toLowerCase();
    const prodName = (prod.name || '').toLowerCase();
    const prodSku = (prod.sku || '').toLowerCase();
    const prodHsn = (prod.hsnCode || prod.hsn || '').toLowerCase();

    if (query && !prodName.includes(query) && !prodSku.includes(query) && !prodHsn.includes(query)) {
      return false;
    }

    if (categoryFilter !== 'ALL' && prod.categoryId !== categoryFilter && prod.category?.id !== categoryFilter && prod.category?.name !== categoryFilter) {
      return false;
    }

    if (brandFilter !== 'ALL' && prod.brand !== brandFilter && prod.brandName !== brandFilter) {
      return false;
    }

    if (statusFilter !== 'ALL') {
      const stock = getProductStock(prod);
      const minAlert = getProductMinAlert(prod);
      const statusStr = String(prod.status || '').toUpperCase();
      if (statusFilter === 'ACTIVE' && statusStr !== 'ACTIVE') return false;
      if (statusFilter === 'INACTIVE' && statusStr !== 'INACTIVE' && statusStr !== 'DRAFT' && statusStr !== 'SUSPENDED') return false;
      if (statusFilter === 'DRAFT' && statusStr !== 'DRAFT' && statusStr !== 'INACTIVE' && statusStr !== 'SUSPENDED') return false;
      if (statusFilter === 'LOW_STOCK' && (stock === 0 || stock > minAlert) && statusStr !== 'LOW_STOCK') return false;
      if (statusFilter === 'OUT_OF_STOCK' && stock > 0 && statusStr !== 'OUT_OF_STOCK') return false;
    }

    return true;
  });

  const displayProducts = isSpecialStockFilter
    ? filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredProducts;

  const pagination = responseData?.pagination || responseData?.data?.pagination || {
    total: filteredProducts.length,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(filteredProducts.length / pageSize) || 1,
  };

  const summary = responseData?.summary || responseData?.data?.summary || {};

  // KPI Metrics with bulletproof key resolution & fallbacks
  const totalProducts = summary.totalProducts ?? (pagination.total || allProducts.length);
  const lowStockCount = allProducts.filter((p) => {
    const stock = getProductStock(p);
    const minAlert = getProductMinAlert(p);
    const statusStr = String(p.status || '').toUpperCase();
    return (stock > 0 && stock <= minAlert) || statusStr === 'LOW_STOCK';
  }).length;

  const outOfStockCount = allProducts.filter((p) => {
    const stock = getProductStock(p);
    const statusStr = String(p.status || '').toUpperCase();
    return stock === 0 || statusStr === 'OUT_OF_STOCK';
  }).length;

  const totalStockValue = summary.totalStockValue ?? allProducts.reduce((acc, p) => {
    return acc + getProductStock(p) * getProductPurchasePrice(p);
  }, 0);

  const handleExport = async (format = 'csv') => {
    try {
      toast.info(`Exporting Products (${format.toUpperCase()})...`);
      await productService.exportProducts({
        search: searchQuery,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        format,
      });
      toast.success('Products exported successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export products.');
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id || productToDelete._id;
    const targetName = productToDelete.name || 'Product';
    setIsDeleting(true);
    try {
      await deleteProductMutation.mutateAsync(targetId);
      toast.success(`Product "${targetName}" deleted successfully!`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryBadge = (catName = 'General') => {
    const colors = [
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-rose-50 text-rose-700 border-rose-200',
    ];
    const colorClass = colors[Math.abs(catName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
    return (
      <span
        title={catName}
        className={`inline-block px-2.5 py-0.5 font-extrabold text-[11px] rounded-full border whitespace-nowrap max-w-[140px] truncate ${colorClass}`}
      >
        {catName}
      </span>
    );
  };

  const getStatusBadge = (prod) => {
    const stock = getProductStock(prod);
    const minAlert = getProductMinAlert(prod);
    const status = String(prod.status || '').toUpperCase();

    if (status === 'INACTIVE' || status === 'DRAFT' || status === 'SUSPENDED') {
      return (
        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-full border border-slate-200">
          Draft
        </span>
      );
    }
    if (stock === 0 || status === 'OUT_OF_STOCK') {
      return (
        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[11px] rounded-full border border-rose-200">
          Out of Stock
        </span>
      );
    }
    if ((stock > 0 && stock <= minAlert) || status === 'LOW_STOCK') {
      return (
        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 bg-amber-50 text-amber-700 font-extrabold text-[11px] rounded-full border border-amber-200">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-block whitespace-nowrap px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200">
        Active
      </span>
    );
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-12 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">Products</span>
      </div>

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Products</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Manage all your products, stock and pricing from here.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/vendor/products/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => toast.info('Import products ready.')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Upload size={16} className="text-indigo-600" />
            <span>Import Products</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Download size={16} className="text-indigo-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <ProductSummaryKpiCards
        totalProducts={totalProducts}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalStockValue={totalStockValue}
        currentStatusFilter={statusFilter}
        onFilterAll={() => {
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
        onFilterLowStock={() => {
          setStatusFilter('LOW_STOCK');
          setCurrentPage(1);
        }}
        onFilterOutOfStock={() => {
          setStatusFilter('OUT_OF_STOCK');
          setCurrentPage(1);
        }}
        onFilterStockValue={() => {
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
      />

      {/* Filter & Search Bar */}
      <ProductsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(c) => {
          setCategoryFilter(c);
          setCurrentPage(1);
        }}
        subCategoryFilter={subCategoryFilter}
        onSubCategoryChange={(s) => {
          setSubCategoryFilter(s);
          setCurrentPage(1);
        }}
        brandFilter={brandFilter}
        onBrandChange={(b) => {
          setBrandFilter(b);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        categories={categories}
        subCategories={subCategories}
        brands={dynamicBrands}
        onResetFilters={() => {
          setSearchQuery('');
          setCategoryFilter('ALL');
          setSubCategoryFilter('ALL');
          setBrandFilter('ALL');
          setStatusFilter('ALL');
          setCurrentPage(1);
          toast.info('Filters reset.');
        }}
      />

      {/* Main Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4 w-10 text-center">#</th>
                <th className="py-4 px-4">Product Details</th>
                <th className="py-4 px-4">SKU Code</th>
                <th className="py-4 px-4 text-center">HSN Code</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Purchase Price</th>
                <th className="py-4 px-4">Selling Price</th>
                <th className="py-4 px-4 text-center">Current Stock</th>
                <th className="py-4 px-4 text-center">GST/Tax</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <Loader2 size={32} className="mx-auto text-indigo-600 animate-spin" />
                    <div className="font-bold text-slate-700 mt-2">Loading products...</div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 space-y-2">
                    <Package size={32} className="mx-auto text-slate-300" />
                    <div className="font-bold text-slate-700">No Products Found</div>
                    <p className="text-xs text-slate-400">Try adjusting your search query, status, or category filter.</p>
                  </td>
                </tr>
              ) : (
                displayProducts.map((prod, idx) => {
                  const categoryName = prod.category?.name || prod.categoryName || 'General';
                  const purchasePrice = getProductPurchasePrice(prod);
                  const sellingPrice = Number(prod.sellingPrice) || 0;
                  const stock = getProductStock(prod);
                  const minAlert = getProductMinAlert(prod);
                  const tax = getProductTax(prod);
                  const imgSrc = getProductImageUrl(prod);
                  const targetProdId = prod.id || prod._id;
                  const isInclusive = (prod.taxType || prod.taxMode || '').toUpperCase() === 'INCLUSIVE';

                  return (
                    <tr key={targetProdId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-slate-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="py-4 px-4 max-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full items-center justify-center ${imgSrc ? 'hidden' : 'flex'}`}>
                              <Package size={18} className="text-slate-400" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 hover:text-indigo-600 cursor-pointer truncate" title={prod.name} onClick={() => navigate(`/vendor/products/${targetProdId}`)}>
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium truncate" title={prod.description || ''}>{prod.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] max-w-[140px] leading-tight">
                        <div className="font-extrabold text-slate-800 truncate" title={prod.sku}>{prod.sku}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-extrabold text-[11px] rounded-lg border border-indigo-100/80">
                          {prod.hsnCode || prod.hsn || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getCategoryBadge(categoryName)}</td>
                      <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">{formatCurrency(purchasePrice)}</td>
                      <td className="py-4 px-4 font-black text-slate-900 whitespace-nowrap">{formatCurrency(sellingPrice)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-black text-sm ${stock === 0 ? 'text-rose-600' : (stock <= minAlert ? 'text-amber-600' : 'text-emerald-600')}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-extrabold text-slate-900">{tax}%</div>
                        <span className={`inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded ${isInclusive ? 'bg-purple-50 text-purple-700 border border-purple-200/80' : 'bg-blue-50 text-blue-700 border border-blue-200/80'}`}>
                          {isInclusive ? 'Incl.' : 'Excl.'}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(prod)}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/vendor/products/${targetProdId}`)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="View Product Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/vendor/products/edit/${targetProdId}`)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200/60 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || rawProducts.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="products"
        />
      </div>

      {/* Product Delete Confirmation Modal */}
      <ProductDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name || 'this product'}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductsListPage;
