import { useMutation } from '@tanstack/react-query';
import authService from '../../../services/authService';

// Send OTP Mutation (Vendor / Store Mobile)
export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: (mobileNumber) => authService.sendOtp(mobileNumber),
  });
};

// Verify OTP Mutation (Vendor / Store Mobile)
export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: ({ mobileNumber, otpCode }) => authService.verifyOtp({ mobileNumber, otpCode }),
  });
};

// Resend OTP Mutation
export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: (mobileNumber) => authService.resendOtp(mobileNumber),
  });
};

// Super Admin Email & Password Login Mutation
export const useAdminLoginMutation = () => {
  return useMutation({
    mutationFn: ({ email, password }) => authService.adminLogin({ email, password }),
  });
};
