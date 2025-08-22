const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
  console.log('📤 Request options:', options);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Auth token found and added to headers');
  } else {
    console.log('⚠️ No auth token found in localStorage');
  }

  try {
    console.log('📡 Sending request to:', url);
    console.log('📤 Final request options:', defaultOptions);
    
    const response = await fetch(url, defaultOptions);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    console.log('📥 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Response is not JSON. Content-Type:', contentType);
      const textResponse = await response.text();
      console.error('❌ Response text:', textResponse.substring(0, 200));
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${textResponse.substring(0, 100)}...`);
    }
    
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (!response.ok) {
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      console.error('❌ API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('✅ API call successful');
    return data;
  } catch (error) {
    console.error('💥 API call failed:', error);
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    console.log('🔐 Login attempt for:', email);
    
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('🔐 Login response:', response);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('💾 Token and user data saved to localStorage');
      } else {
        console.warn('⚠️ No token received in login response');
      }
      
      return response;
    } catch (error) {
      console.error('🔐 Login failed:', error);
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

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
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

// Individual exports for AdminDashboard
export const createUser = adminAPI.createUser;
export const deleteUser = adminAPI.deleteUser;
export const updateUser = adminAPI.updateUser;
export const createDepartment = adminAPI.createDepartment;
export const createRole = adminAPI.createRole;
export const getSystemHealth = adminAPI.getSystemHealth;
export const getUsers = adminAPI.getUsers || referenceAPI.getUsers;
export const getDepartments = adminAPI.getDepartments || referenceAPI.getDepartments;
export const getRoles = adminAPI.getRoles || referenceAPI.getRoles;

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiCall('/health');
    return response.success;
  } catch (error) {
    return false;
  }
};
