import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

import AdminDashboard from '../modules/admin/pages/AdminDashboard';
import TenantsPage from '../modules/admin/tenants/pages/TenantsPage';
import TenantDetailsPage from '../modules/admin/tenants/pages/TenantDetailsPage';
import TenantSubscriptionPage from '../modules/admin/tenants/pages/TenantSubscriptionPage';
import TenantPaymentHistoryPage from '../modules/admin/tenants/pages/TenantPaymentHistoryPage';
import CategoryManagementPage from '../modules/admin/categories/pages/CategoryManagementPage';

export const AdminRoutes = (
  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />

    {/* Tenants Feature Sub-Module */}
    <Route path="tenants" element={<TenantsPage />} />
    <Route path="tenants/:id" element={<TenantDetailsPage />} />
    <Route path="tenants/:id/subscription" element={<TenantSubscriptionPage />} />
    <Route path="tenants/:id/payments" element={<TenantPaymentHistoryPage />} />

    {/* Categories Sub-Module */}
    <Route path="categories" element={<CategoryManagementPage />} />
    <Route path="packages" element={<AdminDashboard />} />
    <Route path="support" element={<AdminDashboard />} />
    <Route path="policies" element={<AdminDashboard />} />
    <Route path="contact-info" element={<AdminDashboard />} />
  </Route>
);
