import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClasses = (path) => {
    return isActive(path)
      ? 'text-primary font-semibold'
      : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link to="/" className={`flex items-center ${getLinkClasses('/')}`}>
              Dashboard
            </Link>
            <Link to="/add-risk" className={`flex items-center ${getLinkClasses('/add-risk')}`}>
              Add Risk
            </Link>
            <Link to="/registered-risks" className={`flex items-center ${getLinkClasses('/registered-risks')}`}>
              Registered Risks
            </Link>
            <Link to="/reports" className={`flex items-center ${getLinkClasses('/reports')}`}>
              Reports
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
