import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Edit3,
  CreditCard,
  RotateCcw,
  Printer,
  Download,
  MoreVertical,
  Trash2,
  XCircle,
  CheckCircle2,
  Building2,
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';
import {
  usePurchaseBillDetailsQuery,
  useRecordBillPaymentMutation,
  useConfirmPurchaseBillMutation,
  useCancelPurchaseBillMutation,
  useDeletePurchaseBillMutation,
  useDeletePurchasePaymentMutation,
} from '../hooks/usePurchaseQueries';
import { useSupplierDetailsQuery, useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQueries';
import { useProductsQuery } from '../../products/hooks/useProductsQueries';
import { useToast } from '../../../context/ToastContext';
import RecordPaymentModal from '../../suppliers/components/RecordPaymentModal';
import PrintableBillModal from '../components/PrintableBillModal';
import { downloadPurchaseBillPdf, printPurchaseBillPdf } from '../utils/purchaseBillPrintUtil';

const PurchaseBillDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
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

  const { data: responseData, isLoading, refetch } = usePurchaseBillDetailsQuery(id);
  const recordPaymentMutation = useRecordBillPaymentMutation();
  const confirmBillMutation = useConfirmPurchaseBillMutation();
  const cancelBillMutation = useCancelPurchaseBillMutation();
  const deleteBillMutation = useDeletePurchaseBillMutation();
  const deletePaymentMutation = useDeletePurchasePaymentMutation();

  // Extract raw bill & nested backend structures from API response
  const apiData = responseData?.data || responseData || null;
  const purchaseBill = apiData?.purchaseBill || apiData?.purchaseInvoice || apiData?.purchase || apiData || {};
  const supplierDetails =
    apiData?.supplierDetails ||
    apiData?.supplier ||
    apiData?.vendorDetails ||
    apiData?.vendor ||
    purchaseBill?.supplierDetails ||
    purchaseBill?.supplier ||
    purchaseBill?.vendorDetails ||
    purchaseBill?.vendor ||
    {};
  const paymentSummary = apiData?.paymentSummary || {};
  const billSummary = apiData?.billSummary || {};

  const supplierId =
    supplierDetails?.id ||
    supplierDetails?._id ||
    purchaseBill?.supplierId ||
    purchaseBill?.supplier_id ||
    (typeof purchaseBill?.supplier === 'object' && (purchaseBill?.supplier?.id || purchaseBill?.supplier?._id)) ||
    apiData?.supplierId ||
    apiData?.supplier_id;

  const { data: supplierDetailsRes } = useSupplierDetailsQuery(supplierId);
  const { data: suppliersListRes } = useSuppliersQuery({ limit: 100 });
  const { data: productsListRes } = useProductsQuery({ limit: 100 });

  const allProducts = Array.isArray(productsListRes?.items)
    ? productsListRes.items
    : Array.isArray(productsListRes?.data?.items)
      ? productsListRes.data.items
      : Array.isArray(productsListRes?.products)
        ? productsListRes.products
        : Array.isArray(productsListRes?.data?.products)
          ? productsListRes.data.products
          : Array.isArray(productsListRes?.data)
            ? productsListRes.data
            : [];

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

  const fetchedSupplierObj =
    supplierDetailsRes?.supplierInformation ||
    supplierDetailsRes?.data?.supplierInformation ||
    supplierDetailsRes?.supplier ||
    supplierDetailsRes?.data?.supplier ||
    supplierDetailsRes?.data ||
    supplierDetailsRes ||
    {};

  const supplierFromList =
    (supplierId && allSuppliers.find((s) => String(s.id) === String(supplierId) || String(s._id) === String(supplierId))) ||
    {};

  const supObj = (typeof purchaseBill?.supplier === 'object' && purchaseBill?.supplier !== null)
    ? purchaseBill.supplier
    : ((typeof apiData?.supplier === 'object' && apiData?.supplier !== null) ? apiData.supplier : supplierDetails);

  const matchedSupplierByName = (allSuppliers.length > 0 && (supObj.name || supObj.companyName))
    ? allSuppliers.find(s =>
      (s.id && String(s.id) === String(supplierId)) ||
      (s._id && String(s._id) === String(supplierId)) ||
      (s.name && supObj.name && String(s.name).trim().toLowerCase() === String(supObj.name).trim().toLowerCase()) ||
      (s.companyName && supObj.companyName && String(s.companyName).trim().toLowerCase() === String(supObj.companyName).trim().toLowerCase())
    )
    : null;

  // Function to filter out invalid fallback name "Supplier"
  const getValidName = (...candidates) => {
    for (const c of candidates) {
      if (c && typeof c === 'string') {
        const trimmed = c.trim();
        if (trimmed && trimmed.toLowerCase() !== 'supplier') return trimmed;
      }
    }
    return null;
  };

  const sName = getValidName(
    supObj.name,
    supObj.companyName,
    supplierDetails.name,
    supplierDetails.companyName,
    fetchedSupplierObj.name,
    fetchedSupplierObj.companyName,
    supplierFromList.name,
    supplierFromList.companyName,
    matchedSupplierByName?.name,
    matchedSupplierByName?.companyName,
    purchaseBill?.supplierName,
    purchaseBill?.companyName,
    typeof purchaseBill?.supplier === 'string' ? purchaseBill.supplier : null
  ) || 'Supplier';

  const sMobile =
    supObj.mobileNumber || supObj.mobile || supObj.phone || supObj.contactNumber ||
    supplierDetails.mobileNumber || supplierDetails.mobile || supplierDetails.phone || supplierDetails.contactNumber ||
    fetchedSupplierObj.mobileNumber || fetchedSupplierObj.mobile || fetchedSupplierObj.phone ||
    supplierFromList.mobileNumber || supplierFromList.mobile || supplierFromList.phone ||
    matchedSupplierByName?.mobileNumber || matchedSupplierByName?.mobile || matchedSupplierByName?.phone ||
    purchaseBill?.supplierMobile || purchaseBill?.mobile || '-';

  const sEmail =
    supObj.email ||
    supplierDetails.email ||
    fetchedSupplierObj.email ||
    supplierFromList.email ||
    matchedSupplierByName?.email ||
    purchaseBill?.supplierEmail || purchaseBill?.email || '-';

  const sGstin =
    supObj.gstin || supObj.gstNumber || supObj.gst ||
    supplierDetails.gstin || supplierDetails.gstNumber || supplierDetails.gst ||
    fetchedSupplierObj.gstin || fetchedSupplierObj.gstNumber || fetchedSupplierObj.gst ||
    supplierFromList.gstin || supplierFromList.gstNumber || supplierFromList.gst ||
    matchedSupplierByName?.gstin || matchedSupplierByName?.gstNumber || matchedSupplierByName?.gst ||
    purchaseBill?.supplierGstin || purchaseBill?.gstin || '-';

  const sPan =
    supObj.pan ||
    supplierDetails.pan ||
    fetchedSupplierObj.pan ||
    supplierFromList.pan ||
    matchedSupplierByName?.pan ||
    purchaseBill?.supplierPan || purchaseBill?.pan || '-';

  const rawAddress =
    supObj.address || supObj.street ||
    supplierDetails.address || supplierDetails.street ||
    fetchedSupplierObj.address || fetchedSupplierObj.street ||
    supplierFromList.address || supplierFromList.street ||
    matchedSupplierByName?.address || matchedSupplierByName?.street ||
    purchaseBill?.supplierAddress || purchaseBill?.address || '';

  const city =
    supObj.city ||
    supplierDetails.city ||
    fetchedSupplierObj.city ||
    supplierFromList.city ||
    matchedSupplierByName?.city ||
    purchaseBill?.supplierCity || purchaseBill?.city || '';

  const state =
    supObj.state ||
    supplierDetails.state ||
    fetchedSupplierObj.state ||
    supplierFromList.state ||
    matchedSupplierByName?.state ||
    purchaseBill?.supplierState || purchaseBill?.state || '';

  const pincode =
    supObj.pincode ||
    supplierDetails.pincode ||
    fetchedSupplierObj.pincode ||
    supplierFromList.pincode ||
    matchedSupplierByName?.pincode ||
    purchaseBill?.supplierPincode || purchaseBill?.pincode || '';

  let fullAddress = rawAddress;
  if (fullAddress) {
    if (city && !fullAddress.toLowerCase().includes(city.toLowerCase())) fullAddress += `, ${city}`;
    if (state && !fullAddress.toLowerCase().includes(state.toLowerCase())) fullAddress += `, ${state}`;
    if (pincode && !fullAddress.includes(pincode)) fullAddress += ` - ${pincode}`;
  } else {
    fullAddress = [city, state, pincode].filter(Boolean).join(', ');
  }

  const rawBillNo = purchaseBill?.purchaseNumber || purchaseBill?.billNumber || purchaseBill?.supplierInvoiceNumber || purchaseBill?.id || id;
  const purchaseNumber = (rawBillNo && String(rawBillNo).length > 18 && String(rawBillNo).includes('-'))
    ? `PUR-${String(rawBillNo).split('-')[0].toUpperCase()}`
    : String(rawBillNo || 'PUR-001');

  const rawPurchaseDate = purchaseBill?.invoiceDate || purchaseBill?.purchaseDate || paymentSummary?.paymentDate || purchaseBill?.createdAt;
  const formattedPurchaseDate = rawPurchaseDate
    ? new Date(rawPurchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalAmt = Number(paymentSummary.totalAmount ?? billSummary.grandTotal ?? purchaseBill?.totalAmount ?? 0);
  const paidAmt = Number(paymentSummary.paidAmount ?? purchaseBill?.paidAmount ?? 0);
  const dueAmt = Number(paymentSummary.dueAmount ?? purchaseBill?.dueAmount ?? Math.max(0, totalAmt - paidAmt));

  // Dynamic Normalized Display Bill mapped 100% from Backend API
  const displayBill = apiData ? {
    id: purchaseBill.id || id,
    purchaseNumber,
    status: purchaseBill.purchaseStatus || purchaseBill.status || 'CONFIRMED',
    supplierInvoiceNumber: purchaseBill.supplierInvoiceNumber || purchaseBill.billNumber || '-',
    purchaseDate: formattedPurchaseDate,
    dueDate: purchaseBill.dueDate ? String(purchaseBill.dueDate).split('T')[0] : '-',
    purchaseType: purchaseBill.purchaseType || 'Local Purchase',
    paymentStatus: paymentSummary.paymentStatus || purchaseBill.paymentStatus || 'PAID',
    paymentMethod: paymentSummary.paymentMethod || purchaseBill.paymentMethod || 'Bank Transfer',
    paymentDate: paymentSummary.paymentDate ? String(paymentSummary.paymentDate).split('T')[0] : (purchaseBill.invoiceDate ? String(purchaseBill.invoiceDate).split('T')[0] : '-'),
    referenceNumber: paymentSummary.referenceNumber || purchaseBill.referenceNumber || '-',
    bankAccount: paymentSummary.bankAccount || purchaseBill.bankAccount || '-',
    totalAmount: totalAmt,
    paidAmount: paidAmt,
    dueAmount: dueAmt,
    paymentTerms: purchaseBill.paymentTerms || '-',
    referenceNotes: purchaseBill.notes || purchaseBill.referenceNotes || '-',
    createdBy: purchaseBill.createdBy?.name || purchaseBill.createdBy || 'Admin',
    createdOn: purchaseBill.createdAt ? new Date(purchaseBill.createdAt).toLocaleDateString('en-IN') : '-',
    lastUpdatedBy: purchaseBill.updatedBy?.name || purchaseBill.lastUpdatedBy || 'Admin',
    lastUpdatedOn: purchaseBill.updatedAt ? new Date(purchaseBill.updatedAt).toLocaleDateString('en-IN') : '-',
    payments: Array.isArray(apiData.payments) ? apiData.payments : (Array.isArray(purchaseBill.payments) ? purchaseBill.payments : []),
    supplier: {
      id: supplierId || '-',
      name: sName,
      companyName: supplierDetails.companyName || fetchedSupplierObj.companyName || supplierFromList.companyName || '',
      address: fullAddress || '-',
      city: city || '-',
      state: state || '-',
      mobile: sMobile,
      email: sEmail,
      gstin: sGstin,
      pan: sPan,
    },
    items: Array.isArray(apiData.items)
      ? apiData.items.map((item, idx) => {
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.unitPurchasePrice || item.purchasePrice || item.unitPrice || item.price || item.rate || 0);
        const discPct = Number(item.discountPercent || item.disc || 0);
        const taxRate = Number(item.taxPercent || item.taxRate || item.gst || item.tax || 0);
        const rawTotal = Number(item.totalAmount || item.amount || 0);
        const net = qty * price * (1 - discPct / 100);

        const explicitTaxMode = String(
          item.taxMode ||
          item.taxType ||
          item.tax_mode ||
          item.tax_type ||
          (item.isTaxInclusive || item.is_tax_inclusive ? 'INCLUSIVE' : '') ||
          item.product?.taxMode ||
          item.product?.taxType ||
          item.product?.tax_mode ||
          item.product?.tax_type ||
          (item.product?.isTaxInclusive || item.product?.is_tax_inclusive ? 'INCLUSIVE' : '') ||
          ''
        ).toUpperCase();

        let isInclusive = false;
        if (['INCLUSIVE', 'GST_INCLUSIVE', 'INCL', 'TRUE'].includes(explicitTaxMode)) {
          isInclusive = true;
        } else if (['EXCLUSIVE', 'GST_EXCLUSIVE', 'EXCL', 'FALSE'].includes(explicitTaxMode)) {
          isInclusive = false;
        } else if (rawTotal > 0 && taxRate > 0) {
          const exclCalculated = net * (1 + taxRate / 100);
          if (Math.abs(rawTotal - net) <= Math.abs(rawTotal - exclCalculated)) {
            isInclusive = true;
          }
        }

        const taxMode = isInclusive ? 'INCLUSIVE' : 'EXCLUSIVE';

        let lineAmount = rawTotal;
        if (isInclusive && taxRate > 0) {
          lineAmount = Math.round(net);
        } else if (!lineAmount) {
          lineAmount = Math.round(net + net * (taxRate / 100));
        }

        const targetProdId = item.productId || item.product?.id;
        const itemName = item.productName || item.product?.name || item.name || item.title || '';
        const matchedCatalogProd = allProducts.find(
          (p) => (targetProdId && (p.id === targetProdId || p._id === targetProdId)) ||
            (p.name && itemName && p.name.trim().toLowerCase() === itemName.trim().toLowerCase())
        );

        const hsnVal = item.hsnCode || item.hsn || item.product?.hsnCode || item.product?.hsn || matchedCatalogProd?.hsnCode || matchedCatalogProd?.hsn || '';
        const skuVal = item.sku || item.product?.sku || matchedCatalogProd?.sku || '';

        const displayHsn = (hsnVal && hsnVal !== '-')
          ? hsnVal
          : ((skuVal && skuVal !== '-') ? `SKU: ${skuVal}` : '-');

        const baseUnit = item.baseUnit || item.product?.baseUnit || item.product?.unit || matchedCatalogProd?.unit || 'Pcs';
        const primaryUnit = item.unit || item.purchaseUnit || item.product?.purchaseUnit || matchedCatalogProd?.secondaryUnit || matchedCatalogProd?.unit || 'Pcs';
        const secondaryUnit = item.secondaryUnit || item.product?.secondaryUnit || matchedCatalogProd?.secondaryUnit || 'Box';
        const conversionFactor = Number(
          item.conversionFactor ||
          item.product?.conversionFactor ||
          matchedCatalogProd?.conversionFactor ||
          item.unitRatio ||
          item.pcsPerBox ||
          1
        );

        const isBoxPurchased = ['BOX', 'PACK', 'CARTON', 'CASE', 'DOZEN', 'SET'].includes(String(primaryUnit).toUpperCase());

        const baseQuantity = Number(
          item.baseQuantity ||
          item.quantityInBaseUnit ||
          item.totalPieces ||
          item.totalPcs ||
          (conversionFactor > 1 ? qty * conversionFactor : qty)
        );

        const boxCount = item.boxQuantity || item.boxes || item.boxCount || item.packs || (isBoxPurchased ? qty : (conversionFactor > 1 && qty >= conversionFactor ? Math.floor(qty / conversionFactor) : null));

        return {
          id: item.id || idx + 1,
          productId: targetProdId || `prod-${idx + 1}`,
          name: itemName || 'Item',
          sku: skuVal || '-',
          hsnCode: hsnVal || '-',
          hsn: displayHsn,
          unit: primaryUnit,
          baseUnit,
          secondaryUnit,
          conversionFactor,
          boxCount,
          baseQuantity,
          quantity: qty,
          purchasePrice: price,
          mrp: Number(item.mrp || item.unitPurchasePrice || item.purchasePrice || matchedCatalogProd?.mrp || 0),
          discountPercent: discPct,
          taxRate,
          taxMode,
          amount: lineAmount,
        };
      })
      : []
  } : null;

  const itemsList = displayBill?.items || [];
  const totalItemsCount = itemsList.length;
  const totalQuantityCount = itemsList.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  const totalBoxCount = itemsList.reduce((acc, i) => acc + (Number(i.boxCount) || 0), 0);
  const totalBasePcsCount = itemsList.reduce((acc, i) => acc + (Number(i.baseQuantity) || Number(i.quantity) || 1), 0);

  let calculatedSubTotal = 0;
  let calculatedDiscount = 0;
  let calculatedTaxable = 0;
  let calculatedTax = 0;

  itemsList.forEach((i) => {
    const qty = Number(i.quantity) || 1;
    const price = Number(i.purchasePrice) || 0;
    const discPct = Number(i.discountPercent) || 0;
    const taxRate = Number(i.taxRate) || 0;
    const isInclusive = (i.taxMode || '').toUpperCase() === 'INCLUSIVE';

    const gross = qty * price;
    const disc = gross * (discPct / 100);
    const net = gross - disc;

    calculatedDiscount += disc;

    if (isInclusive && taxRate > 0) {
      const lineTaxable = net / (1 + taxRate / 100);
      const lineTax = net - lineTaxable;
      calculatedTaxable += lineTaxable;
      calculatedTax += lineTax;
      calculatedSubTotal += (lineTaxable + disc);
    } else {
      const lineTaxable = net;
      const lineTax = lineTaxable * (taxRate / 100);
      calculatedTaxable += lineTaxable;
      calculatedTax += lineTax;
      calculatedSubTotal += gross;
    }
  });

  const hasInclusiveItems = itemsList.some((i) => (i.taxMode || '').toUpperCase() === 'INCLUSIVE');

  const subTotalCalc = (hasInclusiveItems || purchaseBill?.subtotal === undefined) ? Math.round(calculatedSubTotal) : Number(purchaseBill.subtotal);
  const discountCalc = (hasInclusiveItems || purchaseBill?.discountAmount === undefined) ? Math.round(calculatedDiscount) : Number(purchaseBill.discountAmount);
  const taxableAmountCalc = (hasInclusiveItems || purchaseBill?.taxableAmount === undefined) ? Math.round(calculatedTaxable) : Number(purchaseBill.taxableAmount);
  const taxAmountCalc = (hasInclusiveItems || purchaseBill?.taxAmount === undefined) ? Math.round(calculatedTax) : Number(purchaseBill.taxAmount);
  const grandTotalCalc = (hasInclusiveItems || purchaseBill?.totalAmount === undefined) ? Math.round(calculatedTaxable + calculatedTax) : Number(purchaseBill.totalAmount);

  const paidAmountCalc = purchaseBill?.paidAmount !== undefined ? Number(purchaseBill.paidAmount) : grandTotalCalc;
  const dueAmountCalc = purchaseBill?.dueAmount !== undefined ? Number(purchaseBill.dueAmount) : Math.max(0, grandTotalCalc - paidAmountCalc);

  const handlePrint = async () => {
    try {
      toast.info('Opening Print Window...');
      await printPurchaseBillPdf(displayBill);
    } catch (err) {
      toast.error('Failed to print bill.');
    }
  };

  const handleDownload = async () => {
    try {
      toast.info('Downloading Purchase Bill PDF...');
      await downloadPurchaseBillPdf(displayBill);
      toast.success('Purchase Bill PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PDF.');
    }
  };

  const handleConfirmBill = async () => {
    try {
      await confirmBillMutation.mutateAsync(id);
      toast.success('Purchase Bill confirmed!');
      refetch();
    } catch (err) {
      toast.error('Failed to confirm bill.');
    }
  };

  const handleCancelBill = async () => {
    try {
      await cancelBillMutation.mutateAsync(id);
      toast.success('Purchase Bill cancelled!');
      refetch();
    } catch (err) {
      toast.error('Failed to cancel bill.');
    }
  };

  const handleDeleteBill = async () => {
    if (!window.confirm('Permanently delete this purchase bill?')) return;
    try {
      await deleteBillMutation.mutateAsync(id);
      toast.success('Purchase bill deleted.');
      navigate('/vendor/purchases');
    } catch (err) {
      toast.error('Failed to delete bill.');
    }
  };

  const handleRecordPaymentSubmit = async (supId, pmtPayload) => {
    try {
      await recordPaymentMutation.mutateAsync({ id, paymentData: pmtPayload });
      toast.success(`Recorded ₹${pmtPayload.amount} payment!`);
      setRecordPaymentOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to record payment.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold text-sm">
        Loading purchase bill details...
      </div>
    );
  }

  if (!displayBill) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Purchase Bill Not Found</h3>
        <button
          onClick={() => navigate('/vendor/purchases')}
          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Purchase Bills
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 pb-16 animate-fadeIn font-sans">
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
                {displayBill.purchaseNumber}
              </h1>
              <span className={`px-2.5 py-0.5 font-extrabold text-[11px] rounded-full uppercase border ${displayBill.status === 'CONFIRMED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : displayBill.status === 'DRAFT'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                {displayBill.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Bill Date: <strong className="text-slate-800">{displayBill.purchaseDate}</strong>
              {displayBill.supplierInvoiceNumber !== '-' && ` • Supplier Inv: ${displayBill.supplierInvoiceNumber}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          <button
            onClick={() => setRecordPaymentOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <CreditCard size={15} />
            <span>Record Payment</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="More Actions"
            >
              <MoreVertical size={16} />
            </button>

            {showMoreActions && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 space-y-0.5 text-xs font-bold text-slate-700">
                <button
                  onClick={() => { setShowMoreActions(false); navigate(`/vendor/purchases/edit/${id}`); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit3 size={14} className="text-slate-500" />
                  <span>Edit Bill</span>
                </button>

                <button
                  onClick={() => { setShowMoreActions(false); navigate(`/vendor/purchases/returns/create?billId=${displayBill.id}&mode=return`); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                >
                  <RotateCcw size={14} className="text-amber-600" />
                  <span>Return Items</span>
                </button>

                {displayBill.status !== 'CANCELLED' && (
                  <button
                    onClick={() => { setShowMoreActions(false); handleCancelBill(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-rose-600 flex items-center gap-2"
                  >
                    <XCircle size={14} />
                    <span>Cancel Bill</span>
                  </button>
                )}

                <button
                  onClick={() => { setShowMoreActions(false); handleDeleteBill(); }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100"
                >
                  <Trash2 size={14} />
                  <span>Delete Bill</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Bill Items Table (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">Purchase Items ({totalItemsCount})</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md border border-emerald-200/80 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Stock Updated
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                {totalBoxCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200/80">
                    📦 <strong>{totalBoxCount}</strong> Boxes/Packs
                  </span>
                )}
                <span>
                  Total Purchased Qty: <strong className="text-slate-900">{totalQuantityCount} {itemsList[0]?.unit || 'Pcs'}</strong>
                  {totalBasePcsCount !== totalQuantityCount && totalBasePcsCount > 0 && (
                    <span className="ml-1 text-indigo-600 font-extrabold">({totalBasePcsCount} Pcs total)</span>
                  )}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Product Details</th>
                    <th className="py-2.5 px-3 text-center">HSN / SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty & Packaging</th>
                    <th className="py-2.5 px-3 text-right">Price / Rate (₹)</th>
                    <th className="py-2.5 px-3 text-center">Disc</th>
                    <th className="py-2.5 px-3 text-center">Tax (GST)</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {itemsList.map((item, idx) => {
                    const unitName = item.unit || 'Pcs';
                    const baseUnitName = item.baseUnit || 'Pcs';
                    const hasBox = item.boxCount && item.boxCount > 0;
                    const hasConversion = item.conversionFactor && item.conversionFactor > 1;
                    const baseQty = item.baseQuantity || (hasConversion ? item.quantity * item.conversionFactor : item.quantity);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200">
                              {unitName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">{item.hsn}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-black text-slate-900 text-sm">
                            {item.quantity} <span className="text-xs font-extrabold text-slate-600">{unitName}</span>
                          </div>
                          {hasConversion ? (
                            <div className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50/90 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-indigo-100">
                              ⚡ {baseQty} {baseUnitName} ({item.conversionFactor} {baseUnitName}/{unitName})
                            </div>
                          ) : (
                            <div className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50/90 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-emerald-100">
                              ⚡ {baseQty} {baseUnitName} total
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{(item.purchasePrice || 0).toLocaleString('en-IN')}.00</td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {item.discountPercent > 0 ? (
                            <span className="text-amber-700 font-bold text-[11px]">{item.discountPercent}%</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          <div>{item.taxRate}%</div>
                          {item.taxMode === 'INCLUSIVE' ? (
                            <span className="text-[10px] text-emerald-600 font-extrabold block">(Incl.)</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold block">(Excl.)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">₹{(item.amount || 0).toLocaleString('en-IN')}.00</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Payment History */}
          {displayBill.referenceNotes !== '-' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-1">
              <h4 className="font-extrabold text-slate-900">Bill Notes / Remarks</h4>
              <p className="text-slate-600 font-medium">{displayBill.referenceNotes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Supplier Info & Totals Summary (Span 1) */}
        <div className="space-y-5">
          {/* Supplier Info Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 size={16} className="text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Supplier Details</h3>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-black text-slate-900 text-sm">{displayBill.supplier.name}</div>
              {displayBill.supplier.companyName && displayBill.supplier.companyName !== displayBill.supplier.name && (
                <div className="text-slate-500 font-semibold">{displayBill.supplier.companyName}</div>
              )}
              {displayBill.supplier.mobile && displayBill.supplier.mobile !== '-' && (
                <div className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  <span>{displayBill.supplier.mobile}</span>
                </div>
              )}
              {displayBill.supplier.email && displayBill.supplier.email !== '-' && (
                <div className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  <span>{displayBill.supplier.email}</span>
                </div>
              )}
              {displayBill.supplier.gstin && displayBill.supplier.gstin !== '-' && (
                <div className="text-indigo-700 font-mono font-bold bg-indigo-50/80 px-2 py-0.5 rounded-md inline-block text-[11px]">
                  GSTIN: {displayBill.supplier.gstin}
                </div>
              )}
              {displayBill.supplier.address && displayBill.supplier.address !== '-' && (
                <div className="text-slate-600 font-medium pt-1.5 border-t border-slate-100 mt-1.5">{displayBill.supplier.address}</div>
              )}
            </div>
          </div>

          {/* Financial Totals Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 font-sans">
            <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">Payment Breakdown</h3>

            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="font-bold text-slate-900">₹{subTotalCalc.toLocaleString('en-IN')}.00</span>
              </div>

              {discountCalc > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-bold">- ₹{discountCalc.toLocaleString('en-IN')}.00</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax</span>
                <span className="font-bold text-slate-900">₹{taxAmountCalc.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-base font-black">₹{grandTotalCalc.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between text-emerald-700">
                  <span>Paid Amount</span>
                  <span className="font-extrabold">₹{paidAmountCalc.toLocaleString('en-IN')}.00</span>
                </div>

                <div className="flex justify-between text-rose-600">
                  <span>Balance Due</span>
                  <span className="font-extrabold">₹{dueAmountCalc.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setRecordPaymentOpen(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                + Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        supplier={displayBill.supplier}
        onRecordPayment={handleRecordPaymentSubmit}
      />

      {/* Printable Professional GST Invoice Modal */}
      <PrintableBillModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        bill={displayBill}
      />
    </div>
  );
};

export default PurchaseBillDetailsPage;
