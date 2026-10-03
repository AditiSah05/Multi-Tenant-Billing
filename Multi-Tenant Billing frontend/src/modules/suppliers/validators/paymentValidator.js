/**
 * Validates Supplier Payment Form Data
 * @param {Object} paymentData
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validatePaymentForm = (paymentData = {}) => {
  const errors = {};
  const numericAmount = Number(paymentData.amount);

  if (!paymentData.amount || isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Please enter a valid positive payment amount.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
