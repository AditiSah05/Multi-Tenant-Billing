
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  Wallet,
  FileText,
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Loader2,
} from 'lucide-react';

import {
  useSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from '../hooks/useSuppliersQueries';

import supplierService from '../../../services/supplierService';
import SupplierModal from '../components/SupplierModal';
import { useToast } from '../../../context/ToastContext';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/common/StatusBadge';

const SuppliersListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Modal State
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // React Query fetch
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useSuppliersQuery({
    search: searchQuery,
    status: statusFilter,
    city: cityFilter,
    paymentStatus: paymentFilter,
    page: currentPage,
    limit: pageSize,
  });

  const createMutation = useCreateSupplierMutation();
  const updateMutation = useUpdateSupplierMutation();
  const deleteMutation = useDeleteSupplierMutation();

  const rawSuppliers = Array.isArray(responseData?.items)
    ? responseData.items
    : Array.isArray(responseData?.data?.items)
    ? responseData.data.items
    : Array.isArray(responseData?.suppliers)
    ? responseData.suppliers
    : Array.isArray(responseData?.data?.suppliers)
    ? responseData.data.suppliers
    : Array.isArray(responseData?.data)
    ? responseData.data
    : [];

  const pagination =
    responseData?.pagination ||
    responseData?.data?.pagination || {
      total: rawSuppliers.length,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(rawSuppliers.length / pageSize) || 1,
    };

  const summary =
    responseData?.summary ||
    responseData?.data?.summary ||
    {};

  // Unique Cities
  const uniqueCities = Array.from(
    new Set(rawSuppliers.map((s) => s.city))
  ).filter(Boolean);

  // KPI calculations
  const totalSuppliersCount =
    summary.totalSuppliers ??
    pagination.total ??
    rawSuppliers.length;

  const computedActiveCount = rawSuppliers.filter((s) => {
    const st = String(s.status || 'ACTIVE').toUpperCase();
    return st === 'ACTIVE' && s.isActive !== false;
  }).length;

  const activeSuppliersCount =
    (summary.activeSuppliers && summary.activeSuppliers > 0)
      ? summary.activeSuppliers
      : (computedActiveCount > 0 ? computedActiveCount : totalSuppliersCount);

  const totalPurchasesMonth =
    summary.totalPurchases ??
    rawSuppliers.reduce(
      (acc, s) => acc + (s.totalPurchases || 0),
      0
    );

  const totalPaidMonth =
    summary.totalPaid ??
    rawSuppliers.reduce(
      (acc, s) => acc + (s.totalPaid || 0),
      0
    );

  const totalPayableOutstanding =
    summary.totalOutstanding ??
    rawSuppliers.reduce(
      (acc, s) =>
        acc + (s.outstandingDue || s.totalPayable || 0),
      0
    );

  // Initials
  const getInitials = (name = '') => {
    if (!name) return 'SU';

    const parts = name.trim().split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  // Copy to clipboard
  const handleCopy = (text, label) => {
    if (!text || text === '-' || text === 'N/A') return;

    navigator.clipboard.writeText(text);

    toast.success(`${label} copied to clipboard!`);
  };

  // Toggle Supplier Status
  const handleToggleStatus = async (supplier) => {
    const rawStatus = supplier.status
      ? String(supplier.status).toUpperCase()
      : 'ACTIVE';

    const isCurrentlyActive = rawStatus === 'ACTIVE';

    const newStatus = isCurrentlyActive
      ? 'INACTIVE'
      : 'ACTIVE';

    try {
      await updateMutation.mutateAsync({
        id: supplier.id,
        data: { status: newStatus },
      });

      await refetch();

      if (newStatus === 'ACTIVE') {
        toast.success(
          `Supplier "${supplier.name}" set to Active!`
        );
      } else {
        toast.info(
          `Supplier "${supplier.name}" set to Inactive.`
        );
      }
    } catch (err) {
      toast.error('Failed to change supplier status.');
    }
  };

  // Save Supplier
  const handleSaveSupplier = async (
    supplierData,
    supplierId
  ) => {
    if (supplierId) {
      await updateMutation.mutateAsync({
        id: supplierId,
        data: supplierData,
      });

      await refetch();

      toast.success(
        `Supplier "${supplierData.name}" updated successfully!`
      );
    } else {
      await createMutation.mutateAsync(supplierData);

      await refetch();

      toast.success(
        `Supplier "${supplierData.name}" created successfully!`
      );
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (
    supplierId,
    supplierName
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete supplier "${supplierName}"?`
      )
    ) {
      return;
    }

    try {
      const res =
        await deleteMutation.mutateAsync(supplierId);

      await refetch();

      const msg =
        res?.data?.message ||
        res?.message ||
        `Supplier "${supplierName}" processed.`;

      if (
        res?.isSoftDeleted ||
        res?.data?.isSoftDeleted
      ) {
        toast.info(msg);
      } else {
        toast.success(msg);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        'Failed to delete supplier.'
      );
    }
  };

  // Export Data
  const handleExport = async (format = 'csv') => {
    try {
      toast.info(
        `Exporting suppliers dataset (${format.toUpperCase()})...`
      );

      const response =
        await supplierService.exportSuppliers({
          search: searchQuery,
          status: statusFilter,
          city: cityFilter,
          paymentStatus: paymentFilter,
          format,
        });

      if (format === 'json') {
        const dataStr =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(
            JSON.stringify(response.data)
          );

        const downloadAnchor =
          document.createElement('a');

        downloadAnchor.setAttribute(
          'href',
          dataStr
        );

        downloadAnchor.setAttribute(
          'download',
          `suppliers_export_${Date.now()}.json`
        );

        document.body.appendChild(
          downloadAnchor
        );

        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        const url =
          window.URL.createObjectURL(
            new Blob([response.data])
          );

        const link =
          document.createElement('a');

        link.href = url;

        link.setAttribute(
          'download',
          `suppliers_directory_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'
          }`
        );

        document.body.appendChild(link);

        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
      }

      toast.success(
        'Suppliers list exported successfully!'
      );
    } catch (err) {
      toast.error(
        'Failed to export suppliers dataset.'
      );
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6 pb-8 sm:pb-12 animate-fadeIn">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Suppliers
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
            Manage all your suppliers and view their
            purchase and payment details.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-stretch gap-2 sm:gap-3 w-full lg:w-auto">

          <button
            onClick={() => {
              setSupplierToEdit(null);
              setSupplierModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Supplier</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            <Download
              size={16}
              className="text-slate-500"
            />
            <span>Export CSV</span>
          </button>

        </div>
      </div>


      {/* KPI CARDS - COMPACT */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* TOTAL SUPPLIERS */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Total Suppliers
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{totalSuppliersCount}</span>
              <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                {activeSuppliersCount} Active
              </span>
            </div>
          </div>
        </div>

        {/* TOTAL PURCHASES */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <ShoppingCart size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Total Purchases
            </div>
            <div className="text-base font-black text-slate-900 truncate mt-0.5">
              ₹{totalPurchasesMonth.toLocaleString('en-IN')}.00
            </div>
          </div>
        </div>

        {/* TOTAL PAID */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Total Paid
            </div>
            <div className="text-base font-black text-emerald-600 truncate mt-0.5">
              ₹{totalPaidMonth.toLocaleString('en-IN')}.00
            </div>
          </div>
        </div>

        {/* TOTAL PAYABLE */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Total Payable
            </div>
            <div className="text-base font-black text-rose-600 truncate mt-0.5">
              ₹{totalPayableOutstanding.toLocaleString('en-IN')}.00
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          {/* SEARCH */}
          <div className="relative w-full lg:flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search supplier, mobile, GSTIN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
            />
          </div>

          {/* FILTER GRID */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Status</option>
              <option value="OUTSTANDING">Has Outstanding</option>
              <option value="PAID">Fully Paid</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCityFilter('ALL');
                setPaymentFilter('ALL');
                setCurrentPage(1);
                toast.info('Filters reset.');
              }}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-indigo-600 transition-colors cursor-pointer shrink-0"
            >
              <Filter size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Total Purchases</th>
                <th className="py-2.5 px-3">Total Paid</th>
                <th className="py-2.5 px-3">Total Payable</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100 text-xs">

              {isLoading ? (

                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-slate-500"
                  >
                    <Loader2
                      size={32}
                      className="mx-auto text-indigo-600 animate-spin"
                    />

                    <div className="font-bold text-slate-700 mt-2">
                      Loading suppliers from backend...
                    </div>
                  </td>
                </tr>

              ) : isError ? (

                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center"
                  >
                    <div className="font-bold text-rose-600">
                      Failed to load suppliers.
                    </div>

                    <button
                      onClick={() => refetch()}
                      className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Retry
                    </button>
                  </td>
                </tr>

              ) : rawSuppliers.length === 0 ? (

                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-slate-500"
                  >
                    <Users
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <div className="font-bold text-slate-700 mt-2">
                      No Suppliers Found
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search criteria or add a new supplier.
                    </p>
                  </td>
                </tr>

              ) : (

                rawSuppliers.map((supplier, idx) => {

                  const mobileDisplay =
                    supplier.mobileNumber ||
                    supplier.mobile ||
                    'N/A';

                  const outstandingPayable =
                    supplier.outstandingDue ??
                    supplier.totalPayable ??
                    0;

                  const totalPurch =
                    supplier.totalPurchases || 0;

                  const totalPd =
                    supplier.totalPaid || 0;

                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                            {getInitials(supplier.name)}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => navigate(`/vendor/suppliers/${supplier.id}`)}
                              className="font-extrabold text-slate-900 hover:text-indigo-600 cursor-pointer truncate text-left block"
                            >
                              {supplier.name}
                            </button>
                            <div className="text-[10px] text-slate-400 font-medium truncate">
                              {supplier.city ? `${supplier.city}, ${supplier.state || ''}` : 'Address not specified'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {supplier.companyName || '-'}
                      </td>

                      <td
                        onClick={() => handleCopy(mobileDisplay, 'Mobile number')}
                        className="py-2.5 px-3 font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer"
                      >
                        {mobileDisplay}
                      </td>

                      <td
                        onClick={() => handleCopy(supplier.gstin, 'GSTIN')}
                        className="py-2.5 px-3 font-mono font-bold text-slate-600 uppercase cursor-pointer"
                      >
                        {supplier.gstin || '-'}
                      </td>

                      <td className="py-2.5 px-3 font-black text-slate-900">
                        ₹{totalPurch.toLocaleString('en-IN')}.00
                      </td>

                      <td className="py-2.5 px-3 font-extrabold text-emerald-600">
                        ₹{totalPd.toLocaleString('en-IN')}.00
                      </td>

                      <td className="py-2.5 px-3 font-black">
                        {outstandingPayable > 0 ? (
                          <span className="text-rose-600">
                            ₹{outstandingPayable.toLocaleString('en-IN')}.00
                          </span>
                        ) : (
                          <span className="text-emerald-600">₹0.00</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <StatusBadge
                          status={supplier.status}
                          onClick={() => handleToggleStatus(supplier)}
                          title="Click to toggle status"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/vendor/suppliers/${supplier.id}`)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-indigo-200/60"
                            title="View Supplier Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => {
                              setSupplierToEdit(supplier);
                              setSupplierModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                            title="Edit Supplier"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                            title="Delete Supplier"
                          >
                            <Trash2 size={14} />
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


        {/* DESKTOP PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={
            pagination.totalPages || 1
          }
          totalItems={
            pagination.total ||
            rawSuppliers.length
          }
          pageSize={pageSize}
          onPageChange={(page) =>
            setCurrentPage(page)
          }
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="suppliers"
        />

      </div>


      {/* =====================================================
          MOBILE / TABLET CARDS
      ====================================================== */}
      <div className="lg:hidden space-y-3">

        {isLoading ? (

          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center">

            <Loader2
              size={32}
              className="mx-auto text-indigo-600 animate-spin"
            />

            <div className="font-bold text-slate-700 mt-2">
              Loading suppliers...
            </div>

          </div>

        ) : isError ? (

          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center">

            <div className="font-bold text-rose-600">
              Failed to load suppliers.
            </div>

            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Retry
            </button>

          </div>

        ) : rawSuppliers.length === 0 ? (

          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center">

            <Users
              size={32}
              className="mx-auto text-slate-300"
            />

            <div className="font-bold text-slate-700 mt-2">
              No Suppliers Found
            </div>

            <p className="text-xs text-slate-400 mt-1 px-4">
              Try adjusting your search criteria or add a new supplier.
            </p>

          </div>

        ) : (

          rawSuppliers.map((supplier) => {

            const mobileDisplay =
              supplier.mobileNumber ||
              supplier.mobile ||
              'N/A';

            const outstandingPayable =
              supplier.outstandingDue ??
              supplier.totalPayable ??
              0;

            const totalPurch =
              supplier.totalPurchases || 0;

            const totalPd =
              supplier.totalPaid || 0;

            return (
              <div
                key={supplier.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
              >

                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                      {getInitials(
                        supplier.name
                      )}
                    </div>

                    <div className="min-w-0">

                      <button
                        onClick={() =>
                          navigate(
                            `/vendor/suppliers/${supplier.id}`
                          )
                        }
                        className="font-extrabold text-slate-900 hover:text-indigo-600 text-left truncate max-w-[180px] sm:max-w-[300px]"
                      >
                        {supplier.name}
                      </button>

                      <p className="text-[11px] text-slate-400 truncate">
                        {supplier.companyName ||
                          'Company not specified'}
                      </p>

                    </div>

                  </div>


                  <StatusBadge
                    status={supplier.status}
                    onClick={() =>
                      handleToggleStatus(
                        supplier
                      )
                    }
                    title="Click to toggle status"
                  />

                </div>


                {/* DETAILS */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-4 pt-4 border-t border-slate-100">

                  <div className="min-w-0">

                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Mobile
                    </p>

                    <button
                      onClick={() =>
                        handleCopy(
                          mobileDisplay,
                          'Mobile number'
                        )
                      }
                      className="text-xs font-bold text-slate-700 truncate max-w-full"
                    >
                      {mobileDisplay}
                    </button>

                  </div>


                  <div className="min-w-0">

                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      GSTIN
                    </p>

                    <button
                      onClick={() =>
                        handleCopy(
                          supplier.gstin,
                          'GSTIN'
                        )
                      }
                      className="text-xs font-bold font-mono text-slate-700 uppercase truncate max-w-full"
                    >
                      {supplier.gstin || '-'}
                    </button>

                  </div>


                  <div>

                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Purchases
                    </p>

                    <p className="text-sm font-black text-slate-900">
                      ₹
                      {totalPurch.toLocaleString(
                        'en-IN'
                      )}
                      .00
                    </p>

                  </div>


                  <div>

                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Paid
                    </p>

                    <p className="text-sm font-black text-emerald-600">
                      ₹
                      {totalPd.toLocaleString(
                        'en-IN'
                      )}
                      .00
                    </p>

                  </div>


                  <div>

                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Payable
                    </p>

                    <p
                      className={`text-sm font-black ${outstandingPayable > 0
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                        }`}
                    >
                      ₹
                      {outstandingPayable.toLocaleString(
                        'en-IN'
                      )}
                      .00
                    </p>

                  </div>


                  <div className="min-w-0">

                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Location
                    </p>

                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {supplier.city
                        ? `${supplier.city}, ${supplier.state || ''
                        }`
                        : 'Not specified'}
                    </p>

                  </div>

                </div>


                {/* CARD ACTIONS */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">

                  <button
                    onClick={() =>
                      navigate(
                        `/vendor/suppliers/${supplier.id}`
                      )
                    }
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100"
                  >
                    <Eye size={15} />
                    View
                  </button>


                  <button
                    onClick={() => {
                      setSupplierToEdit(
                        supplier
                      );
                      setSupplierModalOpen(
                        true
                      );
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200"
                  >
                    <Edit3 size={15} />
                    Edit
                  </button>


                  <button
                    onClick={() =>
                      handleDeleteSupplier(
                        supplier.id,
                        supplier.name
                      )
                    }
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>

                </div>

              </div>
            );
          })
        )}


        {/* MOBILE PAGINATION */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

          <Pagination
            currentPage={currentPage}
            totalPages={
              pagination.totalPages || 1
            }
            totalItems={
              pagination.total ||
              rawSuppliers.length
            }
            pageSize={pageSize}
            onPageChange={(page) =>
              setCurrentPage(page)
            }
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemName="suppliers"
          />

        </div>

      </div>


      {/* =====================================================
          SUPPLIER MODAL
      ====================================================== */}
      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() =>
          setSupplierModalOpen(false)
        }
        supplierToEdit={supplierToEdit}
        onSaveSupplier={handleSaveSupplier}
      />

    </div>
  );
};

export default SuppliersListPage;