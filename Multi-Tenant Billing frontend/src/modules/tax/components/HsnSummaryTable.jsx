import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';

const HsnSummaryTable = ({ hsnTable = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever hsnTable data length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [hsnTable.length]);

  if (!Array.isArray(hsnTable) || hsnTable.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs font-semibold">
        <Layers size={32} className="mx-auto mb-2 text-slate-300" />
        No HSN code activity recorded for this period.
      </div>
    );
  }

  const totals = hsnTable.reduce(
    (acc, row) => ({
      qty: acc.qty + (row.totalQuantity || 0),
      val: acc.val + (row.totalValue || 0),
      taxable: acc.taxable + (row.taxableValue || 0),
      cgst: acc.cgst + (row.cgstAmount || 0),
      sgst: acc.sgst + (row.sgstAmount || 0),
      igst: acc.igst + (row.igstAmount || 0),
      tax: acc.tax + (row.totalTax || 0),
    }),
    { qty: 0, val: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0 }
  );

  const totalItems = hsnTable.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = hsnTable.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            GSTR-1 HSN Summary Breakdown
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated outward sales line items grouped by HSN / SAC Code
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-full border border-indigo-200">
          {hsnTable.length} HSN Codes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-600 uppercase font-extrabold border-b border-slate-200 tracking-wider">
            <tr>
              <th className="py-3 px-4">HSN / SAC</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">UQC</th>
              <th className="py-3 px-4 text-right">Total Qty</th>
              <th className="py-3 px-4 text-right">Taxable Value (₹)</th>
              <th className="py-3 px-4 text-right">CGST (₹)</th>
              <th className="py-3 px-4 text-right">SGST (₹)</th>
              <th className="py-3 px-4 text-right">IGST (₹)</th>
              <th className="py-3 px-4 text-right">Total Tax (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                  {row.hsnCode}
                </td>
                <td className="py-3 px-4 max-w-[200px] truncate text-slate-600">
                  {row.description}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-500">
                  {row.uqc || 'Pcs'}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  {row.totalQuantity?.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{row.taxableValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-slate-600">
                  ₹{row.cgstAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-slate-600">
                  ₹{row.sgstAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-slate-600">
                  ₹{row.igstAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-indigo-600">
                  ₹{row.totalTax?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-200">
            <tr>
              <td colSpan={3} className="py-3 px-4 uppercase text-slate-600 tracking-wider">
                Total HSN Summary
              </td>
              <td className="py-3 px-4 text-right">{totals.qty.toLocaleString('en-IN')}</td>
              <td className="py-3 px-4 text-right">₹{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right">₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right">₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right">₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-indigo-700">₹{totals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

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
        itemName="HSN Codes"
      />
    </div>
  );
};

export default HsnSummaryTable;
