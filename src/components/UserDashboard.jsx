import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PaperClipIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  console.log('👤 UserDashboard component loaded');
  console.log('👤 Current URL:', window.location.href);
  console.log('👤 Current pathname:', window.location.pathname);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('submit-risk');
  
  // Form data for risk submission
  const [riskForm, setRiskForm] = useState({
    title: '',
    description: '',
    department: '',
    category: '',
    date_reported: new Date().toISOString().split('T')[0],
    attachments: []
  });
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // State for user's risk history
  const [userRisks, setUserRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  
  // Reference data
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-risks') {
      loadUserRisks();
    }
  }, [activeTab]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData.id) {
        throw new Error('User not authenticated');
      }
      
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user data. Please log in again.');
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      // Load departments and categories for the form
      const [deptResponse, catResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/departments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:3001/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData);
      }

      if (catResponse.ok) {
        const catData = await catResponse.json();
        setCategories(catData);
      }
    } catch (error) {
      console.error('Failed to load reference data:', error);
    }
  };

  const loadUserRisks = async () => {
    try {
      setLoadingRisks(true);
      const response = await fetch(`http://localhost:3001/api/user/risks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserRisks(data);
      } else {
        console.error('Failed to load user risks');
      }
    } catch (error) {
      console.error('Failed to load user risks:', error);
    } finally {
      setLoadingRisks(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRiskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setRiskForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setRiskForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!riskForm.title || !riskForm.description || !riskForm.department || !riskForm.category) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      const formData = new FormData();
      formData.append('title', riskForm.title);
      formData.append('description', riskForm.description);
      formData.append('department', riskForm.department);
      formData.append('category', riskForm.category);
      formData.append('date_reported', riskForm.date_reported);
      
      // Add attachments
      riskForm.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch('http://localhost:3001/api/user/submit-risk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setRiskForm({
          title: '',
          description: '',
          department: '',
          category: '',
          date_reported: new Date().toISOString().split('T')[0],
          attachments: []
        });
        
        // Switch to my-risks tab to show the new submission
        setTimeout(() => {
          setActiveTab('my-risks');
          setSubmitSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to submit risk');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit risk. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'In Review':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'Mitigated':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Escalated':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-blue-100 text-blue-800';
      case 'Mitigated':
        return 'bg-green-100 text-green-800';
      case 'Escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({user?.role || user?.role_name || 'User'})
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
            <button
              onClick={() => setActiveTab('submit-risk')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submit-risk'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Submit Risk</span>
            </button>
            <button
              onClick={() => setActiveTab('my-risks')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-risks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>My Risk Submissions</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Submit Risk Tab */}
        {activeTab === 'submit-risk' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit New Risk Report</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-800">Risk submitted successfully! Redirecting to your submissions...</span>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800">{submitError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={riskForm.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a descriptive title for the risk"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="date_reported" className="block text-sm font-medium text-gray-700 mb-2">
                      Date Reported *
                    </label>
                    <input
                      type="date"
                      id="date_reported"
                      name="date_reported"
                      value={riskForm.date_reported}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={riskForm.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={riskForm.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={riskForm.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide a detailed description of the risk, including potential impact and likelihood"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG
                  </p>
                  
                  {/* Display selected attachments */}
                  {riskForm.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {riskForm.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <PaperClipIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setRiskForm({
                      title: '',
                      description: '',
                      department: '',
                      category: '',
                      date_reported: new Date().toISOString().split('T')[0],
                      attachments: []
                    })}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Risk Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Risks Tab */}
        {activeTab === 'my-risks' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Risk Submissions</h2>
              
              {loadingRisks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your risk submissions...</p>
                </div>
              ) : userRisks.length > 0 ? (
                <div className="space-y-4">
                  {userRisks.map((risk) => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{risk.risk_title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                              {risk.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{risk.risk_description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Department:</span> {risk.departments?.department_name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {risk.risk_categories?.category_name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span> {new Date(risk.date_reported).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Priority:</span> {risk.priority}
                            </div>
                          </div>
                          
                          {/* Show evaluation details if available */}
                          {risk.assessment_notes && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <h4 className="font-medium text-blue-900 mb-2">Risk Owner Assessment</h4>
                              <p className="text-blue-800 text-sm">{risk.assessment_notes}</p>
                              {risk.severity && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-blue-700">Severity: </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    risk.severity === 'High' ? 'bg-red-100 text-red-800' :
                                    risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {risk.severity}
                                  </span>
                                </div>
                              )}
                              {/* Show calculated risk score if available */}
                              {risk.calculated_risk_score && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-blue-700">Calculated Risk Score: </span>
                                  <span className="font-semibold text-blue-800">{risk.calculated_risk_score}</span>
                                  {risk.calculated_risk_level && (
                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                      risk.calculated_risk_level === 'Critical' ? 'bg-red-100 text-red-800' :
                                      risk.calculated_risk_level === 'High' ? 'bg-orange-100 text-orange-800' :
                                      risk.calculated_risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {risk.calculated_risk_level} Risk
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Risk Submissions Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't submitted any risk reports yet.</p>
                  <button
                    onClick={() => setActiveTab('submit-risk')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Risk Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard; 