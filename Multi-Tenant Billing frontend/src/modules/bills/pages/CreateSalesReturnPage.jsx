import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  FileText,
  User,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';
import { useCustomersQuery } from '../../customers/hooks/useCustomerQueries';
import {
  useInvoicesQuery,
  useInvoiceDetailsQuery,
  useProcessBillReturnMutation,
  useCancelBillMutation,
} from '../hooks/useBillsQueries';
import { useToast } from '../../../context/ToastContext';
import ConfirmModal from '../../../components/common/ConfirmModal';

// Sub-components
import SalesReturnStockImpactCard from '../components/SalesReturnStockImpactCard';
import SalesReturnRefundCard from '../components/SalesReturnRefundCard';

const CreateSalesReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const urlMode = searchParams.get('mode'); // 'cancellation' | 'cancel' | 'return'
  const urlBillId = searchParams.get('billId');

  const { data: customersRes } = useCustomersQuery({ limit: 100 });
  const { data: billsRes } = useInvoicesQuery({ limit: 100 });

  const customers = Array.isArray(customersRes?.customers)
    ? customersRes.customers
    : Array.isArray(customersRes?.data?.customers)
    ? customersRes.data.customers
    : Array.isArray(customersRes?.data)
    ? customersRes.data
    : [];

  const bills = Array.isArray(billsRes?.items)
    ? billsRes.items
    : Array.isArray(billsRes?.invoices)
    ? billsRes.invoices
    : Array.isArray(billsRes?.bills)
    ? billsRes.bills
    : Array.isArray(billsRes?.data)
    ? billsRes.data
    : [];

  const processReturnMutation = useProcessBillReturnMutation();
  const cancelBillMutation = useCancelBillMutation();

  // Return Details State
  const [returnType, setReturnType] = useState(
    urlMode === 'cancellation' || urlMode === 'cancel'
      ? 'Invoice Cancellation'
      : 'Sales Return'
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [returnNo, setReturnNo] = useState(`CN-${Date.now().toString().slice(-6)}`);
  const [selectedBillId, setSelectedBillId] = useState(urlBillId || '');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnReason, setReturnReason] = useState(
    urlMode === 'cancellation' || urlMode === 'cancel' ? 'Order Cancelled by Customer' : 'Customer Returned / Defective'
  );
  const [referenceNotes, setReferenceNotes] = useState('');

  // Invoice Search States
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchDropdownRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input label when selectedBillId changes
  useEffect(() => {
    if (selectedBillId && bills.length > 0) {
      const matched = bills.find(
        (b) =>
          String(b.id) === String(selectedBillId) ||
          String(b._id) === String(selectedBillId) ||
          String(b.invoiceNumber) === String(selectedBillId) ||
          String(b.billNumber) === String(selectedBillId)
      );
      if (matched) {
        const invNo = matched.invoiceNumber || matched.billNumber || matched.id || 'INV';
        const custName = matched.customerName || (typeof matched.customer === 'object' && matched.customer !== null ? matched.customer.name || matched.customer.businessName : (typeof matched.customer === 'string' ? matched.customer : 'Customer'));
        const amountVal = Number(matched.grandTotal || matched.subtotal || matched.totalAmount || matched.total || 0).toFixed(1);
        setInvoiceSearchQuery(`${invNo} - ${custName} (₹${amountVal})`);
      }
    }
  }, [selectedBillId, bills]);

  const filteredInvoiceBills = bills.filter((b) => {
    const query = invoiceSearchQuery.trim().toLowerCase();
    if (!query) return true;
    const invNo = String(b.invoiceNumber || b.billNumber || b.id || '').toLowerCase();
    const custName = String(
      b.customerName ||
      (typeof b.customer === 'object' && b.customer !== null
        ? b.customer.name || b.customer.businessName
        : (typeof b.customer === 'string' ? b.customer : ''))
    ).toLowerCase();

    if (selectedBillId && invoiceSearchQuery.includes(invNo)) return true;

    return invNo.includes(query) || custName.includes(query);
  });

  // Fetch full details of selected Invoice
  const { data: selectedBillDetailsRes } = useInvoiceDetailsQuery(selectedBillId);

  // Items State
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCancellation = returnType === 'Invoice Cancellation';

  // Sync bill selection & fetch items
  useEffect(() => {
    if (!selectedBillId) {
      setItems([]);
      return;
    }

    const matchedInList = bills.find(
      (b) =>
        String(b.id) === String(selectedBillId) ||
        String(b._id) === String(selectedBillId) ||
        String(b.invoiceNumber) === String(selectedBillId) ||
        String(b.billNumber) === String(selectedBillId)
    );

    const apiObj = selectedBillDetailsRes?.data || selectedBillDetailsRes;
    const detailedBill =
      apiObj?.invoice ||
      apiObj?.bill ||
      (Array.isArray(apiObj?.items) ? apiObj : null) ||
      (Array.isArray(matchedInList?.items) ? matchedInList : null) ||
      apiObj ||
      matchedInList;

    if (detailedBill) {
      const custId =
        detailedBill.customerId ||
        detailedBill.customer?.id ||
        detailedBill.customer?._id ||
        matchedInList?.customerId ||
        matchedInList?.customer?.id;

      if (custId) setSelectedCustomerId(custId);

      const rawItems = Array.isArray(detailedBill.items)
        ? detailedBill.items
        : Array.isArray(detailedBill.billItems)
        ? detailedBill.billItems
        : Array.isArray(detailedBill.lineItems)
        ? detailedBill.lineItems
        : Array.isArray(matchedInList?.items)
        ? matchedInList.items
        : [];

      if (rawItems.length > 0) {
        setItems(
          rawItems.map((i, idx) => {
            const purchasedQty = Number(i.quantity || i.qty || i.purchasedQty || 1);
            const returnedQty = Number(i.returnedQuantity || i.returnedQty || 0);
            const remainingQty = Math.max(0, purchasedQty - returnedQty);
            const rawUnitPrice = Number(
              i.unitPrice ??
              i.price ??
              i.rate ??
              i.unitPurchasePrice ??
              i.mrp ??
              (i.lineTotal && purchasedQty ? i.lineTotal / purchasedQty : 0)
            );
            const taxRate = Number(i.taxPercent || i.taxRate || i.gst || i.tax || 0);
            const explicitTaxMode = String(i.taxMode || i.taxType || '').toUpperCase();
            const isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE'].includes(explicitTaxMode);

            // Calculate effective unit price including GST if exclusive
            let effectiveUnitPrice = rawUnitPrice;
            if (i.lineTotal && purchasedQty > 0) {
              effectiveUnitPrice = Number(i.lineTotal) / purchasedQty;
            } else if (!isInclusive && taxRate > 0) {
              effectiveUnitPrice = rawUnitPrice * (1 + taxRate / 100);
            }

            const initialReturnQty = remainingQty;
            const initialAmount = Math.round((initialReturnQty * effectiveUnitPrice) * 100) / 100;

            return {
              id: i.id || idx + 1,
              productId: i.productId || i.product?.id || i.product?._id || `prod-${idx + 1}`,
              name: i.product?.name || i.productName || i.name || i.title || 'Item',
              sku: i.product?.sku || i.sku || i.hsnCode || i.hsn || '-',
              unit: i.unit || i.product?.unit || 'Pcs',
              purchasedQty,
              alreadyReturnedQty: returnedQty,
              remainingQty,
              returnQty: initialReturnQty,
              unitPrice: rawUnitPrice,
              effectiveUnitPrice,
              taxRate,
              isInclusive,
              amount: initialAmount,
            };
          })
        );
      }
    }
  }, [selectedBillId, selectedBillDetailsRes, bills, isCancellation]);

  // Sync return mode switch
  useEffect(() => {
    if (isCancellation) {
      setReturnReason('Order Cancelled by Customer');
      setItems((prev) => prev.map((i) => ({ ...i, returnQty: i.remainingQty, amount: Math.round((i.remainingQty * i.effectiveUnitPrice) * 100) / 100 })));
    } else {
      setReturnReason('Customer Returned / Defective');
    }
  }, [isCancellation]);

  // Refund / Adjustment State
  const [refundType, setRefundType] = useState('Cash Refund');
  const [refundAmount, setRefundAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Recalculate total refund amount based on item return quantities
  useEffect(() => {
    const calculatedRefund = items.reduce((acc, item) => {
      const q = Number(item.returnQty) || 0;
      const p = Number(item.effectiveUnitPrice || item.unitPrice) || 0;
      return acc + q * p;
    }, 0);
    setRefundAmount(Math.round(calculatedRefund * 100) / 100);
  }, [items]);

  const handleItemQtyChange = (idx, newQtyStr) => {
    const newQty = Math.max(0, parseFloat(newQtyStr) || 0);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const validQty = Math.min(newQty, item.remainingQty);
        return {
          ...item,
          returnQty: validQty,
          amount: Math.round((validQty * (item.effectiveUnitPrice || item.unitPrice)) * 100) / 100,
        };
      })
    );
  };

  const totalItemsReturningCount = items.reduce((acc, i) => acc + (Number(i.returnQty) || 0), 0);

  const [cancelConfirmModalOpen, setCancelConfirmModalOpen] = useState(false);

  const handleConfirmCancellation = async () => {
    setCancelConfirmModalOpen(false);
    setIsSubmitting(true);
    try {
      await cancelBillMutation.mutateAsync({ id: selectedBillId, reason: returnReason });
      toast.success('Invoice cancelled and stock restored to inventory!');
      navigate('/vendor/invoices');
    } catch (err) {
      toast.error('Failed to cancel bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBillId) {
      toast.error('Please select a customer invoice first.');
      return;
    }

    if (isCancellation) {
      setCancelConfirmModalOpen(true);
      return;
    }

    // Process Sales Return (Partial / Full items)
    const validReturnItems = items
      .filter((i) => (Number(i.returnQty) || 0) > 0)
      .map((i) => {
        const retQty = Number(i.returnQty);
        const factor = Number(i.conversionFactor || 1);
        const baseQty = Math.round((retQty * factor) * 10000) / 10000;

        return {
          productId: i.productId,
          name: i.name,
          productName: i.name,
          sku: i.sku,
          unit: i.unit || 'Pcs',
          conversionFactor: factor,
          baseQuantity: baseQty,
          returnQuantity: retQty,
          unitPrice: Number(i.effectiveUnitPrice || i.unitPrice),
          amount: Math.round((retQty * Number(i.effectiveUnitPrice || i.unitPrice)) * 100) / 100,
          reason: returnReason,
        };
      });

    if (validReturnItems.length === 0) {
      toast.error('At least one item must have return quantity > 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await processReturnMutation.mutateAsync({
        id: selectedBillId,
        returnData: {
          billId: selectedBillId,
          returnItems: validReturnItems,
          refundAmount,
          refundType,
          paymentMethod,
          notes: referenceNotes,
        },
      });
      toast.success('Sales Return processed & Credit Note generated!');
      navigate('/vendor/invoices');
    } catch (err) {
      toast.error('Failed to process sales return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 pb-20 animate-fadeIn font-sans">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link to="/vendor/invoices" className="hover:text-indigo-600">Invoices</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900">Sales Return & Cancellation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <RotateCcw className="text-amber-600" size={28} />
            {isCancellation ? 'Cancel Customer Invoice' : 'Create Sales Return (Credit Note)'}
          </h1>
        </div>

        <button
          onClick={() => navigate('/vendor/invoices')}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Return Document Configuration Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <h2 className="text-base font-black text-slate-900">Return & Document Type</h2>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setReturnType('Sales Return')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !isCancellation
                    ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sales Return (Credit Note)
              </button>
              <button
                type="button"
                onClick={() => setReturnType('Invoice Cancellation')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isCancellation
                    ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Invoice Cancellation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-500">Credit Note No.</label>
              <input
                type="text"
                value={returnNo}
                onChange={(e) => setReturnNo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-extrabold"
              />
            </div>

            <div className="relative" ref={searchDropdownRef}>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-500">
                Search & Select Customer Invoice <span className="text-rose-500">*</span>
              </label>
              
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type invoice no. or customer name..."
                  value={invoiceSearchQuery}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setInvoiceSearchQuery(e.target.value);
                    if (selectedBillId) setSelectedBillId('');
                    setIsSearchDropdownOpen(true);
                  }}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-2xs"
                  required={!selectedBillId}
                />
                {invoiceSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBillId('');
                      setInvoiceSearchQuery('');
                      setItems([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                    title="Clear Invoice Selection"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100 font-sans text-xs">
                  {filteredInvoiceBills.length === 0 ? (
                    <div className="px-4 py-3 text-slate-400 font-bold text-center">
                      No matching invoices found.
                    </div>
                  ) : (
                    filteredInvoiceBills.map((b, idx) => {
                      const targetVal = b.id || b._id || b.invoiceNumber || b.billNumber;
                      const invNo = b.invoiceNumber || b.billNumber || b.id || 'INV';
                      const custName = b.customerName || (typeof b.customer === 'object' && b.customer !== null ? b.customer.name || b.customer.businessName : (typeof b.customer === 'string' ? b.customer : 'Customer'));
                      const amountVal = Number(b.grandTotal || b.subtotal || b.totalAmount || b.total || 0).toFixed(1);
                      const isSelected = String(selectedBillId) === String(targetVal);

                      return (
                        <div
                          key={targetVal || idx}
                          onClick={() => {
                            setSelectedBillId(targetVal);
                            setInvoiceSearchQuery(`${invNo} - ${custName} (₹${amountVal})`);
                            setIsSearchDropdownOpen(false);
                          }}
                          className={`px-4 py-2.5 hover:bg-indigo-50/80 cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-indigo-50 font-black text-indigo-900 border-l-4 border-indigo-600' : 'font-bold text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="font-mono text-slate-900 font-extrabold">{invNo}</div>
                            <div className="text-[11px] text-slate-500 font-semibold">{custName}</div>
                          </div>
                          <div className="font-mono text-indigo-600 font-black">₹{amountVal}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-500">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Items Table Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <h2 className="text-base font-black text-slate-900">Select Items to Return</h2>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {totalItemsReturningCount} Items Selected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase border-b border-slate-200">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3 text-center">Invoiced Qty</th>
                  <th className="px-4 py-3 text-center">Remaining Returnable</th>
                  <th className="px-4 py-3 text-center">Return Qty</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">Refund Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-bold">
                      Select an invoice above to load items.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">
                        <div>{item.name}</div>
                        {item.sku !== '-' && <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{item.purchasedQty} {item.unit || 'Pcs'}</td>
                      <td className="px-4 py-3 text-center font-extrabold text-indigo-600">
                        {item.remainingQty} {item.unit || 'Pcs'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          max={item.remainingQty}
                          disabled={isCancellation}
                          value={item.returnQty}
                          onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-black text-slate-900 focus:bg-white focus:border-indigo-600 outline-none disabled:bg-slate-100 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        ₹{(item.effectiveUnitPrice || item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 text-sm">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact & Refund Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SalesReturnStockImpactCard
            itemsReturning={totalItemsReturningCount}
            stockToBeRestocked={totalItemsReturningCount}
            estimatedAdjustment={`+ ${totalItemsReturningCount} Units`}
          />

          <SalesReturnRefundCard
            refundType={refundType}
            onRefundTypeChange={setRefundType}
            refundAmount={refundAmount}
            onRefundAmountChange={setRefundAmount}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        {/* Submit Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/invoices')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              isCancellation
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isCancellation ? <XCircle size={18} /> : <RotateCcw size={18} />}
            <span>{isSubmitting ? 'Processing...' : isCancellation ? 'Cancel Invoice & Restore Stock' : 'Process Sales Return & Issue Credit Note'}</span>
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={cancelConfirmModalOpen}
        onClose={() => setCancelConfirmModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        title="Cancel Entire Invoice?"
        message="Are you sure you want to cancel this entire bill? All items will be restocked to inventory and bill status will be updated to CANCELLED."
        confirmText="Yes, Cancel Bill"
        cancelText="No, Keep Invoice"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CreateSalesReturnPage;
