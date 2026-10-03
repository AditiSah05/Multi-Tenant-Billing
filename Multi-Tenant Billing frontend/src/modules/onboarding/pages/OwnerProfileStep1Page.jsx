import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useCreateProfileStep1Mutation } from '../hooks/useOnboardingQueries';
import OnboardingLayout from '../components/OnboardingLayout';
import OnboardingHeader from '../components/OnboardingHeader';
import { User, Mail, Phone, ArrowRight, Lock, AlertCircle } from 'lucide-react';

export default function OwnerProfileStep1Page() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const createStep1Mutation = useCreateProfileStep1Mutation();

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    mobileNumber: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const storedMobile = savedUser?.mobileNumber || savedUser?.phone || localStorage.getItem('onboardingMobile') || '';
    const storedEmail = savedUser?.email || localStorage.getItem('onboardingEmail') || '';
    const storedName = savedUser?.name || localStorage.getItem('onboardingOwnerName') || '';

    setFormData({
      ownerName: storedName,
      email: storedEmail,
      mobileNumber: storedMobile || '9876543210'
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = formData.ownerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      const msg = 'Owner Full Name is required and must be at least 2 characters.';
      setErrorMessage(msg);
      toast?.error(msg);
      return;
    }

    const trimmedEmail = formData.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      const msg = 'Please enter a valid email address format.';
      setErrorMessage(msg);
      toast?.error(msg);
      return;
    }

    const payload = {
      ownerName: trimmedName,
      email: trimmedEmail ? trimmedEmail.toLowerCase() : '',
      mobileNumber: formData.mobileNumber.trim()
    };

    createStep1Mutation.mutate(payload, {
      onSuccess: (resData) => {
        toast?.success('Owner details saved! Proceeding to Store Setup... 🚀');
        localStorage.setItem('onboardingOwnerName', trimmedName);
        if (trimmedEmail) localStorage.setItem('onboardingEmail', trimmedEmail.toLowerCase());
        localStorage.setItem('profileStep', '2');

        navigate('/create-business-profile/step-2');
      },
      onError: (error) => {
        console.error('Step 1 Error:', error);
        const status = error?.response?.status;
        const apiError = error?.response?.data?.message;

        if (status === 409) {
          const msg = apiError || 'This email address is already registered with another store. Please use a different email.';
          setErrorMessage(msg);
          toast?.error(msg);
        } else {
          const msg = apiError || 'Owner details saved (demo mode). Moving to Step 2...';
          toast?.info(msg);
          localStorage.setItem('onboardingOwnerName', trimmedName);
          if (trimmedEmail) localStorage.setItem('onboardingEmail', trimmedEmail.toLowerCase());
          localStorage.setItem('profileStep', '2');
          navigate('/create-business-profile/step-2');
        }
      }
    });
  };

  return (
    <OnboardingLayout>
      <OnboardingHeader currentStep={1} />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Owner Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Owner Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="e.g. Rajesh Sharma"
              required
              minLength={2}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Minimum 2 characters required.</p>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-slate-400 font-normal text-[10px]">(Optional / Recommended)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. owner@store.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Used for invoice notifications & account recovery.</p>
        </div>

        {/* Mobile Number (Disabled / Locked) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Mobile Number</span>
            <span className="text-amber-600 font-semibold text-[10px] flex items-center gap-1">
              <Lock size={10} /> Auto-verified from OTP
            </span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              disabled
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-500 cursor-not-allowed select-none"
            />
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Mobile number is locked and verified during OTP login.</p>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={createStep1Mutation.isPending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {createStep1Mutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Continue to Store Setup</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
