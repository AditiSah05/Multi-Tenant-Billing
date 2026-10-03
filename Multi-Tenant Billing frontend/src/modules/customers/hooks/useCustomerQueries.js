import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerService from '../../../services/customerService';

export const CUSTOMER_KEYS = {
  all: ['customers'],
  lists: () => [...CUSTOMER_KEYS.all, 'list'],
  list: (filters) => [...CUSTOMER_KEYS.lists(), { filters }],
  details: () => [...CUSTOMER_KEYS.all, 'detail'],
  detail: (id) => [...CUSTOMER_KEYS.details(), id],
  bills: (id, filters) => [...CUSTOMER_KEYS.detail(id), 'bills', { filters }],
  products: (id, filters) => [...CUSTOMER_KEYS.detail(id), 'products', { filters }],
  ledger: (id) => [...CUSTOMER_KEYS.detail(id), 'ledger'],
};

// Fetch Real Store Customers Catalog with Filters
export const useCustomersQuery = (filters = {}) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(filters),
    queryFn: () => customerService.fetchCustomers(filters),
    keepPreviousData: true,
  });
};

// Fetch Single Customer Details
export const useCustomerDetailsQuery = (id) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(id),
    queryFn: () => customerService.fetchCustomerDetails(id),
    enabled: !!id,
  });
};

// Fetch Paginated Customer Bills
export const useCustomerBillsQuery = (id, filters = {}) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.bills(id, filters),
    queryFn: () => customerService.fetchCustomerBills(id, filters),
    enabled: !!id,
  });
};

// Fetch Customer Purchased Products History
export const useCustomerProductsQuery = (id, filters = {}) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.products(id, filters),
    queryFn: () => customerService.fetchCustomerPurchasedProducts(id, filters),
    enabled: !!id,
  });
};

// Fetch Customer Ledger Statement
export const useCustomerLedgerQuery = (id) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.ledger(id),
    queryFn: () => customerService.fetchCustomerLedger(id),
    enabled: !!id,
  });
};

// Lookup or Auto-Register Customer Mutation
export const useLookupCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => customerService.lookupCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
    },
  });
};

// Create New Customer Profile Mutation
export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => customerService.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
    },
  });
};

// Update Customer Mutation
export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(id) });
    },
  });
};

// Delete Customer Mutation
export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
    },
  });
};
