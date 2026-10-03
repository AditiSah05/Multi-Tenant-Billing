import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../../services/productService';

export const PRODUCT_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_KEYS.all, 'list'],
  list: (filters) => [...PRODUCT_KEYS.lists(), { filters }],
  details: () => [...PRODUCT_KEYS.all, 'detail'],
  detail: (id) => [...PRODUCT_KEYS.details(), id],
  categories: () => [...PRODUCT_KEYS.all, 'categories'],
  stockHistory: (id) => [...PRODUCT_KEYS.detail(id), 'stockHistory'],
};

// Fetch Store Products Catalog with Filters
export const useProductsQuery = (filters = {}) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productService.fetchProducts(filters),
    keepPreviousData: true,
  });
};

// Fetch Single Product Details
export const useProductDetailsQuery = (id) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productService.fetchProductDetails(id),
    enabled: !!id,
  });
};

// Fetch Product Stock Movement History
export const useStockHistoryQuery = (id, filters = {}) => {
  return useQuery({
    queryKey: [...PRODUCT_KEYS.stockHistory(id), filters],
    queryFn: () => productService.fetchStockHistory(id, filters),
    enabled: !!id,
  });
};

// Fetch Product Master Categories
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: PRODUCT_KEYS.categories(),
    queryFn: () => productService.fetchCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

// Create Product Mutation
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

// Update Product Mutation
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
    },
  });
};

// Adjust Product Stock Mutation
export const useAdjustStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.adjustProductStock(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
    },
  });
};

// Bulk Import Products Mutation
export const useImportProductsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (products) => productService.importProducts(products),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

// Delete Product Mutation
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

