import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, X, Loader2 } from 'lucide-react';
import { usePurchaseBillDetailsQuery } from '../hooks/usePurchaseQueries';
import { useSupplierDetailsQuery } from '../../suppliers/hooks/useSuppliersQueries';
import { useGetBusinessInfoQuery, useGetVendorProfileQuery } from '../../vendor/hooks/useVendorQueries';
import { printPurchaseBillPdf, downloadPurchaseBillPdf } from '../utils/purchaseBillPrintUtil';

/**
 * Safely parses any numeric value to a valid float
 */
function parseNum(val, defaultVal = 0) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Formats date strings to clean DD/MM/YYYY
 */
function formatDateStr(dateVal) {
  if (!dateVal) return new Date().toLocaleDateString('en-IN');
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateVal);
  }
}

/**
 * Converts a numeric amount to Indian Rupee Words
 */
function numberToWordsINR(num) {
  const safeNum = parseNum(num, 0);
  if (safeNum <= 0) return 'Rupees Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(safeNum));

  const inWords = (nStr) => {
    let str = '';
    const numVal = parseInt(nStr, 10);
    if (numVal < 20) {
      str = a[numVal];
    } else {
      str = b[Math.floor(numVal / 10)] + ' ' + a[numVal % 10];
    }
    return str;
  };

  let result = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  if (crore > 0) result += inWords(crore) + 'Crore ';
  if (lakh > 0) result += inWords(lakh) + 'Lakh ';
  if (thousand > 0) result += inWords(thousand) + 'Thousand ';
  if (hundred > 0) result += inWords(hundred) + 'Hundred ';
  if (rest > 0) result += inWords(rest);

  return 'Rupees ' + result.trim() + ' Only';
}

export default function PrintableBillModal({ isOpen, onClose, bill, tenantInfo }) {
  const invoiceRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Live fetch Business Store Info & Vendor Profile from backend
  const { data: businessInfoRes } = useGetBusinessInfoQuery();
  const { data: vendorProfileRes } = useGetVendorProfileQuery();

  const businessData = businessInfoRes?.data || businessInfoRes || {};
  const vendorData = vendorProfileRes?.data || vendorProfileRes || {};
  const liveTenant = businessData?.business || businessData?.tenant || businessData || vendorData?.business || vendorData?.tenant || vendorData || {};

  // Auto fetch bill details if items are missing and bill.id exists
  const hasItems = Array.isArray(bill?.items) && bill.items.length > 0;
  const { data: billDetailsRes, isLoading: isFetchingDetails } = usePurchaseBillDetailsQuery(
    isOpen && bill?.id && !hasItems ? bill.id : null
  );

  const fetchedBill = billDetailsRes?.data?.purchaseInvoice
    || billDetailsRes?.data?.purchase
    || billDetailsRes?.data
    || billDetailsRes?.purchase
    || billDetailsRes?.bill;

  const activeBill = fetchedBill || bill;

  // Auto fetch full supplier details if supplierId exists and address/mobile/gstin are missing
  const isValidStr = (str) => Boolean(str && typeof str === 'string' && str.trim() !== '' && str.trim() !== '-' && str.trim().toLowerCase() !== 'supplier');

  const rawSupplier = (typeof activeBill?.supplierDetails === 'object' && activeBill?.supplierDetails !== null)
    ? activeBill.supplierDetails
    : ((typeof activeBill?.supplier === 'object' && activeBill?.supplier !== null) ? activeBill.supplier : {});
  const supplierId = rawSupplier.id || activeBill?.supplierId || activeBill?.supplier_id || activeBill?.vendorId || activeBill?.vendor_id;

  const hasSupplierContact = Boolean(
    isValidStr(rawSupplier.name || rawSupplier.companyName || activeBill?.supplierName) &&
    (isValidStr(rawSupplier.mobileNumber || rawSupplier.mobile || rawSupplier.phone || activeBill?.supplierMobile) ||
      isValidStr(rawSupplier.address || rawSupplier.city || activeBill?.supplierAddress) ||
      isValidStr(rawSupplier.gstin || rawSupplier.gstNumber || activeBill?.supplierGstin))
  );

  const { data: supplierDetailsRes } = useSupplierDetailsQuery(
    isOpen && supplierId && supplierId !== '-' && !hasSupplierContact ? supplierId : null
  );

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto trigger browser print window when modal opens
  useEffect(() => {
    if (isOpen && activeBill) {
      const timer = setTimeout(() => {
        document.body.classList.add('printing-bill-modal');
        window.print();
        setTimeout(() => {
          document.body.classList.remove('printing-bill-modal');
        }, 500);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeBill?.id || activeBill?.purchaseNumber]);

  // Early return ONLY after ALL React Hooks have been declared
  if (!isOpen || !bill) return null;

  let storedUser = {};
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) storedUser = JSON.parse(savedUser);
  } catch (err) {
    // safe fallback
  }

  const storedTenant = storedUser?.tenant || storedUser?.business || {};

  const displayTenant = {
    businessName: (
      tenantInfo?.businessName || tenantInfo?.name ||
      liveTenant?.businessName || liveTenant?.name || liveTenant?.companyName ||
      storedTenant?.businessName || storedTenant?.name || storedTenant?.companyName ||
      storedUser?.businessName || storedUser?.companyName || storedUser?.tenantName || storedUser?.name ||
      'SHUBHAM RETAIL STORE'
    ).toUpperCase(),
    businessAddress: (
      tenantInfo?.businessAddress || tenantInfo?.address ||
      liveTenant?.businessAddress || liveTenant?.address || liveTenant?.street ||
      storedTenant?.businessAddress || storedTenant?.address ||
      storedUser?.businessAddress || storedUser?.address || ''
    ),
    city: tenantInfo?.city || liveTenant?.city || storedTenant?.city || storedUser?.city || '',
    state: tenantInfo?.state || liveTenant?.state || storedTenant?.state || storedUser?.state || '',
    stateCode: tenantInfo?.stateCode || liveTenant?.stateCode || storedTenant?.stateCode || storedUser?.stateCode || '',
    phone: (
      tenantInfo?.phone || tenantInfo?.mobile ||
      liveTenant?.phone || liveTenant?.mobile || liveTenant?.mobileNumber ||
      storedTenant?.phone || storedTenant?.mobile ||
      storedUser?.phone || storedUser?.mobileNumber || storedUser?.mobile || ''
    ),
    gstin: (
      tenantInfo?.gstin || tenantInfo?.gstNumber ||
      liveTenant?.gstin || liveTenant?.gstNumber ||
      storedTenant?.gstin || storedTenant?.gstNumber ||
      storedUser?.gstin || storedUser?.gstNumber || ''
    )
  };

  const fetchedSupplier =
    supplierDetailsRes?.supplierInformation
    || supplierDetailsRes?.data?.supplierInformation
    || supplierDetailsRes?.data?.supplier
    || supplierDetailsRes?.data
    || supplierDetailsRes?.supplier
    || supplierDetailsRes;

  const supplierObj = (fetchedSupplier && (fetchedSupplier.id || fetchedSupplier.name || fetchedSupplier.companyName)) ? fetchedSupplier : rawSupplier;

  const rawAddress = supplierObj.address || activeBill?.supplierAddress || activeBill?.address || '';
  const city = supplierObj.city || activeBill?.supplierCity || activeBill?.city || '';
  const state = supplierObj.state || activeBill?.supplierState || activeBill?.state || '';
  const pincode = supplierObj.pincode || activeBill?.supplierPincode || activeBill?.pincode || '';

  let fullAddress = rawAddress;
  if (fullAddress) {
    if (city && !fullAddress.toLowerCase().includes(city.toLowerCase())) fullAddress += `, ${city}`;
    if (state && !fullAddress.toLowerCase().includes(state.toLowerCase())) fullAddress += `, ${state}`;
    if (pincode && !fullAddress.includes(pincode)) fullAddress += ` - ${pincode}`;
  } else {
    fullAddress = [city, state, pincode].filter(Boolean).join(', ');
  }

  const supplierName = (
    supplierObj.name || supplierObj.companyName ||
    (typeof activeBill?.supplier === 'string' ? activeBill.supplier : null) ||
    activeBill?.supplierName || activeBill?.supplier_name ||
    activeBill?.vendorName || activeBill?.vendor_name ||
    activeBill?.companyName || activeBill?.partyName ||
    'SUPPLIER'
  ).toUpperCase();

  const supplier = {
    name: supplierName,
    address: fullAddress,
    mobile: supplierObj.mobileNumber || supplierObj.mobile || supplierObj.phone || supplierObj.contactNumber || activeBill?.supplierMobile || activeBill?.mobile || activeBill?.phone || '',
    gstin: supplierObj.gstin || supplierObj.gstNumber || supplierObj.gst || activeBill?.supplierGstin || activeBill?.gstin || activeBill?.gstNumber || ''
  };

  let rawItems = [];
  if (Array.isArray(activeBill?.items) && activeBill.items.length > 0) {
    rawItems = activeBill.items;
  } else if (Array.isArray(activeBill?.purchaseItems) && activeBill.purchaseItems.length > 0) {
    rawItems = activeBill.purchaseItems;
  } else if (Array.isArray(activeBill?.purchaseBillItems) && activeBill.purchaseBillItems.length > 0) {
    rawItems = activeBill.purchaseBillItems;
  } else if (Array.isArray(activeBill?.billItems) && activeBill.billItems.length > 0) {
    rawItems = activeBill.billItems;
  }

  // Item Calculations
  let subtotalCalc = 0;
  let totalDiscCalc = 0;
  let totalTaxCalc = 0;

  // Slab Breakdown: 5%, 12%, 18%, 28%
  const slabMap = {
    5: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
    12: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
    18: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
    28: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
  };

  const processedItems = rawItems.map((item, idx) => {
    const particulars = (
      item.particulars || item.name || item.productName || item.product?.name || item.title || item.itemName || 'Item'
    ).toUpperCase();

    const hsn = item.hsn || item.hsnCode || item.product?.hsn || item.sku || item.product?.sku || '-';
    const qty = parseNum(item.quantity ?? item.qty ?? item.count, 1);
    const rate = parseNum(item.unitPurchasePrice ?? item.purchasePrice ?? item.unitPrice ?? item.price ?? item.rate, 0);
    const rawMrp = parseNum(item.mrp ?? item.unitPurchasePrice ?? item.purchasePrice, 0);
    const mrp = rawMrp > 0 ? rawMrp : (rate > 0 ? rate : 0);
    const discPercent = parseNum(item.discountPercent ?? item.discount ?? item.discPercent ?? item.disc, 0);
    const gstRate = parseNum(item.taxPercent ?? item.taxRate ?? item.gstPercent ?? item.gstRate ?? item.gst ?? item.tax, 0);

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

    const rawTotal = parseNum(item.totalAmount ?? item.amount ?? item.total, 0);

    let isInclusive = false;
    if (['INCLUSIVE', 'GST_INCLUSIVE', 'INCL', 'TRUE'].includes(explicitTaxMode)) {
      isInclusive = true;
    } else if (['EXCLUSIVE', 'GST_EXCLUSIVE', 'EXCL', 'FALSE'].includes(explicitTaxMode)) {
      isInclusive = false;
    } else if (rawTotal > 0 && gstRate > 0) {
      const exclCalculated = netAmount * (1 + gstRate / 100);
      if (Math.abs(rawTotal - netAmount) <= Math.abs(rawTotal - exclCalculated)) {
        isInclusive = true;
      }
    } else if (activeBill?.totalAmount > 0 && gstRate > 0 && rawItems.length === 1) {
      const billTotal = parseNum(activeBill.totalAmount, 0);
      const exclCalculated = netAmount * (1 + gstRate / 100);
      if (Math.abs(billTotal - netAmount) <= Math.abs(billTotal - exclCalculated)) {
        isInclusive = true;
      }
    }

    let taxableAmount = netAmount;
    let taxAmount = netAmount * (gstRate / 100);
    let lineTotal = Math.round(netAmount + taxAmount);

    if (isInclusive && gstRate > 0) {
      taxableAmount = netAmount / (1 + gstRate / 100);
      taxAmount = netAmount - taxableAmount;
      lineTotal = Math.round(netAmount);
    }

    if (lineTotal === 0 && (item.totalAmount || item.amount)) {
      lineTotal = parseNum(item.totalAmount || item.amount, 0);
    }

    subtotalCalc += taxableAmount;
    totalDiscCalc += discAmount;
    totalTaxCalc += taxAmount;

    // Track GST Slab
    if (gstRate > 0) {
      const nearestSlab = [5, 12, 18, 28].reduce((prev, curr) => (Math.abs(curr - gstRate) < Math.abs(prev - gstRate) ? curr : prev), 18);
      if (slabMap[nearestSlab]) {
        slabMap[nearestSlab].taxable += taxableAmount;
        slabMap[nearestSlab].disc += discAmount;
        slabMap[nearestSlab].sgst += taxAmount / 2;
        slabMap[nearestSlab].cgst += taxAmount / 2;
        slabMap[nearestSlab].totalGst += taxAmount;
      }
    }

    return {
      sno: idx + 1,
      particulars,
      hsn,
      mrp: mrp > 0 ? mrp.toFixed(2) : '-',
      rate: rate.toFixed(2),
      qty,
      free: parseNum(item.freeQuantity ?? item.freeQty ?? item.free, 0),
      discPercent: discPercent > 0 ? discPercent.toFixed(1) : '0.0',
      gstRate: gstRate > 0 ? `${gstRate}%` : '0%',
      netRate: netRate.toFixed(2),
      amount: lineTotal.toFixed(2)
    };
  });

  const calculatedGrandTotal = subtotalCalc + totalTaxCalc;
  let rawGrandTotal = parseNum(
    activeBill.totalAmount ?? activeBill.grandTotal ?? activeBill.amount,
    0
  );
  if (rawGrandTotal <= 0 && calculatedGrandTotal > 0) {
    rawGrandTotal = calculatedGrandTotal;
  }
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = (grandTotal - rawGrandTotal).toFixed(2);

  const rawBillNo = activeBill.purchaseNumber
    || activeBill.supplierInvoiceNumber
    || activeBill.billNumber
    || activeBill.invoiceNumber
    || activeBill.id;

  const billNo = (rawBillNo && String(rawBillNo).length > 18 && String(rawBillNo).includes('-'))
    ? `PUR-${String(rawBillNo).split('-')[0].toUpperCase()}`
    : (rawBillNo || 'PUR-001');

  const billDate = formatDateStr(activeBill.purchaseDate || activeBill.billDate || activeBill.invoiceDate || activeBill.createdAt);

  const hasSlabData = Object.values(slabMap).some((d) => d.taxable > 0);

  const handlePrint = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      await printPurchaseBillPdf(activeBill, displayTenant);
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  const handleDownloadPdf = async (e) => {
    if (e) e.stopPropagation();
    if (!invoiceRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      const element = invoiceRef.current;
      const fileName = `TaxInvoice_${billNo}.pdf`;

      const html2pdfModule = await import('html2pdf.js');
      const html2pdfFunc = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [4, 4, 4, 4],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdfFunc().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Error, using print fallback:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return createPortal(
    <div
      onClick={handleClose}
      className="printable-modal-portal fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:block animate-fadeIn cursor-pointer"
    >
      {/* Top Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-card-wrapper bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-2 flex flex-col max-h-[96vh] print:max-h-none print:my-0 print:border-none print:shadow-none print:rounded-none cursor-default"
      >
        {/* Modal Header Controls (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-800 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              ₹
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white">GST Tax Invoice Print & Download</h3>
              <p className="text-[10px] text-slate-400">Standard Indian B2B Paper Invoice Format</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading || isFetchingDetails}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isFetchingDetails}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              title="Close Modal (Esc)"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-rose-600 rounded-lg transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="overflow-y-auto p-3 sm:p-5 bg-slate-200 flex-1 print:p-0 print:bg-white print:overflow-visible">
          {isFetchingDetails ? (
            <div className="bg-white p-8 rounded-xl shadow border border-slate-300 max-w-2xl mx-auto text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Loading purchase bill details...</p>
            </div>
          ) : (
            /* AUTHENTIC B2B INDIAN GST TAX INVOICE PAPER CARD */
            <div
              ref={invoiceRef}
              className="printable-invoice-container bg-white border-2 border-black text-black font-sans text-[11px] leading-tight max-w-2xl mx-auto p-3 space-y-2 print:border-black print:p-2 print:max-w-none print:w-full"
            >
              {/* 3. B2B ITEM TABLE WITH FULL REPEATING HEADER */}
              <div className="border border-black overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead className="print:table-header-group">
                    <tr>
                      <th colSpan={11} className="font-normal text-left p-0 border-b border-black">
                        {/* 1. HEADER TITLE BAR */}
                        <div className="text-center font-black border-b border-black pb-1 pt-1 uppercase tracking-wider text-xs flex justify-between items-center px-2">
                          <span>{displayTenant.gstin ? `GSTIN: ${displayTenant.gstin}` : ''}</span>
                          <span className="text-sm font-black underline">TAX INVOICE</span>
                          <span>{displayTenant.state ? `STATE: ${displayTenant.state}${displayTenant.stateCode ? `, CODE: ${displayTenant.stateCode}` : ''}` : ''}</span>
                        </div>

                        {/* 2. SELLER STORE & BUYER/SUPPLIER DETAILS (2-BOX GRID) */}
                        <div className="grid grid-cols-2 divide-x divide-black text-[10px]">
                          {/* Left Box: Store / Seller Details */}
                          <div className="p-2 space-y-0.5">
                            <h2 className="font-black text-xs uppercase tracking-tight">{displayTenant.businessName}</h2>
                            {displayTenant.businessAddress && <div>{displayTenant.businessAddress}</div>}
                            {displayTenant.phone && <div>Phone No : <strong className="font-bold">{displayTenant.phone}</strong></div>}
                            {displayTenant.state && <div>STATE : {displayTenant.state}{displayTenant.stateCode ? `, CODE: ${displayTenant.stateCode}` : ''}</div>}
                            {displayTenant.gstin && <div>GSTIN : <strong className="font-mono font-black">{displayTenant.gstin}</strong></div>}
                          </div>

                          {/* Right Box: Customer / Supplier Details & Bill Info */}
                          <div className="p-2 space-y-0.5">
                            <div>M/S : <strong className="font-black text-xs">{supplier.name}</strong></div>
                            {supplier.address && <div>ADDRESS : {supplier.address}</div>}
                            {supplier.mobile && <div>PHONE : {supplier.mobile}</div>}
                            {supplier.gstin && <div>GSTIN : <strong className="font-mono font-bold">{supplier.gstin}</strong></div>}
                            <div className="pt-1 border-t border-black/40 grid grid-cols-2 gap-1 font-bold">
                              <div className="truncate">BILL NO : <span className="font-mono truncate">{billNo}</span></div>
                              <div className="truncate">BILL DATE : {billDate}</div>
                              <div className="truncate">SALESMAN : {activeBill.salesman || activeBill.createdBy?.name || activeBill.createdBy || 'OFFICE'}</div>
                              <div className="truncate">INV TYPE : <span className="uppercase">{activeBill.paymentMethod === 'Cash' || activeBill.paymentMethod === 'CASH' ? 'CASH' : (activeBill.paymentMethod || 'CREDIT')}</span></div>
                            </div>
                          </div>
                        </div>
                      </th>
                    </tr>

                    <tr className="border-b border-black bg-slate-100 font-black text-black text-[9px] uppercase tracking-tighter">
                      <th className="py-1 px-1 border-r border-black text-center w-6">S NO</th>
                      <th className="py-1 px-1 border-r border-black">PARTICULARS</th>
                      <th className="py-1 px-1 border-r border-black text-center w-14">HSN</th>
                      <th className="py-1 px-1 border-r border-black text-right w-12">MRP</th>
                      <th className="py-1 px-1 border-r border-black text-right w-12">RATE</th>
                      <th className="py-1 px-1 border-r border-black text-center w-8">QTY</th>
                      <th className="py-1 px-1 border-r border-black text-center w-8">FREE</th>
                      <th className="py-1 px-1 border-r border-black text-center w-10">DISC%</th>
                      <th className="py-1 px-1 border-r border-black text-center w-10">GST%</th>
                      <th className="py-1 px-1 border-r border-black text-right w-14">NET RATE</th>
                      <th className="py-1 px-1 text-right w-16">AMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/30 font-medium">
                    {processedItems.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-4 text-center text-slate-500 font-bold">
                          No items found in this purchase bill.
                        </td>
                      </tr>
                    ) : (
                      processedItems.map((item) => (
                        <tr key={item.sno} className="hover:bg-slate-50">
                          <td className="py-1 px-1 border-r border-black text-center font-bold">{item.sno}</td>
                          <td className="py-1 px-1 border-r border-black font-extrabold uppercase">{item.particulars}</td>
                          <td className="py-1 px-1 border-r border-black text-center font-mono text-[9px]">{item.hsn}</td>
                          <td className="py-1 px-1 border-r border-black text-right font-mono">{item.mrp}</td>
                          <td className="py-1 px-1 border-r border-black text-right font-mono">{item.rate}</td>
                          <td className="py-1 px-1 border-r border-black text-center font-black">{item.qty}</td>
                          <td className="py-1 px-1 border-r border-black text-center text-slate-400">{item.free}</td>
                          <td className="py-1 px-1 border-r border-black text-center font-mono">{item.discPercent}</td>
                          <td className="py-1 px-1 border-r border-black text-center font-bold">{item.gstRate}</td>
                          <td className="py-1 px-1 border-r border-black text-right font-mono">{item.netRate}</td>
                          <td className="py-1 px-1 text-right font-mono font-black">{item.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 4. GST SLAB BREAKDOWN TABLE & FINANCIAL TOTALS */}
              <div className="grid grid-cols-12 gap-2 text-[10px]">
                {/* Left Column: GST Slab Breakdown Table */}
                <div className="col-span-7 border border-black p-1 space-y-1">
                  <div className="font-black text-[9px] uppercase border-b border-black pb-0.5">GST TAX SLAB BREAKDOWN</div>
                  <table className="w-full text-[9px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-black font-bold uppercase">
                        <th className="py-0.5 px-0.5">CLASS</th>
                        <th className="py-0.5 px-0.5 text-right">TOTAL</th>
                        <th className="py-0.5 px-0.5 text-right">DISC</th>
                        <th className="py-0.5 px-0.5 text-right">SGST</th>
                        <th className="py-0.5 px-0.5 text-right">CGST</th>
                        <th className="py-0.5 px-0.5 text-right">TOT GST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/20 font-mono">
                      {[5, 12, 18, 28].map((slab) => {
                        const data = slabMap[slab];
                        if (!data || data.taxable === 0) return null;
                        return (
                          <tr key={slab}>
                            <td className="py-0.5 px-0.5 font-bold">GST {slab}.00%</td>
                            <td className="py-0.5 px-0.5 text-right">{data.taxable.toFixed(2)}</td>
                            <td className="py-0.5 px-0.5 text-right">{data.disc.toFixed(2)}</td>
                            <td className="py-0.5 px-0.5 text-right">{data.sgst.toFixed(2)}</td>
                            <td className="py-0.5 px-0.5 text-right">{data.cgst.toFixed(2)}</td>
                            <td className="py-0.5 px-0.5 text-right font-bold">{data.totalGst.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {!hasSlabData && (
                        <tr>
                          <td className="py-0.5 px-0.5 font-bold">GST 0.00%</td>
                          <td className="py-0.5 px-0.5 text-right">{subtotalCalc.toFixed(2)}</td>
                          <td className="py-0.5 px-0.5 text-right">{totalDiscCalc.toFixed(2)}</td>
                          <td className="py-0.5 px-0.5 text-right">0.00</td>
                          <td className="py-0.5 px-0.5 text-right">0.00</td>
                          <td className="py-0.5 px-0.5 text-right font-bold">0.00</td>
                        </tr>
                      )}
                      <tr className="border-t border-black font-bold">
                        <td className="py-0.5 px-0.5">TOTAL</td>
                        <td className="py-0.5 px-0.5 text-right">{subtotalCalc.toFixed(2)}</td>
                        <td className="py-0.5 px-0.5 text-right">{totalDiscCalc.toFixed(2)}</td>
                        <td className="py-0.5 px-0.5 text-right">{(totalTaxCalc / 2).toFixed(2)}</td>
                        <td className="py-0.5 px-0.5 text-right">{(totalTaxCalc / 2).toFixed(2)}</td>
                        <td className="py-0.5 px-0.5 text-right font-black">{totalTaxCalc.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right Column: Financial Totals Summary */}
                <div className="col-span-5 border border-black p-1.5 space-y-1 font-mono text-[10px] flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span className="font-bold">{subtotalCalc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DIS AMT:</span>
                      <span>{totalDiscCalc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST:</span>
                      <span>{(totalTaxCalc / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST:</span>
                      <span>{(totalTaxCalc / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROUND OFF:</span>
                      <span>{roundOff}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-black border-t-2 border-black pt-1">
                    <span>GRAND TOTAL:</span>
                    <span className="text-sm font-black">₹{grandTotal.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>
              </div>

              {/* 5. AMOUNT IN WORDS & TERMS */}
              <div className="border border-black p-1.5 space-y-1 text-[10px]">
                <div>
                  <strong>Amt In Words Rs : </strong>
                  <span className="font-bold italic underline">{numberToWordsINR(grandTotal)}</span>
                </div>
                <div className="text-[9px] text-slate-700">
                  <strong>Terms & Conditions : </strong>
                  <span>{activeBill.notes && activeBill.notes !== '-' ? activeBill.notes : (activeBill.referenceNotes && activeBill.referenceNotes !== '-' ? activeBill.referenceNotes : 'Goods once sold will not be taken back or exchanged. Bills not paid due date will attract interest.')}</span>
                </div>
              </div>

              {/* 6. SIGNATURE BOXES */}
              <div className="border border-black p-2 flex justify-between items-end text-[10px]">
                <div className="space-y-4">
                  <div className="font-bold">Receiver's Signature</div>
                  <div className="border-b border-dashed border-black w-28"></div>
                </div>

                <div className="text-right space-y-4">
                  <div className="font-bold">For {displayTenant.businessName}</div>
                  <div className="font-bold uppercase tracking-wider border-t border-black pt-0.5 w-36 ml-auto">
                    AUTHORIZED SIGNATORY
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}





