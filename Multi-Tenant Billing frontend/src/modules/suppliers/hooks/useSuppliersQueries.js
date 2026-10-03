import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supplierService from '../../../services/supplierService';

// Fetch Suppliers list with query params
export const useSuppliersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await supplierService.fetchSuppliers(params);
      return response.data || response;
    },
    placeholderData: (previousData) => previousData,
  });
};

// Fetch single supplier details
export const useSupplierDetailsQuery = (supplierId) => {
  return useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      if (!supplierId) return null;
      const response = await supplierService.fetchSupplierDetails(supplierId);
      return response.data || response;
    },
    enabled: Boolean(supplierId),
  });
};

export const useSupplierQuery = useSupplierDetailsQuery;

// Fetch single supplier ledger
export const useSupplierLedgerQuery = (supplierId) => {
  return useQuery({
    queryKey: ['supplierLedger', supplierId],
    queryFn: async () => {
      if (!supplierId) return null;
      const response = await supplierService.fetchSupplierLedger(supplierId);
      return response.data || response;
    },
    enabled: Boolean(supplierId),
  });
};

// Create Supplier Mutation
export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplierData) => {
      return await supplierService.createSupplier(supplierData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.refetchQueries({ queryKey: ['suppliers'] });
    },
  });
};

// Update Supplier Mutation
export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await supplierService.updateSupplier(id, data);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.refetchQueries({ queryKey: ['suppliers'] });
      await queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
    },
  });
};

// Delete Supplier Mutation
export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return await supplierService.deleteSupplier(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.refetchQueries({ queryKey: ['suppliers'] });
    },
  });
};

// Record Payment Mutation
export const useRecordSupplierPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ supplierId, paymentData }) => {
      return await supplierService.recordPayment(supplierId, paymentData);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.refetchQueries({ queryKey: ['suppliers'] });
      await queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
      await queryClient.invalidateQueries({ queryKey: ['supplierLedger', variables.supplierId] });
    },
  });
};
