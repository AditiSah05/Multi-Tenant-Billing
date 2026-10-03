import axiosInstance from '../api/axiosInstance';

export const billService = {
  // Fetch sales bills/invoices list with search & filters
  fetchBills: async (params = {}) => {
    const response = await axiosInstance.get('/bills', { params });
    return response.data;
  },

  // Generate new sales invoice or save draft (B2C or B2B)
  generateBill: async (payload) => {
    const response = await axiosInstance.post('/bills', payload);
    return response.data;
  },

  // Fetch bill details by ID
  fetchBillDetails: async (id) => {
    const response = await axiosInstance.get(`/bills/${id}`);
    return response.data;
  },

  // Fetch public unauthenticated bill details by ID
  fetchPublicBillDetails: async (id) => {
    const response = await axiosInstance.get(`/bills/public/${id}`);
    return response.data;
  },

  // Process sales return / refund for bill
  processBillReturn: async (id, payload) => {
    const response = await axiosInstance.post(`/bills/${id}/return`, payload);
    return response.data;
  },

  // Cancel bill & restore stock
  cancelBill: async (id, reason = '') => {
    const response = await axiosInstance.post(`/bills/${id}/cancel`, { reason });
    return response.data;
  },

  // Permanently delete bill
  deleteBill: async (id) => {
    const response = await axiosInstance.delete(`/bills/${id}`);
    return response.data;
  },

  // Fetch list of sales returns / credit notes
  fetchSalesReturns: async (params = {}) => {
    const response = await axiosInstance.get('/bills/returns', { params });
    return response.data;
  },

  // Fetch sales return details by ID
  fetchSalesReturnDetails: async (id) => {
    const response = await axiosInstance.get(`/bills/returns/${id}`);
    return response.data;
  },

  // Export sales invoices report (CSV, Excel, JSON)
  exportBills: async (params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get('/bills/export', {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format !== 'json' && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' || format === 'xlsx' ? 'xlsx' : 'csv';
      link.setAttribute('download', `sales_invoices_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    return response.data || response;
  },

  // Export sales returns / credit notes report (CSV, Excel, JSON)
  exportSalesReturns: async (returnsList = [], params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get('/bills/returns/export', {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format !== 'json' && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' || format === 'xlsx' ? 'xlsx' : 'csv';
      link.setAttribute('download', `sales_returns_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    return response.data || response;
  },
};

export default billService;
