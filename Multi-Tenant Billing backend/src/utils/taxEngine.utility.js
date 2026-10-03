/**
 * Centralized Tax, GST & Line Item Calculation Engine
 */

export const indianStatesMap = {
  'MAHARASHTRA': '27',
  'DELHI': '07',
  'KARNATAKA': '29',
  'TAMIL NADU': '33',
  'UTTAR PRADESH': '09',
  'WEST BENGAL': '19',
  'GUJARAT': '24',
  'RAJASTHAN': '08',
  'MADHYA PRADESH': '23',
  'TELANGANA': '36',
  'ANDHRA PRADESH': '37',
  'PUNJAB': '03',
  'HARYANA': '06',
  'BIHAR': '10',
  'ODISHA': '21',
  'ASSAM': '18',
  'HIMACHAL PRADESH': '02',
  'UTTARAKHAND': '05',
  'CHHATTISGARH': '22',
  'JHARKHAND': '20',
  'GOA': '30'
};

/**
 * Calculates line item subtotal, taxable amount, tax amount, and line total.
 * Handles both GST Inclusive and Exclusive pricing models.
 */
export const calculateLineItemTaxAndTotal = ({
  unitPrice,
  quantity,
  discountAmount = 0,
  taxPercent = 0,
  taxType = 'EXCLUSIVE',
  taxMode = ''
}) => {
  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  const disc = parseFloat(discountAmount) || 0;
  const taxPct = parseFloat(taxPercent) || 0;

  const lineSubtotal = Math.round((qty * price) * 100) / 100;
  const rawLineNet = Math.max(0, lineSubtotal - disc);

  const normalizedTaxType = String(taxType || '').toUpperCase();
  const normalizedTaxMode = String(taxMode || '').toUpperCase();
  const isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE'].includes(normalizedTaxType) || ['INCLUSIVE', 'GST_INCLUSIVE'].includes(normalizedTaxMode);

  let lineTaxable = 0;
  let taxAmount = 0;
  let lineTotal = 0;

  if (isInclusive && taxPct > 0) {
    lineTaxable = Math.round((rawLineNet / (1 + (taxPct / 100))) * 100) / 100;
    taxAmount = Math.round((rawLineNet - lineTaxable) * 100) / 100;
    lineTotal = rawLineNet;
  } else {
    lineTaxable = Math.round(rawLineNet * 100) / 100;
    taxAmount = Math.round(((lineTaxable * taxPct) / 100) * 100) / 100;
    lineTotal = Math.round((lineTaxable + taxAmount) * 100) / 100;
  }

  return {
    lineSubtotal,
    discountAmount: disc,
    rawLineNet,
    lineTaxable,
    taxPercent: taxPct,
    taxAmount,
    lineTotal
  };
};

/**
 * Resolves Inter-State vs Intra-State GST tax splits (CGST, SGST, IGST).
 */
export const resolveGstSplit = ({
  totalTaxAmount = 0,
  igstAmountInput = 0,
  targetStateCode,
  targetGstin,
  tenantState = 'MAHARASHTRA',
  tenantGstNumber
}) => {
  const taxAmt = Math.round((parseFloat(totalTaxAmount) || 0) * 100) / 100;

  const tenantStateUpper = (tenantState || 'MAHARASHTRA').toUpperCase().trim();
  const tenantStateCode = tenantGstNumber && tenantGstNumber.length >= 2
    ? tenantGstNumber.slice(0, 2)
    : (indianStatesMap[tenantStateUpper] || '27');

  const cleanGstin = (targetGstin || '').trim().toUpperCase();
  const resolvedTargetStateCode = (targetStateCode || (cleanGstin.length >= 2 ? cleanGstin.slice(0, 2) : '')).trim();

  let isInterState = false;
  if ((parseFloat(igstAmountInput) || 0) > 0) {
    isInterState = true;
  } else if (resolvedTargetStateCode && resolvedTargetStateCode !== tenantStateCode) {
    isInterState = true;
  }

  if (isInterState) {
    return {
      isInterState: true,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: taxAmt
    };
  }

  const cgst = Math.round((taxAmt / 2) * 100) / 100;
  const sgst = Math.round((taxAmt - cgst) * 100) / 100;

  return {
    isInterState: false,
    cgstAmount: cgst,
    sgstAmount: sgst,
    igstAmount: 0
  };
};

/**
 * Calculates document level totals (subtotal, discount, tax, roundOff, grandTotal).
 */
export const calculateDocumentTotals = ({
  subtotal = 0,
  totalTaxAmount = 0,
  discountType = 'NONE',
  discountValue = 0,
  roundOff = 0,
  otherCharges = 0
}) => {
  const sub = Math.round((parseFloat(subtotal) || 0) * 100) / 100;
  const tax = Math.round((parseFloat(totalTaxAmount) || 0) * 100) / 100;
  const dVal = parseFloat(discountValue) || 0;
  const rOff = parseFloat(roundOff) || 0;
  const addCharges = parseFloat(otherCharges) || 0;

  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = Math.round(((sub * dVal) / 100) * 100) / 100;
  } else if (discountType === 'FIXED') {
    discountAmount = Math.round(dVal * 100) / 100;
  }

  const rawGrandTotal = sub + tax - discountAmount + addCharges + rOff;
  const grandTotal = Math.max(0, Math.round(rawGrandTotal * 100) / 100);

  return {
    subtotal: sub,
    totalTaxAmount: tax,
    discountAmount,
    otherCharges: addCharges,
    roundOff: rOff,
    grandTotal
  };
};

/**
 * Apportions header/document level discount across items proportionally based on taxable base.
 */
export const apportionBillDiscountToLineItems = (items = [], headerDiscountAmount = 0) => {
  const hDisc = parseFloat(headerDiscountAmount) || 0;
  if (!Array.isArray(items) || items.length === 0) return [];
  if (hDisc <= 0) return items;

  const totalGrossTaxable = items.reduce((sum, item) => sum + (parseFloat(item.rawLineNet) || parseFloat(item.lineTaxable) || (parseFloat(item.unitPrice || item.purchasePrice || 0) * (parseFloat(item.quantity) || 0))), 0);
  if (totalGrossTaxable <= 0) return items;

  let allocatedTotal = 0;
  return items.map((item, index) => {
    const itemGross = parseFloat(item.rawLineNet) || parseFloat(item.lineTaxable) || ((parseFloat(item.unitPrice || item.purchasePrice || 0) * (parseFloat(item.quantity) || 0)));
    let allocatedDisc = 0;

    if (index === items.length - 1) {
      allocatedDisc = Math.round((hDisc - allocatedTotal) * 100) / 100;
    } else {
      allocatedDisc = Math.round(((itemGross / totalGrossTaxable) * hDisc) * 100) / 100;
      allocatedTotal += allocatedDisc;
    }

    const netTaxable = Math.max(0, Math.round((itemGross - allocatedDisc) * 100) / 100);
    const taxPct = parseFloat(item.taxPercent) || 0;
    const taxAmt = Math.round(((netTaxable * taxPct) / 100) * 100) / 100;

    return {
      ...item,
      apportionedHeaderDiscount: allocatedDisc,
      netTaxable,
      taxAmount: taxAmt,
      lineTotal: Math.round((netTaxable + taxAmt) * 100) / 100
    };
  });
};

/**
 * Calculates exact Tax & ITC Reversals for Purchase/Sales Returns
 */
export const calculateReturnTaxReversal = ({
  returnQty = 0,
  unitPrice = 0,
  taxPercent = 0,
  isInterState = false,
  headerDiscountFactor = 1
}) => {
  const qty = parseFloat(returnQty) || 0;
  const price = parseFloat(unitPrice) || 0;
  const taxPct = parseFloat(taxPercent) || 0;
  const factor = parseFloat(headerDiscountFactor) || 1;

  const rawReturnTaxable = Math.round((qty * price * factor) * 100) / 100;
  const totalTaxReversal = Math.round(((rawReturnTaxable * taxPct) / 100) * 100) / 100;

  if (isInterState) {
    return {
      returnTaxableValue: rawReturnTaxable,
      totalTaxReversal,
      cgstReversal: 0,
      sgstReversal: 0,
      igstReversal: totalTaxReversal
    };
  }

  const cgst = Math.round((totalTaxReversal / 2) * 100) / 100;
  const sgst = Math.round((totalTaxReversal - cgst) * 100) / 100;

  return {
    returnTaxableValue: rawReturnTaxable,
    totalTaxReversal,
    cgstReversal: cgst,
    sgstReversal: sgst,
    igstReversal: 0
  };
};

/**
 * Groups invoice line items by HSN Code and calculates aggregated HSN Tax Summary
 */
export const calculateHsnTaxSummary = (lineItems = []) => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) return [];

  const hsnMap = new Map();

  for (const item of lineItems) {
    const hsn = (item.hsnCode || item.product?.hsnCode || 'N/A').toUpperCase().trim();
    const description = item.product?.name || item.description || 'Goods/Services';
    const uqc = item.unit || item.product?.unit || 'Pcs';
    const qty = parseFloat(item.quantity) || 0;
    const taxable = parseFloat(item.lineTaxable) || parseFloat(item.rawLineNet) || (qty * (parseFloat(item.unitPrice) || 0));
    const taxAmt = parseFloat(item.taxAmount) || 0;
    const cgst = parseFloat(item.cgstAmount) || (item.isInterState ? 0 : taxAmt / 2);
    const sgst = parseFloat(item.sgstAmount) || (item.isInterState ? 0 : taxAmt / 2);
    const igst = parseFloat(item.igstAmount) || (item.isInterState ? taxAmt : 0);
    const totalVal = parseFloat(item.lineTotal) || (taxable + taxAmt);

    if (hsnMap.has(hsn)) {
      const existing = hsnMap.get(hsn);
      existing.totalQuantity = Math.round((existing.totalQuantity + qty) * 1000) / 1000;
      existing.totalValue = Math.round((existing.totalValue + totalVal) * 100) / 100;
      existing.taxableValue = Math.round((existing.taxableValue + taxable) * 100) / 100;
      existing.cgstAmount = Math.round((existing.cgstAmount + cgst) * 100) / 100;
      existing.sgstAmount = Math.round((existing.sgstAmount + sgst) * 100) / 100;
      existing.igstAmount = Math.round((existing.igstAmount + igst) * 100) / 100;
      existing.totalTax = Math.round((existing.totalTax + taxAmt) * 100) / 100;
    } else {
      hsnMap.set(hsn, {
        hsnCode: hsn,
        description,
        uqc,
        totalQuantity: Math.round(qty * 1000) / 1000,
        totalValue: Math.round(totalVal * 100) / 100,
        taxableValue: Math.round(taxable * 100) / 100,
        cgstAmount: Math.round(cgst * 100) / 100,
        sgstAmount: Math.round(sgst * 100) / 100,
        igstAmount: Math.round(igst * 100) / 100,
        totalTax: Math.round(taxAmt * 100) / 100
      });
    }
  }

  return Array.from(hsnMap.values());
};

/**
 * Classifies GSTR-1 Transaction Category (B2B, B2C_LARGE, B2C_SMALL)
 */
export const classifyGstTransactionCategory = ({ gstin, grandTotal = 0, isInterState = false }) => {
  const cleanGstin = (gstin || '').trim();
  if (cleanGstin && cleanGstin.length >= 15) {
    return 'B2B';
  }
  const total = parseFloat(grandTotal) || 0;
  if (isInterState && total > 250000) {
    return 'B2C_LARGE';
  }
  return 'B2C_SMALL';
};

