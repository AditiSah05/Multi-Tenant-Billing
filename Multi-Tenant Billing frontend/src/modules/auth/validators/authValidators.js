/**
 * Auth Module Frontend Validation Layer
 * Matches backend Zod schema validation rules (auth.validator.js)
 */

export const validateAdminLogin = ({ email, password }) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Admin email address is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address format.' };
  }

  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }

  return { isValid: true };
};

export const validateSendOtp = (mobileNumber) => {
  if (!mobileNumber) {
    return { isValid: false, error: 'Store owner mobile number is required.' };
  }

  const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);

  if (cleanMobile.length !== 10) {
    return { isValid: false, error: 'Mobile number must be a valid 10-digit number.' };
  }

  if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    return { isValid: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  return { isValid: true, cleanMobile };
};

export const validateVerifyOtp = ({ mobileNumber, otpCode }) => {
  const mobileVal = validateSendOtp(mobileNumber);
  if (!mobileVal.isValid) {
    return mobileVal;
  }

  if (!otpCode || !otpCode.trim()) {
    return { isValid: false, error: '6-digit OTP code is required.' };
  }

  const cleanOtp = otpCode.trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return { isValid: false, error: 'OTP code must be a valid 6-digit number.' };
  }

  return { isValid: true, cleanOtp, cleanMobile: mobileVal.cleanMobile };
};
