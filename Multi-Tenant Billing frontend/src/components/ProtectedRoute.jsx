import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || '').toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

  // Expand vendor role synonyms if TENANT_ADMIN or EMPLOYEE is allowed
  if (normalizedAllowedRoles.includes('TENANT_ADMIN')) {
    normalizedAllowedRoles.push('VENDOR', 'STORE_ADMIN', 'TENANT_OWNER', 'OWNER', 'TENANT_USER');
  }

  const isRoleAllowed = allowedRoles.length === 0 || normalizedAllowedRoles.includes(userRole);

  if (!isRoleAllowed) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/vendor/dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
