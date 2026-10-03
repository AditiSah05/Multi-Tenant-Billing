import axiosInstance from '../api/axiosInstance';

const purchaseService = {
  // Fetch all purchase bills with filters & pagination
  fetchPurchaseBills: async (params = {}) => {
    const response = await axiosInstance.get('/purchases', { params });
    return response.data;
  },

  // Fetch purchase bill details by ID
  fetchPurchaseBillDetails: async (id) => {
    const response = await axiosInstance.get(`/purchases/${id}`);
    return response.data;
  },

  // Fetch automated purchase reorder suggestions
  fetchReorderSuggestions: async () => {
    const response = await axiosInstance.get('/purchases/reorder-suggestions');
    return response.data;
  },

  // Fetch public purchase bill details by ID (unauthenticated)
  fetchPublicPurchaseBillDetails: async (id) => {
    const response = await axiosInstance.get(`/purchases/public/${id}`);
    return response.data;
  },

  // Create purchase bill
  createPurchaseBill: async (data) => {
    const response = await axiosInstance.post('/purchases', data);
    return response.data;
  },

  // Update purchase bill
  updatePurchaseBill: async (id, data) => {
    const response = await axiosInstance.put(`/purchases/${id}`, data);
    return response.data;
  },

  // Confirm draft purchase bill
  confirmPurchaseBill: async (id) => {
    const response = await axiosInstance.post(`/purchases/${id}/confirm`);
    return response.data;
  },

  // Cancel purchase bill
  cancelPurchaseBill: async (id) => {
    const response = await axiosInstance.post(`/purchases/${id}/cancel`);
    return response.data;
  },

  // Permanently delete purchase bill
  deletePurchaseBill: async (id) => {
    const response = await axiosInstance.delete(`/purchases/${id}`);
    return response.data;
  },

  // Record payment against purchase bill
  recordBillPayment: async (id, data) => {
    const response = await axiosInstance.post(`/purchases/${id}/payments`, data);
    return response.data;
  },

  // Delete payment entry from purchase bill / supplier
  deletePurchasePayment: async (paymentId) => {
    const response = await axiosInstance.delete(`/purchases/payments/${paymentId}`);
    return response.data;
  },

  // Fetch purchase returns list
  fetchPurchaseReturns: async (params = {}) => {
    const response = await axiosInstance.get('/purchases/returns', { params });
    return response.data;
  },

  // Fetch purchase return details by ID
  fetchPurchaseReturnDetails: async (id) => {
    const response = await axiosInstance.get(`/purchases/returns/${id}`);
    return response.data;
  },

  // Create purchase return / cancellation
  createPurchaseReturn: async (data) => {
    const response = await axiosInstance.post('/purchases/returns', data);
    return response.data;
  },

  // Export purchase returns report (Excel, CSV, PDF)
  exportPurchaseReturns: async (params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get('/purchases/returns/export', {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format !== 'json' && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' || format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      link.setAttribute('download', `purchase_returns_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    return response.data || response;
  },

  // Export purchase bills with automatic browser file download helper
  exportPurchaseBills: async (params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get('/purchases/export', {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format !== 'json' && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' || format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      link.setAttribute('download', `purchase_bills_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    return response.data || response;
  },
};

export default purchaseService;
