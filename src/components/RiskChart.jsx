import React from 'react';

const RiskChart = ({ risks }) => {
  // Calculate data for charts
  const statusData = {
    'Open': risks.filter(r => r.status === 'open').length,
    'In Progress': risks.filter(r => r.status === 'in progress').length,
    'Resolved': risks.filter(r => r.status === 'resolved').length,
    'Closed': risks.filter(r => r.status === 'closed').length
  };

  const riskLevelData = {
    'Low': risks.filter(r => r.riskLevel === 'Low').length,
    'Moderate': risks.filter(r => r.riskLevel === 'Moderate').length,
    'High': risks.filter(r => r.riskLevel === 'High').length,
    'Critical': risks.filter(r => r.riskLevel === 'Critical').length
  };

  const categoryData = risks.reduce((acc, risk) => {
    acc[risk.category] = (acc[risk.category] || 0) + 1;
    return acc;
  }, {});

  const getBarColor = (type, key) => {
    if (type === 'status') {
      switch (key) {
        case 'Open': return 'bg-blue-500';
        case 'In Progress': return 'bg-yellow-500';
        case 'Resolved': return 'bg-green-500';
        case 'Closed': return 'bg-gray-500';
        default: return 'bg-gray-400';
      }
    } else if (type === 'riskLevel') {
      switch (key) {
        case 'Low': return 'bg-green-500';
        case 'Moderate': return 'bg-yellow-500';
        case 'High': return 'bg-orange-500';
        case 'Critical': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    }
    return 'bg-blue-500';
  };

  const maxValue = (data) => Math.max(...Object.values(data), 1);

  const renderBarChart = (data, type, title) => {
    const max = maxValue(data);
    
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600">{key}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6">
                <div
                  className={`h-6 rounded-full ${getBarColor(type, key)} transition-all duration-300`}
                  style={{ width: `${(value / max) * 100}%` }}
                ></div>
              </div>
              <div className="w-8 text-sm font-medium text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {renderBarChart(statusData, 'status', 'Risks by Status')}
      {renderBarChart(riskLevelData, 'riskLevel', 'Risks by Risk Level')}
    </div>
  );
};

export default RiskChart; 