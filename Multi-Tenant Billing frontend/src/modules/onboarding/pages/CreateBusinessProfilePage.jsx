import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import OwnerProfileStep1Page from './OwnerProfileStep1Page';
import BusinessProfileStep2Page from './BusinessProfileStep2Page';

export default function CreateBusinessProfilePage() {
  const location = useLocation();
  const path = location.pathname;

  if (path.includes('/step-2')) {
    return <BusinessProfileStep2Page />;
  }

  if (path.includes('/step-1')) {
    return <OwnerProfileStep1Page />;
  }

  // Default fallback: Check saved profile step or redirect to step-1
  const savedStep = localStorage.getItem('profileStep');
  if (savedStep === '2') {
    return <Navigate to="/create-business-profile/step-2" replace />;
  }

  return <Navigate to="/create-business-profile/step-1" replace />;
}
