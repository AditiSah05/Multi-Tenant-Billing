import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../modules/landing/pages/LandingPage';
import Login from '../modules/auth/pages/Login';
import OwnerProfileStep1Page from '../modules/onboarding/pages/OwnerProfileStep1Page';
import BusinessProfileStep2Page from '../modules/onboarding/pages/BusinessProfileStep2Page';
import ChoosePackagePage from '../modules/onboarding/pages/ChoosePackagePage';
import ProtectedRoute from '../components/ProtectedRoute';
import { AdminRoutes } from './adminRoutes';

import { VendorRoutes } from './vendorRoutes';

import PublicPurchaseBillPage from '../modules/purchases/pages/PublicPurchaseBillPage';
import PublicCustomerBillPage from '../modules/bills/pages/PublicCustomerBillPage';
import PrivacyPolicyPage from '../modules/landing/pages/PrivacyPolicyPage';
import TermsPage from '../modules/landing/pages/TermsPage';
import RefundPolicyPage from '../modules/landing/pages/RefundPolicyPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Legal & Policy Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-and-conditions" element={<TermsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />

      {/* Public Auth & Bill Share Routes */}
      <Route path="/login" element={<Login initialRole="VENDOR" />} />
      <Route path="/vendor/login" element={<Login initialRole="VENDOR" />} />
      <Route path="/admin/login" element={<Login initialRole="ADMIN" />} />
      <Route path="/admin-login" element={<Login initialRole="ADMIN" />} />
      <Route path="/public/purchases/:id" element={<PublicPurchaseBillPage />} />
      <Route path="/public/bills/:id" element={<PublicCustomerBillPage />} />
      <Route path="/public/invoices/:id" element={<PublicCustomerBillPage />} />

      {/* Onboarding Flow Routes (Screen 1, Screen 2, Screen 3) */}
      <Route
        path="/create-business-profile"
        element={<Navigate to="/create-business-profile/step-1" replace />}
      />
      <Route
        path="/create-business-profile/step-1"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE', 'ADMIN']}>
            <OwnerProfileStep1Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-business-profile/step-2"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE', 'ADMIN']}>
            <BusinessProfileStep2Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/choose-package"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE', 'ADMIN']}>
            <ChoosePackagePage />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Module Routes */}
      {AdminRoutes}

      {/* Vendor Store Operations Module Routes */}
      {VendorRoutes}

      {/* Default Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


export default AppRoutes;
