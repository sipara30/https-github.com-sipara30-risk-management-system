import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children, requiredRoles = [], requireVerifiedApproved = false }) => {
  const location = useLocation();
  const isAuthenticated = authAPI.isAuthenticated();
  const currentUser = authAPI.getCurrentUser();

  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If verification/approval required, do a basic client-side gate
  if (requireVerifiedApproved) {
    // In a full implementation, fetch user state from server
    const verified = currentUser?.email_verified;
    const status = currentUser?.status;
    if (!verified || status !== 'approved') {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // If roles are required, check if user has the required role
  if (requiredRoles.length > 0 && currentUser) {
    const normalize = (s) => (s || '').toString().replace(/\s+/g, '').toLowerCase();
    const userRoles = (currentUser.roles || []).map(normalize);
    const required = requiredRoles.map(normalize);
    const hasRequiredRole = required.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

