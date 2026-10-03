import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Upload,
  Download,
  Eye,
  Printer,
  Loader2,
  ChevronRight,
  Link2,
  Share2,
  AlertTriangle,
  Sparkles,
  X,
  ShoppingCart
} from 'lucide-react';
import { usePurchaseBillsQuery, useReorderSuggestionsQuery } from '../hooks/usePurchaseQueries';
import { useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQueries';
import purchaseService from '../../../services/purchaseService';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/common/Pagination';

// Sub-components
import PurchaseSummaryKpiCards from '../components/PurchaseSummaryKpiCards';
import PurchaseBillsFilterBar from '../components/PurchaseBillsFilterBar';
import PrintableBillModal from '../components/PrintableBillModal';
import { downloadPurchaseBillPdf, printPurchaseBillPdf, openPurchaseBillPdfInNewTab } from '../utils/purchaseBillPrintUtil';

const PurchaseBillsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [reorderModalOpen, setReorderModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPrintBill, setSelectedPrintBill] = useState(null);
  const [selectedBillIds, setSelectedBillIds] = useState([]);

  // Fetch Suppliers for dropdown
  const { data: supplierRes } = useSuppliersQuery({ limit: 100 });
  const suppliers = Array.isArray(supplierRes?.items)
    ? supplierRes.items
    : Array.isArray(supplierRes?.data?.items)
      ? supplierRes.data.items
      : Array.isArray(supplierRes?.suppliers)
        ? supplierRes.suppliers
        : Array.isArray(supplierRes?.data?.suppliers)
          ? supplierRes.data.suppliers
          : Array.isArray(supplierRes?.data)
            ? supplierRes.data
            : [];

  // Fetch Automated Purchase Reorder Suggestions
  const { data: reorderRes, isLoading: isReorderLoading } = useReorderSuggestionsQuery();
  const reorderPayload = reorderRes?.data || reorderRes || {};
  const reorderSuggestions = Array.isArray(reorderPayload.suggestions)
    ? reorderPayload.suggestions
    : Array.isArray(reorderPayload.items)
    ? reorderPayload.items
    : Array.isArray(reorderPayload)
    ? reorderPayload
    : [];

  // Fetch Purchase Bills
  const { data: responseData, isLoading, isError, refetch } = usePurchaseBillsQuery({
    search: searchQuery,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : (activeTab !== 'ALL' ? activeTab : undefined),
    supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
    page: currentPage,
    limit: pageSize,
  });

  const rawBills = Array.isArray(responseData?.items)
    ? responseData.items
    : Array.isArray(responseData?.data?.items)
      ? responseData.data.items
      : Array.isArray(responseData?.purchases)
        ? responseData.purchases
        : Array.isArray(responseData?.data?.purchases)
          ? responseData.data.purchases
          : Array.isArray(responseData?.bills)
            ? responseData.bills
            : Array.isArray(responseData?.data) && Array.isArray(responseData?.data?.items)
              ? responseData.data.items
              : Array.isArray(responseData?.data)
                ? responseData.data
                : [];

  const allBills = rawBills;

  const filteredBills = allBills.filter((bill) => {
    const billNo = (bill.purchaseNumber || bill.supplierInvoiceNumber || bill.purchaseOrderNumber || '').toLowerCase();
    const supName = (bill.supplier?.name || bill.supplierName || bill.supplier?.companyName || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    if (query && !billNo.includes(query) && !supName.includes(query)) return false;
    if (statusFilter !== 'ALL' && String(bill.status || bill.purchaseStatus).toUpperCase() !== statusFilter) return false;
    if (paymentStatusFilter !== 'ALL' && String(bill.paymentStatus).toUpperCase() !== paymentStatusFilter) return false;
    if (supplierFilter !== 'ALL' && bill.supplier?.id !== supplierFilter && bill.supplierId !== supplierFilter) return false;

    if (activeTab !== 'ALL') {
      const isOverdue = Boolean(
        bill.isOverdue ||
        (bill.dueDate && new Date(bill.dueDate) < new Date() && String(bill.paymentStatus).toUpperCase() !== 'PAID')
      );
      if (activeTab === 'OVERDUE' && !isOverdue) return false;
      if (activeTab === 'PARTIAL' && !['PARTIAL', 'PARTIALLY_PAID'].includes(String(bill.paymentStatus).toUpperCase())) return false;
      if (activeTab !== 'OVERDUE' && activeTab !== 'PARTIAL' && String(bill.paymentStatus).toUpperCase() !== activeTab && String(bill.status || bill.purchaseStatus).toUpperCase() !== activeTab) {
        return false;
      }
    }

    return true;
  });

  const pagination = responseData?.pagination || responseData?.data?.pagination || {
    total: filteredBills.length,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(filteredBills.length / pageSize) || 1,
  };

  const summary = responseData?.summary || responseData?.data?.summary || {};
  const statusCounts = responseData?.statusCounts || responseData?.data?.statusCounts || {};

  // Metrics with safe type casting & backend property fallback options
  const totalBills = Number(summary.totalBills ?? summary.totalCount ?? summary.count ?? pagination.total ?? allBills.length) || 0;

  const totalAmount = Number(
    summary.totalAmount ??
    summary.totalPurchaseAmount ??
    summary.totalSum ??
    allBills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0)
  ) || 0;

  const paidAmount = Number(
    summary.totalPaid ??
    summary.totalPaidAmount ??
    summary.paidAmount ??
    allBills.reduce((acc, b) => acc + (Number(b.paidAmount) || 0), 0)
  ) || 0;

  const dueAmount = Number(
    summary.totalDue ??
    summary.totalDueAmount ??
    summary.dueAmount ??
    summary.totalOutstanding ??
    allBills.reduce((acc, b) => {
      const bTotal = Number(b.totalAmount) || 0;
      const bPaid = Number(b.paidAmount) || 0;
      const bDue = b.dueAmount !== undefined && b.dueAmount !== null ? Number(b.dueAmount) : Math.max(0, bTotal - bPaid);
      return acc + bDue;
    }, 0)
  ) || 0;

  const overdueAmount = Number(
    summary.overdueAmount ??
    summary.totalOverdue ??
    summary.overdue ??
    allBills
      .filter((b) => Boolean(b.isOverdue || (b.dueDate && new Date(b.dueDate) < new Date() && String(b.paymentStatus).toUpperCase() !== 'PAID')))
      .reduce((acc, b) => {
        const bTotal = Number(b.totalAmount) || 0;
        const bPaid = Number(b.paidAmount) || 0;
        const bDue = b.dueAmount !== undefined && b.dueAmount !== null ? Number(b.dueAmount) : Math.max(0, bTotal - bPaid);
        return acc + bDue;
      }, 0)
  ) || 0;

  const handleExport = async (format = 'csv') => {
    try {
      toast.info(`Exporting Purchase Bills (${format.toUpperCase()})...`);
      await purchaseService.exportPurchaseBills({
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
        supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
        format,
      });
      toast.success('Purchase bills exported successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export purchase bills.');
    }
  };

  const isAllSelected = filteredBills.length > 0 && filteredBills.every((b) => selectedBillIds.includes(b.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(filteredBills.map((b) => b.id));
    }
  };

  const handleToggleSelectBill = (id) => {
    setSelectedBillIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedBillIds.length === 0) return;
    toast.info(`Exporting ${selectedBillIds.length} Selected Purchase Bills...`);
    const selectedBills = filteredBills.filter((b) => selectedBillIds.includes(b.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Bill No,Supplier,Date,Total Amount,Paid Amount,Due Amount,Status']
        .concat(
          selectedBills.map(
            (b) =>
              `"${b.purchaseNumber || b.id}","${b.supplier?.name || 'Supplier'}","${b.purchaseDate || ''}",${b.totalAmount || 0},${b.paidAmount || 0},${b.dueAmount || 0},"${b.paymentStatus || ''}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Selected_Purchase_Bills_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Selected bills exported to CSV!');
  };

  const getPaymentBadge = (status = 'UNPAID') => {
    const s = String(status).toUpperCase();
    if (s === 'PAID') return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200">Paid</span>;
    if (s === 'PARTIAL' || s === 'PARTIALLY_PAID') return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-[11px] rounded-full border border-amber-200">Partial</span>;
    return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold text-[11px] rounded-full border border-rose-200">Unpaid</span>;
  };

  const getBillBadge = (status = 'COMPLETED') => {
    const s = String(status).toUpperCase();
    if (s === 'COMPLETED' || s === 'CONFIRMED') return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200">Confirmed</span>;
    if (s === 'PARTIALLY_RETURNED') return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-[11px] rounded-full border border-amber-200">Partial Return</span>;
    if (s === 'FULLY_RETURNED' || s === 'RETURNED') return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold text-[11px] rounded-full border border-rose-200">Fully Returned</span>;
    if (s === 'DRAFT') return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-full border border-slate-200">Draft</span>;
    if (s === 'CANCELLED') return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-extrabold text-[11px] rounded-full border border-slate-200">Cancelled</span>;
    return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-[11px] rounded-full border border-amber-200">{s}</span>;
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-12 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span>Purchase</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">Purchase Bills</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Purchase Bills</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Manage vendor purchase invoices, inventory receipts, and dues.
          </p>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto shrink-0 py-0.5">
          {reorderSuggestions.length > 0 && (
            <button
              onClick={() => setReorderModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer animate-pulse whitespace-nowrap"
              title="Automated Stock Reorder Suggestions"
            >
              <Sparkles size={16} />
              <span>Reorder Suggestions ({reorderSuggestions.length})</span>
            </button>
          )}

          <button
            onClick={() => navigate('/vendor/purchases/create')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Create Purchase Bill</span>
          </button>

          <button
            onClick={() => toast.info('Import functionality ready.')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <Upload size={16} className="text-slate-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title="Export Purchase Bills Report"
          >
            <Download size={16} className="text-indigo-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Automated Stock Reorder Alert Banner */}
      {reorderSuggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl font-bold shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                <span>Automated Inventory Reorder Alert</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] rounded-full font-black">
                  {reorderSuggestions.length} Low Stock Items
                </span>
              </h3>
              <p className="text-xs font-semibold text-amber-700 mt-0.5">
                Some items are running below reorder threshold. Click to view automated restock quantities & estimated budget.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setReorderModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          >
            Review Reorder List
          </button>
        </div>
      )}

      {/* 5 KPI Summary Cards Sub-Component */}
      <PurchaseSummaryKpiCards
        totalBills={totalBills}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        dueAmount={dueAmount}
        overdueAmount={overdueAmount}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Filter & Search Bar Sub-Component */}
      <PurchaseBillsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={(ps) => {
          setPaymentStatusFilter(ps);
          setCurrentPage(1);
        }}
        supplierFilter={supplierFilter}
        onSupplierFilterChange={(sup) => {
          setSupplierFilter(sup);
          setCurrentPage(1);
        }}
        suppliers={suppliers}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
          setPaymentStatusFilter('ALL');
          setSupplierFilter('ALL');
          setActiveTab('ALL');
          setCurrentPage(1);
          toast.info('Filters reset.');
        }}
        totalBillsCount={statusCounts.all ?? totalBills}
        paidCount={statusCounts.paid ?? allBills.filter(b => String(b.paymentStatus).toUpperCase() === 'PAID').length}
        partialCount={statusCounts.partial ?? allBills.filter(b => ['PARTIAL', 'PARTIALLY_PAID'].includes(String(b.paymentStatus).toUpperCase())).length}
        unpaidCount={statusCounts.unpaid ?? allBills.filter(b => ['UNPAID', 'PENDING'].includes(String(b.paymentStatus).toUpperCase())).length}
        overdueCount={statusCounts.overdue ?? allBills.filter(b => Boolean(b.isOverdue || (b.dueDate && new Date(b.dueDate) < new Date() && String(b.paymentStatus).toUpperCase() !== 'PAID'))).length}
        cancelledCount={statusCounts.cancelled ?? allBills.filter(b => ['CANCELLED', 'CANCELED'].includes(String(b.status || b.purchaseStatus).toUpperCase())).length}
      />

      {/* Floating Bulk Action Bar */}
      {selectedBillIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-900 text-white rounded-2xl shadow-lg border border-indigo-700 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
              {selectedBillIds.length}
            </span>
            <span className="text-xs font-extrabold tracking-wide">
              {selectedBillIds.length} Purchase Bill{selectedBillIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelected}
              className="px-3 py-1.5 bg-white text-indigo-900 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Export Selected (CSV)
            </button>
            <button
              onClick={() => setSelectedBillIds([])}
              className="px-3 py-1.5 bg-indigo-800/80 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Bill No.</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-4">Bill Date</th>
                <th className="py-4 px-4">Due Date</th>
                <th className="py-4 px-4 text-center">Items</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Paid Amount</th>
                <th className="py-4 px-4">Due Amount</th>
                <th className="py-4 px-4">Payment Status</th>
                <th className="py-4 px-4">Bill Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <Loader2 size={32} className="mx-auto text-indigo-600 animate-spin" />
                    <div className="font-bold text-slate-700 mt-2">Loading purchase bills...</div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 space-y-2">
                    <FileText size={32} className="mx-auto text-slate-300" />
                    <div className="font-bold text-slate-700">No Purchase Bills Found</div>
                    <p className="text-xs text-slate-400">Try adjusting your search query, status filters, or supplier selection.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const billNo = bill.purchaseNumber || bill.supplierInvoiceNumber || bill.id;
                  const supplierName = bill.supplier?.name || bill.supplier?.companyName || bill.supplierName || bill.companyName || 'Supplier';
                  const supplierCity = bill.supplier?.city || bill.supplier?.state || bill.city || '-';
                  const totalAmt = bill.totalAmount || 0;
                  const paidAmt = bill.paidAmount || 0;
                  const dueAmt = (bill.dueAmount !== undefined && bill.dueAmount !== null)
                    ? Number(bill.dueAmount)
                    : Math.max(0, totalAmt - paidAmt);
                  const itemCount = bill.itemsCount ?? bill._count?.items ?? bill.totalItems ?? (Array.isArray(bill.items) ? bill.items.length : 0);
                  const isSelected = selectedBillIds.includes(bill.id);

                  return (
                    <tr key={bill.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectBill(bill.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 font-mono font-extrabold text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate(`/vendor/purchases/${bill.id}`)}>
                        {billNo}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900">{supplierName}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{supplierCity}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {bill.purchaseDate || bill.invoiceDate ? new Date(bill.purchaseDate || bill.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={bill.isOverdue ? 'text-rose-600 font-black' : 'text-slate-600'}>
                          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700">{itemCount}</td>
                      <td className="py-4 px-4 font-black text-slate-900">₹{Number(totalAmt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-4 px-4 font-extrabold text-emerald-600">₹{Number(paidAmt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-4 px-4 font-black text-rose-600">₹{Number(dueAmt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-4 px-4">{getPaymentBadge(bill.paymentStatus)}</td>
                      <td className="py-4 px-4">{getBillBadge(bill.purchaseStatus || bill.status)}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/vendor/purchases/${bill.id}`)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200/60"
                            title="View Purchase Bill"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                toast.info('Opening Print Window...');
                                await printPurchaseBillPdf(bill);
                              } catch (err) {
                                toast.error('Failed to print bill.');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Print Tax Invoice"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/public/purchases/${bill.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              toast.success('Purchase bill link copied to clipboard!');
                            }}
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors border border-sky-200 cursor-pointer"
                            title="Copy Shareable Bill Link"
                          >
                            <Link2 size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const shareUrl = `${window.location.origin}/public/purchases/${bill.id}`;
                                const text = `Hi, please view/download Purchase Bill #${bill.purchaseNumber || 'Details'} Tax Invoice PDF:\n\n${shareUrl}`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              } catch (err) {
                                toast.error('Failed to share PDF link.');
                              }
                            }}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                            title="Share PDF Link via WhatsApp"
                          >
                            <Share2 size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                toast.info('Downloading PDF...');
                                await downloadPurchaseBillPdf(bill);
                                toast.success('PDF downloaded successfully!');
                              } catch (err) {
                                toast.error('Failed to download PDF.');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Instant Download PDF"
                          >
                            <Download size={15} />
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
          totalItems={pagination.total || rawBills.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="bills"
        />
      </div>

      {/* Printable Professional GST Invoice Modal */}
      <PrintableBillModal
        isOpen={Boolean(selectedPrintBill)}
        onClose={() => setSelectedPrintBill(null)}
        bill={selectedPrintBill}
      />

      {/* Reorder Suggestions Modal */}
      {reorderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Automated Purchase Reorder Suggestions</h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Products at or below reorder level with recommended restock quantities & estimated budget.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReorderModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              <div className="w-full overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Current Stock</th>
                      <th className="px-4 py-3 text-center">Reorder Level</th>
                      <th className="px-4 py-3 text-center">Suggested Qty</th>
                      <th className="px-4 py-3 text-right">Est. Unit Price</th>
                      <th className="px-4 py-3 text-right">Est. Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {reorderSuggestions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-bold">
                          All product inventory levels are healthy! No items currently require reordering.
                        </td>
                      </tr>
                    ) : (
                      reorderSuggestions.map((item, idx) => (
                        <tr key={item.productId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-extrabold text-slate-900">{item.productName}</div>
                            {item.sku && <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium">
                            {item.categoryName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 font-black rounded-full border border-rose-200 text-[11px]">
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-600">
                            {item.reorderLevel} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-black rounded-full border border-emerald-200 text-[11px]">
                              +{item.suggestedOrderQuantity} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                            ₹{Number(item.purchasePrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">
                            ₹{Number(item.estimatedCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="text-xs font-bold text-slate-500">
                Total Est. Restock Budget: <span className="font-mono font-black text-slate-900 text-sm">₹{reorderSuggestions.reduce((acc, i) => acc + (Number(i.estimatedCost) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReorderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReorderModalOpen(false);
                    navigate('/vendor/purchases/create');
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Create Purchase Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseBillsListPage;
