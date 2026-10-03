
import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  FileText,
} from 'lucide-react';

import BaseModal from '../../../components/common/BaseModal';
import { useToast } from '../../../context/ToastContext';
import { validatePaymentForm } from '../validators/paymentValidator';

const RecordPaymentModal = ({
  isOpen,
  onClose,
  supplier = null,
  onRecordPayment,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date()
      .toISOString()
      .split('T')[0],
    paymentMethod: 'Bank Transfer',
    reference: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen || !supplier) return null;


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
    } = validatePaymentForm(formData);

    if (!isValid) {
      setErrors(validationErrors);

      toast.error(
        'Please enter a valid payment amount.'
      );

      return;
    }

    const numericAmount = Number(
      formData.amount
    );

    let backendPaymentMethod = 'CASH';

    if (
      formData.paymentMethod ===
      'Bank Transfer'
    ) {
      backendPaymentMethod = 'OTHER';
    } else if (
      formData.paymentMethod === 'UPI'
    ) {
      backendPaymentMethod = 'UPI';
    } else if (
      formData.paymentMethod === 'Cash'
    ) {
      backendPaymentMethod = 'CASH';
    } else {
      backendPaymentMethod = 'OTHER';
    }

    const paymentPayload = {
      amount: numericAmount,
      paymentMethod: backendPaymentMethod,
      referenceNumber:
        formData.reference.trim() || null,
      notes:
        formData.notes.trim() || null,
    };

    try {
      await onRecordPayment(
        supplier.id,
        paymentPayload
      );

      toast.success(
        `Payment of ₹${numericAmount.toLocaleString(
          'en-IN'
        )} recorded for ${supplier.name}!`
      );

      setFormData({
        amount: '',
        paymentDate: new Date()
          .toISOString()
          .split('T')[0],
        paymentMethod: 'Bank Transfer',
        reference: '',
        notes: '',
      });

      setErrors({});

      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to record payment.'
      );
    }
  };


  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      icon={CreditCard}
      title="Record Supplier Payment"
      subtitle={`Outward payment to ${supplier.name}`}
      maxWidth="max-w-md"
    >

      {/* =====================================================
          FORM
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
            OUTSTANDING BALANCE
        ==================================================== */}
        <div
          className="
            w-full
            min-w-0
            p-3.5
            sm:p-4
            bg-indigo-50/70
            border
            border-indigo-100
            rounded-2xl
            flex
            flex-col
            min-[380px]:flex-row
            min-[380px]:items-center
            justify-between
            gap-2.5
            min-[380px]:gap-3
          "
        >

          <div className="min-w-0 flex-1">

            <div
              className="
                text-[9px]
                sm:text-[11px]
                font-extrabold
                text-indigo-900
                uppercase
                tracking-wider
                leading-4
              "
            >
              Current Outstanding
            </div>

            <div
              className="
                text-xs
                font-bold
                text-slate-500
                truncate
                mt-0.5
              "
            >
              {supplier.name}
            </div>

          </div>


          <div
            className="
              text-lg
              sm:text-xl
              font-black
              text-indigo-700
              shrink-0
              break-all
            "
          >
            ₹
            {(
              supplier.outstandingDue ??
              supplier.totalPayable ??
              0
            ).toLocaleString('en-IN')}
          </div>

        </div>


        {/* ===================================================
            PAYMENT AMOUNT
        ==================================================== */}
        <div className="w-full min-w-0">

          <label
            className="
              block
              text-[10px]
              sm:text-xs
              font-bold
              text-slate-700
              mb-1.5
              uppercase
              tracking-wider
            "
          >
            Payment Amount (₹)
            <span className="text-rose-500">
              {' '}*
            </span>
          </label>


          <div className="relative w-full">

            <span
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-500
                font-extrabold
                pointer-events-none
              "
            >
              ₹
            </span>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              inputMode="decimal"
              min="0"
              className={`
                w-full
                min-w-0
                pl-9
                pr-4
                py-3
                sm:py-2.5
                bg-slate-50
                border
                rounded-xl
                text-sm
                font-extrabold
                text-slate-900
                placeholder:text-slate-400
                focus:bg-white
                focus:outline-none
                focus:ring-2
                transition-all
                ${errors.amount
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-indigo-500'
                }
              `}
            />

          </div>


          {errors.amount && (
            <p className="text-[10px] sm:text-[11px] font-bold text-rose-500 mt-1 leading-4">
              {errors.amount}
            </p>
          )}

        </div>


        {/* ===================================================
            PAYMENT DATE
        ==================================================== */}
        <div className="w-full min-w-0">

          <label
            className="
              block
              text-[10px]
              sm:text-xs
              font-bold
              text-slate-700
              mb-1.5
              uppercase
              tracking-wider
            "
          >
            Payment Date
          </label>


          <div className="relative w-full">

            <Calendar
              size={16}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            />

            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="
                w-full
                min-w-0
                pl-10
                pr-3.5
                sm:pr-4
                py-3
                sm:py-2.5
                bg-slate-50
                border
                border-slate-200
                rounded-xl
                text-xs
                font-semibold
                text-slate-900
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
                transition-all
              "
            />

          </div>

        </div>


        {/* ===================================================
            PAYMENT METHOD
        ==================================================== */}
        <div className="w-full min-w-0">

          <label
            className="
              block
              text-[10px]
              sm:text-xs
              font-bold
              text-slate-700
              mb-1.5
              uppercase
              tracking-wider
            "
          >
            Payment Method
          </label>


          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="
              w-full
              min-w-0
              px-3.5
              py-3
              sm:py-2.5
              bg-slate-50
              border
              border-slate-200
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
            "
          >
            <option value="Bank Transfer">
              Bank Transfer (NEFT/RTGS/IMPS)
            </option>

            <option value="UPI">
              UPI / QR Code
            </option>

            <option value="Cash">
              Cash Payment
            </option>

            <option value="Cheque">
              Cheque
            </option>
          </select>

        </div>


        {/* ===================================================
            REFERENCE NUMBER
        ==================================================== */}
        <div className="w-full min-w-0">

          <label
            className="
              block
              text-[10px]
              sm:text-xs
              font-bold
              text-slate-700
              mb-1.5
              uppercase
              tracking-wider
            "
          >
            Reference / UTR / Txn No.
          </label>


          <div className="relative w-full">

            <FileText
              size={16}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            />

            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="e.g. UTR99881122"
              className="
                w-full
                min-w-0
                pl-10
                pr-4
                py-3
                sm:py-2.5
                bg-slate-50
                border
                border-slate-200
                rounded-xl
                text-xs
                font-semibold
                text-slate-900
                placeholder:text-slate-400
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
                transition-all
                font-mono
              "
            />

          </div>

        </div>


        {/* ===================================================
            NOTES
        ==================================================== */}
        <div className="w-full min-w-0">

          <label
            className="
              block
              text-[10px]
              sm:text-xs
              font-bold
              text-slate-700
              mb-1.5
              uppercase
              tracking-wider
            "
          >
            Payment Notes
          </label>


          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Payment against Invoice PUR-1001"
            className="
              w-full
              min-w-0
              px-3.5
              sm:px-4
              py-3
              sm:py-2.5
              bg-slate-50
              border
              border-slate-200
              rounded-xl
              text-xs
              font-semibold
              text-slate-900
              placeholder:text-slate-400
              focus:bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
              transition-all
            "
          />

        </div>


        {/* ===================================================
            ACTIONS
        ==================================================== */}
        <div
          className="
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
          "
        >

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


          {/* RECORD PAYMENT */}
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
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              font-extrabold
              text-xs
              rounded-xl
              shadow-lg
              shadow-indigo-600/30
              transition-all
              active:scale-[0.98]
              cursor-pointer
              text-center
            "
          >
            <CreditCard
              size={15}
              className="shrink-0"
            />

            <span className="whitespace-nowrap">
              Record Outward Payment
            </span>
          </button>

        </div>

      </form>

    </BaseModal>
  );
};

export default RecordPaymentModal;