import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  MoreVertical,
  Edit3,
  RotateCcw,
  XCircle,
  Trash2,
  Building2,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import {
  useInvoiceDetailsQuery,
  useCancelBillMutation,
  useDeleteBillMutation,
} from '../hooks/useBillsQueries';
import { downloadSmartBillPdf, printSmartBillPdf, shareSmartBillOnWhatsApp } from '../utils/salesBillPrintUtil';
import { useToast } from '../../../context/ToastContext';
import ConfirmModal from '../../../components/common/ConfirmModal';

const BillDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [showMoreActions, setShowMoreActions] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreActions(false);
      }
    };
    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreActions]);

  const { data: responseData, isLoading, refetch } = useInvoiceDetailsQuery(id);
  const cancelBillMutation = useCancelBillMutation();
  const deleteBillMutation = useDeleteBillMutation();

  const apiData = responseData?.data || responseData || null;
  const bill = apiData?.invoice || apiData?.bill || apiData || {};

  const invoiceNumber = bill.invoiceNumber || bill.billNumber || bill.id || id || 'INV-001';

  const rawDate = bill.date || bill.createdAt || new Date();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const custObj = typeof bill.customer === 'object' && bill.customer !== null ? bill.customer : {};
  const customerName = custObj.name || custObj.businessName || bill.customerName || bill.businessName || (typeof bill.customer === 'string' ? bill.customer : 'Cash Customer');
  const customerMobile = custObj.mobileNumber || custObj.phone || bill.customerMobile || bill.mobile || '-';
  const customerGstin = custObj.gstin || bill.gstin || '-';
  const customerAddress = custObj.address || custObj.shippingAddress || bill.shippingAddress || '-';

  const itemsList = Array.isArray(bill.items) ? bill.items : [];
  const grandTotal = Number(bill.grandTotal || bill.totalAmount || bill.subtotal || 0);
  const paidAmount = Number(bill.paidAmount || (bill.status === 'PAID' ? grandTotal : 0));
  const dueAmount = Number((bill.dueAmount !== undefined && bill.dueAmount !== null) ? bill.dueAmount : Math.max(0, grandTotal - paidAmount));
  
  const getBillStatus = (billObj) => {
    const rawStatus = String(billObj?.status || '').toUpperCase();
    const rawPaymentStatus = String(billObj?.paymentStatus || '').toUpperCase();
    const items = Array.isArray(billObj?.items) ? billObj.items : [];

    const subTotalVal = Number(billObj.subtotal || 0);
    const taxVal = Number(billObj.totalTaxAmount || billObj.taxAmount || 0);
    const discVal = Number(billObj.discountAmount || 0);
    const dbGrandTotal = Number(billObj.grandTotal || billObj.totalAmount || 0);
    const computedOriginalTotal = (subTotalVal || taxVal) ? (subTotalVal + taxVal - discVal) : dbGrandTotal;
    const retVal = Math.max(0, computedOriginalTotal - dbGrandTotal);

    if (items.length > 0) {
      const totalPurchased = items.reduce((acc, i) => acc + Number(i.quantity || i.qty || i.purchasedQty || 0), 0);
      const totalReturned = items.reduce((acc, i) => acc + Number(i.returnedQuantity || i.returnedQty || 0), 0);
      if (totalPurchased > 0 && totalReturned >= totalPurchased) {
        return 'RETURNED';
      }
    }

    if (computedOriginalTotal > 0 && retVal >= (computedOriginalTotal - 1)) {
      return 'RETURNED';
    }

    if (rawStatus === 'RETURNED' || rawStatus === 'FULLY_RETURNED') return 'RETURNED';
    if (retVal > 0 || rawStatus === 'PARTIALLY_RETURNED' || rawStatus === 'PARTIALLY RETURNED') return 'PARTIALLY_RETURNED';
    return rawStatus || rawPaymentStatus || 'PAID';
  };

  const status = getBillStatus(bill);

  const handlePrint = async () => {
    try {
      toast.info('Opening Invoice Print Window...');
      await printSmartBillPdf(bill);
    } catch (err) {
      toast.error('Failed to print invoice.');
    }
  };

  const handleDownload = async () => {
    try {
      toast.info('Downloading Sales Invoice PDF...');
      await downloadSmartBillPdf(bill);
      toast.success('Sales Invoice PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download PDF.');
    }
  };

  const handleShareWhatsApp = async () => {
    await shareSmartBillOnWhatsApp(bill, toast);
  };

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const executeCancelBill = async () => {
    setCancelModalOpen(false);
    try {
      await cancelBillMutation.mutateAsync({ id: bill.id || id, reason: 'Cancelled by vendor admin' });
      toast.success(`Invoice ${invoiceNumber} cancelled successfully!`);
      refetch();
    } catch (err) {
      toast.error('Failed to cancel invoice.');
    }
  };

  const executeDeleteBill = async () => {
    setDeleteModalOpen(false);
    try {
      await deleteBillMutation.mutateAsync(bill.id || id);
      toast.success('Invoice deleted.');
      navigate('/vendor/invoices');
    } catch (err) {
      toast.error('Failed to delete invoice.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold text-sm">
        Loading sales invoice details...
      </div>
    );
  }

  if (!bill || (!bill.id && !bill.invoiceNumber)) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Invoice Not Found</h3>
        <button
          onClick={() => navigate('/vendor/invoices')}
          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5 pb-16 animate-fadeIn font-sans">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {invoiceNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 font-extrabold text-[11px] rounded-full uppercase border ${
                  status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : status === 'PARTIALLY_PAID' || status === 'PARTIALLY PAID'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : status === 'UNPAID'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : status === 'CANCELLED'
                    ? 'bg-slate-100 text-slate-700 border-slate-300 line-through'
                    : status.includes('RETURNED')
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Invoice Date: <strong className="text-slate-800">{formattedDate}</strong>
              {customerName !== 'Cash Customer' && ` • Customer: ${customerName}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="More Actions Dropdown"
            >
              <MoreVertical size={16} />
            </button>

            {showMoreActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 space-y-0.5 text-xs font-bold text-slate-700">
                <button
                  onClick={() => {
                    setShowMoreActions(false);
                    navigate(`/vendor/invoices/edit/${bill.id || id}`);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 size={14} className="text-slate-500" />
                  <span>Edit Invoice</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoreActions(false);
                    navigate(`/vendor/invoices/returns/create?billId=${bill.id || id}&mode=return`);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} className="text-amber-600" />
                  <span>Return Items</span>
                </button>

                {status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                      setCancelModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Cancel Bill</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMoreActions(false);
                    setDeleteModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Invoice</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Items Table (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                Invoice Line Items ({itemsList.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase border-b border-slate-200">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Tax Rate</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {itemsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No item records found in invoice payload.
                      </td>
                    </tr>
                  ) : (
                    itemsList.map((item, idx) => {
                      const pName = item.productName || item.product?.name || item.name || 'Item';
                      const pSku = item.sku || item.product?.sku || '-';
                      const qty = Number(item.quantity || item.qty || 1);
                      const price = Number(item.unitPrice || item.price || item.rate || 0);
                      const taxPct = Number(item.taxPercent || item.taxRate || item.gst || 0);
                      const lineTotal = Number(item.lineTotal || item.amount || qty * price);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div>{pName}</div>
                            {pSku !== '-' && <div className="text-[10px] text-slate-400 font-mono">SKU: {pSku}</div>}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{qty} {item.unit || 'Pcs'}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-500">{taxPct}% GST</td>
                          <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                            ₹{lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-xs text-slate-500 space-y-1">
                <p>Payment Method: <strong className="text-slate-800">{bill.paymentMethod || 'CASH'}</strong></p>
                <p>Status: <strong className="text-slate-800">{status}</strong></p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs font-bold text-slate-700">
                {(() => {
                  const subTotalVal = Number(bill.subtotal || 0);
                  const taxVal = Number(bill.totalTaxAmount || bill.taxAmount || 0);
                  const discVal = Number(bill.discountAmount || 0);
                  const dbGrandTotal = Number(bill.grandTotal || bill.totalAmount || 0);

                  const computedOriginalTotal = (subTotalVal || taxVal) ? (subTotalVal + taxVal - discVal) : dbGrandTotal;
                  const retVal = Math.max(0, computedOriginalTotal - dbGrandTotal);

                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{subTotalVal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between text-slate-500">
                        <span>Tax Amount</span>
                        <span className="font-mono">₹{taxVal.toFixed(2)}</span>
                      </div>

                      {discVal > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Discount</span>
                          <span className="font-mono">- ₹{discVal.toFixed(2)}</span>
                        </div>
                      )}

                      {retVal > 0 ? (
                        <>
                          <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                            <span>Invoice Total</span>
                            <span className="font-mono">₹{computedOriginalTotal.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>Returned Amount</span>
                            <span className="font-mono">- ₹{retVal.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-300">
                            <span>Net Bill Total</span>
                            <span className="font-mono text-indigo-600">₹{dbGrandTotal.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                          <span>Grand Total</span>
                          <span className="font-mono text-indigo-600">₹{computedOriginalTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment Info (Span 1) */}
        <div className="space-y-5">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User size={16} className="text-indigo-600" />
              Customer Information
            </h3>
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="font-extrabold text-sm text-slate-900">{customerName}</div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-slate-400" />
                <span>{customerMobile}</span>
              </div>
              {customerGstin !== '-' && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={14} className="text-slate-400" />
                  <span>GSTIN: {customerGstin}</span>
                </div>
              )}
              {customerAddress !== '-' && (
                <div className="text-slate-500 text-[11px] pt-1">
                  Address: {customerAddress}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Returns Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <CreditCard size={16} className="text-indigo-600" />
              Payment & Settlement
            </h3>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-600">
                <span>Paid Amount</span>
                <span className="font-mono text-emerald-600">₹{paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Due Balance</span>
                <span className="font-mono text-rose-600">₹{dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Bill Confirm Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={executeCancelBill}
        title={`Cancel Invoice ${invoiceNumber}?`}
        message={`Are you sure you want to cancel invoice #${invoiceNumber}? Stock items will be automatically restocked into inventory.`}
        confirmText="Yes, Cancel Bill"
        cancelText="Keep Invoice"
        isDanger={true}
        isLoading={cancelBillMutation.isPending}
      />

      {/* Delete Bill Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDeleteBill}
        title={`Delete Invoice ${invoiceNumber}?`}
        message={`Are you sure you want to permanently delete invoice #${invoiceNumber}? This action cannot be undone.`}
        confirmText="Yes, Delete Invoice"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteBillMutation.isPending}
      />
    </div>
  );
};

export default BillDetailsPage;
