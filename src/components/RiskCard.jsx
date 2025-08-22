import React, { useState } from 'react';

const RiskCard = ({ risk, onEdit, onDelete, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-primary/10 text-primary border-primary/20';
      case 'moderate': return 'bg-primary/20 text-primary border-primary/30';
      case 'high': return 'bg-primary/30 text-primary border-primary/40';
      case 'critical': return 'bg-primary text-white border-primary';
      default: return 'bg-white text-black border-primary/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-primary/10 text-primary';
      case 'in progress': return 'bg-primary/20 text-primary';
      case 'resolved': return 'bg-primary/30 text-primary';
      case 'closed': return 'bg-black text-white';
      default: return 'bg-white text-black';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-primary/20 hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-black mb-1">{risk.title}</h3>
            {risk.project && (
              <p className="text-sm text-primary mb-2">Project: {risk.project}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
              {risk.riskLevel || risk.severity}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
              {risk.status}
            </span>
          </div>
        </div>
        
        <p className="text-black text-sm mb-3">{risk.description}</p>

        {/* Risk Assessment Summary */}
        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
          <div className="bg-primary/10 p-2 rounded">
            <div className="font-medium text-primary">Likelihood</div>
            <div className="text-black">{risk.likelihood || 'N/A'}</div>
          </div>
          <div className="bg-primary/10 p-2 rounded">
            <div className="font-medium text-primary">Impact</div>
            <div className="text-black">{risk.impact || 'N/A'}</div>
          </div>
          <div className="bg-primary/10 p-2 rounded">
            <div className="font-medium text-primary">Risk Score</div>
            <div className="text-black font-semibold">{risk.riskScore || 'N/A'}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-primary">
            Created: {new Date(risk.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-black text-sm font-medium"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
            <button
              onClick={() => onEdit && onEdit(risk)}
              className="text-primary hover:text-black text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(risk.id)}
              className="text-black hover:text-primary text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-primary">Category:</span>
                <span className="ml-2 text-black">{risk.category}</span>
              </div>
              <div>
                <span className="font-medium text-primary">Owner:</span>
                <span className="ml-2 text-black">{risk.owner}</span>
              </div>
              <div>
                <span className="font-medium text-primary">Due Date:</span>
                <span className="ml-2 text-black">
                  {risk.dueDate ? new Date(risk.dueDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              <div>
                <span className="font-medium text-primary">Status:</span>
                <select
                  value={risk.status}
                  onChange={(e) => onStatusChange && onStatusChange(risk.id, e.target.value)}
                  className="ml-2 px-2 py-1 border border-primary rounded text-sm text-black"
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Cause and Consequence */}
            {(risk.cause || risk.consequence) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {risk.cause && (
                  <div>
                    <span className="font-medium text-primary text-sm">Cause:</span>
                    <p className="mt-1 text-black text-sm">{risk.cause}</p>
                  </div>
                )}
                {risk.consequence && (
                  <div>
                    <span className="font-medium text-primary text-sm">Consequence:</span>
                    <p className="mt-1 text-black text-sm">{risk.consequence}</p>
                  </div>
                )}
              </div>
            )}

            {/* Treatment Plan */}
            {risk.treatmentPlan && (
              <div className="mt-4">
                <span className="font-medium text-primary text-sm">Treatment Plan:</span>
                <p className="mt-1 text-black text-sm">{risk.treatmentPlan}</p>
              </div>
            )}

            {/* Review Date and Expected Reduction */}
            {(risk.reviewDate || risk.expectedReduction) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {risk.reviewDate && (
                  <div>
                    <span className="font-medium text-primary text-sm">Review Date:</span>
                    <span className="ml-2 text-black text-sm">
                      {new Date(risk.reviewDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {risk.expectedReduction && (
                  <div>
                    <span className="font-medium text-primary text-sm">Expected Reduction:</span>
                    <span className="ml-2 text-black text-sm">{risk.expectedReduction}</span>
                  </div>
                )}
              </div>
            )}

            {/* Residual Risk Assessment */}
            {(risk.residualLikelihood || risk.residualImpact || risk.residualScore) && (
              <div className="mt-4 bg-primary/10 p-3 rounded">
                <span className="font-medium text-primary text-sm">Residual Risk Assessment:</span>
                <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="font-medium text-primary">Residual Likelihood</div>
                    <div className="text-black">{risk.residualLikelihood || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="font-medium text-primary">Residual Impact</div>
                    <div className="text-black">{risk.residualImpact || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="font-medium text-primary">Residual Score</div>
                    <div className="text-black font-semibold">{risk.residualScore || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {risk.notes && (
              <div className="mt-4">
                <span className="font-medium text-primary text-sm">Notes:</span>
                <p className="mt-1 text-black text-sm">{risk.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskCard; 