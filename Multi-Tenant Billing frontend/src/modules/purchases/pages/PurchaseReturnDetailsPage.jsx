import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  RotateCcw,
  Printer,
  Download,
  FileText,
} from 'lucide-react';
import { usePurchaseReturnDetailsQuery } from '../hooks/usePurchaseQueries';
import purchaseService from '../../../services/purchaseService';
import { useToast } from '../../../context/ToastContext';

const PurchaseReturnDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: responseData, isLoading } = usePurchaseReturnDetailsQuery(id);
  const pReturn = responseData?.return || responseData?.data || (responseData?.id ? responseData : null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Downloading Purchase Return PDF...');
      await purchaseService.exportPurchaseReturns({ id, format: 'pdf' });
      toast.success('Purchase Return PDF downloaded successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to download return PDF.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-600">Loading purchase return details...</p>
        </div>
      </div>
    );
  }

  if (!pReturn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <RotateCcw className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-black text-slate-800">Purchase Return Not Found</h2>
          <p className="text-xs font-semibold text-slate-500">The requested purchase return record could not be loaded or does not exist.</p>
          <button
            onClick={() => navigate('/vendor/purchases/returns/list')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            Back to Purchase Returns List
          </button>
        </div>
      </div>
    );
  }

  const displayReturn = pReturn;

  const itemsList = Array.isArray(displayReturn.items)
    ? displayReturn.items
    : Array.isArray(displayReturn.returnItems)
    ? displayReturn.returnItems
    : [];

  const rawReturnDate = displayReturn.returnDate || displayReturn.createdAt;
  const formattedReturnDate = rawReturnDate
    ? new Date(rawReturnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  const totalReturnVal = Number(displayReturn.totalReturnAmount || 0);
  const cashRefundVal = Number(displayReturn.refundAmount || 0);
  const storeCreditVal = Math.max(0, totalReturnVal - cashRefundVal);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 pb-16 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/purchases" className="hover:text-indigo-600 transition-colors">
          Purchase
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/purchases/returns/list" className="hover:text-indigo-600 transition-colors">
          Purchase Returns
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">{displayReturn.returnNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Purchase Return Details</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Itemized debit note and stock reversal report.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Debit Note</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Debit Note</span>
              <h2 className="text-2xl font-black text-amber-700 tracking-tight font-mono">{displayReturn.returnNumber}</h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 font-extrabold text-xs rounded-full border border-amber-200">
                {displayReturn.refundType || 'CASH_REFUND'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase">Return Date</div>
              <div className="font-extrabold text-slate-900 mt-0.5">{formattedReturnDate}</div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase">Original Invoice No.</div>
              <div className="font-mono font-extrabold text-indigo-600 mt-0.5">
                {displayReturn.purchaseNumber || displayReturn.purchaseInvoice?.purchaseNumber || 'PUR-REF'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase">Return Reason</div>
              <div className="font-extrabold text-rose-600 mt-0.5">{displayReturn.returnReason || 'Damaged / Defective'}</div>
            </div>
          </div>
        </div>

        {/* Supplier Info & Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
          <div>
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Supplier Information</div>
            <div className="text-base font-extrabold text-slate-900 mt-1">{displayReturn.supplier?.name || displayReturn.supplier?.companyName || 'Supplier'}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Mobile: {displayReturn.supplier?.mobileNumber || 'N/A'} • Email: {displayReturn.supplier?.email || 'N/A'}
            </div>
            {displayReturn.supplier?.gstin && (
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">GSTIN: {displayReturn.supplier.gstin}</div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Refund & Adjustment Breakdown</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Return</span>
                <span className="text-xs font-black text-slate-900">₹{totalReturnVal.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Cash Received</span>
                <span className="text-xs font-black text-emerald-700">₹{cashRefundVal.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold text-indigo-600 uppercase block">Store Credit</span>
                <span className="text-xs font-black text-indigo-700">₹{storeCreditVal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-2">
              Notes: <span className="font-semibold text-slate-700">{displayReturn.referenceNotes || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Returned Items Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Returned Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">Product Details</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-center">Returned Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-3 px-3 text-right">Reversal Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {itemsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-bold">
                      No returned item details found for this debit note.
                    </td>
                  </tr>
                ) : (
                  itemsList.map((item, idx) => {
                    const prodName = item.product?.name || item.productName || item.name || 'Returned Product';
                    const sku = item.sku || item.product?.sku || 'N/A';
                    const retQty = Number(item.returnQty !== undefined ? item.returnQty : (item.returnQuantity !== undefined ? item.returnQuantity : (item.quantity || 1)));
                    const unit = item.unit || item.product?.unit || 'Pcs';
                    const price = Number(item.unitPrice || item.rate || item.product?.purchasePrice || 0);
                    const lineAmt = Number(item.totalAmount || item.amount || (retQty * price));

                    return (
                      <tr key={item.id || idx}>
                        <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">{prodName}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{sku}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-black rounded-lg border border-rose-200">
                            {retQty} {unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold">₹{price.toLocaleString('en-IN')}.00</td>
                        <td className="py-3 px-3 text-right font-black text-rose-600">₹{lineAmt.toLocaleString('en-IN')}.00</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnDetailsPage;
