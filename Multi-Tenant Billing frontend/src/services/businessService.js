import axiosInstance from '../api/axiosInstance';

export const businessService = {
  // Create Profile Step 1
  createStep1Profile: async (payload) => {
    const response = await axiosInstance.post('/business/create-profile/step-1', payload);
    return response.data;
  },

  // Create Profile Step 2 (POST /api/v1/business/create-profile/step-2)
  createStep2Profile: async (payload) => {
    const response = await axiosInstance.post('/business/create-profile/step-2', payload);
    return response.data;
  },

  // Create Full Business Profile
  createFullProfile: async (payload) => {
    const response = await axiosInstance.post('/business/create-profile', payload);
    return response.data;
  },

  // Get Store Business Info
  getBusinessInfo: async () => {
    const response = await axiosInstance.get('/business/info');
    return response.data?.data || response.data;
  },

  // Get Vendor & Store Profile
  getVendorProfile: async () => {
    const response = await axiosInstance.get('/business/profile');
    return response.data?.data || response.data;
  },

  // Update Store Business Info
  updateBusinessInfo: async (payload) => {
    const response = await axiosInstance.put('/business/info', payload);
    return response.data;
  }
};

export default businessService;
