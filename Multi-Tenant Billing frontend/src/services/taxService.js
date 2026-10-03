import axiosInstance from '../api/axiosInstance';

export const taxService = {
  // Tax Rates CRUD
  getTaxes: async () => {
    const response = await axiosInstance.get('/taxes');
    return response?.data?.data || response?.data || response;
  },

  getTaxById: async (taxId) => {
    const response = await axiosInstance.get(`/taxes/${taxId}`);
    return response?.data?.data || response?.data || response;
  },

  createTax: async (taxData) => {
    const response = await axiosInstance.post('/taxes', taxData);
    return response?.data?.data || response?.data || response;
  },

  updateTax: async ({ taxId, data }) => {
    const response = await axiosInstance.put(`/taxes/${taxId}`, data);
    return response?.data?.data || response?.data || response;
  },

  deleteTax: async (taxId) => {
    const response = await axiosInstance.delete(`/taxes/${taxId}`);
    return response?.data?.data || response?.data || response;
  },

  seedDefaultTaxes: async () => {
    const response = await axiosInstance.post('/taxes/seed-defaults');
    return response?.data?.data || response?.data || response;
  },

  // Tax Reports & Summaries
  getTaxSummary: async (params = {}) => {
    const response = await axiosInstance.get('/taxes/summary', { params });
    return response?.data?.data || response?.data || response;
  },

  getProductTaxSummary: async (params = {}) => {
    const response = await axiosInstance.get('/taxes/product-tax-summary', { params });
    return response?.data?.data || response?.data || response;
  },

  exportProductTaxSummaryExcel: async (params = {}) => {
    const response = await axiosInstance.get('/taxes/product-tax-summary/export/excel', {
      params,
      responseType: 'blob'
    });
    return response;
  },

  getPartyTaxSummary: async (params = {}) => {
    const response = await axiosInstance.get('/taxes/party-tax-summary', { params });
    return response?.data?.data || response?.data || response;
  },

  getMonthlyTaxAudit: async (params = {}) => {
    const response = await axiosInstance.get('/taxes/monthly-audit', { params });
    return response?.data?.data || response?.data || response;
  },

  exportMonthlyTaxAuditExcel: async (params = {}) => {
    const response = await axiosInstance.get('/taxes/monthly-audit/export/excel', {
      params,
      responseType: 'blob'
    });
    return response;
  }
};
