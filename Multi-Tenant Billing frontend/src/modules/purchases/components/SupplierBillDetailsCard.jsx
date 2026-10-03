import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const SupplierBillDetailsCard = ({
  suppliers = [],
  selectedSupplierId,
  selectedSupplier,
  onSupplierChange,
  onOpenSupplierModal,
  purchaseBillNo,
  onPurchaseBillNoChange,
  onRegenerateBillNo,
  supplierInvoiceNo,
  onSupplierInvoiceNoChange,
  purchaseDate,
  onPurchaseDateChange,
  dueDate,
  onDueDateChange,
  paymentTerms,
  onPaymentTermsChange,
  referenceNotes,
  onReferenceNotesChange,
}) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
            1
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Supplier & Bill Details</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          <span>{showMoreDetails ? 'Less Details' : '+ More Options'}</span>
          {showMoreDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Supplier Select & Add New Button */}
      <div className="space-y-1">
        <label className="block text-[11px] font-extrabold uppercase text-slate-700">
          Select Supplier <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedSupplierId}
              onChange={(e) => onSupplierChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">Search / Select Supplier...</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} ({sup.companyName || sup.city || 'Vendor'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenSupplierModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Selected Supplier Summary Card */}
      {selectedSupplier && (
        <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              {selectedSupplier.name?.slice(0, 2).toUpperCase() || 'SUP'}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">{selectedSupplier.name}</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {selectedSupplier.mobileNumber || selectedSupplier.mobile || ''} {selectedSupplier.city ? `• ${selectedSupplier.city}` : ''}
              </p>
            </div>
          </div>

          {selectedSupplier.gstin && (
            <div className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-100/80">
              GST: <span className="font-black text-slate-900">{selectedSupplier.gstin}</span>
            </div>
          )}
        </div>
      )}

      {/* Bill Core Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700">
        {/* Purchase Bill No */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            Bill No. <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={purchaseBillNo}
              onChange={(e) => onPurchaseBillNoChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={onRegenerateBillNo}
              title="Regenerate Bill Number"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Supplier Invoice No */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            Supplier Inv No.
          </label>
          <input
            type="text"
            value={supplierInvoiceNo}
            onChange={(e) => onSupplierInvoiceNoChange(e.target.value)}
            placeholder="e.g. INV-4587"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">
            Bill Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => onPurchaseDateChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Collapsible More Details */}
      {showMoreDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700 pt-3 border-t border-slate-100 animate-fadeIn">
          {/* Due Date */}
          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => onPaymentTermsChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Immediate">Immediate / Cash</option>
              <option value="Net 10 Days">Net 10 Days</option>
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
            </select>
          </div>

          {/* Reference / Notes */}
          <div>
            <label className="block mb-1 uppercase text-[11px] font-extrabold text-slate-700">Reference / Notes</label>
            <input
              type="text"
              value={referenceNotes}
              onChange={(e) => onReferenceNotesChange(e.target.value)}
              placeholder="e.g. Stock order"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierBillDetailsCard;

