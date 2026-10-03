import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { RotateCcw, Plus, Search, FileText, Loader2, ArrowLeft, Eye, X, CheckCircle2, User, CreditCard, Banknote, Download } from 'lucide-react';
import {
  useSalesReturnsQuery,
  useInvoicesQuery,
  useSalesReturnDetailsQuery,
  useInvoiceDetailsQuery,
} from '../hooks/useBillsQueries';
import billService from '../../../services/billService';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/common/Pagination';

const SalesReturnsListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: rawReturns, isLoading } = useSalesReturnsQuery();
  const { data: rawBills } = useInvoicesQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [selectedReturnModal, setSelectedReturnModal] = useState(null);

  // Queries for active modal detail fetching
  const activeReturnId = selectedReturnModal?.id;
  const activeBillId =
    selectedReturnModal?.billId ||
    selectedReturnModal?.matchedBill?.id ||
    selectedReturnModal?.invoiceNumber;

  const { data: rawReturnDetails } = useSalesReturnDetailsQuery(activeReturnId);
  const { data: rawBillDetails } = useInvoiceDetailsQuery(activeBillId);

  const returnDetailsData = rawReturnDetails?.data || rawReturnDetails;
  const billDetailsData = rawBillDetails?.data || rawBillDetails;

  const billsList = Array.isArray(rawBills)
    ? rawBills
    : Array.isArray(rawBills?.items)
    ? rawBills.items
    : Array.isArray(rawBills?.invoices)
    ? rawBills.invoices
    : Array.isArray(rawBills?.bills)
    ? rawBills.bills
    : Array.isArray(rawBills?.data?.items)
    ? rawBills.data.items
    : Array.isArray(rawBills?.data)
    ? rawBills.data
    : [];

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

  const filteredReturns = returnsList.filter((r) => {
    if (!r) return false;
    const query = searchQuery.trim().toLowerCase();
    const invNo = String(r.invoiceNumber || r.billId || r.id || '').toLowerCase();
    const custName = String(r.customerName || (typeof r.customer === 'object' ? r.customer?.name : r.customer) || '').toLowerCase();
    if (!query) return true;
    return invNo.includes(query) || custName.includes(query);
  });

  const totalItems = filteredReturns.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const displayReturns = filteredReturns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = async () => {
    try {
      toast.info('Downloading Sales Returns CSV Report...');
      await billService.exportSalesReturns(filteredReturns);
      toast.success('Sales Returns CSV Report downloaded!');
    } catch (err) {
      toast.error('Failed to export sales returns report.');
    }
  };

  const totalReturnDocs = returnsList.length;
  const totalRefundAmount = returnsList.reduce(
    (acc, r) => acc + Number(r.totalReturnAmount || r.returnAmount || r.refundAmount || r.amount || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <RotateCcw className="text-amber-600" size={28} /> Customer Sales Returns & Credit Notes
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Manage customer sales returns, item restocking, and issued credit notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink
            to="/vendor/invoices/returns/create?mode=return"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>New Sales Return</span>
          </NavLink>

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            title="Export Sales Returns Report to CSV"
          >
            <Download size={16} className="text-slate-600" />
            <span>Export Report</span>
          </button>

          <NavLink
            to="/vendor/invoices"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>All Invoices</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400">Total Return Records</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalReturnDocs}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <RotateCcw size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400">Total Refund Issued</p>
            <h3 className="text-2xl font-black text-amber-600 font-mono mt-1">
              ₹{totalRefundAmount.toLocaleString('en-IN')}.00
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
            ₹
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400">Restock Status</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">AUTO RESTOCKED</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by credit note or invoice number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>
      </div>

      {/* Returns Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs overflow-hidden space-y-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-center">#</th>
                <th className="px-4 py-3">Return Document</th>
                <th className="px-4 py-3">Original Invoice</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Refund Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin text-amber-600 mx-auto mb-2" />
                    Loading sales returns list...
                  </td>
                </tr>
              ) : displayReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-bold">
                    No sales return records found.
                  </td>
                </tr>
              ) : (
                displayReturns.map((ret, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const matchedBill = billsList.find(
                    (b) =>
                      String(b.id) === String(ret.billId) ||
                      String(b._id) === String(ret.billId) ||
                      String(b.invoiceNumber) === String(ret.billId) ||
                      String(b.invoiceNumber) === String(ret.invoiceNumber)
                  );

                  // Formatted Return Document ID
                  let retNo = ret.returnNo || ret.creditNoteNumber || ret.id || `RET-${idx + 1}`;
                  if (retNo.length > 20 && retNo.includes('-')) {
                    retNo = `CN-${retNo.split('-')[0].toUpperCase()}`;
                  }

                  // Formatted Invoice Number
                  let invNo =
                    ret.invoiceNumber ||
                    ret.bill?.invoiceNumber ||
                    ret.bill?.billNumber ||
                    matchedBill?.invoiceNumber ||
                    matchedBill?.billNumber ||
                    '';

                  if (!invNo || (invNo.length > 20 && invNo.includes('-'))) {
                    if (matchedBill?.invoiceNumber) {
                      invNo = matchedBill.invoiceNumber;
                    } else if (ret.billId && String(ret.billId).length > 20) {
                      invNo = `INV-${String(ret.billId).split('-')[0].toUpperCase()}`;
                    } else {
                      invNo = ret.billId || 'INV-001';
                    }
                  }

                  // Resolved Customer Name
                  const custName =
                    ret.customerName ||
                    ret.bill?.customerName ||
                    (typeof ret.bill?.customer === 'object' && ret.bill?.customer !== null
                      ? ret.bill.customer.name || ret.bill.customer.businessName
                      : null) ||
                    matchedBill?.customerName ||
                    (typeof matchedBill?.customer === 'object' && matchedBill?.customer !== null
                      ? matchedBill.customer.name || matchedBill.customer.businessName
                      : null) ||
                    (typeof ret.customer === 'string' ? ret.customer : null) ||
                    'Cash Customer';

                  const dateStr =
                    ret.returnDate || ret.createdAt
                      ? new Date(ret.returnDate || ret.createdAt).toLocaleDateString('en-IN')
                      : 'Today';

                  const amt = Number(
                    ret.totalReturnAmount ??
                    ret.returnAmount ??
                    ret.refundAmount ??
                    ret.amount ??
                    0
                  );

                  return (
                    <tr key={ret.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{itemIndex}</td>
                      <td className="px-4 py-3 font-mono font-extrabold text-amber-700">{retNo}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{invNo}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{custName}</td>
                      <td className="px-4 py-3 text-slate-500">{dateStr}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                        ₹{amt.toLocaleString('en-IN')}.00
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 font-extrabold text-[11px] rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedReturnModal({
                                ...ret,
                                formattedRetNo: retNo,
                                formattedInvNo: invNo,
                                resolvedCustName: custName,
                                resolvedAmount: amt,
                                matchedBill,
                              })
                            }
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                            title="View Sales Return Details"
                          >
                            <Eye size={15} />
                          </button>

                          {matchedBill?.id && (
                            <button
                              type="button"
                              onClick={() => navigate(`/vendor/invoices/details/${matchedBill.id}`)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                              title="View Original Invoice"
                            >
                              <FileText size={15} />
                            </button>
                          )}
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
          itemName="sales returns"
        />
      </div>

      {/* Sales Return Details Modal */}
      {selectedReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl animate-in fade-in duration-200 font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900 font-mono">
                      {selectedReturnModal.formattedRetNo}
                    </h3>
                    <span className="px-2 py-0.5 font-extrabold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full uppercase">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Sales Return Credit Note Details</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReturnModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="overflow-y-auto space-y-4 my-4 pr-1">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-extrabold block mb-0.5">Original Invoice</span>
                  <span className="font-mono text-slate-900 text-sm">{selectedReturnModal.formattedInvNo}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-extrabold block mb-0.5">Customer Name</span>
                  <span className="text-slate-900 text-sm">{selectedReturnModal.resolvedCustName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-extrabold block mb-0.5">Return Date</span>
                  <span className="text-slate-800">{selectedReturnModal.returnDate || new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-extrabold block mb-0.5">Refund Amount</span>
                  <span className="font-mono text-amber-700 text-sm font-black">
                    ₹{Number(selectedReturnModal.resolvedAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Itemized Returned Products Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500">Itemized Return Breakdown</h4>
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[360px]">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">
                        <th className="pb-2">Product Name</th>
                        <th className="pb-2 text-center">Returned Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Refund Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {(() => {
                        const fullReturn = returnDetailsData?.return || returnDetailsData?.data || returnDetailsData;
                        const fullInvoice = billDetailsData?.invoice || billDetailsData?.bill || billDetailsData;

                        const itemsList =
                          (Array.isArray(selectedReturnModal.returnItems) && selectedReturnModal.returnItems.length > 0 && selectedReturnModal.returnItems) ||
                          (Array.isArray(selectedReturnModal.items) && selectedReturnModal.items.length > 0 && selectedReturnModal.items) ||
                          (Array.isArray(selectedReturnModal.lineItems) && selectedReturnModal.lineItems.length > 0 && selectedReturnModal.lineItems) ||
                          (Array.isArray(fullReturn?.returnItems) && fullReturn.returnItems.length > 0 && fullReturn.returnItems) ||
                          (Array.isArray(fullReturn?.items) && fullReturn.items.length > 0 && fullReturn.items) ||
                          (Array.isArray(fullReturn?.lineItems) && fullReturn.lineItems.length > 0 && fullReturn.lineItems) ||
                          (Array.isArray(fullInvoice?.items) && fullInvoice.items.length > 0 && fullInvoice.items) ||
                          (Array.isArray(fullInvoice?.billItems) && fullInvoice.billItems.length > 0 && fullInvoice.billItems) ||
                          (Array.isArray(fullInvoice?.lineItems) && fullInvoice.lineItems.length > 0 && fullInvoice.lineItems) ||
                          (Array.isArray(selectedReturnModal.matchedBill?.items) && selectedReturnModal.matchedBill.items.length > 0 && selectedReturnModal.matchedBill.items) ||
                          (Array.isArray(selectedReturnModal.bill?.items) && selectedReturnModal.bill.items.length > 0 && selectedReturnModal.bill.items) ||
                          [];

                        if (itemsList.length === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-400 font-semibold">
                                No item breakdown records found.
                              </td>
                            </tr>
                          );
                        }

                        return itemsList.map((item, i) => {
                          const pName = item.name || item.productName || item.product?.name || item.title || `Product #${i + 1}`;
                          const retQty = Number(item.returnQuantity ?? item.returnQty ?? item.returnedQuantity ?? item.quantity ?? item.qty ?? 1);
                          const price = Number(item.unitPrice ?? item.price ?? item.rate ?? item.mrp ?? 0);
                          const lineAmt = Number(item.amount ?? item.subtotal ?? item.lineTotal ?? (retQty * price));
                          const pSku = item.sku || item.product?.sku || '-';

                          return (
                            <tr key={i} className="hover:bg-slate-100/60">
                              <td className="py-2.5 font-extrabold text-slate-900">
                                <div>{pName}</div>
                                {pSku !== '-' && <div className="text-[10px] text-slate-400 font-mono">SKU: {pSku}</div>}
                              </td>
                              <td className="py-2.5 text-center font-extrabold text-indigo-600">{retQty} Pcs</td>
                              <td className="py-2.5 text-right font-mono">₹{price.toFixed(2)}</td>
                              <td className="py-2.5 text-right font-mono font-black text-amber-700">₹{lineAmt.toFixed(2)}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              {selectedReturnModal.matchedBill?.id ? (
                <button
                  onClick={() => {
                    const bId = selectedReturnModal.matchedBill.id;
                    setSelectedReturnModal(null);
                    navigate(`/vendor/invoices/details/${bId}`);
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText size={15} />
                  <span>View Original Invoice</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedReturnModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReturnsListPage;
