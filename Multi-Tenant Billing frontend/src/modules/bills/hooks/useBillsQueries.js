import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import billService from '../../../services/billService';

export const BILL_KEYS = {
  all: ['bills'],
  lists: () => [...BILL_KEYS.all, 'list'],
  list: (filters) => [...BILL_KEYS.lists(), { filters }],
  details: () => [...BILL_KEYS.all, 'detail'],
  detail: (id) => [...BILL_KEYS.details(), id],
  public: (id) => [...BILL_KEYS.all, 'public', id],
  returns: () => [...BILL_KEYS.all, 'returns'],
  returnList: (filters) => [...BILL_KEYS.returns(), { filters }],
  returnDetail: (id) => [...BILL_KEYS.returns(), id],
};

// Fetch Store Invoices & Bills
export const useInvoicesQuery = (filters = {}) => {
  const queryFilters = { limit: 1000, ...filters };
  return useQuery({
    queryKey: BILL_KEYS.list(queryFilters),
    queryFn: async () => {
      const response = await billService.fetchBills(queryFilters);
      return response?.data || response;
    },
    keepPreviousData: true,
  });
};

// Create Bill / Invoice Mutation
export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billData) => billService.generateBill(billData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all });
    },
  });
};

// Fetch Invoice Details
export const useInvoiceDetailsQuery = (id) => {
  return useQuery({
    queryKey: BILL_KEYS.detail(id),
    queryFn: async () => {
      const response = await billService.fetchBillDetails(id);
      return response?.data || response;
    },
    enabled: !!id,
  });
};

// Fetch Public Invoice Details (Unauthenticated)
export const usePublicInvoiceDetailsQuery = (id) => {
  return useQuery({
    queryKey: BILL_KEYS.public(id),
    queryFn: async () => {
      const response = await billService.fetchPublicBillDetails(id);
      return response?.data || response;
    },
    enabled: !!id,
    retry: false,
  });
};

// Process Sales Return Mutation
export const useProcessBillReturnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, returnData }) => billService.processBillReturn(id, returnData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(id) });
    },
  });
};

// Cancel Bill Mutation
export const useCancelBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => billService.cancelBill(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.detail(id) });
    },
  });
};

// Delete Bill Mutation
export const useDeleteBillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => billService.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILL_KEYS.all });
    },
  });
};

// Fetch Sales Returns List Query
export const useSalesReturnsQuery = (filters = {}) => {
  return useQuery({
    queryKey: BILL_KEYS.returnList(filters),
    queryFn: async () => {
      const response = await billService.fetchSalesReturns(filters);
      return response?.data || response;
    },
  });
};

// Fetch Sales Return Details Query
export const useSalesReturnDetailsQuery = (id) => {
  return useQuery({
    queryKey: BILL_KEYS.returnDetail(id),
    queryFn: async () => {
      const response = await billService.fetchSalesReturnDetails(id);
      return response?.data || response;
    },
    enabled: !!id,
  });
};
