import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskForm from './RiskForm';
import SimpleRiskReportForm from './SimpleRiskReportForm';
import ISO31000RiskAssessmentForm from './ISO31000RiskAssessmentForm';
import RiskWorkflowManager from './RiskWorkflowManager';
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
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const RiskOwnerDashboard = () => {
  console.log('🛡️ RiskOwnerDashboard component loaded');
  console.log('🛡️ Current URL:', window.location.href);
  console.log('🛡️ Current pathname:', window.location.pathname);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('submit-risk');
  
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
  
  // State for risk form
  const [submittingRisk, setSubmittingRisk] = useState(false);
  const [submitRiskSuccess, setSubmitRiskSuccess] = useState(false);
  const [submitRiskError, setSubmitRiskError] = useState('');
  
  // Reference data
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  
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
        // For testing purposes, create a mock user if not authenticated
        const mockUser = {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          assigned_role: 'RiskOwner',
          roles: ['RiskOwner']
        };
        
        // Set mock authentication data
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('authToken', 'mock-token-for-testing');
        
        setUser(mockUser);
        console.log('🔧 Using mock user for testing');
      } else {
      setUser(userData);
      }
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
      console.log('🔄 Loading reference data...');
      console.log('🔄 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      console.log('🔄 User data:', localStorage.getItem('user') ? 'Present' : 'Missing');
      
      // Check if user is authenticated
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Authentication required. Please log in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Skip API calls if using mock token for testing
      if (authToken === 'mock-token-for-testing') {
        console.log('🔧 Using mock data for testing');
        setDepartments([
          { id: 1, department_name: 'Administration', department_code: 'ADMIN' },
          { id: 2, department_name: 'IT', department_code: 'IT' },
          { id: 3, department_name: 'Finance', department_code: 'FIN' },
          { id: 4, department_name: 'Operations', department_code: 'OPS' }
        ]);
        setCategories([
          { id: 1, category_name: 'Technical', category_code: 'TECH' },
          { id: 2, category_name: 'Operational', category_code: 'OPS' },
          { id: 3, category_name: 'Financial', category_code: 'FIN' },
          { id: 4, category_name: 'Strategic', category_code: 'STRAT' },
          { id: 5, category_name: 'Compliance', category_code: 'COMP' },
          { id: 6, category_name: 'Security', category_code: 'SEC' },
          { id: 7, category_name: 'Environmental', category_code: 'ENV' },
          { id: 8, category_name: 'Reputational', category_code: 'REP' }
        ]);
        setUsers([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Load data with fallback to public endpoints if needed
      try {
        console.log('🔄 Loading departments...');
        const response = await fetch('http://localhost:3001/api/departments', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
          console.log('✅ Departments loaded:', data.length);
        } else if (response.status === 401) {
          console.error('❌ Authentication failed');
          setError('Authentication failed. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            navigate('/login');
          }, 2000);
          return;
        } else {
          console.error('❌ Failed to load departments:', response.status, response.statusText);
          // Set default departments if API fails
          setDepartments([
            { id: 1, department_name: 'Administration', department_code: 'ADMIN' },
            { id: 2, department_name: 'IT', department_code: 'IT' },
            { id: 3, department_name: 'Finance', department_code: 'FIN' },
            { id: 4, department_name: 'Operations', department_code: 'OPS' }
          ]);
        }
      } catch (deptError) {
        console.error('❌ Failed to load departments:', deptError);
        // Set default departments on error
        setDepartments([
          { id: 1, department_name: 'Administration', department_code: 'ADMIN' },
          { id: 2, department_name: 'IT', department_code: 'IT' },
          { id: 3, department_name: 'Finance', department_code: 'FIN' },
          { id: 4, department_name: 'Operations', department_code: 'OPS' }
        ]);
      }
      
      try {
        console.log('🔄 Loading categories...');
        const response = await fetch('http://localhost:3001/api/categories', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          console.log('✅ Categories loaded:', data.length);
        } else {
          console.error('❌ Failed to load categories:', response.status, response.statusText);
          // Set default categories if API fails
          setCategories([
            { id: 1, category_name: 'Technical', category_code: 'TECH' },
            { id: 2, category_name: 'Operational', category_code: 'OPS' },
            { id: 3, category_name: 'Financial', category_code: 'FIN' },
            { id: 4, category_name: 'Strategic', category_code: 'STRAT' },
            { id: 5, category_name: 'Compliance', category_code: 'COMP' },
            { id: 6, category_name: 'Security', category_code: 'SEC' },
            { id: 7, category_name: 'Environmental', category_code: 'ENV' },
            { id: 8, category_name: 'Reputational', category_code: 'REP' }
          ]);
        }
      } catch (catError) {
        console.error('❌ Failed to load categories:', catError);
        // Set default categories on error
        setCategories([
          { id: 1, category_name: 'Technical', category_code: 'TECH' },
          { id: 2, category_name: 'Operational', category_code: 'OPS' },
          { id: 3, category_name: 'Financial', category_code: 'FIN' },
          { id: 4, category_name: 'Strategic', category_code: 'STRAT' },
          { id: 5, category_name: 'Compliance', category_code: 'COMP' },
          { id: 6, category_name: 'Security', category_code: 'SEC' },
          { id: 7, category_name: 'Environmental', category_code: 'ENV' },
          { id: 8, category_name: 'Reputational', category_code: 'REP' }
        ]);
      }
      
      try {
        console.log('🔄 Loading users...');
        const response = await fetch('http://localhost:3001/api/users', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          console.log('✅ Users loaded:', data.length);
        } else {
          console.error('❌ Failed to load users:', response.status, response.statusText);
          setUsers([]);
        }
      } catch (usersError) {
        console.error('❌ Failed to load users:', usersError);
        setUsers([]);
      }
      
      // Clear any previous errors since we have fallback data
        setError(null);
      console.log('✅ Reference data loading completed');
      
    } catch (error) {
      console.error('❌ Failed to load reference data:', error);
      setError(`Failed to load form data: ${error.message}`);
    } finally {
      setLoading(false);
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

  const handleEvaluationSubmit = async (assessmentData) => {
    try {
      setEvaluating(true);
      setEvaluateError('');

      // Prepare the complete assessment data with additional fields
      const completeAssessmentData = {
        // Map form fields to backend expected fields
        assessment_notes: assessmentData.assessmentNotes || '',
        severity: assessmentData.severityUpdate || 'Medium',
        status_update: assessmentData.statusUpdate || 'In Review',
        category_update: assessmentData.categoryUpdate || null,
        
        // Include other fields
        evaluated_by: user?.id,
        date_evaluated: new Date().toISOString().split('T')[0],
        risk_id: selectedRisk?.id
      };

      console.log('🔄 Submitting ISO 31000 assessment data:', completeAssessmentData);

      const response = await fetch(`http://localhost:3001/api/risk-owner/evaluate/${selectedRisk.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeAssessmentData)
      });

      if (response.ok) {
        setEvaluateSuccess(true);
        closeEvaluationModal();
        
        console.log('✅ ISO 31000 assessment submitted successfully');
        
        // Reload risks to show updated data
        setTimeout(() => {
          loadRisks();
          setEvaluateSuccess(false);
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('❌ ISO 31000 assessment submission failed:', errorData);
        setEvaluateError(errorData.error || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('❌ ISO 31000 assessment submission error:', error);
      setEvaluateError('Failed to submit assessment. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleWorkflowStatusUpdate = async (riskId, newStatus, newStep) => {
    try {
      console.log('🔄 Updating workflow status:', { riskId, newStatus, newStep });

      const response = await fetch(`http://localhost:3001/api/risks/${riskId}/workflow`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          workflow_step: newStep,
          workflow_status: {
            step1_completed: newStep >= 1,
            step2_completed: newStep >= 2,
            step3_completed: newStep >= 3,
            step4_completed: newStep >= 4,
            step5_completed: newStep >= 5,
            step6_completed: newStep >= 6,
            last_updated: new Date().toISOString()
          },
          updated_by_id: user?.id
        })
      });

      if (response.ok) {
        console.log('✅ Workflow status updated successfully');
        
        // Reload risks to show updated data
        loadRisks();
      } else {
        const errorData = await response.json();
        console.error('❌ Workflow status update failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Workflow status update error:', error);
    }
  };

  const handleRiskSubmit = async (riskData) => {
    try {
      setSubmittingRisk(true);
      setSubmitRiskError('');
      setSubmitRiskSuccess(false);

      // Prepare the complete risk data with additional fields
      const completeRiskData = {
        ...riskData,
        date_reported: new Date().toISOString().split('T')[0],
        submitted_by: user?.id,
        status: 'Submitted',
        workflow_step: 1,
        workflow_status: {
          step1_completed: true,
          step2_completed: false,
          step3_completed: false,
          step4_completed: false,
          step5_completed: false,
          step6_completed: false,
          last_updated: new Date().toISOString()
        }
      };

      console.log('🔄 Submitting risk data with workflow:', completeRiskData);

      const response = await fetch('http://localhost:3001/api/risks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeRiskData)
      });

      if (response.ok) {
        setSubmitRiskSuccess(true);
        setSubmitRiskError('');
        
        console.log('✅ Risk submitted successfully with workflow step 1');
        
        // Clear form and show success message
        setTimeout(() => {
          setSubmitRiskSuccess(false);
          setActiveTab('workflow');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ Risk submission failed:', errorData);
        setSubmitRiskError(errorData.error || 'Failed to submit risk');
      }
    } catch (error) {
      console.error('❌ Risk submission error:', error);
      setSubmitRiskError('Failed to submit risk. Please try again.');
    } finally {
      setSubmittingRisk(false);
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
                {user?.firstName} {user?.lastName} ({user?.assigned_role || 'Risk Owner'})
              </span>
              
              {/* Role Switcher for Testing */}
              {user?.email === 'test@example.com' && (
                <select 
                  value={user.assigned_role || 'RiskOwner'} 
                  onChange={(e) => {
                    const newUser = { ...user, assigned_role: e.target.value };
                    setUser(newUser);
                    localStorage.setItem('user', JSON.stringify(newUser));
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="RiskOwner">Risk Owner (Manager/Lead)</option>
                  <option value="Risk Reporter">Risk Reporter (Employee)</option>
                </select>
              )}
              
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
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Submit Risk</span>
            </button>
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
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Workflow</span>
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
              
              {submitRiskSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800">Risk submitted successfully!</span>
                  </div>
                </div>
              )}
              
              {submitRiskError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800">{submitRiskError}</span>
                  </div>
                </div>
              )}
              
              <SimpleRiskReportForm
                loading={submittingRisk}
                departments={departments || []}
                onSubmit={handleRiskSubmit}
                onCancel={() => setActiveTab('overview')}
              />
            </div>
          </div>
        )}

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

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Management Workflow</h2>
              
              {loadingRisks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading risks for workflow management...</p>
                </div>
              ) : risks.length > 0 ? (
                <div className="space-y-6">
                  {risks.map((risk) => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{risk.risk_title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                            {risk.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{risk.risk_description}</p>
                      </div>
                      
                      <RiskWorkflowManager
                        risk={risk}
                        currentUser={user}
                        onStatusUpdate={handleWorkflowStatusUpdate}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Risks Available</h3>
                  <p className="text-gray-500">No risks are available for workflow management.</p>
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

              <ISO31000RiskAssessmentForm
                risk={selectedRisk}
                loading={evaluating}
                users={users || []}
                onSubmit={handleEvaluationSubmit}
                onCancel={closeEvaluationModal}
              />
                  </div>
                </div>
        </div>
      )}
    </div>
  );
};

export default RiskOwnerDashboard; 