import axiosInstance from '../api/axiosInstance';

export const subscriptionService = {
  // GET /api/v1/subscriptions/packages
  getPackages: async () => {
    const response = await axiosInstance.get('/subscriptions/packages');
    return response.data?.data || response.data;
  },

  // POST /api/v1/subscriptions/choose-package
  choosePackage: async (packageId) => {
    const response = await axiosInstance.post('/subscriptions/choose-package', { packageId });
    return response.data;
  }
};

export default subscriptionService;
