import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';

export const PrivacyPolicyPage = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase">
            <ShieldCheck size={14} />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            Softfyr BillPro (A Unit of Veridian Innovations Private Limited) is committed to safeguarding your business, financial, and customer data with bank-grade multi-tenant security and 256-bit SSL encryption.
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
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              1. Information We Collect
            </h2>
            <p>
              To provide multi-tenant SaaS billing, POS counter processing, and GST reconciliation services, Softfyr BillPro collects:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Business & Store Profile:</strong> Business name, store address, state code, GSTIN, and contact details.</li>
              <li><strong>Staff & User Credentials:</strong> Usernames, encrypted authentication tokens, role permissions, and mobile numbers for OTP authentication.</li>
              <li><strong>Billing & Sales Data:</strong> Customer invoice records, item prices, warranty rules, discount rates, and CGST/SGST/IGST breakdown summaries.</li>
              <li><strong>System Logs:</strong> IP addresses, browser types, and API execution timestamps for security auditing.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              2. Multi-Tenant Data Isolation
            </h2>
            <p>
              Softfyr BillPro enforces strict database row-level tenant partitioning. Your store billing catalog, customer purchase ledgers, and financial records are completely isolated and inaccessible to other tenant stores on the platform.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              3. Security & Encryption Standards
            </h2>
            <p>
              We implement industry-standard 256-bit SSL encryption for data in transit and at rest. All password hashes utilize salted bcrypt algorithms. No raw financial credentials or credit card numbers are stored directly on our servers.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              4. Disclosure & Third-Party Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your retail store billing data or customer mobile records to third-party marketers. Data is disclosed only when required for official GSTN tax compliance API integrations or under binding court orders.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              5. Contact Us Regarding Privacy
            </h2>
            <p>
              If you have any questions or data privacy requests, please contact our Data Protection Officer:
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

export default PrivacyPolicyPage;
