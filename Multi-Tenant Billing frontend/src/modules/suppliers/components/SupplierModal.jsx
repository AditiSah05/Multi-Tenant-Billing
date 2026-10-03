
import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  CreditCard,
  Save,
} from 'lucide-react';

import BaseModal from '../../../components/common/BaseModal';
import { useToast } from '../../../context/ToastContext';
import { validateSupplierForm } from '../validators/supplierValidator';

const DEFAULT_FORM_STATE = {
  name: '',
  companyName: '',
  mobile: '',
  email: '',
  gstin: '',
  pan: '',
  address: '',
  city: '',
  state: '',
  supplierType: 'Local',
  creditLimit: '',
  paymentTerms: '30 Days',
  status: 'ACTIVE',
};

// =========================================================
// REUSABLE INPUT FIELD
// =========================================================
const InputField = ({
  label,
  required,
  icon: Icon,
  error,
  className = '',
  ...props
}) => (
  <div className="w-full min-w-0">
    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
      {label}{' '}
      {required && (
        <span className="text-rose-500">*</span>
      )}
    </label>

    <div className="relative w-full">
      {Icon && (
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}

      <input
        {...props}
        className={`
          w-full min-w-0
          ${Icon ? 'pl-10' : 'pl-3.5 sm:pl-4'}
          pr-3.5 sm:pr-4
          py-3 sm:py-2.5
          bg-slate-50
          border
          rounded-xl
          text-xs
          font-semibold
          text-slate-900
          placeholder:text-slate-400
          focus:bg-white
          focus:outline-none
          focus:ring-2
          transition-all
          ${error
            ? 'border-rose-400 focus:ring-rose-400'
            : 'border-slate-200 focus:ring-indigo-500'
          }
          ${className}
        `}
      />
    </div>

    {error && (
      <p className="text-[10px] sm:text-[11px] font-bold text-rose-500 mt-1 leading-4">
        {error}
      </p>
    )}
  </div>
);


// =========================================================
// SELECT FIELD
// =========================================================
const SelectField = ({
  label,
  name,
  value,
  onChange,
  children,
  className = '',
}) => (
  <div className="w-full min-w-0">
    <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
      {label}
    </label>

    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`
        w-full min-w-0
        px-3.5
        py-3 sm:py-2.5
        bg-slate-50
        border border-slate-200
        rounded-xl
        text-xs
        font-semibold
        text-slate-900
        focus:bg-white
        focus:outline-none
        focus:ring-2
        focus:ring-indigo-500
        transition-all
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </select>
  </div>
);


// =========================================================
// SUPPLIER MODAL
// =========================================================
const SupplierModal = ({
  isOpen,
  onClose,
  supplierToEdit = null,
  onSaveSupplier,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState(
    DEFAULT_FORM_STATE
  );

  const [errors, setErrors] = useState({});


  // =========================================================
  // INITIALIZE FORM
  // =========================================================
  useEffect(() => {
    if (supplierToEdit) {
      const rawStatus = supplierToEdit.status
        ? String(
          supplierToEdit.status
        ).toUpperCase()
        : 'ACTIVE';

      const initialStatus =
        rawStatus === 'SUSPENDED' ||
          rawStatus === 'INACTIVE'
          ? 'INACTIVE'
          : 'ACTIVE';

      setFormData({
        name: supplierToEdit.name || '',

        companyName:
          supplierToEdit.companyName || '',

        mobile:
          supplierToEdit.mobileNumber ||
          supplierToEdit.mobile ||
          '',

        email:
          supplierToEdit.email || '',

        gstin:
          supplierToEdit.gstin || '',

        pan:
          supplierToEdit.pan || '',

        address:
          supplierToEdit.address || '',

        city:
          supplierToEdit.city || '',

        state:
          supplierToEdit.state || '',

        supplierType:
          supplierToEdit.supplierType ||
          'Local',

        creditLimit:
          supplierToEdit.creditLimit !==
            undefined &&
            supplierToEdit.creditLimit !==
            null
            ? String(
              supplierToEdit.creditLimit
            )
            : '',

        paymentTerms:
          supplierToEdit.paymentTerms ||
          '30 Days',

        status: initialStatus,
      });
    } else {
      setFormData({
        ...DEFAULT_FORM_STATE,
      });
    }

    setErrors({});
  }, [supplierToEdit, isOpen]);


  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };


  // =========================================================
  // HANDLE SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      isValid,
      errors: validationErrors,
    } = validateSupplierForm(formData);

    if (!isValid) {
      setErrors(validationErrors);

      toast.error(
        'Please fix the validation errors in the form.'
      );

      return;
    }

    const cleanMobile = formData.mobile
      .toString()
      .trim()
      .replace(/\D/g, '')
      .slice(-10);

    const payload = {
      name: formData.name.trim(),

      companyName:
        formData.companyName.trim() ||
        null,

      mobileNumber: cleanMobile,

      email:
        formData.email.trim() || null,

      gstin:
        formData.gstin.trim() || null,

      pan:
        formData.pan.trim() || null,

      address:
        formData.address.trim() || null,

      city:
        formData.city.trim() || null,

      state:
        formData.state.trim() || null,

      supplierType:
        formData.supplierType,

      creditLimit:
        Number(formData.creditLimit) || 0,

      paymentTerms:
        formData.paymentTerms,

      status: formData.status
        ? String(
          formData.status
        ).toUpperCase()
        : 'ACTIVE',
    };

    try {
      await onSaveSupplier(
        payload,
        supplierToEdit?.id
      );

      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save supplier.'
      );
    }
  };


  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Building2}
      title={
        supplierToEdit
          ? 'Edit Supplier Profile'
          : 'Add New Supplier'
      }
      subtitle="Configure vendor contact info, GSTIN, credit limits and payment terms."
    >

      {/* =====================================================
          FORM CONTAINER
      ====================================================== */}
      <form
        onSubmit={handleSubmit}
        className="
          w-full
          max-w-full
          p-3
          sm:p-5
          md:p-6
          space-y-4
          sm:space-y-5
          overflow-x-hidden
        "
      >

        {/* ===================================================
            BASIC INFORMATION
        ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">

          {/* NAME */}
          <InputField
            label="Supplier / Display Name"
            required
            icon={User}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rajesh Supplies"
            error={errors.name}
          />


          {/* COMPANY */}
          <InputField
            label="Registered Company Name"
            icon={Building2}
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Rajesh Supplies Co."
          />


          {/* MOBILE */}
          <InputField
            label="Mobile / Phone Number"
            required
            icon={Phone}
            name="mobile"
            type="tel"
            inputMode="numeric"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            error={errors.mobile}
          />


          {/* EMAIL */}
          <InputField
            label="Email Address"
            type="email"
            icon={Mail}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rajesh@supplies.com"
            error={errors.email}
          />


          {/* GSTIN */}
          <InputField
            label="GSTIN Number"
            icon={FileText}
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            placeholder="07ABCDE1234F1Z5"
            className="uppercase font-mono"
            error={errors.gstin}
          />


          {/* PAN */}
          <InputField
            label="PAN Number"
            icon={FileText}
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            placeholder="ABCDE1234F"
            className="uppercase font-mono"
            error={errors.pan}
          />


          {/* CITY */}
          <InputField
            label="City"
            icon={MapPin}
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. New Delhi"
          />


          {/* STATE */}
          <InputField
            label="State"
            icon={MapPin}
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="e.g. Delhi"
          />

        </div>


        {/* ===================================================
            ADDRESS
        ==================================================== */}
        <div className="w-full">

          <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Street Address / Business Location
          </label>

          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Plot 42, Industrial Area Phase II"
            className="
              w-full
              min-w-0
              px-3.5
              sm:px-4
              py-3
              bg-slate-50
              border
              border-slate-200
              rounded-xl
              text-xs
              font-semibold
              text-slate-900
              placeholder:text-slate-400
              resize-y
              focus:bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
              transition-all
            "
          />

        </div>


        {/* ===================================================
            BUSINESS META
        ==================================================== */}
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-3.5
          sm:gap-4
          pt-3
          border-t
          border-slate-100
        ">

          {/* SUPPLIER TYPE */}
          <SelectField
            label="Supplier Category"
            name="supplierType"
            value={formData.supplierType}
            onChange={handleChange}
          >
            <option value="Local">
              Local Supplier
            </option>

            <option value="Wholesaler">
              Wholesaler
            </option>

            <option value="Manufacturer">
              Manufacturer
            </option>

            <option value="Distributor">
              Distributor
            </option>

            <option value="Import/Export">
              Import/Export
            </option>
          </SelectField>


          {/* CREDIT LIMIT */}
          <InputField
            label="Credit Limit (₹)"
            type="number"
            inputMode="decimal"
            icon={CreditCard}
            name="creditLimit"
            value={formData.creditLimit}
            onChange={handleChange}
            placeholder="0"
          />


          {/* PAYMENT TERMS */}
          <SelectField
            label="Payment Terms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            className="sm:col-span-2 lg:col-span-1"
          >
            <option value="Immediate">
              Immediate / Cash
            </option>

            <option value="15 Days">
              Net 15 Days
            </option>

            <option value="30 Days">
              Net 30 Days
            </option>

            <option value="45 Days">
              Net 45 Days
            </option>

            <option value="60 Days">
              Net 60 Days
            </option>
          </SelectField>

        </div>


        {/* ===================================================
            ACCOUNT STATUS
        ==================================================== */}
        <div className="
          pt-3
          border-t
          border-slate-100
        ">

          <SelectField
            label="Account Operational Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">
              Active (Can generate purchase bills & record payments)
            </option>

            <option value="INACTIVE">
              Inactive (Account suspended)
            </option>
          </SelectField>

        </div>


        {/* ===================================================
            FOOTER ACTIONS
        ==================================================== */}
        <div className="
          pt-4
          flex
          flex-col-reverse
          sm:flex-row
          sm:items-center
          sm:justify-end
          gap-2.5
          sm:gap-3
          border-t
          border-slate-100
        ">

          {/* CANCEL */}
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              sm:w-auto
              min-h-[44px]
              px-5
              py-3
              sm:py-2.5
              text-xs
              font-bold
              text-slate-600
              hover:text-slate-900
              bg-slate-100
              hover:bg-slate-200
              rounded-xl
              transition-all
              cursor-pointer
              text-center
            "
          >
            Cancel
          </button>


          {/* SAVE */}
          <button
            type="submit"
            className="
              w-full
              sm:w-auto
              min-h-[44px]
              flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              sm:py-2.5
              text-xs
              font-extrabold
              text-white
              bg-indigo-600
              hover:bg-indigo-700
              rounded-xl
              shadow-lg
              shadow-indigo-600/20
              hover:scale-[1.01]
              active:scale-[0.98]
              transition-all
              cursor-pointer
              text-center
            "
          >
            <Save size={16} />

            <span>
              {supplierToEdit
                ? 'Save Changes'
                : 'Create Supplier'}
            </span>
          </button>

        </div>

      </form>

    </BaseModal>
  );
};

export default SupplierModal;