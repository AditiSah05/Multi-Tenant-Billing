import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxService } from '../../../services/taxService';

export const TAX_KEYS = {
  all: ['tax'],
  list: () => [...TAX_KEYS.all, 'list'],
  detail: (id) => [...TAX_KEYS.all, 'detail', id],
  summary: (filters) => [...TAX_KEYS.all, 'summary', filters],
  productTax: (filters) => [...TAX_KEYS.all, 'productTax', filters],
  partyTax: (filters) => [...TAX_KEYS.all, 'partyTax', filters],
  monthlyAudit: (year, month) => [...TAX_KEYS.all, 'monthlyAudit', { year, month }],
};

export const useTaxesQuery = () => {
  return useQuery({
    queryKey: TAX_KEYS.list(),
    queryFn: () => taxService.getTaxes(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTaxSummaryQuery = (filters = {}) => {
  return useQuery({
    queryKey: TAX_KEYS.summary(filters),
    queryFn: () => taxService.getTaxSummary(filters),
  });
};

export const useProductTaxSummaryQuery = (filters = {}) => {
  return useQuery({
    queryKey: TAX_KEYS.productTax(filters),
    queryFn: () => taxService.getProductTaxSummary(filters),
  });
};

export const usePartyTaxSummaryQuery = (filters = {}) => {
  return useQuery({
    queryKey: TAX_KEYS.partyTax(filters),
    queryFn: () => taxService.getPartyTaxSummary(filters),
  });
};

export const useMonthlyTaxAuditQuery = (year, month) => {
  return useQuery({
    queryKey: TAX_KEYS.monthlyAudit(year, month),
    queryFn: () => taxService.getMonthlyTaxAudit({ year, month }),
    enabled: Boolean(year && month),
  });
};

export const useSeedDefaultTaxesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => taxService.seedDefaultTaxes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
};

export const useCreateTaxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taxData) => taxService.createTax(taxData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
};

export const useUpdateTaxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taxId, data }) => taxService.updateTax({ taxId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
};

export const useDeleteTaxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taxId) => taxService.deleteTax(taxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_KEYS.all });
    },
  });
};
