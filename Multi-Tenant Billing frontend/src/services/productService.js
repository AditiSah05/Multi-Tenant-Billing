import axiosInstance from '../api/axiosInstance';

const productService = {
  // Fetch products with filters & pagination
  fetchProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },

  // Fetch product details by ID
  fetchProductDetails: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // Fetch Master Categories & Sub-Categories
  fetchCategories: async () => {
    const response = await axiosInstance.get('/products/categories');
    return response.data;
  },

  // Create new product
  createProduct: async (data) => {
    // If payload contains File instance, send FormData; otherwise JSON
    if (data instanceof FormData) {
      const response = await axiosInstance.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await axiosInstance.post('/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id, data) => {
    if (data instanceof FormData) {
      const response = await axiosInstance.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },

  // Adjust stock for product
  adjustProductStock: async (id, data) => {
    const response = await axiosInstance.post(`/products/${id}/adjust-stock`, data);
    return response.data;
  },

  // Bulk import products
  importProducts: async (products) => {
    const response = await axiosInstance.post('/products/import', { products });
    return response.data;
  },

  // Fetch product stock movement history
  fetchStockHistory: async (id, params = {}) => {
    const response = await axiosInstance.get(`/products/${id}/stock-history`, { params });
    return response.data;
  },

  // Fetch product by SKU
  fetchProductBySku: async (sku) => {
    const response = await axiosInstance.get(`/products/sku/${sku}`);
    return response.data;
  },

  // Export products
  exportProducts: async (params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get('/products/export', {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format !== 'json' && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' || format === 'xlsx' ? 'xlsx' : 'csv';
      link.setAttribute('download', `products_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    return response.data || response;
  },
};

export default productService;

