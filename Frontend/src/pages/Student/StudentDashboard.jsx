import React, { useState, useEffect } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
     

      <div className="flex">
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Class Schedule Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-xl font-semibold mb-4">Class Schedule</div>
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-md w-full flex items-center justify-center space-x-2">
                    <CalendarTodayIcon />
                    <span>View Calendar</span>
                  </button>
                  <div className="mt-4 text-gray-700">
                    <p>Upcoming Class: Math 101</p>
                    <p>Date: March 29, 2025</p>
                  </div>
                </div>
              )}
            </div>

            {/* Assignments Overview */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-xl font-semibold mb-4">Assignments</div>
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Assignment</th>
                      <th className="px-4 py-2 text-left">Due Date</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2">Math Assignment 1</td>
                      <td className="px-4 py-2">2025-03-29</td>
                      <td className="px-4 py-2 text-green-600">Pending</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">English Essay</td>
                      <td className="px-4 py-2">2025-03-30</td>
                      <td className="px-4 py-2 text-red-600">Completed</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* Class Advertisements Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-xl font-semibold mb-4">Class Advertisements</div>
              {/* Advertisement Post */}
              <div className="flex items-center space-x-4">
                {/* Image */}
                <img
                  src="https://via.placeholder.com/80" // Replace with your image URL
                  alt="Class Advertisement"
                  className="w-20 h-20 object-cover rounded-md"
                />
                
                {/* Text Content */}
                <div>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center space-x-2">
                    <EventIcon />
                    <span>New Classes Available</span>
                  </button>
                  <div className="mt-4 text-gray-700">
                    <p>Join the upcoming Math workshop on April 5th, 2025.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <div className="text-xl font-semibold mb-4">Notifications</div>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center space-x-2"
              onClick={() => setOpenSnackbar(true)}
            >
              <NotificationsIcon />
              <span>Show Notification</span>
            </button>
          </div>
        </main>
      </div>

      {/* Snackbar for Notifications */}
      {openSnackbar && (
        <div className="fixed bottom-5 left-5 p-4 bg-blue-600 text-white rounded-md shadow-md">
          <p>New class update available!</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
