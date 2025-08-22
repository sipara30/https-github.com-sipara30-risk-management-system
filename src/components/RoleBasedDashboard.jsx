import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { getUserDashboardAccess } from '../services/api';

const RoleBasedDashboard = () => {
  const [user, setUser] = useState(null);
  const [allowedSections, setAllowedSections] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [assignedRole, setAssignedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserDashboardAccess();
  }, []);

  const loadUserDashboardAccess = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const accessData = await getUserDashboardAccess();
      
      setUser(userData);
      setAllowedSections(accessData.allowedSections || ['overview']);
      setPermissions(accessData.permissions || {});
      setAssignedRole(accessData.assignedRole || 'User');
      
      // Set first allowed section as active
      if (accessData.allowedSections && accessData.allowedSections.length > 0) {
        setActiveTab(accessData.allowedSections[0]);
      }
      
    } catch (err) {
      console.error('Failed to load dashboard access:', err);
      setError('Failed to load dashboard access. Please log in again.');
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  // Define available dashboard sections with their icons and descriptions
  const dashboardSections = {
    overview: {
      icon: ChartBarIcon,
      name: 'Overview',
      description: 'Dashboard overview and summary'
    },
    user_management: {
      icon: UsersIcon,
      name: 'User Management',
      description: 'Manage system users',
      requiresPermission: 'can_manage_users'
    },
    pending_requests: {
      icon: ClockIcon,
      name: 'Pending Requests',
      description: 'View and approve user requests',
      requiresPermission: 'can_approve_users'
    },
    system_health: {
      icon: CogIcon,
      name: 'System Health',
      description: 'System monitoring and health'
    },
    risk_management: {
      icon: ShieldCheckIcon,
      name: 'Risk Management',
      description: 'Risk assessment and management'
    },
    reports: {
      icon: DocumentTextIcon,
      name: 'Reports',
      description: 'Generate and view reports'
    },
    settings: {
      icon: Cog6ToothIcon,
      name: 'Settings',
      description: 'System configuration'
    },
    audit_logs: {
      icon: ClipboardDocumentListIcon,
      name: 'Audit Logs',
      description: 'System activity logs',
      requiresPermission: 'can_view_audit_logs'
    }
  };

  // Filter sections based on user permissions
  const accessibleSections = allowedSections.filter(sectionName => {
    const section = dashboardSections[sectionName];
    if (!section) return false;
    
    if (section.requiresPermission) {
      return permissions[section.requiresPermission] === true;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Risk Management Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({assignedRole})
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-8">
            {accessibleSections.map((sectionName) => {
              const section = dashboardSections[sectionName];
              return (
                <button
                  key={sectionName}
                  onClick={() => setActiveTab(sectionName)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === sectionName
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user?.firstName}!</h2>
              <p className="text-gray-600 mb-4">
                You have access to the following dashboard sections based on your {assignedRole} role:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessibleSections.map((sectionName) => {
                  const section = dashboardSections[sectionName];
                  return (
                    <div key={sectionName} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <section.icon className="h-6 w-6 text-primary mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{section.name}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'user_management' && permissions.can_manage_users && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
              <p className="text-gray-600">Manage system users and their permissions.</p>
              {/* Add user management functionality here */}
            </div>
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'pending_requests' && permissions.can_approve_users && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
              <p className="text-gray-600">Review and approve user access requests.</p>
              {/* Add pending requests functionality here */}
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system_health' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
              <p className="text-gray-600">Monitor system performance and health metrics.</p>
              {/* Add system health monitoring here */}
            </div>
          </div>
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk_management' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Management</h2>
              <p className="text-gray-600">Assess and manage organizational risks.</p>
              {/* Add risk management functionality here */}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports</h2>
              <p className="text-gray-600">Generate and view system reports.</p>
              {/* Add reporting functionality here */}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600">Configure system settings and preferences.</p>
              {/* Add settings functionality here */}
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit_logs' && permissions.can_view_audit_logs && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Audit Logs</h2>
              <p className="text-gray-600">View system activity and audit trails.</p>
              {/* Add audit logs functionality here */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoleBasedDashboard; 