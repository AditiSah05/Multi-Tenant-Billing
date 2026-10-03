import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export const BookDemoModal = ({ isOpen, onClose, brandConfig }) => {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative space-y-5 sm:space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Demo Request Received!</h3>
            <p className="text-xs text-slate-600">
              Thank you! Our product specialist will call you shortly to schedule your live walkthrough of {brandConfig.brandName} {brandConfig.accentName}.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Free Live Demo</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Book a Live Product Demo</h3>
              <p className="text-xs text-slate-600">
                See how {brandConfig.brandName} {brandConfig.accentName} can automate your store billing, POS registers, and GST returns.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Business / Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Retail Enterprises"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 hover:opacity-95 transition-opacity cursor-pointer"
              >
                Confirm Demo Booking
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default BookDemoModal;
