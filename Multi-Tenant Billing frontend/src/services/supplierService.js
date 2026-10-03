import axiosInstance from '../api/axiosInstance';

export const supplierService = {
  // Get all suppliers list with search & filters
  fetchSuppliers: async (params = {}) => {
    const response = await axiosInstance.get('/suppliers', { params });
    return response.data;
  },

  // Get single supplier details with summary & purchase/payment records
  fetchSupplierDetails: async (id) => {
    const response = await axiosInstance.get(`/suppliers/${id}`);
    return response.data;
  },

  // Get supplier ledger statement
  fetchSupplierLedger: async (id) => {
    const response = await axiosInstance.get(`/suppliers/${id}/ledger`);
    return response.data;
  },

  // Create new supplier
  createSupplier: async (payload) => {
    const response = await axiosInstance.post('/suppliers', payload);
    return response.data;
  },

  // Update supplier details
  updateSupplier: async (id, payload) => {
    const response = await axiosInstance.put(`/suppliers/${id}`, payload);
    return response.data;
  },

  // Delete / deactivate supplier
  deleteSupplier: async (id) => {
    const response = await axiosInstance.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Record payment for supplier
  recordPayment: async (supplierId, payload) => {
    const response = await axiosInstance.post(`/suppliers/${supplierId}/payments`, payload);
    return response.data;
  },

  // Export suppliers list (Excel / CSV / JSON)
  exportSuppliers: async (params = {}) => {
    const format = params.format || 'csv';
    const response = await axiosInstance.get('/suppliers/export', {
      params: { ...params, format },
      responseType: format === 'json' ? 'json' : 'blob',
    });
    return response;
  }
};

export default supplierService;
