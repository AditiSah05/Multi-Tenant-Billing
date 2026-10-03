import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';

// Fetch Admin Dashboard Stats & Metrics
export const useAdminDashboardQuery = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/dashboard');
      return response.data?.data || response.data;
    },
  });
};

// Fetch Tenant Vendor Stores Directory
export const useTenantsQuery = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/tenants');
      const raw = response.data?.data || response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.tenants)) return raw.tenants;
      if (Array.isArray(raw?.items)) return raw.items;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    },
  });
};

// Toggle Tenant Account Status (ACTIVE <-> SUSPENDED)
export const useToggleTenantStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, status }) => {
      const response = await axiosInstance.patch(`/admin/tenants/${tenantId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};
