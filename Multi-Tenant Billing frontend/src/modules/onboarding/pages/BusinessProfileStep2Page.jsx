import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useCreateProfileStep2Mutation } from '../hooks/useOnboardingQueries';
import OnboardingLayout from '../components/OnboardingLayout';
import OnboardingHeader from '../components/OnboardingHeader';
import {
  Store,
  FileText,
  MapPin,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function BusinessProfileStep2Page() {
  const navigate = useNavigate();
  const toast = useToast();
  const createStep2Mutation = useCreateProfileStep2Mutation();

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Retail',
    businessAddress: '',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '',
    country: 'India',
    gstNumber: '',
    panNumber: '',
    otherInvoiceInfo: 'Thank you for shopping with us! 7-day return policy.'
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;

    if (name === 'gstNumber' || name === 'panNumber') {
      finalVal = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    if (name === 'pincode') {
      finalVal = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: finalVal }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      const msg = 'Logo image file size must be less than 2MB.';
      setErrorMessage(msg);
      toast?.error(msg);
      return;
    }

    setIsUploadingLogo(true);
    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setIsUploadingLogo(false);
      toast?.success('Logo file selected successfully!');
    };
    reader.onerror = () => {
      setIsUploadingLogo(false);
      toast?.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = formData.businessName.trim();
    if (!trimmedName) {
      const msg = 'Business / Store Name is required.';
      setErrorMessage(msg);
      toast?.error(msg);
      return;
    }

    if (formData.gstNumber && formData.gstNumber.length !== 15) {
      toast?.warning('GSTIN is typically 15 alphanumeric characters.');
    }
    if (formData.panNumber && formData.panNumber.length !== 10) {
      toast?.warning('PAN Number is typically 10 characters.');
    }

    // Construct Multipart FormData payload as specified in API requirements
    const dataPayload = new FormData();
    dataPayload.append('businessName', trimmedName);
    dataPayload.append('businessType', formData.businessType);
    dataPayload.append('businessAddress', formData.businessAddress.trim());
    dataPayload.append('city', formData.city.trim());
    dataPayload.append('state', formData.state.trim());
    dataPayload.append('pincode', formData.pincode.trim());
    dataPayload.append('country', formData.country.trim() || 'India');
    dataPayload.append('gstNumber', formData.gstNumber.trim());
    dataPayload.append('panNumber', formData.panNumber.trim());
    dataPayload.append('otherInvoiceInfo', formData.otherInvoiceInfo.trim());

    // Attach logo under backend key 'businessLogo'
    if (logoFile) {
      dataPayload.append('businessLogo', logoFile);
    } else if (logoPreview) {
      dataPayload.append('businessLogo', logoPreview);
    }

    createStep2Mutation.mutate(dataPayload, {
      onSuccess: (resData) => {
        toast?.success('Store details and invoice preferences saved! 📄');
        localStorage.setItem('profileStep', '3');
        navigate('/choose-package');
      },
      onError: (error) => {
        const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save store profile details. Please try again.';
        toast?.error(errorMsg);
      }
    });
  };

  return (
    <OnboardingLayout>
      <OnboardingHeader currentStep={2} />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION A: General Business Profile */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-indigo-700 font-bold text-xs">
            <Store size={14} />
            <span>A. General Business Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business / Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Fresh Mart Grocery"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Type / Category
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Store Logo Upload with Loading Indicator */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Store Logo</span>
              <span className="text-slate-400 font-normal text-[10px]">(Optional, max 2MB)</span>
            </label>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 relative shadow-sm">
                {isUploadingLogo ? (
                  <Loader2 className="animate-spin text-indigo-600" size={20} />
                ) : logoPreview ? (
                  <img src={logoPreview} alt="Store Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 cursor-pointer transition-all">
                  {isUploadingLogo ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      <span>Upload Logo File</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    disabled={isUploadingLogo}
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: Address & Location Details */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-indigo-700 font-bold text-xs">
            <MapPin size={14} />
            <span>B. Address & Location Details</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Store Address
            </label>
            <input
              type="text"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              placeholder="Shop number, street, locality"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Delhi"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Delhi"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="110001"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: Tax & Invoice Preferences */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-indigo-700 font-bold text-xs">
            <FileText size={14} />
            <span>C. Tax & Invoice Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* GSTIN (Auto uppercase) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>GSTIN Number</span>
                <span className="text-slate-400 font-normal text-[10px]">(Optional, 15 Chars)</span>
              </label>
              <input
                type="text"
                name="gstNumber"
                maxLength={15}
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="07AAAAA0000A1Z5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 uppercase outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            {/* PAN Number (Auto uppercase) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>PAN Number</span>
                <span className="text-slate-400 font-normal text-[10px]">(Optional, 10 Chars)</span>
              </label>
              <input
                type="text"
                name="panNumber"
                maxLength={10}
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 uppercase outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Invoice Footer Terms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Billing Terms & Notes
            </label>
            <textarea
              name="otherInvoiceInfo"
              rows={2}
              value={formData.otherInvoiceInfo}
              onChange={handleChange}
              placeholder="e.g. Thank you for shopping with us! 7-day return policy."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-600 resize-none"
            />
          </div>
        </div>

        {/* Actions: Back & Proceed */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/create-business-profile/step-1')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={createStep2Mutation.isPending}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            {createStep2Mutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Proceed to Plan Selection</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
