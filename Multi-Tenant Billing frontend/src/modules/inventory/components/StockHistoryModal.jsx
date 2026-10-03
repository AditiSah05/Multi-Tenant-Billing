import React, { useState } from 'react';
import { X, History, Download, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStockHistoryQuery } from '../hooks/useInventoryQueries';
import axiosInstance from '../../../api/axiosInstance';
import { useToast } from '../../../context/ToastContext';

const StockHistoryModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState('');
  const { data: logs, isLoading, refetch } = useStockHistoryQuery(
    selectedProductId ? { productId: selectedProductId } : {}
  );
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const logsList = Array.isArray(logs) ? logs : (logs?.data || []);

  const handleExport = async (format = 'xlsx') => {
    setIsExporting(true);
    try {
      const response = await axiosInstance.get(`/inventory/export`, {
        params: { format, productId: selectedProductId || undefined },
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `inventory_audit_logs.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported stock audit logs (${format.toUpperCase()})`);
    } catch (err) {
      toast.error('Failed to export inventory logs.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Stock Movement Audit History</h3>
              <p className="text-xs text-slate-500">Real-time ledger tracking for all stock additions, sales, and manual adjustments.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('xlsx')}
              disabled={isExporting}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Export Excel</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Logs Table Area */}
        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-2xl">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
              <span>Loading stock audit history...</span>
            </div>
          ) : logsList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs">
              No stock history logs recorded yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Prev Stock</th>
                  <th className="py-3 px-4 text-center">Change Qty</th>
                  <th className="py-3 px-4 text-center">New Stock</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Updated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {logsList.map((log, idx) => {
                  const change = log.changeQty ?? log.addedRemovedQty ?? 0;
                  const isPositive = change > 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.date || log.createdAt || 'N/A'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.productName || log.product?.name || 'Product'}
                        {log.sku ? <span className="block text-[10px] text-slate-400 font-mono">SKU: {log.sku}</span> : null}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-500">{log.previousStock}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                            isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          {isPositive ? `+${change}` : change} Pcs
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">{log.updatedStock}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded-md uppercase">
                          {log.reason || 'ADJUSTMENT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-500">{log.updatedBy || log.updatedByUser?.name || 'System'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold shrink-0">
          <span>Total Audit Movement Records: {logsList.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;
