/**
 * Formats amount into standard currency string (e.g. ₹12,500)
 */
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const numericAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2
    }).format(numericAmount);
  } catch (error) {
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  }
};

/**
 * Formats ISO date string into readable format (e.g. 26 Aug 2026)
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Extracts 10-digit mobile number from string input
 */
export const cleanMobileNumber = (input = '') => {
  return String(input).replace(/\D/g, '').slice(-10);
};
