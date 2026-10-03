import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/apiError.js';
import { getPaginationParams, formatPaginatedResult } from '../../utils/pagination.utility.js';
import { normalizeMobileNumber } from '../../utils/mobile.utility.js';
import { recordBatchStockMovements, executeWithRetry, roundQuantity } from '../../services/stockMovement.service.js';
import { calculateLineItemTaxAndTotal, resolveGstSplit, calculateDocumentTotals } from '../../utils/taxEngine.utility.js';
import { generateNextDocumentNumber } from '../../services/documentSequence.service.js';
import { findOrCreateCustomerByMobile } from '../customer/customer.service.js';
import { processDocumentTransaction } from '../../services/documentTransactionEngine.service.js';


export const generateBill = async (tenantId, userId, data) => {
  return await processDocumentTransaction({
    docType: 'SALES_BILL',
    tenantId,
    userId,
    data
  });
};


export const cancelBill = async (tenantId, userId, billId, reason = null) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Transaction Read Consistency: Fetch fresh Bill state INSIDE interactive transaction!
    const bill = await tx.bill.findFirst({
      where: { id: billId, tenantId },
      include: { items: true, customer: true }
    });

    if (!bill) throw new ApiError(404, 'Bill not found.');
    if (bill.status === 'CANCELLED') throw new ApiError(400, 'Bill is already cancelled.');

    // 2. Revert Stock for unreturned quantities via Centralized Stock Movement Service
    const restorableItems = [];
    for (const item of bill.items) {
      const itemBaseQty = (item.baseQuantity !== null && item.baseQuantity !== undefined) ? Number(item.baseQuantity) : Number(item.quantity);
      const conversionFactor = (item.conversionFactor !== null && item.conversionFactor !== undefined) ? Number(item.conversionFactor) : (itemBaseQty / (Number(item.quantity) || 1));
      const alreadyReturnedBaseQty = Number(item.returnedQuantity || 0) * conversionFactor;
      const restorableQty = Math.round(Math.max(0, itemBaseQty - alreadyReturnedBaseQty) * 10000) / 10000;

      if (restorableQty > 0) {
        restorableItems.push({
          productId: item.productId,
          baseQuantity: restorableQty
        });
      }
    }

    if (restorableItems.length > 0) {
      await recordBatchStockMovements(tx, {
        tenantId,
        userId,
        items: restorableItems,
        direction: 'IN',
        reason: 'CANCELLED_BILL',
        referenceType: 'BILL',
        referenceId: bill.id,
        notes: `Cancellation for Invoice #${bill.invoiceNumber}`
      });
    }

    // 3. Revert Customer Ledger Totals (including totalInvoices) & recalculate lastPurchaseDate
    if (bill.customerId) {
      const latestRemainingBill = await tx.bill.findFirst({
        where: { customerId: bill.customerId, id: { not: bill.id }, status: { notIn: ['CANCELLED'] } },
        orderBy: { createdAt: 'desc' }
      });
      const updatedLastPurchaseDate = latestRemainingBill ? latestRemainingBill.createdAt : null;

      await tx.customer.update({
        where: { id: bill.customerId },
        data: {
          totalInvoices: { decrement: 1 },
          totalPurchaseAmount: { decrement: bill.grandTotal },
          totalPaidAmount: { decrement: bill.paidAmount },
          totalDueAmount: { decrement: bill.dueAmount },
          lastPurchaseDate: updatedLastPurchaseDate
        }
      });
    }

    // 4. Mark Bill Status as CANCELLED (Never delete record!)
    const updatedBill = await tx.bill.update({
      where: { id: billId },
      data: {
        status: 'CANCELLED',
        paidAmount: 0,
        dueAmount: 0
      },
      include: { items: true, customer: true }
    });

    return updatedBill;
  });
};

export const processProductReturn = async (tenantId, userId, billIdInput, returnItems) => {
  if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
    throw new ApiError(400, 'At least one return item must be provided.');
  }

  const billId = billIdInput || (returnItems[0] && returnItems[0].billId ? returnItems[0].billId : null);
  if (!billId) throw new ApiError(400, 'Bill ID is required to process return.');

  // Deduplicate return items array by aggregating return quantities for identical productIds
  const aggregatedMap = new Map();
  for (const item of returnItems) {
    if (!item || !item.productId) continue;
    const qty = typeof item.returnQuantity === 'number' ? item.returnQuantity : parseFloat(item.returnQuantity);
    if (isNaN(qty) || qty <= 0) {
      throw new ApiError(400, `Invalid return quantity '${item.returnQuantity}'.`);
    }
    if (aggregatedMap.has(item.productId)) {
      const existing = aggregatedMap.get(item.productId);
      existing.returnQuantity += qty;
    } else {
      aggregatedMap.set(item.productId, {
        productId: item.productId,
        returnQuantity: qty,
        reason: item.reason || 'Customer Return'
      });
    }
  }

  const cleanReturnItems = Array.from(aggregatedMap.values());

  return await prisma.$transaction(async (tx) => {
    // 1. Transaction Read Consistency: Fetch fresh Bill state INSIDE interactive transaction!
    const bill = await tx.bill.findFirst({
      where: { id: billId, tenantId },
      include: { items: true, customer: true }
    });

    if (!bill) throw new ApiError(404, 'Bill not found.');

    // 2. Lifecycle & State Transition Checks:
    if (bill.status === 'CANCELLED') {
      throw new ApiError(400, 'Cannot process return for a cancelled bill.');
    }

    if (bill.status === 'FULLY_RETURNED') {
      throw new ApiError(400, 'All items on this invoice have already been fully returned.');
    }

    let totalReturnAmount = 0;
    let totalItemsReturnedCount = 0;
    const createdReturns = [];

    // Calculate bill-level discount factor to allocate net refund correctly
    const billDiscountFactor = bill.subtotal > 0 ? Math.max(0, (bill.subtotal - bill.discountAmount) / bill.subtotal) : 1;

    const returnStockItems = [];

    for (const ret of cleanReturnItems) {
      const billItem = bill.items.find(i => (ret.billItemId && i.id === ret.billItemId) || (ret.productId && i.productId === ret.productId));
      if (!billItem) throw new ApiError(400, `Item with ID '${ret.billItemId || ret.productId}' was not found on this invoice.`);


      // Read fresh DB returnedQuantity inside transaction for atomic real-time validation
      const dbItem = await tx.billItem.findUnique({ where: { id: billItem.id } });
      const currentReturnedQty = dbItem ? dbItem.returnedQuantity : billItem.returnedQuantity;

      const returnQty = ret.returnQuantity;
      const remainingQty = Math.max(0, billItem.quantity - currentReturnedQty);

      if (returnQty > remainingQty) {
        throw new ApiError(400, `Cannot return ${returnQty} unit(s) of product '${billItem.sku || ret.productId}'. Only ${remainingQty} unit(s) remaining for return.`);
      }

      const itemBaseQty = (billItem.baseQuantity !== null && billItem.baseQuantity !== undefined) ? Number(billItem.baseQuantity) : Number(billItem.quantity);
      const conversionFactor = (billItem.conversionFactor !== null && billItem.conversionFactor !== undefined) ? Number(billItem.conversionFactor) : (itemBaseQty / (Number(billItem.quantity) || 1));
      const restorableBaseQty = Math.round((returnQty * conversionFactor) * 10000) / 10000;

      // Net line total after bill-level discount allocation
      const itemNetSubtotal = Math.round((billItem.lineTotal - billItem.taxAmount) * billDiscountFactor * 100) / 100;
      const itemNetTax = Math.round(billItem.taxAmount * billDiscountFactor * 100) / 100;
      const netLineTotal = itemNetSubtotal + itemNetTax;

      const effectiveNetUnitPrice = billItem.quantity > 0 ? (netLineTotal / billItem.quantity) : billItem.unitPrice;
      const itemReturnAmount = Math.round((effectiveNetUnitPrice * returnQty) * 100) / 100;
      totalReturnAmount += itemReturnAmount;
      totalItemsReturnedCount += returnQty;

      // 1. Update BillItem Returned Quantity atomically
      await tx.billItem.update({
        where: { id: billItem.id },
        data: { returnedQuantity: { increment: returnQty } }
      });

      returnStockItems.push({
        productId: billItem.productId,
        baseQuantity: restorableBaseQty
      });

      // 2. Log ProductReturn Record with Tenant Scoping
      const createdReturn = await tx.billReturn.create({
        data: {
          tenantId,
          billId,
          productId: billItem.productId,
          returnQuantity: returnQty,
          returnAmount: itemReturnAmount,
          reason: ret.reason || 'Customer Return',
          processedByUserId: userId
        }
      });

      createdReturns.push(createdReturn);
    }

    // 3. Add Stock back via Centralized Stock Movement Service
    if (returnStockItems.length > 0) {
      const activeUserId = userId || bill.generatedByUserId;
      await recordBatchStockMovements(tx, {
        tenantId,
        userId: activeUserId,
        items: returnStockItems,
        direction: 'IN',
        reason: 'SALES_RETURN',
        referenceType: 'BILL_RETURN',
        referenceId: bill.id,
        notes: `Sales Return for Invoice #${bill.invoiceNumber}`
      });
    }


    // Check overall return state for Bill Status update
    const updatedItems = await tx.billItem.findMany({ where: { billId } });
    const allFullyReturned = updatedItems.every(i => i.quantity === i.returnedQuantity);

    const newBillStatus = allFullyReturned ? 'FULLY_RETURNED' : 'PARTIALLY_RETURNED';

    // Calculate proportional Paid vs Due reduction to maintain customer ledger balance
    const dueReduction = Math.round(Math.min(bill.dueAmount, totalReturnAmount) * 100) / 100;
    const paidReduction = Math.round(Math.max(0, totalReturnAmount - dueReduction) * 100) / 100;

    const newGrandTotal = Math.max(0, Math.round((bill.grandTotal - totalReturnAmount) * 100) / 100);
    const newDueAmount = Math.max(0, Math.round((bill.dueAmount - dueReduction) * 100) / 100);
    const newPaidAmount = Math.max(0, Math.round((bill.paidAmount - paidReduction) * 100) / 100);

    // Update Bill grandTotal, paidAmount, dueAmount and Status
    const updatedBill = await tx.bill.update({
      where: { id: billId },
      data: {
        status: newBillStatus,
        grandTotal: newGrandTotal,
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount
      },
      include: { items: true, returns: true, customer: true }
    });

    if (bill.customerId) {
      await tx.customer.update({
        where: { id: bill.customerId },
        data: {
          totalPurchaseAmount: { decrement: totalReturnAmount },
          totalPaidAmount: { decrement: paidReduction },
          totalDueAmount: { decrement: dueReduction }
        }
      });
    }

    return {
      bill: updatedBill,
      returns: createdReturns,
      summary: {
        totalReturnAmount,
        totalItemsReturnedCount,
        dueAmountReduced: dueReduction,
        paidAmountRefunded: paidReduction,
        status: newBillStatus
      }
    };
  });
};

export const getBillReturns = async (tenantId, filters = {}) => {
  const { billId, productId, startDate, endDate, search } = filters;
  const { page, limit, skip, take } = getPaginationParams(filters, 10);

  const where = { bill: { tenantId } };

  if (billId) where.billId = billId;
  if (productId) where.productId = productId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { bill: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
      { bill: { customer: { name: { contains: search, mode: 'insensitive' } } } },
      { reason: { contains: search, mode: 'insensitive' } }
    ];
  }

  const totalCount = await prisma.billReturn.count({ where });

  const returns = await prisma.billReturn.findMany({
    where,
    skip,
    take,
    include: {
      bill: { include: { customer: true } },
      processedBy: { select: { id: true, name: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const productIds = [...new Set(returns.map(r => r.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, unit: true }
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  const formattedReturns = returns.map(r => ({
    ...r,
    product: productMap.get(r.productId) || null
  }));

  const aggregates = await prisma.billReturn.aggregate({
    where,
    _sum: { returnAmount: true, returnQuantity: true }
  });

  const extraSummary = {
    totalReturnAmount: aggregates._sum.returnAmount || 0,
    totalItemsReturned: aggregates._sum.returnQuantity || 0
  };

  return formatPaginatedResult(formattedReturns, totalCount, page, limit, extraSummary);
};

export const getBillReturnDetails = async (tenantId, returnId) => {
  const returnItem = await prisma.billReturn.findFirst({
    where: { id: returnId, bill: { tenantId } },
    include: {
      bill: { include: { customer: true, items: { include: { product: true } } } },
      processedBy: { select: { id: true, name: true, role: true } }
    }
  });

  if (!returnItem) throw new ApiError(404, 'Bill return details not found.');

  const product = await prisma.product.findUnique({
    where: { id: returnItem.productId },
    select: { id: true, name: true, sku: true, unit: true }
  });

  return {
    ...returnItem,
    product
  };
};

export const exportBillReturns = async (tenantId, filters = {}) => {
  const { billId, productId, startDate, endDate, search } = filters;
  const where = { bill: { tenantId } };

  if (billId) where.billId = billId;
  if (productId) where.productId = productId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { bill: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
      { bill: { customer: { name: { contains: search, mode: 'insensitive' } } } },
      { reason: { contains: search, mode: 'insensitive' } }
    ];
  }

  const returns = await prisma.billReturn.findMany({
    where,
    include: {
      bill: { include: { customer: true } },
      processedBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const productIds = [...new Set(returns.map(r => r.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true }
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  return returns.map(r => {
    const prod = productMap.get(r.productId);
    return {
      returnId: r.id,
      returnDate: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
      invoiceNumber: r.bill ? r.bill.invoiceNumber : null,
      customerName: r.bill && r.bill.customer ? r.bill.customer.name : null,
      customerMobile: r.bill && r.bill.customer ? r.bill.customer.mobileNumber : null,
      productName: prod ? prod.name : null,
      sku: prod ? prod.sku : null,
      returnQuantity: r.returnQuantity,
      returnAmount: r.returnAmount,
      reason: r.reason || null,
      processedBy: r.processedBy ? r.processedBy.name : null
    };
  });
};


export const getBills = async (tenantId, filters = {}) => {
  const { status, customerId, startDate, endDate, search } = filters;
  const { page, limit, skip, take } = getPaginationParams(filters, 10);

  const where = { tenantId };

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
      { gstin: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { mobileNumber: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const totalCount = await prisma.bill.count({ where });

  const bills = await prisma.bill.findMany({
    where,
    skip,
    take,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          mobileNumber: true,
          businessName: true,
          gstin: true
        }
      },
      items: {
        select: {
          id: true,
          productId: true,
          sku: true,
          unit: true,
          quantity: true,
          baseQuantity: true,
          returnedQuantity: true,
          unitPrice: true,
          discountAmount: true,
          taxPercent: true,
          taxAmount: true,
          lineTotal: true,
          hasWarranty: true,
          warrantyPeriod: true,
          warrantyUnit: true,
          warrantyExpiryDate: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
              hasWarranty: true,
              warrantyPeriod: true,
              warrantyUnit: true
            }
          }
        }
      },
      generatedBy: { select: { id: true, name: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return formatPaginatedResult(bills, totalCount, page, limit, { bills });
};

export const getBillDetails = async (tenantId, billId) => {
  const bill = await prisma.bill.findFirst({
    where: { id: billId, tenantId },
    include: {
      tenant: {
        select: {
          id: true,
          businessName: true,
          businessLogo: true,
          businessAddress: true,
          mobileNumber: true,
          gstNumber: true,
          email: true,
          city: true,
          state: true,
          pincode: true,
          panNumber: true
        }
      },
      customer: true,
      items: { include: { product: true } },
      returns: { include: { processedBy: { select: { id: true, name: true } } } },
      generatedBy: { select: { id: true, name: true, role: true } }
    }
  });

  if (!bill) throw new ApiError(404, 'Bill not found.');
  return bill;
};

export const exportBills = async (tenantId, filters = {}) => {
  const { status, customerId, startDate, endDate, search } = filters;
  const where = { tenantId };

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setUTCHours(23, 59, 59, 999);
      }
      where.createdAt.lte = end;
    }
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
      { gstin: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { mobileNumber: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const bills = await prisma.bill.findMany({
    where,
    include: {
      customer: true,
      generatedBy: { select: { name: true } },
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return bills.map(b => ({
    invoiceNumber: b.invoiceNumber,
    customerName: b.businessName || b.contactPerson || (b.customer ? b.customer.name : null),
    customerMobile: b.customer ? b.customer.mobileNumber : null,
    gstin: b.gstin || (b.customer ? b.customer.gstin : null),
    date: b.createdAt ? b.createdAt.toISOString().split('T')[0] : '',
    subtotal: b.subtotal,
    taxAmount: b.totalTaxAmount,
    discountAmount: b.discountAmount,
    grandTotal: b.grandTotal,
    paidAmount: b.paidAmount,
    dueAmount: b.dueAmount,
    paymentMethod: b.paymentMethod,
    status: b.status,
    itemsCount: b.items.length,
    generatedBy: b.generatedBy ? b.generatedBy.name : 'Staff'
  }));
};


export const getPublicBillDetails = async (billId) => {
  if (!billId || typeof billId !== 'string') {
    throw new ApiError(404, 'Public invoice document not found.');
  }

  // Validate UUID format to prevent uncaught DB errors on malformed public links
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(billId)) {
    throw new ApiError(404, 'Public invoice document not found.');
  }

  const bill = await prisma.bill.findFirst({
    where: { id: billId },
    select: {
      id: true,
      tenantId: true,
      billType: true,
      invoiceNumber: true,
      customerId: true,
      businessName: true,
      gstin: true,
      contactPerson: true,
      shippingAddress: true,
      subtotal: true,
      totalTaxAmount: true,
      cgstAmount: true,
      sgstAmount: true,
      igstAmount: true,
      roundOff: true,
      discountType: true,
      discountValue: true,
      discountAmount: true,
      grandTotal: true,
      paidAmount: true,
      dueAmount: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
      updatedAt: true,
      tenant: {
        select: {
          id: true,
          businessName: true,
          businessLogo: true,
          businessAddress: true,
          mobileNumber: true,
          gstNumber: true,
          email: true,
          city: true,
          state: true,
          pincode: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          mobileNumber: true,
          businessName: true,
          gstin: true,
          shippingAddress: true,
          address: true,
          city: true,
          state: true,
          pincode: true
        }
      },
      items: {
        select: {
          id: true,
          productId: true,
          sku: true,
          unit: true,
          quantity: true,
          baseQuantity: true,
          returnedQuantity: true,
          unitPrice: true,
          discountAmount: true,
          taxPercent: true,
          taxAmount: true,
          lineTotal: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              hsnCode: true,
              brand: true,
              unit: true,
              description: true,
              productImage: true
            }
          }
        }
      },
      returns: {
        select: {
          id: true,
          productId: true,
          returnQuantity: true,
          returnAmount: true,
          reason: true,
          createdAt: true,
          processedBy: { select: { name: true } }
        }
      }
    },
  });

  if (!bill) throw new ApiError(404, 'Public invoice document not found.');

  return {
    ...bill,
    isCancelled: bill.status === 'CANCELLED',
    cancellationWatermark: bill.status === 'CANCELLED' ? 'CANCELLED' : null,
    isReturned: ['PARTIALLY_RETURNED', 'FULLY_RETURNED'].includes(bill.status),
    invoiceCustomerName: bill.businessName || bill.contactPerson || (bill.customer ? bill.customer.name : null),
    invoiceGstin: bill.gstin || (bill.customer ? bill.customer.gstin : null),
    invoiceShippingAddress: bill.shippingAddress || (bill.customer ? (bill.customer.shippingAddress || bill.customer.address) : null)
  };
};
