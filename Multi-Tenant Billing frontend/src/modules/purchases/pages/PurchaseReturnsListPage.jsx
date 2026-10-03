import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RotateCcw,
  Plus,
  Download,
  Eye,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { usePurchaseReturnsQuery } from '../hooks/usePurchaseQueries';
import { useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQueries';
import purchaseService from '../../../services/purchaseService';
import { useToast } from '../../../context/ToastContext';

const PurchaseReturnsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Suppliers
  const { data: supplierRes } = useSuppliersQuery({ limit: 100 });
  const suppliers = Array.isArray(supplierRes?.suppliers)
    ? supplierRes.suppliers
    : Array.isArray(supplierRes?.data?.suppliers)
    ? supplierRes.data.suppliers
    : Array.isArray(supplierRes?.data)
    ? supplierRes.data
    : [];

  // Fetch Purchase Returns
  const { data: responseData, isLoading, refetch } = usePurchaseReturnsQuery({
    search: searchQuery,
    supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
    page: currentPage,
    limit: pageSize,
  });

  const rawReturns = Array.isArray(responseData?.items)
    ? responseData.items
    : Array.isArray(responseData?.data?.items)
    ? responseData.data.items
    : Array.isArray(responseData?.returns)
    ? responseData.returns
    : Array.isArray(responseData?.data?.returns)
    ? responseData.data.returns
    : Array.isArray(responseData?.data)
    ? responseData.data
    : [];

  const returnsList = rawReturns;

  const handleExport = async (format = 'csv') => {
    try {
      toast.info(`Exporting Purchase Returns (${format.toUpperCase()})...`);
      await purchaseService.exportPurchaseReturns({
        search: searchQuery,
        supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
        format,
      });
      toast.success('Purchase returns report exported successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export purchase returns.');
    }
  };

  const totalReturnAmount = returnsList.reduce((acc, r) => acc + (r.totalReturnAmount || r.refundAmount || 0), 0);
  const totalItemsReturned = returnsList.reduce((acc, r) => acc + (r.totalItemsReturned || 1), 0);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 pb-12 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/purchases" className="hover:text-indigo-600 transition-colors">
          Purchase
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">Purchase Returns</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Purchase Returns</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Track item returns, debit notes, defective stock reversals, and refunds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/vendor/purchases/returns/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Create Purchase Return</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <Download size={16} className="text-indigo-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Returns</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{returnsList.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <RotateCcw size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Return Value</div>
            <div className="text-2xl font-black text-rose-600 mt-1">₹{totalReturnAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
            ₹
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Returned</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalItemsReturned} Units</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            📦
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refund Method</div>
            <div className="text-base font-black text-emerald-700 mt-1">Cash / Credit Note</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            💳
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Return # or Supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.companyName}</option>
            ))}
          </select>

          <button
            onClick={() => { setSearchQuery(''); setSupplierFilter('ALL'); refetch(); }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Returns Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Return Number</th>
                <th className="py-3.5 px-4">Bill Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Refund Type</th>
                <th className="py-3.5 px-4 text-right">Return Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {returnsList.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-mono font-black text-amber-700">
                    <Link to={`/vendor/purchases/returns/${ret.id}`} className="hover:underline">
                      {ret.returnNumber || ret.id}
                    </Link>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-indigo-600">
                    {ret.purchaseNumber || ret.purchaseInvoice?.purchaseNumber || 'PUR-REF'}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">
                    {ret.supplier?.name || ret.supplierName || 'Vendor Supplier'}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-600">
                    {ret.returnDate ? new Date(ret.returnDate).toLocaleDateString('en-IN') : '21 Aug 2025'}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600">
                    {ret.returnReason || 'Damaged / Defective'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-200">
                      {ret.refundType || 'CASH_REFUND'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-rose-600">
                    ₹{(ret.totalReturnAmount || ret.refundAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => navigate(`/vendor/purchases/returns/${ret.id}`)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="View Return Details"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnsListPage;
