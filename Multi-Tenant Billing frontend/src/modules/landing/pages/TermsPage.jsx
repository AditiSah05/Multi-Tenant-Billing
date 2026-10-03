import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-indigo-600 selection:text-white">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <IndianRupee size={20} color="#ffffff" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Softfyr <span className="text-sky-600">BillPro</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer bg-slate-100 px-4 py-2 rounded-full"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Hero Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold uppercase">
            <FileText size={14} />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Terms & Conditions
          </h1>
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            Welcome to Softfyr BillPro. By subscribing to or utilizing our multi-tenant SaaS billing, POS counter operations, and GST tax software, you agree to comply with the terms outlined by Veridian Innovations Private Limited.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 font-semibold border-t border-slate-100">
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Veridian Innovations Pvt. Ltd.</span>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md space-y-8 text-sm text-slate-700 leading-relaxed font-medium">
          
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms & Conditions govern your access to and use of Softfyr BillPro (the "Platform"), operated by Veridian Innovations Private Limited ("Company", "We", "Us"). By creating a store tenant account or logging into the POS counter, you accept these terms in full.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              2. Store Tenant & Account Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Store owners are responsible for providing accurate GSTIN numbers, business state codes, and legal store addresses.</li>
              <li>You are sole custodian of your OTP credentials and employee staff access permissions.</li>
              <li>Misuse of public bill URL share links or attempts to bypass tenant partition isolation is strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              3. GST Tax Engine & Invoicing Compliance
            </h2>
            <p>
              While Softfyr BillPro provides automated state code matching for Intrastate (CGST+SGST) vs Interstate (IGST) tax calculation and CA monthly return export, store owners remain responsible for verifying their product HSN codes and tax slab configurations under Indian GST laws.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              4. Subscriptions & Billing Terms
            </h2>
            <p>
              Subscription fees for Starter Retail, Growth Pro, and Enterprise Unlimited plans are billed in advance on a monthly or annual basis. Services continue uninterrupted unless cancelled prior to the renewal date.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              5. Contact & Support
            </h2>
            <p>
              For legal inquiries or service requests regarding these terms:
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold space-y-1 text-slate-800">
              <p><strong>Veridian Innovations Private Limited</strong></p>
              <p>Email: <a href="mailto:info@softfyr.com" className="text-sky-600 underline">info@softfyr.com</a></p>
              <p>Phone: +91 87091 22663</p>
            </div>
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © 2026 Softfyr — A Unit of Veridian Innovations Private Limited. All Rights Reserved.
      </footer>
    </div>
  );
};

export default TermsPage;
