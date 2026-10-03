import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '../services/categoryService';

/**
 * Fetch All Master Categories with nested Sub-Categories & Dynamic Fields
 */
export const useCategoriesQuery = (search = '', options = {}) => {
  return useQuery({
    queryKey: ['adminCategories', search],
    queryFn: () => categoryService.getCategories(search),
    ...options,
  });
};

/**
 * Fetch Master Category Details by ID
 */
export const useCategoryDetailsQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['adminCategoryDetails', id],
    enabled: Boolean(id),
    queryFn: () => categoryService.getCategoryById(id),
    ...options,
  });
};

/**
 * Create Master Category Mutation
 */
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => categoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Update Master Category Mutation
 */
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Delete Master Category Mutation
 */
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Fetch Sub-Categories (optional filter by categoryId)
 */
export const useSubCategoriesQuery = (categoryId = null, options = {}) => {
  return useQuery({
    queryKey: ['adminSubCategories', categoryId],
    queryFn: () => categoryService.getSubCategories(categoryId),
    ...options,
  });
};

/**
 * Fetch Sub-Category Details by ID (loads dynamic custom fields & enableExpiryDate rule)
 */
export const useSubCategoryDetailsQuery = (subCategoryId = null, options = {}) => {
  return useQuery({
    queryKey: ['adminSubCategoryDetails', subCategoryId],
    enabled: Boolean(subCategoryId),
    queryFn: () => categoryService.getSubCategoryById(subCategoryId),
    ...options,
  });
};

/**
 * Create Sub-Category Mutation
 */
export const useCreateSubCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => categoryService.createSubCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
    },
  });
};

/**
 * Update Sub-Category Mutation
 */
export const useUpdateSubCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.updateSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
    },
  });
};

/**
 * Delete Sub-Category Mutation
 */
export const useDeleteSubCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoryService.deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
    },
  });
};

/**
 * Add Dynamic Additional Field Mutation
 */
export const useAddAdditionalFieldMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subCategoryId, fieldData }) =>
      categoryService.addAdditionalField(subCategoryId, fieldData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategoryDetails'] });
    },
  });
};

/**
 * Update Dynamic Additional Field Mutation
 */
export const useUpdateAdditionalFieldMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, fieldData }) =>
      categoryService.updateAdditionalField(fieldId, fieldData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategoryDetails'] });
    },
  });
};

/**
 * Delete Dynamic Additional Field Mutation
 */
export const useDeleteAdditionalFieldMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fieldId) => categoryService.deleteAdditionalField(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubCategoryDetails'] });
    },
  });
};
