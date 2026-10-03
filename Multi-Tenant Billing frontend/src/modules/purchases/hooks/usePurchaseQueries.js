import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import purchaseService from '../../../services/purchaseService';

export const PURCHASE_KEYS = {
  all: ['purchases'],
  lists: () => [...PURCHASE_KEYS.all, 'list'],
  list: (filters) => [...PURCHASE_KEYS.lists(), { filters }],
  details: () => [...PURCHASE_KEYS.all, 'detail'],
  detail: (id) => [...PURCHASE_KEYS.details(), id],
  reorder: () => [...PURCHASE_KEYS.all, 'reorder-suggestions'],
  returns: () => [...PURCHASE_KEYS.all, 'returns'],
  returnList: (filters) => [...PURCHASE_KEYS.returns(), { filters }],
  returnDetails: () => [...PURCHASE_KEYS.returns(), 'detail'],
  returnDetail: (id) => [...PURCHASE_KEYS.returnDetails(), id],
};

export const usePurchaseBillsQuery = (filters = {}) => {
  return useQuery({
    queryKey: PURCHASE_KEYS.list(filters),
    queryFn: () => purchaseService.fetchPurchaseBills(filters),
    keepPreviousData: true,
  });
};

export const usePurchaseBillDetailsQuery = (id) => {
  return useQuery({
    queryKey: PURCHASE_KEYS.detail(id),
    queryFn: () => purchaseService.fetchPurchaseBillDetails(id),
    enabled: !!id,
  });
};

export const useReorderSuggestionsQuery = () => {
  return useQuery({
    queryKey: PURCHASE_KEYS.reorder(),
    queryFn: () => purchaseService.fetchReorderSuggestions(),
  });
};

export const usePublicPurchaseBillDetailsQuery = (id) => {
  return useQuery({
    queryKey: [...PURCHASE_KEYS.details(), 'public', id],
    queryFn: () => purchaseService.fetchPublicPurchaseBillDetails(id),
    enabled: !!id,
    retry: false,
  });
};

export const useCreatePurchaseBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => purchaseService.createPurchaseBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
    },
  });
};

export const useUpdatePurchaseBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => purchaseService.updatePurchaseBill(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.detail(id) });
    },
  });
};

export const useDeletePurchaseBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => purchaseService.deletePurchaseBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
    },
  });
};

export const useRecordBillPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentData }) => purchaseService.recordBillPayment(id, paymentData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.detail(id) });
    },
  });
};

export const useDeletePurchasePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) => purchaseService.deletePurchasePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
    },
  });
};

export const useConfirmPurchaseBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => purchaseService.confirmPurchaseBill(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.detail(id) });
    },
  });
};

export const useCancelPurchaseBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => purchaseService.cancelPurchaseBill(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const usePurchaseReturnsQuery = (filters = {}) => {
  return useQuery({
    queryKey: PURCHASE_KEYS.returnList(filters),
    queryFn: () => purchaseService.fetchPurchaseReturns(filters),
    keepPreviousData: true,
  });
};

export const usePurchaseReturnDetailsQuery = (id) => {
  return useQuery({
    queryKey: PURCHASE_KEYS.returnDetail(id),
    queryFn: () => purchaseService.fetchPurchaseReturnDetails(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseReturnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => purchaseService.createPurchaseReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
