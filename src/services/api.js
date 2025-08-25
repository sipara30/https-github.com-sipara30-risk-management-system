const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${textResponse.substring(0, 100)}...`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout');
    } catch (e) {
      console.warn('Logout endpoint failed, clearing client session anyway:', e.message);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken') || !!localStorage.getItem('user');
  },
};

// Risks API
export const risksAPI = {
  getAll: async () => {
    const response = await apiCall('/risks');
    return response;
  },

  getById: async (id) => {
    const response = await apiCall(`/risks/${id}`);
    return response;
  },

  create: async (riskData) => {
    const response = await apiCall('/risks', {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
    return response;
  },

  update: async (id, riskData) => {
    const response = await apiCall(`/risks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(riskData),
    });
    return response;
  },

  delete: async (id) => {
    const response = await apiCall(`/risks/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// Admin API
export const adminAPI = {
  createUser: async (userData) => {
    return await apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (userId) => {
    return await apiCall(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  updateUser: async (userId, userData) => {
    return await apiCall(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  updateUserRole: async (userId, roleId) => {
    const response = await apiCall(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
    return response;
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiCall(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response;
  },

  createDepartment: async (departmentData) => {
    const response = await apiCall('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
    return response;
  },

  createRole: async (roleData) => {
    const response = await apiCall('/admin/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
    return response;
  },

  getSystemHealth: async () => {
    const response = await apiCall('/admin/system-health');
    return response;
  },

  getCategories: async () => {
    const response = await apiCall('/admin/categories');
    return response;
  },

  createCategory: async (categoryData) => {
    const response = await apiCall('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return response;
  },

  getUsers: async () => {
    const response = await apiCall('/admin/users');
    return response;
  },

  getDashboardSections: async () => {
    const response = await apiCall('/admin/dashboard-sections');
    return response;
  },

  approveUser: async (userId, roleId, allowedSections) => {
    const response = await apiCall('/admin/approve-user', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId, allowedSections }),
    });
    return response;
  },

  getUserDashboardAccess: async () => {
    const response = await apiCall('/user/dashboard-access');
    return response;
  },

  getDepartments: async () => {
    const response = await apiCall('/admin/departments');
    return response;
  },

  getRoles: async () => {
    const response = await apiCall('/admin/roles');
    return response;
  },
};

// Reference data API
export const referenceAPI = {
  getCategories: async () => {
    const response = await apiCall('/categories');
    return response;
  },

  getDepartments: async () => {
    const response = await apiCall('/departments');
    return response;
  },

  getUsers: async () => {
    const response = await apiCall('/users');
    return response;
  },

  getRoles: async () => {
    const response = await apiCall('/roles');
    return response;
  },
};

// CEO API
export const ceoAPI = {
  getOverview: async () => {
    const response = await apiCall('/ceo/overview');
    return response;
  },
  getRiskManagement: async () => {
    const response = await apiCall('/ceo/risk-management');
    return response;
  },
  getReports: async () => {
    const response = await apiCall('/ceo/reports');
    return response;
  },
  getSystemHealth: async () => {
    const response = await apiCall('/ceo/system-health');
    return response;
  }
};

// Individual exports for AdminDashboard
export const createUser = adminAPI.createUser;
export const deleteUser = adminAPI.deleteUser;
export const updateUser = adminAPI.updateUser;
export const updateUserRole = adminAPI.updateUserRole;
export const updateUserStatus = adminAPI.updateUserStatus;
export const getUsers = adminAPI.getUsers;
export const getRoles = adminAPI.getRoles;
export const getDashboardSections = adminAPI.getDashboardSections;
export const approveUser = adminAPI.approveUser;
export const getUserDashboardAccess = adminAPI.getUserDashboardAccess;

// Add risks helpers for admin usage
export const getRisks = risksAPI.getAll;
export const updateRisk = risksAPI.update;

// Individual exports for CEO Dashboard
export const getCEOOverview = ceoAPI.getOverview;
export const getCEORiskManagement = ceoAPI.getRiskManagement;
export const getCEOReports = ceoAPI.getReports;
export const getCEOSystemHealth = ceoAPI.getSystemHealth;

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiCall('/health');
    return response.success;
  } catch (error) {
    return false;
  }
};
