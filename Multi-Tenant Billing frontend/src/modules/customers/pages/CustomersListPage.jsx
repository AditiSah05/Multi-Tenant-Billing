import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  Phone,
  Mail,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  FileText,
  DollarSign,
  Download,
  RefreshCw
} from 'lucide-react';
import { useCustomersQuery, useDeleteCustomerMutation } from '../hooks/useCustomerQueries';
import { useInvoicesQuery } from '../../bills/hooks/useBillsQueries';
import AddCustomerModal from '../components/AddCustomerModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Pagination from '../../../components/common/Pagination';
import { useToast } from '../../../context/ToastContext';
import customerService from '../../../services/customerService';

const CustomersListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | B2B | B2C | HAS_DUES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isB2BMode, setIsB2BMode] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  // TanStack Query for customers & sales bills
  const { data: rawCustomers, isLoading: isCustLoading, isRefetching, refetch } = useCustomersQuery({ limit: 1000 });
  const { data: rawBills } = useInvoicesQuery();
  const deleteCustomerMutation = useDeleteCustomerMutation();

  const handleRefreshCustomers = async () => {
    try {
      await refetch();
      toast.success('Customers directory refreshed!');
    } catch (err) {
      toast.error('Failed to refresh customers directory.');
    }
  };

  // Normalize Customers list
  const customersList = Array.isArray(rawCustomers)
    ? rawCustomers
    : Array.isArray(rawCustomers?.data?.customers)
    ? rawCustomers.data.customers
    : Array.isArray(rawCustomers?.customers)
    ? rawCustomers.customers
    : Array.isArray(rawCustomers?.data)
    ? rawCustomers.data
    : [];

  // Normalize Bills list to calculate customer-wise sales and dues if missing
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

  // Map bills metrics onto customers if backend aggregate is empty
  const customersWithMetrics = customersList.map((c) => {
    const cid = c.id || c._id;
    const cMobile = String(c.mobileNumber || c.mobile || c.phone || '').trim();

    const matchingBills = billsList.filter((b) => {
      const bCustId = b.customerId || b.customer_id || (typeof b.customer === 'object' ? b.customer?.id : undefined);
      if (bCustId && String(bCustId) === String(cid)) return true;
      const bMobile = String(b.customerMobile || b.mobile || b.phone || (typeof b.customer === 'object' ? b.customer?.mobileNumber : '')).trim();
      return cMobile && bMobile && cMobile === bMobile;
    });

    const calcInvoices = matchingBills.length;
    const calcPurchased = matchingBills.reduce((acc, b) => acc + Number(b.grandTotal || b.total || b.amount || 0), 0);
    const calcDues = matchingBills.reduce((acc, b) => {
      const st = String(b.status || '').toUpperCase();
      const due = b.dueAmount !== undefined ? Number(b.dueAmount) : (st === 'UNPAID' ? Number(b.grandTotal || b.total || 0) : 0);
      return acc + due;
    }, 0);

    return {
      ...c,
      displayInvoices: c.totalInvoices !== undefined ? c.totalInvoices : calcInvoices,
      displayPurchased: c.totalPurchaseAmount !== undefined ? Number(c.totalPurchaseAmount) : calcPurchased,
      displayDues: c.totalDueAmount !== undefined ? Number(c.totalDueAmount) : calcDues,
    };
  });

  // Filter customers
  const filteredCustomers = customersWithMetrics.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    const nameStr = `${c.name || ''} ${c.customerName || ''} ${c.businessName || ''} ${c.contactPerson || ''}`.toLowerCase();
    const mobileStr = String(c.mobileNumber || c.mobile || c.phone || '');
    const gstinStr = String(c.gstin || c.gstNo || '').toLowerCase();
    const emailStr = String(c.email || '').toLowerCase();

    if (q && !nameStr.includes(q) && !mobileStr.includes(q) && !gstinStr.includes(q) && !emailStr.includes(q)) {
      return false;
    }

    const isB2B = c.customerType === 'B2B' || c.type === 'B2B' || Boolean(c.gstin || c.businessName);

    if (typeFilter === 'B2B' && !isB2B) return false;
    if (typeFilter === 'B2C' && isB2B) return false;
    if (typeFilter === 'HAS_DUES' && c.displayDues <= 0) return false;

    return true;
  });

  // KPI summary
  const totalCustomers = customersWithMetrics.length;
  const b2bCount = customersWithMetrics.filter((c) => c.customerType === 'B2B' || c.type === 'B2B' || Boolean(c.gstin || c.businessName)).length;
  const totalPurchasedSum = customersWithMetrics.reduce((acc, c) => acc + c.displayPurchased, 0);
  const totalDuesSum = customersWithMetrics.reduce((acc, c) => acc + c.displayDues, 0);

  // Pagination calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const displayCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const triggerDeleteCustomer = (c) => {
    setCustomerToDelete(c);
    setDeleteConfirmModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!customerToDelete) return;
    setDeleteConfirmModalOpen(false);
    const cid = customerToDelete.id || customerToDelete._id;
    const name = customerToDelete.name || customerToDelete.businessName || 'Customer';
    try {
      await deleteCustomerMutation.mutateAsync(cid);
      toast.success(`Customer "${name}" deleted.`);
      refetch();
    } catch (e) {
      toast.error('Failed to delete customer.');
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info('Exporting customers list...');
      await customerService.exportCustomers({ format: 'csv', search: searchQuery });
      toast.success('Customers list exported to CSV!');
    } catch (e) {
      toast.error('Failed to export customers list.');
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.info('Exporting customers list to Excel...');
      await customerService.exportCustomers({ format: 'excel', search: searchQuery });
      toast.success('Customers list exported to Excel!');
    } catch (e) {
      toast.error('Failed to export customers list to Excel.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="text-indigo-600" size={28} /> Customer Directory
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Manage your retail (B2C) & corporate (B2B) clients, purchase history, and outstanding dues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefreshCustomers}
            disabled={isRefetching}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
          >
            <RefreshCw size={16} className={isRefetching ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomerToEdit(null);
              setIsB2BMode(false);
              setAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title="Export Customer Directory Report"
          >
            <Download size={16} className="text-indigo-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Customers</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCustomers}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">B2B Corporate Clients</div>
            <div className="text-2xl font-black text-purple-900 mt-0.5">{b2bCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Purchased Sales</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">₹{totalPurchasedSum.toLocaleString('en-IN')}.00</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Outstanding Dues</div>
            <div className="text-2xl font-black text-rose-900 mt-0.5">₹{totalDuesSum.toLocaleString('en-IN')}.00</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, mobile, GSTIN, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Clients' },
            { id: 'B2C', label: 'Retail (B2C)' },
            { id: 'B2B', label: 'Corporate (B2B)' },
            { id: 'HAS_DUES', label: 'Has Pending Dues' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setTypeFilter(f.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                typeFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm overflow-hidden space-y-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-center">#</th>
                <th className="px-4 py-3">Customer / Business Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">GSTIN / City</th>
                <th className="px-4 py-3 text-center">Invoices</th>
                <th className="px-4 py-3">Total Purchased</th>
                <th className="px-4 py-3">Pending Dues</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {isCustLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    Loading customer records...
                  </td>
                </tr>
              ) : displayCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-bold">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayCustomers.map((cust, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const custId = cust.id || cust._id || idx;
                  const displayName = cust.name || cust.businessName || cust.customerName || 'Customer';
                  const displaySub = cust.businessName && cust.name !== cust.businessName ? cust.name : (cust.contactPerson || '');
                  const isB2B = cust.customerType === 'B2B' || cust.type === 'B2B' || Boolean(cust.gstin || cust.businessName);
                  const mobile = cust.mobileNumber || cust.mobile || cust.phone || '-';
                  const email = cust.email || '-';
                  const gstin = cust.gstin || cust.gstNo || '-';
                  const location = cust.city || cust.state || cust.address || '-';

                  return (
                    <tr key={custId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{itemIndex}</td>

                      <td className="px-4 py-3">
                        <div
                          onClick={() => navigate(`/vendor/customers/${custId}`)}
                          className="font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer text-sm"
                        >
                          {displayName}
                        </div>
                        {displaySub && <div className="text-[11px] text-slate-500 font-medium">{displaySub}</div>}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-full border ${
                            isB2B ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {isB2B ? 'B2B Corporate' : 'B2C Retail'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <Phone size={13} className="text-slate-400" />
                          <span>{mobile}</span>
                        </div>
                        {email !== '-' && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <Mail size={12} className="text-slate-400" />
                            <span>{email}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-700 text-[11px]">{gstin}</div>
                        <div className="text-[11px] text-slate-400">{location}</div>
                      </td>

                      <td className="px-4 py-3 text-center font-black text-slate-900">
                        {cust.displayInvoices}
                      </td>

                      <td className="px-4 py-3 font-black text-emerald-700 text-sm">
                        ₹{cust.displayPurchased.toLocaleString('en-IN')}.00
                      </td>

                      <td className="px-4 py-3 font-black text-sm">
                        {cust.displayDues > 0 ? (
                          <span className="text-rose-600">₹{cust.displayDues.toLocaleString('en-IN')}.00</span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/vendor/customers/${custId}`)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                            title="View Full Profile & Invoices"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCustomerToEdit(cust);
                              setIsB2BMode(isB2B);
                              setAddModalOpen(true);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                            title="Edit Customer Details"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => triggerDeleteCustomer(cust)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                            title="Delete Customer Record"
                          >
                            <Trash2 size={15} />
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

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="customers"
        />
      </div>

      {/* Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setCustomerToEdit(null);
        }}
        isB2BMode={isB2BMode}
        customerToEdit={customerToEdit}
        onCustomerAdded={() => refetch()}
        onCustomerUpdated={() => refetch()}
      />

      {/* Delete Customer Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleExecuteDelete}
        title="Delete Customer Profile?"
        message={`Are you sure you want to delete customer "${customerToDelete?.name || customerToDelete?.businessName || 'Customer'}"? Historical invoices will be preserved for financial auditing.`}
        confirmText="Yes, Delete Customer"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};

export default CustomersListPage;
