import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const RiskOwnerDashboard = () => {
  console.log('🛡️ RiskOwnerDashboard component loaded');
  console.log('🛡️ Current URL:', window.location.href);
  console.log('🛡️ Current pathname:', window.location.pathname);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending-risks');
  
  // State for risks data
  const [risks, setRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  
  // State for evaluation form - using comprehensive RiskForm structure
  const [evaluationForm, setEvaluationForm] = useState({
    title: '',
    description: '',
    cause: '',
    consequence: '',
    project: '',
    category: '',
    likelihood: '',
    financialImpact: '',
    reputationImpact: '',
    legalImpact: '',
    environmentalImpact: '',
    timeImpact: '',
    otherImpact: '',
    otherRiskType: '',
    otherImpactDescription: '',
    financialRiskScore: '',
    reputationRiskScore: '',
    legalRiskScore: '',
    environmentalRiskScore: '',
    timeRiskScore: '',
    otherRiskScore: '',
    highestRiskScore: '',
    riskLevel: '',
    status: 'open',
    owner: '',
    dueDate: '',
    treatmentPlan: '',
    reviewDate: '',
    expectedReduction: '',
    residualLikelihood: '',
    residualImpact: '',
    residualScore: '',
    notes: '',
    assessment_notes: '',
    severity: '',
    category_update: '',
    status_update: ''
  });
  
  // State for form submission
  const [evaluating, setEvaluating] = useState(false);
  const [evaluateSuccess, setEvaluateSuccess] = useState(false);
  const [evaluateError, setEvaluateError] = useState('');
  
  // State for selected risk and modal
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  
  // Reference data
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Risk matrix definitions from manual (copied from RiskForm)
  const likelihoodOptions = [
    { value: 0.05, label: '0.05 - Very Low', description: 'Historically, the event has occurred very infrequently, based on comparisons with similar projects conducted under similar conditions. Based upon current project circumstances, were the event to occur over the course of the project, the event would be considered exceptional.' },
    { value: 0.1, label: '0.1 - Low', description: 'Historically, the event has been known to occur infrequently, based on comparisons with similar projects conducted under similar conditions. Based upon current project circumstances, were it to occur over the course of this project, the event would be considered remarkable.' },
    { value: 0.2, label: '0.2 - Moderate', description: 'Historically, the event has been known to occur, based on comparisons with similar projects conducted under similar conditions. Based upon current project circumstances, it is plausible for this event to occur over the course of this project.' },
    { value: 0.4, label: '0.4 - High', description: 'Historically, the event has been known to occur frequently, based on comparisons with similar projects conducted under similar conditions. Based upon current project circumstances, were it to occur over the course of this project, the event would be considered unremarkable.' },
    { value: 0.8, label: '0.8 - Very High', description: 'Historically, the event has been known to occur very frequently, based on comparisons with similar projects conducted under similar conditions. Based on current project circumstances, the event is expected to occur over the course of this project.' }
  ];

  const impactOptions = [
    { value: 0.05, label: '0.05 - Very Low' },
    { value: 0.1, label: '0.1 - Low' },
    { value: 0.2, label: '0.2 - Moderate' },
    { value: 0.4, label: '0.4 - High' },
    { value: 0.8, label: '0.8 - Very High' }
  ];

  // Impact category definitions from manual
  const impactCategories = {
    Financial: {
      name: 'Financial Impact',
      options: impactOptions,
      description: 'Assessment of financial consequences including costs, revenue impacts, and budget overruns.',
      fieldName: 'financialImpact',
      scoreFieldName: 'financialRiskScore'
    },
    Reputation: {
      name: 'Reputation Impact',
      options: [
        { value: 0.1, label: '0.1 - Very Low', description: 'Incident or issue causes local inconvenience. Negative comment about the operations at regional level.' },
        { value: 0.3, label: '0.3 - Low', description: 'Incident or issue causes local concern with no potential for escalation. Short term negative regional media attention.' },
        { value: 0.5, label: '0.5 - Moderate', description: 'Incident or issue causes local concern with potential for escalation to state media. State or Federal regulator conducts formal inquiry.' },
        { value: 0.7, label: '0.7 - High', description: 'Incident or issue causes negative state wide media attention and regulatory intervention. Government inquiry into project actions.' },
        { value: 0.9, label: '0.9 - Very High', description: 'Incident or issue causes prolonged, negative national media coverage. Court, regulator or Government inquiry alleges improper conduct.' }
      ],
      fieldName: 'reputationImpact',
      scoreFieldName: 'reputationRiskScore'
    },
    'Legal/Regulatory': {
      name: 'Legal/Regulatory/Compliance Impact',
      options: [
        { value: 0.1, label: '0.1 - Very Low', description: 'Not Applicable' },
        { value: 0.3, label: '0.3 - Low', description: 'Breach of legislative provision resulting in potential monetary penalty. Breach of contractual obligation resulting in potential criticism.' },
        { value: 0.5, label: '0.5 - Moderate', description: 'Breach of legislative provision resulting in potential monetary penalty. Breach of contractual obligation resulting in potential criticism.' },
        { value: 0.7, label: '0.7 - High', description: 'Breach of legislative provision resulting in potential penalty exceeding ETB 500,000.00 or potential suspension to work.' },
        { value: 0.9, label: '0.9 - Very High', description: 'Breach of legislative provision resulting in potential incarceration, penalty exceeding ETB 1,000,000.00 or suspension to work.' }
      ],
      fieldName: 'legalImpact',
      scoreFieldName: 'legalRiskScore'
    },
    Environmental: {
      name: 'Environmental Impact',
      options: [
        { value: 0.1, label: '0.1 - Very Low', description: 'Promptly reversible/trivial impact on air, water, soil, flora, fauna, habitat or heritage.' },
        { value: 0.3, label: '0.3 - Low', description: 'Short term (<1-year) impact on population of native flora or fauna. Short term impacts on soil, air, water quality or habitat.' },
        { value: 0.5, label: '0.5 - Moderate', description: 'Medium term (1-3 year) impact on population of native flora or fauna. Medium term impacts on soil, air, water quality or habitat.' },
        { value: 0.7, label: '0.7 - High', description: 'Long term (3-5 years) impact on population of significant flora or fauna. Long term impacts on soil, air, water quality.' },
        { value: 0.9, label: '0.9 - Very High', description: 'Permanent impact on the populations of the significant. Permanent unconfined impact on previously undisturbed ecosystem.' }
      ],
      fieldName: 'environmentalImpact',
      scoreFieldName: 'environmentalRiskScore'
    },
    'Time/Schedule': {
      name: 'Time/Schedule Impact',
      options: [
        { value: 0.1, label: '0.1 - Very Low', description: 'Minimal or no impact on project timelines, such as minor delays or schedule adjustments.' },
        { value: 0.3, label: '0.3 - Low', description: 'Limited impact on project timelines, including minor delays or schedule changes.' },
        { value: 0.5, label: '0.5 - Moderate', description: 'Significant impact on project timelines, potentially affecting project completion dates or milestones.' },
        { value: 0.7, label: '0.7 - High', description: 'Severe delays or disruptions to project timelines, leading to missed deadlines, contract penalties, or project cancellation.' },
        { value: 0.9, label: '0.9 - Very High', description: 'Catastrophic delays or disruptions to project timelines, leading to complete project failure, severe financial losses, or legal liabilities.' }
      ],
      fieldName: 'timeImpact',
      scoreFieldName: 'timeRiskScore'
    },
    Other: {
      name: 'Other Impact',
      options: impactOptions,
      description: 'Custom impact assessment for risks that don\'t fit standard categories.',
      fieldName: 'otherImpact',
      scoreFieldName: 'otherRiskScore',
      hasCustomFields: true
    }
  };

  // Calculate risk score and level based on manual matrix
  const calculateRiskScore = (likelihood, impact) => {
    const score = likelihood * impact;
    let level = '';
    if (score >= 0.01 && score <= 0.05) level = 'Low';
    else if (score >= 0.06 && score <= 0.15) level = 'Medium';
    else if (score >= 0.16 && score <= 0.35) level = 'High';
    else if (score >= 0.36 && score <= 0.72) level = 'Critical';
    return { score: score.toFixed(2), level };
  };

  // Calculate risk score for selected category
  const calculateSelectedCategoryRiskScore = (data) => {
    if (!data.category || !data.likelihood) return { score: '', level: '' };
    
    const category = impactCategories[data.category];
    if (!category) return { score: '', level: '' };
    
    const impactValue = data[category.fieldName];
    if (!impactValue) return { score: '', level: '' };
    
    return calculateRiskScore(parseFloat(data.likelihood), parseFloat(impactValue));
  };

  // Update risk scores when likelihood or impact changes
  useEffect(() => {
    if (evaluationForm.category && evaluationForm.likelihood) {
      const { score, level } = calculateSelectedCategoryRiskScore(evaluationForm);
      const category = impactCategories[evaluationForm.category];
      
      if (category) {
        setEvaluationForm(prev => ({
          ...prev,
          [category.scoreFieldName]: score,
          highestRiskScore: score,
          riskLevel: level
        }));
      }
    }
  }, [evaluationForm.category, evaluationForm.likelihood, evaluationForm[evaluationForm.category ? impactCategories[evaluationForm.category]?.fieldName : '']]);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending-risks' || activeTab === 'evaluated-risks') {
      loadRisks();
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

  const loadRisks = async () => {
    try {
      setLoadingRisks(true);
      const response = await fetch(`http://localhost:3001/api/risk-owner/risks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRisks(data);
      } else {
        console.error('Failed to load risks');
      }
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoadingRisks(false);
    }
  };

  const openEvaluationModal = (risk) => {
    setSelectedRisk(risk);
    setEvaluationForm({
      title: risk.risk_title || '',
      description: risk.risk_description || '',
      cause: risk.cause || '',
      consequence: risk.consequence || '',
      project: risk.project || '',
      category: risk.risk_categories?.category_name || '',
      likelihood: risk.likelihood || '',
      financialImpact: risk.financialImpact || '',
      reputationImpact: risk.reputationImpact || '',
      legalImpact: risk.legalImpact || '',
      environmentalImpact: risk.environmentalImpact || '',
      timeImpact: risk.timeImpact || '',
      otherImpact: risk.otherImpact || '',
      otherRiskType: risk.otherRiskType || '',
      otherImpactDescription: risk.otherImpactDescription || '',
      financialRiskScore: risk.financialRiskScore || '',
      reputationRiskScore: risk.reputationRiskScore || '',
      legalRiskScore: risk.legalRiskScore || '',
      environmentalRiskScore: risk.environmentalRiskScore || '',
      timeRiskScore: risk.timeRiskScore || '',
      otherRiskScore: risk.otherRiskScore || '',
      highestRiskScore: risk.highestRiskScore || '',
      riskLevel: risk.riskLevel || '',
      status: risk.status || 'open',
      owner: risk.owner || '',
      dueDate: risk.dueDate || '',
      treatmentPlan: risk.treatmentPlan || '',
      reviewDate: risk.reviewDate || '',
      expectedReduction: risk.expectedReduction || '',
      residualLikelihood: risk.residualLikelihood || '',
      residualImpact: risk.residualImpact || '',
      residualScore: risk.residualScore || '',
      notes: risk.notes || '',
      assessment_notes: risk.assessment_notes || '',
      severity: risk.severity || '',
      category_update: risk.category_update || '',
      status_update: risk.status_update || 'Open'
    });
    setShowEvaluationModal(true);
  };

  const closeEvaluationModal = () => {
    setShowEvaluationModal(false);
    setSelectedRisk(null);
    setEvaluationForm({
      title: '',
      description: '',
      cause: '',
      consequence: '',
      project: '',
      category: '',
      likelihood: '',
      financialImpact: '',
      reputationImpact: '',
      legalImpact: '',
      environmentalImpact: '',
      timeImpact: '',
      otherImpact: '',
      otherRiskType: '',
      otherImpactDescription: '',
      financialRiskScore: '',
      reputationRiskScore: '',
      legalRiskScore: '',
      environmentalRiskScore: '',
      timeRiskScore: '',
      otherRiskScore: '',
      highestRiskScore: '',
      riskLevel: '',
      status: 'open',
      owner: '',
      dueDate: '',
      treatmentPlan: '',
      reviewDate: '',
      expectedReduction: '',
      residualLikelihood: '',
      residualImpact: '',
      residualScore: '',
      notes: '',
      assessment_notes: '',
      severity: '',
      category_update: '',
      status_update: ''
    });
    setEvaluateError('');
  };

  const handleEvaluationInputChange = (e) => {
    const { name, value } = e.target;
    setEvaluationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enhanced form handling for comprehensive risk assessment
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvaluationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields for comprehensive risk assessment
    if (!evaluationForm.title || !evaluationForm.description || !evaluationForm.category || 
        !evaluationForm.likelihood || !evaluationForm.financialImpact || !evaluationForm.severity || 
        !evaluationForm.status_update || !evaluationForm.assessment_notes) {
      setEvaluateError('Please fill in all required fields');
      return;
    }

    try {
      setEvaluating(true);
      setEvaluateError('');

      // Calculate risk score if likelihood and impact are provided
      let submissionData = { ...evaluationForm };
      
      if (evaluationForm.likelihood && evaluationForm.highestRiskScore) {
        submissionData = {
          ...submissionData,
          calculated_risk_score: evaluationForm.highestRiskScore,
          calculated_risk_level: evaluationForm.riskLevel
        };
      }

      const response = await fetch(`http://localhost:3001/api/risk-owner/evaluate/${selectedRisk.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        setEvaluateSuccess(true);
        closeEvaluationModal();
        
        // Reload risks to show updated data
        setTimeout(() => {
          loadRisks();
          setEvaluateSuccess(false);
        }, 1000);
      } else {
        const errorData = await response.json();
        setEvaluateError(errorData.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Evaluation submission error:', error);
      setEvaluateError('Failed to submit evaluation. Please try again.');
    } finally {
      setEvaluating(false);
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Form section components from RiskForm
  const FormSection = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
        {title}
      </h3>
      {children}
    </div>
  );

  const FormField = ({ label, children, required = false, className = "" }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const filteredRisks = activeTab === 'pending-risks' 
    ? risks.filter(risk => risk.status === 'Submitted')
    : risks.filter(risk => risk.status !== 'Submitted');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
              <ShieldCheckIcon className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Risk Owner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} (Risk Owner)
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
              onClick={() => setActiveTab('pending-risks')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending-risks'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-5 w-5" />
              <span>Pending Risks</span>
              {risks.filter(r => r.status === 'Submitted').length > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {risks.filter(r => r.status === 'Submitted').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('evaluated-risks')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluated-risks'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Evaluated Risks</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Overview</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Management Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-yellow-600 text-sm">Pending Risks</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {risks.filter(r => r.status === 'Submitted').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-blue-600 text-sm">In Review</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {risks.filter(r => r.status === 'In Review').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-green-600 text-sm">Mitigated</p>
                      <p className="text-2xl font-bold text-green-700">
                        {risks.filter(r => r.status === 'Mitigated').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-red-600 text-sm">Escalated</p>
                      <p className="text-2xl font-bold text-red-700">
                        {risks.filter(r => r.status === 'Escalated').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Risks Tab */}
        {activeTab === 'pending-risks' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Risk Evaluations</h2>
              
              {loadingRisks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading pending risks...</p>
                </div>
              ) : filteredRisks.length > 0 ? (
                <div className="space-y-4">
                  {filteredRisks.map((risk) => (
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
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
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
                          
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Submitted by:</span> {risk.users_risks_submitted_byTousers?.first_name} {risk.users_risks_submitted_byTousers?.last_name}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEvaluationModal(risk)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
                          >
                            <PencilIcon className="h-4 w-4 mr-1 inline" />
                            Evaluate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Risks</h3>
                  <p className="text-gray-500">All submitted risks have been evaluated.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evaluated Risks Tab */}
        {activeTab === 'evaluated-risks' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Evaluated Risks</h2>
              
              {loadingRisks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading evaluated risks...</p>
                </div>
              ) : filteredRisks.length > 0 ? (
                <div className="space-y-4">
                  {filteredRisks.map((risk) => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{risk.risk_title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                              {risk.status}
                            </span>
                            {risk.severity && (
                              <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severity)}`}>
                                {risk.severity}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{risk.risk_description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
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
                              <span className="font-medium">Evaluated:</span> {risk.date_evaluated ? new Date(risk.date_evaluated).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          
                          {risk.assessment_notes && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <h4 className="font-medium text-blue-900 mb-2">Assessment Notes</h4>
                              <p className="text-blue-800 text-sm">{risk.assessment_notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEvaluationModal(risk)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                          >
                            <PencilIcon className="h-4 w-4 mr-1 inline" />
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluated Risks</h3>
                  <p className="text-gray-500">No risks have been evaluated yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 shadow-lg rounded-md bg-gray-50">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Risk Assessment: {selectedRisk?.risk_title}
                </h3>
                <button
                  onClick={closeEvaluationModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {evaluateSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-800">Risk assessment submitted successfully!</span>
                  </div>
                </div>
              )}

              {evaluateError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800">{evaluateError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleEvaluationSubmit} className="space-y-6">
                {/* Form Progress */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Assessment Progress</span>
                    <span className="text-sm text-gray-500">
                      {Math.round((Object.values(evaluationForm).filter(val => val !== '').length / Object.keys(evaluationForm).length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.values(evaluationForm).filter(val => val !== '').length / Object.keys(evaluationForm).length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Basic Information */}
                <FormSection title="Basic Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Risk Title" required>
                      <input
                        type="text"
                        name="title"
                        value={evaluationForm.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Enter a descriptive risk title"
                        required
                      />
                    </FormField>
                    
                    <FormField label="Project/Unit">
                      <select
                        name="project"
                        value={evaluationForm.project}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select project/unit</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.department_name}>
                            {dept.department_name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Risk Description" required>
                  <textarea
                      name="description"
                      value={evaluationForm.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Provide a detailed description of the risk, including context and potential consequences"
                    required
                  />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Risk Category" required>
                      <select
                        name="category"
                        value={evaluationForm.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.category_name}>
                            {cat.category_name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    
                    <FormField label="Risk Owner">
                      <input
                        type="text"
                        name="owner"
                        value={evaluationForm.owner}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Enter risk owner name"
                      />
                    </FormField>
                </div>
                </FormSection>

                {/* Risk Assessment */}
                {evaluationForm.category && (
                  <FormSection title="Risk Assessment">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Likelihood" required>
                    <select
                          name="likelihood"
                          value={evaluationForm.likelihood}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    >
                          <option value="">Select likelihood</option>
                          {likelihoodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                    </select>
                        {evaluationForm.likelihood && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border-l-4 border-blue-400">
                            <strong>Definition:</strong> {likelihoodOptions.find(opt => opt.value == evaluationForm.likelihood)?.description}
                  </div>
                        )}
                      </FormField>

                      <FormField label="Impact Assessment" required>
                        <select
                          name="financialImpact"
                          value={evaluationForm.financialImpact}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select impact level</option>
                          {impactOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>
                    
                    {/* Risk Score Display */}
                    {evaluationForm.likelihood && evaluationForm.financialImpact && evaluationForm.highestRiskScore && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                  <div>
                            <span className="text-sm font-medium text-gray-700">Calculated Risk Score: </span>
                            <span className="font-bold text-2xl text-gray-800">{evaluationForm.highestRiskScore}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            evaluationForm.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                            evaluationForm.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                            evaluationForm.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {evaluationForm.riskLevel} Risk
                          </div>
                        </div>
                      </div>
                    )}
                  </FormSection>
                )}

                {/* Risk Management */}
                <FormSection title="Risk Management">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Status" required>
                    <select
                      name="status_update"
                      value={evaluationForm.status_update}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    >
                        <option value="">Select Status</option>
                      <option value="Open">Open</option>
                      <option value="In Review">In Review</option>
                      <option value="Mitigated">Mitigated</option>
                      <option value="Escalated">Escalated</option>
                    </select>
                    </FormField>

                    <FormField label="Severity" required>
                  <select
                        name="severity"
                        value={evaluationForm.severity}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Severity</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                  </select>
                    </FormField>
                </div>

                  <FormField label="Treatment Plan">
                    <textarea
                      name="treatmentPlan"
                      value={evaluationForm.treatmentPlan}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Describe the risk treatment plan, including mitigation strategies and actions"
                    />
                  </FormField>

                  <FormField label="Assessment Notes" required>
                    <textarea
                      name="assessment_notes"
                      value={evaluationForm.assessment_notes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Provide detailed assessment of the risk, including impact analysis and recommendations"
                      required
                    />
                  </FormField>
                </FormSection>

                {/* Form Actions */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> Required fields
                    </div>
                    <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeEvaluationModal}
                        className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
                        disabled={evaluating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                    disabled={evaluating}
                      >
                        {evaluating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Risk Assessment'
                        )}
                  </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskOwnerDashboard; 