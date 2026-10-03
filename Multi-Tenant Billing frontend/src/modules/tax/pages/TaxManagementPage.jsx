import React, { useState } from 'react';
import {
  FileCheck2,
  Percent,
  Package,
  Users,
  Download,
  Plus,
  Zap,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  Building2,
  TrendingUp,
  Receipt,
  RotateCcw
} from 'lucide-react';
import {
  useTaxesQuery,
  useTaxSummaryQuery,
  useProductTaxSummaryQuery,
  usePartyTaxSummaryQuery,
  useMonthlyTaxAuditQuery,
  useSeedDefaultTaxesMutation,
  useDeleteTaxMutation
} from '../hooks/useTaxQueries';
import { taxService } from '../../../services/taxService';
import AuditHealthBanner from '../components/AuditHealthBanner';
import HsnSummaryTable from '../components/HsnSummaryTable';
import TaxRateModal from '../components/TaxRateModal';
import AuditPeriodPicker from '../components/AuditPeriodPicker';
import Pagination from '../../../components/common/Pagination';
import { useToast } from '../../../context/ToastContext';

const TaxManagementPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'slabs' | 'products' | 'parties'

  // Monthly Audit Tab State
  const currentDate = new Date();
  const [auditYear, setAuditYear] = useState(currentDate.getFullYear());
  const [auditMonth, setAuditMonth] = useState(currentDate.getMonth() + 1);

  // Product Reconciliation State & Pagination
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(10);

  // Party Breakdown Segment State & Pagination & Search
  const [partySearch, setPartySearch] = useState('');
  const [partySegment, setPartySegment] = useState('suppliers'); // 'suppliers' | 'customers'
  const [partyPage, setPartyPage] = useState(1);
  const [partyLimit, setPartyLimit] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);

  // Queries
  const { data: taxesData = [], isLoading: loadingTaxes } = useTaxesQuery();
  const { data: taxSummaryData, isLoading: loadingTaxSummary } = useTaxSummaryQuery();
  
  const { data: productTaxData, isLoading: loadingProductTax } = useProductTaxSummaryQuery({
    search: productSearch,
    page: productPage,
    limit: productLimit
  });
  
  const { data: partyTaxData, isLoading: loadingPartyTax } = usePartyTaxSummaryQuery({
    search: partySearch,
    page: partyPage,
    limit: partyLimit
  });
  
  const { data: auditData, isLoading: loadingAudit } = useMonthlyTaxAuditQuery(auditYear, auditMonth);

  // Mutations
  const seedMutation = useSeedDefaultTaxesMutation();
  const deleteMutation = useDeleteTaxMutation();

  const handleSeedDefaults = async () => {
    try {
      toast.info('Seeding default GST tax slabs...');
      await seedMutation.mutateAsync();
      toast.success('Default GST tax slabs seeded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed GST slabs.');
    }
  };

  const handleDeleteTax = async (taxId, taxName) => {
    if (window.confirm(`Are you sure you want to delete "${taxName}" tax slab?`)) {
      try {
        await deleteMutation.mutateAsync(taxId);
        toast.success(`Tax slab "${taxName}" deleted successfully!`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete tax slab.');
      }
    }
  };

  const handleExportAuditExcel = async () => {
    try {
      toast.info('Exporting CA Audit Package (Excel)...');
      const response = await taxService.exportMonthlyTaxAuditExcel({ year: auditYear, month: auditMonth });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Monthly_Tax_Audit_${auditYear}_${auditMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CA Audit Package exported successfully!');
    } catch (err) {
      toast.error('Failed to download CA Audit Package report.');
    }
  };

  const handleExportProductExcel = async () => {
    try {
      toast.info('Exporting Product Tax Reconciliation report...');
      const response = await taxService.exportProductTaxSummaryExcel({ search: productSearch });
      const contentType = response?.headers?.['content-type'] || response?.data?.type || '';

      let jsonData = null;

      // Check if backend returned JSON (either raw JSON object or JSON Blob)
      if (contentType.includes('application/json')) {
        if (response.data instanceof Blob) {
          const text = await response.data.text();
          try {
            const parsed = JSON.parse(text);
            jsonData = parsed.data || parsed.products || (Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            console.error('Failed to parse JSON blob:', e);
          }
        } else if (typeof response.data === 'object') {
          jsonData = response.data?.data || response.data?.products || (Array.isArray(response.data) ? response.data : []);
        }
      }

      // If backend returned JSON, generate and download a clean CSV file
      if (jsonData && Array.isArray(jsonData)) {
        if (jsonData.length === 0) {
          toast.warning('No product tax data available to export.');
          return;
        }

        const headers = ['Product Name', 'SKU', 'HSN Code', 'Unit', 'Tax %', 'Sales Qty', 'Output Sales Tax (INR)', 'Purchase Qty', 'Input ITC Tax (INR)', 'Net Tax Balance (INR)'];
        const csvRows = [headers.join(',')];

        jsonData.forEach((p) => {
          const row = [
            `"${(p.productName || p.name || '').replace(/"/g, '""')}"`,
            `"${p.sku || ''}"`,
            `"${p.hsnCode || 'N/A'}"`,
            `"${p.unit || 'Pcs'}"`,
            p.taxPercent ?? 0,
            p.totalOutputQty ?? p.salesQuantity ?? 0,
            p.totalOutputTaxCollected ?? p.salesTaxCollected ?? 0,
            p.totalInputQty ?? p.purchaseQuantity ?? 0,
            p.totalInputTaxPaidITC ?? p.totalInputTaxPaid ?? 0,
            p.netTaxPayable ?? p.netTaxDifference ?? 0
          ];
          csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Product_Tax_Reconciliation_${auditYear}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Product Tax Reconciliation exported successfully!');
        return;
      }

      // Standard Binary Blob (.xlsx) if backend returns actual excel binary file
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Product_Tax_Reconciliation_${auditYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Product Tax Reconciliation exported successfully!');
    } catch (err) {
      toast.error('Failed to download Product Tax report.');
    }
  };

  const productsList = productTaxData?.products || productTaxData?.productsBreakdown || [];
  const productPagination = productTaxData?.pagination || null;
  const productSummary = productTaxData?.summary || null;

  const suppliersList = partyTaxData?.suppliersBreakdown || [];
  const customersList = partyTaxData?.customersBreakdown || [];
  const partyPagination = partyTaxData?.pagination || null;
  const partySummary = partyTaxData?.summary || null;

  // Filtered Suppliers & Customers by Search Query
  const filteredSuppliers = suppliersList.filter((s) => {
    if (!partySearch.trim()) return true;
    const q = partySearch.toLowerCase().trim();
    return (
      s.supplierName?.toLowerCase().includes(q) ||
      s.companyName?.toLowerCase().includes(q) ||
      s.gstin?.toLowerCase().includes(q)
    );
  });

  const filteredCustomers = customersList.filter((c) => {
    if (!partySearch.trim()) return true;
    const q = partySearch.toLowerCase().trim();
    return (
      c.customerName?.toLowerCase().includes(q) ||
      c.gstin?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs tracking-wider uppercase mb-1">
            <Receipt size={16} /> Tax & GST Compliance Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tax Engine & Compliance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Indian GST Audit, Output Tax vs ITC Reconciliation, and CA-ready Monthly Returns Export.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setEditingTax(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> Add Custom Tax
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 size={18} /> CA Monthly Audit
        </button>
        <button
          onClick={() => setActiveTab('slabs')}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'slabs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent size={18} /> Tax Rates & Slabs
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package size={18} /> Product Reconciliation
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className={`px-4 py-3 text-xs sm:text-sm font-extrabold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'parties'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users size={18} /> Party Breakdown
        </button>
      </div>

      {/* TAB 1: CA MONTHLY AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Audit Period:
              </label>
              <AuditPeriodPicker
                month={auditMonth}
                year={auditYear}
                onChange={(m, y) => {
                  setAuditMonth(m);
                  setAuditYear(y);
                }}
              />
            </div>

            <button
              onClick={handleExportAuditExcel}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
            >
              <Download size={16} /> Export CA Audit Package (Excel)
            </button>
          </div>

          {loadingAudit ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-bold text-xs">
              Loading Tax Audit Engine Data...
            </div>
          ) : auditData ? (
            <>
              {/* Audit Health Banner */}
              <AuditHealthBanner
                auditStatus={auditData.auditStatus}
                discrepancies={auditData.discrepancies}
              />

              {/* Monthly Audit KPI Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Total Output Sales GST
                  </div>
                  <div className="text-xl font-black text-indigo-600">
                    ₹{auditData.salesOutwardSummary?.totalOutputTaxCollected?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {auditData.salesOutwardSummary?.totalInvoicesCount || 0} Outward Invoices
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Eligible Purchase ITC
                  </div>
                  <div className="text-xl font-black text-emerald-600">
                    ₹{auditData.itcInwardSummary?.netEligibleItc?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Inward Tax Credit Claims
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    NET TAX PAYABLE TO GOVT
                  </div>
                  <div className="text-xl font-black text-rose-600">
                    ₹{auditData.netTaxLiabilityDues?.netTotalTaxPayableGovtDues?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Output Tax minus Net ITC
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Total Outward Base Value
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    ₹{auditData.salesOutwardSummary?.totalTaxableValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Net Taxable Base Sales
                  </div>
                </div>
              </div>

              {/* HSN Summary Breakdown Table */}
              <HsnSummaryTable hsnTable={auditData.hsnTable} />
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: TAX RATES & SLABS */}
      {activeTab === 'slabs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Tax Slab Performance & Rates</h3>
              <p className="text-xs text-slate-500">Manage standard GST tax slabs for store items.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedDefaults}
                disabled={seedMutation.isPending}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-200 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Zap size={16} /> 1-Click Auto-Seed Standard GST Slabs
              </button>
            </div>
          </div>

          {/* Slab Summary Performance Grid */}
          {taxSummaryData?.slabSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {taxSummaryData.slabSummary.map((slab, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200">
                      {slab.taxPercent}% GST Slab
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 pt-1">
                    <div className="flex justify-between">
                      <span>Output GST:</span>
                      <span className="font-bold text-slate-900">₹{slab.salesTaxCollected?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ITC Paid:</span>
                      <span className="font-bold text-emerald-600">₹{slab.purchaseTaxPaid?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 font-extrabold text-slate-900">
                      <span>Net Dues:</span>
                      <span className={slab.netTaxPayable >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        ₹{slab.netTaxPayable?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Tax Rates Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 font-extrabold text-slate-900 text-sm">
              Active Store Tax Rates
            </div>
            {loadingTaxes ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">Loading tax rates...</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tax Name</th>
                    <th className="py-3 px-4">Rate (%)</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {taxesData.map((tax) => (
                    <tr key={tax.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{tax.name}</td>
                      <td className="py-3 px-4 font-extrabold text-indigo-600">{tax.percentage}%</td>
                      <td className="py-3 px-4 text-slate-500">{tax.type || 'PERCENTAGE'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                          {tax.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTax(tax);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTax(tax.id, tax.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT TAX RECONCILIATION */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Product Tax Overview Cards */}
          {productSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Products Analyzed
                </div>
                <div className="text-xl font-black text-slate-900">
                  {productSummary.totalProductsAnalyzed || 0} Products
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Catalog items in store</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Output Sales Tax
                </div>
                <div className="text-xl font-black text-indigo-600">
                  ₹{(productSummary.totalOutputTaxCollected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">GST collected on sales</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Input ITC Tax Paid
                </div>
                <div className="text-xl font-black text-emerald-600">
                  ₹{(productSummary.totalInputTaxPaidITC || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">GST paid on purchases</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Net Tax Difference
                </div>
                <div className={`text-xl font-black ${productSummary.netTaxPayableOverall >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{(productSummary.netTaxPayableOverall || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Output Tax minus ITC</div>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search product, SKU or HSN..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleExportProductExcel}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
            >
              <Download size={16} /> Export Product Tax Excel / CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {loadingProductTax ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">Loading product tax data...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU / HSN</th>
                        <th className="py-3 px-4 text-center">Tax %</th>
                        <th className="py-3 px-4 text-right">Sales Qty</th>
                        <th className="py-3 px-4 text-right">Output Sales Tax</th>
                        <th className="py-3 px-4 text-right">Purchase Qty</th>
                        <th className="py-3 px-4 text-right">Purchase ITC Tax</th>
                        <th className="py-3 px-4 text-right">Net Tax Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {productsList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                            No product tax records found.
                          </td>
                        </tr>
                      ) : (
                        productsList.map((prod, idx) => {
                          const taxRateDisplay = prod.taxPercent !== undefined && prod.taxPercent !== null
                            ? prod.taxPercent
                            : (prod.tax?.percentage ?? prod.taxRate ?? 0);

                          return (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900">{prod.productName || prod.name}</td>
                              <td className="py-3 px-4 text-slate-500 font-mono">{prod.sku || 'N/A'} | {prod.hsnCode || 'N/A'}</td>
                              <td className="py-3 px-4 text-center font-bold text-indigo-600">
                                {taxRateDisplay}%
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">{prod.totalOutputQty ?? prod.salesQuantity ?? 0}</td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900">₹{(prod.totalOutputTaxCollected ?? prod.salesTaxCollected ?? 0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-right font-semibold">{prod.totalInputQty ?? prod.purchaseQuantity ?? 0}</td>
                              <td className="py-3 px-4 text-right text-emerald-600 font-bold">₹{(prod.totalInputTaxPaidITC ?? prod.totalInputTaxPaid ?? prod.purchaseTaxPaidITC ?? 0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-right font-extrabold text-indigo-700">₹{(prod.netTaxPayable ?? prod.netTaxDifference ?? 0).toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Product Tax Summary Pagination */}
                <Pagination
                  currentPage={productPagination?.page || productPage}
                  totalPages={productPagination?.totalPages || Math.ceil((productPagination?.totalCount || productTaxData?.summary?.totalProductsAnalyzed || productsList.length) / productLimit) || 1}
                  totalItems={productPagination?.totalCount || productTaxData?.summary?.totalProductsAnalyzed || productsList.length}
                  pageSize={productLimit}
                  onPageChange={(p) => setProductPage(p)}
                  onPageSizeChange={(size) => {
                    setProductLimit(size);
                    setProductPage(1);
                  }}
                  itemName="products"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PARTY BREAKDOWN */}
      {activeTab === 'parties' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Party Overview Cards */}
          {partySummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Suppliers
                </div>
                <div className="text-xl font-black text-slate-900">
                  {partySummary.totalSuppliersAnalyzed || 0} Suppliers
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Inward vendor partners</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Supplier ITC
                </div>
                <div className="text-xl font-black text-emerald-600">
                  ₹{(partySummary.totalInputTaxPaidToSuppliersITC || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Tax paid to suppliers</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Customers
                </div>
                <div className="text-xl font-black text-slate-900">
                  {partySummary.totalCustomersAnalyzed || 0} Customers
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Outward client accounts</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Customer Tax
                </div>
                <div className="text-xl font-black text-indigo-600">
                  ₹{(partySummary.totalOutputTaxCollectedFromCustomers || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Output GST from clients</div>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => {
                  setPartySegment('suppliers');
                  setPartyPage(1);
                }}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                  partySegment === 'suppliers'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Suppliers Breakdown (ITC Paid)
              </button>
              <button
                onClick={() => {
                  setPartySegment('customers');
                  setPartyPage(1);
                }}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                  partySegment === 'customers'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customers Breakdown (Output Tax)
              </button>
            </div>

            {/* Search Input Bar for Party Breakdown */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={partySegment === 'suppliers' ? "Search supplier name, company or GSTIN..." : "Search customer name or GSTIN..."}
                value={partySearch}
                onChange={(e) => {
                  setPartySearch(e.target.value);
                  setPartyPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {loadingPartyTax ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">Loading party breakdown...</div>
            ) : partySegment === 'suppliers' ? (
              <>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Supplier Name</th>
                      <th className="py-3 px-4">GSTIN</th>
                      <th className="py-3 px-4 text-center">Bills Count</th>
                      <th className="py-3 px-4 text-right">Taxable Base (₹)</th>
                      <th className="py-3 px-4 text-right">Total Input Tax (ITC Eligible)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                          No matching suppliers found.
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map((supp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{supp.supplierName}</div>
                            {supp.companyName && supp.companyName !== 'N/A' && (
                              <div className="text-[10px] text-slate-400 font-medium">{supp.companyName}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{supp.gstin || 'N/A'}</td>
                          <td className="py-3 px-4 text-center font-semibold">{supp.purchasesCount ?? supp.totalInvoices ?? 0}</td>
                          <td className="py-3 px-4 text-right font-semibold">₹{(supp.totalTaxableValue || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-600">₹{(supp.totalInputTaxPaidITC || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Suppliers Pagination */}
                <Pagination
                  currentPage={partyPagination?.page || partyPage}
                  totalPages={partyPagination?.supplierPages || Math.ceil((partyPagination?.totalSuppliers || filteredSuppliers.length) / partyLimit) || 1}
                  totalItems={partyPagination?.totalSuppliers || filteredSuppliers.length}
                  pageSize={partyLimit}
                  onPageChange={(p) => setPartyPage(p)}
                  onPageSizeChange={(size) => {
                    setPartyLimit(size);
                    setPartyPage(1);
                  }}
                  itemName="suppliers"
                />
              </>
            ) : (
              <>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">GSTIN</th>
                      <th className="py-3 px-4 text-center">Invoices Count</th>
                      <th className="py-3 px-4 text-right">Taxable Base (₹)</th>
                      <th className="py-3 px-4 text-right">CGST</th>
                      <th className="py-3 px-4 text-right">SGST</th>
                      <th className="py-3 px-4 text-right">IGST</th>
                      <th className="py-3 px-4 text-right">Total Output Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                          No matching customers found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{cust.customerName}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{cust.gstin || 'N/A'}</td>
                          <td className="py-3 px-4 text-center font-semibold">{cust.billsCount ?? cust.totalBills ?? 0}</td>
                          <td className="py-3 px-4 text-right font-semibold">₹{(cust.totalTaxableValue || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right text-slate-600">₹{(cust.cgstCollected || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right text-slate-600">₹{(cust.sgstCollected || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right text-slate-600">₹{(cust.igstCollected || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-indigo-600">₹{(cust.totalOutputTaxCollected || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Customers Pagination */}
                <Pagination
                  currentPage={partyPagination?.page || partyPage}
                  totalPages={partyPagination?.customerPages || Math.ceil((partyPagination?.totalCustomers || filteredCustomers.length) / partyLimit) || 1}
                  totalItems={partyPagination?.totalCustomers || filteredCustomers.length}
                  pageSize={partyLimit}
                  onPageChange={(p) => setPartyPage(p)}
                  onPageSizeChange={(size) => {
                    setPartyLimit(size);
                    setPartyPage(1);
                  }}
                  itemName="customers"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Tax Modal */}
      <TaxRateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTax(null);
        }}
        editingTax={editingTax}
      />
    </div>
  );
};

export default TaxManagementPage;

