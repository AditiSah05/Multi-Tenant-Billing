import axiosInstance from '../api/axiosInstance';

export const customerService = {
  // Fetch all customers with search & pagination filters
  fetchCustomers: async (params = {}) => {
    const response = await axiosInstance.get('/customers', { params });
    return response.data;
  },

  // Lookup or create customer by mobile
  lookupCustomer: async (payload) => {
    const response = await axiosInstance.post('/customers/lookup', payload);
    return response.data;
  },

  // Get single customer details with purchase history
  fetchCustomerDetails: async (id) => {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  },

  // Fetch paginated customer bills
  fetchCustomerBills: async (id, params = {}) => {
    const response = await axiosInstance.get(`/customers/${id}/bills`, { params });
    return response.data;
  },

  // Fetch customer purchased products history
  fetchCustomerPurchasedProducts: async (id, params = {}) => {
    const response = await axiosInstance.get(`/customers/${id}/products`, { params });
    return response.data;
  },

  // Fetch customer ledger statement (Bills, Returns, Running Balance)
  fetchCustomerLedger: async (id) => {
    const response = await axiosInstance.get(`/customers/${id}/ledger`);
    return response.data;
  },

  // Create new customer / business profile
  createCustomer: async (payload) => {
    try {
      const response = await axiosInstance.post('/customers/lookup', payload);
      return response.data;
    } catch (error) {
      const response = await axiosInstance.post('/customers', payload);
      return response.data;
    }
  },

  // Update customer details
  updateCustomer: async (id, payload) => {
    const response = await axiosInstance.put(`/customers/${id}`, payload);
    return response.data;
  },

  // Delete customer profile
  deleteCustomer: async (id) => {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  },

  // Export customers list (CSV, Excel, JSON)
  exportCustomers: async (params = {}) => {
    const format = (params.format || 'csv').toLowerCase();
    const response = await axiosInstance.get('/customers/export', {
      params,
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format !== 'json' && response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' || format === 'xlsx' ? 'xlsx' : 'csv';
      link.setAttribute('download', `customers_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    return response.data || response;
  },
};

export default customerService;
