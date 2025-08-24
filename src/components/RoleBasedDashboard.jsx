import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  getCEOOverview, 
  getCEORiskManagement, 
  getCEOReports, 
  getCEOSystemHealth 
} from '../services/api';

const RoleBasedDashboard = () => {
  const [user, setUser] = useState(null);
  const [allowedSections, setAllowedSections] = useState([]);
  const [assignedRole, setAssignedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states for each tab
  const [overviewData, setOverviewData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [systemHealthData, setSystemHealthData] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadUserDashboardAccess();
  }, []);

  useEffect(() => {
    if (activeTab && !loading) {
      loadTabData(activeTab);
    }
  }, [activeTab, loading]);

  const loadUserDashboardAccess = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // For CEO role, set default sections
      const ceoSections = ['overview', 'risk_management', 'reports', 'system_health'];
      setUser(userData);
      setAllowedSections(ceoSections);
      setAssignedRole('CEO');
      setActiveTab('overview');
      
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

  const loadTabData = async (tabName) => {
    try {
      switch (tabName) {
        case 'overview':
          if (!overviewData) {
            const data = await getCEOOverview();
            setOverviewData(data);
          }
          break;
        case 'risk_management':
          if (!riskData) {
            const data = await getCEORiskManagement();
            setRiskData(data);
          }
          break;
        case 'reports':
          if (!reportsData) {
            const data = await getCEOReports();
            setReportsData(data);
          }
          break;
        case 'system_health':
          if (!systemHealthData) {
            const data = await getCEOSystemHealth();
            setSystemHealthData(data);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${tabName} data:`, error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your CEO dashboard...</p>
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
      description: 'Executive dashboard overview and summary'
    },
    risk_management: {
      icon: ShieldCheckIcon,
      name: 'Risk Management',
      description: 'Strategic risk assessment and management'
    },
    reports: {
      icon: DocumentTextIcon,
      name: 'Reports',
      description: 'Executive reports and analytics'
    },
    system_health: {
      icon: CogIcon,
      name: 'System Health',
      description: 'System performance and infrastructure'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Risk Management Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} (CEO)
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
            {allowedSections.map((sectionName) => {
              const section = dashboardSections[sectionName];
              return (
                <button
                  key={sectionName}
                  onClick={() => setActiveTab(sectionName)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === sectionName
                      ? 'border-green-600 text-green-600'
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome, {user?.firstName}!</h2>
              <p className="text-gray-600 mb-6">
                Here's your executive overview of the Risk Management System
              </p>
              
              {overviewData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Statistics Cards */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-blue-100 text-sm">Total Users</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.totalUsers || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-yellow-100 text-sm">Pending Approvals</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.pendingUsers || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-green-100 text-sm">Approved Users</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.approvedUsers || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <CogIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-purple-100 text-sm">Departments</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.totalDepartments || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Users */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Registrations</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {overviewData.recentUsers?.length > 0 ? (
                        <div className="space-y-3">
                          {overviewData.recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(user.created_at)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent user registrations</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading overview data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk_management' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Management Overview</h2>
              
              {riskData ? (
                <div className="space-y-6">
                  {/* Risk Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm text-red-600">High Risks</p>
                          <p className="text-2xl font-bold text-red-700">{riskData.highRisks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
                        <div>
                          <p className="text-sm text-yellow-600">Medium Risks</p>
                          <p className="text-2xl font-bold text-yellow-700">{riskData.mediumRisks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-green-600">Low Risks</p>
                          <p className="text-2xl font-bold text-green-700">{riskData.lowRisks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-blue-600">Total Risks</p>
                          <p className="text-2xl font-bold text-blue-700">{riskData.totalRisks}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Trends Chart */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trends (Last 6 Months)</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-end space-x-2 h-32">
                        {riskData.riskTrends?.map((trend, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-green-500 rounded-t"
                              style={{ height: `${(trend.count / 20) * 100}%` }}
                            ></div>
                            <p className="text-xs text-gray-600 mt-2">{trend.month}</p>
                            <p className="text-xs font-medium text-gray-900">{trend.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Management Actions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Quick Actions</h4>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Generate Risk Report
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                        Schedule Risk Review
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm">
                        Export Risk Data
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading risk management data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Reports</h2>
              
              {reportsData ? (
                <div className="space-y-4">
                  {reportsData.reports?.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{report.title}</h3>
                          <p className="text-gray-600 mb-3">{report.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              {report.type}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Last generated: {formatDate(report.lastGenerated)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              report.status === 'available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Generate New Report */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Custom Report</h3>
                    <p className="text-gray-500 mb-4">Create a new executive report with custom parameters</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Create Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading reports data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system_health' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health & Performance</h2>
              
              {systemHealthData ? (
                <div className="space-y-6">
                  {/* System Status Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Overall Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            systemHealthData.status === 'healthy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {systemHealthData.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Database</span>
                          <span className="text-green-600 font-medium">
                            {systemHealthData.databaseStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Uptime</span>
                          <span className="font-medium">
                            {formatUptime(systemHealthData.uptime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Active Connections</span>
                          <span className="font-medium">
                            {systemHealthData.activeConnections}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600">System Load</span>
                            <span className="text-sm font-medium">
                              {(systemHealthData.systemLoad * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${systemHealthData.systemLoad * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600">Memory Usage</span>
                            <span className="text-sm font-medium">
                              {Math.round(systemHealthData.memoryUsage?.heapUsed / 1024 / 1024)} MB
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(systemHealthData.memoryUsage?.heapUsed / systemHealthData.memoryUsage?.heapTotal) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Last Backup Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Backup Information</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">
                        Last backup: {formatDate(systemHealthData.lastBackup)}
                      </span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Initiate Backup
                      </button>
                    </div>
                  </div>
                  
                  {/* System Actions */}
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      <ArrowPathIcon className="h-4 w-4 mr-2 inline" />
                      Refresh Metrics
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Generate Health Report
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                      System Diagnostics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading system health data...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoleBasedDashboard; 