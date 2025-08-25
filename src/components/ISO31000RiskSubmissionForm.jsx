import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  ChartBarIcon,
  PaperClipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ISO31000RiskSubmissionForm = ({ onSubmit, onCancel, loading = false, categories = [], departments = [] }) => {
  const [formData, setFormData] = useState({
    // Basic Risk Information (Risk Reporter - Step 1)
    riskId: '', // Auto-generated
    dateReported: new Date().toISOString().split('T')[0],
    reportedBy: '',
    department: '',
    position: '',
    
    // Risk Description
    title: '',
    description: '',
    
    // Basic Category
    category: '',
    
    // Supporting Information
    attachments: [],
    additionalNotes: ''
  });

  // ISO 31000 Standard Risk Categories
  const iso31000Categories = [
    'Technical Risk',
    'Operational Risk', 
    'Financial Risk',
    'Strategic Risk',
    'Compliance Risk',
    'Security Risk',
    'Environmental Risk',
    'Reputational Risk'
  ];

  // Simple categories for Risk Reporter
  const simpleCategories = [
    'Technical Risk',
    'Operational Risk', 
    'Financial Risk',
    'Strategic Risk',
    'Compliance Risk',
    'Security Risk',
    'Environmental Risk',
    'Reputational Risk'
  ];

  // Auto-generate Risk ID
  useEffect(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setFormData(prev => ({
      ...prev,
      riskId: `RISK-${timestamp}-${random}`
    }));
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields - only basic information needed
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all required fields marked with *');
      return;
    }
    
    // Add workflow data to the submission
    const submissionData = {
      ...formData,
      workflow_step: 1,
      workflow_status: {
        step1_completed: true,
        step2_completed: false,
        step3_completed: false,
        step4_completed: false,
        step5_completed: false,
        step6_completed: false,
        last_updated: new Date().toISOString()
      },
      status: 'Submitted'
    };
    
    onSubmit(submissionData);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8" />
          <div>
              <h2 className="text-2xl font-bold">Risk Report Form</h2>
              <p className="text-blue-100">Risk Reporter - Basic Risk Information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Section 1: Basic Risk Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Basic Risk Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk ID *
              </label>
              <input
                type="text"
                name="riskId"
                value={formData.riskId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated unique identifier</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Reported *
              </label>
              <input
                type="date"
                name="dateReported"
                value={formData.dateReported}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reported By *
              </label>
              <input
                type="text"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Risk Description */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Risk Description
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief, descriptive title for the risk"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detailed description of the risk, including what could happen and potential consequences"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Source
                </label>
                <input
                  type="text"
                  name="riskSource"
                  value={formData.riskSource}
                  onChange={handleChange}
                  placeholder="What gives rise to this risk?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Context
                </label>
                <input
                  type="text"
                  name="riskContext"
                  value={formData.riskContext}
                  onChange={handleChange}
                  placeholder="Business unit, project, or process context"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Risk Analysis */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Risk Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Category</option>
                {iso31000Categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Likelihood *
              </label>
              <select
                name="likelihood"
                value={formData.likelihood}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Likelihood</option>
                {likelihoodScale.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.likelihood && (
                <p className="text-xs text-gray-600 mt-1">
                  {likelihoodScale.find(opt => opt.value == formData.likelihood)?.description}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact *
              </label>
              <select
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Impact</option>
                {impactScale.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.impact && (
                <p className="text-xs text-gray-600 mt-1">
                  {impactScale.find(opt => opt.value == formData.impact)?.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Risk Level Display */}
          {formData.riskLevel && (
            <div className="mt-4 p-4 bg-white border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Calculated Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  formData.riskLevel.includes('Low') ? 'bg-green-100 text-green-800' :
                  formData.riskLevel.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                  formData.riskLevel.includes('High') ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {formData.riskLevel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on Likelihood ({formData.likelihood}) × Impact ({formData.impact}) = {formData.likelihood * formData.impact}
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Initial Assessment */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Initial Assessment & Mitigation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Urgency</option>
                {urgencyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposed Mitigation Actions
            </label>
            <textarea
              name="proposedMitigationActions"
              value={formData.proposedMitigationActions}
              onChange={handleChange}
              rows="3"
              placeholder="Initial thoughts on how this risk might be mitigated or controlled"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Section 5: Supporting Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PaperClipIcon className="h-5 w-5 mr-2" />
            Supporting Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Supporting documents, images, or other relevant files</p>
            </div>
            
            {formData.attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploaded Files
                </label>
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information, context, or observations"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Submit Risk Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ISO31000RiskSubmissionForm; 