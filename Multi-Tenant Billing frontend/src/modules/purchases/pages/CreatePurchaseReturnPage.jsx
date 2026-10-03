import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQueries';
import {
  usePurchaseBillsQuery,
  usePurchaseBillDetailsQuery,
  useCreatePurchaseReturnMutation,
  useCancelPurchaseBillMutation,
} from '../hooks/usePurchaseQueries';
import { useToast } from '../../../context/ToastContext';

// Sub-components
import ReturnStockImpactCard from '../components/ReturnStockImpactCard';
import ReturnRefundAdjustmentCard from '../components/ReturnRefundAdjustmentCard';

const CreatePurchaseReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const urlMode = searchParams.get('mode'); // 'cancellation' | 'cancel' | 'return'
  const urlBillId = searchParams.get('billId');

  const { data: supplierRes } = useSuppliersQuery({ limit: 100 });
  const { data: billRes } = usePurchaseBillsQuery({ limit: 100 });

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

  const bills = Array.isArray(billRes?.items)
    ? billRes.items
    : Array.isArray(billRes?.data?.items)
    ? billRes.data.items
    : Array.isArray(billRes?.purchases)
    ? billRes.purchases
    : Array.isArray(billRes?.data?.purchases)
    ? billRes.data.purchases
    : Array.isArray(billRes?.bills)
    ? billRes.bills
    : Array.isArray(billRes?.data)
    ? billRes.data
    : [];

  const createReturnMutation = useCreatePurchaseReturnMutation();
  const cancelBillMutation = useCancelPurchaseBillMutation();

  // Return Details State
  const [returnType, setReturnType] = useState(
    urlMode === 'cancellation' || urlMode === 'cancel'
      ? 'Purchase Cancellation'
      : 'Purchase Return'
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [returnNo, setReturnNo] = useState(`RET-${Date.now().toString().slice(-6)}`);
  const [selectedBillId, setSelectedBillId] = useState(urlBillId || '');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnReason, setReturnReason] = useState(
    urlMode === 'cancellation' || urlMode === 'cancel' ? 'Order Cancelled' : 'Damaged / Defective'
  );
  const [referenceNotes, setReferenceNotes] = useState('');
  const [returnAgainst, setReturnAgainst] = useState(
    urlMode === 'cancellation' || urlMode === 'cancel' ? 'Full Return' : 'Partial Items'
  );
  const [warehouse, setWarehouse] = useState('');

  // Fetch full details of selected Purchase Bill
  const { data: selectedBillDetailsRes } = usePurchaseBillDetailsQuery(selectedBillId);

  // Items State (populated dynamically when Purchase Bill is selected)
  const [items, setItems] = useState([]);

  const isCancellation = returnType === 'Purchase Cancellation';

  // Sync bill selection & fetch items
  useEffect(() => {
    if (!selectedBillId) {
      setItems([]);
      return;
    }

    const detailedBill = 
      selectedBillDetailsRes?.data?.purchaseInvoice 
      || selectedBillDetailsRes?.data?.purchase 
      || selectedBillDetailsRes?.data 
      || selectedBillDetailsRes?.purchase 
      || selectedBillDetailsRes?.bill 
      || selectedBillDetailsRes 
      || bills.find((b) => String(b.id) === String(selectedBillId) || String(b.purchaseNumber) === String(selectedBillId));

    if (detailedBill) {
      if (detailedBill.supplierId || detailedBill.supplier?.id) {
        setSelectedSupplierId(detailedBill.supplierId || detailedBill.supplier?.id);
      }

      const rawItems = Array.isArray(detailedBill.items) ? detailedBill.items : [];
      if (rawItems.length > 0) {
        setItems(
          rawItems.map((i, idx) => {
            const purchasedQty = Number(i.quantity || i.qty || 1);
            const conversionFactor = Number(i.conversionFactor || i.product?.conversionFactor || 1);
            const primaryUnit = i.product?.unit || 'Pcs';
            const secondaryUnit = i.product?.secondaryUnit || (i.unit !== primaryUnit ? i.unit : null);
            const hasSecondaryUnit = Boolean(i.hasSecondaryUnit || i.product?.hasSecondaryUnit || (secondaryUnit && secondaryUnit !== primaryUnit));
            const purchasedUnit = i.unit || secondaryUnit || primaryUnit || 'Pcs';
            const isSecondaryPurchased = Boolean(hasSecondaryUnit && secondaryUnit && purchasedUnit === secondaryUnit);
            const purchasedBaseQty = Number(i.baseQuantity ?? (purchasedQty * (isSecondaryPurchased ? conversionFactor : 1)));
            const unitPurchasePrice = Number(i.unitPurchasePrice || i.purchasePrice || i.unitPrice || i.price || i.rate || 0);
            const baseUnitPrice = Number(i.baseUnitPrice ?? (isSecondaryPurchased && conversionFactor > 0 ? unitPurchasePrice / conversionFactor : unitPurchasePrice));
            const secondaryUnitPrice = Number(baseUnitPrice * (conversionFactor || 1));
            const discountPercent = Number(i.discountPercent || i.disc || 0);
            const taxRate = Number(i.taxPercent || i.taxRate || i.gst || i.tax || 18);
            const rawTaxMode = i.taxMode || i.taxType || i.product?.taxMode || i.product?.taxType;
            const isAutoInclusive = !rawTaxMode && i.totalAmount && purchasedQty && unitPurchasePrice && (Math.abs(Number(i.totalAmount) - (purchasedQty * unitPurchasePrice)) < 0.01) && taxRate > 0;
            const taxMode = (rawTaxMode || (isAutoInclusive ? 'INCLUSIVE' : 'EXCLUSIVE')).toUpperCase() === 'INCLUSIVE' ? 'INCLUSIVE' : 'EXCLUSIVE';
            const prevReturnedQty = Number(i.returnedQuantity || 0);
            const prevReturnedBaseQty = Number(i.returnedBaseQuantity ?? (prevReturnedQty * (isSecondaryPurchased ? conversionFactor : 1)));
            const remainingBaseQty = Math.max(0, purchasedBaseQty - prevReturnedBaseQty);
            const remainingQty = isSecondaryPurchased && conversionFactor > 0 
              ? Math.floor(remainingBaseQty / conversionFactor)
              : Math.max(0, purchasedQty - prevReturnedQty);

            const itemObj = {
              id: i.id || idx + 1,
              productId: i.productId || i.product?.id || `prod-${idx + 1}`,
              name: i.product?.name || i.productName || i.name || i.title || 'Item',
              description: i.product?.description || i.description || '',
              sku: i.product?.sku || i.sku || i.hsn || '-',
              barcode: i.product?.barcode || i.barcode || '-',
              unit: purchasedUnit,
              purchasedUnit,
              primaryUnit,
              secondaryUnit,
              hasSecondaryUnit,
              conversionFactor,
              purchasedQty,
              purchasedBaseQty,
              prevReturnedQty,
              prevReturnedBaseQty,
              remainingBaseQty,
              remainingQty,
              maxReturnQty: remainingQty,
              unitPurchasePrice,
              baseUnitPrice,
              secondaryUnitPrice,
              returnQty: isCancellation ? purchasedQty : remainingQty,
              unitPrice: unitPurchasePrice,
              discountPercent,
              taxRate,
              taxMode,
            };
            itemObj.amount = calculateAmount(itemObj);
            return itemObj;
          })
        );
      }
    }
  }, [selectedBillId, selectedBillDetailsRes, bills, isCancellation]);

  // Sync return mode switch
  useEffect(() => {
    if (isCancellation) {
      setReturnAgainst('Full Return');
      setReturnReason('Order Cancelled');
      // Set full return quantity for all items
      setItems(prev => prev.map(i => ({ ...i, returnQty: i.purchasedQty })));
    } else {
      setReturnAgainst('Partial Items');
      setReturnReason('Damaged / Defective');
    }
  }, [isCancellation]);

  // Refund / Adjustment State
  const [refundType, setRefundType] = useState('Cash Refund');
  const [refundAmount, setRefundAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const calculateAmount = (item) => {
    const qty = Number(item.returnQty) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const tax = Number(item.taxRate) || 0;
    const isInclusive = (item.taxMode || '').toUpperCase() === 'INCLUSIVE';

    const gross = qty * price;
    const discAmt = gross * (disc / 100);
    const net = gross - discAmt;

    if (isInclusive && tax > 0) {
      return Math.round(net);
    } else {
      const taxAmt = net * (tax / 100);
      return Math.round(net + taxAmt);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'unit') {
        target.unit = value;
        const isBase = value === target.primaryUnit && target.hasSecondaryUnit;
        if (isBase) {
          target.unitPrice = target.baseUnitPrice || target.unitPurchasePrice;
          target.maxReturnQty = target.remainingBaseQty;
          target.returnQty = target.remainingBaseQty;
        } else {
          target.unitPrice = target.secondaryUnitPrice || target.unitPurchasePrice;
          target.maxReturnQty = target.conversionFactor > 0 ? Math.floor(target.remainingBaseQty / target.conversionFactor) : target.remainingQty;
          target.returnQty = target.maxReturnQty;
        }
      } else {
        target[field] = value;
      }

      target.amount = calculateAmount(target);
      updated[index] = target;
      return updated;
    });
  };

  const totalItemsCount = items.length;
  const totalReturnQtyCount = items.reduce((acc, i) => acc + (Number(i.returnQty) || 0), 0);

  let subTotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalTax = 0;

  items.forEach((i) => {
    const qty = Number(i.returnQty) || 0;
    const price = Number(i.unitPrice) || 0;
    const discPct = Number(i.discountPercent) || 0;
    const taxRate = Number(i.taxRate) || 0;
    const isInclusive = (i.taxMode || '').toUpperCase() === 'INCLUSIVE';

    const gross = qty * price;
    const disc = gross * (discPct / 100);
    const net = gross - disc;

    totalDiscount += disc;

    if (isInclusive && taxRate > 0) {
      const lineTaxable = net / (1 + taxRate / 100);
      const lineTax = net - lineTaxable;
      taxableAmount += lineTaxable;
      totalTax += lineTax;
      subTotal += (lineTaxable + disc);
    } else {
      const lineTaxable = net;
      const lineTax = lineTaxable * (taxRate / 100);
      taxableAmount += lineTaxable;
      totalTax += lineTax;
      subTotal += gross;
    }
  });

  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const grandTotal = Math.round(taxableAmount + totalTax);

  const handleSaveReturn = async () => {
    if (!selectedBillId) {
      toast.error('Please select a purchase bill to proceed.');
      return;
    }

    const returningItems = items.filter((i) => (Number(i.returnQty) || 0) > 0);
    if (returningItems.length === 0) {
      toast.error('Please specify return quantity for at least one item.');
      return;
    }

    const payload = {
      purchaseInvoiceId: selectedBillId,
      returnType: isCancellation ? 'PURCHASE_CANCELLATION' : 'PURCHASE_RETURN',
      supplierId: selectedSupplierId || undefined,
      returnDate,
      returnReason,
      referenceNotes,
      returnAgainst: isCancellation ? 'FULL_RETURN' : (returnAgainst === 'Full Return' ? 'FULL_RETURN' : 'PARTIAL_ITEMS'),
      warehouse,
      refundType: refundType === 'Cash Refund' ? 'CASH_REFUND' : (refundType === 'Adjust in Next Purchase' ? 'ADJUST_IN_NEXT_PURCHASE' : 'BANK_TRANSFER'),
      refundAmount: Number(refundAmount) || grandTotal,
      paymentMethod: paymentMethod === 'Bank Transfer' ? 'OTHER' : (paymentMethod === 'UPI' ? 'UPI' : 'CASH'),
      bankAccount,
      returnItems: returningItems.map((i) => ({
        productId: i.productId || i.product?.id,
        unit: i.unit || 'Nos',
        purchasedQty: Number(i.purchasedQty) || 1,
        returnQuantity: Number(i.returnQty) || 1,
        unitPrice: Number(i.unitPrice) || 0,
        discountPercent: Number(i.discountPercent) || 0,
        taxPercent: Number(i.taxRate) || 18,
        taxMode: i.taxMode || 'EXCLUSIVE',
      })),
    };

    try {
      if (isCancellation) {
        await cancelBillMutation.mutateAsync(selectedBillId);
        toast.success('Purchase Bill cancelled successfully! Inventory stock reversed.');
      } else {
        await createReturnMutation.mutateAsync(payload);
        toast.success('Purchase Return created & Debit Note generated!');
      }
      navigate('/vendor/purchases');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || (Array.isArray(err?.response?.data?.errors) ? err?.response?.data?.errors[0] : null) || err?.message || 'Failed to process request.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 pb-16 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/purchases" className="hover:text-indigo-600 transition-colors">
          Purchase
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span>Purchase Returns</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">{isCancellation ? 'Cancel Purchase Bill' : 'Create Purchase Return'}</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isCancellation ? 'Purchase Bill Cancellation' : 'Purchase Return (Debit Note)'}
            </h1>
            <span className={`px-3 py-1 text-xs font-black rounded-full uppercase border ${
              isCancellation ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {isCancellation ? 'Full Cancellation' : 'Item Return'}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            {isCancellation
              ? 'Void entire purchase bill, reverse full inventory stock and restore supplier dues.'
              : 'Return damaged or defective items to vendor and issue Debit Note.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/vendor/purchases')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveReturn}
            className={`flex items-center gap-2 px-5 py-2.5 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer ${
              isCancellation
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isCancellation ? <XCircle size={18} /> : <RotateCcw size={18} />}
            <span>{isCancellation ? 'Confirm & Cancel Purchase Bill' : 'Save & Confirm Return'}</span>
          </button>
        </div>
      </div>

      {/* Mode Alert Notification Bar */}
      {isCancellation ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertTriangle size={20} className="shrink-0 text-rose-600" />
          <div>
            <strong>Purchase Cancellation Mode:</strong> This will void the selected bill, remove 100% item quantities from stock, and clear the supplier outstanding balance.
          </div>
        </div>
      ) : (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-indigo-900 text-xs font-bold">
          <RotateCcw size={20} className="shrink-0 text-indigo-600" />
          <div>
            <strong>Purchase Return (Debit Note) Mode:</strong> Specify damaged or returned item quantities to deduct from inventory and issue Debit Note to supplier.
          </div>
        </div>
      )}

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Return Details */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center ${isCancellation ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                1
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {isCancellation ? 'Cancellation Details' : 'Return Details'}
              </h2>
            </div>

            {/* Return Type Segmented Toggle Buttons */}
            <div>
              <label className="block mb-1.5 uppercase text-[11px] font-extrabold text-slate-700">
                Operation Mode <span className="text-rose-500">*</span>
              </label>
              <div className="inline-flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: 'Purchase Return', value: 'Purchase Return' },
                  { label: 'Purchase Cancellation', value: 'Purchase Cancellation' }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setReturnType(t.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      returnType === t.value
                        ? (t.value === 'Purchase Cancellation' ? 'bg-rose-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm')
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Supplier & Return No */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
              <div className="sm:col-span-2">
                <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
                  Select Purchase Bill <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBillId}
                  onChange={(e) => setSelectedBillId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select Bill --</option>
                  {bills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.purchaseNumber || b.supplierInvoiceNumber || b.id} - {b.supplier?.name || b.supplierName || 'Supplier'} (₹{b.totalAmount || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase text-[11px] font-extrabold text-slate-700">Doc / Return No.</label>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Auto-Generated
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  value={returnNo}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="Damaged / Defective">Damaged / Defective</option>
                  <option value="Order Cancelled">Order Cancelled</option>
                  <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Over-supplied">Over-supplied</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Warehouse</label>
                <input
                  type="text"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Return Line Items Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center ${isCancellation ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                  2
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {isCancellation ? 'Bill Items to be Cancelled' : 'Return Line Items'}
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3 text-center">Purchased Qty</th>
                    <th className="py-3 px-3 text-center">{isCancellation ? 'Cancelled Qty' : 'Return Qty'}</th>
                    <th className="py-3 px-3 text-right">Unit Rate (₹)</th>
                    <th className="py-3 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{item.description}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">{item.sku}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-600">
                        <div>{item.purchasedQty} {item.purchasedUnit || item.unit}</div>
                        {item.hasSecondaryUnit && item.purchasedBaseQty > 0 && (
                          <div className="text-[10px] text-slate-400 font-semibold">({item.purchasedBaseQty} {item.primaryUnit})</div>
                        )}
                        {item.prevReturnedQty > 0 && (
                          <div className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            {item.prevReturnedQty} ret, {item.remainingQty} left
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={item.maxReturnQty || item.purchasedQty}
                            disabled={isCancellation}
                            value={item.returnQty}
                            onChange={(e) => handleItemChange(idx, 'returnQty', e.target.value)}
                            className={`w-16 px-2 py-1 border rounded-lg text-center font-black focus:outline-none ${
                              isCancellation ? 'bg-slate-100 border-slate-200 text-slate-700' : 'border-indigo-300 text-indigo-700 bg-indigo-50/50'
                            }`}
                          />
                          {item.hasSecondaryUnit && item.secondaryUnit ? (
                            <select
                              value={item.unit}
                              disabled={isCancellation}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              className="px-1.5 py-1 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                            >
                              <option value={item.secondaryUnit}>{item.secondaryUnit}</option>
                              <option value={item.primaryUnit}>{item.primaryUnit}</option>
                            </select>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-500">{item.unit}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">₹{item.unitPrice.toLocaleString('en-IN')}.00</td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-900">₹{item.amount.toLocaleString('en-IN')}.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 pt-3 border-t border-slate-100">
              <div>Total Items: <span className="text-indigo-600 font-black">{totalItemsCount}</span></div>
              <div>Total {isCancellation ? 'Cancelled' : 'Return'} Qty: <span className="text-indigo-600 font-black">{totalReturnQtyCount}</span></div>
            </div>
          </div>

          {/* SECTION 4 & 5: Refund / Adjustment Sub-Component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ReturnRefundAdjustmentCard
              refundType={refundType}
              onRefundTypeChange={setRefundType}
              refundAmount={refundAmount}
              onRefundAmountChange={setRefundAmount}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              bankAccount={bankAccount}
              onBankAccountChange={setBankAccount}
              totalReturnAmount={grandTotal}
            />

            {/* Additional Info */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center ${isCancellation ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                  5
                </div>
                <h2 className="text-base font-black text-slate-900">Notes & Remarks</h2>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block mb-1 uppercase font-bold text-slate-700">Remarks</label>
                  <textarea
                    rows="3"
                    value={referenceNotes}
                    onChange={(e) => setReferenceNotes(e.target.value)}
                    placeholder="Enter additional cancellation/return remarks..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Return Summary & Stock Impact */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center ${isCancellation ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                3
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {isCancellation ? 'Cancellation Summary' : 'Return Summary'}
              </h2>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span>Sub Total</span>
                <span className="font-bold text-slate-900">₹{subTotal.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between text-rose-600">
                <span>Discount</span>
                <span className="font-bold">- ₹{totalDiscount.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Taxable Amount</span>
                <span className="font-bold text-slate-900">₹{taxableAmount.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span>CGST (₹)</span>
                <span className="font-bold text-slate-900">₹{cgst.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span>SGST (₹)</span>
                <span className="font-bold text-slate-900">₹{sgst.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-base font-black">₹{grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            {/* Highlight Refund Box */}
            <div className={`p-4 rounded-2xl flex items-center justify-between border ${
              isCancellation ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'
            }`}>
              <span className={`text-xs font-black uppercase ${isCancellation ? 'text-rose-900' : 'text-indigo-900'}`}>
                {isCancellation ? 'Cancelled Invoice Value' : 'Refund / Adjustment'}
              </span>
              <span className={`text-xl font-black ${isCancellation ? 'text-rose-700' : 'text-indigo-700'}`}>
                ₹{grandTotal.toLocaleString('en-IN')}.00
              </span>
            </div>
          </div>

          {/* Stock Impact Sub-Component */}
          <ReturnStockImpactCard
            itemsReturning={totalReturnQtyCount}
            stockToBeDeducted={totalReturnQtyCount}
            estimatedAdjustment={`- ${totalReturnQtyCount} Units`}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseReturnPage;
