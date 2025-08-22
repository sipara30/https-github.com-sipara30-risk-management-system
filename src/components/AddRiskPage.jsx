import React, { useState, useEffect } from 'react';
import RiskForm from './RiskForm';
import { risksAPI, referenceAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddRiskPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load reference data
    const loadReferenceData = async () => {
      try {
        const [categoriesData, departmentsData, usersData] = await Promise.all([
          referenceAPI.getCategories(),
          referenceAPI.getDepartments(),
          referenceAPI.getUsers()
        ]);
        
        setCategories(categoriesData);
        setDepartments(departmentsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to load reference data:', error);
        setError('Failed to load form data. Please try again.');
      }
    };

    loadReferenceData();
  }, []);

  const handleSubmit = async (newRisk) => {
    setLoading(true);
    setError(null);
    
    try {
      await risksAPI.create(newRisk);
      navigate('/'); // Redirect to landing page after adding
    } catch (error) {
      setError(error.message || 'Failed to add risk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow text-black">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => setError(null)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submit Risk Report</h1>
              <p className="text-sm text-gray-600">Create a new risk assessment</p>
            </div>
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded shadow">
          <RiskForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
            isModal={false}
            loading={loading}
            categories={categories}
            departments={departments}
            users={users}
          />
        </div>
      </div>
    </div>
  );
};

export default AddRiskPage;

