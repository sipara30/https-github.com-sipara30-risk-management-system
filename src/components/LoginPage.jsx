import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: 'admin@admin.com',
    password: '12345678'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [backendStatus, setBackendStatus] = useState('Unknown');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Test backend connection
  const testBackendConnection = async () => {
    setDebugInfo('Testing backend connection...');
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      
      if (response.ok) {
        setBackendStatus('Connected ✅');
        setDebugInfo(`Backend is running! Status: ${data.status}, Message: ${data.message}`);
      } else {
        setBackendStatus('Error ❌');
        setDebugInfo(`Backend error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setBackendStatus('Failed ❌');
      setDebugInfo(`Connection failed: ${error.message}`);
    }
  };

  // Test login endpoint directly
  const testLoginEndpoint = async () => {
    setDebugInfo('Testing login endpoint...');
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: '12345678'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDebugInfo(`Login endpoint working! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setDebugInfo(`Login endpoint error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo(`Login endpoint failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      console.log('🔐 Attempting login with:', formData);
      
      const response = await authAPI.login(formData.email, formData.password);
      console.log('✅ Login successful:', response);
      
      // Get user data from response
      const user = response.user;
      
      // Validate user data structure
      if (!user) {
        throw new Error('No user data received from server');
      }
      
      console.log('💾 User data validation:');
      console.log('💾 User object exists:', !!user);
      console.log('💾 User ID:', user.id);
      console.log('💾 User email:', user.email);
      console.log('💾 User roles array:', user.roles);
      console.log('💾 User role string:', user.role);
      console.log('💾 User role_name string:', user.role_name);
      
      // Note: User data is already stored by authAPI.login()
      console.log('💾 User data from response:');
      console.log('💾 authToken:', response.token);
      console.log('💾 user:', JSON.stringify(user));
      
      // Redirect based on user role and permissions
      const roles = user.roles || [];
      const userRole = user.assignedRole || user.role || user.role_name || '';
      
      console.log('👤 User roles:', roles);
      console.log('👤 User role:', userRole);
      console.log('👤 Full user object:', user);
      console.log('👤 User role type:', typeof userRole);
      console.log('👤 User role length:', userRole ? userRole.length : 0);
      
      // Additional role checks
      if (userRole) {
        console.log('👤 User role includes "risk":', userRole.toLowerCase().includes('risk'));
        console.log('👤 User role includes "owner":', userRole.toLowerCase().includes('owner'));
      }
      
      // Normalize the user role for better matching
      const normalizedRole = userRole ? userRole.toString().toLowerCase().trim().replace(/\s+/g, ' ') : '';
      console.log('👤 Normalized role:', normalizedRole);
      
      // Enhanced role detection with priority order
      console.log('🔍 Role detection analysis:');
      console.log('🔍 User roles array:', roles);
      console.log('🔍 User role string:', userRole);
      console.log('🔍 Normalized role:', normalizedRole);
      
      // Check if user has admin privileges (case-insensitive)
      const hasAdminRole = roles.some(role => 
        role.toLowerCase().includes('admin') || 
        role.toLowerCase().includes('system')
      ) || normalizedRole.includes('admin') || 
         normalizedRole.includes('system');
      
      // Check if user is a risk owner (highest priority after admin)
      const isRiskOwner = roles.some(role => {
        const normalizedRole = role.toLowerCase();
        const hasRiskOwnerRole = normalizedRole.includes('risk') || 
               normalizedRole.includes('owner') ||
               normalizedRole.includes('riskowner') ||
               normalizedRole.includes('risk_owner') ||
               normalizedRole.includes('risk owner');
        
        if (hasRiskOwnerRole) {
          console.log('🔍 Found risk owner role in roles array:', role);
        }
        
        return hasRiskOwnerRole;
      }) || normalizedRole.includes('risk') || 
         normalizedRole.includes('owner') ||
         normalizedRole.includes('riskowner') ||
         normalizedRole.includes('risk_owner') ||
         normalizedRole.includes('risk owner');
      
      // Check if user also has a "user" role (this might be causing confusion)
      const hasUserRole = roles.some(role => 
        role.toLowerCase().includes('user')
      ) || normalizedRole.includes('user');
      
      if (hasUserRole) {
        console.log('🔍 User also has "user" role - this might cause confusion');
      }
      
      console.log('🔍 Detailed risk owner check:');
      console.log('🔍 Roles array check:', roles.map(role => ({
        role: role,
        normalized: role.toLowerCase(),
        includesRisk: role.toLowerCase().includes('risk'),
        includesOwner: role.toLowerCase().includes('owner'),
        includesRiskOwner: role.toLowerCase().includes('riskowner'),
        includesRisk_Owner: role.toLowerCase().includes('risk_owner'),
        includesRiskOwnerSpace: role.toLowerCase().includes('risk owner')
      })));
      console.log('🔍 Normalized role check:', {
        normalizedRole: normalizedRole,
        includesRisk: normalizedRole.includes('risk'),
        includesOwner: normalizedRole.includes('owner'),
        includesRiskOwner: normalizedRole.includes('riskowner'),
        includesRisk_Owner: normalizedRole.includes('risk_owner'),
        includesRiskOwnerSpace: normalizedRole.includes('risk owner')
      });
      
      // Check other roles
      const isCEO = normalizedRole.includes('ceo') || normalizedRole.includes('dceo');
      const isAuditor = normalizedRole.includes('auditor');
      const isManager = normalizedRole.includes('manager') || normalizedRole.includes('supervisor');
      
      console.log('🔍 Role analysis results:');
      console.log('🔍 Has admin role:', hasAdminRole);
      console.log('🔍 Is risk owner:', isRiskOwner);
      console.log('🔍 Is CEO:', isCEO);
      console.log('🔍 Is auditor:', isAuditor);
      console.log('🔍 Is manager:', isManager);
      
      let targetRoute = '';
      
      if (hasAdminRole) {
        targetRoute = '/admin';
        console.log('🚀 Redirecting to Admin Dashboard');
        console.log('📍 Navigation target:', targetRoute);
      } else if (isRiskOwner) {
        // Risk Owners go to the risk owner dashboard (priority over other roles)
        targetRoute = '/risk-owner-dashboard';
        console.log('🛡️ Redirecting to Risk Owner Dashboard');
        console.log('📍 Navigation target:', targetRoute);
      } else if (isCEO || isAuditor) {
        // CEO, DCEO, and Auditors go to the role-based dashboard
        targetRoute = '/dashboard';
        console.log('👑 Redirecting to Role-Based Dashboard');
        console.log('📍 Navigation target:', targetRoute);
      } else if (isManager) {
        // Managers and supervisors go to role-based dashboard
        targetRoute = '/dashboard';
        console.log('👔 Redirecting to Role-Based Dashboard (Manager)');
        console.log('📍 Navigation target:', targetRoute);
      } else {
        // Regular users go to the user dashboard
        targetRoute = '/user-dashboard';
        console.log('👤 Redirecting to User Dashboard');
        console.log('📍 Navigation target:', targetRoute);
      }
      
      console.log('🎯 About to navigate to:', targetRoute);
      console.log('🎯 Current location before navigation:', window.location.href);
      
      // Perform the navigation with a small delay to ensure proper routing
      setTimeout(() => {
        console.log('🎯 Executing navigation to:', targetRoute);
        navigate(targetRoute);
        console.log('🎯 Navigation command executed');
        
        // Verify navigation happened
        setTimeout(() => {
          console.log('🎯 Navigation verification - Current URL:', window.location.href);
          console.log('🎯 Expected route:', targetRoute);
          console.log('🎯 Navigation successful:', window.location.pathname === targetRoute);
        }, 200);
      }, 100);
      
      // Log the final navigation decision
      console.log('🎯 Final navigation decision made');
      console.log('🎯 User role detected:', normalizedRole);
      console.log('🎯 Dashboard route selected:', 
        hasAdminRole ? '/admin' :
        isRiskOwner ? '/risk-owner-dashboard' :
        (isCEO || isAuditor) ? '/dashboard' :
        isManager ? '/dashboard' : '/user-dashboard'
      );
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(`Login failed: ${error.message}`);
      setDebugInfo(`Error details: ${error.stack || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Government Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to Government Risk Management System
          </p>
        </div>

        {/* Debug Panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">🔧 Debug Panel</h4>
          <div className="space-y-2">
            <div className="text-xs text-yellow-800">
              <strong>Backend Status:</strong> {backendStatus}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={testBackendConnection}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded hover:bg-yellow-300"
              >
                Test Backend
              </button>
              <button
                onClick={testLoginEndpoint}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded hover:bg-yellow-300"
              >
                Test Login
              </button>
            </div>
            {debugInfo && (
              <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                <strong>Debug Info:</strong> {debugInfo}
              </div>
            )}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Admin Access */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Administrator Access:</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <div><strong>System Admin:</strong> admin@admin.com / 12345678</div>
              <div className="text-xs text-blue-600 mt-1">Full system access and user management</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-black transition-colors">
                Register here
              </Link>
            </p>
            <div className="mt-2">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
