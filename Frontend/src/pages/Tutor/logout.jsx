import React, { useState } from 'react';
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(true);

  const handleLogout = () => {
    // complete logout actions here (clear tokens, user data, etc.)
    localStorage.removeItem('token');
    localStorage.removeItem('teacher_id');
    
    // Redirect to login page
    navigate('/login');
  };

  const handleCancel = () => {
    // Go back to the previous page
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="w-full mt-6">
        <Header />
      </div>
      
      <div className="h-4"></div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-800">
          <Sidebar />
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {showConfirmation && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg 
                    className="h-6 w-6 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Logout</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;