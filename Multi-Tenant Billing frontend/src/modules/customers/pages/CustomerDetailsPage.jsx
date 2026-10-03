import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Plus,
  Printer,
  Download,
  Share2,
  Link2,
  Loader2,
  Calendar,
  CreditCard,
  AlertCircle,
  Edit3,
  Trash2,
  BookOpen,
  Receipt,
  RotateCcw,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { useCustomerDetailsQuery, useCustomersQuery, useDeleteCustomerMutation, useCustomerProductsQuery, useCustomerLedgerQuery } from '../hooks/useCustomerQueries';
import { useInvoicesQuery } from '../../bills/hooks/useBillsQueries';
import { downloadSmartBillPdf, printSmartBillPdf } from '../../bills/utils/salesBillPrintUtil';
import { useToast } from '../../../context/ToastContext';
import AddCustomerModal from '../components/AddCustomerModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Pagination from '../../../components/common/Pagination';

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'products' | 'ledger'
  const [invCurrentPage, setInvCurrentPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(10);
  const [prodCurrentPage, setProdCurrentPage] = useState(1);
  const [prodPageSize, setProdPageSize] = useState(10);
  const [ledgerCurrentPage, setLedgerCurrentPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  const { data: rawCustomerDetails, isLoading: isDetailsLoading, refetch: refetchDetails } = useCustomerDetailsQuery(id);
  const { data: rawCustomersList, refetch: refetchList } = useCustomersQuery();
  const { data: rawBills, isLoading: isBillsLoading } = useInvoicesQuery({ customerId: id, limit: 1000 });
  const { data: rawProductsRes, isLoading: isProductsLoading } = useCustomerProductsQuery(id, { limit: 100 });
  const { data: rawLedgerRes, isLoading: isLedgerLoading } = useCustomerLedgerQuery(id);
  const deleteCustomerMutation = useDeleteCustomerMutation();

  // Normalize single customer object
  const customersList = Array.isArray(rawCustomersList)
    ? rawCustomersList
    : Array.isArray(rawCustomersList?.data?.customers)
    ? rawCustomersList.data.customers
    : Array.isArray(rawCustomersList?.data)
    ? rawCustomersList.data
    : [];

  const apiCustomer = rawCustomerDetails?.data?.customer || rawCustomerDetails?.customer || rawCustomerDetails?.data || rawCustomerDetails;

  const fallbackCustomer = customersList.find((c) => String(c.id || c._id) === String(id));

  const customer = (apiCustomer && (apiCustomer.id || apiCustomer._id || apiCustomer.name))
    ? apiCustomer
    : fallbackCustomer || {};

  // Normalize Purchased Products
  const purchasedProducts = Array.isArray(rawProductsRes?.data?.products)
    ? rawProductsRes.data.products
    : Array.isArray(rawProductsRes?.products)
    ? rawProductsRes.products
    : Array.isArray(rawProductsRes?.data)
    ? rawProductsRes.data
    : Array.isArray(rawProductsRes)
    ? rawProductsRes
    : [];

  // Normalize Ledger Statement Response
  const ledgerData = rawLedgerRes?.data || rawLedgerRes || {};
  const statementSummary = ledgerData.statementSummary || {};
  const ledgerEntries = Array.isArray(ledgerData.ledgerEntries) ? ledgerData.ledgerEntries : [];

  // Normalize Bills list
  const billsList = Array.isArray(rawBills)
    ? rawBills
    : Array.isArray(rawBills?.data?.items)
    ? rawBills.data.items
    : Array.isArray(rawBills?.data?.invoices)
    ? rawBills.data.invoices
    : Array.isArray(rawBills?.data?.bills)
    ? rawBills.data.bills
    : Array.isArray(rawBills?.bills)
    ? rawBills.bills
    : [];

  // Filter bills belonging to this customer
  const cMobile = String(customer.mobileNumber || customer.mobile || customer.phone || '').trim();

  const customerBills = billsList.filter((b) => {
    const bCustId = b.customerId || b.customer_id || (typeof b.customer === 'object' ? b.customer?.id : undefined);
    if (bCustId && String(bCustId) === String(id)) return true;
    const bMobile = String(b.customerMobile || b.mobile || b.phone || (typeof b.customer === 'object' ? b.customer?.mobileNumber : '')).trim();
    return cMobile && bMobile && cMobile === bMobile;
  });

  const totalInvoices = customer.totalInvoices !== undefined ? customer.totalInvoices : customerBills.length;
  const totalPurchased = customer.totalPurchaseAmount !== undefined ? Number(customer.totalPurchaseAmount) : customerBills.reduce((acc, b) => acc + Number(b.grandTotal || b.total || b.amount || 0), 0);
  const paidAmount = customer.totalPaidAmount !== undefined ? Number(customer.totalPaidAmount) : customerBills.reduce((acc, b) => {
    const st = String(b.status || '').toUpperCase();
    const paid = b.paidAmount !== undefined ? Number(b.paidAmount) : (st === 'PAID' ? Number(b.grandTotal || b.total || 0) : 0);
    return acc + paid;
  }, 0);
  const dueAmount = customer.totalDueAmount !== undefined ? Number(customer.totalDueAmount) : customerBills.reduce((acc, b) => {
    const st = String(b.status || '').toUpperCase();
    const due = b.dueAmount !== undefined ? Number(b.dueAmount) : (b.balance !== undefined ? Number(b.balance) : (st === 'UNPAID' ? Number(b.grandTotal || b.total || 0) : 0));
    return acc + due;
  }, 0);

  const displayName = customer.name || customer.businessName || customer.customerName || 'Customer Details';
  const isB2B = customer.customerType === 'B2B' || customer.type === 'B2B' || Boolean(customer.gstin || customer.businessName);

  if (isDetailsLoading && !customer.id && !customer.name) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto mb-3" />
        Loading customer details profile...
      </div>
    );
  }

  const handleExecuteDelete = async () => {
    setDeleteConfirmModalOpen(false);
    try {
      await deleteCustomerMutation.mutateAsync(id);
      toast.success(`Customer "${displayName}" deleted.`);
      navigate('/vendor/customers');
    } catch (e) {
      toast.error('Failed to delete customer.');
    }
  };

  // Pagination calculation for invoices, purchased products, and ledger entries
  const invTotalItems = customerBills.length;
  const invTotalPages = Math.ceil(invTotalItems / invPageSize) || 1;
  const displayCustomerBills = customerBills.slice((invCurrentPage - 1) * invPageSize, invCurrentPage * invPageSize);

  const prodTotalItems = purchasedProducts.length;
  const prodTotalPages = Math.ceil(prodTotalItems / prodPageSize) || 1;
  const displayPurchasedProducts = purchasedProducts.slice((prodCurrentPage - 1) * prodPageSize, prodCurrentPage * prodPageSize);

  const ledgerTotalItems = ledgerEntries.length;
  const ledgerTotalPages = Math.ceil(ledgerTotalItems / ledgerPageSize) || 1;
  const displayLedgerEntries = ledgerEntries.slice((ledgerCurrentPage - 1) * ledgerPageSize, ledgerCurrentPage * ledgerPageSize);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Back to Previous Page"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{displayName}</h1>
              <span
                className={`px-2.5 py-0.5 font-extrabold text-[11px] rounded-full border ${
                  isB2B ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {isB2B ? 'B2B Corporate' : 'B2C Retail'}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Full client profile, contact details, tax info, and transaction history.
            </p>
          </div>
        </div>

        {/* Action Group: Primary Button + Dropdown Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`/vendor/invoices/create?customerId=${id}`)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Create Invoice for Client</span>
          </button>

          {/* More Actions (•••) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen(!actionMenuOpen)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="More Actions"
            >
              <MoreVertical size={18} />
            </button>

            {actionMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 text-xs font-bold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      setEditModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors text-slate-700 cursor-pointer"
                  >
                    <Edit3 size={15} className="text-slate-500" />
                    <span>Edit Profile</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      setDeleteConfirmModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} className="text-rose-500" />
                    <span>Delete Customer</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Customer Full Info Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-2 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-black shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{displayName}</h2>
                {customer.businessName && customer.businessName !== customer.name && (
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building2 size={14} className="text-indigo-500" />
                    <span>Business: {customer.businessName}</span>
                  </div>
                )}
                {customer.contactPerson && (
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    Contact Person: {customer.contactPerson}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">Mobile / Phone</div>
                  <div className="font-mono font-bold text-slate-900">{customer.mobileNumber || customer.mobile || customer.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">Email Address</div>
                  <div className="font-bold text-slate-900 truncate">{customer.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Building2 size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">GSTIN / Tax ID</div>
                  <div className="font-mono font-bold text-purple-700">{customer.gstin || customer.gstNo || 'Unregistered B2C'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">PAN Number</div>
                  <div className="font-mono font-bold text-slate-900">{customer.panNumber || (customer.gstin && customer.gstin.length >= 12 ? customer.gstin.slice(2, 12) : 'N/A')}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">Place of Supply / State</div>
                  <div className="font-bold text-slate-900">{customer.stateCode ? `${customer.stateCode} - ${customer.state || 'State'}` : (customer.city || customer.state || 'India')}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CreditCard size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">Credit Terms & Limit</div>
                  <div className="font-bold text-slate-900">
                    {customer.creditPeriodDays ? `${customer.creditPeriodDays} Days` : '30 Days'} | Limit: ₹{(customer.creditLimit || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {(customer.address || customer.billingAddress || customer.shippingAddress) && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-400 uppercase text-[10px] block mb-1">Billing & Shipping Address:</span>
                {customer.address || customer.billingAddress || customer.shippingAddress}
              </div>
            )}
          </div>

          {/* Right Column: Financial Highlights */}
          <div className="flex flex-col justify-between space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Account Financial Summary</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Total Purchased Amount:</span>
                <span className="text-sm font-black text-slate-900">₹{totalPurchased.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700">Total Paid Amount:</span>
                <span className="text-sm font-black text-emerald-800">₹{paidAmount.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-xs font-bold text-rose-700">Outstanding Dues:</span>
                <span className="text-sm font-black text-rose-800">₹{dueAmount.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Created on: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-extrabold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={16} />
              <span>Sales Bills & Invoices ({customerBills.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={16} className="text-purple-600" />
              <span>Purchased Items History ({purchasedProducts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={16} className="text-emerald-600" />
              <span>Account Ledger Statement ({ledgerEntries.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'invoices' ? (
          <div className="space-y-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-center">#</th>
                    <th className="px-4 py-3">Invoice No.</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Grand Total</th>
                    <th className="px-4 py-3">Paid Amount</th>
                    <th className="px-4 py-3">Due Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {isBillsLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                        <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                        Loading bills history...
                      </td>
                    </tr>
                  ) : displayCustomerBills.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-bold">
                        No sales invoices found for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    displayCustomerBills.map((bill, idx) => {
                      const itemIndex = (invCurrentPage - 1) * invPageSize + idx + 1;
                      const billNo = bill.invoiceNumber || bill.billNumber || bill.id || 'INV';
                      const isB2B = (bill.billType || bill.type || '').toUpperCase() === 'B2B' || Boolean(bill.gstin);
                      const st = String(bill.status || 'PAID').toUpperCase();
                      const grandTotal = Number(bill.grandTotal || bill.total || bill.amount || 0);
                      const bPaid = bill.paidAmount !== undefined ? Number(bill.paidAmount) : (st === 'PAID' ? grandTotal : 0);
                      const bDue = bill.dueAmount !== undefined ? Number(bill.dueAmount) : Math.max(0, grandTotal - bPaid);

                      return (
                        <tr key={bill.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-slate-400">{itemIndex}</td>
                          <td className="px-4 py-3 font-mono font-extrabold text-slate-900">{billNo}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 font-extrabold text-[10px] rounded-full border ${isB2B ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {isB2B ? 'B2B Invoice' : 'B2C Bill'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium">
                            {(bill.createdAt || bill.date || bill.invoiceDate)
                              ? new Date(bill.createdAt || bill.date || bill.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-black text-slate-900">
                            ₹{grandTotal.toLocaleString('en-IN')}.00
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            ₹{bPaid.toLocaleString('en-IN')}.00
                          </td>
                          <td className="px-4 py-3 font-bold text-rose-600">
                            ₹{bDue.toLocaleString('en-IN')}.00
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 font-extrabold text-[11px] rounded-full border ${
                              st === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : st === 'DRAFT' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {st}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    toast.info(isB2B ? 'Opening A4 Print Window...' : 'Opening Thermal Receipt Print...');
                                    await printSmartBillPdf(bill);
                                  } catch (e) {
                                    toast.error('Failed to print invoice.');
                                  }
                                }}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                                title={isB2B ? 'Print A4 Tax Invoice' : 'Print POS Receipt Slip'}
                              >
                                <Printer size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    toast.info(isB2B ? 'Downloading A4 Invoice PDF...' : 'Downloading POS Receipt PDF...');
                                    await downloadSmartBillPdf(bill);
                                    toast.success('Invoice PDF downloaded!');
                                  } catch (e) {
                                    toast.error('Failed to download PDF.');
                                  }
                                }}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                                title={isB2B ? 'Download A4 Tax Invoice PDF' : 'Download POS Receipt PDF'}
                              >
                                <Download size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={invCurrentPage}
              totalPages={invTotalPages}
              totalItems={invTotalItems}
              pageSize={invPageSize}
              onPageChange={(page) => setInvCurrentPage(page)}
              onPageSizeChange={(size) => {
                setInvPageSize(size);
                setInvCurrentPage(1);
              }}
              itemName="invoices"
            />
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-center">#</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Invoice No.</th>
                    <th className="px-4 py-3">Purchase Date</th>
                    <th className="px-4 py-3 text-center">Net Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {isProductsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                        <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
                        Loading purchased items history...
                      </td>
                    </tr>
                  ) : displayPurchasedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-bold">
                        No purchased products found for this customer.
                      </td>
                    </tr>
                  ) : (
                    displayPurchasedProducts.map((prod, idx) => {
                      const itemIndex = (prodCurrentPage - 1) * prodPageSize + idx + 1;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-slate-400">{itemIndex}</td>
                          <td className="px-4 py-3 font-extrabold text-slate-900">
                            <div>{prod.productName || prod.name || 'Purchased Product'}</div>
                            {prod.sku && prod.sku !== '-' && <div className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</div>}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                            {prod.invoiceNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium">
                            {prod.purchaseDate ? new Date(prod.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-center font-black text-slate-800">
                            {prod.quantity} {prod.unit || 'Pcs'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">
                            ₹{Number(prod.unitPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">
                            ₹{Number(prod.lineTotal || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={prodCurrentPage}
              totalPages={prodTotalPages}
              totalItems={prodTotalItems}
              pageSize={prodPageSize}
              onPageChange={(page) => setProdCurrentPage(page)}
              onPageSizeChange={(size) => {
                setProdPageSize(size);
                setProdCurrentPage(1);
              }}
              itemName="products"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ledger Statement Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Total Billed Charges</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  ₹{Number(statementSummary.totalCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
                <div className="text-[10px] font-extrabold uppercase text-emerald-600">Total Credits (Paid & Returns)</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  ₹{Number(statementSummary.totalDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">Closing Balance Dues</div>
                  <div className={`text-lg font-black mt-0.5 ${
                    (statementSummary.closingBalance || 0) > 0 
                      ? 'text-rose-600' 
                      : (statementSummary.closingBalance || 0) < 0 
                      ? 'text-emerald-600' 
                      : 'text-slate-700'
                  }`}>
                    ₹{Math.abs(statementSummary.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <span className={`px-2.5 py-1 font-black text-[10px] rounded-full uppercase border ${
                  (statementSummary.closingBalance || 0) > 0 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : (statementSummary.closingBalance || 0) < 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {(statementSummary.closingBalance || 0) > 0 ? 'Due Pending' : (statementSummary.closingBalance || 0) < 0 ? 'Advance Credit' : 'Fully Cleared'}
                </span>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-center">#</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3">Ref Invoice No.</th>
                    <th className="px-4 py-3 text-right">Invoice Total (Dr)</th>
                    <th className="px-4 py-3 text-right">Paid / Return (Cr)</th>
                    <th className="px-4 py-3 text-right">Running Balance</th>
                    <th className="px-4 py-3">Particulars / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {isLedgerLoading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                        <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                        Calculating customer ledger running balance...
                      </td>
                    </tr>
                  ) : displayLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-bold">
                        No ledger transactions recorded for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    displayLedgerEntries.map((entry, idx) => {
                      const itemIndex = (ledgerCurrentPage - 1) * ledgerPageSize + idx + 1;
                      const isBill = entry.type === 'SALES_BILL';

                      return (
                        <tr key={entry.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-slate-400">{itemIndex}</td>
                          <td className="px-4 py-3 text-slate-600 font-medium">
                            {entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 font-extrabold text-[10px] rounded-full border inline-flex items-center gap-1 ${
                              isBill 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isBill ? <Receipt size={12} /> : <RotateCcw size={12} />}
                              <span>{isBill ? 'Sales Invoice' : 'Sales Return'}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                            {entry.referenceNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                            ₹{Number(entry.credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                            ₹{Number(entry.debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-rose-600">
                            ₹{Number(entry.runningBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            {entry.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={ledgerCurrentPage}
              totalPages={ledgerTotalPages}
              totalItems={ledgerTotalItems}
              pageSize={ledgerPageSize}
              onPageChange={(page) => setLedgerCurrentPage(page)}
              onPageSizeChange={(size) => {
                setLedgerPageSize(size);
                setLedgerCurrentPage(1);
              }}
              itemName="transactions"
            />
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      <AddCustomerModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        isB2BMode={isB2B}
        customerToEdit={customer}
        onCustomerUpdated={() => {
          refetchDetails();
          refetchList();
        }}
      />

      {/* Delete Customer Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        onConfirm={handleExecuteDelete}
        title="Delete Customer Profile?"
        message={`Are you sure you want to delete customer "${displayName}"? Historical invoices will be preserved for financial auditing.`}
        confirmText="Yes, Delete Customer"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};

export default CustomerDetailsPage;
