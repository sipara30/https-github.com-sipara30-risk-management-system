import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AddRiskPage from './components/AddRiskPage';
import AdminDashboard from './components/AdminDashboard';
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

          {/* Admin Dashboard - Only for System Administrators */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRoles={['System Administrator']}>
                <AdminDashboard />
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