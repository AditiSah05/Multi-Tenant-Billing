/**
 * Validates Email Address Format
 */
export const isValidEmail = (email = '') => {
  if (!email || !email.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validates 10-Digit Mobile Number
 */
export const isValidMobile = (mobile = '') => {
  const clean = String(mobile).replace(/\D/g, '');
  return clean.length === 10;
};

/**
 * Validates 15-Digit GSTIN Format
 */
export const isValidGstin = (gstin = '') => {
  if (!gstin) return true; // Optional field
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase());
};

/**
 * Validates 10-Digit PAN Format
 */
export const isValidPan = (pan = '') => {
  if (!pan) return true; // Optional field
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
};
