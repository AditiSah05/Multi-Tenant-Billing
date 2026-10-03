import React, { useState } from 'react';
import { CheckCircle2, Printer, Download, Share2, Copy, X, FileText, Receipt } from 'lucide-react';
import { downloadSmartBillPdf, printSmartBillPdf, isB2BBill, shareSmartBillOnWhatsApp } from '../utils/salesBillPrintUtil';

const GeneratedBillModal = ({ generatedBillModal, onClose, toast }) => {
  const [copied, setCopied] = useState(false);

  if (!generatedBillModal) return null;

  const isB2B = isB2BBill(generatedBillModal);
  const shareUrl = `${window.location.origin}/public/invoices/${generatedBillModal.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (toast) toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = async () => {
    await shareSmartBillOnWhatsApp(generatedBillModal, toast);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-center relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {generatedBillModal.status === 'DRAFT' ? 'Bill Draft Saved!' : 'Bill Generated Successfully!'}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Invoice #{generatedBillModal.invoiceNumber} | Grand Total: ₹
            {Number(generatedBillModal.grandTotal || 0).toLocaleString('en-IN')}
          </p>
        </div>

        {/* 3 Smart Printing & Share Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={async () => {
              await printSmartBillPdf(generatedBillModal);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl transition-all cursor-pointer font-extrabold text-xs"
            title={isB2B ? 'Print Full A4 Tax Invoice Document' : 'Print 80mm POS Thermal Receipt Slip'}
          >
            {isB2B ? <FileText size={18} /> : <Receipt size={18} />}
            <span>{isB2B ? 'Print A4 Bill' : 'Print Receipt'}</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await downloadSmartBillPdf(generatedBillModal);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl transition-all cursor-pointer font-extrabold text-xs"
            title={isB2B ? 'Download A4 Invoice PDF' : 'Download POS Thermal Receipt PDF'}
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 rounded-2xl transition-all cursor-pointer font-extrabold text-xs shadow-md shadow-emerald-600/30"
          >
            <Share2 size={18} />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Copy Link Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Shareable PDF Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedBillModal;
