import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  Search,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Trash2,
  Package,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { useExpiryAlertsQuery } from '../hooks/useInventoryQueries';
import AdjustStockModal from '../components/AdjustStockModal';
import Pagination from '../../../components/common/Pagination';
import { useToast } from '../../../context/ToastContext';

const TIMEFRAME_TABS = [
  { id: 30, label: '30-Day Warning' },
  { id: 0, label: 'Expired Items' },
  { id: 7, label: '7 Days Critical' },
  { id: 15, label: '15 Days Warning' },
  { id: 60, label: '60 Days Notice' },
  { id: 90, label: '90 Days Horizon' },
];

const ExpiryRiskIntelligencePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Search, Filter & Pagination States
  const [selectedDays, setSelectedDays] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for Discard / Stock Adjustment
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  // Fetch Expiry Alerts Data from GET /inventory/expiry-alerts
  const { data: rawAlerts, isLoading, isFetching, refetch } = useExpiryAlertsQuery({ days: selectedDays });

  const handleRefreshAlerts = async () => {
    try {
      await refetch();
      toast?.success?.('Expiry alerts refreshed!');
    } catch (err) {
      toast?.error?.('Failed to refresh alerts.');
    }
  };

  const alertsData = rawAlerts?.data || rawAlerts || {};
  const buckets = alertsData.buckets || {};
  const expiredProducts = Array.isArray(alertsData.expiredProducts) ? alertsData.expiredProducts : [];
  const expiringSoonProducts = Array.isArray(alertsData.expiringSoonProducts) ? alertsData.expiringSoonProducts : [];

  const expiredCount = Number(buckets.expiredCount ?? expiredProducts.length) || 0;

  // Compute 7-day critical count dynamically if not present in buckets
  const computedWithin7Count = buckets.within7DaysCount !== undefined && buckets.within7DaysCount !== null
    ? Number(buckets.within7DaysCount)
    : expiringSoonProducts.filter((p) => {
        if (!p.expiryDate) return false;
        const diffDays = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).length;

  const within7Count = computedWithin7Count;
  const within30Count = Number(buckets.within30DaysCount ?? expiringSoonProducts.length) || 0;

  // Active products list based on selected tab
  const rawList = selectedDays === 0 ? expiredProducts : expiringSoonProducts;

  // Filter list by search query
  const filteredProducts = rawList.filter((prod) => {
    if (!prod) return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const name = String(prod.name || '').toLowerCase();
    const sku = String(prod.sku || '').toLowerCase();
    return name.includes(query) || sku.includes(query);
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const displayProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate total stock value at risk across ALL expired & expiring products (overall catalog risk)
  const combinedRiskList = [...expiredProducts, ...expiringSoonProducts];
  const uniqueRiskMap = new Map();
  combinedRiskList.forEach((item) => {
    if (item && (item.id || item._id)) {
      uniqueRiskMap.set(item.id || item._id, item);
    }
  });
  const riskListToCalculate = uniqueRiskMap.size > 0 ? Array.from(uniqueRiskMap.values()) : rawList;

  const totalRiskValue = riskListToCalculate.reduce((acc, p) => {
    const qty = Number(p.currentStock ?? p.qty ?? 0);
    const price = Number(p.sellingPrice || p.price || 0);
    return acc + qty * price;
  }, 0);

  const getDaysRemainingText = (expiryDateStr) => {
    if (!expiryDateStr) return { text: 'No Expiry', color: 'text-slate-500', isExpired: false };
    const expDate = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`, color: 'text-rose-600 font-black', isExpired: true };
    }
    if (diffDays === 0) {
      return { text: 'Expires Today!', color: 'text-rose-600 font-black', isExpired: true };
    }
    if (diffDays <= 7) {
      return { text: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`, color: 'text-rose-600 font-bold', isExpired: false };
    }
    if (diffDays <= 30) {
      return { text: `${diffDays} days remaining`, color: 'text-amber-600 font-bold', isExpired: false };
    }
    return { text: `${diffDays} days remaining`, color: 'text-slate-700 font-medium', isExpired: false };
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 animate-fadeIn font-sans pb-16">
      {/* 1. Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link to="/vendor/dashboard" className="hover:text-indigo-600">
              Dashboard
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <Link to="/vendor/inventory" className="hover:text-indigo-600">
              Inventory
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 font-extrabold">Expiry Risk Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="text-amber-600" size={28} />
            Product Expiry Risk Intelligence & Batch Tracker
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Monitor product batch expiry dates, early warning alerts, and write off expired inventory to prevent sales of spoiled stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefreshAlerts}
            disabled={isFetching}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-indigo-600' : ''} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Alerts'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/vendor/inventory')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expired Products */}
        <div
          onClick={() => { setSelectedDays(0); setCurrentPage(1); }}
          className={`bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            selectedDays === 0 ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md' : 'border-rose-200 hover:border-rose-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase text-rose-500">Expired Products</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{expiredCount} SKUs</h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Stock must be written off</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Critical (7 Days) */}
        <div
          onClick={() => { setSelectedDays(7); setCurrentPage(1); }}
          className={`bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            selectedDays === 7 ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' : 'border-amber-200 hover:border-amber-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase text-amber-600">Critical Expiry (7 Days)</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{within7Count} SKUs</h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">High priority discount sale</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={22} />
          </div>
        </div>

        {/* 30-Day Warning */}
        <div
          onClick={() => { setSelectedDays(30); setCurrentPage(1); }}
          className={`bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            selectedDays === 30 ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200/90 hover:border-indigo-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400">30-Day Warning Window</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{within30Count} SKUs</h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Expiring in next month</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calendar size={22} />
          </div>
        </div>

        {/* Total Stock Value at Risk */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400">Total Value at Risk</p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono mt-1">
              ₹{totalRiskValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Selling price valuation</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-base">
            ₹
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Timeframe Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by product name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {TIMEFRAME_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedDays(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedDays === tab.id
                  ? tab.id === 0
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.id === 0 && <AlertCircle size={14} />}
              {tab.label}
              {tab.id === 0 && expiredCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-800 text-white font-black text-[10px]">
                  {expiredCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Expiry Products Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm overflow-hidden space-y-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-10">#</th>
                <th className="px-4 py-3.5">Product Name & Category</th>
                <th className="px-4 py-3.5">SKU Code</th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th className="px-4 py-3.5">Time Remaining</th>
                <th className="px-4 py-3.5 text-center">Current Stock</th>
                <th className="px-4 py-3.5 text-right">Value at Risk</th>
                <th className="px-4 py-3.5 text-center">Risk Status</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin text-amber-600 mx-auto mb-2" />
                    Checking product batch expiry dates...
                  </td>
                </tr>
              ) : displayProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-bold">
                    {selectedDays === 0
                      ? 'No expired products found in stock.'
                      : `No products expiring within the next ${selectedDays} days.`}
                  </td>
                </tr>
              ) : (
                displayProducts.map((prod, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const formattedExpDate = prod.expiryDate ? new Date(prod.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
                  const remainingInfo = getDaysRemainingText(prod.expiryDate);

                  const qty = Number(prod.currentStock ?? prod.qty ?? 0);
                  const unitLabel = prod.unit || 'Pcs';
                  const sellingPrice = Number(prod.sellingPrice || prod.price || 0);
                  const riskValue = qty * sellingPrice;
                  const categoryName = typeof prod.category === 'object' && prod.category !== null ? prod.category.name : (prod.category || 'General');

                  return (
                    <tr key={prod.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-center font-bold text-slate-400">{itemIndex}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {prod.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{categoryName}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{prod.sku || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-extrabold text-slate-800 whitespace-nowrap">{formattedExpDate}</td>
                      <td className={`px-4 py-3.5 whitespace-nowrap ${remainingInfo.color}`}>
                        {remainingInfo.text}
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-900 text-sm">
                        {qty} <span className="text-xs text-slate-500 font-bold">{unitLabel}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                        ₹{riskValue.toLocaleString('en-IN')}.00
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-full border uppercase ${
                            remainingInfo.isExpired
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {remainingInfo.isExpired ? 'EXPIRED' : 'EXPIRING SOON'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedProductForAdjust(prod)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] rounded-xl border border-rose-200 shadow-2xs inline-flex items-center gap-1 cursor-pointer transition-all"
                          title="Discard / Write Off Damaged Stock"
                        >
                          <Trash2 size={13} />
                          <span>Discard Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="products"
        />
      </div>

      {/* Adjust / Discard Stock Modal */}
      <AdjustStockModal
        isOpen={!!selectedProductForAdjust}
        onClose={() => setSelectedProductForAdjust(null)}
        product={selectedProductForAdjust}
        toast={toast}
      />
    </div>
  );
};

export default ExpiryRiskIntelligencePage;
