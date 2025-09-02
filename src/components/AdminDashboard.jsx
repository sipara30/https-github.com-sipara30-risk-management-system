import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { 
  createUser, 
  deleteUser, 
  updateUser, 
  updateUserRole,
  updateUserStatus,
  getDashboardSections,
  approveUser,
  getUsers,
  getRoles,
  getRisks,
  updateRisk,
  adminAPI,
  referenceAPI
} from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [dashboardSections, setDashboardSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  
  // Risks state
  const [risks, setRisks] = useState([]);
  const [assigningOwner, setAssigningOwner] = useState({}); // riskId -> userId (temp selection)

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRoleAssignmentModal, setShowRoleAssignmentModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToApprove, setUserToApprove] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Form data
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    roleId: '',
    employeeId: '',
    position: '',
    password: ''
  });

  const [roleAssignmentForm, setRoleAssignmentForm] = useState({
    roleId: '',
    departmentId: '',
    allowedSections: []
  });

  // Predefined role configurations with automatic dashboard section assignment
  const predefinedRoleConfigs = {
    'CEO': {
      sections: ['overview', 'risk_management', 'reports', 'system_health'],
      description: 'Full access to all dashboard sections including executive overview and strategic reports'
    },
    'DCEO': {
      sections: ['overview', 'risk_management', 'reports', 'system_health'],
      description: 'Deputy CEO with full access to all dashboard sections'
    },
    'Department Manager': {
      sections: ['overview', 'risk_management', 'reports'],
      description: 'Department-level access to risk management and reporting'
    },
    'Risk Owner': {
      sections: ['overview', 'risk_management', 'reports'],
      description: 'Risk ownership responsibilities with access to risk management tools'
    },
    'Risk Manager': {
      sections: ['overview', 'risk_management', 'reports'],
      description: 'Risk management focus with access to risk assessment tools'
    },
    'User': {
      sections: ['overview'],
      description: 'Basic user access to overview and risk submission'
    },
    'System Administrator': {
      sections: ['overview', 'risk_management', 'reports', 'system_health', 'user_management', 'system_settings'],
      description: 'Full system access including user management and system settings'
    },
    'Admin': {
      sections: ['overview', 'risk_management', 'reports', 'user_management'],
      description: 'Administrative access to user management and risk oversight'
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }
    
    // If authenticated, load dashboard data
    loadDashboardData();
  }, []);

  // Initialize roleAssignmentForm when userToApprove changes
  useEffect(() => {
    if (userToApprove) {
      setRoleAssignmentForm({
        roleId: '',
        departmentId: '',
        allowedSections: []
      });
    }
  }, [userToApprove]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-clear error messages after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
    loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to automatically set dashboard sections based on selected role
  const handleRoleSelection = (roleId) => {
    const selectedRole = roles.find(role => role.id == roleId);
    if (selectedRole) {
      const roleName = selectedRole.role_name;
      const config = predefinedRoleConfigs[roleName];
      
      if (config) {
        setRoleAssignmentForm(prev => ({
          ...prev,
          roleId: roleId,
          allowedSections: config.sections
        }));
      } else {
        // For custom roles, keep existing sections or set default
        setRoleAssignmentForm(prev => ({
          ...prev,
          roleId: roleId,
          allowedSections: prev.allowedSections
        }));
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading dashboard data...');
      
      // Load data sequentially to avoid race conditions
      const usersData = await getUsers();
      console.log('Users loaded:', usersData);
      console.log('Users data type:', typeof usersData);
      console.log('Users data structure:', JSON.stringify(usersData, null, 2));
      
      const rolesData = await getRoles();
      const departmentsData = await referenceAPI.getDepartments().catch(async () => {
        // fallback to admin endpoint if needed
        try { return await adminAPI.getDepartments(); } catch { return []; }
      });
      console.log('Roles loaded:', rolesData);
      
      const sectionsData = await getDashboardSections();
      console.log('Dashboard sections loaded:', sectionsData);
      
      // Fetch risks for the Risks tab
      const risksData = await getRisks();
      console.log('Risks loaded:', risksData);
      
      // Ensure we have arrays and handle different response formats
      const usersArray = Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.users || []);
      const rolesArray = Array.isArray(rolesData) ? rolesData : (rolesData?.data || rolesData?.roles || []);
      const departmentsArray = Array.isArray(departmentsData) ? departmentsData : (departmentsData?.data || departmentsData?.departments || []);
      const sectionsArray = Array.isArray(sectionsData) ? sectionsData : (sectionsData?.data || sectionsData?.sections || []);
      const risksArray = Array.isArray(risksData) ? risksData : (risksData?.data || risksData?.risks || []);
      
      setUsers(usersArray);
      setRoles(rolesArray);
      setDashboardSections(sectionsArray);
      setDepartments(departmentsArray);
      setRisks(risksArray);
      
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Dashboard data load error:', err);
      
      // Handle different types of errors
      if (err.message.includes('Access token required') || err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.message.includes('403')) {
        setError('Access denied. You do not have permission to view this dashboard.');
      } else if (err.message.includes('Database connection lost') || err.message.includes('503')) {
        setError('Database connection lost. Please refresh the page to try again.');
      } else {
      setError('Failed to load dashboard data: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Clear selected users when switching tabs
    if (tabId !== 'requests') {
      setSelectedUsers([]);
      setShowBulkActions(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim() || 
        !userForm.employeeId.trim() || !userForm.departmentId || !userForm.roleId) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      await createUser(userForm);
      setShowUserForm(false);
      setUserForm({ firstName: '', lastName: '', email: '', departmentId: '', roleId: '', employeeId: '', position: '', password: '' });
      loadDashboardData();
    } catch (err) {
      setError('Failed to create user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        loadDashboardData();
      } catch (err) {
        setError('Failed to delete user: ' + err.message);
      }
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, userForm);
      setEditingUser(null);
      setShowUserForm(false);
      setUserForm({ firstName: '', lastName: '', email: '', departmentId: '', roleId: '', employeeId: '', position: '', password: '' });
      loadDashboardData();
    } catch (err) {
      setError('Failed to update user: ' + err.message);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      departmentId: user.department_id || '',
      roleId: user.role_id || '',
      employeeId: user.employee_id || '',
      position: user.position || '',
      password: '' // Clear password when editing
    });
    setShowUserForm(true);
  };

  const handleApproveUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToApprove(user);
      setRoleAssignmentForm({ roleId: '', departmentId: '' });
      setShowRoleAssignmentModal(true);
    }
  };

  const handleRejectUser = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user access request?')) {
      try {
        await updateUserStatus(userId, 'rejected');
        setSuccess('User access request rejected');
        loadDashboardData();
      } catch (err) {
        setError('Failed to reject user: ' + err.message);
      }
    }
  };

  const handleApproveWithRole = async (e) => {
    e.preventDefault();
    
    if (!roleAssignmentForm.roleId) {
      setError('Please select a role');
      return;
    }

    try {
      setLoading(true);
      
      await approveUser(
        userToApprove.id, 
        roleAssignmentForm.roleId, 
        roleAssignmentForm.allowedSections
      );
      
      setSuccess('User approved and role assigned successfully!');
      setShowRoleAssignmentModal(false);
      setUserToApprove(null);
      setRoleAssignmentForm({ roleId: '', departmentId: '', allowedSections: [] });
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (err) {
      setError('Failed to approve user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to approve.');
      return;
    }

    if (window.confirm(`Are you sure you want to approve ${selectedUsers.length} selected user(s)?`)) {
      try {
        for (const userId of selectedUsers) {
          await updateUserStatus(userId, 'approved');
          // Optionally, assign a default role or specific role if needed
          await updateUserRole(userId, 1); // Assuming role ID 1 is the default approved role
        }
        setSuccess(`Successfully approved ${selectedUsers.length} user(s).`);
        setSelectedUsers([]);
        loadDashboardData();
      } catch (err) {
        setError('Failed to bulk approve users: ' + err.message);
      }
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to reject.');
      return;
    }

    if (window.confirm(`Are you sure you want to reject ${selectedUsers.length} selected user(s)?`)) {
      try {
        for (const userId of selectedUsers) {
          await updateUserStatus(userId, 'rejected');
        }
        setSuccess(`Successfully rejected ${selectedUsers.length} user(s).`);
        setSelectedUsers([]);
        loadDashboardData();
      } catch (err) {
        setError('Failed to bulk reject users: ' + err.message);
      }
    }
  };

  const exportPendingRequests = () => {
    const pendingUsers = users.filter(user => user.status === 'pending');
    if (pendingUsers.length === 0) {
      setError('No pending requests to export');
      return;
    }

    const csvData = [
      ['Name', 'Email', 'Employee ID', 'Request Date', 'Status'],
      ...pendingUsers.map(user => [
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.employee_id || 'Auto-generated',
        new Date(user.created_at || Date.now()).toLocaleDateString(),
        user.status
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccess('Pending requests exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if not logged in
  if (!localStorage.getItem('authToken')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be logged in to access the admin dashboard.</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-black transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">System Administrator</span>
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
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'users', name: 'User Management', icon: UsersIcon },
              { id: 'risks', name: 'Risks', icon: ShieldCheckIcon },
              { id: 'system', name: 'System Health', icon: CogIcon },
              { id: 'requests', name: 'Pending Requests', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.id === 'requests' && users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
            <p className="text-red-800">{error}</p>
                {error.includes('Database connection lost') && (
                  <button
                    onClick={loadDashboardData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    🔄 Retry Connection
                  </button>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <p className="text-green-800">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-4 text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-blue-600">{users.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                        <dd className="text-lg font-medium text-yellow-600">{users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length}</dd>
                      </dl>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTabChange('requests')}
                    className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-yellow-800">Review Pending Requests</p>
                      <p className="text-xs text-yellow-600">
                        {users.filter(user => user.status === 'pending').length} requests waiting
                      </p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowUserForm(true)}
                    className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <PlusIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-800">Add New User</p>
                      <p className="text-xs text-blue-600">Create user account manually</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {users.length > 0 ? (
                    <>
                      {/* Show pending requests first */}
                      {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                              <ClockIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-yellow-800">
                              Pending access request: {user.first_name} {user.last_name}
                          </p>
                            <p className="text-sm text-yellow-600">{user.email}</p>
                        </div>
                          <div className="text-sm text-yellow-600">
                          {new Date(user.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      ))}
                      
                      {/* Show recent approved users */}
                      {users.filter(user => user.status === 'approved').slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircleIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-800">
                              User approved: {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-green-600">{user.email}</p>
                          </div>
                          <div className="text-sm text-green-600">
                            {new Date(user.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activities</h3>
                      <p className="mt-1 text-sm text-gray-500">New user registrations and system changes will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowUserForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>+ Add</span>
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          user.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                              {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.status || 'pending'}
                            </span>
                            {user.status === 'approved' && user.assigned_role && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.assigned_role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.status === 'pending' || !user.status ? (
                          <>
                        <button
                              onClick={() => handleApproveUser(user)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Approve"
                        >
                              <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                              onClick={() => handleRejectUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject"
                        >
                              <XCircleIcon className="h-5 w-5" />
                        </button>
                          </>
                        ) : null}
              <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
              >
                          <PencilIcon className="h-5 w-5" />
              </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Risks Tab */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Reported Risks</h2>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {risks.map((risk) => (
                  <li key={risk.id} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3">
                        <div className="text-sm font-medium text-gray-900">{risk.risk_title || risk.title}</div>
                        <div className="text-xs text-gray-500">{risk.risk_code || risk.code}</div>
                      </div>
                      <div className="md:col-span-2 text-sm text-gray-700">
                        <div className="text-gray-500">Category</div>
                        <div>{risk.category}</div>
                      </div>
                      <div className="md:col-span-2 text-sm text-gray-700">
                        <div className="text-gray-500">Department</div>
                        <div>{risk.department}</div>
                      </div>
                      <div className="md:col-span-2 text-sm text-gray-700">
                        <div className="text-gray-500">Owner</div>
                        <div>{risk.owner || 'Not Assigned'}</div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm text-gray-600 mb-1">Assign/Change Owner</label>
                        <div className="flex items-center space-x-2">
                          <select
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            value={assigningOwner[risk.id] ?? (risk.ownerId || '')}
                            onChange={(e) => setAssigningOwner(prev => ({ ...prev, [risk.id]: e.target.value }))}
                          >
                            <option value="">Select user...</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                            ))}
                          </select>
                          <button
                            className="px-3 py-2 bg-primary text-white text-sm rounded-md hover:bg-black"
                            onClick={async () => {
                              try {
                                const selectedUserId = assigningOwner[risk.id];
                                if (!selectedUserId) {
                                  setError('Select a user to assign as owner.');
                                  return;
                                }
                                await updateRisk(risk.id, { risk_owner_id: parseInt(selectedUserId, 10) });
                                setSuccess('Risk owner assigned successfully.');
                                // Refresh risks list
                                const refreshed = await getRisks();
                                setRisks(Array.isArray(refreshed) ? refreshed : (refreshed?.data || refreshed?.risks || []));
                              } catch (e) {
                                setError(e.message || 'Failed to assign risk owner');
                              }
                            }}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {risks.length === 0 && (
                  <li className="px-6 py-12 text-center text-gray-500">No risks found.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Health Monitor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connection</span>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium text-gray-900">~15ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Server Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600">Running</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">24h 32m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Pending Access Requests</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length} pending requests
                </div>
                {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length > 0 && (
                  <>
                    <button
                      onClick={exportPendingRequests}
                      className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
                    </button>
                  </>
                )}
              </div>
            </div>

            {showBulkActions && (
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">Select All</span>
                    </label>
                    <span className="text-sm text-gray-600">
                      {selectedUsers.length} of {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length} selected
                    </span>
                  </div>
                  {selectedUsers.length > 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkApprove()}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve Selected ({selectedUsers.length})
                      </button>
                      <button
                        onClick={() => handleBulkReject()}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject Selected ({selectedUsers.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                <p className="mt-1 text-sm text-gray-500">All access requests have been processed.</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {users.filter(user => !user.status || user.status === 'pending' || user.status === 'pending_access').map((user) => (
                    <li key={user.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {showBulkActions && (
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                              className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          )}
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                              <ClockIcon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">
                              Employee ID: {user.employee_id || 'Auto-generated'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Status: {user.status || 'No status set'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested: {new Date(user.created_at || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <form onSubmit={editingUser ? handleEditUser : handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={userForm.employeeId}
                    onChange={(e) => setUserForm({...userForm, employeeId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={userForm.departmentId}
                    onChange={(e) => setUserForm({...userForm, departmentId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select Department</option>
                    {Array.isArray(departments) && departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={userForm.roleId}
                    onChange={(e) => {
                      setUserForm({...userForm, roleId: e.target.value});
                      handleRoleSelection(e.target.value);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select Role</option>
                    {Array.isArray(roles) && roles.map(role => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={userForm.position}
                    onChange={(e) => setUserForm({...userForm, position: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="e.g., Software Engineer, Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={userForm.password || ''}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Leave blank for default password (12345678)"
                  />
                  <p className="mt-1 text-xs text-gray-500">If no password is provided, a default password will be set</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      setUserForm({ firstName: '', lastName: '', email: '', departmentId: '', roleId: '', employeeId: '', position: '', password: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-black"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleAssignmentModal && userToApprove && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Approve User: {userToApprove.first_name} {userToApprove.last_name}
              </h3>
              <form onSubmit={handleApproveWithRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={roleAssignmentForm.roleId}
                    onChange={(e) => handleRoleSelection(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select Role</option>
                    {Array.isArray(roles) && roles.map(role => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                  
                  {/* Show role configuration info */}
                  {roleAssignmentForm.roleId && (() => {
                    const selectedRole = roles.find(role => role.id == roleAssignmentForm.roleId);
                    const config = selectedRole ? predefinedRoleConfigs[selectedRole.role_name] : null;
                    return config ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-sm font-medium text-blue-900">{selectedRole.role_name} Configuration</div>
                        <div className="text-xs text-blue-700 mt-1">{config.description}</div>
                        <div className="text-xs text-blue-600 mt-2">
                          <strong>Auto-assigned sections:</strong> {config.sections.join(', ')}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dashboard Access</label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {Array.isArray(dashboardSections) && dashboardSections.map(section => (
                      <label key={section.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(roleAssignmentForm.allowedSections || []).includes(section.section_name)}
                          onChange={(e) => {
                            const currentSections = roleAssignmentForm.allowedSections || [];
                            if (e.target.checked) {
                              setRoleAssignmentForm({
                                ...roleAssignmentForm,
                                allowedSections: [...currentSections, section.section_name]
                              });
                            } else {
                              setRoleAssignmentForm({
                                ...roleAssignmentForm,
                                allowedSections: currentSections.filter(s => s !== section.section_name)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{section.display_name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Sections are automatically configured based on the selected role. You can manually adjust if needed.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleAssignmentModal(false);
                      setUserToApprove(null);
                      setRoleAssignmentForm({ roleId: '', departmentId: '', allowedSections: [] });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-black disabled:opacity-50"
                  >
                    {loading ? 'Approving...' : 'Approve User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
