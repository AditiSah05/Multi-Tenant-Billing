import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { exportToExcel, exportMultiSheetToExcel } from '../../utils/export.utility.js';
import { getGstr1Report, getGstr3bReport } from '../report/report.service.js';
import { getPaginationParams, formatPaginatedResult } from '../../utils/pagination.utility.js';

export const createTax = async (tenantId, data) => {
  const { name, percentage, type, status } = data;

  return await prisma.tax.create({
    data: {
      tenantId,
      name,
      percentage: parseFloat(percentage),
      type: type || 'PERCENTAGE',
      status: status || 'ACTIVE'
    }
  });
};

export const getTaxes = async (tenantId) => {
  return await prisma.tax.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' }
  });
};

export const getTaxById = async (tenantId, taxId) => {
  const tax = await prisma.tax.findFirst({
    where: { id: taxId, tenantId }
  });
  if (!tax) throw new ApiError(404, 'Tax record not found.');
  return tax;
};

export const updateTax = async (tenantId, taxId, data) => {
  const tax = await prisma.tax.findFirst({ where: { id: taxId, tenantId } });
  if (!tax) throw new ApiError(404, 'Tax record not found.');

  return await prisma.tax.update({
    where: { id: taxId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.percentage !== undefined && { percentage: parseFloat(data.percentage) }),
      ...(data.type && { type: data.type }),
      ...(data.status && { status: data.status })
    }
  });
};

export const deleteTax = async (tenantId, taxId) => {
  const tax = await prisma.tax.findFirst({ where: { id: taxId, tenantId } });
  if (!tax) throw new ApiError(404, 'Tax record not found.');

  return await prisma.tax.delete({ where: { id: taxId } });
};

/**
 * 1-Click Auto-Seed Standard Indian GST Slabs (0%, 5%, 12%, 18%, 28%) for Tenant
 */
export const seedDefaultGstSlabs = async (tenantId) => {
  const defaultSlabs = [
    { name: 'GST 0% (Exempt)', percentage: 0.0, type: 'PERCENTAGE', status: 'ACTIVE' },
    { name: 'GST 5%', percentage: 5.0, type: 'PERCENTAGE', status: 'ACTIVE' },
    { name: 'GST 12%', percentage: 12.0, type: 'PERCENTAGE', status: 'ACTIVE' },
    { name: 'GST 18%', percentage: 18.0, type: 'PERCENTAGE', status: 'ACTIVE' },
    { name: 'GST 28%', percentage: 28.0, type: 'PERCENTAGE', status: 'ACTIVE' }
  ];

  const createdSlabs = [];

  for (const slab of defaultSlabs) {
    const existing = await prisma.tax.findFirst({
      where: { tenantId, percentage: slab.percentage }
    });

    if (!existing) {
      const created = await prisma.tax.create({
        data: {
          tenantId,
          ...slab
        }
      });
      createdSlabs.push(created);
    }
  }

  const allTaxes = await getTaxes(tenantId);
  return {
    message: `Successfully seeded ${createdSlabs.length} standard GST slabs. Total active tax rates: ${allTaxes.length}.`,
    createdCount: createdSlabs.length,
    taxes: allTaxes
  };
};

/**
 * Real-time Tax Liability Summary by Tax Slabs
 */
export const getTaxSummaryBySlabs = async (tenantId, filters = {}) => {
  const { startDate, endDate } = filters;
  const whereBill = { tenantId, status: { notIn: ['CANCELLED'] } };
  const wherePurchase = { tenantId, purchaseStatus: { notIn: ['CANCELLED'] } };

  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      dateFilter.lte = end;
    }
    whereBill.createdAt = dateFilter;
    wherePurchase.invoiceDate = dateFilter;
  }

  const salesItems = await prisma.billItem.findMany({
    where: { bill: whereBill },
    select: { taxPercent: true, taxAmount: true, lineTotal: true, baseQuantity: true, quantity: true }
  });

  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { purchaseInvoice: wherePurchase },
    select: { taxPercent: true, taxAmount: true, totalAmount: true, quantity: true }
  });

  const slabMap = new Map();

  for (const s of salesItems) {
    const pct = parseFloat(s.taxPercent) || 0;
    const taxAmt = parseFloat(s.taxAmount) || 0;

    if (!slabMap.has(pct)) {
      slabMap.set(pct, { taxPercent: pct, salesTaxCollected: 0, purchaseTaxPaid: 0, netTaxPayable: 0 });
    }
    const record = slabMap.get(pct);
    record.salesTaxCollected += taxAmt;
  }

  for (const p of purchaseItems) {
    const pct = parseFloat(p.taxPercent) || 0;
    const taxAmt = parseFloat(p.taxAmount) || 0;

    if (!slabMap.has(pct)) {
      slabMap.set(pct, { taxPercent: pct, salesTaxCollected: 0, purchaseTaxPaid: 0, netTaxPayable: 0 });
    }
    const record = slabMap.get(pct);
    record.purchaseTaxPaid += taxAmt;
  }

  const slabSummary = Array.from(slabMap.values()).map(s => ({
    taxPercent: s.taxPercent,
    salesTaxCollected: Math.round(s.salesTaxCollected * 100) / 100,
    purchaseTaxPaid: Math.round(s.purchaseTaxPaid * 100) / 100,
    netTaxPayable: Math.round((s.salesTaxCollected - s.purchaseTaxPaid) * 100) / 100
  })).sort((a, b) => a.taxPercent - b.taxPercent);

  const totalSalesTax = slabSummary.reduce((sum, s) => sum + s.salesTaxCollected, 0);
  const totalPurchaseTax = slabSummary.reduce((sum, s) => sum + s.purchaseTaxPaid, 0);

  return {
    overallSummary: {
      totalSalesTaxCollected: Math.round(totalSalesTax * 100) / 100,
      totalPurchaseTaxPaidITC: Math.round(totalPurchaseTax * 100) / 100,
      netTaxPayableGovtDues: Math.round((totalSalesTax - totalPurchaseTax) * 100) / 100
    },
    slabSummary
  };
};

/**
 * Product-Wise Input Tax vs Output Tax Comparison & Reconciliation Summary
 */
export const getProductTaxSummary = async (tenantId, filters = {}) => {
  const { startDate, endDate, search, page: pageInput, limit: limitInput } = filters;
  const whereBill = { tenantId, status: { notIn: ['CANCELLED'] } };
  const wherePurchase = { tenantId, purchaseStatus: { notIn: ['CANCELLED'] } };

  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      dateFilter.lte = end;
    }
    whereBill.createdAt = dateFilter;
    wherePurchase.invoiceDate = dateFilter;
  }

  const productsWhere = { tenantId };
  if (search && search.trim()) {
    const q = search.trim();
    productsWhere.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { hsnCode: { contains: q, mode: 'insensitive' } }
    ];
  }

  const hasPagination = Boolean(pageInput || limitInput);
  const { page, limit, skip, take } = getPaginationParams(filters, 20);

  const totalCount = await prisma.product.count({ where: productsWhere });

  const products = await prisma.product.findMany({
    where: productsWhere,
    select: { id: true, name: true, sku: true, hsnCode: true, unit: true, purchasePrice: true, sellingPrice: true, tax: { select: { percentage: true, name: true } } },
    orderBy: { name: 'asc' },
    ...(hasPagination ? { skip, take } : {})
  });

  const productIds = products.map(p => p.id);

  const salesItems = await prisma.billItem.findMany({
    where: { productId: { in: productIds }, bill: whereBill },
    select: { productId: true, quantity: true, taxAmount: true, lineTotal: true, taxPercent: true }
  });

  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { productId: { in: productIds }, purchaseInvoice: wherePurchase },
    select: { productId: true, quantity: true, taxAmount: true, totalAmount: true, taxPercent: true }
  });

  const productTaxMap = new Map();
  for (const p of products) {
    productTaxMap.set(p.id, {
      productId: p.id,
      productName: p.name,
      sku: p.sku || 'N/A',
      hsnCode: p.hsnCode || 'N/A',
      unit: p.unit || 'Pcs',
      taxPercent: p.tax?.percentage ?? 0,
      taxName: p.tax?.name || 'N/A',
      totalInputQty: 0,
      totalInputTaxPaid: 0,
      totalOutputQty: 0,
      totalOutputTaxCollected: 0,
      netTaxPayable: 0
    });
  }

  for (const item of purchaseItems) {
    if (productTaxMap.has(item.productId)) {
      const rec = productTaxMap.get(item.productId);
      rec.totalInputQty += (parseFloat(item.quantity) || 0);
      rec.totalInputTaxPaid += (parseFloat(item.taxAmount) || 0);
      if (rec.taxPercent === 0 && item.taxPercent) {
        rec.taxPercent = parseFloat(item.taxPercent) || 0;
      }
    }
  }

  for (const item of salesItems) {
    if (productTaxMap.has(item.productId)) {
      const rec = productTaxMap.get(item.productId);
      rec.totalOutputQty += (parseFloat(item.quantity) || 0);
      rec.totalOutputTaxCollected += (parseFloat(item.taxAmount) || 0);
      if (rec.taxPercent === 0 && item.taxPercent) {
        rec.taxPercent = parseFloat(item.taxPercent) || 0;
      }
    }
  }

  const productTaxReport = Array.from(productTaxMap.values()).map(r => ({
    ...r,
    taxPercent: Math.round(r.taxPercent * 100) / 100,
    totalInputQty: Math.round(r.totalInputQty * 100) / 100,
    totalInputTaxPaid: Math.round(r.totalInputTaxPaid * 100) / 100,
    totalOutputQty: Math.round(r.totalOutputQty * 100) / 100,
    totalOutputTaxCollected: Math.round(r.totalOutputTaxCollected * 100) / 100,
    netTaxPayable: Math.round((r.totalOutputTaxCollected - r.totalInputTaxPaid) * 100) / 100
  }));

  const overallInputTax = productTaxReport.reduce((sum, r) => sum + r.totalInputTaxPaid, 0);
  const overallOutputTax = productTaxReport.reduce((sum, r) => sum + r.totalOutputTaxCollected, 0);

  const baseResult = {
    summary: {
      totalProductsAnalyzed: hasPagination ? totalCount : productTaxReport.length,
      totalInputTaxPaidITC: Math.round(overallInputTax * 100) / 100,
      totalOutputTaxCollected: Math.round(overallOutputTax * 100) / 100,
      netTaxPayableOverall: Math.round((overallOutputTax - overallInputTax) * 100) / 100
    },
    products: productTaxReport
  };

  if (hasPagination) {
    return {
      ...baseResult,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    };
  }

  return baseResult;
};

/**
 * Format Product-Wise Tax Comparison for Excel Export
 */
export const exportProductTaxSummary = async (tenantId, filters = {}) => {
  const result = await getProductTaxSummary(tenantId, filters);
  return result.products.map(p => ({
    productName: p.productName,
    sku: p.sku,
    hsnCode: p.hsnCode,
    unit: p.unit,
    taxPercent: p.taxPercent,
    totalInputQty: p.totalInputQty,
    totalInputTaxPaidITC: p.totalInputTaxPaid,
    totalOutputQty: p.totalOutputQty,
    totalOutputTaxCollected: p.totalOutputTaxCollected,
    netTaxPayable: p.netTaxPayable
  }));
};

/**
 * Party-Wise Tax Breakdown (Supplier-wise Input Tax Paid vs Customer-wise Output Tax Collected)
 */
export const getPartyTaxBreakdown = async (tenantId, filters = {}) => {
  const { startDate, endDate, supplierId, customerId } = filters;

  const wherePurchases = { tenantId, purchaseStatus: { notIn: ['CANCELLED'] } };
  const whereBills = { tenantId, status: { notIn: ['CANCELLED'] } };

  if (supplierId) wherePurchases.supplierId = supplierId;
  if (customerId) whereBills.customerId = customerId;

  if (startDate || endDate) {
    const dFilter = {};
    if (startDate) dFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      dFilter.lte = end;
    }
    wherePurchases.invoiceDate = dFilter;
    whereBills.createdAt = dFilter;
  }

  // 1. Supplier-Wise Input Tax Breakdown
  const purchases = await prisma.purchaseInvoice.findMany({
    where: wherePurchases,
    include: { supplier: { select: { id: true, name: true, companyName: true, gstin: true, mobileNumber: true } } }
  });

  const supplierMap = new Map();
  for (const p of purchases) {
    const sId = p.supplierId || 'UNKNOWN';
    const sName = p.supplier ? p.supplier.name : 'Unknown Supplier';
    const company = p.supplier?.companyName || 'N/A';
    const gstin = p.supplier?.gstin || p.supplierInvoiceNumber || 'N/A';

    if (!supplierMap.has(sId)) {
      supplierMap.set(sId, {
        supplierId: sId,
        supplierName: sName,
        companyName: company,
        gstin,
        totalInvoices: 0,
        totalTaxableValue: 0,
        cgstPaid: 0,
        sgstPaid: 0,
        igstPaid: 0,
        totalInputTaxPaidITC: 0
      });
    }

    const rec = supplierMap.get(sId);
    rec.totalInvoices += 1;
    rec.totalTaxableValue += p.subtotal;
    rec.cgstPaid += p.cgstAmount;
    rec.sgstPaid += p.sgstAmount;
    rec.igstPaid += p.igstAmount;
    rec.totalInputTaxPaidITC += p.taxAmount;
  }

  const supplierSummary = Array.from(supplierMap.values()).map(s => ({
    ...s,
    totalTaxableValue: Math.round(s.totalTaxableValue * 100) / 100,
    cgstPaid: Math.round(s.cgstPaid * 100) / 100,
    sgstPaid: Math.round(s.sgstPaid * 100) / 100,
    igstPaid: Math.round(s.igstPaid * 100) / 100,
    totalInputTaxPaidITC: Math.round(s.totalInputTaxPaidITC * 100) / 100
  }));

  // 2. Customer-Wise Output Tax Breakdown
  const bills = await prisma.bill.findMany({
    where: whereBills,
    include: { customer: { select: { id: true, name: true, businessName: true, gstin: true, mobileNumber: true } } }
  });

  const customerMap = new Map();
  for (const b of bills) {
    const cId = b.customerId || 'WALKIN';
    const cName = b.businessName || b.contactPerson || (b.customer ? b.customer.name : 'Walk-in Customer');
    const gstin = b.gstin || b.customer?.gstin || 'N/A';

    if (!customerMap.has(cId)) {
      customerMap.set(cId, {
        customerId: cId,
        customerName: cName,
        gstin,
        totalBills: 0,
        totalTaxableValue: 0,
        cgstCollected: 0,
        sgstCollected: 0,
        igstCollected: 0,
        totalOutputTaxCollected: 0
      });
    }

    const rec = customerMap.get(cId);
    rec.totalBills += 1;
    rec.totalTaxableValue += b.subtotal;
    rec.cgstCollected += b.cgstAmount;
    rec.sgstCollected += b.sgstAmount;
    rec.igstCollected += b.igstAmount;
    rec.totalOutputTaxCollected += b.totalTaxAmount;
  }

  const customerSummary = Array.from(customerMap.values()).map(c => ({
    ...c,
    totalTaxableValue: Math.round(c.totalTaxableValue * 100) / 100,
    cgstCollected: Math.round(c.cgstCollected * 100) / 100,
    sgstCollected: Math.round(c.sgstCollected * 100) / 100,
    igstCollected: Math.round(c.igstCollected * 100) / 100,
    totalOutputTaxCollected: Math.round(c.totalOutputTaxCollected * 100) / 100
  }));

  const totalInputTaxAllSuppliers = supplierSummary.reduce((sum, s) => sum + s.totalInputTaxPaidITC, 0);
  const totalOutputTaxAllCustomers = customerSummary.reduce((sum, c) => sum + c.totalOutputTaxCollected, 0);

  const { page: pageInput, limit: limitInput } = filters;
  const hasPagination = Boolean(pageInput || limitInput);

  if (hasPagination) {
    const { page, limit, skip } = getPaginationParams(filters, 20);
    const paginatedSuppliers = supplierSummary.slice(skip, skip + limit);
    const paginatedCustomers = customerSummary.slice(skip, skip + limit);

    return {
      summary: {
        totalSuppliersAnalyzed: supplierSummary.length,
        totalCustomersAnalyzed: customerSummary.length,
        totalInputTaxPaidToSuppliersITC: Math.round(totalInputTaxAllSuppliers * 100) / 100,
        totalOutputTaxCollectedFromCustomers: Math.round(totalOutputTaxAllCustomers * 100) / 100,
        netTaxLiabilityGovtDues: Math.round((totalOutputTaxAllCustomers - totalInputTaxAllSuppliers) * 100) / 100
      },
      suppliersBreakdown: paginatedSuppliers,
      customersBreakdown: paginatedCustomers,
      pagination: {
        totalSuppliers: supplierSummary.length,
        totalCustomers: customerSummary.length,
        page,
        limit,
        supplierPages: Math.ceil(supplierSummary.length / limit) || 1,
        customerPages: Math.ceil(customerSummary.length / limit) || 1
      }
    };
  }

  return {
    summary: {
      totalSuppliersAnalyzed: supplierSummary.length,
      totalCustomersAnalyzed: customerSummary.length,
      totalInputTaxPaidToSuppliersITC: Math.round(totalInputTaxAllSuppliers * 100) / 100,
      totalOutputTaxCollectedFromCustomers: Math.round(totalOutputTaxAllCustomers * 100) / 100,
      netTaxLiabilityGovtDues: Math.round((totalOutputTaxAllCustomers - totalInputTaxAllSuppliers) * 100) / 100
    },
    suppliersBreakdown: supplierSummary,
    customersBreakdown: customerSummary
  };
};

/**
 * Monthly Tax Audit & Compliance Dashboard Generator
 * Reuses GSTR-1, GSTR-3B, Product Tax Summary services (Zero Duplicate Logic)
 */
export const getMonthlyTaxAuditDashboard = async (tenantId, yearInput, monthInput) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const year = parseInt(yearInput) || currentYear;
  const month = parseInt(monthInput) || currentMonth;

  if (month < 1 || month > 12) {
    throw new ApiError(400, 'Invalid month parameter. Must be between 1 and 12.');
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Reuse existing GSTR-1, GSTR-3B, Product Tax Summary services without duplicating logic
  const gstr1 = await getGstr1Report(tenantId, { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
  const gstr3b = await getGstr3bReport(tenantId, { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
  const productTaxSummary = await getProductTaxSummary(tenantId, { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

  // Discrepancy Health Checks
  const bills = await prisma.bill.findMany({
    where: { tenantId, status: { notIn: ['CANCELLED'] }, createdAt: { gte: startDate, lte: endDate } },
    include: { customer: true, items: { include: { product: true } } }
  });

  const missingGstinB2b = [];
  const missingHsnItems = [];
  const highValueB2cInterstate = [];

  for (const b of bills) {
    const isB2B = Boolean(b.gstin || (b.customer && b.customer.gstin && b.customer.gstin.trim().length >= 15));
    const customerGstin = (b.gstin || b.customer?.gstin || '').trim();

    if (isB2B && customerGstin.length < 15) {
      missingGstinB2b.push({
        invoiceNumber: b.invoiceNumber,
        customerName: b.businessName || b.customer?.name || 'N/A',
        gstin: customerGstin || 'MISSING',
        issue: 'Invalid or missing GSTIN for B2B Invoice'
      });
    }

    if (!isB2B && b.igstAmount > 0 && b.grandTotal > 250000) {
      highValueB2cInterstate.push({
        invoiceNumber: b.invoiceNumber,
        grandTotal: b.grandTotal,
        placeOfSupply: b.stateCode || 'Inter-State',
        issue: 'B2C Inter-State Invoice exceeds ₹2,50,000 threshold'
      });
    }

    for (const item of b.items) {
      const hsn = (item.product?.hsnCode || '').trim();
      if (!hsn || hsn.toUpperCase() === 'N/A') {
        missingHsnItems.push({
          invoiceNumber: b.invoiceNumber,
          productName: item.product?.name || 'Product',
          issue: 'Missing HSN Code on sold line item'
        });
      }
    }
  }

  const isAuditClean = missingGstinB2b.length === 0 && missingHsnItems.length === 0 && highValueB2cInterstate.length === 0;

  return {
    auditPeriod: {
      year,
      month,
      monthName: startDate.toLocaleString('default', { month: 'long' }),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    },
    auditStatus: {
      isClean: isAuditClean,
      totalIssuesFound: missingGstinB2b.length + missingHsnItems.length + highValueB2cInterstate.length
    },
    salesOutwardSummary: gstr1.summary,
    itcInwardSummary: gstr3b.table4_EligibleITC,
    netTaxLiabilityDues: gstr3b.netTaxPayableSummary,
    hsnTable: gstr1.tables.hsnSummaryTable,
    productTaxReconciliation: productTaxSummary.summary,
    discrepancies: {
      missingGstinB2b,
      missingHsnItems,
      highValueB2cInterstate
    }
  };
};

/**
 * CA-Ready Monthly Tax Audit Package Excel Exporter
 * Generates a comprehensive 4-Sheet CA Audit Package Workbook
 */
export const exportMonthlyTaxAuditExcel = async (tenantId, year, month, res) => {
  const auditData = await getMonthlyTaxAuditDashboard(tenantId, year, month);

  // Sheet 1: Executive Audit Summary
  const overviewColumns = [
    { header: 'Audit Category / Metric', key: 'metric', width: 38 },
    { header: 'Value / Amount (₹)', key: 'value', width: 25 },
    { header: 'Details / Audit Notes', key: 'notes', width: 45 }
  ];

  const overviewData = [
    { metric: 'Audit Period', value: `${auditData.auditPeriod.monthName} ${auditData.auditPeriod.year}`, notes: 'Monthly Audit Cycle' },
    { metric: 'Audit Status', value: auditData.auditStatus.isClean ? 'CLEAN (NO ISSUES)' : 'ISSUES DETECTED', notes: `${auditData.auditStatus.totalIssuesFound} Tax Discrepancies Found` },
    { metric: 'Total Invoices Count', value: auditData.salesOutwardSummary.totalInvoicesCount, notes: 'Outward B2B + B2C Bills' },
    { metric: 'Total Sales Taxable Value', value: auditData.salesOutwardSummary.totalTaxableValue, notes: 'Net Outward Base Amount' },
    { metric: 'Total Output Sales Tax Collected', value: auditData.salesOutwardSummary.totalOutputTaxCollected, notes: 'CGST + SGST + IGST' },
    { metric: 'Total Purchases Taxable Value', value: auditData.itcInwardSummary.purchasesTaxableValue, notes: 'Inward Base Amount' },
    { metric: 'Net Eligible Purchase ITC', value: auditData.itcInwardSummary.netEligibleItc, notes: 'Gross ITC minus Returns' },
    { metric: 'NET TAX PAYABLE TO GOVT', value: auditData.netTaxLiabilityDues.netTotalTaxPayableGovtDues, notes: 'Output Tax minus Net ITC (Cash Dues)' },
    { metric: 'EXCESS ITC CREDIT BALANCE (CARRY FORWARD)', value: auditData.netTaxLiabilityDues.excessItcCreditBalance || 0, notes: 'ITC Credit Carried Forward to Next Month' }
  ];

  // Sheet 2: GSTR-1 HSN Table 12 Breakdown
  const hsnColumns = [
    { header: 'HSN / SAC Code', key: 'hsnCode', width: 18 },
    { header: 'Description', key: 'description', width: 25 },
    { header: 'UQC', key: 'uqc', width: 12 },
    { header: 'Total Quantity', key: 'totalQuantity', width: 15 },
    { header: 'Taxable Value (₹)', key: 'taxableValue', width: 18 },
    { header: 'CGST Amount (₹)', key: 'cgst', width: 16 },
    { header: 'SGST Amount (₹)', key: 'sgst', width: 16 },
    { header: 'IGST Amount (₹)', key: 'igst', width: 16 },
    { header: 'Total Tax Amount (₹)', key: 'totalTax', width: 18 }
  ];

  const hsnData = (auditData.hsnTable || []).map(h => ({
    hsnCode: h.hsnCode,
    description: h.description,
    uqc: h.uqc,
    totalQuantity: h.totalQuantity,
    taxableValue: h.taxableValue,
    cgst: h.cgstAmount || h.cgst || 0,
    sgst: h.sgstAmount || h.sgst || 0,
    igst: h.igstAmount || h.igst || 0,
    totalTax: h.totalTaxAmount || h.totalTax || 0
  }));

  // Sheet 3: Product-Wise Tax Reconciliation Summary
  const productSummary = await getProductTaxSummary(tenantId, {
    startDate: `${auditData.auditPeriod.startDate}T00:00:00.000Z`,
    endDate: `${auditData.auditPeriod.endDate}T23:59:59.999Z`
  });

  const productColumns = [
    { header: 'Product Name', key: 'productName', width: 25 },
    { header: 'SKU', key: 'sku', width: 18 },
    { header: 'HSN Code', key: 'hsnCode', width: 15 },
    { header: 'Unit', key: 'unit', width: 12 },
    { header: 'Tax Rate (%)', key: 'taxPercent', width: 14 },
    { header: 'Purchase Qty', key: 'totalInputQty', width: 15 },
    { header: 'Purchase ITC Tax (₹)', key: 'totalInputTaxPaid', width: 20 },
    { header: 'Sales Qty', key: 'totalOutputQty', width: 15 },
    { header: 'Output Sales Tax (₹)', key: 'totalOutputTaxCollected', width: 20 },
    { header: 'Net Tax Balance (₹)', key: 'netTaxPayable', width: 20 }
  ];

  const productData = (productSummary.products || []).map(p => ({
    productName: p.productName,
    sku: p.sku,
    hsnCode: p.hsnCode,
    unit: p.unit,
    taxPercent: `${p.taxPercent}%`,
    totalInputQty: p.totalInputQty,
    totalInputTaxPaid: p.totalInputTaxPaid,
    totalOutputQty: p.totalOutputQty,
    totalOutputTaxCollected: p.totalOutputTaxCollected,
    netTaxPayable: p.netTaxPayable
  }));

  // Sheet 4: Discrepancy & Compliance Flagged Log
  const discrepancyColumns = [
    { header: 'Category / Flag', key: 'category', width: 25 },
    { header: 'Reference / Invoice', key: 'reference', width: 22 },
    { header: 'Details / Party', key: 'details', width: 30 },
    { header: 'Compliance Issue', key: 'issue', width: 45 }
  ];

  const discrepancyData = [];
  (auditData.discrepancies.missingGstinB2b || []).forEach(item => {
    discrepancyData.push({
      category: 'B2B Missing GSTIN',
      reference: item.invoiceNumber,
      details: item.customerName,
      issue: item.issue
    });
  });

  (auditData.discrepancies.missingHsnItems || []).forEach(item => {
    discrepancyData.push({
      category: 'Missing Line HSN',
      reference: item.invoiceNumber,
      details: item.productName,
      issue: item.issue
    });
  });

  (auditData.discrepancies.highValueB2cInterstate || []).forEach(item => {
    discrepancyData.push({
      category: 'High Value B2C Inter-State',
      reference: item.invoiceNumber,
      details: `Grand Total: ₹${item.grandTotal}`,
      issue: item.issue
    });
  });

  if (discrepancyData.length === 0) {
    discrepancyData.push({
      category: 'Compliance Audit',
      reference: 'N/A',
      details: 'All Invoices & Items Verified',
      issue: '100% CLEAN - No GST Discrepancies Found'
    });
  }

  const sheets = [
    { sheetName: 'Executive Audit Summary', columns: overviewColumns, data: overviewData },
    { sheetName: 'GSTR-1 HSN Table 12', columns: hsnColumns, data: hsnData },
    { sheetName: 'Product Tax Reconciliation', columns: productColumns, data: productData },
    { sheetName: 'Discrepancy Audit Log', columns: discrepancyColumns, data: discrepancyData }
  ];

  return await exportMultiSheetToExcel(res, `CA_Monthly_Tax_Audit_${auditData.auditPeriod.year}_${auditData.auditPeriod.month}`, sheets);
};



