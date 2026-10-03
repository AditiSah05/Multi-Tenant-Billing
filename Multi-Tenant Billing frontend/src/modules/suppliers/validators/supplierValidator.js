import { isValidEmail, isValidMobile, isValidGstin, isValidPan } from '../../../utils/validators';

/**
 * Validates Supplier Form Data
 * @param {Object} formData
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateSupplierForm = (formData = {}) => {
  const errors = {};

  // 1. Supplier Name Validation
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Supplier name is required.';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Supplier name must be at least 2 characters.';
  }

  // 2. Mobile Number Validation
  if (!formData.mobile || !formData.mobile.toString().trim()) {
    errors.mobile = 'Mobile number is required.';
  } else if (!isValidMobile(formData.mobile)) {
    errors.mobile = 'Please enter a valid 10-digit mobile number.';
  }

  // 3. Email Address Validation (Optional field)
  if (formData.email && formData.email.trim() && !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // 4. GSTIN Number Validation (Optional field)
  if (formData.gstin && formData.gstin.trim() && !isValidGstin(formData.gstin)) {
    errors.gstin = 'Invalid GSTIN format (e.g. 07ABCDE1234F1Z5).';
  }

  // 5. PAN Number Validation (Optional field)
  if (formData.pan && formData.pan.trim() && !isValidPan(formData.pan)) {
    errors.pan = 'Invalid PAN format (e.g. ABCDE1234F).';
  }

  // 6. Credit Limit Validation
  if (formData.creditLimit !== undefined && formData.creditLimit !== '') {
    const numLimit = Number(formData.creditLimit);
    if (isNaN(numLimit) || numLimit < 0) {
      errors.creditLimit = 'Credit limit must be a non-negative number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
