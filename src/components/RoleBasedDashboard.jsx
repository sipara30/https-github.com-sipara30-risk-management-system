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
  risksAPI,
  referenceAPI
} from '../services/api';
import Reports from './Reports';

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
  
  // UI state: risk detail modal & tooltip for charts
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [chartHover, setChartHover] = useState({ index: -1, x: 0, y: 0 });
  
  // Quick actions modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [reviewDateTime, setReviewDateTime] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  
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
            try {
              console.log('🔍 Fetching overview data for CEO dashboard...');
              // Fetch comprehensive overview data for CEO
              const [risks, departments, categories, users] = await Promise.all([
                risksAPI.getAll(),
                referenceAPI.getDepartments(),
                referenceAPI.getCategories(),
                referenceAPI.getUsers()
              ]);
              
              console.log('📊 Raw overview data:', { risks, departments, categories, users });
            
            const overviewData = {
              statistics: {
                totalRisks: risks.length,
                pendingRisks: risks.filter(r => r.status === 'Submitted').length,
                inReviewRisks: risks.filter(r => r.status === 'In Review').length,
                mitigatedRisks: risks.filter(r => r.status === 'Mitigated').length,
                escalatedRisks: risks.filter(r => r.status === 'Escalated').length,
                totalDepartments: departments.length,
                totalUsers: users.length,
                highPriorityRisks: risks.filter(r => r.priority === 'High').length,
                mediumPriorityRisks: risks.filter(r => r.priority === 'Medium').length,
                lowPriorityRisks: risks.filter(r => r.priority === 'Low').length
              },
              recentRisks: risks.slice(0, 5),
              riskTrends: {
                byCategory: categories.map(cat => ({
                  category: cat.category_name,
                  count: risks.filter(r => (r.risk_categories?.category_name === cat.category_name) || (r.category === cat.category_name)).length
                })),
                byDepartment: departments.map(dept => ({
                  department: dept.department_name,
                  count: risks.filter(r => (r.departments?.department_name === dept.department_name) || (r.department === dept.department_name)).length
                })),
                byStatus: [
                  { status: 'Submitted', count: risks.filter(r => r.status === 'Submitted').length },
                  { status: 'In Review', count: risks.filter(r => r.status === 'In Review').length },
                  { status: 'Mitigated', count: risks.filter(r => r.status === 'Mitigated').length },
                  { status: 'Escalated', count: risks.filter(r => r.status === 'Escalated').length }
                ]
              },
              // Add comprehensive risk data for CEO
              riskOverview: {
                totalRisks: risks.length,
                criticalRisks: risks.filter(r => r.priority === 'High' && r.status !== 'Mitigated').length,
                riskExposure: risks.filter(r => r.status !== 'Mitigated').length,
                complianceStatus: risks.filter(r => r.status === 'Mitigated').length
              },
              recentActivity: risks.slice(0, 10).map(risk => ({
                id: risk.id,
                type: 'Risk',
                title: risk.risk_title,
                status: risk.status,
                priority: risk.priority,
                reporter: risk.users_risks_submitted_byTousers ? 
                  `${risk.users_risks_submitted_byTousers.first_name} ${risk.users_risks_submitted_byTousers.last_name}` : 
                  risk.submitted_by_name || 'Unknown',
                evaluator: risk.users_risks_evaluated_byTousers ? 
                  `${risk.users_risks_evaluated_byTousers.first_name} ${risk.users_risks_evaluated_byTousers.last_name}` : 
                  risk.evaluated_by_name || 'Not Evaluated',
                date: risk.date_reported || risk.created_at,
                department: risk.departments?.department_name || risk.department || 'N/A',
                category: risk.risk_categories?.category_name || risk.category || 'N/A'
              }))
            };
            
            console.log('✅ Processed overview data for CEO:', overviewData);
            setOverviewData(overviewData);
            } catch (error) {
              console.error('❌ Error loading overview data:', error);
            }
          }
          break;
        case 'risk_management':
          if (!riskData) {
            try {
              // Fetch all risks with detailed information for CEO review
              console.log('🔍 Fetching risks for CEO dashboard...');
              const risks = await risksAPI.getAll();
              console.log('📊 Raw risks data:', risks);
              console.log('🔍 Sample risk structure:', risks[0]);
              
              const [categories] = await Promise.all([
                referenceAPI.getCategories()
              ]);
              console.log('📂 Categories data:', categories);
              console.log('🔍 Sample category structure:', categories[0]);
              
              const riskData = {
                // Summary statistics for the cards
                highRisks: risks.filter(r => r.priority === 'High').length,
                mediumRisks: risks.filter(r => r.priority === 'Medium').length,
                lowRisks: risks.filter(r => r.priority === 'Low').length,
                totalRisks: risks.length,
                
                // Risk trends for the chart
                riskTrends: [
                  { month: 'Jan', count: risks.filter(r => new Date(r.created_at).getMonth() === 0).length },
                  { month: 'Feb', count: risks.filter(r => new Date(r.created_at).getMonth() === 1).length },
                  { month: 'Mar', count: risks.filter(r => new Date(r.created_at).getMonth() === 2).length },
                  { month: 'Apr', count: risks.filter(r => new Date(r.created_at).getMonth() === 3).length },
                  { month: 'May', count: risks.filter(r => new Date(r.created_at).getMonth() === 4).length },
                  { month: 'Jun', count: risks.filter(r => new Date(r.created_at).getMonth() === 5).length }
                ],
                
                // Detailed risk information
                allRisks: risks,
                riskSummary: {
                  total: risks.length,
                  byStatus: {
                    'Submitted': risks.filter(r => r.status === 'Submitted').length,
                    'In Review': risks.filter(r => r.status === 'In Review').length,
                    'Mitigated': risks.filter(r => r.status === 'Mitigated').length,
                    'Escalated': risks.filter(r => r.status === 'Escalated').length
                  },
                  byPriority: {
                    'High': risks.filter(r => r.priority === 'High').length,
                    'Medium': risks.filter(r => r.priority === 'Medium').length,
                    'Low': risks.filter(r => r.priority === 'Low').length
                  },
                                  byCategory: categories.map(cat => ({
                  category: cat.category_name,
                  count: risks.filter(r => (r.risk_categories?.category_name === cat.category_name) || (r.category === cat.category_name)).length
                }))
                }
              };
              
              console.log('✅ Processed risk data for CEO:', riskData);
              setRiskData(riskData);
            } catch (error) {
              console.error('❌ Error loading risk management data:', error);
            }
          }
          break;
        case 'reports':
          if (!reportsData) {
            // Generate comprehensive reports for CEO
            const risks = await risksAPI.getAll();
            const [categories, departments] = await Promise.all([
              referenceAPI.getCategories(),
              referenceAPI.getDepartments()
            ]);
            
            const reportsData = {
              executiveSummary: {
                totalRisks: risks.length,
                criticalRisks: risks.filter(r => r.priority === 'High' && r.status !== 'Mitigated').length,
                riskExposure: risks.filter(r => r.status !== 'Mitigated').length,
                complianceStatus: risks.filter(r => r.status === 'Mitigated').length
              },
              detailedReports: {
                byDepartment: departments.map(dept => ({
                  department: dept.department_name,
                  risks: risks.filter(r => r.departments?.department_name === dept.department_name),
                  count: risks.filter(r => r.departments?.department_name === dept.department_name).length
                })),
                byCategory: categories.map(cat => ({
                  category: cat.category_name,
                  risks: risks.filter(r => r.risk_categories?.category_name === cat.category_name),
                  count: risks.filter(r => r.risk_categories?.category_name === cat.category_name).length
                }))
              }
            };
            setReportsData(reportsData);
          }
          break;
        case 'system_health':
          if (!systemHealthData) {
            try {
              const auth = localStorage.getItem('authToken');
              const headers = { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) };

              const fetchJson = async (url, opts) => {
                try {
                  const res = await fetch(url, { ...opts, headers });
                  if (!res.ok) throw new Error(`${res.status}`);
                  return await res.json();
                } catch (e) { return null; }
              };

              const [health, ceoHealth, smtp, users] = await Promise.all([
                fetchJson('http://localhost:3001/api/health'),
                fetchJson('http://localhost:3001/api/ceo/system-health'),
                fetchJson('http://localhost:3001/api/admin/smtp-health'),
                referenceAPI.getUsers().catch(() => [])
              ]);

              const normalized = {
                status: (health?.status || health?.success === true ? 'healthy' : ceoHealth?.status) || 'unknown',
                uptime: ceoHealth?.uptime ?? health?.uptime ?? 0,
                memoryUsage: ceoHealth?.memoryUsage ?? {},
                databaseStatus: health?.database || ceoHealth?.databaseStatus || 'unknown',
                lastBackup: ceoHealth?.lastBackup || null,
                activeConnections: ceoHealth?.activeConnections ?? 0,
                systemLoad: ceoHealth?.systemLoad ?? 0,
                smtp: smtp?.ok ? 'connected' : (smtp ? 'error' : 'unknown'),
                apiStatus: ((health && (health.status === 'ok' || health.success)) ? 'Operational' : 'Degraded'),
                activeUsers: Array.isArray(users) ? users.length : 0
              };

              setSystemHealthData(normalized);
            } catch (e) {
              console.error('Error loading system health:', e);
              setSystemHealthData({ status: 'unknown', uptime: 0, databaseStatus: 'unknown', apiStatus: 'Degraded' });
            }
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
  
  const handleViewRisk = (risk) => {
    setSelectedRisk(risk);
    setShowRiskModal(true);
  };
  
  const handleExportRiskCSV = (risk) => {
    const headers = ['Risk ID','Title','Category','Priority','Status','Reported By','Date Reported','Evaluated By'];
    const row = [
      risk.risk_code,
      risk.risk_title,
      risk.risk_categories?.category_name || risk.category || 'N/A',
      risk.priority,
      risk.status,
      risk.users_risks_submitted_byTousers ? `${risk.users_risks_submitted_byTousers.first_name} ${risk.users_risks_submitted_byTousers.last_name}` : (risk.submitted_by_name || 'N/A'),
      new Date(risk.date_reported || risk.created_at).toISOString(),
      risk.users_risks_evaluated_byTousers ? `${risk.users_risks_evaluated_byTousers.first_name} ${risk.users_risks_evaluated_byTousers.last_name}` : (risk.evaluated_by_name || 'Not Evaluated')
    ];
    const csv = [headers.join(','), row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${risk.risk_code || 'risk'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllRisksCSV = () => {
    if (!riskData?.allRisks?.length) return;
    const headers = ['Risk ID','Title','Category','Priority','Status','Reported By','Date Reported','Evaluated By'];
    const rows = riskData.allRisks.map(risk => [
      risk.risk_code,
      risk.risk_title,
      risk.risk_categories?.category_name || risk.category || 'N/A',
      risk.priority,
      risk.status,
      risk.users_risks_submitted_byTousers ? `${risk.users_risks_submitted_byTousers.first_name} ${risk.users_risks_submitted_byTousers.last_name}` : (risk.submitted_by_name || 'N/A'),
      new Date(risk.date_reported || risk.created_at).toISOString(),
      risk.users_risks_evaluated_byTousers ? `${risk.users_risks_evaluated_byTousers.first_name} ${risk.users_risks_evaluated_byTousers.last_name}` : (risk.evaluated_by_name || 'Not Evaluated')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risks_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleGenerateRiskReport = () => {
    setShowReportModal(true);
  };
  
  const printReport = () => {
    const printContent = document.getElementById('ceo-risk-report');
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Risk Report</title><style>body{font-family:Inter,system-ui,Arial;padding:24px} h1{margin:0 0 8px} .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px} .card{border:1px solid #e5e7eb;border-radius:8px;padding:12px} table{width:100%;border-collapse:collapse;margin-top:16px} th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px;text-align:left}</style></head><body>`);
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };
  
  const handleScheduleReview = (e) => {
    e?.preventDefault?.();
    if (!reviewDateTime) return setShowScheduleModal(false);
    // Build a simple ICS invite
    const dt = new Date(reviewDateTime);
    const dtStr = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEnd = new Date(dt.getTime() + 60*60*1000); // +1 hour
    const dtEndStr = dtEnd.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const description = (reviewNotes || 'Risk Review Meeting').replace(/\n/g, '\\n');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ECWC//RiskManagement//EN\nBEGIN:VEVENT\nUID:${Date.now()}@ecwc\nDTSTAMP:${dtStr}\nDTSTART:${dtStr}\nDTEND:${dtEndStr}\nSUMMARY:Risk Review\nDESCRIPTION:${description}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-review.ics';
    a.click();
    URL.revokeObjectURL(url);
    setShowScheduleModal(false);
    setReviewDateTime('');
    setReviewNotes('');
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
                  {/* High-level Alerts */}
                  {(overviewData.statistics?.highPriorityRisks > 0 || overviewData.statistics?.escalatedRisks > 0) && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-red-800 font-semibold">Attention required</p>
                          <p className="text-sm text-red-700">{overviewData.statistics?.highPriorityRisks || 0} high-priority risks and {overviewData.statistics?.escalatedRisks || 0} escalated risks need review.</p>
                        </div>
                        <button className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm" onClick={() => setActiveTab('risk_management')}>View Risks</button>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Risk Statistics Cards */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-red-100 text-sm">Total Risks</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.totalRisks || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-yellow-100 text-sm">Pending Risks</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.pendingRisks || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-green-100 text-sm">Mitigated Risks</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.mitigatedRisks || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-8 w-8 mr-3" />
                        <div>
                          <p className="text-purple-100 text-sm">High Priority</p>
                          <p className="text-2xl font-bold">{overviewData.statistics?.highPriorityRisks || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Executive Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Status Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                      <div className="flex items-end space-x-3 h-40">
                        {overviewData.riskTrends?.byStatus?.map((s, idx) => {
                          const max = Math.max(...overviewData.riskTrends.byStatus.map(x => x.count || 0));
                          const height = max > 0 ? (s.count / max) * 100 : 0;
                          const color = s.status === 'Escalated' ? 'bg-red-500' : s.status === 'Mitigated' ? 'bg-green-500' : s.status === 'In Review' ? 'bg-yellow-500' : 'bg-blue-500';
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className={`${color} w-full rounded-t`} style={{ height: `${height}%` }}></div>
                              <p className="text-xs mt-2 text-gray-600">{s.status}</p>
                              <p className="text-xs font-medium text-gray-900">{s.count}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Priority Distribution Donut */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Mix</h3>
                      {(() => {
                        const high = overviewData.statistics?.highPriorityRisks || 0;
                        const med = overviewData.statistics?.mediumPriorityRisks || 0;
                        const low = overviewData.statistics?.lowPriorityRisks || 0;
                        const total = high + med + low || 1;
                        const highPct = (high / total) * 100;
                        const medPct = (med / total) * 100;
                        const lowPct = 100 - highPct - medPct;
                        return (
                          <div className="flex items-center">
                            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#e5e7eb" strokeWidth="4"></circle>
                              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray={`${highPct} ${100 - highPct}`} strokeDashoffset="0"></circle>
                              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${medPct} ${100 - medPct}`} strokeDashoffset={`-${highPct}`}></circle>
                              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray={`${lowPct} ${100 - lowPct}`} strokeDashoffset={`-${highPct + medPct}`}></circle>
                            </svg>
                            <div className="ml-4 space-y-1 text-sm">
                              <div className="flex items-center"><span className="w-2 h-2 rounded-sm bg-red-500 mr-2"></span>High: {high}</div>
                              <div className="flex items-center"><span className="w-2 h-2 rounded-sm bg-yellow-500 mr-2"></span>Medium: {med}</div>
                              <div className="flex items-center"><span className="w-2 h-2 rounded-sm bg-green-500 mr-2"></span>Low: {low}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Risks by Department */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Departments by Risk</h3>
                      <div className="space-y-2">
                        {overviewData.riskTrends?.byDepartment?.slice(0, 6).map((d, idx) => {
                          const max = Math.max(...overviewData.riskTrends.byDepartment.map(x => x.count || 0));
                          const width = max > 0 ? (d.count / max) * 100 : 0;
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{d.department}</span>
                                <span className="font-medium text-gray-900">{d.count}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded h-2">
                                <div className="bg-blue-600 h-2 rounded" style={{ width: `${width}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* System Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Departments</p>
                      <p className="text-2xl font-bold text-gray-900">{overviewData.statistics?.totalDepartments || 0}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Users</p>
                      <p className="text-2xl font-bold text-gray-900">{overviewData.statistics?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Active Risks (non-mitigated)</p>
                      <p className="text-2xl font-bold text-gray-900">{overviewData.riskOverview?.riskExposure || 0}</p>
                    </div>
                  </div>
                  
                  {/* Recent Risk Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Risk Activity</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {overviewData.recentActivity?.length > 0 ? (
                        <div className="space-y-3">
                          {overviewData.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{activity.title}</p>
                                                                  <p className="text-sm text-gray-500">
                                  {activity.category || 'N/A'} • {activity.department || 'N/A'}
                                </p>
                                  <p className="text-xs text-gray-400">
                                    Reported by: {activity.reporter} • Evaluated by: {activity.evaluator}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  activity.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  activity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {activity.priority}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  activity.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                  activity.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                                  activity.status === 'Mitigated' ? 'bg-green-100 text-green-800' :
                                  activity.status === 'Escalated' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {activity.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(activity.date)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent risk activity</p>
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
                  {/* Executive Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm text-red-600">High Priority</p>
                          <p className="text-2xl font-bold text-red-700">{riskData.highRisks}</p>
                          <p className="text-xs text-red-500">Require immediate attention</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-6 w-6 text-yellow-600 mr-2" />
                        <div>
                          <p className="text-sm text-yellow-600">Pending Evaluation</p>
                          <p className="text-2xl font-bold text-yellow-700">{riskData.allRisks?.filter(r => r.status === 'Submitted').length || 0}</p>
                          <p className="text-xs text-yellow-500">Awaiting risk owner review</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-blue-600">Under Review</p>
                          <p className="text-2xl font-bold text-blue-700">{riskData.allRisks?.filter(r => r.status === 'In Review').length || 0}</p>
                          <p className="text-xs text-blue-500">Being evaluated</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-green-600">Mitigated</p>
                          <p className="text-2xl font-bold text-green-700">{riskData.allRisks?.filter(r => r.status === 'Mitigated').length || 0}</p>
                          <p className="text-xs text-green-500">Successfully managed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Evaluation Pipeline */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Evaluation Pipeline</h3>
                      <div className="space-y-4">
                        {(() => {
                          const submitted = riskData.allRisks?.filter(r => r.status === 'Submitted').length || 0;
                          const inReview = riskData.allRisks?.filter(r => r.status === 'In Review').length || 0;
                          const evaluated = riskData.allRisks?.filter(r => r.status === 'Mitigated' || r.status === 'Escalated').length || 0;
                          const total = submitted + inReview + evaluated || 1;
                          
                          return [
                            { stage: 'Reported', count: submitted, color: 'bg-yellow-500', percentage: (submitted / total) * 100 },
                            { stage: 'Under Evaluation', count: inReview, color: 'bg-blue-500', percentage: (inReview / total) * 100 },
                            { stage: 'Completed', count: evaluated, color: 'bg-green-500', percentage: (evaluated / total) * 100 }
                          ].map((stage, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div className={`${stage.color} h-2 rounded-full transition-all duration-300`} style={{ width: `${stage.percentage}%` }}></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-8">{stage.count}</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Risk Score Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Distribution</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(() => {
                          const scoreCategories = [
                            { label: 'Critical', range: '0.561-0.72', color: 'bg-red-500', count: riskData.allRisks?.filter(r => {
                              const score = parseFloat(r.highest_risk_score || r.calculated_risk_score || 0);
                              return score >= 0.561 && score <= 0.72;
                            }).length || 0 },
                            { label: 'High', range: '0.241-0.56', color: 'bg-orange-500', count: riskData.allRisks?.filter(r => {
                              const score = parseFloat(r.highest_risk_score || r.calculated_risk_score || 0);
                              return score >= 0.241 && score <= 0.56;
                            }).length || 0 },
                            { label: 'Medium', range: '0.081-0.24', color: 'bg-yellow-500', count: riskData.allRisks?.filter(r => {
                              const score = parseFloat(r.highest_risk_score || r.calculated_risk_score || 0);
                              return score >= 0.081 && score <= 0.24;
                            }).length || 0 },
                            { label: 'Low', range: '0.005-0.08', color: 'bg-green-500', count: riskData.allRisks?.filter(r => {
                              const score = parseFloat(r.highest_risk_score || r.calculated_risk_score || 0);
                              return score >= 0.005 && score <= 0.08;
                            }).length || 0 }
                          ];
                          
                          return scoreCategories.map((cat, idx) => (
                            <div key={idx} className="text-center">
                              <div className={`${cat.color} text-white rounded-lg p-3 mb-2`}>
                                <div className="text-lg font-bold">{cat.count}</div>
                                <div className="text-xs opacity-90">{cat.label}</div>
                              </div>
                              <div className="text-xs text-gray-500">{cat.range}</div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Risk Trends Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Risk Trends & Evaluation Progress (Last 6 Months)</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Reported</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>Evaluated</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-64">
                      {/* Enhanced chart with dual data series */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-full border-t border-gray-200 flex justify-end">
                            <span className="text-xs text-gray-400 -mt-2 mr-2">{(5-i) * 4}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-end space-x-1 px-8">
                        {riskData.riskTrends?.map((trend, index) => {
                          const max = Math.max(...riskData.riskTrends.map(t => t.count || 0)) || 1;
                          const reportedHeight = ((trend.count || 0) / max) * 100;
                          const evaluatedCount = Math.floor((trend.count || 0) * 0.7); // Simulate evaluation rate
                          const evaluatedHeight = (evaluatedCount / max) * 100;
                          
                          return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="w-full flex space-x-1">
                            <div 
                                  className="flex-1 bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-opacity duration-200"
                                  style={{ height: `${reportedHeight}%` }}
                                  title={`${trend.month}: ${trend.count} reported`}
                            ></div>
                                <div
                                  className="flex-1 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity duration-200"
                                  style={{ height: `${evaluatedHeight}%` }}
                                  title={`${trend.month}: ${evaluatedCount} evaluated`}
                                ></div>
                              </div>
                            <p className="text-xs text-gray-600 mt-2">{trend.month}</p>
                              <div className="text-xs text-center">
                                <div className="text-red-600 font-medium">{trend.count}</div>
                                <div className="text-blue-600">{evaluatedCount}</div>
                          </div>
                      </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Risk Owner Performance */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Owner Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        const ownerStats = {};
                        riskData.allRisks?.forEach(risk => {
                          const owner = risk.users_risks_evaluated_byTousers ? 
                            `${risk.users_risks_evaluated_byTousers.first_name} ${risk.users_risks_evaluated_byTousers.last_name}` : 
                            (risk.evaluated_by_name || 'Unassigned');
                          
                          if (!ownerStats[owner]) {
                            ownerStats[owner] = { total: 0, evaluated: 0, pending: 0 };
                          }
                          ownerStats[owner].total++;
                          if (risk.status === 'Mitigated' || risk.status === 'Escalated') {
                            ownerStats[owner].evaluated++;
                          } else {
                            ownerStats[owner].pending++;
                          }
                        });

                        return Object.entries(ownerStats).slice(0, 6).map(([owner, stats], idx) => {
                          const completionRate = stats.total > 0 ? (stats.evaluated / stats.total) * 100 : 0;
                          return (
                            <div key={idx} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 truncate">{owner}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${completionRate >= 80 ? 'bg-green-100 text-green-800' : completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {completionRate.toFixed(0)}%
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Evaluated:</span>
                                  <span className="font-medium text-green-600">{stats.evaluated}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pending:</span>
                                  <span className="font-medium text-yellow-600">{stats.pending}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${completionRate}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  
                  {/* Comprehensive Risk Details Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">All Risks - Executive View</h4>
                          <p className="text-sm text-gray-600">Complete risk portfolio with evaluation status and ownership</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Total: {riskData.allRisks?.length || 0} risks</span>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {riskData.allRisks?.map((risk) => {
                            const score = parseFloat(risk.highest_risk_score || risk.calculated_risk_score || 0);
                            const scoreLevel = score >= 0.561 ? 'Critical' : score >= 0.241 ? 'High' : score >= 0.081 ? 'Medium' : 'Low';
                            const scoreColor = score >= 0.561 ? 'bg-red-100 text-red-800' : score >= 0.241 ? 'bg-orange-100 text-orange-800' : score >= 0.081 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
                            
                            return (
                            <tr key={risk.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium text-gray-900 truncate">{risk.risk_title}</div>
                                      <div className="text-sm text-gray-500 truncate">{risk.risk_code}</div>
                                      <div className="text-xs text-gray-400 mt-1">{risk.risk_categories?.category_name || risk.category || 'N/A'}</div>
                                    </div>
                                  </div>
                              </td>
                                <td className="px-6 py-4">
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-gray-900">{score.toFixed(3)}</div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${scoreColor}`}>
                                      {scoreLevel}
                                </span>
                                  </div>
                              </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  risk.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                  risk.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                                  risk.status === 'Mitigated' ? 'bg-green-100 text-green-800' :
                                  risk.status === 'Escalated' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {risk.status}
                                </span>
                                    {risk.status === 'In Review' && (
                                      <div className="flex items-center text-xs text-gray-500">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        Active
                                      </div>
                                    )}
                                  </div>
                              </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm">
                                    <div className="font-medium text-gray-900">
                                {risk.users_risks_evaluated_byTousers ? 
                                  `${risk.users_risks_evaluated_byTousers.first_name} ${risk.users_risks_evaluated_byTousers.last_name}` : 
                                        (risk.evaluated_by_name || 'Not Assigned')
                                }
                                    </div>
                                    <div className="text-gray-500">
                                      {risk.departments?.department_name || risk.department || 'N/A'}
                                    </div>
                                  </div>
                              </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  <div>
                                    <div className="text-xs text-gray-400">Reported</div>
                                    <div>{formatDate(risk.date_reported || risk.created_at)}</div>
                                  </div>
                                  {risk.date_evaluated && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-400">Evaluated</div>
                                      <div>{formatDate(risk.date_evaluated)}</div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => handleViewRisk(risk)}>View</button>
                                  <button className="text-green-600 hover:text-green-900" onClick={() => handleExportRiskCSV(risk)}>Export</button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Risk Management Actions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Executive Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm" onClick={handleGenerateRiskReport}>
                        Generate Executive Report
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm" onClick={() => setShowScheduleModal(true)}>
                        Schedule Risk Review
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm" onClick={handleExportAllRisksCSV}>
                        Export All Risk Data
                      </button>
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm" onClick={() => setActiveTab('overview')}>
                        View Strategic Overview
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading comprehensive risk management data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Reports />
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
                            {formatUptime(systemHealthData.uptime || 0)}
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
                              {Math.round((systemHealthData.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((systemHealthData.memoryUsage?.heapUsed || 0) / (systemHealthData.memoryUsage?.heapTotal || 1)) * 100}%` }}
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
      
      {/* Risk Detail Modal */}
      {showRiskModal && selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedRisk.risk_title}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowRiskModal(false)}>Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Risk ID</p>
                <p className="font-medium">{selectedRisk.risk_code}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium">{selectedRisk.risk_categories?.category_name || selectedRisk.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Priority</p>
                <p className="font-medium">{selectedRisk.priority}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium">{selectedRisk.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Reported By</p>
                <p className="font-medium">{selectedRisk.users_risks_submitted_byTousers ? `${selectedRisk.users_risks_submitted_byTousers.first_name} ${selectedRisk.users_risks_submitted_byTousers.last_name}` : (selectedRisk.submitted_by_name || 'N/A')}</p>
              </div>
              <div>
                <p className="text-gray-500">Date Reported</p>
                <p className="font-medium">{formatDate(selectedRisk.date_reported || selectedRisk.created_at)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Description</p>
                <p className="font-medium">{selectedRisk.risk_description || '—'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={() => handleExportRiskCSV(selectedRisk)}>Export CSV</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={() => setShowRiskModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Executive Risk Report</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowReportModal(false)}>Close</button>
            </div>
            <div id="ceo-risk-report">
              <h1>Executive Risk Report</h1>
              <p>Date: {new Date().toLocaleString()}</p>
              <div className="grid">
                <div className="card"><div>Total Risks</div><strong>{riskData?.totalRisks}</strong></div>
                <div className="card"><div>High Risks</div><strong>{riskData?.highRisks}</strong></div>
                <div className="card"><div>Medium Risks</div><strong>{riskData?.mediumRisks}</strong></div>
                <div className="card"><div>Low Risks</div><strong>{riskData?.lowRisks}</strong></div>
              </div>
              <table>
                <thead><tr><th>Risk ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {riskData?.allRisks?.slice(0, 50).map(r => (
                    <tr key={r.id}>
                      <td>{r.risk_code}</td>
                      <td>{r.risk_title}</td>
                      <td>{r.risk_categories?.category_name || r.category || 'N/A'}</td>
                      <td>{r.priority}</td>
                      <td>{r.status}</td>
                      <td>{new Date(r.date_reported || r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={printReport}>Print / Save PDF</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={() => setShowReportModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Review Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onSubmit={handleScheduleReview}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Risk Review</h3>
            <label className="block text-sm text-gray-700 mb-1">Date & Time</label>
            <input type="datetime-local" className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3" value={reviewDateTime} onChange={(e) => setReviewDateTime(e.target.value)} required />
            <label className="block text-sm text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4" rows="3" placeholder="Agenda, attendees, context..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
            <div className="flex justify-end space-x-3">
              <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create Calendar Invite</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoleBasedDashboard; 