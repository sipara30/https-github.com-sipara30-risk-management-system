import React, { useState, useEffect } from 'react';
import RiskCard from './RiskCard';
import { risksAPI } from '../services/api';

const RegisteredRisks = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      const risksData = await risksAPI.getAll();
      setRisks(risksData);
    } catch (error) {
      console.error('Failed to load risks:', error);
      setError('Failed to load risks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisk = async (riskId) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        await risksAPI.delete(riskId);
        // Reload risks after deletion
        await loadRisks();
      } catch (error) {
        console.error('Failed to delete risk:', error);
        setError('Failed to delete risk. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-primary text-lg">Loading risks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadRisks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">Registered Risks</h2>
        <button
          onClick={loadRisks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {risks.length === 0 ? (
          <div className="text-center py-8 text-primary text-lg">No registered risks found.</div>
        ) : (
          risks.map(risk => (
            <RiskCard
              key={risk.id}
              risk={risk}
              onDelete={handleDeleteRisk}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RegisteredRisks;
