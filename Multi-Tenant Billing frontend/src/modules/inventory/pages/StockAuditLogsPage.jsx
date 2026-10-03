import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  ChevronRight,
  Download,
  Search,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useStockHistoryQuery } from '../hooks/useInventoryQueries';
import Pagination from '../../../components/common/Pagination';
import axiosInstance from '../../../api/axiosInstance';
import { useToast } from '../../../context/ToastContext';

const REASON_OPTIONS = [
  { id: 'ALL', label: 'All Reasons' },
  { id: 'PURCHASE', label: 'Purchase' },
  { id: 'SALE', label: 'Sale' },
  { id: 'SALES_RETURN', label: 'Sales Return' },
  { id: 'PURCHASE_RETURN', label: 'Purchase Return' },
  { id: 'STOCK_ADJUSTMENT', label: 'Adjustment' },
  { id: 'DAMAGE', label: 'Damaged' },
  { id: 'CANCELLED_BILL', label: 'Cancelled Bill' },
  { id: 'LOST', label: 'Lost / Stolen' },
];

const StockAuditLogsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Filter & Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Stock History Logs
  const { data: rawLogs, isLoading, isFetching, refetch } = useStockHistoryQuery({
    search: searchQuery || undefined,
    reason: reasonFilter !== 'ALL' ? reasonFilter : undefined,
  });

  const handleRefreshLogs = async () => {
    try {
      await refetch();
      toast?.success?.('Stock audit logs refreshed!');
    } catch (err) {
      toast?.error?.('Failed to refresh audit logs.');
    }
  };

  const logsList = Array.isArray(rawLogs)
    ? rawLogs
    : Array.isArray(rawLogs?.data)
    ? rawLogs.data
    : Array.isArray(rawLogs?.items)
    ? rawLogs.items
    : [];

  // Frontend Filter by Search Query & Reason
  const filteredLogs = logsList.filter((log) => {
    if (!log) return false;
    const query = searchQuery.trim().toLowerCase();

    const prodName = String(log.productName || log.product?.name || '').toLowerCase();
    const sku = String(log.sku || log.product?.sku || '').toLowerCase();
    const notes = String(log.notes || '').toLowerCase();

    if (query && !prodName.includes(query) && !sku.includes(query) && !notes.includes(query)) {
      return false;
    }

    if (reasonFilter !== 'ALL') {
      const rawReason = String(log.reason || '').toUpperCase();
      if (rawReason !== reasonFilter) return false;
    }

    return true;
  });

  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const displayLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export File Handler (Excel / CSV)
  const handleExport = async (format = 'xlsx') => {
    setIsExporting(true);
    try {
      toast.info(`Exporting stock audit logs (${format.toUpperCase()})...`);
      const response = await axiosInstance.get('/inventory/export', {
        params: { format, reason: reasonFilter !== 'ALL' ? reasonFilter : undefined },
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `stock_audit_logs_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Stock audit logs exported (${format.toUpperCase()})!`);
    } catch (err) {
      toast.error('Failed to export stock audit logs.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateDisplay = (rawDate) => {
    if (!rawDate) return { date: 'N/A', time: '' };
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return { date: String(rawDate), time: '' };

      const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date, time };
    } catch (e) {
      return { date: String(rawDate), time: '' };
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 animate-fadeIn font-sans pb-16">
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
            <span className="text-slate-900 font-extrabold">Stock Audit Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="text-indigo-600" size={26} />
            Stock Movement Audit Logs & Ledger
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Track historical stock movements, sales deductions, purchases, returns, and manual write-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefreshLogs}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-300 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} className="text-slate-600" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/vendor/inventory')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by product name, SKU, or notes..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        {/* Reason Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {REASON_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setReasonFilter(opt.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                reasonFilter === opt.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Compact Audit Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm overflow-hidden space-y-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-2.5 text-center w-10">#</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Date & Time</th>
                <th className="px-3 py-2.5">Product & SKU</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap">Stock Flow (Prev → New)</th>
                <th className="px-3 py-2.5 text-center whitespace-nowrap">Movement</th>
                <th className="px-3 py-2.5 text-center">Reason</th>
                <th className="px-3 py-2.5">Notes</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Updated By</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    Loading stock audit history logs...
                  </td>
                </tr>
              ) : displayLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-bold">
                    No stock movement audit records match your query.
                  </td>
                </tr>
              ) : (
                displayLogs.map((log, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const change = log.changeQty ?? log.addedRemovedQty ?? 0;
                  const isPositive = change > 0;
                  const { date, time } = formatDateDisplay(log.date || log.createdAt);

                  const prodName = log.productName || log.product?.name || 'Stock Item';
                  const sku = log.sku || log.product?.sku || '-';
                  const unitLabel = log.movementUnit || log.product?.unit || 'Pcs';
                  const reason = String(log.reason || 'STOCK_ADJUSTMENT').toUpperCase();

                  const prevStock = Number(log.previousStock || 0);
                  const updatedStock = Number(log.updatedStock || 0);

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-center font-bold text-slate-400 text-xs">{itemIndex}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-extrabold text-slate-800 text-[11px]">{date}</div>
                        {time && <div className="text-[10px] text-slate-400 font-mono">{time}</div>}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">
                        <div className="max-w-[200px] truncate" title={prodName}>{prodName}</div>
                        {sku !== '-' && <span className="text-[10px] text-slate-400 font-mono block">SKU: {sku}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className="font-mono text-slate-500 font-bold">{prevStock}</span>
                        <ArrowRight size={12} className="inline-block mx-1.5 text-slate-400" />
                        <span className="font-mono font-black text-slate-900">{updatedStock}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {isPositive ? `+${change}` : change} {unitLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 font-extrabold text-[10px] rounded-md uppercase border ${
                            reason === 'PURCHASE' || reason === 'NEW_PURCHASE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : reason === 'SALE'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : reason === 'DAMAGE' || reason === 'LOST'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : reason === 'SALES_RETURN' || reason === 'PURCHASE_RETURN'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {reason}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 font-medium text-xs max-w-[160px] truncate" title={log.notes || '-'}>
                        {log.notes || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 font-bold whitespace-nowrap">{log.updatedBy || log.updatedByUser?.name || 'Admin'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Component */}
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
          itemName="audit movement logs"
        />
      </div>
    </div>
  );
};

export default StockAuditLogsPage;
