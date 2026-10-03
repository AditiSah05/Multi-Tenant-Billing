import React, { useState, useEffect, useRef } from 'react';
import { X, User, Building2, Phone, Mail, MapPin, CheckCircle2, Loader2, Edit3, ChevronDown, Search } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useCreateCustomerMutation, useUpdateCustomerMutation } from '../hooks/useCustomerQueries';

const INDIAN_STATES = [
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '24', name: 'Gujarat' },
  { code: '08', name: 'Rajasthan' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '06', name: 'Haryana' },
  { code: '10', name: 'Bihar' },
  { code: '21', name: 'Odisha' },
  { code: '18', name: 'Assam' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '20', name: 'Jharkhand' },
  { code: '30', name: 'Goa' },
];

const AddCustomerModal = ({
  isOpen,
  onClose,
  isB2BMode = false,
  customerToEdit = null,
  onCustomerAdded,
  onCustomerUpdated,
}) => {
  const toast = useToast();
  const createCustomerMutation = useCreateCustomerMutation();
  const updateCustomerMutation = useUpdateCustomerMutation();

  const isEditing = Boolean(customerToEdit);

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const stateDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setStateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    gstin: '',
    panNumber: '',
    stateCode: '27',
    state: 'Maharashtra',
    city: '',
    pincode: '',
    contactPerson: '',
    mobile: '',
    email: '',
    billingAddress: '',
    shippingAddress: '',
    creditPeriodDays: 30,
    creditLimit: 0,
  });

  useEffect(() => {
    if (customerToEdit) {
      const gstinVal = (customerToEdit.gstin || customerToEdit.gstNo || '').toUpperCase();
      const extractedPan = customerToEdit.panNumber || (gstinVal.length >= 12 ? gstinVal.slice(2, 12) : '');
      const extractedStateCode = customerToEdit.stateCode || (gstinVal.length >= 2 ? gstinVal.slice(0, 2) : '27');
      const matchedState = INDIAN_STATES.find(s => s.code === extractedStateCode)?.name || customerToEdit.state || 'Maharashtra';

      setFormData({
        name: customerToEdit.name || customerToEdit.customerName || '',
        businessName: customerToEdit.businessName || '',
        gstin: gstinVal,
        panNumber: extractedPan,
        stateCode: extractedStateCode,
        state: matchedState,
        city: customerToEdit.city || '',
        pincode: customerToEdit.pincode || '',
        contactPerson: customerToEdit.contactPerson || '',
        mobile: customerToEdit.mobileNumber || customerToEdit.mobile || customerToEdit.phone || '',
        email: customerToEdit.email || '',
        billingAddress: customerToEdit.address || customerToEdit.billingAddress || '',
        shippingAddress: customerToEdit.shippingAddress || customerToEdit.address || '',
        creditPeriodDays: customerToEdit.creditPeriodDays !== undefined ? customerToEdit.creditPeriodDays : 30,
        creditLimit: customerToEdit.creditLimit !== undefined ? customerToEdit.creditLimit : 0,
      });
    } else {
      setFormData({
        name: '',
        businessName: '',
        gstin: '',
        panNumber: '',
        stateCode: '27',
        state: 'Maharashtra',
        city: '',
        pincode: '',
        contactPerson: '',
        mobile: '',
        email: '',
        billingAddress: '',
        shippingAddress: '',
        creditPeriodDays: 30,
        creditLimit: 0,
      });
    }
  }, [customerToEdit, isOpen]);

  const handleGstinChange = (val) => {
    const uppercaseGstin = val.toUpperCase().trim();
    let updatedPan = formData.panNumber;
    let updatedStateCode = formData.stateCode;
    let updatedState = formData.state;

    if (uppercaseGstin.length >= 2) {
      const code = uppercaseGstin.slice(0, 2);
      const foundState = INDIAN_STATES.find((s) => s.code === code);
      if (foundState) {
        updatedStateCode = foundState.code;
        updatedState = foundState.name;
      }
    }

    if (uppercaseGstin.length >= 12) {
      updatedPan = uppercaseGstin.slice(2, 12);
    }

    setFormData((prev) => ({
      ...prev,
      gstin: uppercaseGstin,
      panNumber: updatedPan,
      stateCode: updatedStateCode,
      state: updatedState,
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveB2B = isEditing
      ? customerToEdit.customerType === 'B2B' || customerToEdit.type === 'B2B' || isB2BMode || Boolean(formData.businessName || formData.gstin)
      : isB2BMode;

    if (effectiveB2B && !formData.businessName.trim() && !formData.name.trim()) {
      toast.error('Business Name or Contact Name is required.');
      return;
    }
    if (effectiveB2B && (!formData.gstin || !formData.gstin.trim())) {
      toast.error('GSTIN is required for B2B customers.');
      return;
    }
    if (formData.gstin && formData.gstin.trim().length >= 2 && formData.stateCode) {
      const gstinPrefix = formData.gstin.trim().slice(0, 2);
      if (gstinPrefix !== formData.stateCode) {
        toast.error(`GSTIN state code prefix '${gstinPrefix}' does not match stateCode '${formData.stateCode}'.`);
        return;
      }
    }
    if (!effectiveB2B && !formData.name.trim()) {
      toast.error('Customer Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      toast.error('Mobile Number is required.');
      return;
    }

    const payload = {
      name: effectiveB2B ? (formData.businessName.trim() || formData.name.trim()) : formData.name.trim(),
      customerName: formData.name.trim() || formData.contactPerson.trim() || formData.businessName.trim(),
      businessName: formData.businessName.trim(),
      contactPerson: formData.contactPerson.trim() || formData.name.trim(),
      gstin: formData.gstin.trim().toUpperCase(),
      panNumber: formData.panNumber.trim().toUpperCase(),
      stateCode: formData.stateCode,
      state: formData.state,
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      mobile: formData.mobile.trim(),
      mobileNumber: formData.mobile.trim(),
      phone: formData.mobile.trim(),
      email: formData.email.trim(),
      billingAddress: formData.billingAddress.trim(),
      address: formData.billingAddress.trim(),
      shippingAddress: formData.shippingAddress.trim() || formData.billingAddress.trim(),
      creditPeriodDays: Number(formData.creditPeriodDays) || 30,
      creditLimit: Number(formData.creditLimit) || 0,
      type: effectiveB2B ? 'B2B' : 'B2C',
      customerType: effectiveB2B ? 'B2B' : 'B2C',
    };

    try {
      if (isEditing) {
        const targetId = customerToEdit.id || customerToEdit._id;
        const res = await updateCustomerMutation.mutateAsync({ id: targetId, data: payload });
        const updatedCust = res?.data?.customer || res?.customer || res?.data || { id: targetId, ...payload };
        toast.success(`Customer profile "${payload.name}" updated successfully!`);
        if (onCustomerUpdated) onCustomerUpdated(updatedCust);
      } else {
        const res = await createCustomerMutation.mutateAsync(payload);
        const serverCust = res?.data?.customer || res?.customer || res?.data || res;
        const createdCust = {
          ...payload,
          ...serverCust,
          id: serverCust?.id || serverCust?._id || serverCust?.customerId,
        };
        toast.success(`${effectiveB2B ? 'Business' : 'Customer'} "${createdCust.name || payload.name}" created successfully!`);
        if (onCustomerAdded) onCustomerAdded(createdCust);
      }

      setFormData({
        name: '',
        businessName: '',
        gstin: '',
        panNumber: '',
        stateCode: '27',
        state: 'Maharashtra',
        city: '',
        pincode: '',
        contactPerson: '',
        mobile: '',
        email: '',
        billingAddress: '',
        shippingAddress: '',
        creditPeriodDays: 30,
        creditLimit: 0,
      });
      onClose();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save customer to database. Please check backend connection.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              {isEditing ? <Edit3 size={20} /> : isB2BMode ? <Building2 size={20} /> : <User size={20} />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? 'Edit Customer Profile' : (isB2BMode ? 'Add New Business (B2B)' : 'Add New Customer (B2C)')}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update client contact, GSTIN, and billing address' : 'Save client details for instant invoicing'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 space-y-4 mt-3">
          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-semibold overflow-y-auto pr-1 flex-1">
            {isB2BMode && (
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-extrabold mb-1">
                  Business / Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required={isB2BMode}
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Apex Technologies Pvt Ltd"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-extrabold mb-1">
                {isB2BMode ? 'Contact Person Name' : 'Customer Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required={!isB2BMode}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            {isB2BMode && (
              <>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">
                    GSTIN Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={isB2BMode}
                    value={formData.gstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    placeholder="27AAACB1234C1Z1"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase focus:bg-white focus:border-indigo-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="AAACB1234C"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase focus:bg-white focus:border-indigo-600 outline-none font-mono"
                  />
                </div>
              </>
            )}

            <div className="relative" ref={stateDropdownRef}>
              <label className="block text-slate-700 font-extrabold mb-1">State / Place of Supply</label>
              <div
                onClick={() => setStateDropdownOpen((prev) => !prev)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none font-bold cursor-pointer flex items-center justify-between"
              >
                <span>{formData.stateCode} - {formData.state}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${stateDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {stateDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 max-h-44 overflow-y-auto divide-y divide-slate-100 text-xs font-semibold animate-fadeIn">
                  <div className="p-2 bg-slate-50 sticky top-0 border-b border-slate-100 z-10">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={stateSearchQuery}
                        onChange={(e) => setStateSearchQuery(e.target.value)}
                        placeholder="Search state name or code..."
                        className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                  {INDIAN_STATES.filter((s) => {
                    const q = stateSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return s.code.includes(q) || s.name.toLowerCase().includes(q);
                  }).map((s) => (
                    <div
                      key={s.code}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          stateCode: s.code,
                          state: s.name,
                        });
                        setStateDropdownOpen(false);
                        setStateSearchQuery('');
                      }}
                      className={`p-2.5 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center justify-between ${formData.stateCode === s.code ? 'bg-indigo-50/70 font-extrabold text-indigo-700' : 'text-slate-800'
                        }`}
                    >
                      <span>{s.name}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {s.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="400069"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-extrabold mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            {isB2BMode && (
              <>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Credit Terms (Days)</label>
                  <input
                    type="number"
                    value={formData.creditPeriodDays}
                    onChange={(e) => setFormData({ ...formData, creditPeriodDays: e.target.value })}
                    placeholder="30"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    placeholder="500000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none font-bold"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-extrabold mb-1">Billing Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  rows={2}
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  placeholder="Shop No. 12, Main Market Road, Mumbai"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none resize-none"
                />
              </div>
            </div>

            {isB2BMode && (
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-extrabold mb-1">Shipping Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    placeholder="Warehouse / Delivery Address (Optional)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {createCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{isEditing ? 'Update Profile' : 'Save & Select'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
