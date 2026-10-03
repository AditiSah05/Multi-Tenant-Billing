import React from 'react';
import {
  Tag,
  Receipt,
  MessageSquare,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { TAX_RATE_OPTIONS_MOCK } from '../../auth/data/authMockData';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const VendorProfileStep2Form = ({ profileData, setProfileData, onNext, onBack, loading = false }) => {
  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
          2/2
        </div>
        <div>
          <div className="text-xs font-bold text-indigo-900">Step 2 of 2: Invoice & Branding Config</div>
          <div className="text-[11px] text-indigo-700">Configure your invoice headers, prefix, and default tax rates</div>
        </div>
      </div>

      {/* Invoice Prefix & Currency */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Invoice Serial Prefix"
          icon={Tag}
          uppercase
          maxLength={8}
          value={profileData.invoicePrefix || 'INV-'}
          onChange={(e) => handleChange('invoicePrefix', e.target.value)}
          placeholder="INV-"
        />

        <Select
          label="Store Currency"
          value={profileData.currency || 'INR'}
          onChange={(e) => handleChange('currency', e.target.value)}
          options={[
            { value: 'INR', label: 'Indian Rupee (₹ INR)' },
            { value: 'USD', label: 'US Dollar ($ USD)' },
            { value: 'EUR', label: 'Euro (€ EUR)' },
            { value: 'AED', label: 'UAE Dirham (AED)' }
          ]}
        />
      </div>

      {/* Default Tax / GST Rate */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          Default Tax / GST Setting
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TAX_RATE_OPTIONS_MOCK.map((t) => {
            const isSelected = (profileData.taxRate || '18') === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => handleChange('taxRate', t.id)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold text-xs shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 text-xs hover:bg-slate-100 font-medium'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice Footer Terms */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          Invoice Footer Terms / Message
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <textarea
            rows={2}
            value={profileData.invoiceTerms || 'Thank you for shopping with us! Goods once sold cannot be returned.'}
            onChange={(e) => handleChange('invoiceTerms', e.target.value)}
            placeholder="Thank you for shopping..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 outline-none resize-none"
          />
        </div>
      </div>

      {/* Invoice Header Branding Preview */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-3.5 text-xs space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1"><Receipt size={12} /> Header Preview</span>
          <span className="text-emerald-400">Sample Bill</span>
        </div>
        <div className="font-bold text-sm text-white">{profileData.businessName || 'Your Store Name'}</div>
        <div className="text-[11px] text-slate-300">{profileData.address || 'Store Address'}, {profileData.city || 'City'}</div>
        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span>GSTIN: {profileData.gstin || 'NON-GST'}</span>
          <span className="font-bold text-indigo-300">No: {profileData.invoicePrefix || 'INV-'}00101</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Back
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          {loading ? 'Saving Profile...' : 'Next: Choose Package'}
        </Button>
      </div>
    </form>
  );
};

export default VendorProfileStep2Form;
