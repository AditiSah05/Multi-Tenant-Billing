import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import purchaseService from '../../../services/purchaseService';
import supplierService from '../../../services/supplierService';
import businessService from '../../../services/businessService';

function parseNum(val, defaultVal = 0) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

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

function numberToWordsINR(num) {
  const safeNum = parseNum(num, 0);
  if (safeNum <= 0) return 'Rupees Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = Math.floor(Math.abs(safeNum));

  const inWords = (nStr) => {
    const numVal = parseInt(nStr, 10);
    if (numVal < 20) return a[numVal];
    return b[Math.floor(numVal / 10)] + ' ' + a[numVal % 10];
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

async function getProductionTenantInfo(tenantInfo) {
  let storedUser = {};
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) storedUser = JSON.parse(savedUser);
  } catch (err) {
    // safe fallback
  }

  let liveTenant = {};
  try {
    const bizRes = await businessService.getBusinessInfo();
    if (bizRes) liveTenant = bizRes?.business || bizRes?.tenant || bizRes;
  } catch (e) {
    // fallback to stored
  }

  const storedTenant = storedUser?.tenant || storedUser?.business || {};

  return {
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
}

async function getProductionSupplierInfo(bill) {
  let s = (typeof bill?.supplierDetails === 'object' && bill?.supplierDetails !== null)
    ? bill.supplierDetails
    : ((typeof bill?.supplier === 'object' && bill?.supplier !== null) ? bill.supplier : (bill?.vendor || {}));

  const supplierId = s.id || bill?.supplierId || bill?.supplier_id || bill?.purchaseBill?.supplierId;

  const isValidVal = (val) => Boolean(val && typeof val === 'string' && val.trim() !== '' && val.trim() !== '-' && val.trim().toLowerCase() !== 'supplier');

  const isComplete = isValidVal(s.name || s.companyName || bill?.supplierName) &&
    (isValidVal(s.mobileNumber || s.mobile || s.phone) || isValidVal(s.address || s.city) || isValidVal(s.gstin || s.gstNumber));

  if (supplierId && supplierId !== '-' && !isComplete) {
    try {
      const res = await supplierService.fetchSupplierDetails(supplierId);
      const fetched = res?.supplierInformation || res?.data?.supplierInformation || res?.data?.supplier || res?.data || res?.supplier || res;
      if (fetched && (fetched.id || fetched.name || fetched.companyName)) s = fetched;
    } catch (e) {
      console.warn('Could not fetch full supplier details for PDF:', e);
    }
  }

  const name = (
    s.name || s.companyName || 
    (typeof bill?.supplier === 'string' ? bill.supplier : null) ||
    bill?.supplierName || bill?.companyName || 
    'SUPPLIER'
  ).toUpperCase();

  const rawAddress = s.address || bill?.supplierAddress || bill?.address || '';
  const city = s.city || bill?.supplierCity || bill?.city || '';
  const state = s.state || bill?.supplierState || bill?.state || '';
  const pincode = s.pincode || bill?.supplierPincode || bill?.pincode || '';

  let fullAddress = rawAddress;
  if (fullAddress) {
    if (city && !fullAddress.toLowerCase().includes(city.toLowerCase())) fullAddress += `, ${city}`;
    if (state && !fullAddress.toLowerCase().includes(state.toLowerCase())) fullAddress += `, ${state}`;
    if (pincode && !fullAddress.includes(pincode)) fullAddress += ` - ${pincode}`;
  } else {
    fullAddress = [city, state, pincode].filter(Boolean).join(', ');
  }

  return {
    name,
    address: fullAddress || '-',
    mobile: s.mobileNumber || s.mobile || s.phone || s.contactNumber || bill?.supplierMobile || bill?.mobile || bill?.phone || '',
    gstin: s.gstin || s.gstNumber || s.gst || bill?.supplierGstin || bill?.gstin || bill?.gstNumber || ''
  };
}

// Master Function to Construct Pixel-Perfect A4 Vector jsPDF Document
export async function buildPurchaseBillPdfDoc(bill, tenantInfo) {
  if (!bill) return null;

  let activeBill = bill;
  const hasItems = Array.isArray(bill.items) && bill.items.length > 0;

  if (bill.id && !hasItems) {
    try {
      const res = await purchaseService.fetchPurchaseBillDetails(bill.id);
      const apiData = res?.data || res;
      const fetched = apiData?.purchaseBill || apiData?.purchaseInvoice || apiData?.purchase || apiData;
      if (fetched) {
        activeBill = {
          ...fetched,
          supplierDetails: apiData?.supplierDetails || fetched?.supplierDetails || fetched?.supplier,
          paymentSummary: apiData?.paymentSummary || fetched?.paymentSummary,
          billSummary: apiData?.billSummary || fetched?.billSummary,
          items: Array.isArray(apiData?.items) ? apiData.items : (Array.isArray(fetched?.items) ? fetched.items : [])
        };
      }
    } catch (err) {
      console.warn('Could not fetch full bill details for PDF:', err);
    }
  }

  const displayTenant = await getProductionTenantInfo(tenantInfo);
  const supplier = await getProductionSupplierInfo(activeBill);

  const pBill = activeBill.purchaseBill || activeBill;
  const rawBillNo = pBill.purchaseNumber 
    || pBill.supplierInvoiceNumber 
    || pBill.billNumber 
    || pBill.invoiceNumber 
    || pBill.id
    || activeBill.purchaseNumber
    || activeBill.id;

  const billNo = (rawBillNo && String(rawBillNo).length > 18 && String(rawBillNo).includes('-'))
    ? `PUR-${String(rawBillNo).split('-')[0].toUpperCase()}`
    : (rawBillNo || 'PUR-001');

  const billDate = formatDateStr(pBill.invoiceDate || pBill.purchaseDate || pBill.createdAt || activeBill.invoiceDate || activeBill.createdAt);

  let rawItems = [];
  if (Array.isArray(activeBill.items) && activeBill.items.length > 0) {
    rawItems = activeBill.items;
  } else if (Array.isArray(pBill.items) && pBill.items.length > 0) {
    rawItems = pBill.items;
  }

  let subtotalCalc = 0;
  let totalDiscCalc = 0;
  let totalTaxCalc = 0;

  const slabMap = {
    5: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
    12: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
    18: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
    28: { taxable: 0, disc: 0, sgst: 0, cgst: 0, totalGst: 0 },
  };

  const tableBody = rawItems.map((item, idx) => {
    const particulars = (
      item.particulars || item.name || item.productName || item.product?.name || item.title || item.itemName || 'Item'
    ).toUpperCase();

    const hsn = item.hsnCode || item.hsn || item.product?.hsnCode || item.product?.hsn || item.sku || item.product?.sku || '-';
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

    const grossAmount = qty * rate;
    const discAmount = grossAmount * (discPercent / 100);
    const netAmount = grossAmount - discAmount;
    const netRate = rate * (1 - discPercent / 100);
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

    return [
      idx + 1,
      particulars,
      hsn,
      mrp > 0 ? mrp.toFixed(2) : '-',
      rate.toFixed(2),
      qty,
      parseNum(item.freeQuantity ?? item.freeQty ?? item.free, 0),
      discPercent > 0 ? discPercent.toFixed(1) : '0.0',
      gstRate > 0 ? `${gstRate}%` : '0%',
      netRate.toFixed(2),
      lineTotal.toFixed(2)
    ];
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

  // Initialize A4 Vector PDF
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // Page Outer Border
  doc.setLineWidth(0.6);
  doc.rect(6, 6, 198, 285);

  // 1. Top Header Title Bar
  doc.setFontSize(8);
  const drawInvoiceHeader = (doc, pageY = 0) => {
    // 1. Top Title & State Bar
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    if (displayTenant.gstin) {
      doc.text(`GSTIN: ${displayTenant.gstin}`, 10, pageY + 12);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 105, pageY + 12, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    if (displayTenant.state) {
      doc.text(`STATE: ${displayTenant.state}${displayTenant.stateCode ? `, CODE: ${displayTenant.stateCode}` : ''}`, 200, pageY + 12, { align: 'right' });
    }

    doc.setLineWidth(0.4);
    doc.line(6, pageY + 15, 204, pageY + 15);

    // 2. Seller & Buyer Grid Box
    doc.rect(8, pageY + 17, 93, 30);
    doc.rect(103, pageY + 17, 99, 30);

    // Seller Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(displayTenant.businessName, 10, pageY + 21);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const storeAddrLines = doc.splitTextToSize(displayTenant.businessAddress || 'Main Market Road', 88);
    doc.text(storeAddrLines, 10, pageY + 25);
    let storeY = pageY + 25 + (storeAddrLines.length * 3.5);
    if (displayTenant.phone) doc.text(`Phone No : ${displayTenant.phone}`, 10, storeY);
    if (displayTenant.state) doc.text(`STATE : ${displayTenant.state}`, 10, storeY + 3.5);
    if (displayTenant.gstin) doc.text(`GSTIN : ${displayTenant.gstin}`, 10, storeY + 7);

    // Buyer/Supplier Details
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`M/S : ${supplier.name}`, 105, pageY + 21);
    doc.setFont('helvetica', 'normal');
    const supAddrLines = doc.splitTextToSize(`ADDRESS : ${supplier.address || '-'}`, 95);
    doc.text(supAddrLines, 105, pageY + 25);
    let supY = pageY + 25 + (supAddrLines.length * 3.5);
    if (supplier.mobile) doc.text(`PHONE : ${supplier.mobile}`, 105, supY);
    if (supplier.gstin) doc.text(`GSTIN : ${supplier.gstin}`, 105, supY + 3.5);

    doc.line(103, pageY + 37, 202, pageY + 37);
    doc.setFont('helvetica', 'bold');
    doc.text(`BILL NO : ${billNo}`, 105, pageY + 41);
    doc.text(`BILL DATE : ${billDate}`, 155, pageY + 41);
    doc.text(`SALESMAN : Admin`, 105, pageY + 45);
    doc.text(`INV TYPE : ${activeBill.paymentMethod || 'BANK TRANSFER'}`, 155, pageY + 45);
  };

  // Draw Top Invoice Header on Page 1
  drawInvoiceHeader(doc, 0);

  // 3. Line Items AutoTable
  const headers = [['S NO', 'PARTICULARS', 'HSN', 'MRP', 'RATE', 'QTY', 'FREE', 'DISC%', 'GST%', 'NET RATE', 'AMT']];
  
  autoTable(doc, {
    startY: 49,
    margin: { top: 48, left: 8, right: 8 },
    head: headers,
    body: tableBody,
    theme: 'grid',
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawInvoiceHeader(doc, 0);
      }
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 55, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 10 },
      7: { halign: 'right', cellWidth: 13 },
      8: { halign: 'center', cellWidth: 12 },
      9: { halign: 'right', cellWidth: 16 },
      10: { halign: 'right', cellWidth: 17, fontStyle: 'bold' }
    }
  });

  let finalY = doc.lastAutoTable.finalY + 4;

  // 4. Bottom GST Slab Summary & Totals Box
  doc.rect(8, finalY, 194, 32);
  doc.line(120, finalY, 120, finalY + 32);

  // Left Box: GST Tax Slabs
  const slabTableBody = Object.entries(slabMap)
    .filter(([_, data]) => data.taxable > 0)
    .map(([slab, data]) => [
      `${slab}%`,
      data.taxable.toFixed(2),
      data.disc.toFixed(2),
      data.sgst.toFixed(2),
      data.cgst.toFixed(2),
      data.totalGst.toFixed(2)
    ]);

  slabTableBody.push([
    'TOTAL',
    subtotalCalc.toFixed(2),
    totalDiscCalc.toFixed(2),
    (totalTaxCalc / 2).toFixed(2),
    (totalTaxCalc / 2).toFixed(2),
    totalTaxCalc.toFixed(2)
  ]);

  autoTable(doc, {
    startY: finalY + 1,
    margin: { left: 9, right: 93 },
    head: [['CLASS', 'TOTAL', 'DISC', 'SGST', 'CGST', 'TOT GST']],
    body: slabTableBody,
    theme: 'plain',
    styles: { fontSize: 6.5, cellPadding: 1, textColor: [0, 0, 0] },
    headStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 20 },
      1: { halign: 'right', cellWidth: 17 },
      2: { halign: 'right', cellWidth: 14 },
      3: { halign: 'right', cellWidth: 17 },
      4: { halign: 'right', cellWidth: 17 },
      5: { halign: 'right', cellWidth: 18, fontStyle: 'bold' }
    }
  });

  // Right Box: Financial Totals Summary
  let rightY = finalY + 4;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('SUBTOTAL:', 122, rightY);
  doc.text(subtotalCalc.toFixed(2), 200, rightY, { align: 'right' });

  rightY += 5;
  doc.text('DIS AMT:', 122, rightY);
  doc.text(totalDiscCalc.toFixed(2), 200, rightY, { align: 'right' });

  rightY += 5;
  doc.text('SGST:', 122, rightY);
  doc.text((totalTaxCalc / 2).toFixed(2), 200, rightY, { align: 'right' });

  rightY += 5;
  doc.text('CGST:', 122, rightY);
  doc.text((totalTaxCalc / 2).toFixed(2), 200, rightY, { align: 'right' });

  rightY += 5;
  doc.text('ROUND OFF:', 122, rightY);
  doc.text(roundOff, 200, rightY, { align: 'right' });

  doc.setLineWidth(0.4);
  doc.line(120, rightY + 2, 202, rightY + 2);

  rightY += 6.5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL:', 122, rightY);
  doc.text(`RS ${grandTotal.toLocaleString('en-IN')}.00`, 200, rightY, { align: 'right' });

  // 5. Amount In Words & Terms Box
  const wordsY = finalY + 35;
  doc.rect(8, wordsY, 194, 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Amt In Words Rs :', 10, wordsY + 4);
  doc.setFont('helvetica', 'bolditalic');
  doc.text(numberToWordsINR(grandTotal), 38, wordsY + 4);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(activeBill.notes || activeBill.referenceNotes || 'Terms & Conditions : Goods once sold will not be taken back or exchanged. Bills not paid due date will attract interest.', 10, wordsY + 9);

  // 6. Signature Box
  const sigY = wordsY + 14;
  doc.rect(8, sigY, 194, 15);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text("Receiver's Signature", 10, sigY + 4);
  doc.line(10, sigY + 11, 45, sigY + 11);

  doc.text(`For ${displayTenant.businessName}`, 200, sigY + 4, { align: 'right' });
  doc.line(155, sigY + 11, 200, sigY + 11);
  doc.text('AUTHORIZED SIGNATORY', 200, sigY + 14, { align: 'right' });

  return { doc, fileName: `TaxInvoice_${billNo}.pdf` };
}

// 1. Download PDF Function
export async function downloadPurchaseBillPdf(bill, tenantInfo) {
  const result = await buildPurchaseBillPdfDoc(bill, tenantInfo);
  if (result?.doc) {
    result.doc.save(result.fileName);
  }
}

// 2. Print Vector PDF Function (100% Identical to Download PDF)
export async function printPurchaseBillPdf(bill, tenantInfo) {
  const result = await buildPurchaseBillPdfDoc(bill, tenantInfo);
  if (!result?.doc) return;

  result.doc.autoPrint();
  const pdfBlobUrl = result.doc.output('bloburl');

  let iframe = document.getElementById('purchase-pdf-print-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'purchase-pdf-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  iframe.src = pdfBlobUrl;
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn('Iframe print error, opening blob in new window:', err);
        window.open(pdfBlobUrl, '_blank');
      }
    }, 150);
  };
}

// 3. Open PDF in New Tab Link
export async function openPurchaseBillPdfInNewTab(bill, tenantInfo) {
  const result = await buildPurchaseBillPdfDoc(bill, tenantInfo);
  if (!result?.doc) return null;
  const pdfBlobUrl = result.doc.output('bloburl');
  window.open(pdfBlobUrl, '_blank');
  return pdfBlobUrl;
}

