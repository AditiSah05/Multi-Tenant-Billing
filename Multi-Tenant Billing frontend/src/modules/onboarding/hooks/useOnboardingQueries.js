import { useMutation, useQuery } from '@tanstack/react-query';
import businessService from '../../../services/businessService';
import subscriptionService from '../../../services/subscriptionService';

// Create Business Profile - Step 1 Mutation
export const useCreateProfileStep1Mutation = () => {
  return useMutation({
    mutationFn: (step1Payload) => businessService.createStep1Profile(step1Payload),
  });
};

// Create Business Profile - Step 2 Mutation
export const useCreateProfileStep2Mutation = () => {
  return useMutation({
    mutationFn: (step2Payload) => businessService.createStep2Profile(step2Payload),
  });
};

// Create Business Profile - Full / Single Step Mutation
export const useCreateBusinessProfileMutation = () => {
  return useMutation({
    mutationFn: (payload) => businessService.createFullProfile(payload),
  });
};

// Fetch Business Store Info
export const useGetBusinessInfoQuery = () => {
  return useQuery({
    queryKey: ['businessInfo'],
    queryFn: () => businessService.getBusinessInfo(),
  });
};

// Fetch Vendor User & Business Profile
export const useGetVendorProfileQuery = () => {
  return useQuery({
    queryKey: ['vendorProfile'],
    queryFn: () => businessService.getVendorProfile(),
  });
};

// Update Business Info Mutation
export const useUpdateBusinessInfoMutation = () => {
  return useMutation({
    mutationFn: (payload) => businessService.updateBusinessInfo(payload),
  });
};

// Fetch Subscription Packages (GET /api/v1/subscriptions/packages)
export const useGetSubscriptionPackagesQuery = () => {
  return useQuery({
    queryKey: ['subscriptionPackages'],
    queryFn: () => subscriptionService.getPackages(),
  });
};

// Choose Subscription Package Mutation (POST /api/v1/subscriptions/choose-package)
export const useChoosePackageMutation = () => {
  return useMutation({
    mutationFn: (packageId) => subscriptionService.choosePackage(packageId),
  });
};

