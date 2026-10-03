import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';



// Fetch Vendor Store Dashboard Overview
export const useVendorDashboardQuery = () => {
  return useQuery({
    queryKey: ['vendorDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard');
      return response.data?.data || response.data;
    },
  });
};

// Fetch Recent Invoices
export const useRecentInvoicesQuery = () => {
  return useQuery({
    queryKey: ['recentInvoices'],
    queryFn: async () => {
      const response = await axiosInstance.get('/bills?limit=5');
      const raw = response.data?.data || response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.bills)) return raw.bills;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    },
  });
};

// Create Business Profile - Step 1 Mutation
export const useCreateProfileStep1Mutation = () => {
  return useMutation({
    mutationFn: async (step1Payload) => {
      const response = await axiosInstance.post('/business/create-profile/step-1', step1Payload);
      return response.data;
    },
  });
};

// Create Business Profile - Step 2 Mutation
export const useCreateProfileStep2Mutation = () => {
  return useMutation({
    mutationFn: async (step2Payload) => {
      const response = await axiosInstance.post('/business/create-profile/step-2', step2Payload);
      return response.data;
    },
  });
};

// Create Business Profile - Full / Single Step Mutation
export const useCreateBusinessProfileMutation = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/business/create-profile', payload);
      return response.data;
    },
  });
};

// Fetch Business Store Info
export const useGetBusinessInfoQuery = () => {
  return useQuery({
    queryKey: ['businessInfo'],
    queryFn: async () => {
      const response = await axiosInstance.get('/business/info');
      return response.data?.data || response.data;
    },
  });
};

// Fetch Vendor User & Business Profile
export const useGetVendorProfileQuery = () => {
  return useQuery({
    queryKey: ['vendorProfile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/business/profile');
      return response.data?.data || response.data;
    },
  });
};

// Update Business Info Mutation
export const useUpdateBusinessInfoMutation = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.put('/business/info', payload);
      return response.data;
    },
  });
};

