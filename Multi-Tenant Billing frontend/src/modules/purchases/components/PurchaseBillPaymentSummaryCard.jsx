import React from 'react';
import { Trash2 } from 'lucide-react';

const PurchaseBillPaymentSummaryCard = ({
  totalAmount = 0,
  paidAmount = 0,
  dueAmount = 0,
  paymentStatus = 'Paid',
  paymentMethod = 'Bank Transfer',
  paymentDate = '',
  referenceNumber = '',
  bankAccount = '',
  payments = [],
  onDeletePayment = null,
}) => {
  return (
    <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Payment Summary</span>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
          {paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Total Amount</div>
          <div className="font-black text-slate-900">₹{totalAmount.toLocaleString('en-IN')}.00</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Paid Amount</div>
          <div className="font-black text-emerald-600">₹{paidAmount.toLocaleString('en-IN')}.00</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Due Amount</div>
          <div className="font-black text-slate-900">₹{dueAmount.toLocaleString('en-IN')}.00</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-1">
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Payment Status</div>
          <div className="font-bold text-emerald-600 mt-0.5">{paymentStatus}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Payment Method</div>
          <div className="font-bold text-slate-900 mt-0.5">{paymentMethod}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Payment Date</div>
          <div className="font-bold text-slate-900 mt-0.5">{paymentDate}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Reference No.</div>
          <div className="font-mono font-bold text-slate-900 mt-0.5">{referenceNumber || 'N/A'}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] text-slate-400 uppercase">Bank Account</div>
          <div className="font-bold text-slate-900 mt-0.5">{bankAccount || 'Default Cash Account'}</div>
        </div>
      </div>

      {/* Payment Transactions History Table */}
      {payments && payments.length > 0 && (
        <div className="pt-3 border-t border-slate-200/80 space-y-2">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Recorded Payment Transactions</div>
          <div className="space-y-1.5">
            {payments.map((pmt, idx) => (
              <div key={pmt.id || idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold">
                <div>
                  <div className="font-extrabold text-emerald-700">₹{(pmt.amount || 0).toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{pmt.paymentMethod || 'CASH'} • {pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleDateString('en-IN') : 'Recent'}</div>
                </div>
                {onDeletePayment && (
                  <button
                    onClick={() => onDeletePayment(pmt.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Payment Record"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseBillPaymentSummaryCard;
