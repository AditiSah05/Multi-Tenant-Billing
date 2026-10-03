import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import businessService from '../../../services/businessService';

function parseNum(val, defaultVal = 0) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

function getItemTaxDetails(item, bill = {}) {
  const qty = parseNum(item.qty || item.quantity, 1);
  const rate = parseNum(item.rate || item.unitPrice || item.price || item.sellingPrice, 0);
  const disc = parseNum(item.discount || item.discAmount || item.discountAmount, 0);

  const rawTaxModeStr = String(
    item.taxMode ||
    item.taxType ||
    (item.isTaxInclusive !== undefined && item.isTaxInclusive !== null ? (item.isTaxInclusive ? 'INCLUSIVE' : 'EXCLUSIVE') : '') ||
    item.product?.taxMode ||
    item.product?.taxType ||
    (item.product?.isTaxInclusive !== undefined && item.product?.isTaxInclusive !== null ? (item.product?.isTaxInclusive ? 'INCLUSIVE' : 'EXCLUSIVE') : '') ||
    bill.taxMode ||
    ''
  ).toUpperCase();

  const isExemptOrNonGst = ['EXEMPT', 'NON_GST', 'EXEMPTED'].includes(rawTaxModeStr);
  const gstRate = isExemptOrNonGst ? 0 : parseNum(item.gst || item.taxPercent || item.taxRate, 0);

  let isInclusive = false;
  if (['INCLUSIVE', 'GST_INCLUSIVE', 'INCL', 'TRUE'].includes(rawTaxModeStr)) {
    isInclusive = true;
  } else if (['EXCLUSIVE', 'GST_EXCLUSIVE', 'EXCL', 'FALSE'].includes(rawTaxModeStr)) {
    isInclusive = false;
  } else if (item.isTaxInclusive !== undefined && item.isTaxInclusive !== null) {
    isInclusive = Boolean(item.isTaxInclusive);
  } else if (item.product?.isTaxInclusive !== undefined && item.product?.isTaxInclusive !== null) {
    isInclusive = Boolean(item.product.isTaxInclusive);
  } else if (bill.taxMode) {
    isInclusive = String(bill.taxMode).toUpperCase() === 'INCLUSIVE';
  } else {
    const net = Math.max(0, (qty * rate) - disc);
    const storedBillTotal = parseNum(bill.grandTotal || bill.total, 0);
    if (storedBillTotal > 0 && gstRate > 0) {
      if (Math.abs(storedBillTotal - net) < 1) {
        isInclusive = true;
      }
    }
  }

  const gross = qty * rate;
  const net = Math.max(0, gross - disc);

  let lineTaxable = net;
  let lineTax = 0;
  let lineTotal = net;

  if (isInclusive && gstRate > 0) {
    lineTaxable = net / (1 + gstRate / 100);
    lineTax = net - lineTaxable;
    lineTotal = net;
  } else {
    lineTaxable = net;
    lineTax = net * (gstRate / 100);
    lineTotal = net + lineTax;
  }

  return {
    qty,
    rate,
    disc,
    gstRate,
    isInclusive,
    gross,
    net,
    lineTaxable,
    lineTax,
    lineTotal
  };
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

async function getProductionStoreInfo() {
  let storedUser = {};
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) storedUser = JSON.parse(savedUser);
  } catch (err) {}

  let liveTenant = {};
  try {
    const bizRes = await businessService.getBusinessInfo();
    if (bizRes) liveTenant = bizRes?.business || bizRes?.tenant || bizRes;
  } catch (e) {}

  const storedTenant = storedUser?.tenant || storedUser?.business || {};

  return {
    businessName: String(
      liveTenant?.businessName || liveTenant?.name || liveTenant?.companyName ||
      storedTenant?.businessName || storedTenant?.name || storedTenant?.companyName ||
      storedUser?.businessName || storedUser?.companyName || storedUser?.tenantName || storedUser?.name || 
      'SHUBHAM RETAIL STORE'
    ).toUpperCase(),
    businessAddress: String(
      liveTenant?.businessAddress || liveTenant?.address || liveTenant?.street ||
      storedTenant?.businessAddress || storedTenant?.address || 
      storedUser?.businessAddress || storedUser?.address || 'Main Market Road'
    ),
    city: String(liveTenant?.city || storedTenant?.city || storedUser?.city || ''),
    state: String(liveTenant?.state || storedTenant?.state || storedUser?.state || ''),
    stateCode: String(liveTenant?.stateCode || storedTenant?.stateCode || storedUser?.stateCode || ''),
    phone: String(
      liveTenant?.phone || liveTenant?.mobile || liveTenant?.mobileNumber ||
      storedTenant?.phone || storedTenant?.mobile || 
      storedUser?.phone || storedUser?.mobileNumber || storedUser?.mobile || ''
    ),
    gstin: String(
      liveTenant?.gstin || liveTenant?.gstNumber ||
      storedTenant?.gstin || storedTenant?.gstNumber || 
      storedUser?.gstin || storedUser?.gstNumber || ''
    )
  };
}

function safeExecuteAutoTable(doc, options) {
  try {
    const autoTableFunc = typeof autoTable === 'function' ? autoTable : (autoTable?.default || doc.autoTable);
    if (typeof autoTableFunc === 'function') {
      autoTableFunc(doc, options);
    }
  } catch (err) {
    console.error('AutoTable execution warning:', err);
  }
}

// ==========================================
// A4 Standard GST Sales Invoice PDF Builder
// ==========================================
export async function buildSalesBillPdfDoc(bill) {
  if (!bill) return { doc: null, fileName: 'sales_invoice.pdf' };

  try {
    const store = await getProductionStoreInfo();
    const isB2B = String(bill.billType || bill.type || '').toUpperCase() === 'B2B' || Boolean(bill.gstin || bill.gstNo || bill.businessName);
    
    const custObj = typeof bill.customer === 'object' && bill.customer !== null ? bill.customer : {};
    const custStr = typeof bill.customer === 'string' ? bill.customer : '';

    const customerName = String(
      custObj.name || custObj.businessName || custObj.contactPerson || bill.businessName || bill.customerName || custStr || 'Cash Customer'
    ).toUpperCase();
    const customerPhone = String(custObj.mobileNumber || custObj.mobile || custObj.phone || bill.customerMobile || bill.mobile || bill.phone || '');
    const customerGstin = String(custObj.gstin || custObj.gstNo || bill.gstin || bill.gstNo || '').toUpperCase();
    const customerAddress = String(custObj.billingAddress || custObj.address || bill.billingAddress || bill.shippingAddress || '');

    const billNo = String(bill.invoiceNumber || bill.billNumber || bill.id || bill._id || 'INV-1001');
    const billDate = formatDateStr(bill.createdAt || bill.date);
    const paymentStatus = String(bill.paymentStatus || bill.status || 'PAID').toUpperCase();

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    doc.rect(8, 8, 194, 281);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(store.businessName, 10, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    let addrText = store.businessAddress;
    if (store.city) addrText += `, ${store.city}`;
    if (store.state) addrText += `, ${store.state}`;
    doc.text(addrText, 10, 21);

    if (store.phone) doc.text(`Phone: ${store.phone}`, 10, 25);
    if (store.gstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${store.gstin}`, 10, 29);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(isB2B ? 'TAX INVOICE' : 'RETAIL INVOICE', 200, 16, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${billNo}`, 200, 21, { align: 'right' });
    doc.text(`Invoice Date: ${billDate}`, 200, 25, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`Payment Status: ${paymentStatus}`, 200, 29, { align: 'right' });

    doc.setLineWidth(0.3);
    doc.line(8, 33, 202, 33);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(isB2B ? 'Billed To (Buyer Details):' : 'Customer Details:', 10, 38);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(customerName, 10, 42);

    doc.setFont('helvetica', 'normal');
    let custY = 46;
    if (customerGstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${customerGstin}`, 10, custY);
      doc.setFont('helvetica', 'normal');
      custY += 4;
    }
    if (customerPhone) {
      doc.text(`Mobile: ${customerPhone}`, 10, custY);
      custY += 4;
    }
    if (customerAddress) {
      const splitAddr = doc.splitTextToSize(`Address: ${customerAddress}`, 180);
      doc.text(splitAddr, 10, custY);
    }

    const rawItems = Array.isArray(bill.items)
      ? bill.items
      : Array.isArray(bill.billItems)
      ? bill.billItems
      : Array.isArray(bill.invoiceItems)
      ? bill.invoiceItems
      : [];

    const headers = isB2B
      ? [['#', 'Item Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate (Rs.)', 'GST %', 'Amount (Rs.)']]
      : [['#', 'Item Description', 'Qty', 'Unit', 'Rate (Rs.)', 'Discount', 'GST %', 'Amount (Rs.)']];

    let subtotalCalc = 0;
    let totalDiscCalc = 0;
    let totalTaxCalc = 0;
    const slabMap = {};

    const tableBody = rawItems.map((item, idx) => {
      const name = item.name || item.productName || item.title || 'Product Item';
      const hsn = item.hsnCode || item.hsn || '1234';
      const taxDetails = getItemTaxDetails(item, bill);
      const { qty, rate, disc, gstRate, isInclusive, lineTaxable, lineTax, lineTotal } = taxDetails;

      subtotalCalc += lineTaxable;
      totalDiscCalc += disc;
      totalTaxCalc += lineTax;

      if (!slabMap[gstRate]) {
        slabMap[gstRate] = { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 };
      }
      slabMap[gstRate].taxable += lineTaxable;
      slabMap[gstRate].cgst += (lineTax / 2);
      slabMap[gstRate].sgst += (lineTax / 2);
      slabMap[gstRate].totalGst += lineTax;

      if (isB2B) {
        return [
          idx + 1,
          name,
          hsn,
          qty,
          unit,
          rate.toFixed(2),
          `${gstRate}%`,
          lineTotal.toFixed(2)
        ];
      } else {
        return [
          idx + 1,
          name,
          qty,
          unit,
          rate.toFixed(2),
          disc > 0 ? disc.toFixed(2) : '-',
          `${gstRate}%`,
          lineTotal.toFixed(2)
        ];
      }
    });

    const roundOff = parseNum(bill.roundOff, 0);
    const grandTotal = parseNum(bill.grandTotal || bill.total || (subtotalCalc + totalTaxCalc + roundOff), 0);

    safeExecuteAutoTable(doc, {
      startY: 51,
      margin: { top: 50, left: 8, right: 8 },
      head: headers,
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'left', cellWidth: 70, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 16 },
        7: { halign: 'right', cellWidth: 25, fontStyle: 'bold' }
      }
    });

    let finalY = (doc.lastAutoTable && typeof doc.lastAutoTable.finalY === 'number') ? doc.lastAutoTable.finalY + 4 : 110;

    doc.rect(8, finalY, 194, 30);
    doc.line(120, finalY, 120, finalY + 30);

    const slabTableBody = Object.entries(slabMap)
      .filter(([_, data]) => data.taxable > 0)
      .map(([slab, data]) => [
        `${slab}%`,
        data.taxable.toFixed(2),
        data.cgst.toFixed(2),
        data.sgst.toFixed(2),
        data.totalGst.toFixed(2)
      ]);

    safeExecuteAutoTable(doc, {
      startY: finalY + 1,
      margin: { left: 9, right: 93 },
      head: [['GST', 'TAXABLE', 'CGST', 'SGST', 'TOTAL GST']],
      body: slabTableBody,
      theme: 'plain',
      styles: { fontSize: 6.5, cellPadding: 1, textColor: [0, 0, 0] },
      headStyles: { fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 15 },
        1: { halign: 'right', cellWidth: 22 },
        2: { halign: 'right', cellWidth: 22 },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 22, fontStyle: 'bold' }
      }
    });

    let rightY = finalY + 4;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('SUBTOTAL:', 122, rightY);
    doc.text(`Rs. ${subtotalCalc.toFixed(2)}`, 200, rightY, { align: 'right' });

    rightY += 4.5;
    doc.text('TOTAL DISCOUNT:', 122, rightY);
    doc.text(`-Rs. ${totalDiscCalc.toFixed(2)}`, 200, rightY, { align: 'right' });

    rightY += 4.5;
    doc.text('TOTAL GST:', 122, rightY);
    doc.text(`Rs. ${totalTaxCalc.toFixed(2)}`, 200, rightY, { align: 'right' });

    if (roundOff !== 0) {
      rightY += 4.5;
      doc.text('ROUND OFF:', 122, rightY);
      doc.text(`Rs. ${roundOff.toFixed(2)}`, 200, rightY, { align: 'right' });
    }

    doc.setLineWidth(0.4);
    doc.line(120, rightY + 2, 202, rightY + 2);

    rightY += 6.5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL:', 122, rightY);
    doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}.00`, 200, rightY, { align: 'right' });

    const wordsY = finalY + 32;
    doc.rect(8, wordsY, 194, 10);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount In Words:', 10, wordsY + 4);
    doc.setFont('helvetica', 'bolditalic');
    doc.text(numberToWordsINR(grandTotal), 36, wordsY + 4);

    const sigY = wordsY + 12;
    doc.rect(8, sigY, 194, 14);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text("Customer Signature", 10, sigY + 4);
    doc.text(`For ${store.businessName}`, 200, sigY + 4, { align: 'right' });
    doc.text('AUTHORIZED SIGNATORY', 200, sigY + 11, { align: 'right' });

    return { doc, fileName: `SalesInvoice_${billNo}.pdf` };
  } catch (err) {
    console.error('Error generating A4 Sales Invoice PDF:', err);
    throw err;
  }
}

export async function downloadSalesBillPdf(bill) {
  const result = await buildSalesBillPdfDoc(bill);
  if (result?.doc) {
    result.doc.save(result.fileName);
  }
}

export async function printSalesBillPdf(bill) {
  const result = await buildSalesBillPdfDoc(bill);
  if (!result?.doc) return;

  result.doc.autoPrint();
  const pdfBlobUrl = result.doc.output('bloburl');

  let iframe = document.getElementById('sales-pdf-print-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'sales-pdf-print-iframe';
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
        window.open(pdfBlobUrl, '_blank');
      }
    }, 150);
  };
}

export async function openSalesBillPdfInNewTab(bill) {
  const result = await buildSalesBillPdfDoc(bill);
  if (!result?.doc) return null;
  const pdfBlobUrl = result.doc.output('bloburl');
  window.open(pdfBlobUrl, '_blank');
  return pdfBlobUrl;
}


// ==========================================
// 80mm (3-Inch) Thermal POS Receipt Builder
// ==========================================
export async function buildPosThermalReceiptDoc(bill) {
  if (!bill) return { doc: null, fileName: 'pos_receipt.pdf' };

  try {
    const store = await getProductionStoreInfo();
    const rawItems = Array.isArray(bill.items)
      ? bill.items
      : Array.isArray(bill.billItems)
      ? bill.billItems
      : Array.isArray(bill.invoiceItems)
      ? bill.invoiceItems
      : [];
    const billNo = String(bill.invoiceNumber || bill.billNumber || bill.id || bill._id || 'INV');
    const billDate = formatDateStr(bill.createdAt || bill.date);

    const customerObj = typeof bill.customer === 'object' && bill.customer !== null ? bill.customer : {};
    const custStr = typeof bill.customer === 'string' ? bill.customer : '';
    const customerName = String(
      customerObj.name || customerObj.businessName || customerObj.contactPerson || bill.customerName || bill.businessName || custStr || 'Cash Customer'
    ).toUpperCase();
    const customerPhone = String(
      bill.customerMobile || bill.mobile || bill.phone || customerObj.mobileNumber || customerObj.mobile || customerObj.phone || ''
    );

    // Dynamic height calculation for 80mm roll
    const baseHeight = 110;
    const itemsHeight = Math.max(1, rawItems.length) * 10;
    const totalHeight = baseHeight + itemsHeight;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [80, totalHeight],
    });

    let y = 6;
    const centerX = 40;
    const leftMargin = 5;
    const rightMargin = 75;

    // Store Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(store.businessName, centerX, y, { align: 'center' });

    y += 4;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const storeAddrLines = doc.splitTextToSize(store.businessAddress, 68);
    doc.text(storeAddrLines, centerX, y, { align: 'center' });
    y += (storeAddrLines.length * 3) + 1;

    if (store.phone) {
      doc.text(`Ph: ${store.phone}`, centerX, y, { align: 'center' });
      y += 3.5;
    }
    if (store.gstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${store.gstin}`, centerX, y, { align: 'center' });
      y += 4;
    }

    // Divider Line
    doc.setLineWidth(0.25);
    doc.line(leftMargin, y, rightMargin, y);
    y += 4;

    // Receipt Title
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RETAIL POS RECEIPT', centerX, y, { align: 'center' });
    y += 4;

    // Invoice & Customer Info
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`Bill #: ${billNo}`, leftMargin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${billDate}`, rightMargin, y, { align: 'right' });
    y += 3.5;

    doc.text(`Cust: ${customerName.slice(0, 20)}`, leftMargin, y);
    if (customerPhone) doc.text(`Mob: ${customerPhone}`, rightMargin, y, { align: 'right' });
    y += 4;

    // Items Table Divider
    doc.line(leftMargin, y, rightMargin, y);
    y += 3.5;

    // Table Headers
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', leftMargin, y);
    doc.text('QTY x RATE', 44, y, { align: 'center' });
    doc.text('AMT (Rs.)', rightMargin, y, { align: 'right' });
    y += 2.5;
    doc.line(leftMargin, y, rightMargin, y);
    y += 3.5;

    let subtotalCalc = 0;
    let totalDiscCalc = 0;
    let totalTaxCalc = 0;
    let hasExclusiveItems = false;

    rawItems.forEach((item) => {
      const itemName = String(item.name || item.productName || item.title || 'Item').slice(0, 22);
      const taxDetails = getItemTaxDetails(item, bill);
      const unit = item.unit || item.purchaseUnit || 'Pcs';
      const { qty, rate, disc, gstRate, isInclusive, lineTaxable, lineTax, lineTotal } = taxDetails;

      if (!isInclusive && gstRate > 0) {
        hasExclusiveItems = true;
      }

      subtotalCalc += lineTaxable;
      totalDiscCalc += disc;
      totalTaxCalc += lineTax;

      const displayAmt = isInclusive ? lineTotal : lineTaxable;

      doc.setFont('helvetica', 'bold');
      doc.text(itemName, leftMargin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${qty} ${unit} x ${rate.toFixed(0)}`, 44, y, { align: 'center' });
      doc.text(displayAmt.toFixed(2), rightMargin, y, { align: 'right' });
      y += 4;
    });

    y += 1;
    doc.line(leftMargin, y, rightMargin, y);
    y += 4;

    const roundOff = parseNum(bill.roundOff, 0);
    const grandTotal = parseNum(bill.grandTotal || bill.total || (subtotalCalc + totalTaxCalc + roundOff), 0);

    // Totals Breakdown Right Aligned
    const labelX = 35;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', labelX, y);
    doc.text(`Rs. ${subtotalCalc.toFixed(2)}`, rightMargin, y, { align: 'right' });
    y += 3.5;

    if (totalDiscCalc > 0) {
      doc.text('Discount:', labelX, y);
      doc.text(`-Rs. ${totalDiscCalc.toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 3.5;
    }

    if (totalTaxCalc > 0) {
      doc.text('GST Tax:', labelX, y);
      doc.text(`Rs. ${totalTaxCalc.toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 3.5;
    }

    if (roundOff !== 0) {
      doc.text('Round Off:', labelX, y);
      doc.text(`Rs. ${roundOff.toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 3.5;
    }

    doc.line(labelX, y, rightMargin, y);
    y += 4;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL:', labelX, y);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightMargin, y, { align: 'right' });
    y += 4.5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const rawStatus = String(bill.status || bill.paymentStatus || 'PAID').replace(/_/g, ' ').toUpperCase();
    const modeStr = String(bill.paymentMode || bill.paymentMethod || 'CASH').toUpperCase();

    doc.text(`Mode: ${modeStr}`, leftMargin, y);
    doc.text(`Status: ${rawStatus}`, rightMargin, y, { align: 'right' });
    y += 4.5;

    doc.line(leftMargin, y, rightMargin, y);
    y += 4;

    // Footer Message
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank You For Shopping With Us!', centerX, y, { align: 'center' });
    y += 3;
    doc.setFont('helvetica', 'normal');
    const footerTaxText = hasExclusiveItems
      ? 'Prices are exclusive of taxes. Tax extra as applicable.'
      : 'Prices are inclusive of all applicable taxes.';
    doc.text(footerTaxText, centerX, y, { align: 'center' });
    y += 3;
    doc.setFontSize(5.5);
    doc.text('Powered by Softfyr Multi-Tenant Billing', centerX, y, { align: 'center' });

    return { doc, fileName: `POS_Receipt_${billNo}.pdf` };
  } catch (err) {
    console.error('Error generating POS Thermal Receipt PDF:', err);
    throw err;
  }
}

export async function downloadPosThermalReceiptPdf(bill) {
  const result = await buildPosThermalReceiptDoc(bill);
  if (result?.doc) {
    result.doc.save(result.fileName);
  }
}

export async function printPosThermalReceiptPdf(bill) {
  const result = await buildPosThermalReceiptDoc(bill);
  if (!result?.doc) return;

  result.doc.autoPrint();
  const pdfBlobUrl = result.doc.output('bloburl');

  let iframe = document.getElementById('pos-pdf-print-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'pos-pdf-print-iframe';
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
        window.open(pdfBlobUrl, '_blank');
      }
    }, 150);
  };
}

export function isB2BBill(bill) {
  if (!bill) return false;
  const billType = String(bill.billType || bill.type || '').toUpperCase();
  if (billType === 'B2B') return true;
  if (billType === 'B2C') return false;
  const custObj = typeof bill.customer === 'object' && bill.customer !== null ? bill.customer : {};
  return Boolean(bill.gstin || bill.gstNo || bill.businessName || custObj.gstin || custObj.gstNo || custObj.businessName);
}

export async function buildSmartBillPdfDoc(bill) {
  if (isB2BBill(bill)) {
    return await buildSalesBillPdfDoc(bill);
  } else {
    return await buildPosThermalReceiptDoc(bill);
  }
}

export async function downloadSmartBillPdf(bill) {
  if (isB2BBill(bill)) {
    return await downloadSalesBillPdf(bill);
  } else {
    return await downloadPosThermalReceiptPdf(bill);
  }
}

export async function printSmartBillPdf(bill) {
  if (isB2BBill(bill)) {
    return await printSalesBillPdf(bill);
  } else {
    return await printPosThermalReceiptPdf(bill);
  }
}

export async function shareSmartBillOnWhatsApp(bill, toast) {
  if (!bill) return;

  const billNo = bill.invoiceNumber || bill.billNumber || bill.invoiceNo || 'Invoice';
  const customerName =
    typeof bill.customer === 'object'
      ? bill.customer?.name || bill.customer?.businessName || 'Customer'
      : bill.customer || bill.customerName || 'Customer';

  const customerPhone =
    (typeof bill.customer === 'object' ? bill.customer?.mobile || bill.customer?.phone : null) ||
    bill.phone ||
    bill.mobile ||
    '';

  const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '');
  const billId = bill.id || bill._id || '';
  const shareUrl = billId ? `${window.location.origin}/public/invoices/${billId}` : window.location.href;

  const messageText = `Hello ${customerName},\n\n📄 Here is your Tax Invoice #${billNo}\n💰 Amount: ₹${Number(
    bill.grandTotal || bill.total || 0
  ).toLocaleString('en-IN')}\n\n🔗 View & Download PDF Invoice:\n${shareUrl}`;

  // 1. Mobile Web Share API: Try sharing the actual PDF File attachment directly
  try {
    const result = await buildSmartBillPdfDoc(bill);
    if (result?.doc && navigator.canShare) {
      const pdfBlob = result.doc.output('blob');
      const filename = `Invoice_${billNo}.pdf`;
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Invoice #${billNo}`,
          text: messageText,
          files: [pdfFile],
        });
        if (toast && typeof toast.success === 'function') {
          toast.success('Invoice PDF shared successfully via WhatsApp!');
        }
        return;
      }
    }
  } catch (err) {
    console.log('Web Share API fallback:', err);
  }

  // 2. Desktop Fallback: Trigger PDF download so user has file on device
  try {
    await downloadSmartBillPdf(bill);
    if (toast && typeof toast.info === 'function') {
      toast.info('Invoice PDF downloaded. Opening WhatsApp...');
    }
  } catch (e) {
    console.error('Download before WhatsApp share error:', e);
  }

  // 3. Open WhatsApp Web/App
  let targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
  if (cleanPhone && cleanPhone.length >= 10) {
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    targetUrl = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(messageText)}`;
  }

  window.open(targetUrl, '_blank');
}

