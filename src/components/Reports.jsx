import React, { useState, useEffect } from 'react';
import { loadRisks } from '../utils/storage';

const Reports = () => {
  const [risks, setRisks] = useState([]);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    const savedRisks = loadRisks();
    setRisks(savedRisks || []);
  }, []);

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const totalRisks = risks.length;
    const openRisks = risks.filter(risk => risk.status === 'open').length;
    const resolvedRisks = risks.filter(risk => risk.status === 'resolved').length;
    const criticalRisks = risks.filter(risk => risk.riskLevel === 'Critical').length;
    const highRisks = risks.filter(risk => risk.riskLevel === 'High').length;
    const mediumRisks = risks.filter(risk => risk.riskLevel === 'Medium').length;
    const lowRisks = risks.filter(risk => risk.riskLevel === 'Low').length;

    // Category breakdown
    const categoryBreakdown = risks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {});

    // Risk score distribution
    const riskScores = risks.map(risk => parseFloat(risk.highestRiskScore) || 0);
    const avgRiskScore = riskScores.length > 0 ? (riskScores.reduce((a, b) => a + b, 0) / riskScores.length).toFixed(2) : 0;
    const maxRiskScore = Math.max(...riskScores, 0);
    const minRiskScore = Math.min(...riskScores, 0);

    return {
      totalRisks,
      openRisks,
      resolvedRisks,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      categoryBreakdown,
      avgRiskScore,
      maxRiskScore: maxRiskScore.toFixed(2),
      minRiskScore: minRiskScore.toFixed(2)
    };
  };

  const stats = calculateStats();

  // Risk Matrix visualization
  const renderRiskMatrix = () => {
    const matrixData = {
      'Critical': risks.filter(r => r.riskLevel === 'Critical'),
      'High': risks.filter(r => r.riskLevel === 'High'),
      'Medium': risks.filter(r => r.riskLevel === 'Medium'),
      'Low': risks.filter(r => r.riskLevel === 'Low')
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-black mb-4">Risk Matrix Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(matrixData).map(([level, riskList]) => (
            <div key={level} className={`p-4 rounded-lg border-2 ${
              level === 'Critical' ? 'border-red-500 bg-red-50' :
              level === 'High' ? 'border-orange-500 bg-orange-50' :
              level === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-green-500 bg-green-50'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  level === 'Critical' ? 'text-red-600' :
                  level === 'High' ? 'text-orange-600' :
                  level === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {riskList.length}
                </div>
                <div className="text-sm font-medium text-gray-700">{level}</div>
                <div className="text-xs text-gray-500">{((riskList.length / stats.totalRisks) * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Category Analysis
  const renderCategoryAnalysis = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-black mb-4">Risk Category Analysis</h3>
        <div className="space-y-4">
          {Object.entries(stats.categoryBreakdown).map(([category, count]) => {
            const categoryRisks = risks.filter(r => r.category === category);
            const avgScore = categoryRisks.length > 0 
              ? (categoryRisks.reduce((sum, r) => sum + (parseFloat(r.highestRiskScore) || 0), 0) / categoryRisks.length).toFixed(2)
              : '0.00';
            
            return (
              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-black">{category}</div>
                  <div className="text-sm text-gray-600">{count} risks</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">Avg Score: {avgScore}</div>
                  <div className="text-xs text-gray-500">
                    {categoryRisks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length} high/critical
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Management Reporting Requirements
  const renderManagementReporting = () => {
    const criticalRisks = risks.filter(r => r.riskLevel === 'Critical');
    const highRisks = risks.filter(r => r.riskLevel === 'High');
    const mediumRisks = risks.filter(r => r.riskLevel === 'Medium');

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-black mb-4">Management Reporting Requirements</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold text-red-600">Critical Risks (CEO Level)</h4>
            <p className="text-sm text-gray-600 mb-2">Requires highest priority and urgent attention. Must be approved, visible and reported to CEO. Review monthly.</p>
            <div className="text-lg font-bold text-red-600">{criticalRisks.length} Critical Risks</div>
            {criticalRisks.length > 0 && (
              <div className="mt-2 space-y-1">
                {criticalRisks.slice(0, 3).map(risk => (
                  <div key={risk.id} className="text-sm bg-red-50 p-2 rounded">
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-xs text-gray-600">Score: {risk.highestRiskScore} | Owner: {risk.owner || 'Unassigned'}</div>
                  </div>
                ))}
                {criticalRisks.length > 3 && (
                  <div className="text-xs text-gray-500">+{criticalRisks.length - 3} more critical risks</div>
                )}
              </div>
            )}
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-semibold text-orange-600">High Risks (DCEO Level)</h4>
            <p className="text-sm text-gray-600 mb-2">Achievement of objectives under serious threat. Requires priority and active involvement. Review monthly.</p>
            <div className="text-lg font-bold text-orange-600">{highRisks.length} High Risks</div>
            {highRisks.length > 0 && (
              <div className="mt-2 space-y-1">
                {highRisks.slice(0, 3).map(risk => (
                  <div key={risk.id} className="text-sm bg-orange-50 p-2 rounded">
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-xs text-gray-600">Score: {risk.highestRiskScore} | Owner: {risk.owner || 'Unassigned'}</div>
                  </div>
                ))}
                {highRisks.length > 3 && (
                  <div className="text-xs text-gray-500">+{highRisks.length - 3} more high risks</div>
                )}
              </div>
            )}
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-semibold text-yellow-600">Medium Risks (Department Manager Level)</h4>
            <p className="text-sm text-gray-600 mb-2">Some threat to achievement of objectives. Requires active monitoring. Review quarterly.</p>
            <div className="text-lg font-bold text-yellow-600">{mediumRisks.length} Medium Risks</div>
          </div>
        </div>
      </div>
    );
  };

  // Risk Score Distribution
  const renderRiskScoreDistribution = () => {
    const scoreRanges = {
      '0.01-0.05': risks.filter(r => {
        const score = parseFloat(r.highestRiskScore) || 0;
        return score >= 0.01 && score <= 0.05;
      }).length,
      '0.06-0.15': risks.filter(r => {
        const score = parseFloat(r.highestRiskScore) || 0;
        return score >= 0.06 && score <= 0.15;
      }).length,
      '0.16-0.35': risks.filter(r => {
        const score = parseFloat(r.highestRiskScore) || 0;
        return score >= 0.16 && score <= 0.35;
      }).length,
      '0.36-0.72': risks.filter(r => {
        const score = parseFloat(r.highestRiskScore) || 0;
        return score >= 0.36 && score <= 0.72;
      }).length
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-black mb-4">Risk Score Distribution</h3>
        <div className="space-y-3">
          {Object.entries(scoreRanges).map(([range, count]) => (
            <div key={range} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-24 text-sm font-medium text-gray-700">{range}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(count / stats.totalRisks) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-900">{count}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Average Score:</span>
              <span className="ml-2 font-semibold text-primary">{stats.avgRiskScore}</span>
            </div>
            <div>
              <span className="text-gray-600">Range:</span>
              <span className="ml-2 font-semibold text-primary">{stats.minRiskScore} - {stats.maxRiskScore}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Detailed Risk Register
  const renderRiskRegister = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-black mb-4">Detailed Risk Register</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {risks.map(risk => (
                <tr key={risk.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                    <div className="text-sm text-gray-500">{risk.description.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{risk.highestRiskScore}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      risk.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                      risk.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                      risk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.owner || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-primary">
                <div className="text-sm font-medium text-gray-600">Total Risks</div>
                <div className="text-2xl font-bold text-black">{stats.totalRisks}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <div className="text-sm font-medium text-gray-600">Open Risks</div>
                <div className="text-2xl font-bold text-blue-600">{stats.openRisks}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <div className="text-sm font-medium text-gray-600">Resolved</div>
                <div className="text-2xl font-bold text-green-600">{stats.resolvedRisks}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                <div className="text-sm font-medium text-gray-600">Critical/High</div>
                <div className="text-2xl font-bold text-red-600">{stats.criticalRisks + stats.highRisks}</div>
              </div>
            </div>

            {renderRiskMatrix()}
            {renderCategoryAnalysis()}
            {renderRiskScoreDistribution()}
          </div>
        );
      case 'management':
        return renderManagementReporting();
      case 'register':
        return renderRiskRegister();
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">Risk Management Reports</h2>
        <div className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedReport('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedReport === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedReport('management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedReport === 'management'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Management Reporting
            </button>
            <button
              onClick={() => setSelectedReport('register')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedReport === 'register'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Risk Register
            </button>
          </nav>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
