import React, { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { ChevronRight, Download, Edit3, Eye, FileText, Loader2, Plus, RotateCcw, Share2, Users } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useInvoicesQuery, useSalesReturnsQuery } from '../hooks/useBillsQueries';
import { useCustomersQuery } from '../../customers/hooks/useCustomerQueries';
import { downloadSmartBillPdf, shareSmartBillOnWhatsApp } from '../utils/salesBillPrintUtil';
import BillsSummaryKpiCards from '../components/BillsSummaryKpiCards';
import BillsFilterBar from '../components/BillsFilterBar';
import Pagination from '../../../components/common/Pagination';
import billService from '../../../services/billService';

const BillsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: rawBills, isLoading } = useInvoicesQuery();
  const { data: rawReturns } = useSalesReturnsQuery();
  const { data: rawCustomers } = useCustomersQuery({ limit: 1000 });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Parse returns list
  const returnsList = Array.isArray(rawReturns)
    ? rawReturns
    : Array.isArray(rawReturns?.items)
    ? rawReturns.items
    : Array.isArray(rawReturns?.returns)
    ? rawReturns.returns
    : Array.isArray(rawReturns?.data?.items)
    ? rawReturns.data.items
    : Array.isArray(rawReturns?.data)
    ? rawReturns.data
    : [];

  // Parse bills list
  const billsList = Array.isArray(rawBills)
    ? rawBills
    : Array.isArray(rawBills?.data?.items)
    ? rawBills.data.items
    : Array.isArray(rawBills?.data?.invoices)
    ? rawBills.data.invoices
    : Array.isArray(rawBills?.data?.bills)
    ? rawBills.data.bills
    : Array.isArray(rawBills?.bills)
    ? rawBills.bills
    : Array.isArray(rawBills?.items)
    ? rawBills.items
    : Array.isArray(rawBills?.data)
    ? rawBills.data
    : [];

  // Parse customer list options
  const customersList = Array.isArray(rawCustomers)
    ? rawCustomers
    : Array.isArray(rawCustomers?.data?.items)
    ? rawCustomers.data.items
    : Array.isArray(rawCustomers?.customers)
    ? rawCustomers.customers
    : Array.isArray(rawCustomers?.data)
    ? rawCustomers.data
    : [];

  const customerOptions = customersList.map((c) => ({
    id: c.id || c._id,
    name: c.name || c.businessName || c.customerName || 'Customer',
  }));

  const getBillStatus = (bill) => {
    const rawStatus = String(bill?.status || '').toUpperCase();
    const rawPaymentStatus = String(bill?.paymentStatus || '').toUpperCase();

    if (bill?.isDraft || rawStatus === 'DRAFT' || rawPaymentStatus === 'DRAFT') {
      return 'DRAFT';
    }
    if (rawStatus === 'CANCELLED' || rawStatus === 'CANCELED') {
      return 'CANCELLED';
    }

    const targetId = String(bill.id || bill._id || bill.invoiceNumber || bill.billNumber || '');
    const targetInvNo = String(bill.invoiceNumber || bill.billNumber || bill.id || '');

    const billReturns = returnsList.filter((r) => {
      const rBillId = String(r.billId || r.bill?.id || r.matchedBill?.id || '');
      const rInvNo = String(r.invoiceNumber || r.bill?.invoiceNumber || r.bill?.billNumber || '');
      return (rBillId && (rBillId === targetId || rBillId === targetInvNo)) ||
             (rInvNo && (rInvNo === targetInvNo || rInvNo === targetId));
    });

    const totalRefundForBill = billReturns.reduce((acc, r) => {
      return acc + Number(r.totalReturnAmount ?? r.returnAmount ?? r.refundAmount ?? r.amount ?? 0);
    }, 0);

    const subTotalVal = Number(bill.subtotal || 0);
    const taxVal = Number(bill.totalTaxAmount || bill.taxAmount || 0);
    const discVal = Number(bill.discountAmount || 0);
    const originalTotal = (subTotalVal || taxVal) ? (subTotalVal + taxVal - discVal) : Number(bill.grandTotal || bill.total || bill.totalAmount || 0);

    const items = Array.isArray(bill?.items) ? bill.items : [];
    const totalPurchased = items.reduce((acc, i) => acc + Number(i.quantity || i.qty || i.purchasedQty || 0), 0);
    const totalReturned = items.reduce((acc, i) => acc + Number(i.returnedQuantity || i.returnedQty || 0), 0);

    if (
      (originalTotal > 0 && totalRefundForBill >= (originalTotal - 1)) ||
      (totalPurchased > 0 && totalReturned >= totalPurchased) ||
      rawStatus === 'RETURNED' ||
      rawStatus === 'FULLY_RETURNED'
    ) {
      return 'RETURNED';
    }

    if (totalRefundForBill > 0 || totalReturned > 0 || rawStatus === 'PARTIALLY_RETURNED' || rawStatus === 'PARTIALLY RETURNED') {
      return 'PARTIALLY_RETURNED';
    }

    if (rawStatus === 'PAID' || rawPaymentStatus === 'PAID') {
      return 'PAID';
    }
    if (rawStatus === 'PARTIALLY PAID' || rawStatus === 'PARTIALLY_PAID' || rawPaymentStatus === 'PARTIALLY_PAID') {
      return 'PARTIALLY PAID';
    }
    return rawStatus || rawPaymentStatus || 'UNPAID';
  };

  const getPaymentStatus = (bill) => {
    const rawPaymentStatus = String(bill?.paymentStatus || '').toUpperCase();
    if (rawPaymentStatus === 'PAID' || String(bill?.status).toUpperCase() === 'PAID') return 'PAID';
    if (['PARTIAL', 'PARTIALLY_PAID', 'PARTIALLY PAID'].includes(rawPaymentStatus) || String(bill?.status).toUpperCase() === 'PARTIALLY PAID') return 'PARTIAL';
    return 'UNPAID';
  };

  const filteredBills = billsList.filter((bill) => {
    const query = searchQuery.trim().toLowerCase();
    const invoiceNo = String(bill.invoiceNumber || bill.billNumber || bill.id || '').toLowerCase();
    const custObj = typeof bill.customer === 'object' && bill.customer !== null ? bill.customer : {};
    const custStr = typeof bill.customer === 'string' ? bill.customer : '';
    const custName = String(
      custObj.name || custObj.businessName || custObj.contactPerson || bill.customerName || bill.businessName || custStr || ''
    ).toLowerCase();
    const custMobile = String(custObj.mobileNumber || custObj.mobile || bill.customerMobile || '').toLowerCase();

    if (query && !invoiceNo.includes(query) && !custName.includes(query) && !custMobile.includes(query)) {
      return false;
    }

    const st = getBillStatus(bill);
    const ps = getPaymentStatus(bill);

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PAID' && st !== 'PAID') return false;
      if (statusFilter === 'UNPAID' && st !== 'UNPAID') return false;
      if (statusFilter === 'PARTIALLY PAID' && st !== 'PARTIALLY PAID') return false;
      if (statusFilter === 'DRAFT' && st !== 'DRAFT') return false;
      if (statusFilter === 'RETURNED' && !st.includes('RETURNED')) return false;
      if (statusFilter === 'CANCELLED' && st !== 'CANCELLED') return false;
    }

    if (paymentStatusFilter !== 'ALL') {
      if (paymentStatusFilter === 'PAID' && ps !== 'PAID') return false;
      if (paymentStatusFilter === 'PARTIAL' && ps !== 'PARTIAL') return false;
      if (paymentStatusFilter === 'UNPAID' && ps !== 'UNPAID') return false;
    }

    if (customerFilter !== 'ALL') {
      const bCustId = bill.customerId || bill.customer_id || (typeof bill.customer === 'object' ? bill.customer?.id : undefined);
      if (String(bCustId) !== String(customerFilter)) return false;
    }

    if (activeTab !== 'ALL') {
      if (activeTab === 'PAID' && st !== 'PAID') return false;
      if (activeTab === 'PARTIALLY PAID' && st !== 'PARTIALLY PAID') return false;
      if (activeTab === 'UNPAID' && st !== 'UNPAID') return false;
      if (activeTab === 'DRAFT' && st !== 'DRAFT') return false;
      if (activeTab === 'RETURNED' && !st.includes('RETURNED')) return false;
      if (activeTab === 'CANCELLED' && st !== 'CANCELLED') return false;
    }

    return true;
  });

  // KPI Metrics Calculation
  const totalBills = billsList.length;
  const totalSalesAmount = billsList.reduce((acc, b) => {
    if (getBillStatus(b) === 'DRAFT') return acc;
    return acc + Number(b.grandTotal || b.total || b.amount || 0);
  }, 0);
  const paidAmount = billsList.reduce((acc, b) => {
    const st = getBillStatus(b);
    if (st === 'DRAFT') return acc;
    const paid = b.paidAmount !== undefined ? Number(b.paidAmount) : (st === 'PAID' ? Number(b.grandTotal || b.total || 0) : 0);
    return acc + paid;
  }, 0);
  const dueAmount = billsList.reduce((acc, b) => {
    const st = getBillStatus(b);
    if (st === 'DRAFT') return acc;
    const due = b.dueAmount !== undefined ? Number(b.dueAmount) : (b.balance !== undefined ? Number(b.balance) : (st === 'UNPAID' ? Number(b.grandTotal || b.total || 0) : 0));
    return acc + due;
  }, 0);
  const draftCount = billsList.filter((b) => getBillStatus(b) === 'DRAFT').length;

  // Tab Status Counts
  const paidCount = billsList.filter((b) => getBillStatus(b) === 'PAID').length;
  const partialCount = billsList.filter((b) => getBillStatus(b) === 'PARTIALLY PAID').length;
  const unpaidCount = billsList.filter((b) => getBillStatus(b) === 'UNPAID').length;
  const returnedCount = billsList.filter((b) => getBillStatus(b).includes('RETURNED')).length;
  const cancelledCount = billsList.filter((b) => getBillStatus(b) === 'CANCELLED').length;

  const totalItems = filteredBills.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const displayBills = filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection Logic
  const isAllSelected = filteredBills.length > 0 && filteredBills.every((b) => selectedBillIds.includes(b.id || b._id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(filteredBills.map((b) => b.id || b._id));
    }
  };

  const handleToggleSelectBill = (id) => {
    setSelectedBillIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async (format = 'csv') => {
    try {
      toast.info(`Exporting sales invoices (${format.toUpperCase()})...`);
      await billService.exportBills({
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        format,
      });
      toast.success('Sales invoices exported successfully!');
    } catch (e) {
      toast.error('Failed to export sales invoices.');
    } finally {
      setExportDropdownOpen(false);
    }
  };

  const handleExportSelected = () => {
    if (selectedBillIds.length === 0) return;
    toast.info(`Exporting ${selectedBillIds.length} Selected Sales Invoices...`);
    const selectedBills = filteredBills.filter((b) => selectedBillIds.includes(b.id || b._id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Invoice No,Customer,Date,Grand Total,Paid Amount,Due Amount,Status']
        .concat(
          selectedBills.map((b) => {
            const custObj = typeof b.customer === 'object' && b.customer !== null ? b.customer : {};
            const custName = custObj.name || custObj.businessName || b.customerName || 'Customer';
            const invNo = b.invoiceNumber || b.billNumber || b.id || '';
            const dt = b.createdAt || b.date || '';
            return `"${invNo}","${custName}","${dt}",${b.grandTotal || b.total || 0},${b.paidAmount || 0},${b.dueAmount || 0},"${getBillStatus(b)}"`;
          })
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Selected_Sales_Invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Selected sales invoices exported to CSV!');
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-12 animate-fadeIn font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span>Sales</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">Sales Invoices & Bills</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="text-indigo-600 shrink-0" size={28} /> Sales Invoices & Bills
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Manage customer sales invoices, B2B tax bills, payment statuses, and print receipts.
          </p>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto shrink-0 py-0.5">
          <NavLink
            to="/vendor/bills/create"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Create New Bill</span>
          </NavLink>

          <NavLink
            to="/vendor/customers"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Users size={16} className="text-slate-500" />
            <span>Customers Directory</span>
          </NavLink>

          <NavLink
            to="/vendor/invoices/returns"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={16} className="text-amber-600" />
            <span>Sales Returns</span>
          </NavLink>

          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title="Export Sales Invoices Report"
          >
            <Download size={16} className="text-indigo-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards Sub-Component */}
      <BillsSummaryKpiCards
        totalBills={totalBills}
        totalSalesAmount={totalSalesAmount}
        paidAmount={paidAmount}
        dueAmount={dueAmount}
        draftCount={draftCount}
        onSelectFilter={(st) => {
          setStatusFilter(st);
          setActiveTab(st);
          setCurrentPage(1);
        }}
      />

      {/* Filter & Search Bar Sub-Component */}
      <BillsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setActiveTab(s);
          setCurrentPage(1);
        }}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={(ps) => {
          setPaymentStatusFilter(ps);
          setCurrentPage(1);
        }}
        customerFilter={customerFilter}
        onCustomerFilterChange={(cust) => {
          setCustomerFilter(cust);
          setCurrentPage(1);
        }}
        customers={customerOptions}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setStatusFilter(tab);
          setCurrentPage(1);
        }}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
          setPaymentStatusFilter('ALL');
          setCustomerFilter('ALL');
          setActiveTab('ALL');
          setCurrentPage(1);
          toast.info('Filters reset.');
        }}
        totalBillsCount={totalBills}
        paidCount={paidCount}
        partialCount={partialCount}
        unpaidCount={unpaidCount}
        draftCount={draftCount}
        returnedCount={returnedCount}
        cancelledCount={cancelledCount}
      />

      {/* Floating Bulk Action Bar */}
      {selectedBillIds.length > 0 && (
        <div className="bg-indigo-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-indigo-700 font-black text-xs rounded-lg">
              {selectedBillIds.length} Selected
            </span>
            <span className="text-xs font-bold text-indigo-200">
              Perform batch export on selected sales invoices.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSelected}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Export Selected ({selectedBillIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedBillIds([])}
              className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Bills Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm overflow-hidden space-y-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-center">#</th>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Customer / Business</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    Loading invoices...
                  </td>
                </tr>
              ) : displayBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-bold">
                    No invoices match your filter criteria.
                  </td>
                </tr>
              ) : (
                displayBills.map((bill, idx) => {
                  const bId = bill.id || bill._id;
                  const isSelected = selectedBillIds.includes(bId);
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const billNo = bill.invoiceNumber || bill.billNumber || bill.id || 'INV';
                  const custObj = typeof bill.customer === 'object' && bill.customer !== null ? bill.customer : {};
                  const custStr = typeof bill.customer === 'string' ? bill.customer : '';
                  const custName = custObj.name || custObj.businessName || custObj.contactPerson || bill.customerName || bill.businessName || custStr || 'Cash Customer';
                  const isB2B = (bill.billType || bill.type || '').toUpperCase() === 'B2B' || Boolean(bill.gstin);
                  const st = getBillStatus(bill);
                  const isDraft = st === 'DRAFT';
                  const grandTotal = Number(bill.grandTotal || bill.total || bill.amount || 0);

                  return (
                    <tr
                      key={bId || idx}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectBill(bId)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{itemIndex}</td>
                      <td className="px-4 py-3 font-mono font-extrabold text-slate-900">{billNo}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {custObj.id ? (
                          <span
                            onClick={() => navigate(`/vendor/customers/${custObj.id}`)}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                            title="View Customer Profile"
                          >
                            {custName}
                          </span>
                        ) : (
                          <span className="text-slate-800">{custName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 font-extrabold text-[10px] rounded-full border ${isB2B ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {isB2B ? 'B2B Invoice' : 'B2C Bill'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        {new Date(bill.createdAt || bill.date || bill.invoiceDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900 text-sm">
                        ₹{grandTotal.toLocaleString('en-IN')}.00
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 font-extrabold text-[11px] rounded-full border ${
                          st === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : st === 'PARTIALLY PAID' || st === 'PARTIALLY_PAID'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : st === 'DRAFT'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : st === 'CANCELLED'
                            ? 'bg-slate-100 text-slate-600 border-slate-300 line-through'
                            : st.includes('RETURNED')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {st}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isDraft ? (
                            <button
                              type="button"
                              onClick={() => {
                                const targetId = bill.id || bill._id || bill.invoiceNumber;
                                navigate(`/vendor/invoices/edit/${targetId}`);
                              }}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                              title="Resume & Complete Draft Bill"
                            >
                              <Edit3 size={13} />
                              <span>Continue Draft</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const targetId = bill.id || bill._id || bill.invoiceNumber;
                                navigate(`/vendor/invoices/details/${targetId}`);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                              title="View Invoice Details"
                            >
                              <Eye size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const targetId = bill.id || bill._id || bill.invoiceNumber;
                              navigate(`/vendor/invoices/returns/create?billId=${targetId}&mode=return`);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 cursor-pointer transition-colors font-bold"
                            title="Return Items"
                          >
                            <RotateCcw size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await shareSmartBillOnWhatsApp(bill, toast);
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
                            title="Share Invoice via WhatsApp"
                          >
                            <Share2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.info(isB2B ? 'Downloading A4 Invoice PDF...' : 'Downloading POS Receipt PDF...');
                                await downloadSmartBillPdf(bill);
                                toast.success(isB2B ? 'A4 Invoice PDF downloaded!' : 'POS Receipt PDF downloaded!');
                              } catch (e) {
                                toast.error('Failed to download PDF.');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors font-bold"
                            title={isB2B ? 'Download A4 Tax Invoice PDF' : 'Download POS Receipt PDF'}
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

        {/* Pagination Controls */}
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
          itemName="invoices"
        />
      </div>
    </div>
  );
};

export default BillsListPage;
