import axiosInstance from '../api/axiosInstance';
import { cleanMobileNumber } from '../utils/formatters';

export const authService = {
  // Send OTP to Vendor Mobile Number
  sendOtp: async (mobileNumber) => {
    const cleanMobile = cleanMobileNumber(mobileNumber);
    const response = await axiosInstance.post('/auth/send-otp', { mobileNumber: cleanMobile });
    return response.data;
  },

  // Verify OTP for Vendor Mobile
  verifyOtp: async ({ mobileNumber, otpCode }) => {
    const cleanMobile = cleanMobileNumber(mobileNumber);
    const response = await axiosInstance.post('/auth/verify-otp', {
      mobileNumber: cleanMobile,
      otpCode: String(otpCode).trim()
    });
    return response.data;
  },

  // Resend OTP to Vendor Mobile
  resendOtp: async (mobileNumber) => {
    const cleanMobile = cleanMobileNumber(mobileNumber);
    const response = await axiosInstance.post('/auth/resend-otp', { mobileNumber: cleanMobile });
    return response.data;
  },

  // Super Admin Credentials Login
  adminLogin: async ({ email, password }) => {
    const response = await axiosInstance.post('/auth/admin/login', {
      email: String(email).trim().toLowerCase(),
      password
    });
    return response.data;
  },

  // Refresh JWT Access Token
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Fetch Authenticated Current User Profile
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data?.data || response.data;
  },

  // Logout Authenticated User Session
  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      return { success: true };
    }
  }
};

export default authService;
