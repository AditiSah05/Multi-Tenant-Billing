import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { recordBatchStockMovements, roundQuantity } from './stockMovement.service.js';
import { calculateLineItemTaxAndTotal, resolveGstSplit, calculateDocumentTotals } from '../utils/taxEngine.utility.js';
import { generateNextDocumentNumber } from './documentSequence.service.js';
import { sanitizePaymentMethod, resolvePaymentStatus, updateSupplierBalance } from '../utils/party.utility.js';
import { calculateItemBaseUnits, enrichInvoiceMultiUnit } from '../modules/purchase/purchase.service.js';
import { findOrCreateCustomerByMobile } from '../modules/customer/customer.service.js';
import { createProduct } from '../modules/product/product.service.js';
import { isFiniteNumber, parseSafeDate } from '../utils/validation.utility.js';
import { normalizeMobileNumber } from '../utils/mobile.utility.js';

/**
 * 🚀 Universal Document Transaction Engine
 * Unified transaction handler for Commercial Documents (Purchase Invoices & Sales Bills).
 * Handles Party Resolution, Multi-Unit Math, Tax Calculation, Document Sequence, Stock Movement, and Ledger Posting.
 */
export const processDocumentTransaction = async ({
  docType,
  tenantId,
  userId,
  data
}) => {
  if (!docType || !['PURCHASE_INVOICE', 'SALES_BILL'].includes(docType)) {
    throw new ApiError(400, `Invalid document type '${docType}' passed to Document Transaction Engine.`);
  }

  const isPurchase = docType === 'PURCHASE_INVOICE';
  const isSales = docType === 'SALES_BILL';

  const enumPaymentMethod = sanitizePaymentMethod(data.paymentMethod || 'CASH');

  return await prisma.$transaction(async (tx) => {
    let party = null;
    let customer = null;
    let supplier = null;

    // --- 1. Party Resolution ---
    if (isSales) {
      const { customerMobile, customerName, billType = 'B2C' } = data;
      if (!customerMobile) throw new ApiError(400, 'Customer mobile number and at least one bill item are required.');

      let validBillType = 'B2C';
      if (billType !== undefined && billType !== null) {
        const upperType = String(billType).toUpperCase();
        if (!['B2C', 'B2B'].includes(upperType)) {
          throw new ApiError(400, "Invalid billType. Must be 'B2C' or 'B2B'.");
        }
        validBillType = upperType;
      }

      const cleanMobile = normalizeMobileNumber(customerMobile);

      const lookupResult = await findOrCreateCustomerByMobile(
        tenantId,
        cleanMobile,
        customerName || 'Cash Customer',
        {
          customerType: validBillType,
          businessName: data.businessName,
          gstin: data.gstin,
          contactPerson: data.contactPerson,
          shippingAddress: data.shippingAddress,
          panNumber: data.panNumber,
          stateCode: data.stateCode,
          creditPeriodDays: data.creditPeriodDays,
          creditLimit: data.creditLimit
        },
        tx
      );
      customer = lookupResult.customer;
      party = customer;
      data.validBillType = validBillType;
      data.cleanMobile = cleanMobile;
    } else if (isPurchase) {
      const { supplierId } = data;
      if (!supplierId) throw new ApiError(400, 'Supplier ID is required for Purchase Bill creation.');
      supplier = await tx.supplier.findFirst({ where: { id: supplierId, tenantId } });
      if (!supplier) throw new ApiError(404, 'Supplier not found.');
      party = supplier;
    }

    // --- 2. Line Items Processing & Multi-Unit Engine ---
    const rawItems = data.items;
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ApiError(400, isSales ? 'Customer mobile number and at least one bill item are required.' : 'At least one purchase item is required.');
    }

    let grossSubtotal = 0;
    let totalTaxCalculated = 0;
    let totalItemDiscountCalculated = 0;
    const preparedItems = [];
    const stockItemsForMovement = [];

    const purchaseStatus = isPurchase ? (data.purchaseStatus || 'CONFIRMED') : undefined;
    const isConfirmed = isPurchase ? purchaseStatus === 'CONFIRMED' : true;

    for (const item of rawItems) {
      let targetProductId = item.productId;

      if (isPurchase && !targetProductId && (item.newProductData || item.productData)) {
        const createdProd = await createProduct(tenantId, userId, item.newProductData || item.productData);
        targetProductId = createdProd.id;
      }

      if (!targetProductId) throw new ApiError(400, 'Product ID is required for each line item.');

      const product = await tx.product.findFirst({
        where: { id: targetProductId, tenantId, ...(isSales ? { status: 'ACTIVE' } : {}) },
        include: { tax: true }
      });

      if (!product) {
        throw new ApiError(404, isSales ? `Product with ID '${targetProductId}' not found or inactive.` : `Product not found for ID ${targetProductId}`);
      }

      if (isSales && product.expiryDate && new Date(product.expiryDate) < new Date()) {
        const expStr = new Date(product.expiryDate).toISOString().split('T')[0];
        throw new ApiError(400, `Cannot generate bill for expired product '${product.name}' (Expired on ${expStr}).`);
      }

      const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new ApiError(400, `Invalid quantity '${item.quantity}' for product '${product.name}'.`);
      }

      let price = isPurchase
        ? parseFloat(item.unitPurchasePrice)
        : (item.unitPrice !== undefined ? (typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice)) : undefined);

      const unitInfo = calculateItemBaseUnits({
        product,
        unit: item.unit || item.purchaseUnit,
        quantity: qty,
        unitPrice: price || product.sellingPrice,
        conversionFactor: item.conversionFactor
      });

      if (isSales && (price === undefined || isNaN(price))) {
        price = unitInfo.isSecondary ? (product.sellingPrice * unitInfo.conversionFactor) : product.sellingPrice;
      }

      if (!isFiniteNumber(price) || price < 0) {
        throw new ApiError(400, `Invalid unit purchase price '${item.unitPurchasePrice}' for product '${product.name}'. Price cannot be negative.`);
      }

      // Stock Sufficiency check for Sales
      if (isSales && product.currentStock < unitInfo.baseQuantity) {
        throw new ApiError(400, `Insufficient stock for product '${product.name}'. Available: ${product.currentStock} ${product.unit || 'Pcs'}, Requested: ${unitInfo.baseQuantity} ${product.unit || 'Pcs'}.`);
      }

      const itemDiscPct = parseFloat(item.discountPercent) || 0;
      let itemDisc = item.discountAmount !== undefined ? (typeof item.discountAmount === 'number' ? item.discountAmount : parseFloat(item.discountAmount)) : 0;
      if (isPurchase && itemDiscPct > 0 && !itemDisc) {
        itemDisc = (qty * price * itemDiscPct) / 100;
      }

      const lineSubtotal = Math.round((qty * price) * 100) / 100;
      if (isSales && itemDisc > lineSubtotal) {
        throw new ApiError(400, `Item discount (₹${itemDisc}) cannot exceed item subtotal (₹${lineSubtotal}) for product '${product.name}'.`);
      }

      let itemTaxPct = parseFloat(item.taxPercent) || 0;
      if (isSales && product.tax && product.tax.status === 'ACTIVE') {
        itemTaxPct = product.tax.percentage;
      }

      const calcResult = calculateLineItemTaxAndTotal({
        unitPrice: price,
        quantity: qty,
        discountAmount: itemDisc,
        taxPercent: itemTaxPct,
        taxType: product.taxType,
        taxMode: item.taxType || item.taxMode
      });

      grossSubtotal += calcResult.lineTaxable;
      totalItemDiscountCalculated += itemDisc;
      totalTaxCalculated += calcResult.taxAmount;

      const preparedItemObj = {
        productId: product.id,
        product,
        sku: product.sku,
        unit: unitInfo.purchaseUnit,
        purchaseUnit: unitInfo.purchaseUnit,
        quantity: qty,
        conversionFactor: unitInfo.conversionFactor,
        baseQuantity: unitInfo.baseQuantity,
        baseUnit: unitInfo.baseUnit,
        baseUnitPrice: unitInfo.baseUnitPrice,
        perPiecePrice: unitInfo.perPiecePrice,
        discountPercent: itemDiscPct,
        discountAmount: itemDisc,
        taxPercent: itemTaxPct,
        taxAmount: calcResult.taxAmount,
        totalAmount: calcResult.lineTotal,
        lineTotal: calcResult.lineTotal,
        hasWarranty: Boolean(product.hasWarranty),
        warrantyPeriod: product.hasWarranty ? (product.warrantyPeriod || null) : null,
        warrantyUnit: product.hasWarranty ? (product.warrantyUnit || 'MONTHS') : null,
        warrantyExpiryDate: (isSales && product.hasWarranty && product.warrantyPeriod > 0)
          ? (() => {
              const exp = new Date();
              const pVal = parseInt(product.warrantyPeriod);
              const uVal = (product.warrantyUnit || 'MONTHS').toUpperCase();
              if (uVal === 'DAYS') exp.setDate(exp.getDate() + pVal);
              else if (uVal === 'YEARS') exp.setFullYear(exp.getFullYear() + pVal);
              else exp.setMonth(exp.getMonth() + pVal);
              return exp;
            })()
          : null
      };

      if (isPurchase) {
        preparedItemObj.unitPurchasePrice = price;
        preparedItemObj.purchasePrice = price;
      } else {
        preparedItemObj.unitPrice = price;
      }

      preparedItems.push(preparedItemObj);

      stockItemsForMovement.push({
        productId: product.id,
        quantity: qty,
        unit: unitInfo.purchaseUnit,
        conversionFactor: unitInfo.conversionFactor,
        baseQuantity: unitInfo.baseQuantity,
        baseUnit: unitInfo.baseUnit,
        product
      });
    }

    grossSubtotal = Math.round(grossSubtotal * 100) / 100;
    totalTaxCalculated = Math.round(totalTaxCalculated * 100) / 100;

    // --- Document Level Discount Validation for Sales ---
    const discountType = data.discountType || 'NONE';
    const discountValue = typeof data.discountValue === 'number' ? data.discountValue : (parseFloat(data.discountValue) || 0);

    if (isSales) {
      if (discountType === 'PERCENTAGE') {
        if (discountValue < 0 || discountValue > 100) {
          throw new ApiError(400, 'Percentage discount value must be between 0 and 100%.');
        }
      } else if (discountType === 'FIXED') {
        if (discountValue < 0) {
          throw new ApiError(400, 'Fixed discount value cannot be negative.');
        }
        if (discountValue > grossSubtotal) {
          throw new ApiError(400, `Fixed discount (₹${discountValue}) cannot exceed invoice subtotal (₹${grossSubtotal}).`);
        }
      }
    }

    // --- 3. Document Totals & Tax Split ---
    const headerDiscount = parseFloat(data.discountAmount || discountValue) || 0;
    const grossDiscount = Math.round((headerDiscount + (isPurchase ? totalItemDiscountCalculated : 0)) * 100) / 100;

    const docTotals = calculateDocumentTotals({
      subtotal: grossSubtotal,
      totalTaxAmount: totalTaxCalculated,
      discountType,
      discountValue,
      discountAmount: isPurchase ? grossDiscount : undefined,
      roundOff: data.roundOff || 0,
      otherCharges: data.otherCharges || 0
    });

    const grandTotal = docTotals.grandTotal;

    // Tenant info for GST split resolution
    const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
    const targetGstin = (data.gstin || (customer ? customer.gstin : (supplier ? supplier.gstin : '')) || '').trim().toUpperCase();

    const gstSplit = resolveGstSplit({
      totalTaxAmount: totalTaxCalculated,
      igstAmountInput: data.igstAmount || 0,
      targetStateCode: data.stateCode || (customer ? customer.stateCode : undefined),
      targetGstin,
      tenantState: tenant?.state,
      tenantGstNumber: tenant?.gstNumber
    });

    // Payment Amount & Status Resolution
    let actualPaid = 0;
    let actualDue = 0;
    let paymentStatus = 'PAID';

    if (isSales) {
      const pStatus = data.paymentStatus || 'PAID';
      const paidAmountInput = data.paidAmountInput !== undefined ? data.paidAmountInput : data.paidAmount;

      if (pStatus === 'PAID') {
        actualPaid = grandTotal;
        actualDue = 0;
      } else if (pStatus === 'UNPAID') {
        actualPaid = 0;
        actualDue = grandTotal;
      } else if (pStatus === 'PARTIALLY_PAID') {
        if (paidAmountInput === undefined || paidAmountInput === null || paidAmountInput === '') {
          throw new ApiError(400, 'Paid amount (paidAmountInput) is required for PARTIALLY_PAID status.');
        }
        actualPaid = typeof paidAmountInput === 'number' ? paidAmountInput : parseFloat(paidAmountInput);
        if (isNaN(actualPaid) || actualPaid <= 0) {
          throw new ApiError(400, 'Paid amount for PARTIALLY_PAID must be greater than zero. Use UNPAID status for zero payment.');
        }
        if (actualPaid >= grandTotal) {
          throw new ApiError(400, `Paid amount for PARTIALLY_PAID cannot equal or exceed grand total (₹${grandTotal}). Use PAID status for full payment.`);
        }
        actualDue = Math.round(Math.max(0, grandTotal - actualPaid) * 100) / 100;
      }
      paymentStatus = pStatus;
    } else {
      actualPaid = parseFloat(data.paidAmount) || 0;
      if (actualPaid > grandTotal) {
        throw new ApiError(400, `Paid amount (₹${actualPaid}) cannot exceed purchase invoice total amount (₹${grandTotal}).`);
      }
      actualDue = Math.max(0, Math.round((grandTotal - actualPaid) * 100) / 100);
      paymentStatus = resolvePaymentStatus(actualPaid, actualDue);
    }

    // --- 4. Document Sequence Number Generation ---
    const docNumber = await generateNextDocumentNumber(tx, {
      tenantId,
      modelName: isPurchase ? 'purchaseInvoice' : 'bill',
      fieldName: isPurchase ? 'purchaseNumber' : 'invoiceNumber',
      prefix: isPurchase ? 'PUR' : 'INV',
      withMicroHash: isSales ? true : false,
      startNumber: 1001
    });

    // --- 5. Persist Header & Line Items ---
    let resultDocument = null;

    if (isSales) {
      resultDocument = await tx.bill.create({
        data: {
          tenantId,
          invoiceNumber: docNumber,
          customerId: customer.id,
          billType: data.validBillType,
          customerName: data.customerName || customer.name || 'Cash Customer',
          customerMobile: data.cleanMobile || customer.mobileNumber,
          businessName: data.businessName !== undefined ? data.businessName : (customer.businessName || (data.validBillType === 'B2B' ? data.customerName : null)),
          gstin: targetGstin || null,
          panNumber: data.panNumber !== undefined ? data.panNumber : (customer.panNumber || null),
          contactPerson: data.contactPerson !== undefined ? data.contactPerson : (customer.contactPerson || data.customerName || customer.name || null),
          shippingAddress: data.shippingAddress !== undefined ? data.shippingAddress : (customer.shippingAddress || customer.address || null),
          stateCode: data.stateCode || customer.stateCode || null,
          subtotal: docTotals.subtotal,
          totalTaxAmount: totalTaxCalculated,
          cgstAmount: gstSplit.cgstAmount,
          sgstAmount: gstSplit.sgstAmount,
          igstAmount: gstSplit.igstAmount,
          roundOff: docTotals.roundOff,
          discountType,
          discountValue,
          discountAmount: docTotals.discountAmount,
          grandTotal,
          paidAmount: actualPaid,
          dueAmount: actualDue,
          status: paymentStatus,
          paymentMethod: enumPaymentMethod,
          generatedByUserId: userId,
          items: {
            create: preparedItems.map(i => ({
              tenantId,
              productId: i.productId,
              sku: i.sku,
              unit: i.unit,
              conversionFactor: i.conversionFactor,
              hasSecondaryUnit: Boolean(i.product.hasSecondaryUnit),
              secondaryUnit: i.product.secondaryUnit || null,
              quantity: i.quantity,
              baseQuantity: i.baseQuantity,
              unitPrice: i.unitPrice,
              discountAmount: i.discountAmount,
              taxPercent: i.taxPercent,
              taxAmount: i.taxAmount,
              lineTotal: i.lineTotal,
              hasWarranty: i.hasWarranty,
              warrantyPeriod: i.warrantyPeriod,
              warrantyUnit: i.warrantyUnit,
              warrantyExpiryDate: i.warrantyExpiryDate
            }))
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          generatedBy: { select: { id: true, name: true, role: true } }
        }
      });
    } else {
      resultDocument = await tx.purchaseInvoice.create({
        data: {
          tenantId,
          supplierId: supplier.id,
          purchaseNumber: docNumber,
          supplierInvoiceNumber: data.supplierInvoiceNumber || null,
          invoiceDate: parseSafeDate(data.invoiceDate) || new Date(),
          dueDate: parseSafeDate(data.dueDate) || null,
          paymentTerms: data.paymentTerms || null,
          purchaseType: data.purchaseType || 'Local Purchase',
          paymentMethod: enumPaymentMethod,
          bankAccount: enumPaymentMethod === 'CASH' ? null : (data.bankAccount || null),
          referenceNumber: enumPaymentMethod === 'CASH' ? null : (data.referenceNumber || null),
          attachments: data.attachments || null,
          notes: data.notes || null,
          subtotal: docTotals.subtotal,
          taxAmount: totalTaxCalculated,
          discountAmount: grossDiscount,
          cgstAmount: gstSplit.cgstAmount,
          sgstAmount: gstSplit.sgstAmount,
          igstAmount: gstSplit.igstAmount,
          otherCharges: docTotals.otherCharges,
          roundOff: docTotals.roundOff,
          totalAmount: grandTotal,
          paidAmount: actualPaid,
          dueAmount: actualDue,
          paymentStatus,
          purchaseStatus: isConfirmed ? 'CONFIRMED' : 'DRAFT',
          items: {
            create: preparedItems.map(i => ({
              productId: i.productId,
              sku: i.sku,
              unit: i.unit,
              conversionFactor: i.conversionFactor,
              hasSecondaryUnit: Boolean(i.product.hasSecondaryUnit),
              secondaryUnit: i.product.secondaryUnit || null,
              quantity: i.quantity,
              baseQuantity: i.baseQuantity,
              unitPurchasePrice: i.unitPurchasePrice,
              baseUnitPrice: i.baseUnitPrice,
              discountPercent: i.discountPercent,
              discountAmount: i.discountAmount,
              taxPercent: i.taxPercent,
              taxAmount: i.taxAmount,
              totalAmount: i.totalAmount
            }))
          }
        },
        include: {
          supplier: true,
          items: { include: { product: true } }
        }
      });
    }

    // --- 6. Stock Movement Engine & Ledger Posting ---
    if (isSales || (isPurchase && isConfirmed)) {
      if (isPurchase) {
        for (const item of preparedItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              purchasePrice: item.perPiecePrice,
              ...(item.product.hasSecondaryUnit && item.product.secondaryUnit && item.unit === item.product.secondaryUnit ? { secondaryPurchasePrice: item.unitPurchasePrice } : {})
            }
          });
        }
      }

      await recordBatchStockMovements(tx, {
        tenantId,
        userId,
        items: stockItemsForMovement,
        direction: isSales ? 'OUT' : 'IN',
        reason: isSales ? 'SALE' : 'PURCHASE',
        referenceType: isSales ? 'BILL' : 'PURCHASE_INVOICE',
        referenceId: resultDocument.id,
        notes: `${isSales ? 'Sales Invoice' : 'Purchase Invoice'} #${docNumber}`
      });

      if (isSales) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            totalInvoices: { increment: 1 },
            totalPurchaseAmount: { increment: grandTotal },
            totalPaidAmount: { increment: actualPaid },
            totalDueAmount: { increment: actualDue },
            lastPurchaseDate: new Date()
          }
        });
      } else {
        await updateSupplierBalance(tx, supplier.id, {
          purchasesDelta: grandTotal,
          paidDelta: actualPaid,
          dueDelta: actualDue
        });

        if (actualPaid > 0) {
          await tx.supplierPayment.create({
            data: {
              tenantId,
              supplierId: supplier.id,
              purchaseInvoiceId: resultDocument.id,
              amount: actualPaid,
              paymentMethod: enumPaymentMethod,
              referenceNumber: data.referenceNumber || null,
              notes: `Initial payment for Purchase Invoice ${docNumber}`,
              createdById: userId
            }
          });
        }
      }
    }

    if (isPurchase) {
      const overstockWarnings = [];
      for (const item of preparedItems) {
        if (item.product.maxStockLevel > 0) {
          const resultingStock = item.product.currentStock + item.baseQuantity;
          if (resultingStock > item.product.maxStockLevel) {
            overstockWarnings.push({
              productId: item.productId,
              productName: item.product.name,
              currentStock: item.product.currentStock,
              purchaseQuantity: item.baseQuantity,
              resultingStock,
              maxStockLevel: item.product.maxStockLevel,
              excessQuantity: resultingStock - item.product.maxStockLevel,
              warning: `Purchase of ${item.baseQuantity} ${item.baseUnit} for '${item.product.name}' will exceed Max Stock Level (${item.product.maxStockLevel} ${item.baseUnit}). Resulting Stock: ${resultingStock} ${item.baseUnit}.`
            });
          }
        }
      }

      const enriched = enrichInvoiceMultiUnit(resultDocument);
      if (overstockWarnings.length > 0) {
        enriched.overstockWarnings = overstockWarnings;
      }
      return enriched;
    }

    return resultDocument;
  });
};
