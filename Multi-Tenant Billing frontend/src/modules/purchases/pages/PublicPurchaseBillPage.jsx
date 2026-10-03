import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  Loader2,
  FileText,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { usePublicPurchaseBillDetailsQuery } from '../hooks/usePurchaseQueries';
import { buildPurchaseBillPdfDoc, downloadPurchaseBillPdf, printPurchaseBillPdf } from '../utils/purchaseBillPrintUtil';

const PublicPurchaseBillPage = () => {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(true);
  const [copied, setCopied] = useState(false);

  const { data: responseData, isLoading, isError } = usePublicPurchaseBillDetailsQuery(id);

  const apiData = responseData?.data || responseData || null;
  const purchaseBill = apiData?.purchaseBill || apiData?.purchaseInvoice || apiData?.purchase || apiData || {};

  useEffect(() => {
    let isMounted = true;
    if (purchaseBill && purchaseBill.id) {
      setIsGeneratingPdf(true);
      buildPurchaseBillPdfDoc(purchaseBill)
        .then((result) => {
          if (isMounted && result?.doc) {
            const blobUrl = result.doc.output('bloburl');
            setPdfUrl(blobUrl);
          }
        })
        .catch((err) => {
          console.error('PDF Generation Error:', err);
        })
        .finally(() => {
          if (isMounted) setIsGeneratingPdf(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [purchaseBill]);

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const billNo = purchaseBill.purchaseNumber || 'Invoice';
    const text = `Hi, please view/download Purchase Bill #${billNo} Tax Invoice PDF:\n\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading || (isGeneratingPdf && purchaseBill?.id)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <Loader2 size={40} className="mx-auto text-indigo-400 animate-spin" />
          <div className="font-extrabold text-base tracking-wide">Generating PDF Invoice Document...</div>
          <p className="text-xs text-slate-400">Loading official tax receipt for purchase bill</p>
        </div>
      </div>
    );
  }

  if (isError || !purchaseBill || !purchaseBill.id) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <FileText size={48} className="mx-auto text-slate-400" />
          <h2 className="text-xl font-extrabold text-slate-900">Purchase Bill PDF Not Found</h2>
          <p className="text-xs text-slate-500">
            The bill link might be invalid or no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col h-screen overflow-hidden font-sans">
      {/* Top Floating Control Header Bar */}
      <header className="bg-slate-950 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight">
              Tax Invoice Document #{purchaseBill.purchaseNumber || 'PB-BILL'}
            </h1>
            <p className="text-[11px] font-semibold text-slate-400">Official Purchase Bill Receipt</p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await printPurchaseBillPdf(purchaseBill);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-extrabold text-xs rounded-xl border border-indigo-500/30 transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await downloadPurchaseBillPdf(purchaseBill);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Fullscreen PDF Document Iframe Viewer */}
      <main className="flex-1 w-full h-full bg-slate-800 relative">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`Purchase Bill ${purchaseBill.purchaseNumber || 'PDF'}`}
            className="w-full h-full border-none"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold">
            Unable to render PDF document preview. Please click "Download PDF" above.
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPurchaseBillPage;
