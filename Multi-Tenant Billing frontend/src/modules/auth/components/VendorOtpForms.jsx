import React from 'react';
import { Send, ShieldCheck } from 'lucide-react';

// Vendor Mobile Number Input Form (Step 1)
export const VendorMobileForm = ({ mobileNumber, setMobileNumber, onSubmit, loading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Store Owner Mobile Number</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
            +91
          </div>
          <input
            type="tel"
            maxLength={10}
            required
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="9876543210"
            className="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold tracking-wider text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Send OTP Code</span>
            <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
};

// Vendor 6-Digit OTP Verification Form (Step 2)
export const VendorOtpVerifyForm = ({
  otpDigits,
  handleOtpChange,
  handleOtpKeyDown,
  onSubmit,
  loading,
  canResend,
  resendTimer,
  onResendOtp,
  onChangeNumber
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700">Enter 6-Digit OTP</label>
          <button
            type="button"
            onClick={onChangeNumber}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Change Number
          </button>
        </div>

        {/* 6 OTP Input Boxes */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 my-2">
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-box-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              className="w-full h-10 sm:h-11 text-center text-base sm:text-lg font-black bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all p-0"
            />
          ))}
        </div>
      </div>

      {/* Resend Timer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Didn't receive OTP?</span>
        {canResend ? (
          <button
            type="button"
            onClick={onResendOtp}
            className="font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Resend OTP Code
          </button>
        ) : (
          <span className="font-semibold text-slate-400">Resend in {resendTimer}s</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Verify OTP & Access Store</span>
            <ShieldCheck size={16} />
          </>
        )}
      </button>
    </form>
  );
};
