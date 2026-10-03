import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Search, Plus, Users } from 'lucide-react';

const CustomerDetailsCard = ({
  billType,
  customersList = [],
  customerSearchQuery,
  onCustomerSearchChange,
  customerDropdownOpen,
  onCustomerDropdownOpenChange,
  onSelectCustomer,
  onOpenAddCustomerModal,
  // B2C fields
  customerName,
  onCustomerNameChange,
  mobile,
  onMobileChange,
  billingAddress,
  onBillingAddressChange,
  // B2B fields
  businessName,
  onBusinessNameChange,
  gstin,
  onGstinChange,
  contactPerson,
  onContactPersonChange,
  shippingAddress,
  onShippingAddressChange,
}) => {
  const navigate = useNavigate();
  const isB2B = billType === 'B2B';
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onCustomerDropdownOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCustomerDropdownOpenChange]);

  const queryLower = (customerSearchQuery || '').trim().toLowerCase();
  const cleanQ = queryLower.replace(/[^a-z0-9]/g, '');

  const filteredCustomers = customersList.filter((c) => {
    // If in B2B mode and query is empty, prioritize B2B/Business customers
    if (isB2B && !queryLower) {
      const isB2BClient = c.type === 'B2B' || c.customerType === 'B2B' || Boolean(c.gstin || c.gstNo || c.gstNumber) || Boolean(c.businessName || c.company);
      if (!isB2BClient) return false;
    }

    if (!queryLower) return true;

    const nameStr = `${c.name || ''} ${c.customerName || ''} ${c.businessName || ''} ${c.contactPerson || ''} ${c.company || ''}`.toLowerCase();
    const gstinStr = `${c.gstin || ''} ${c.gstNo || ''} ${c.gstNumber || ''}`.toLowerCase();
    const rawPhone = String(c.mobile || c.phone || c.mobileNumber || c.contactNumber || c.phoneNumber || c.customerMobile || '');
    const emailStr = (c.email || c.emailAddress || '').toLowerCase();

    const nameMatch = nameStr.includes(queryLower);
    const gstinMatch = gstinStr.includes(queryLower);
    const emailMatch = emailStr.includes(queryLower);

    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneMatch = rawPhone.toLowerCase().includes(queryLower) || (cleanQ.length >= 2 && cleanPhone.includes(cleanQ));

    return nameMatch || gstinMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          {isB2B ? <Building2 className="text-indigo-600" size={18} /> : <User className="text-indigo-600" size={18} />}
          <span>{isB2B ? 'Business Details' : 'Customer Details'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/customers')}
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
            title="View All Customers Directory"
          >
            <Users size={14} />
            <span>View Directory</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddCustomerModal}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={15} />
            <span>{isB2B ? 'Add New Business' : 'Add New Customer'}</span>
          </button>
        </div>
      </div>

      {/* Live Search & Auto-Fill Customer Selection Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          {isB2B ? 'Select Business / Customer 🔍' : 'Select Customer 🔍'}
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={customerSearchQuery}
            onFocus={() => onCustomerDropdownOpenChange(true)}
            onChange={(e) => {
              onCustomerSearchChange(e.target.value);
              onCustomerDropdownOpenChange(true);
            }}
            placeholder={isB2B ? 'Search by business name, GSTIN, or phone...' : 'Search by customer name or mobile number...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none cursor-pointer"
          />
        </div>

        {/* Dropdown Menu */}
        {customerDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs font-semibold animate-fadeIn">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  No customer found matching <span className="text-indigo-600 font-extrabold">"{customerSearchQuery}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCustomerDropdownOpenChange(false);
                    onOpenAddCustomerModal();
                  }}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add New Customer Profile</span>
                </button>
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const displayName = c.name || c.businessName || c.customerName || 'Customer';
                const phoneStr = c.mobileNumber || c.mobile || c.phone || 'N/A';
                const isB2BCust = c.type === 'B2B' || c.customerType === 'B2B' || Boolean(c.gstin || c.gstNo || c.businessName);

                return (
                  <div
                    key={c.id || c._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelectCustomer(c);
                    }}
                    onClick={() => onSelectCustomer(c)}
                    className="p-3 hover:bg-indigo-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {displayName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {(c.gstin || c.gstNo) ? `GSTIN: ${c.gstin || c.gstNo} | ` : ''}Phone: {phoneStr}
                        {c.contactPerson ? ` | Contact: ${c.contactPerson}` : ''}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isB2BCust
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isB2BCust ? 'B2B' : 'B2C'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Auto-filled Input Fields */}
      {isB2B ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              placeholder="e.g. Acme Enterprises Pvt Ltd"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              GSTIN
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => onGstinChange(e.target.value)}
              placeholder="27AAAAA0000A1Z5"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => onContactPersonChange(e.target.value)}
              placeholder="Rajesh Kumar"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => onMobileChange(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => onBillingAddressChange(e.target.value)}
              placeholder="Registered Street Address"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shipping Address
            </label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => onShippingAddressChange(e.target.value)}
              placeholder="Delivery / Warehouse Address"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Rahul Sharma"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => onMobileChange(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => onBillingAddressChange(e.target.value)}
              placeholder="City, State"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsCard;
