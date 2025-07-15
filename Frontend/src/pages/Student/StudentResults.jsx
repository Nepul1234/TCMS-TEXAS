import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import { useAuth } from '../../components/context/AuthContext';
import { 
  Trophy, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  Search,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const { user } = useAuth();

  // Fetch results from API
  useEffect(() => {
    console.log("useEffect triggered, user:", user); // Debug log
    fetchResults(); // Call it regardless of user state
  }, [user]);

  // Also add a useEffect that runs on component mount
  useEffect(() => {
    console.log("Component mounted"); // Debug log
    // Try to fetch results immediately on mount
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Token found on mount, calling fetchResults");
      fetchResults();
    }
  }, []); // Empty dependency array means this runs once on mount

  // Filter results based on search and filters
  useEffect(() => {
    filterResults();
  }, [results, searchTerm, courseFilter, typeFilter, statusFilter]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      console.log("fetchResults called"); // Debug log
      
      // Get student ID from JWT token first (more reliable)
      const token = localStorage.getItem("token");
      let studentId;
      
      console.log("Token:", token ? "Found" : "Not found"); // Debug log
      console.log("User from context:", user); // Debug log
      
      if (token) {
        try {
          const userData = JSON.parse(atob(token.split('.')[1]));
          console.log("Token userData:", userData); // Debug log
          studentId = userData.id || userData.stu_id || userData.user_id;
        } catch (tokenError) {
          console.error("Error parsing token:", tokenError);
        }
      }
      
      // Fallback to user context if token parsing failed
      if (!studentId && user?.user_id) {
        studentId = user.user_id;
        console.log("Using user context ID:", studentId);
      }
      
      console.log("Final studentId:", studentId); // Debug log
      
      if (!studentId) {
        console.log("No student ID found, setting error");
        setError("Student ID not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const apiUrl = `/api/student-results/${studentId}`;
      console.log("Making API call to:", apiUrl); // Debug log

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log("Response status:", response.status); // Debug log
      console.log("Response ok:", response.ok); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText); // Debug log
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response data:", data); // Debug log
      
      if (data.success) {
        setResults(data.results || []);
        setError(null);
        console.log("Results set successfully:", data.results?.length, "items"); // Debug log
      } else {
        setError(data.message || "Failed to load results");
        setResults([]);
      }
      
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(`Failed to load your results: ${err.message}`);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = results;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(result => result.course === courseFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(result => result.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => result.status === statusFilter);
    }

    setFilteredResults(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <FileText size={18} className="text-blue-600" />;
      case 'assignment':
        return <BookOpen size={18} className="text-green-600" />;
      case 'exam':
        return <Award size={18} className="text-purple-600" />;
      default:
        return <FileText size={18} className="text-gray-600" />;
    }
  };

  const openDetailModal = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const uniqueCourses = [...new Set(results.map(r => r.course))];

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
                <Trophy className="mr-3 text-blue-600 dark:text-blue-400" size={32} />
                My Results
              </h1>
              <p className="text-blue-600 dark:text-blue-300">
                View your quiz scores, assignment grades, and exam results
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search results..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Course Filter */}
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>

                {/* Type Filter */}
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quizzes</option>
                  <option value="assignment">Assignments</option>
                  <option value="exam">Exams</option>
                </select>

                {/* Status Filter */}
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Results List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading your results...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center">
                  <AlertCircle className="mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Error loading results</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  <button 
                    onClick={fetchResults}
                    className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || courseFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'You don\'t have any results yet. Complete some quizzes or assignments to see your scores here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map(result => (
                    <div
                      key={result.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            {getTypeIcon(result.type)}
                            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                              {result.title}
                            </h3>
                            <span className="ml-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                              {result.course}
                            </span>
                            {result.course_id && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {result.course_id}
                              </span>
                            )}
                            {result.grade && (
                              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                Grade {result.grade}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Calendar className="mr-2 flex-shrink-0" size={16} />
                              <span className="text-sm">{formatDate(result.submittedAt)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Clock className="mr-2 flex-shrink-0" size={16} />
                              <span className="text-sm">{result.timeSpent || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              {getStatusIcon(result.status)}
                              <span className="ml-2 text-sm capitalize">{result.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:ml-6">
                          {result.status === 'completed' && result.score !== null && result.score !== undefined ? (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.score}/{result.maxScore}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {result.percentage}%
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-lg font-medium text-gray-500 dark:text-gray-400">
                                {result.status === 'pending' ? 'Pending Review' : 'No Score'}
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={() => openDetailModal(result)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Eye className="mr-2" size={16} />
                            View Details
                          </button>
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

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedResult.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedResult.course} • {selectedResult.type.charAt(0).toUpperCase() + selectedResult.type.slice(1)}
                  </p>
                  {selectedResult.course_id && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Course ID: {selectedResult.course_id}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Score
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedResult.score !== null && selectedResult.score !== undefined 
                        ? `${selectedResult.score}/${selectedResult.maxScore} (${selectedResult.percentage}%)`
                        : 'No score available'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedResult.status)}
                      <span className="ml-2 capitalize text-gray-900 dark:text-white">
                        {selectedResult.status}
                      </span>
                    </div>
                  </div>
                  {selectedResult.grade && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Grade
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResult.grade}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Spent
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedResult.timeSpent || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Attempts
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedResult.attempts || 1}
                    </p>
                  </div>
                </div>
              </div>

              {selectedResult.feedback && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teacher Feedback
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">
                      {selectedResult.feedback}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}