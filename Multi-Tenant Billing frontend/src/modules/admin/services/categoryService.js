import axiosInstance from '../../../api/axiosInstance';

export const categoryService = {
  // Get all Master Categories with nested Sub-Categories & Custom Fields
  getCategories: async (search = '') => {
    const response = await axiosInstance.get('/admin/categories', {
      params: search ? { search } : {},
    });
    return response.data?.data || response.data || [];
  },

  // Get Master Category details by ID
  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`/admin/categories/${id}`);
    return response.data?.data || response.data;
  },

  // Create Master Category
  createCategory: async (payload) => {
    const response = await axiosInstance.post('/admin/categories', payload);
    return response.data?.data || response.data;
  },

  // Update Master Category
  updateCategory: async (id, data) => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, data);
    return response.data?.data || response.data;
  },

  // Delete Master Category
  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Get Sub-Categories (optional filter by categoryId)
  getSubCategories: async (categoryId = null) => {
    const response = await axiosInstance.get('/admin/sub-categories', {
      params: categoryId ? { categoryId } : {},
    });
    return response.data?.data || response.data || [];
  },

  // Get Sub-Category details by ID (including additionalFields & enableExpiryDate)
  getSubCategoryById: async (id) => {
    const response = await axiosInstance.get(`/admin/sub-categories/${id}`);
    return response.data?.data || response.data;
  },

  // Create Sub-Category
  createSubCategory: async (payload) => {
    const response = await axiosInstance.post('/admin/sub-categories', payload);
    return response.data?.data || response.data;
  },

  // Update Sub-Category
  updateSubCategory: async (id, data) => {
    const response = await axiosInstance.put(`/admin/sub-categories/${id}`, data);
    return response.data?.data || response.data;
  },

  // Delete Sub-Category
  deleteSubCategory: async (id) => {
    const response = await axiosInstance.delete(`/admin/sub-categories/${id}`);
    return response.data;
  },

  // Add Dynamic Additional Field to Sub-Category
  addAdditionalField: async (subCategoryId, fieldData) => {
    const response = await axiosInstance.post(`/admin/sub-categories/${subCategoryId}/fields`, fieldData);
    return response.data?.data || response.data;
  },

  // Update Dynamic Additional Field
  updateAdditionalField: async (fieldId, fieldData) => {
    const response = await axiosInstance.put(`/admin/sub-categories/fields/${fieldId}`, fieldData);
    return response.data?.data || response.data;
  },

  // Toggle Dynamic Additional Field Status
  toggleAdditionalFieldStatus: async (fieldId, status) => {
    const response = await axiosInstance.patch(`/admin/sub-categories/fields/${fieldId}/status`, { status });
    return response.data?.data || response.data;
  },

  // Delete Dynamic Additional Field
  deleteAdditionalField: async (fieldId) => {
    const response = await axiosInstance.delete(`/admin/sub-categories/fields/${fieldId}`);
    return response.data;
  },
};

export default categoryService;
