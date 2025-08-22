import React, { useState, useEffect } from 'react';
import OCRUploader from './OCRUploader';
import { referenceAPI } from '../services/api';

const RiskForm = ({ risk, onSubmit, onCancel, isModal = true, loading = false, categories = [], departments = [], users = [] }) => {
  const [formData, setFormData] = useState({
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
    notes: ''
  });

  // OCR sidebar state
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrText, setOcrText] = useState('');

  // Load reference data if not provided
  const [localCategories, setLocalCategories] = useState(categories);
  const [localDepartments, setLocalDepartments] = useState(departments);
  const [localUsers, setLocalUsers] = useState(users);
  const [loadingRefData, setLoadingRefData] = useState(false);

  useEffect(() => {
    // If props are provided, use them; otherwise fetch from API
    if (categories.length > 0 && departments.length > 0 && users.length > 0) {
      setLocalCategories(categories);
      setLocalDepartments(departments);
      setLocalUsers(users);
    } else {
      loadReferenceData();
    }
  }, [categories, departments, users]);

  const loadReferenceData = async () => {
    try {
      setLoadingRefData(true);
      const [categoriesData, departmentsData, usersData] = await Promise.all([
        referenceAPI.getCategories(),
        referenceAPI.getDepartments(),
        referenceAPI.getUsers()
      ]);
      
      setLocalCategories(categoriesData);
      setLocalDepartments(departmentsData);
      setLocalUsers(usersData);
    } catch (error) {
      console.error('Failed to load reference data:', error);
    } finally {
      setLoadingRefData(false);
    }
  };

  // Initialize form data when editing
  useEffect(() => {
    if (risk) {
      setFormData({
        ...formData,
        ...risk
      });
    }
  }, [risk]);

  // Risk matrix definitions from manual
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
    if (formData.category && formData.likelihood) {
      const { score, level } = calculateSelectedCategoryRiskScore(formData);
      const category = impactCategories[formData.category];
      
      if (category) {
        setFormData(prev => ({
          ...prev,
          [category.scoreFieldName]: score,
          highestRiskScore: score,
          riskLevel: level
        }));
      }
    }
  }, [formData.category, formData.likelihood, formData[formData.category ? impactCategories[formData.category]?.fieldName : '']]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    if (!formData.category) {
      alert('Please select a risk category');
      return;
    }
    
    // Prepare data for API submission
    const submitData = {
      code: formData.title.replace(/\s+/g, '-').toUpperCase(), // Generate code from title
      title: formData.title,
      description: formData.description,
      riskLevel: formData.riskLevel,
      project: formData.project,
      category: formData.category,
      owner: formData.owner,
      status: formData.status
    };
    
    onSubmit(submitData);
  };

  // OCR handlers
  const handleOcrExtract = (text) => {
    setOcrText(text);
  };
  const handleOcrImage = (img) => {
    setOcrImage(img);
  };
  const handleCloseOcrSidebar = () => {
    setOcrText('');
    setOcrImage(null);
  };
  const handleSelectAllOcrText = () => {
    const textElement = document.querySelector('.ocr-sidebar-text');
    if (textElement) {
      const range = document.createRange();
      range.selectNodeContents(textElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Get selected category configuration
  const selectedCategory = formData.category ? impactCategories[formData.category] : null;

  // Sidebar for extracted text
  const ocrSidebar = ocrText ? (
    <div className="w-full md:w-80 md:ml-6 mt-6 md:mt-0 flex-shrink-0">
      <div className="bg-white border rounded-lg shadow-md p-4 relative h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-primary">Extracted Text</span>
          <button onClick={handleCloseOcrSidebar} className="text-gray-500 hover:text-red-500 text-xl" title="Close">
            ×
          </button>
        </div>
        <button onClick={handleSelectAllOcrText} className="mb-2 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-black transition-colors self-end">Select All</button>
        <div className="bg-gray-50 p-3 rounded border max-h-72 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 ocr-sidebar-text cursor-text select-text">{ocrText}</pre>
        </div>
      </div>
    </div>
  ) : null;

  // Form sections
  const FormSection = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
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

  // Layout: form and sidebar
  const layout = (
    <div className="flex flex-col md:flex-row md:items-start gap-6">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
                {risk ? 'Edit Risk' : 'Add New Risk'}
              </h2>
              <button
                onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                type="button"
              >
                ×
              </button>
            </div>
            
            {loadingRefData && (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="text-sm text-blue-800">Loading form data...</div>
              </div>
            )}
            
          {/* OCR Button */}
          <div className="flex justify-end">
                <OCRUploader onExtractedText={handleOcrExtract} onImageChange={handleOcrImage} />
              </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <span className="text-sm text-gray-500">
                {Math.round((Object.values(formData).filter(val => val !== '').length / Object.keys(formData).length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(formData).filter(val => val !== '').length / Object.keys(formData).length) * 100}%` }}
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
                    value={formData.title}
                    onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter a descriptive risk title"
                    required
                  />
              </FormField>
              
              <FormField label="Project/Unit">
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select project/unit</option>
                    {localDepartments.map(dept => (
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
                  value={formData.description}
                  onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Provide a detailed description of the risk, including context and potential consequences"
                  required
                />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Risk Category" required>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select category</option>
                    {localCategories.map(cat => (
                    <option key={cat.id} value={cat.category_name}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
              </FormField>
              
              <FormField label="Risk Owner">
                  <select
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select owner</option>
                    {localUsers.map(user => (
                    <option key={user.id} value={`${user.first_name} ${user.last_name}`}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))}
                  </select>
              </FormField>
                </div>
          </FormSection>

          {/* Risk Assessment */}
              {formData.category && (
            <FormSection title="Risk Assessment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Likelihood" required>
                      <select
                        name="likelihood"
                        value={formData.likelihood}
                        onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select likelihood</option>
                        {likelihoodOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formData.likelihood && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border-l-4 border-blue-400">
                          <strong>Definition:</strong> {likelihoodOptions.find(opt => opt.value == formData.likelihood)?.description}
                        </div>
                      )}
                </FormField>

                <FormField label={selectedCategory?.name} required>
                      <select
                        name={selectedCategory?.fieldName}
                        value={formData[selectedCategory?.fieldName] || ''}
                        onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select {selectedCategory?.name.toLowerCase()}</option>
                        {selectedCategory?.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                </FormField>
              </div>
                      
              {/* Risk Score Display */}
                      {formData[selectedCategory?.fieldName] && formData[selectedCategory?.scoreFieldName] && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                          <span className="text-sm font-medium text-gray-700">Risk Score: </span>
                      <span className="font-bold text-2xl text-gray-800">{formData[selectedCategory?.scoreFieldName]}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      formData.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                      formData.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                      formData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {formData.riskLevel} Risk
                    </div>
                  </div>
                </div>
              )}

                    {/* Custom fields for Other category */}
                    {formData.category === 'Other' && formData.otherImpact && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-3">Custom Impact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Risk Type">
                          <input
                            type="text"
                            name="otherRiskType"
                            value={formData.otherRiskType}
                            onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Describe the risk type"
                          />
                    </FormField>
                    <FormField label="Impact Description">
                          <textarea
                            name="otherImpactDescription"
                            value={formData.otherImpactDescription}
                            onChange={handleChange}
                            rows="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Describe the impact criteria"
                          />
                    </FormField>
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {/* Risk Management */}
          <FormSection title="Risk Management">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Status">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
              </FormField>
              
              <FormField label="Due Date">
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
              </FormField>
              </div>

            <FormField label="Treatment Plan">
                <textarea
                  name="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Describe the risk treatment plan, including mitigation strategies and actions"
              />
            </FormField>
          </FormSection>

          {/* Additional Information */}
          <FormSection title="Additional Information">
            <FormField label="Additional Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Any additional notes, comments, or observations"
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
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-black transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                  disabled={loading || loadingRefData}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    risk ? 'Update Risk' : 'Add Risk'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      {ocrSidebar}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {layout}
      </div>
    );
  } else {
    return layout;
  }
};

export default RiskForm;