import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import { useAuth } from '../../components/context/AuthContext'; // Import useAuth to get student ID
import { Calendar, Clock, Link2, BookOpen, ExternalLink, Filter, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function StudentVirtualClasses() {
  const [virtualClasses, setVirtualClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Get user info from AuthContext
  const { user } = useAuth();

  // API URL - Updated to use student-specific endpoint
  // Adjust the field name based on your AuthContext structure:
  // user?.id, user?.stu_id, user?.student_id, user?.studentId, etc.
  const API_URL = `/api/virtual-classes/student/${user?.id || 'unknown'}`;

  // Fetch all virtual classes from the API
  useEffect(() => {
    fetchVirtualClasses();
  }, []);

  // Filter classes based on search and filters
  useEffect(() => {
    filterClasses();
  }, [virtualClasses, searchTerm, statusFilter, dateFilter]);

  const fetchVirtualClasses = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is available
      if (!user?.id && !user?.stu_id) {
        setError("Student information not available. Please log in again.");
        return;
      }
      
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setVirtualClasses(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching virtual classes:", err);
      setError("Failed to load your virtual classes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = virtualClasses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cls => cls.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.date + 'T00:00:00');
        classDate.setHours(0, 0, 0, 0); // Set to start of day
        
        switch (dateFilter) {
          case 'today':
            return classDate.getTime() === today.getTime();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return classDate >= today && classDate <= weekFromNow;
          case 'past':
            return classDate < today;
          default:
            return true;
        }
      });
    }

    setFilteredClasses(filtered);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle size={16} className="text-green-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-gray-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const isClassToday = (dateString) => {
    const today = new Date();
    const classDate = new Date(dateString + 'T00:00:00');
    return classDate.toDateString() === today.toDateString();
  };

  const isClassUpcoming = (dateString) => {
    const today = new Date();
    const classDate = new Date(dateString + 'T00:00:00');
    return classDate >= today;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-400 flex items-center mb-2">
                <BookOpen className="mr-3 text-blue-600 dark:text-blue-400" size={32} />
                My Virtual Classes
              </h1>
              <p className="text-blue-600 dark:text-blue-300">
                View and join your scheduled virtual classes
              </p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="md:w-48">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="md:w-48">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="past">Past Classes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading virtual classes...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center">
                  <AlertCircle className="mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Error loading classes</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  <button 
                    onClick={fetchVirtualClasses}
                    className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters to see more classes.'
                      : 'You are not enrolled in any courses with virtual classes yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClasses.map(cls => (
                    <div
                      key={cls.id}
                      className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                        isClassToday(cls.date) && cls.status === 'upcoming'
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                          : cls.status === 'completed'
                          ? 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600'
                          : cls.status === 'cancelled'
                          ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                          : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <BookOpen className="mr-3 text-blue-600 dark:text-blue-400" size={24} />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {cls.course}
                            </h3>
                            {isClassToday(cls.date) && cls.status === 'upcoming' && (
                              <span className="ml-3 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-medium rounded-full">
                                Today
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Calendar className="mr-2 flex-shrink-0" size={18} />
                              <span>{formatDate(cls.date)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Clock className="mr-2 flex-shrink-0" size={18} />
                              <span>{formatTime(cls.time)}</span>
                            </div>
                          </div>

                          <div className="flex items-center mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(cls.status)}`}>
                              {getStatusIcon(cls.status)}
                              <span className="ml-2">{cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                          {cls.status === 'upcoming' && (
                            <a
                              href={cls.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              <ExternalLink className="mr-2" size={18} />
                              Join Class
                            </a>
                          )}
                          
                          <a
                            href={cls.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            <Link2 className="mr-2" size={16} />
                            View Link
                          </a>
                        </div>
                      </div>

                      {/* Meeting Link Section - Collapsible for smaller screens */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meeting Link:
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <a
                            href={cls.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all text-sm"
                          >
                            {cls.link}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}