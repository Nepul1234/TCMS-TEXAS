import React, { useState, useEffect } from 'react';
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [teacherName, setTeacherName] = useState('Teacher');
  const [announcements, setAnnouncements] = useState([]);
  const [virtualClasses, setVirtualClasses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    student_count: 0,
    tutor_count: 0,
    students_joined_this_month: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classesLoading, setClassesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  //create a useEffect to navigate back to login page if user doesn't have the token
  useEffect(() => {
    
    const token = localStorage.getItem("token");
           if (!token) {
               alert("Please login to access this page");
               window.location.href = "/login";
            }
  },[])

  // Fetch dashboard stats
  const getDashboardStats = async () => {
    try {
      const response = await fetch('/api/get_tutor_dashboard_data/getTutorDashboardData', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      setDashboardStats(data);
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch upcoming virtual classes
  const getUpcomingVirtualClasses = async () => {
    try {
      const response = await fetch('/api/get_tutor_dashboard_data/getupcomingVirtualClasses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      
      // Sort by class_date and take only the first 5
      const sortedClasses = data
        .sort((a, b) => new Date(a.class_date) - new Date(b.class_date))
        .slice(0, 5);
      
      setVirtualClasses(sortedClasses);
      
    } catch (error) {
      console.error('Error fetching virtual classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  // Fetch tutor name
  const getTutorName = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found in localStorage');
      }

      const teacherId = JSON.parse(userData).id;
      
      const response = await fetch('/api/get_tutor_profile_data/get_tutor_profile_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutor_id: teacherId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      setTeacherName(data.data.Fname || 'Teacher');
      
    } catch (error) {
      console.error('Error fetching tutor name:', error);
      // Try to get name from localStorage as fallback
      const temp = localStorage.getItem('user');
      if (temp) {
        try {
          const parsedData = JSON.parse(temp);
          setTeacherName(parsedData?.username || 'Teacher');
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
        }
      }
    }
  };

  // Fetch announcements from API
  const getAnnouncements = async () => {
    try {
      const response = await fetch('/api/getTutorAnnouncement/getAnnouncementwithCourseName', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      
      // Sort announcements by published_date (latest first) and take only the first 10
      const sortedAnnouncements = data
        .sort((a, b) => new Date(b.published_date) - new Date(a.published_date))
        .slice(0, 10);
      
      setAnnouncements(sortedAnnouncements);
      
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format class date and time
  const formatClassDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    // Format time from HH:MM:SS to readable format
    const [hours, minutes] = timeString.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes), 0);
    const formattedTime = timeObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return { date: formattedDate, time: formattedTime };
  };

  // Get relative time (e.g., "in 2 hours", "tomorrow")
  const getRelativeTime = (dateString) => {
    const classDate = new Date(dateString);
    const now = new Date();
    const diffInMs = classDate - now;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInHours < 1) return 'Starting soon';
    if (diffInHours < 24) return `In ${diffInHours} hours`;
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    return formatDate(dateString);
  };

  useEffect(() => {
    getTutorName();
    getAnnouncements();
    getUpcomingVirtualClasses();
    getDashboardStats();
  }, []);

  // Sample performance data for recharts
  const performanceData = [
    { week: 'Week 1', performance: 65 },
    { week: 'Week 2', performance: 72 },
    { week: 'Week 3', performance: 80 },
    { week: 'Week 4', performance: 88 },
    { week: 'Week 5', performance: 76 },
    { week: 'Week 6', performance: 92 },
  ];

  // Priority styling
  const getPriorityStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'border-l-4 border-red-500';
      case 'MEDIUM':
        return 'border-l-4 border-yellow-500';
      case 'LOW':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-blue-200 border-dashed rounded-lg shadow-md mt-14 bg-white dark:bg-gray-900">
          {/* Greeting Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-800 dark:text-white">
              {getGreeting()}! {teacherName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here's what's happening today.
            </p>
          </div>
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center justify-center h-24 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-white">
                  No of Students
                </p>
                <p className="text-4xl font-bold text-white mt-1">
                  {statsLoading ? '...' : dashboardStats.student_count}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center h-24 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-white">
                  No of Tutors
                </p>
                <p className="text-4xl font-bold text-white mt-1">
                  {statsLoading ? '...' : dashboardStats.tutor_count}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center h-24 rounded-lg bg-gradient-to-r from-blue-300 to-blue-500 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-white">
                  New Students
                </p>
                <p className="text-sm text-white opacity-90">This Month</p>
                <p className="text-4xl font-bold text-white mt-1">
                  {statsLoading ? '...' : dashboardStats.students_joined_this_month}
                </p>
              </div>
            </div>
          </div>
          
          {/* Virtual Classes Section */}
          <div className="mb-6 rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Upcoming Virtual Classes
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {classesLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
              ) : virtualClasses.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm">No upcoming virtual classes</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {virtualClasses.map((classItem, index) => {
                    const { date, time } = formatClassDateTime(classItem.class_date, classItem.class_time);
                    return (
                      <div key={classItem.class_id} className="p-4 hover:bg-blue-50 transition-colors duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {classItem.course_name}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span className="mr-3">{date}</span>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span>{time}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getRelativeTime(classItem.class_date)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <a 
                            href={classItem.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            Join Class
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 text-center border-t">
              <button 
                onClick={getUpcomingVirtualClasses}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center mx-auto transition-colors"
              >
                Refresh Classes
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Announcements Section */}
          <div className="mb-6 rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-2xl font-bold text-white">
                Recent Announcements
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-lg font-medium">{error}</p>
                </div>
                <button 
                  onClick={getAnnouncements}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p className="text-lg">No announcements available</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {announcements.map(announcement => (
                  <div 
                    key={announcement.announcement_id} 
                    className={`p-4 hover:bg-blue-50 transition-colors duration-200 ${getPriorityStyle(announcement.priority)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center flex-wrap">
                          <span className="mr-2">{announcement.course_name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeStyle(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                        </h3>
                        
                        <div className="mt-2 text-gray-600 space-y-1">
                          <p className="flex items-center flex-wrap">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span className="mr-4">{formatDate(announcement.published_date)}</span>
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{formatTime(announcement.published_date)}</span>
                          </p>
                          
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Published by: {announcement.publisher_name}
                          </p>
                        </div>
                        
                        <p className="mt-3 text-gray-700 leading-relaxed">
                          {announcement.announcement}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-blue-50 p-3 text-center">
              <button 
                onClick={getAnnouncements}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto transition-colors"
              >
                Refresh Announcements
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-500 h-28 shadow-lg p-2 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg className="w-8 h-8 text-white mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
              </svg>
              <p className="text-lg font-bold text-white">Add Announcements</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-400 h-28 shadow-lg p-2 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg className="w-8 h-8 text-white mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
              </svg>
              <p className="text-lg font-bold text-white">Publish a Virtual class</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-300 h-28 shadow-lg p-2 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg className="w-8 h-8 text-white mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
              </svg>
              <p className="text-lg font-bold text-white">Create a Quiz</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-300 h-28 shadow-lg p-2 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg className="w-8 h-8 text-white mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
              </svg>
              <p className="text-lg font-bold text-white">Edit My Profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}