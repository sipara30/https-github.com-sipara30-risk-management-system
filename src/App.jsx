import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AddRiskPage from './components/AddRiskPage';
import AdminDashboard from './components/AdminDashboard';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import UserDashboard from './components/UserDashboard';
import RiskOwnerDashboard from './components/RiskOwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes - Add Risk Page */}
          <Route 
            path="/submit-risk" 
            element={
              <ProtectedRoute>
                <AddRiskPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Dashboard - Only for System Administrators and Admins */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRoles={['SystemAdmin', 'Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Role-Based Dashboard - For all approved users */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            } 
          />

          {/* User Dashboard - For regular users to submit risks */}
          <Route 
            path="/user-dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Risk Owner Dashboard - For risk owners to evaluate risks */}
          <Route 
            path="/risk-owner-dashboard" 
            element={
              <ProtectedRoute>
                <RiskOwnerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 