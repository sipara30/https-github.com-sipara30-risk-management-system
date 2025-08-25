import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  PaperClipIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SimpleRiskReportForm = ({ onSubmit, onCancel, loading = false, departments = [] }) => {
  const [formData, setFormData] = useState({
    // Basic Risk Information (Risk Reporter - Step 1)
    riskId: '', // Auto-generated
    dateReported: new Date().toISOString().split('T')[0],
    reportedBy: '',
    department: '',
    
    // Risk Description
    title: '',
    description: '',
    category: '',
    
    // Supporting Information
    attachments: [],
    additionalNotes: ''
  });

  // Simple categories for Risk Reporter - using IDs for backend compatibility
  const simpleCategories = [
    { id: 1, name: 'Technical Risk' },
    { id: 2, name: 'Operational Risk' },
    { id: 3, name: 'Financial Risk' },
    { id: 4, name: 'Strategic Risk' },
    { id: 5, name: 'Compliance Risk' },
    { id: 6, name: 'Security Risk' },
    { id: 7, name: 'Environmental Risk' },
    { id: 8, name: 'Reputational Risk' }
  ];

  // Auto-generate Risk ID
  useEffect(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setFormData(prev => ({
      ...prev,
      riskId: `RISK-${timestamp}-${random}`
    }));
    console.log('🔧 SimpleRiskReportForm initialized with formData:', formData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('📝 Form field changed:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🔍 Form data being validated:', formData);
    
    // Validate required fields - only basic information needed
    if (!formData.title || !formData.description || !formData.category) {
      console.log('❌ Validation failed - missing fields:', {
        title: !!formData.title,
        description: !!formData.description,
        category: !!formData.category
      });
      alert('Please fill in all required fields marked with *');
      return;
    }
    
    // Transform form data to match backend expectations
    const submissionData = {
      // Map form fields to backend expected fields
      code: formData.riskId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      
      // Include other form fields
      dateReported: formData.dateReported,
      reportedBy: formData.reportedBy,
      department: formData.department,
      additionalNotes: formData.additionalNotes,
      attachments: formData.attachments,
      
      // Add workflow data to the submission
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
    
    console.log('✅ Form validation passed, submitting data:', submissionData);
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
                  <option key={dept.id} value={dept.id}>
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
                placeholder="Describe the risk you've identified and why it's a concern"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Risk Category</option>
                {simpleCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Supporting Information */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <PaperClipIcon className="h-5 w-5 mr-2" />
            Supporting Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information or context about the risk"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG
              </p>
              
              {/* Display selected attachments */}
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
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
          </div>
        </div>

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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Risk Report'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SimpleRiskReportForm; 