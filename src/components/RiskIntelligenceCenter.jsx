import React, { useState, useEffect } from 'react';
import { loadRisks } from '../utils/storage';

const RiskIntelligenceCenter = ({ risks, onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    riskLevel: '',
    category: '',
    dateRange: { from: '', to: '' },
    user: '',
    riskScoreRange: { min: '', max: '' },
    activityType: ''
  });

  const [selectedWidget, setSelectedWidget] = useState('activity');

  // Enhanced search and filter functionality
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Activity feed (last 10 changes)
    const recentActivity = risks
      .filter(risk => risk.lastModifiedAt)
      .sort((a, b) => new Date(b.lastModifiedAt) - new Date(a.lastModifiedAt))
      .slice(0, 10);

    // User performance
    const userPerformance = risks.reduce((acc, risk) => {
      const user = risk.owner || 'Unassigned';
      if (!acc[user]) {
        acc[user] = { total: 0, critical: 0, high: 0, resolved: 0 };
      }
      acc[user].total++;
      if (risk.riskLevel === 'Critical' || risk.riskLevel === 'High') {
        acc[user].critical++;
      }
      if (risk.status === 'resolved') {
        acc[user].resolved++;
      }
      return acc;
    }, {});

    // Risk aging
    const agingRisks = risks.filter(risk => {
      const createdDate = new Date(risk.createdAt);
      return createdDate < thirtyDaysAgo && risk.status !== 'resolved';
    });

    // Escalation alerts
    const escalationAlerts = risks.filter(risk => {
      return (risk.riskLevel === 'Critical' || risk.riskLevel === 'High') && 
             risk.status === 'open';
    });

    // Review due risks
    const reviewDueRisks = risks.filter(risk => {
      if (!risk.reviewDate) return false;
      const reviewDate = new Date(risk.reviewDate);
      const daysUntilReview = Math.ceil((reviewDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilReview <= 7 && daysUntilReview >= 0;
    });

    return {
      recentActivity,
      userPerformance,
      agingRisks,
      escalationAlerts,
      reviewDueRisks
    };
  };

  const analytics = calculateAnalytics();

  // Activity Feed Widget
  const renderActivityFeed = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-black mb-3">Recent Activity</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {analytics.recentActivity.map(risk => (
          <div key={risk.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-black">{risk.title}</div>
              <div className="text-xs text-gray-600">
                Modified by {risk.owner || 'Unknown'} • {new Date(risk.lastModifiedAt || risk.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              risk.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
              risk.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
              risk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {risk.riskLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // User Performance Widget
  const renderUserPerformance = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-black mb-3">User Performance</h3>
      <div className="space-y-3">
        {Object.entries(analytics.userPerformance)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 5)
          .map(([user, stats]) => (
            <div key={user} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-black">{user}</div>
                <div className="text-xs text-gray-600">{stats.total} total risks</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-primary">{stats.resolved} resolved</div>
                <div className="text-xs text-gray-500">{stats.critical + stats.high} critical/high</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // Risk Aging Widget
  const renderRiskAging = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-black mb-3">Risk Aging Alert</h3>
      <div className="space-y-2">
        {analytics.agingRisks.slice(0, 5).map(risk => (
          <div key={risk.id} className="flex justify-between items-center p-2 bg-orange-50 rounded border-l-4 border-orange-500">
            <div>
              <div className="font-medium text-black">{risk.title}</div>
              <div className="text-xs text-gray-600">
                Open since {new Date(risk.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-orange-600">{risk.owner || 'Unassigned'}</div>
              <div className="text-xs text-gray-500">{risk.category}</div>
            </div>
          </div>
        ))}
        {analytics.agingRisks.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">No aging risks found</div>
        )}
      </div>
    </div>
  );

  // Escalation Alerts Widget
  const renderEscalationAlerts = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-black mb-3">Escalation Alerts</h3>
      <div className="space-y-2">
        {analytics.escalationAlerts.slice(0, 5).map(risk => (
          <div key={risk.id} className="flex justify-between items-center p-2 bg-red-50 rounded border-l-4 border-red-500">
            <div>
              <div className="font-medium text-black">{risk.title}</div>
              <div className="text-xs text-gray-600">Score: {risk.highestRiskScore}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-red-600">{risk.riskLevel}</div>
              <div className="text-xs text-gray-500">{risk.owner || 'Unassigned'}</div>
            </div>
          </div>
        ))}
        {analytics.escalationAlerts.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">No escalation alerts</div>
        )}
      </div>
    </div>
  );

  // Review Due Widget
  const renderReviewDue = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-black mb-3">Review Due</h3>
      <div className="space-y-2">
        {analytics.reviewDueRisks.slice(0, 5).map(risk => (
          <div key={risk.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
            <div>
              <div className="font-medium text-black">{risk.title}</div>
              <div className="text-xs text-gray-600">
                Due: {new Date(risk.reviewDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-yellow-600">{risk.riskLevel}</div>
              <div className="text-xs text-gray-500">{risk.owner || 'Unassigned'}</div>
            </div>
          </div>
        ))}
        {analytics.reviewDueRisks.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">No reviews due</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Advanced Search Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-black mb-4">🔍 Risk Intelligence Center</h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search risks by title, description, owner, or category..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              <option value="Financial">Financial</option>
              <option value="Reputation">Reputation</option>
              <option value="Legal/Regulatory">Legal/Regulatory</option>
              <option value="Environmental">Environmental</option>
              <option value="Time/Schedule">Time/Schedule</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Users</option>
              {Array.from(new Set(risks.map(r => r.owner).filter(Boolean))).map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range and Score Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="0.01"
                value={filters.riskScoreRange.min}
                onChange={(e) => handleFilterChange('riskScoreRange', { ...filters.riskScoreRange, min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="0.72"
                value={filters.riskScoreRange.max}
                onChange={(e) => handleFilterChange('riskScoreRange', { ...filters.riskScoreRange, max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              const clearedFilters = {
                search: '',
                status: '',
                riskLevel: '',
                category: '',
                dateRange: { from: '', to: '' },
                user: '',
                riskScoreRange: { min: '', max: '' },
                activityType: ''
              };
              setFilters(clearedFilters);
              if (onFilterChange) onFilterChange(clearedFilters);
            }}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Professional Analytics Widgets */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-black mb-4">📊 Real-Time Analytics</h3>
        
        {/* Widget Navigation */}
        <div className="flex space-x-4 mb-4 border-b border-gray-200">
          {[
            { id: 'activity', label: 'Activity Feed', icon: '📈' },
            { id: 'performance', label: 'User Performance', icon: '👥' },
            { id: 'aging', label: 'Risk Aging', icon: '⏰' },
            { id: 'escalation', label: 'Escalation Alerts', icon: '🚨' },
            { id: 'review', label: 'Review Due', icon: '📋' }
          ].map(widget => (
            <button
              key={widget.id}
              onClick={() => setSelectedWidget(widget.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedWidget === widget.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {widget.icon} {widget.label}
            </button>
          ))}
        </div>

        {/* Widget Content */}
        <div className="min-h-64">
          {selectedWidget === 'activity' && renderActivityFeed()}
          {selectedWidget === 'performance' && renderUserPerformance()}
          {selectedWidget === 'aging' && renderRiskAging()}
          {selectedWidget === 'escalation' && renderEscalationAlerts()}
          {selectedWidget === 'review' && renderReviewDue()}
        </div>
      </div>
    </div>
  );
};

export default RiskIntelligenceCenter;
