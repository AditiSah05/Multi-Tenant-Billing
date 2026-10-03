import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';

// Fetch Inventory Stock Levels directly from backend GET /inventory
export const useInventoryQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/inventory', { params: filters });
      return response.data?.data || response.data || [];
    },
  });
};

// Fetch Stock Movement History Logs directly from backend GET /inventory/export
export const useStockHistoryQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['stock-history', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/inventory/export', { params: { ...filters, format: 'json' } });
      return response.data?.data || response.data || [];
    },
  });
};

// Stock Adjustment Mutation directly to backend POST /inventory/stock-update
export const useAdjustStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantityChange, reason, customReason }) => {
      const response = await axiosInstance.post('/inventory/stock-update', { productId, quantityChange, reason, customReason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });
};

// Physical Stock Reconciliation Mutation directly to backend POST /inventory/reconcile
export const useReconcileStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, physicalCount, unit, notes }) => {
      const response = await axiosInstance.post('/inventory/reconcile', { productId, physicalCount, unit, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });
};

// Record Damaged Stock Mutation directly to backend POST /inventory/damage
export const useDamageStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, damagedQuantity, unit, notes }) => {
      const response = await axiosInstance.post('/inventory/damage', { productId, damagedQuantity, unit, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });
};

// Record Lost / Stolen Stock Mutation directly to backend POST /inventory/lost
export const useLostStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, lostQuantity, unit, notes }) => {
      const response = await axiosInstance.post('/inventory/lost', { productId, lostQuantity, unit, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });
};

// Fetch Expiry Alerts Query directly from backend GET /inventory/expiry-alerts
export const useExpiryAlertsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['expiry-alerts', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/inventory/expiry-alerts', { params: filters });
      return response.data?.data || response.data || {};
    },
  });
};
