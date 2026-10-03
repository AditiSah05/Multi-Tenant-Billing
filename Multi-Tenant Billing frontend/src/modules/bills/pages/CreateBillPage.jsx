import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  Building2,
  User,
  ChevronRight,
  Receipt,
  Loader2,
} from 'lucide-react';
import { useCreateInvoiceMutation, useInvoiceDetailsQuery } from '../hooks/useBillsQueries';
import { useCustomersQuery } from '../../customers/hooks/useCustomerQueries';
import { useProductsQuery } from '../../products/hooks/useProductsQueries';
import { useToast } from '../../../context/ToastContext';

// Sub-components
import CustomerDetailsCard from '../../customers/components/CustomerDetailsCard';
import SalesItemsTable from '../components/SalesItemsTable';
import SalesPaymentDetailsCard from '../components/SalesPaymentDetailsCard';
import SalesBillSummaryCard from '../components/SalesBillSummaryCard';
import AddCustomerModal from '../../customers/components/AddCustomerModal';
import GeneratedBillModal from '../components/GeneratedBillModal';

const CreateBillPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();

  const { data: rawProducts } = useProductsQuery();
  const { data: rawCustomers } = useCustomersQuery({ limit: 100 });
  const { data: rawBillDetail, isLoading: isBillLoading } = useInvoiceDetailsQuery(id);
  const createInvoiceMutation = useCreateInvoiceMutation();

  const existingBill = rawBillDetail?.data?.bill || rawBillDetail?.data || rawBillDetail;

  const customersList = Array.isArray(rawCustomers)
    ? rawCustomers
    : Array.isArray(rawCustomers?.data?.customers)
    ? rawCustomers.data.customers
    : Array.isArray(rawCustomers?.customers)
    ? rawCustomers.customers
    : Array.isArray(rawCustomers?.data?.items)
    ? rawCustomers.data.items
    : Array.isArray(rawCustomers?.data?.data)
    ? rawCustomers.data.data
    : Array.isArray(rawCustomers?.data)
    ? rawCustomers.data
    : Array.isArray(rawCustomers?.items)
    ? rawCustomers.items
    : [];

  const productsList = Array.isArray(rawProducts)
    ? rawProducts
    : Array.isArray(rawProducts?.data?.items)
    ? rawProducts.data.items
    : Array.isArray(rawProducts?.data?.products)
    ? rawProducts.data.products
    : Array.isArray(rawProducts?.items)
    ? rawProducts.items
    : Array.isArray(rawProducts?.data)
    ? rawProducts.data
    : [];

  // Top Mode Switcher State: 'B2C' vs 'B2B'
  const [billType, setBillType] = useState('B2C');

  // Customer / Business State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('Cash Customer');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [isProductCatalogModalOpen, setIsProductCatalogModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  // Line Items State (Clean initial state, no mock/dummy data)
  const [items, setItems] = useState([
    {
      id: `item-${Date.now()}-1`,
      productId: '',
      name: '',
      hsnCode: '',
      qty: 1,
      rate: 0,
      discount: 0,
      gst: 18,
      taxMode: 'INCLUSIVE',
    },
  ]);

  // Payment State
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const [roundOff, setRoundOff] = useState(0);

  // Post Generation Modal State
  const [generatedBillModal, setGeneratedBillModal] = useState(null);

  // Populate Draft Data when editing an existing bill
  useEffect(() => {
    if (id && existingBill && (existingBill.id || existingBill._id || existingBill.invoiceNumber)) {
      setBillType(existingBill.billType || 'B2C');
      setSelectedCustomerId(existingBill.customerId || existingBill.customer?.id || '');
      const cName =
        typeof existingBill.customer === 'string'
          ? existingBill.customer
          : existingBill.customer?.name || existingBill.customerName || 'Cash Customer';
      setCustomerName(cName);
      setCustomerSearchQuery(cName);
      setBusinessName(existingBill.businessName || existingBill.customer?.businessName || '');
      setGstin(existingBill.gstin || existingBill.customer?.gstin || '');
      setContactPerson(existingBill.contactPerson || existingBill.customer?.contactPerson || '');
      setMobile(existingBill.mobile || existingBill.customerMobile || existingBill.phone || '');
      setBillingAddress(existingBill.billingAddress || '');
      setShippingAddress(existingBill.shippingAddress || existingBill.billingAddress || '');
      setPaymentMode(existingBill.paymentMode || 'CASH');
      setAmountReceived(existingBill.amountReceived !== undefined ? existingBill.amountReceived : (existingBill.paidAmount || ''));
      setRoundOff(existingBill.roundOff || 0);

      if (Array.isArray(existingBill.items) && existingBill.items.length > 0) {
        setItems(
          existingBill.items.map((i, idx) => ({
            id: i.id || `item-draft-${idx}-${Date.now()}`,
            productId: i.productId || i.product?._id || i.product?.id || '',
            name: i.name || i.productName || 'Sales Item',
            sku: i.sku || i.product?.sku || '',
            hsnCode: i.hsnCode || i.hsn || '1234',
            qty: Number(i.quantity ?? i.qty ?? 1),
            unit: i.unit || 'Pcs',
            rate: Number(i.rate ?? i.unitPrice ?? i.price ?? 0),
            discount: Number(i.discountAmount ?? i.discount ?? 0),
            gst: Number(i.taxPercent ?? i.gst ?? 18),
            taxMode: i.taxMode || 'INCLUSIVE',
          }))
        );
      }
    }
  }, [id, existingBill]);

  // Auto Select Customer Details from Dropdown
  const handleSelectCustomer = (cust) => {
    if (!cust) return;
    setSelectedCustomerId(cust.id || cust._id || '');
    const cName = cust.name || cust.customerName || cust.businessName || cust.contactPerson || 'Customer';
    const bName = cust.businessName || cust.company || cust.name || '';
    const cPerson = cust.contactPerson || cust.name || cust.customerName || '';
    const mob = cust.mobileNumber || cust.mobile || cust.phone || cust.contactNumber || '';
    const gst = cust.gstin || cust.gstNo || cust.gstNumber || '';
    const bAddr = cust.billingAddress || cust.address || '';
    const sAddr = cust.shippingAddress || cust.billingAddress || cust.address || '';

    const isB2BCust = cust.type === 'B2B' || cust.customerType === 'B2B' || Boolean(cust.gstin || cust.businessName);

    if (isB2BCust) {
      setBillType('B2B');
      setBusinessName(bName || cName);
      setCustomerName(cName);
      setGstin(gst);
      setContactPerson(cPerson);
      setMobile(mob);
      setBillingAddress(bAddr);
      setShippingAddress(sAddr);
    } else {
      setCustomerName(cName);
      setMobile(mob);
      setBillingAddress(bAddr);
    }
    setCustomerDropdownOpen(false);
    setCustomerSearchQuery(cName);
    toast.success(`Selected customer "${cName}"`);
  };

  const handleAddNewCustomerAdded = (newCust) => {
    handleSelectCustomer(newCust);
  };

  // Add Empty Product Row
  const handleAddProductRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: '',
        name: '',
        hsnCode: '1234',
        qty: 1,
        rate: 0,
        discount: 0,
        gst: 18,
        taxMode: 'INCLUSIVE',
      },
    ]);
  };

  const handleSelectProductFromSearch = (matchedProd) => {
    if (!matchedProd) return;
    const pId = matchedProd.id || matchedProd._id;

    // Check if an empty product row already exists
    const emptyRowIndex = items.findIndex((i) => !i.productId && !i.name);

    const rawTaxType = String(matchedProd.taxType || '').toUpperCase();
    const rawTaxMode = String(matchedProd.taxMode || '').toUpperCase();
    const isExemptOrNonGst = rawTaxType === 'EXEMPT' || rawTaxType === 'NON_GST' || rawTaxType === 'EXEMPTED';

    let isInclusive = false;
    if (matchedProd.isTaxInclusive !== undefined && matchedProd.isTaxInclusive !== null) {
      isInclusive = Boolean(matchedProd.isTaxInclusive);
    } else if (rawTaxMode) {
      isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE', 'INCL'].includes(rawTaxMode);
    } else if (rawTaxType) {
      isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE', 'INCL'].includes(rawTaxType);
    }

    const gstRate = isExemptOrNonGst
      ? 0
      : Number(matchedProd.taxPercent ?? matchedProd.taxRate ?? matchedProd.tax?.percentage ?? 18);

    const pUnit = matchedProd.unit || 'Pcs';
    const sUnit = matchedProd.secondaryUnit || '';
    const hasSec = Boolean(matchedProd.hasSecondaryUnit && sUnit);
    const factor = Number(matchedProd.conversionFactor) || 1;
    const pSellingPrice = Number(matchedProd.sellingPrice || matchedProd.price || 0);
    const sSellingPrice = matchedProd.secondarySellingPrice ? Number(matchedProd.secondarySellingPrice) : (pSellingPrice * factor);

    const newItemData = {
      productId: pId,
      name: matchedProd.name,
      sku: matchedProd.sku || '',
      primaryUnit: pUnit,
      secondaryUnit: sUnit,
      hasSecondaryUnit: hasSec,
      conversionFactor: factor,
      primarySellingPrice: pSellingPrice,
      secondarySellingPrice: sSellingPrice,
      unit: pUnit,
      qty: 1,
      rate: pSellingPrice,
      discount: 0,
      hsnCode: matchedProd.hsnCode || matchedProd.hsn || '1234',
      gst: gstRate,
      taxMode: isInclusive ? 'INCLUSIVE' : 'EXCLUSIVE',
    };

    if (emptyRowIndex !== -1) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === emptyRowIndex ? { ...item, ...newItemData } : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          ...newItemData,
        },
      ]);
    }
  };

  const handleUpdateItem = (id, field, val) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'productId') {
            const matchedProd = productsList.find((p) => String(p.id || p._id) === String(val));
            if (matchedProd) {
              const rawTaxType = String(matchedProd.taxType || '').toUpperCase();
              const rawTaxMode = String(matchedProd.taxMode || '').toUpperCase();
              const isExemptOrNonGst = rawTaxType === 'EXEMPT' || rawTaxType === 'NON_GST' || rawTaxType === 'EXEMPTED';

              let isInclusive = false;
              if (matchedProd.isTaxInclusive !== undefined && matchedProd.isTaxInclusive !== null) {
                isInclusive = Boolean(matchedProd.isTaxInclusive);
              } else if (rawTaxMode) {
                isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE', 'INCL'].includes(rawTaxMode);
              } else if (rawTaxType) {
                isInclusive = ['INCLUSIVE', 'GST_INCLUSIVE', 'INCL'].includes(rawTaxType);
              }

              const gstRate = isExemptOrNonGst
                ? 0
                : Number(matchedProd.taxPercent ?? matchedProd.taxRate ?? matchedProd.tax?.percentage ?? 18);

              const pUnit = matchedProd.unit || 'Pcs';
              const sUnit = matchedProd.secondaryUnit || '';
              const hasSec = Boolean(matchedProd.hasSecondaryUnit && sUnit);
              const factor = Number(matchedProd.conversionFactor) || 1;
              const pSellingPrice = Number(matchedProd.sellingPrice || matchedProd.price || 0);
              const sSellingPrice = matchedProd.secondarySellingPrice ? Number(matchedProd.secondarySellingPrice) : (pSellingPrice * factor);

              updated.name = matchedProd.name;
              updated.sku = matchedProd.sku || '';
              updated.primaryUnit = pUnit;
              updated.secondaryUnit = sUnit;
              updated.hasSecondaryUnit = hasSec;
              updated.conversionFactor = factor;
              updated.primarySellingPrice = pSellingPrice;
              updated.secondarySellingPrice = sSellingPrice;
              updated.unit = pUnit;
              updated.rate = pSellingPrice;
              updated.hsnCode = matchedProd.hsnCode || matchedProd.hsn || '1234';
              updated.gst = gstRate;
              updated.taxMode = isInclusive ? 'INCLUSIVE' : 'EXCLUSIVE';
            }
          }

          if (field === 'unit') {
            const isSecondary = updated.hasSecondaryUnit && updated.secondaryUnit && (String(val).trim().toUpperCase() === String(updated.secondaryUnit).trim().toUpperCase());
            if (isSecondary) {
              updated.rate = updated.secondarySellingPrice || (updated.primarySellingPrice * (updated.conversionFactor || 1));
            } else {
              updated.rate = updated.primarySellingPrice || updated.rate;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      toast.info('At least 1 item is required.');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  let rawSubtotal = 0;
  let rawTotalDiscount = 0;
  let rawTaxableAmount = 0;
  let rawTotalGst = 0;

  items.forEach((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const disc = Number(item.discount) || 0;
    const gstRate = Number(item.gst) || 0;
    const isInclusive = (item.taxMode || 'INCLUSIVE').toUpperCase() === 'INCLUSIVE';

    const gross = qty * rate;
    const net = Math.max(0, gross - disc);

    let lineTaxable = net;
    let lineTax = 0;

    if (isInclusive && gstRate > 0) {
      lineTaxable = net / (1 + gstRate / 100);
      lineTax = net - lineTaxable;
      rawSubtotal += gross;
    } else {
      lineTaxable = net;
      lineTax = net * (gstRate / 100);
      rawSubtotal += gross;
    }

    rawTotalDiscount += disc;
    rawTaxableAmount += lineTaxable;
    rawTotalGst += lineTax;
  });

  const grandTotalExact = rawTaxableAmount + rawTotalGst + Number(roundOff);
  const grandTotal = Math.max(0, Math.round(grandTotalExact));

  const numReceived = amountReceived !== '' ? Number(amountReceived) : grandTotal;
  const balanceDue = Math.max(0, grandTotal - numReceived);

  // Submit / Generate Invoice Action
  const handleSaveBill = async (statusType = 'PAID') => {
    if (items.length === 0 || !items.some((i) => i.name.trim())) {
      toast.error('Please add at least 1 product to the bill.');
      return;
    }

    const isB2B = billType === 'B2B';
    const invoiceNo = existingBill?.invoiceNumber || existingBill?.billNumber || `INV-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      id: id || existingBill?.id || `inv-${Date.now()}`,
      invoiceNumber: invoiceNo,
      billNumber: invoiceNo,
      billType,
      isDraft: statusType === 'DRAFT',
      skipInventoryUpdate: statusType === 'DRAFT',
      affectStock: statusType !== 'DRAFT',
      customerMobile: mobile || '9876543210',
      customerName: isB2B ? (customerName || contactPerson || businessName || 'Business Client') : (customerName || 'Cash Customer'),
      customer: isB2B ? (businessName || 'Business Customer') : (customerName || 'Cash Customer'),
      businessName: isB2B ? businessName : '',
      gstin: isB2B ? gstin : '',
      contactPerson: isB2B ? contactPerson : '',
      mobile: mobile || '9876543210',
      phone: mobile || '9876543210',
      billingAddress,
      shippingAddress: isB2B ? (shippingAddress || billingAddress) : billingAddress,
      items: items.map((i) => {
        const qtyNum = Number(i.qty) || 1;
        const isSecondary = i.hasSecondaryUnit && i.secondaryUnit && (String(i.unit || '').trim().toUpperCase() === String(i.secondaryUnit).trim().toUpperCase());
        const factor = isSecondary ? (Number(i.conversionFactor) || 1) : 1;
        const baseQty = Math.round((qtyNum * factor) * 10000) / 10000;

        return {
          productId: i.productId || (productsList.length > 0 ? productsList[0].id : undefined),
          sku: i.sku || undefined,
          name: i.name || 'Sales Item',
          quantity: qtyNum,
          qty: qtyNum,
          unit: i.unit || 'Pcs',
          conversionFactor: factor,
          baseQuantity: baseQty,
          rate: Number(i.rate) || 0,
          unitPrice: Number(i.rate) || 0,
          discountAmount: Number(i.discount) || 0,
          discount: Number(i.discount) || 0,
          taxPercent: Number(i.gst) || 0,
          gst: Number(i.gst) || 0,
          taxRate: Number(i.gst) || 0,
          taxMode: i.taxMode || 'EXCLUSIVE',
          taxType: i.taxMode || 'EXCLUSIVE',
          isTaxInclusive: (i.taxMode || '').toUpperCase() === 'INCLUSIVE',
        };
      }),
      subtotal: Math.round(rawSubtotal),
      discountAmount: Math.round(rawTotalDiscount),
      taxableAmount: Math.round(rawTaxableAmount),
      totalGst: Math.round(rawTotalGst),
      cgstAmount: Math.round(rawTotalGst / 2),
      sgstAmount: Math.round(rawTotalGst / 2),
      igstAmount: 0,
      grandTotal,
      total: grandTotal,
      paidAmount: statusType === 'DRAFT' ? 0 : Math.min(grandTotal, numReceived),
      paidAmountInput: statusType === 'DRAFT' ? 0 : Math.min(grandTotal, numReceived),
      amountReceived: statusType === 'DRAFT' ? 0 : numReceived,
      dueAmount: statusType === 'DRAFT' ? grandTotal : balanceDue,
      balance: statusType === 'DRAFT' ? grandTotal : balanceDue,
      paymentMode,
      paymentMethod: paymentMode === 'BANK_TRANSFER' ? 'OTHER' : (paymentMode === 'UPI' ? 'UPI' : (paymentMode === 'CARD' ? 'CARD' : 'CASH')),
      paymentStatus: statusType === 'DRAFT' ? 'DRAFT' : (balanceDue === 0 ? 'PAID' : (numReceived > 0 ? 'PARTIALLY_PAID' : 'UNPAID')),
      roundOff,
      status: statusType === 'DRAFT' ? 'DRAFT' : (balanceDue === 0 ? 'PAID' : (numReceived > 0 ? 'PARTIALLY_PAID' : 'UNPAID')),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };

    try {
      await createInvoiceMutation.mutateAsync(payload);
      if (statusType === 'DRAFT') {
        toast.success('Draft Bill Saved Successfully!');
        setGeneratedBillModal(null);
        navigate('/vendor/invoices');
      } else {
        toast.success(`Bill #${invoiceNo} Generated Successfully!`);
        setGeneratedBillModal(payload);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save bill. Please try again.');
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 pb-20 animate-fadeIn font-sans">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link to="/vendor/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <Link to="/vendor/invoices" className="hover:text-indigo-600">Invoices</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 font-extrabold">Create New Bill</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="text-indigo-600" size={28} />
            Create Sales Invoice
          </h1>
        </div>

        {/* Top Segmented Bill Type Selector (B2C vs B2B) */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-300/80 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setBillType('B2C');
              if (customerName === '') setCustomerName('Cash Customer');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              billType === 'B2C'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={15} />
            <span>B2C Bill (Consumer)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBillType('B2B');
              if (customerName === 'Cash Customer') setCustomerName('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              billType === 'B2B'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={15} />
            <span>B2B Bill (Tax Invoice)</span>
          </button>
        </div>
      </div>

      {/* Enterprise 2-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Customer Details & Scrollable Products Table) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <CustomerDetailsCard
            billType={billType}
            customersList={customersList}
            customerSearchQuery={customerSearchQuery}
            onCustomerSearchChange={setCustomerSearchQuery}
            customerDropdownOpen={customerDropdownOpen}
            onCustomerDropdownOpenChange={setCustomerDropdownOpen}
            onSelectCustomer={handleSelectCustomer}
            onOpenAddCustomerModal={() => setAddCustomerModalOpen(true)}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            mobile={mobile}
            onMobileChange={setMobile}
            billingAddress={billingAddress}
            onBillingAddressChange={setBillingAddress}
            businessName={businessName}
            onBusinessNameChange={setBusinessName}
            gstin={gstin}
            onGstinChange={setGstin}
            contactPerson={contactPerson}
            onContactPersonChange={setContactPerson}
            shippingAddress={shippingAddress}
            onShippingAddressChange={setShippingAddress}
          />

          <SalesItemsTable
            billType={billType}
            items={items}
            productsList={productsList}
            onAddProductRow={handleAddProductRow}
            onSelectProduct={handleSelectProductFromSearch}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {/* Right Column (Sticky Payment Mode & Bill Financial Summary Sidebar) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6">
          <SalesPaymentDetailsCard
            billType={billType}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            amountReceived={amountReceived}
            onAmountReceivedChange={setAmountReceived}
            grandTotal={grandTotal}
            balanceDue={balanceDue}
            onSaveDraft={() => handleSaveBill('DRAFT')}
            onGenerateBill={() => handleSaveBill('PAID')}
          />

          <SalesBillSummaryCard
            billType={billType}
            rawSubtotal={rawSubtotal}
            rawTotalDiscount={rawTotalDiscount}
            rawTaxableAmount={rawTaxableAmount}
            rawTotalGst={rawTotalGst}
            grandTotal={grandTotal}
          />
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={addCustomerModalOpen}
        onClose={() => setAddCustomerModalOpen(false)}
        isB2BMode={billType === 'B2B'}
        onCustomerAdded={handleAddNewCustomerAdded}
      />

      {/* Post Generation Action Modal */}
      <GeneratedBillModal
        generatedBillModal={generatedBillModal}
        onClose={() => setGeneratedBillModal(null)}
        toast={toast}
      />
    </div>
  );
};

export default CreateBillPage;
