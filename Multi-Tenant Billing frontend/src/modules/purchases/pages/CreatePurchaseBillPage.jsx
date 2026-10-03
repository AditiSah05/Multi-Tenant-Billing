import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { useSuppliersQuery, useCreateSupplierMutation } from '../../suppliers/hooks/useSuppliersQueries';
import { useProductsQuery } from '../../products/hooks/useProductsQueries';
import {
  useCreatePurchaseBillMutation,
  useUpdatePurchaseBillMutation,
  usePurchaseBillDetailsQuery,
} from '../hooks/usePurchaseQueries';
import SupplierModal from '../../suppliers/components/SupplierModal';
import { useToast } from '../../../context/ToastContext';

// Sub-components
import SupplierBillDetailsCard from '../components/SupplierBillDetailsCard';
import PurchaseItemsTable from '../components/PurchaseItemsTable';
import PurchasePaymentDetailsCard from '../components/PurchasePaymentDetailsCard';
import PurchaseBillSummaryCard from '../components/PurchaseBillSummaryCard';

const CreatePurchaseBillPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isEditMode = !!id;

  // Suppliers & Products Queries
  const { data: supplierRes } = useSuppliersQuery({ limit: 100 });
  const { data: productRes } = useProductsQuery({ limit: 100 });
  const { data: billDetailsRes } = usePurchaseBillDetailsQuery(id);

  const createSupplierMutation = useCreateSupplierMutation();
  const createBillMutation = useCreatePurchaseBillMutation();
  const updateBillMutation = useUpdatePurchaseBillMutation();

  const suppliers = Array.isArray(supplierRes?.items)
    ? supplierRes.items
    : Array.isArray(supplierRes?.data?.items)
      ? supplierRes.data.items
      : Array.isArray(supplierRes?.suppliers)
        ? supplierRes.suppliers
        : Array.isArray(supplierRes?.data?.suppliers)
          ? supplierRes.data.suppliers
          : Array.isArray(supplierRes?.data) && Array.isArray(supplierRes?.data?.items)
            ? supplierRes.data.items
            : Array.isArray(supplierRes?.data)
              ? supplierRes.data
              : [];

  const products = Array.isArray(productRes?.products)
    ? productRes.products
    : Array.isArray(productRes?.data?.products)
      ? productRes.data.products
      : Array.isArray(productRes?.data?.items)
        ? productRes.data.items
        : Array.isArray(productRes?.items)
          ? productRes.items
          : Array.isArray(productRes?.data)
            ? productRes.data
            : [];

  // Supplier & Bill State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseBillNo, setPurchaseBillNo] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('Net 10 Days');
  const [referenceNotes, setReferenceNotes] = useState('');

  // Items State
  const [items, setItems] = useState([]);

  // Payment Details State
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // Paid, Partial, Unpaid
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [bankAccount, setBankAccount] = useState('');
  const [paymentRefNo, setPaymentRefNo] = useState('');

  // Summary State
  const [otherCharges, setOtherCharges] = useState(0);
  const [notes, setNotes] = useState('');

  // Modal State
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Auto-Select First Supplier if available (ONLY when not in Edit Mode)
  useEffect(() => {
    if (!isEditMode && suppliers.length > 0 && !selectedSupplierId) {
      const first = suppliers[0];
      setSelectedSupplierId(first.id);
      setSelectedSupplier(first);
    }
  }, [suppliers, isEditMode, selectedSupplierId]);

  // Sync selectedSupplier object whenever selectedSupplierId or suppliers list changes
  useEffect(() => {
    if (selectedSupplierId && suppliers.length > 0) {
      const found = suppliers.find((s) => s.id === selectedSupplierId);
      if (found) {
        setSelectedSupplier(found);
      }
    }
  }, [selectedSupplierId, suppliers]);

  const handleRegenerateBillNo = () => {
    const newNo = `PUR-${Date.now().toString().slice(-6)}`;
    setPurchaseBillNo(newNo);
    toast.info(`Generated new Bill No: ${newNo}`);
  };

  const handleSupplierChange = (supId) => {
    setSelectedSupplierId(supId);
    const found = suppliers.find((s) => s.id === supId);
    setSelectedSupplier(found || null);
  };

  // Item Calculations
  const calculateItemAmount = (item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.purchasePrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const tax = Number(item.taxRate) || 0;
    const isInclusive = (item.taxMode || item.taxType || '').toUpperCase() === 'INCLUSIVE';

    const baseTotal = qty * price;
    const discAmount = baseTotal * (disc / 100);
    const netTotal = baseTotal - discAmount;

    if (isInclusive && tax > 0) {
      return Math.round(netTotal);
    } else {
      const taxAmount = netTotal * (tax / 100);
      return Math.round(netTotal + taxAmount);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      updated[index].amount = calculateItemAmount(updated[index]);
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        productId: '',
        name: '',
        description: '',
        sku: '',
        barcode: '',
        unit: 'Nos',
        quantity: 1,
        purchasePrice: 0,
        discountPercent: 0,
        taxRate: 0,
        taxMode: 'EXCLUSIVE',
        amount: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length <= 1) {
      toast.warning('At least one item is required.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Product from Autocomplete Search or Dropdown
  const handleSelectProduct = (product) => {
    if (!product) return;
    const isMultiUnit = Boolean(product.hasSecondaryUnit && product.secondaryUnit);
    const chosenUnit = isMultiUnit ? product.secondaryUnit : (product.unit || 'Nos');
    const pPrice = isMultiUnit && product.secondaryPurchasePrice
      ? Number(product.secondaryPurchasePrice)
      : (Number(product.purchasePrice) || Number(product.sellingPrice) || 0);

    const rawTaxType = (product.taxType || product.taxMode || '').toUpperCase();
    const isExemptOrNonGst = rawTaxType === 'EXEMPT' || rawTaxType === 'NON_GST' || rawTaxType === 'EXEMPTED';
    const tax = isExemptOrNonGst
      ? 0
      : Number(product.taxPercent ?? product.taxRate ?? product.tax?.percentage ?? 18);

    const isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE'].includes(rawTaxType) || (product.taxMode || '').toUpperCase() === 'INCLUSIVE';
    const pTaxMode = isInclusive ? 'INCLUSIVE' : 'EXCLUSIVE';
    const disc = Number(product.discountPercent) || 0;

    const newItem = {
      id: Date.now(),
      productId: product.id || product._id,
      name: product.name,
      description: product.description || product.category?.name || '',
      sku: product.sku || 'N/A',
      barcode: product.barcode || '',
      hsnCode: product.hsnCode || product.hsn || '',
      unit: chosenUnit,
      quantity: 1,
      purchasePrice: pPrice,
      discountPercent: disc,
      taxRate: tax,
      taxMode: pTaxMode,
    };
    newItem.amount = calculateItemAmount(newItem);

    setItems((prev) => {
      // If the only existing row is empty/unselected, replace it
      if (prev.length === 1 && !prev[0].productId && !prev[0].name) {
        return [newItem];
      }
      return [...prev, newItem];
    });
    setProductSearchQuery('');
    toast.success(`Added "${product.name}" (${chosenUnit}) with ${tax}% GST (${pTaxMode})!`);
  };

  // Select Product directly inside a table row
  const handleSelectProductInRow = (index, productId) => {
    const selectedProd = products.find((p) => String(p.id) === String(productId) || String(p._id) === String(productId));
    if (!selectedProd) return;

    const isMultiUnit = Boolean(selectedProd.hasSecondaryUnit && selectedProd.secondaryUnit);
    const chosenUnit = isMultiUnit ? selectedProd.secondaryUnit : (selectedProd.unit || 'Nos');
    const pPrice = isMultiUnit && selectedProd.secondaryPurchasePrice
      ? Number(selectedProd.secondaryPurchasePrice)
      : (Number(selectedProd.purchasePrice) || Number(selectedProd.sellingPrice) || 0);

    const rawTaxType = (selectedProd.taxType || selectedProd.taxMode || '').toUpperCase();
    const isExemptOrNonGst = rawTaxType === 'EXEMPT' || rawTaxType === 'NON_GST' || rawTaxType === 'EXEMPTED';
    const tax = isExemptOrNonGst
      ? 0
      : Number(selectedProd.taxPercent ?? selectedProd.taxRate ?? selectedProd.tax?.percentage ?? 18);

    const isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE'].includes(rawTaxType) || (selectedProd.taxMode || '').toUpperCase() === 'INCLUSIVE';
    const pTaxMode = isInclusive ? 'INCLUSIVE' : 'EXCLUSIVE';
    const disc = Number(selectedProd.discountPercent) || 0;

    setItems((prev) => {
      const updated = [...prev];
      const currentQty = updated[index]?.quantity || 1;
      const updatedItem = {
        ...updated[index],
        productId: selectedProd.id || selectedProd._id,
        name: selectedProd.name,
        description: selectedProd.description || selectedProd.category?.name || '',
        sku: selectedProd.sku || 'N/A',
        barcode: selectedProd.barcode || '',
        hsnCode: selectedProd.hsnCode || selectedProd.hsn || '',
        unit: chosenUnit,
        quantity: currentQty,
        purchasePrice: pPrice,
        discountPercent: disc,
        taxRate: tax,
        taxMode: pTaxMode,
      };
      updatedItem.amount = calculateItemAmount(updatedItem);
      updated[index] = updatedItem;
      return updated;
    });
  };

  const handleScanBarcode = () => {
    if (products.length > 0) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      handleSelectProduct(randomProduct);
      toast.info(`Scanned Barcode: ${randomProduct.barcode || randomProduct.sku}`);
    } else {
      toast.warning('No products available for barcode scanning.');
    }
  };

  // Summary Metrics
  let subTotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.purchasePrice) || 0;
    const discPct = Number(item.discountPercent) || 0;
    const taxPct = Number(item.taxRate) || 0;
    const isInclusive = (item.taxMode || item.taxType || '').toUpperCase() === 'INCLUSIVE';

    const gross = qty * price;
    const disc = gross * (discPct / 100);
    const net = gross - disc;

    totalDiscount += disc;

    if (isInclusive && taxPct > 0) {
      const lineTaxable = net / (1 + taxPct / 100);
      const lineTax = net - lineTaxable;
      taxableAmount += lineTaxable;
      totalTax += lineTax;
      subTotal += (lineTaxable + disc);
    } else {
      const lineTaxable = net;
      const lineTax = lineTaxable * (taxPct / 100);
      taxableAmount += lineTaxable;
      totalTax += lineTax;
      subTotal += gross;
    }
  });

  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const igst = 0;
  const charges = Number(otherCharges) || 0;
  const rawGrandTotal = taxableAmount + totalTax + charges;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));
  const totalItemsCount = items.length;
  const totalQuantityCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const outstandingAmount = Math.max(0, grandTotal - (paymentStatus === 'Unpaid' ? 0 : Number(paidAmount) || 0));

  // Load Existing Bill Data in Edit Mode
  useEffect(() => {
    if (isEditMode && billDetailsRes) {
      const b = billDetailsRes?.data?.purchaseInvoice
        || billDetailsRes?.data?.purchase
        || billDetailsRes?.data
        || billDetailsRes?.purchase
        || billDetailsRes?.bill;

      if (b) {
        if (b.supplierId || b.supplier?.id) {
          setSelectedSupplierId(b.supplierId || b.supplier?.id);
          if (b.supplier) setSelectedSupplier(b.supplier);
        }
        setPurchaseBillNo(b.purchaseNumber || `PUR-${Date.now().toString().slice(-6)}`);
        setSupplierInvoiceNo(b.supplierInvoiceNumber || '');
        const dateVal = b.invoiceDate || b.purchaseDate;
        if (dateVal) setPurchaseDate(new Date(dateVal).toISOString().split('T')[0]);
        if (b.dueDate) setDueDate(new Date(b.dueDate).toISOString().split('T')[0]);
        setPaymentTerms(b.paymentTerms || 'Net 10 Days');
        setReferenceNotes(b.notes || b.referenceNotes || '');
        setPaymentStatus(b.paymentStatus === 'PAID' ? 'Paid' : (b.paymentStatus === 'PARTIALLY_PAID' || b.paymentStatus === 'PARTIAL' ? 'Partial' : 'Unpaid'));
        setPaidAmount(b.paidAmount || 0);
        if (b.paymentMethod) {
          setPaymentMethod(b.paymentMethod === 'OTHER' ? 'Bank Transfer' : (b.paymentMethod === 'UPI' ? 'UPI' : 'Cash'));
        }
        if (b.bankAccount) setBankAccount(b.bankAccount);
        if (b.referenceNumber) setPaymentRefNo(b.referenceNumber);
        if (b.otherCharges !== undefined) setOtherCharges(Number(b.otherCharges));
        if (b.notes) setNotes(b.notes);

        if (Array.isArray(b.items) && b.items.length > 0) {
          setItems(b.items.map((i, idx) => {
            const itemTaxMode = (i.taxMode || i.taxType || i.product?.taxMode || i.product?.taxType || 'EXCLUSIVE').toUpperCase() === 'INCLUSIVE' ? 'INCLUSIVE' : 'EXCLUSIVE';
            const itemObj = {
              id: i.id || idx + 1,
              productId: i.productId || i.product?.id || `prod-${idx + 1}`,
              name: i.product?.name || i.name || 'Purchase Item',
              description: i.product?.description || i.description || '',
              sku: i.product?.sku || i.sku || 'N/A',
              barcode: i.product?.barcode || i.barcode || '-',
              hsnCode: i.product?.hsnCode || i.hsnCode || i.hsn || '-',
              unit: i.unit || 'Nos',
              quantity: Number(i.quantity) || 1,
              purchasePrice: Number(i.unitPurchasePrice || i.purchasePrice || i.price) || 0,
              discountPercent: Number(i.discountPercent) || 0,
              taxRate: Number(i.taxPercent || i.taxRate) || 18,
              taxMode: itemTaxMode,
              amount: Number(i.totalAmount || i.amount) || 0,
            };
            if (!itemObj.amount) {
              itemObj.amount = calculateItemAmount(itemObj);
            }
            return itemObj;
          }));
        }
      }
    }
  }, [isEditMode, billDetailsRes]);

  // Dynamic Sync for Paid Amount based on Payment Status
  useEffect(() => {
    if (!isEditMode) {
      if (paymentStatus === 'Paid') {
        setPaidAmount(grandTotal);
      } else if (paymentStatus === 'Unpaid') {
        setPaidAmount(0);
      }
    }
  }, [paymentStatus, grandTotal, isEditMode]);

  // Submit Handler
  const handleSavePurchaseBill = async (statusType = 'CONFIRMED') => {
    if (!selectedSupplierId) {
      toast.error('Please select a supplier.');
      return;
    }

    const payload = {
      supplierId: selectedSupplierId,
      supplierInvoiceNumber: supplierInvoiceNo || null,
      invoiceDate: purchaseDate,
      dueDate,
      paymentTerms,
      notes: referenceNotes,
      bankAccount,
      otherCharges: Number(otherCharges) || 0,
      purchaseStatus: statusType === 'DRAFT' ? 'DRAFT' : 'CONFIRMED',
      paymentStatus: paymentStatus === 'Paid' ? 'PAID' : (paymentStatus === 'Partial' ? 'PARTIAL' : 'UNPAID'),
      paidAmount: paymentStatus === 'Unpaid' ? 0 : Number(paidAmount) || 0,
      paymentMethod: paymentMethod === 'Bank Transfer' ? 'OTHER' : (paymentMethod === 'UPI' ? 'UPI' : 'CASH'),
      referenceNumber: paymentRefNo,
      items: items.map((i) => ({
        productId: i.productId || (products.length > 0 ? products[0].id : 'prod-1'),
        name: i.name || null,
        sku: i.sku || null,
        hsnCode: i.hsnCode || i.hsn || null,
        hsn: i.hsnCode || i.hsn || null,
        unit: i.unit || 'Nos',
        quantity: Number(i.quantity) || 1,
        unitPurchasePrice: Number(i.purchasePrice) || 0,
        discountPercent: Number(i.discountPercent) || 0,
        taxPercent: Number(i.taxRate) || 18,
        taxMode: i.taxMode || 'EXCLUSIVE',
        taxType: i.taxMode || 'EXCLUSIVE',
        isTaxInclusive: (i.taxMode || '').toUpperCase() === 'INCLUSIVE',
      })),
    };

    try {
      if (isEditMode) {
        await updateBillMutation.mutateAsync({ id, data: payload });
        toast.success('Purchase bill updated successfully!');
      } else {
        await createBillMutation.mutateAsync(payload);
        toast.success('Purchase bill saved successfully!');
      }
      navigate('/vendor/purchases');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save purchase bill.');
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
        <Link to="/vendor/purchases" className="hover:text-indigo-600 transition-colors">
          Purchase Bills
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">{isEditMode ? 'Edit Purchase Bill' : 'Create Purchase Bill'}</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Purchase Bill' : 'Create Purchase Bill'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {isEditMode
              ? 'Modify existing inventory purchase bill details, items, pricing, or payment status.'
              : 'Record new inventory purchase from vendor with tax and payment details.'}
          </p>
        </div>

        {/* Top Header Action Buttons */}
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
            onClick={() => handleSavePurchaseBill('DRAFT')}
            className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSavePurchaseBill('CONFIRMED')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>{isEditMode ? 'Update Purchase Bill' : 'Save & Confirm Purchase'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Supplier & Bill Details Sub-Component */}
          <SupplierBillDetailsCard
            suppliers={suppliers}
            selectedSupplierId={selectedSupplierId}
            selectedSupplier={selectedSupplier}
            onSupplierChange={handleSupplierChange}
            onOpenSupplierModal={() => setSupplierModalOpen(true)}
            purchaseBillNo={purchaseBillNo}
            onPurchaseBillNoChange={setPurchaseBillNo}
            onRegenerateBillNo={handleRegenerateBillNo}
            supplierInvoiceNo={supplierInvoiceNo}
            onSupplierInvoiceNoChange={setSupplierInvoiceNo}
            purchaseDate={purchaseDate}
            onPurchaseDateChange={setPurchaseDate}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            paymentTerms={paymentTerms}
            onPaymentTermsChange={setPaymentTerms}
            referenceNotes={referenceNotes}
            onReferenceNotesChange={setReferenceNotes}
          />

          {/* SECTION 2: Purchase Items Table Sub-Component */}
          <PurchaseItemsTable
            items={items}
            products={products}
            productSearchQuery={productSearchQuery}
            onProductSearchChange={setProductSearchQuery}
            onSelectProduct={handleSelectProduct}
            onAddItemRow={handleAddItemRow}
            onRemoveItemRow={handleRemoveItemRow}
            onItemChange={handleItemChange}
            onSelectProductInRow={handleSelectProductInRow}
            onOpenProductModal={() => navigate('/vendor/products/create')}
            onScanBarcode={handleScanBarcode}
            notes={notes}
            onNotesChange={setNotes}
            totalItemsCount={totalItemsCount}
            totalQuantityCount={totalQuantityCount}
          />
        </div>

        {/* Right Column (Sticky Payment & Bill Summary Sidebar) */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* SECTION 3: Payment Details Sub-Component */}
          <PurchasePaymentDetailsCard
            paymentStatus={paymentStatus}
            onPaymentStatusChange={setPaymentStatus}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            paymentDate={paymentDate}
            onPaymentDateChange={setPaymentDate}
            paidAmount={paidAmount}
            onPaidAmountChange={setPaidAmount}
            outstandingAmount={outstandingAmount}
            bankAccount={bankAccount}
            onBankAccountChange={setBankAccount}
            paymentRefNo={paymentRefNo}
            onPaymentRefNoChange={setPaymentRefNo}
          />

          {/* SECTION 4: Bill Summary Sub-Component */}
          <PurchaseBillSummaryCard
            subTotal={subTotal}
            totalDiscount={totalDiscount}
            taxableAmount={taxableAmount}
            cgst={cgst}
            sgst={sgst}
            igst={igst}
            otherCharges={otherCharges}
            onOtherChargesChange={setOtherCharges}
            roundOff={roundOff}
            grandTotal={grandTotal}
          />
        </div>
      </div>

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onSaveSupplier={async (supData) => {
          try {
            const res = await createSupplierMutation.mutateAsync(supData);
            const newSup = res?.data || res?.supplier || res;
            if (newSup && newSup.id) {
              setSelectedSupplierId(newSup.id);
              setSelectedSupplier(newSup);
            }
            toast.success(`Supplier "${supData.name}" created and selected!`);
            setSupplierModalOpen(false);
          } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to create supplier.');
          }
        }}
      />
    </div>
  );
};

export default CreatePurchaseBillPage;
