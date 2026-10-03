import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Edit,
  CreditCard,
  MoreVertical,
  Wallet,
  ShoppingCart,
  FileText,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

import {
  useSupplierQuery,
  useSuppliersQuery,
  useSupplierLedgerQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from '../hooks/useSuppliersQueries';
import { usePurchaseBillsQuery } from '../../purchases/hooks/usePurchaseQueries';
import { useToast } from '../../../context/ToastContext';
import StatusBadge from '../../../components/common/StatusBadge';
import SupplierModal from '../components/SupplierModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import BaseModal from '../../../components/common/BaseModal';
import Pagination from '../../../components/common/Pagination';

const SupplierDetailsPage = () => {
  const navigate = useNavigate();
  const { supplierId, id } = useParams();
  const toast = useToast();

  const currentSupplierId = supplierId || id;

  // Active Tab state
  const [activeTab, setActiveTab] = useState('Overview');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Pagination States for Tabs
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePageSize, setPurchasePageSize] = useState(10);

  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  // Queries & Mutations
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useSupplierQuery(currentSupplierId);

  const { data: suppliersListRes } = useSuppliersQuery({ limit: 100 });

  const { data: purchaseBillsRes } = usePurchaseBillsQuery({
    supplierId: currentSupplierId,
    limit: 200,
  });

  const { data: ledgerRes, isLoading: isLedgerLoading } = useSupplierLedgerQuery(currentSupplierId);

  const updateSupplierMutation = useUpdateSupplierMutation();
  const deleteSupplierMutation = useDeleteSupplierMutation();

  // 1. All Suppliers list fallback lookup
  const allSuppliers = Array.isArray(suppliersListRes?.items)
    ? suppliersListRes.items
    : Array.isArray(suppliersListRes?.data?.items)
      ? suppliersListRes.data.items
      : Array.isArray(suppliersListRes?.suppliers)
        ? suppliersListRes.suppliers
        : Array.isArray(suppliersListRes?.data?.suppliers)
          ? suppliersListRes.data.suppliers
          : Array.isArray(suppliersListRes?.data)
            ? suppliersListRes.data
            : [];

  const supplierFromList = allSuppliers.find((s) => String(s.id) === String(currentSupplierId)) || {};

  // 2. Data extraction from backend response (GET /suppliers/:id)
  const supplierInfo =
    responseData?.supplierInformation ||
    responseData?.data?.supplierInformation ||
    responseData?.supplier ||
    responseData?.data?.supplier ||
    (responseData?.name ? responseData : null) ||
    (responseData?.data?.name ? responseData.data : null) ||
    {};

  const lifetimeStats =
    responseData?.lifetimeStats ||
    responseData?.data?.lifetimeStats ||
    {};

  const purchaseSummary =
    responseData?.purchaseSummary ||
    responseData?.data?.purchaseSummary ||
    {};

  const paymentSummary =
    responseData?.paymentSummary ||
    responseData?.data?.paymentSummary ||
    {};

  const livePurchasesFromQuery = Array.isArray(purchaseBillsRes?.items)
    ? purchaseBillsRes.items
    : Array.isArray(purchaseBillsRes?.data?.items)
      ? purchaseBillsRes.data.items
      : Array.isArray(purchaseBillsRes?.purchases)
        ? purchaseBillsRes.purchases
        : Array.isArray(purchaseBillsRes?.data?.purchases)
          ? purchaseBillsRes.data.purchases
          : Array.isArray(purchaseBillsRes?.data)
            ? purchaseBillsRes.data
            : [];

  const purchaseHistoryFromRes =
    Array.isArray(responseData?.purchaseHistory)
      ? responseData.purchaseHistory
      : Array.isArray(responseData?.data?.purchaseHistory)
        ? responseData.data.purchaseHistory
        : livePurchasesFromQuery;

  const paymentHistoryFromRes =
    Array.isArray(responseData?.paymentHistory)
      ? responseData.paymentHistory
      : Array.isArray(responseData?.data?.paymentHistory)
        ? responseData.data.paymentHistory
        : Array.isArray(supplierInfo?.supplierPayments)
          ? supplierInfo.supplierPayments
          : Array.isArray(supplierInfo?.payments)
            ? supplierInfo.payments
            : [];

  const supplierFromBill = (
    livePurchasesFromQuery.find((b) => b.supplier && (String(b.supplier.id) === String(currentSupplierId) || String(b.supplierId) === String(currentSupplierId)))?.supplier || {}
  );

  const targetSupplier = {
    ...supplierFromBill,
    ...supplierFromList,
    ...supplierInfo,
  };

  const sName = targetSupplier.name || targetSupplier.companyName || 'Supplier';
  const sMobile = targetSupplier.mobileNumber || targetSupplier.mobile || targetSupplier.phone || targetSupplier.contactNumber || '-';
  const sEmail = targetSupplier.email || '-';
  const sGstin = targetSupplier.gstin || targetSupplier.gstNumber || targetSupplier.gst || '-';
  const sPan = targetSupplier.pan || '-';

  const rawAddress = targetSupplier.address || targetSupplier.street || '';
  const city = targetSupplier.city || '';
  const state = targetSupplier.state || '';
  const pincode = targetSupplier.pincode || '';

  let fullAddress = rawAddress;
  if (fullAddress) {
    if (city && !fullAddress.toLowerCase().includes(city.toLowerCase())) fullAddress += `, ${city}`;
    if (state && !fullAddress.toLowerCase().includes(state.toLowerCase())) fullAddress += `, ${state}`;
    if (pincode && !fullAddress.includes(pincode)) fullAddress += ` - ${pincode}`;
  } else {
    fullAddress = [city, state, pincode].filter(Boolean).join(', ');
  }

  // Formatters
  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}.00`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name = '') => {
    if (!name || name === 'Supplier') return 'SUP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const supplier = {
    id: targetSupplier.id || currentSupplierId,
    name: sName,
    companyName: targetSupplier.companyName || sName,
    mobile: sMobile,
    mobileNumber: sMobile,
    email: sEmail,
    gstin: sGstin,
    pan: sPan,
    address: fullAddress || '-',
    city: city || '-',
    state: state || '-',
    joiningDate: (targetSupplier.createdAt || targetSupplier.joiningDate) ? formatDate(targetSupplier.createdAt || targetSupplier.joiningDate) : '-',
    supplierType: targetSupplier.supplierType || targetSupplier.type || 'Local',
    creditLimit: Number(targetSupplier.creditLimit || 0),
    paymentTerms: targetSupplier.paymentTerms || targetSupplier.terms || '30 Days',
    status: targetSupplier.status || 'ACTIVE',
  };

  const purchaseHistory = Array.isArray(purchaseHistoryFromRes) ? purchaseHistoryFromRes : [];
  const paymentHistory = Array.isArray(paymentHistoryFromRes) ? paymentHistoryFromRes : [];

  // Metrics calculations
  const realTotalPurchases = purchaseHistory.reduce((acc, p) => acc + (Number(p.totalAmount || p.grandTotal || p.amount) || 0), 0);
  const realTotalPaid = purchaseHistory.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0) + paymentHistory.reduce((acc, pay) => acc + (Number(pay.amount) || 0), 0);

  const totalPurchasesAmount = Number(
    lifetimeStats.totalPurchases ??
    targetSupplier.totalPurchases ??
    targetSupplier.totalPurchaseAmount ??
    realTotalPurchases
  );

  const totalPaidAmount = Number(
    lifetimeStats.totalPaid ??
    paymentSummary.totalPaid ??
    targetSupplier.totalPaid ??
    targetSupplier.totalPaidAmount ??
    realTotalPaid
  );

  const totalPayableAmount = Number(
    lifetimeStats.totalPayable ??
    lifetimeStats.outstandingDue ??
    paymentSummary.currentBalance ??
    targetSupplier.outstandingDue ??
    targetSupplier.outstandingBalance ??
    targetSupplier.dueAmount ??
    (totalPurchasesAmount - totalPaidAmount)
  );

  const totalBillsCount = purchaseSummary.totalBills ?? purchaseHistory.length;
  const totalItemsCount = purchaseSummary.totalItems ?? purchaseHistory.reduce((acc, p) => acc + (Array.isArray(p.items) ? p.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) : (p.itemsCount || 1)), 0);
  const avgBillValue = purchaseSummary.avgBillValue ?? (totalBillsCount > 0 ? totalPurchasesAmount / totalBillsCount : 0);
  const totalPaymentsCount = paymentSummary.totalPayments ?? paymentHistory.length;

  const lastPurchaseBill = purchaseHistory.length > 0 ? purchaseHistory[0] : null;
  const rawLastPurchaseDate = lifetimeStats.lastPurchaseDate || purchaseSummary.lastPurchaseDate || lastPurchaseBill?.purchaseDate || lastPurchaseBill?.invoiceDate || lastPurchaseBill?.createdAt;
  const lastPurchaseDate = formatDate(rawLastPurchaseDate);

  const lastPayment = paymentHistory.length > 0 ? paymentHistory[0] : null;
  const rawLastPaymentDate = paymentSummary.lastPaymentDate || lastPayment?.paymentDate || lastPayment?.createdAt;
  const lastPaymentDate = formatDate(rawLastPaymentDate);

  // Ledger Data extraction
  const ledgerData = ledgerRes?.data || ledgerRes || {};
  const ledgerSummary = ledgerData.statementSummary || {};
  const ledgerEntries = Array.isArray(ledgerData.ledgerEntries) ? ledgerData.ledgerEntries : [];

  // Paginated Data & Totals for Tabs
  const totalPurchaseItemsCount = purchaseHistory.length;
  const totalPurchasePages = Math.ceil(totalPurchaseItemsCount / purchasePageSize) || 1;
  const paginatedPurchaseHistory = purchaseHistory.slice(
    (purchasePage - 1) * purchasePageSize,
    purchasePage * purchasePageSize
  );

  const totalPaymentItemsCount = paymentHistory.length;
  const totalPaymentPages = Math.ceil(totalPaymentItemsCount / paymentPageSize) || 1;
  const paginatedPaymentHistory = paymentHistory.slice(
    (paymentPage - 1) * paymentPageSize,
    paymentPage * paymentPageSize
  );

  const totalLedgerItemsCount = ledgerEntries.length;
  const totalLedgerPages = Math.ceil(totalLedgerItemsCount / ledgerPageSize) || 1;
  const paginatedLedgerEntries = ledgerEntries.slice(
    (ledgerPage - 1) * ledgerPageSize,
    ledgerPage * ledgerPageSize
  );

  const handleDeleteSupplier = async () => {
    try {
      await deleteSupplierMutation.mutateAsync(currentSupplierId);
      toast.success('Supplier deleted successfully');
      navigate('/vendor/suppliers');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete supplier');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading supplier details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h3 className="text-base font-extrabold text-slate-900">Failed to load supplier details</h3>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-4 pb-12 animate-fadeIn font-sans">
      {/* 1. TOP BREADCRUMB HEADER */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/suppliers" className="hover:text-indigo-600 transition-colors">
          Suppliers
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">{supplier.name}</span>
      </div>

      {/* 2. MAIN SUPPLIER CARD - COMPACT HEADER */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Avatar & Supplier Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center shrink-0 shadow-inner">
              {getInitials(supplier.name)}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {supplier.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                  {supplier.status}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  • {[supplier.city, supplier.state].filter((c) => c && c !== '-').join(', ') || supplier.address}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" />
                  <span>{supplier.mobile}</span>
                </span>
                {supplier.email !== '-' && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    <span>{supplier.email}</span>
                  </span>
                )}
                {supplier.gstin !== '-' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-indigo-50 text-indigo-700">
                    GST: {supplier.gstin}
                  </span>
                )}
                {supplier.pan !== '-' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-slate-100 text-slate-700">
                    PAN: {supplier.pan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions & Metadata Info Grid */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 shrink-0">
            {/* Metadata Badges */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <div>Type: <span className="text-slate-900 font-extrabold">{supplier.supplierType}</span></div>
              <div className="w-px h-3 bg-slate-200" />
              <div>Terms: <span className="text-slate-900 font-extrabold">{supplier.paymentTerms}</span></div>
              {supplier.creditLimit > 0 && (
                <>
                  <div className="w-px h-3 bg-slate-200" />
                  <div>Limit: <span className="text-slate-900 font-black">{formatCurrency(supplier.creditLimit)}</span></div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <CreditCard size={14} />
                <span>Record Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-1.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-300 rounded-xl transition-all cursor-pointer"
                title="Delete Supplier"
              >
                <MoreVertical size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 TOP KPI CARDS - COMPACT HEIGHT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Purchases */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Total Purchases</div>
            <div className="text-base font-black text-slate-900 truncate">{formatCurrency(totalPurchasesAmount)}</div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Total Paid</div>
            <div className="text-base font-black text-emerald-600 truncate">{formatCurrency(totalPaidAmount)}</div>
          </div>
        </div>

        {/* Total Payable */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Total Payable</div>
            <div className="text-base font-black text-rose-600 truncate">{formatCurrency(totalPayableAmount)}</div>
          </div>
        </div>

        {/* Last Purchase */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Last Purchase</div>
            <div className="text-sm font-black text-slate-900 truncate">{lastPurchaseDate}</div>
          </div>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-extrabold overflow-x-auto">
        {['Overview', 'Purchase History', 'Payment History', 'Ledger', 'Documents'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-3 relative cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === tab ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {tab === 'Overview' && <FileText size={14} />}
              {tab === 'Purchase History' && <ShoppingCart size={14} />}
              {tab === 'Payment History' && <CreditCard size={14} />}
              {tab === 'Ledger' && <Wallet size={14} />}
              {tab === 'Documents' && <FileText size={14} />}
              <span>{tab}</span>
            </div>
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 5. TAB CONTENT */}
      {/* 5. TAB CONTENT */}
      {/* OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT COLUMN: PURCHASE SUMMARY & RECENT PURCHASES */}
          <div className="space-y-4">
            {/* Purchase Summary Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-xs uppercase tracking-wide">
                <ShoppingCart size={15} className="text-indigo-600" />
                <span>Purchase Summary</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Bills</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{totalBillsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Items</div>
                  <div className="text-base font-black text-indigo-600 mt-0.5">{totalItemsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Avg. Bill Value</div>
                  <div className="text-base font-black text-amber-600 mt-0.5">{formatCurrency(avgBillValue)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Last Purchase</div>
                  <div className="text-xs font-black text-sky-600 mt-0.5">{lastPurchaseDate}</div>
                </div>
              </div>
            </div>

            {/* Recent Purchase History Table */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">Recent Purchase History</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('Purchase History')}
                  className="px-2.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-2 w-8 text-center">#</th>
                      <th className="py-2 px-2">Bill No.</th>
                      <th className="py-2 px-2">Bill Date</th>
                      <th className="py-2 px-2 text-center">Items</th>
                      <th className="py-2 px-2 text-right">Total Amount</th>
                      <th className="py-2 px-2 text-right">Paid</th>
                      <th className="py-2 px-2 text-right">Due</th>
                      <th className="py-2 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-slate-400 font-bold">
                          No purchase bills recorded for this supplier yet.
                        </td>
                      </tr>
                    ) : (
                      purchaseHistory.slice(0, 5).map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2 font-mono font-extrabold text-indigo-600">
                            <Link to={`/vendor/purchases/${row.id}`} className="hover:underline">
                              {row.purchaseNumber || row.supplierInvoiceNumber || (row.id ? `PUR-${row.id}` : '-')}
                            </Link>
                          </td>
                          <td className="py-2 px-2 text-slate-600">{formatDate(row.invoiceDate || row.purchaseDate || row.createdAt)}</td>
                          <td className="py-2 px-2 text-center text-slate-700">
                            {Array.isArray(row.items) ? row.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0) : (row.itemsCount || 1)}
                          </td>
                          <td className="py-2 px-2 text-right font-black text-slate-900">₹{Number(row.totalAmount || row.grandTotal || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-600">₹{Number(row.paidAmount || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-2 px-2 text-right font-bold text-rose-600">₹{Number(row.dueAmount || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-2 px-2 text-center">
                            <StatusBadge status={row.paymentStatus || 'PAID'} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PAYMENT SUMMARY & RECENT PAYMENTS */}
          <div className="space-y-4">
            {/* Payment Summary Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-xs uppercase tracking-wide">
                <CreditCard size={15} className="text-indigo-600" />
                <span>Payment Summary</span>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Paid</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{formatCurrency(totalPaidAmount)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Payments</div>
                  <div className="text-base font-black text-sky-600 mt-0.5">{totalPaymentsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Last Payment</div>
                  <div className="text-xs font-black text-sky-600 mt-0.5">{lastPaymentDate}</div>
                </div>
              </div>

              {/* Current Balance Pink Highlight Banner */}
              <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">Current Balance (Payable)</span>
                <span className="text-base font-black text-rose-600">{formatCurrency(totalPayableAmount)}</span>
              </div>
            </div>

            {/* Recent Payment History Table */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">Recent Payment History</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('Payment History')}
                  className="px-2.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-2 w-8 text-center">#</th>
                      <th className="py-2 px-2">Payment No.</th>
                      <th className="py-2 px-2">Payment Date</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                      <th className="py-2 px-2">Payment Method</th>
                      <th className="py-2 px-2">Reference</th>
                      <th className="py-2 px-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-400 font-bold">
                          No payments recorded for this supplier yet.
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.slice(0, 5).map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2 font-mono font-extrabold text-indigo-600">
                            {row.referenceNumber || row.refNo || (row.id ? `PAY-${row.id}` : '-')}
                          </td>
                          <td className="py-2 px-2 text-slate-600">{formatDate(row.paymentDate || row.createdAt)}</td>
                          <td className="py-2 px-2 text-right font-black text-emerald-600">₹{Number(row.amount || 0).toLocaleString('en-IN')}.00</td>
                          <td className="py-2 px-2 text-slate-700">{row.paymentMethod || 'CASH'}</td>
                          <td className="py-2 px-2 font-mono text-slate-600">{row.referenceNumber || row.reference || '-'}</td>
                          <td className="py-2 px-2 text-slate-400">{row.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE HISTORY TAB */}
      {activeTab === 'Purchase History' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-sm">All Purchase Bills ({totalPurchaseItemsCount})</h3>
            <button
              type="button"
              onClick={() => navigate(`/vendor/purchases/create?supplierId=${currentSupplierId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            >
              <Plus size={14} />
              <span>Create Purchase Bill</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px] bg-slate-50/60">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">Bill Number</th>
                  <th className="py-3 px-3">Supplier Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Items</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-right">Paid Amount</th>
                  <th className="py-3 px-3 text-right">Due Amount</th>
                  <th className="py-3 px-3 text-center">Payment Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {totalPurchaseItemsCount === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 font-bold">
                      No purchase bills recorded for this supplier.
                    </td>
                  </tr>
                ) : (
                  paginatedPurchaseHistory.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {(purchasePage - 1) * purchasePageSize + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-indigo-600">
                        <Link to={`/vendor/purchases/${row.id}`} className="hover:underline">
                          {row.purchaseNumber || (row.id ? `PUR-${row.id}` : '-')}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{row.supplierInvoiceNumber || 'N/A'}</td>
                      <td className="py-3.5 px-3 text-slate-600">{formatDate(row.invoiceDate || row.purchaseDate || row.createdAt)}</td>
                      <td className="py-3.5 px-3 text-center text-slate-700">
                        {Array.isArray(row.items) ? row.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0) : (row.itemsCount || 1)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-900">₹{Number(row.totalAmount || row.grandTotal || 0).toLocaleString('en-IN')}.00</td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-600">₹{Number(row.paidAmount || 0).toLocaleString('en-IN')}.00</td>
                      <td className="py-3.5 px-3 text-right font-bold text-rose-600">₹{Number(row.dueAmount || 0).toLocaleString('en-IN')}.00</td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={row.paymentStatus || 'PAID'} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Link
                          to={`/vendor/purchases/${row.id}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-[11px] font-extrabold transition-colors inline-block"
                        >
                          View Bill
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <Pagination
            currentPage={purchasePage}
            totalPages={totalPurchasePages}
            totalItems={totalPurchaseItemsCount}
            pageSize={purchasePageSize}
            onPageChange={(page) => setPurchasePage(page)}
            onPageSizeChange={(size) => {
              setPurchasePageSize(size);
              setPurchasePage(1);
            }}
            itemName="purchase bills"
          />
        </div>
      )}

      {/* PAYMENT HISTORY TAB */}
      {activeTab === 'Payment History' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-sm">All Supplier Payments ({totalPaymentItemsCount})</h3>
            <button
              type="button"
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            >
              <CreditCard size={14} />
              <span>Record Payment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px] bg-slate-50/60">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">Payment Ref</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Reference / Cheque #</th>
                  <th className="py-3 px-3">Recorded By</th>
                  <th className="py-3 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {totalPaymentItemsCount === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      No payments recorded for this supplier yet.
                    </td>
                  </tr>
                ) : (
                  paginatedPaymentHistory.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {(paymentPage - 1) * paymentPageSize + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-indigo-600">
                        {row.referenceNumber || row.refNo || (row.id ? `PAY-${row.id}` : '-')}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{formatDate(row.paymentDate || row.createdAt)}</td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-600">₹{Number(row.amount || 0).toLocaleString('en-IN')}.00</td>
                      <td className="py-3.5 px-3 text-slate-700">{row.paymentMethod || 'CASH'}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{row.referenceNumber || row.reference || '-'}</td>
                      <td className="py-3.5 px-3 text-slate-600">{row.recordedBy || row.createdBy?.name || 'Admin'}</td>
                      <td className="py-3.5 px-3 text-slate-400">{row.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <Pagination
            currentPage={paymentPage}
            totalPages={totalPaymentPages}
            totalItems={totalPaymentItemsCount}
            pageSize={paymentPageSize}
            onPageChange={(page) => setPaymentPage(page)}
            onPageSizeChange={(size) => {
              setPaymentPageSize(size);
              setPaymentPage(1);
            }}
            itemName="payments"
          />
        </div>
      )}

      {/* LEDGER TAB */}
      {activeTab === 'Ledger' && (
        <div className="space-y-6">
          {/* Statement Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Purchases (Credit)</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {formatCurrency(ledgerSummary.totalCredit ?? totalPurchasesAmount)}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Payments (Debit)</div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {formatCurrency(ledgerSummary.totalDebit ?? totalPaidAmount)}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Closing Balance (Payable)</div>
              <div className="text-xl font-black text-rose-600 mt-1">
                {formatCurrency(ledgerSummary.closingBalance ?? totalPayableAmount)}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Ledger Statement Entries ({totalLedgerItemsCount})</h3>
              <span className="text-xs font-bold text-slate-400">{totalLedgerItemsCount} entries recorded</span>
            </div>

            {isLedgerLoading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span>Loading ledger statement...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px] bg-slate-50/60">
                        <th className="py-3 px-3 w-10 text-center">#</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Reference #</th>
                        <th className="py-3 px-3 text-right">Credit (Purchases)</th>
                        <th className="py-3 px-3 text-right">Debit (Payments / Returns)</th>
                        <th className="py-3 px-3 text-right">Running Balance</th>
                        <th className="py-3 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {totalLedgerItemsCount === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                            No ledger entries found for this supplier.
                          </td>
                        </tr>
                      ) : (
                        paginatedLedgerEntries.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                              {(ledgerPage - 1) * ledgerPageSize + idx + 1}
                            </td>
                            <td className="py-3.5 px-3 text-slate-600">{formatDate(row.date)}</td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                row.type === 'PURCHASE_INVOICE'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : row.type === 'PURCHASE_RETURN'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {row.type === 'PURCHASE_INVOICE'
                                  ? 'Purchase Invoice'
                                  : row.type === 'PURCHASE_RETURN'
                                  ? 'Purchase Return'
                                  : row.type === 'CASH_REFUND'
                                  ? 'Cash Refund'
                                  : 'Payment Made'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-extrabold text-indigo-600">
                              {row.type === 'PURCHASE_RETURN' ? (
                                <Link to={`/vendor/purchases/returns/${row.id}`} className="hover:underline text-amber-700">
                                  {row.referenceNumber || '-'}
                                </Link>
                              ) : row.type === 'PURCHASE_INVOICE' ? (
                                <Link to={`/vendor/purchases/${row.id}`} className="hover:underline text-indigo-600">
                                  {row.referenceNumber || '-'}
                                </Link>
                              ) : (
                                <span>{row.referenceNumber || '-'}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right font-black text-slate-900">
                              {row.credit > 0 ? `₹${Number(row.credit).toLocaleString('en-IN')}.00` : '-'}
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold text-emerald-600">
                              {row.debit > 0 ? `₹${Number(row.debit).toLocaleString('en-IN')}.00` : '-'}
                            </td>
                            <td className="py-3.5 px-3 text-right font-black text-rose-600">
                              ₹{Number(row.runningBalance || 0).toLocaleString('en-IN')}.00
                            </td>
                            <td className="py-3.5 px-3 text-slate-400">{row.notes || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Ledger Pagination Footer */}
                <Pagination
                  currentPage={ledgerPage}
                  totalPages={totalLedgerPages}
                  totalItems={totalLedgerItemsCount}
                  pageSize={ledgerPageSize}
                  onPageChange={(page) => setLedgerPage(page)}
                  onPageSizeChange={(size) => {
                    setLedgerPageSize(size);
                    setLedgerPage(1);
                  }}
                  itemName="ledger entries"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'Documents' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm">Supplier Documents & Attachments</h3>
          </div>

          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-xs font-extrabold text-slate-600">No external document files attached.</div>
            <p className="text-[11px] font-semibold text-slate-400 max-w-sm mx-auto">
              Attachments linked with purchase bills created for <strong className="text-slate-700">{supplier.name}</strong> will automatically appear here.
            </p>
          </div>
        </div>
      )}

      {/* 6. MODALS */}
      <SupplierModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        supplierToEdit={supplier}
        onSaveSupplier={async (payload, id) => {
          try {
            const targetId = id || currentSupplierId;
            await updateSupplierMutation.mutateAsync({ id: targetId, data: payload });
            toast.success(`Supplier "${payload.name}" updated successfully!`);
            refetch();
            setEditModalOpen(false);
          } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to update supplier.');
          }
        }}
      />

      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        supplier={supplier}
        onSuccess={() => refetch()}
      />

      <BaseModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Supplier"
      >
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-600">
            Are you sure you want to delete supplier <strong className="text-slate-900">{supplier?.name}</strong>?
            This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSupplier}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Delete
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default SupplierDetailsPage;