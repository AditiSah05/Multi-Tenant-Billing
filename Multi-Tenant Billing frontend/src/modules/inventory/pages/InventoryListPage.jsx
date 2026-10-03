import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  History,
  Loader2,
  Calendar,
  AlertCircle,
  Package,
  Scale,
  AlertOctagon,
} from 'lucide-react';
import { useInventoryQuery, useExpiryAlertsQuery } from '../hooks/useInventoryQueries';
import AdjustStockModal from '../components/AdjustStockModal';
import StockHistoryModal from '../components/StockHistoryModal';
import ExpiryAlertsModal from '../components/ExpiryAlertsModal';
import StatusBadge from '../../../components/common/StatusBadge';
import Pagination from '../../../components/common/Pagination';
import { useToast } from '../../../context/ToastContext';

const getItemMinAlert = (item) => {
  if (!item) return 5;
  const alertVal = item.minStockLevel ?? item.stockAlertQuantity ?? item.minStock ?? item.lowStockThreshold ?? 5;
  return Number(alertVal) || 5;
};

const InventoryListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'LOW_STOCK', 'REORDER_REQUIRED', 'EXPIRED', 'EXPIRING_SOON'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals State
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);
  const [modalInitialType, setModalInitialType] = useState('ADD');
  const [stockHistoryModalOpen, setStockHistoryModalOpen] = useState(false);
  const [expiryModalOpen, setExpiryModalOpen] = useState(false);

  // Fetch Inventory with Pagination and Filters
  const { data: rawInventory, isLoading, isRefetching, refetch } = useInventoryQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    statusFilter: filterType !== 'ALL' ? filterType : undefined,
  });

  const { data: rawExpiryAlerts } = useExpiryAlertsQuery({ days: 30 });
  const expiryBuckets = rawExpiryAlerts?.data?.buckets || rawExpiryAlerts?.buckets || {};
  const totalExpiredCount = Number(expiryBuckets.expiredCount || 0);
  const totalExpiringSoonCount = Number(expiryBuckets.within30DaysCount || 0);

  const inventoryResponse = typeof rawInventory === 'object' && rawInventory !== null ? rawInventory : {};
  const paginationObj = inventoryResponse.pagination || inventoryResponse.data?.pagination || {};

  const inventoryItems = Array.isArray(inventoryResponse.items)
    ? inventoryResponse.items
    : Array.isArray(inventoryResponse.data?.items)
    ? inventoryResponse.data.items
    : Array.isArray(inventoryResponse.data)
    ? inventoryResponse.data
    : Array.isArray(rawInventory)
    ? rawInventory
    : [];

  const totalCount = Number(paginationObj.totalCount ?? inventoryResponse.totalCount ?? inventoryResponse.total ?? inventoryItems.length) || inventoryItems.length;
  const totalPages = Number(paginationObj.totalPages ?? inventoryResponse.totalPages ?? Math.ceil(totalCount / pageSize)) || 1;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (mode) => {
    setFilterType(mode);
    setCurrentPage(1);
  };

  const lowStockCount = inventoryItems.filter((item) => {
    const qty = item.currentStock !== undefined ? item.currentStock : (item.qty !== undefined ? item.qty : (item.stock || 0));
    const minStock = getItemMinAlert(item);
    return qty <= minStock || item.stockStatus === 'LOW_STOCK' || item.stockStatus === 'OUT_OF_STOCK';
  }).length;

  const handleRefreshStock = async () => {
    try {
      await refetch();
      toast?.success?.('Inventory stock levels refreshed!');
    } catch (err) {
      toast?.error?.('Failed to refresh inventory stock data.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="text-indigo-600" size={26} /> Inventory & Stock Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time product quantities, physical stock audits, expiry alerts, and stock history logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/vendor/inventory/expiry-alerts')}
            className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Calendar size={16} className="text-amber-600" />
            <span>Expiry Risk Intelligence</span>
            {(totalExpiredCount > 0 || totalExpiringSoonCount > 0) && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white font-black text-[10px]">
                {totalExpiredCount + totalExpiringSoonCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/vendor/inventory/logs')}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <History size={16} /> Stock Audit Logs
          </button>

          <button
            type="button"
            onClick={handleRefreshStock}
            disabled={isRefetching}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={15} className={isRefetching ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span>{isRefetching ? 'Refreshing...' : 'Refresh Stock'}</span>
          </button>
        </div>
      </div>

      {/* 2. Low Stock & Expiry Warning Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lowStockCount > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-amber-950">Restock Alert Notification</h4>
                <p className="text-xs text-amber-800/90 font-medium">
                  {lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} below minimum threshold level.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFilterChange('LOW_STOCK')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
            >
              View Low Stock
            </button>
          </div>
        )}

        {(totalExpiredCount > 0 || totalExpiringSoonCount > 0) && (
          <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-300/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-rose-950">Expiry Warning Intelligence</h4>
                <p className="text-xs text-rose-800/90 font-medium">
                  {totalExpiredCount > 0 ? `${totalExpiredCount} expired` : ''}
                  {totalExpiredCount > 0 && totalExpiringSoonCount > 0 ? ' & ' : ''}
                  {totalExpiringSoonCount > 0 ? `${totalExpiringSoonCount} expiring in 30 days` : ''}.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vendor/inventory/expiry-alerts')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
            >
              Manage Expiry
            </button>
          </div>
        )}
      </div>

      {/* 3. KPI Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold">
            <Package size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total SKUs in Inventory</div>
            <div className="text-xl font-extrabold text-slate-900">{isLoading ? '...' : totalCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-extrabold">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Restock Alerts</div>
            <div className="text-xl font-extrabold text-amber-600">{isLoading ? '...' : lowStockCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expiry Risk SKUs</div>
            <div className="text-xl font-extrabold text-rose-600">
              {totalExpiredCount + totalExpiringSoonCount}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Healthy Stock</div>
            <div className="text-xl font-extrabold text-emerald-600">
              {isLoading ? '...' : Math.max(0, totalCount - lowStockCount)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search inventory by product or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Stock Items' },
            { id: 'LOW_STOCK', label: 'Low Stock Alerts' },
            { id: 'REORDER_REQUIRED', label: 'Reorder Required' },
            { id: 'EXPIRING_SOON', label: 'Expiring Soon' },
            { id: 'EXPIRED', label: 'Expired Items' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Inventory Items Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-4 py-3.5">SKU Code</th>
                <th className="px-4 py-3.5">Current Stock</th>
                <th className="px-4 py-3.5">Min Alert Level</th>
                <th className="px-4 py-3.5">Stock Meter</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    Loading inventory stock levels...
                  </td>
                </tr>
              ) : inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                    No inventory records match your search criteria.
                  </td>
                </tr>
              ) : (
                inventoryItems.map((item) => {
                  const qty = item.currentStock !== undefined ? item.currentStock : (item.qty !== undefined ? item.qty : (item.stock || 0));
                  const minStock = getItemMinAlert(item);
                  const isLow = qty <= minStock || item.stockStatus === 'LOW_STOCK' || item.stockStatus === 'OUT_OF_STOCK';
                  const percent = Math.min(100, Math.round((qty / (minStock * 3)) * 100));
                  const unitLabel = item.unit || 'Pcs';

                  return (
                    <tr key={item.id || item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {item.product || item.name}
                        {item.secondaryUnit && (
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                            1 {item.secondaryUnit} = {item.conversionFactor || 1} {unitLabel}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{item.sku || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-extrabold text-sm text-slate-900">
                        {qty} <span className="text-xs text-slate-500 font-bold">{unitLabel}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">{minStock} {unitLabel}</td>
                      <td className="px-4 py-3.5 w-36">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(10, percent)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={qty <= 0 ? 'Out of Stock' : (isLow ? 'Low Stock' : 'In Stock')} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedProductForAdjust(item); setModalInitialType('RECONCILE'); }}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                            title="Physical Stock Audit Reconciliation"
                          >
                            <Scale size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedProductForAdjust(item); setModalInitialType('DAMAGE'); }}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 transition-all cursor-pointer shadow-2xs"
                            title="Write-Off Damaged / Lost Stock"
                          >
                            <AlertOctagon size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedProductForAdjust(item); setModalInitialType('ADD'); }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <SlidersHorizontal size={13} /> Adjust Stock
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

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="products"
        />
      </div>

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={!!selectedProductForAdjust}
        onClose={() => setSelectedProductForAdjust(null)}
        product={selectedProductForAdjust}
        initialType={modalInitialType}
        toast={toast}
      />

      {/* Stock History Audit Log Modal */}
      <StockHistoryModal
        isOpen={stockHistoryModalOpen}
        onClose={() => setStockHistoryModalOpen(false)}
      />

      {/* Expiry Risk Intelligence Modal */}
      <ExpiryAlertsModal
        isOpen={expiryModalOpen}
        onClose={() => setExpiryModalOpen(false)}
        onSelectProductForAdjust={(prod) => {
          setSelectedProductForAdjust(prod);
          setModalInitialType('DAMAGE');
        }}
      />
    </div>
  );
};

export default InventoryListPage;
