import React from 'react';
import {
  Store,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Image,
  Upload
} from 'lucide-react';
import { STORE_CATEGORIES_MOCK } from '../../auth/data/authMockData';
import { useToast } from '../../../context/ToastContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const VendorProfileStep1Form = ({ profileData, setProfileData, onNext, onCancel, loading = false }) => {
  const toast = useToast();

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profileData.businessName || !profileData.businessName.trim()) {
      toast?.error('Store / Business Name is required.');
      return;
    }
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email.trim())) {
      toast?.error('Please enter a valid business email address format.');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
          1/2
        </div>
        <div>
          <div className="text-xs font-bold text-indigo-900">Step 1 of 2: Business & Address Info</div>
          <div className="text-[11px] text-indigo-700">Enter your store name, logo, tax ID, and contact details</div>
        </div>
      </div>

      {/* Business Name */}
      <Input
        label="Business / Store Name"
        required
        icon={Store}
        value={profileData.businessName || ''}
        onChange={(e) => handleChange('businessName', e.target.value)}
        placeholder="e.g. Apex Retail Superstore Jaipur"
      />

      {/* Business Logo Upload */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Store / Business Logo</span>
          <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 shadow-inner">
            {profileData.businessLogo ? (
              <img src={profileData.businessLogo} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <Image size={20} />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <Input
              value={profileData.businessLogo || ''}
              onChange={(e) => handleChange('businessLogo', e.target.value)}
              placeholder="Logo Image URL (e.g. https://...)"
            />
            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              <Upload size={12} />
              <span>Or Upload File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleChange('businessLogo', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Store Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STORE_CATEGORIES_MOCK.map((cat) => {
            const isSelected = profileData.category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleChange('category', cat.id)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="text-[11px] font-bold truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GSTIN & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="GSTIN (Optional)"
          icon={FileCheck}
          uppercase
          maxLength={15}
          value={profileData.gstin || ''}
          onChange={(e) => handleChange('gstin', e.target.value)}
          placeholder="22AAAAA0000A1Z5"
        />

        <Input
          label="Business Email"
          icon={Mail}
          type="email"
          value={profileData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="owner@store.com"
        />
      </div>

      {/* Address & City */}
      <Input
        label="Store Address"
        icon={MapPin}
        value={profileData.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
        placeholder="Shop 12, Main Market, MG Road"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          value={profileData.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Jaipur"
        />

        <Input
          label="State"
          value={profileData.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="Rajasthan"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          Cancel & Back to OTP
        </button>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!profileData.businessName}
          icon={ArrowRight}
          iconPosition="right"
        >
          {loading ? 'Saving Step 1...' : 'Next: Branding & Invoices'}
        </Button>
      </div>
    </form>
  );
};

export default VendorProfileStep1Form;
