import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const RiskWorkflowManager = ({ risk, onStatusUpdate, currentUser }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowStatus, setWorkflowStatus] = useState({
    step1_completed: false,
    step2_completed: false,
    step3_completed: false,
    step4_completed: false,
    step5_completed: false,
    step6_completed: false,
    current_status: 'Submitted',
    assigned_owner: null,
    last_updated: new Date(),
    next_review_date: null
  });

  // Workflow Steps Configuration
  const workflowSteps = [
    {
      id: 1,
      title: 'Risk Identification & Reporting',
      description: 'Any employee identifies and reports potential risks using ISO 31000 standards',
      icon: DocumentTextIcon,
      status: 'completed',
      role: 'Risk Reporter (Any Employee)',
      actions: ['Submit Risk Report', 'Attach Documents', 'Assign Category'],
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 2,
      title: 'Risk Assessment (Initial Analysis by Owner)',
      description: 'Manager/Lead conducts initial analysis and assigns risk ownership',
      icon: MagnifyingGlassIcon,
      status: 'in_progress',
      role: 'Risk Owner (Manager/Lead)',
      actions: ['Review Risk Details', 'Conduct Initial Analysis', 'Assign Risk Owner'],
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      id: 3,
      title: 'Risk Evaluation & Prioritization',
      description: 'Manager/Lead evaluates risk significance and sets priority levels',
      icon: ChartBarIcon,
      status: 'pending',
      role: 'Risk Owner (Manager/Lead)',
      actions: ['Evaluate Likelihood & Impact', 'Calculate Risk Score', 'Set Priority Level'],
      color: 'bg-gray-50 border-gray-200 text-gray-600'
    },
    {
      id: 4,
      title: 'Risk Treatment (Action Planning)',
      description: 'Manager/Lead develops treatment plans and assigns action items',
      icon: ShieldCheckIcon,
      status: 'pending',
      role: 'Risk Owner (Manager/Lead)',
      actions: ['Develop Treatment Plan', 'Assign Action Items', 'Set Deadlines'],
      color: 'bg-gray-50 border-gray-200 text-gray-600'
    },
    {
      id: 5,
      title: 'Monitoring & Review (Ongoing by Owner)',
      description: 'Manager/Lead continuously monitors and reviews treatment effectiveness',
      icon: EyeIcon,
      status: 'pending',
      role: 'Risk Owner (Manager/Lead)',
      actions: ['Monitor Progress', 'Track KPIs', 'Conduct Reviews'],
      color: 'bg-gray-50 border-gray-200 text-gray-600'
    },
    {
      id: 6,
      title: 'Closure or Update (Risk Archived or Re-assessed)',
      description: 'Manager/Lead closes risk or re-assesses based on circumstances',
      icon: CheckCircleIcon,
      status: 'pending',
      role: 'Risk Owner (Manager/Lead)',
      actions: ['Close Risk', 'Archive Documentation', 'Re-assess if Needed'],
      color: 'bg-gray-50 border-gray-200 text-gray-600'
    }
  ];

  // Determine current step based on risk status
  useEffect(() => {
    if (risk) {
      const status = risk.status;
      let step = 1;
      
      switch (status) {
        case 'Submitted':
          step = 1;
          break;
        case 'In Assessment':
          step = 2;
          break;
        case 'Evaluated':
          step = 3;
          break;
        case 'Treatment Planned':
          step = 4;
          break;
        case 'In Progress':
          step = 5;
          break;
        case 'Completed':
        case 'Closed':
        case 'Archived':
          step = 6;
          break;
        default:
          step = 1;
      }
      
      setCurrentStep(step);
      updateWorkflowStatus(step, status);
    }
  }, [risk]);

  const updateWorkflowStatus = (step, status) => {
    const newStatus = {
      step1_completed: step >= 1,
      step2_completed: step >= 2,
      step3_completed: step >= 3,
      step4_completed: step >= 4,
      step5_completed: step >= 5,
      step6_completed: step >= 6,
      current_status: status,
      last_updated: new Date()
    };
    setWorkflowStatus(newStatus);
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'in_progress';
    return 'pending';
  };

  const getStepColor = (stepNumber) => {
    const status = getStepStatus(stepNumber);
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const handleStepAction = async (stepNumber, action) => {
    try {
      // Update the risk status based on the action
      let newStatus = risk.status;
      let newStep = currentStep;

      switch (stepNumber) {
        case 1:
          newStatus = 'Submitted';
          newStep = 2;
          break;
        case 2:
          newStatus = 'In Assessment';
          newStep = 3;
          break;
        case 3:
          newStatus = 'Evaluated';
          newStep = 4;
          break;
        case 4:
          newStatus = 'Treatment Planned';
          newStep = 5;
          break;
        case 5:
          newStatus = 'In Progress';
          newStep = 6;
          break;
        case 6:
          newStatus = 'Completed';
          break;
      }

      // Call the parent component's update function
      if (onStatusUpdate) {
        await onStatusUpdate(risk.id, newStatus, newStep);
      }

      setCurrentStep(newStep);
      updateWorkflowStatus(newStep, newStatus);

    } catch (error) {
      console.error('Error updating workflow step:', error);
    }
  };

  const canPerformAction = (step) => {
    // Check if current user has permission to perform actions on this step
    if (!currentUser) return false;
    
    const stepConfig = workflowSteps[step - 1];
    const userRole = currentUser.assigned_role || currentUser.roles?.[0];
    
    // Risk Reporter (Any employee) - Can only work on step 1
    if (userRole === 'Risk Reporter' && step === 1) return true;
    
    // Risk Owner (Manager/Lead) - Can work on steps 2-6
    if (userRole === 'Risk Owner' && step >= 2 && step <= 6) return true;
    
    // Admin can work on all steps
    if (userRole === 'Admin' || userRole === 'SystemAdmin') return true;
    
    // For testing purposes, allow mock user to work on all steps
    if (currentUser.email === 'test@example.com') return true;
    
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Risk Management Workflow
        </h3>
        <p className="text-sm text-gray-600">
          Current Status: <span className="font-medium text-blue-600">{risk?.status || 'Submitted'}</span>
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => {
          const IconComponent = step.icon;
          const isCurrentStep = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isPending = step.id > currentStep;
          const stepColor = getStepColor(step.id);
          const canAction = canPerformAction(step.id);

          return (
            <div key={step.id} className={`relative ${stepColor} border rounded-lg p-4 transition-all duration-200`}>
              {/* Step Header */}
              <div className="flex items-start space-x-4">
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Step {step.id}: {step.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {isCurrentStep && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                  {/* Role Information */}
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <UserIcon className="w-3 h-3 mr-1" />
                    Responsible: {step.role}
                  </div>

                  {/* Actions */}
                  {isCurrentStep && canAction && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Available Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {step.actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => handleStepAction(step.id, action)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step Details */}
                  {isCurrentStep && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center justify-between text-xs text-blue-700">
                        <span>Last Updated: {workflowStatus.last_updated.toLocaleDateString()}</span>
                        {workflowStatus.next_review_date && (
                          <span>Next Review: {workflowStatus.next_review_date.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Line */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-5 top-14 w-0.5 h-8 bg-gray-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Workflow Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-600">Current Step:</span>
            <p className="font-medium">{currentStep} of 6</p>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <p className="font-medium">{risk?.status || 'Submitted'}</p>
          </div>
          <div>
            <span className="text-gray-600">Risk Owner:</span>
            <p className="font-medium">{risk?.risk_owner || 'Not Assigned'}</p>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <p className="font-medium">{workflowStatus.last_updated.toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskWorkflowManager; 