import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, FileText, AlertCircle, HelpCircle } from 'lucide-react';

const AuditHealthBanner = ({ auditStatus, discrepancies }) => {
  if (!auditStatus) return null;

  const { isClean, totalIssuesFound } = auditStatus;
  const missingGstinB2b = discrepancies?.missingGstinB2b || [];
  const missingHsnItems = discrepancies?.missingHsnItems || [];
  const highValueB2cInterstate = discrepancies?.highValueB2cInterstate || [];

  return (
    <div className="space-y-4">
      {/* Primary Audit Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isClean
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 text-emerald-950'
            : 'bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border-rose-500/30 text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isClean ? (
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0 border border-rose-400/30">
                <AlertTriangle size={24} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isClean ? 'Audit Status: CLEAN' : 'Audit Status: ISSUES DETECTED'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                    isClean
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {isClean ? 'Compliance Pass' : `${totalIssuesFound} Discrepancies`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {isClean
                  ? 'All sales invoices, purchase ITCs, GSTIN records, and line-item HSN codes pass Indian GST compliance rules.'
                  : 'Action required before filing GSTR-1 & GSTR-3B monthly return packages to avoid tax audit penalties.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancies List Details (Only shown if issues found) */}
      {!isClean && totalIssuesFound > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Missing B2B GSTIN */}
          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <ShieldAlert size={16} />
                <span>Invalid B2B GSTIN ({missingGstinB2b.length})</span>
              </div>
            </div>
            {missingGstinB2b.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No GSTIN issues detected.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {missingGstinB2b.map((item, idx) => (
                  <div key={idx} className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100 text-xs">
                    <div className="font-extrabold text-slate-900 flex justify-between">
                      <span>Invoice #{item.invoiceNumber}</span>
                      <span className="text-rose-600 text-[10px] font-bold">{item.gstin}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{item.customerName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing HSN Codes */}
          <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                <FileText size={16} />
                <span>Missing Line HSN ({missingHsnItems.length})</span>
              </div>
            </div>
            {missingHsnItems.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">All items contain valid HSN codes.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {missingHsnItems.map((item, idx) => (
                  <div key={idx} className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-xs">
                    <div className="font-extrabold text-slate-900 flex justify-between">
                      <span className="truncate pr-2">{item.productName}</span>
                      <span className="text-amber-700 text-[10px] font-bold shrink-0">#{item.invoiceNumber}</span>
                    </div>
                    <div className="text-[11px] text-amber-800 font-medium mt-0.5">{item.issue}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High Value B2C Inter-state */}
          <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <AlertCircle size={16} />
                <span>B2C Large &gt; ₹2.5L ({highValueB2cInterstate.length})</span>
              </div>
            </div>
            {highValueB2cInterstate.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No B2C inter-state threshold breaches.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {highValueB2cInterstate.map((item, idx) => (
                  <div key={idx} className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-xs">
                    <div className="font-extrabold text-slate-900 flex justify-between">
                      <span>Invoice #{item.invoiceNumber}</span>
                      <span className="text-indigo-600 font-bold">₹{item.grandTotal?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">{item.placeOfSupply}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditHealthBanner;
