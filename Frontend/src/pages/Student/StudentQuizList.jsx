import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Lock, Award, CheckCircle, AlertCircle, Play, Search, Filter, TrendingUp, Star, User, BookOpen, X } from 'lucide-react';
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';

export default function StudentQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordModal, setPasswordModal] = useState({ show: false, quiz: null });
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // TEMPORARY: Hardcoded for testing - replace with proper auth
  const studentId = 'TE0001'; // Your actual student ID from database

  // Toast function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    console.log('useEffect triggered with filters:', { selectedCourse, statusFilter, searchTerm });
    fetchQuizzes();
    fetchCourses();
    fetchStats();
  }, [selectedCourse, statusFilter, searchTerm]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCourse !== 'all') params.append('courseId', selectedCourse);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const url = `/api/quiz/student/${studentId}/quizzes?${params}`;
      console.log('Fetching quizzes from:', url);
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Number of quizzes returned:', data.data?.length);
      
      // Log each quiz's status for debugging
      if (data.data) {
        data.data.forEach(quiz => {
          console.log(`Quiz "${quiz.title}" - Status: ${quiz.status}, Course: ${quiz.courseId}`);
        });
      }
      
      if (data.success) {
        console.log('Setting quizzes state with:', data.data);
        setQuizzes(data.data || []);
        console.log('Quizzes state should now be:', data.data);
      } else {
        console.log('API returned success: false');
        setError(data.message || 'Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/quiz/student/${studentId}/courses`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/quiz/student/${studentId}/stats`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const validatePassword = async (quizId, password) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/validate-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data.isValid;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error validating password:', err);
      return false;
    }
  };

  const getQuizStatus = (quiz) => {
    return quiz.status; // Backend already provides the status
  };

  const canAttemptQuiz = (quiz) => {
    const attemptsLeft = quiz.maxAttempts - quiz.attemptCount;
    return quiz.status === 'active' && attemptsLeft > 0;
  };

  const getAttemptsLeft = (quiz) => {
    return quiz.maxAttempts - quiz.attemptCount;
  };

  const getBestScore = (quiz) => {
    return quiz.bestScore;
  };

  // Function to get only the latest attempt
  const getLatestAttempt = (quiz) => {
    if (!quiz.attempts || quiz.attempts.length === 0) {
      return null;
    }
    
    // Sort attempts by attemptNumber in descending order and get the first (latest) one
    const sortedAttempts = [...quiz.attempts].sort((a, b) => b.attemptNumber - a.attemptNumber);
    return sortedAttempts[0];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartQuiz = async (quiz) => {
    if (quiz.hasPassword) {
      setPasswordModal({ show: true, quiz });
    } else {
      //mark
      // Navigate directly to takeQuiz page
      window.location.href = `/student/takeQuiz?quizId=${quiz.id}`;
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      showToast('Please enter a password', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      const isValid = await validatePassword(passwordModal.quiz.id, password);
      
      if (isValid) {
        setPasswordModal({ show: false, quiz: null });
        setPassword('');
        showToast('Password verified successfully! Starting quiz...', 'success');
        
        // Small delay to show success message before navigation
        setTimeout(() => {
          window.location.href = `/student/takeQuiz?quizId=${passwordModal.quiz.id}`;
        }, 1000);
      } else {
        showToast('Incorrect password. Please try again.', 'error');
        setPassword(''); // Clear the password field
      }
    } catch (err) {
      console.error('Error validating password:', err);
      showToast('Failed to validate password. Please try again.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Since backend handles filtering, we only need client-side search filtering
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = !searchTerm || 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log(`Filtering quiz "${quiz.title}":`, {
      quiz,
      searchTerm,
      matchesSearch,
      willShow: matchesSearch
    });
    
    return matchesSearch;
  });

  console.log('Original quizzes array:', quizzes);
  console.log('Filtered quizzes array:', filteredQuizzes);
  console.log('Current filters:', { selectedCourse, statusFilter, searchTerm });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Sidebar />
        <div className="pt-20 sm:ml-64">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
              <button 
                onClick={() => {
                  setError(null);
                  fetchQuizzes();
                  fetchCourses();
                  fetchStats();
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header/>
      <Sidebar/>
      
      {/* Main Content - Adjusted for header (pt-20) and sidebar (sm:ml-64) */}
      <div className="pt-20 sm:ml-64">
        {/* Header */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-white mb-2">Available Quizzes</h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">View and attempt quizzes for your enrolled courses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Quizzes</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.completedQuizzes}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingQuizzes}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredQuizzes.length} of {quizzes.length} quizzes
              </div>
            </div>
          </div>

          {/* Quiz Cards */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <BookOpen className="w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-4 text-gray-400" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No quizzes found</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || selectedCourse !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Check back later for new quizzes'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredQuizzes.map(quiz => {
                const status = getQuizStatus(quiz);
                const attemptsLeft = getAttemptsLeft(quiz);
                const bestScore = getBestScore(quiz);
                const canAttempt = canAttemptQuiz(quiz);
                const latestAttempt = getLatestAttempt(quiz);

                return (
                  <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-3">
                          {quiz.title}
                        </h3>
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                            status === 'active' ? 'bg-green-100 text-green-800' :
                            status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status === 'active' ? 'Active' :
                             status === 'upcoming' ? 'Upcoming' :
                             status === 'completed' ? 'Completed' :
                             'Expired'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {quiz.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="font-medium">{quiz.courseName}</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span>{quiz.teacherName}</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          {quiz.duration} minutes
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          {quiz.questionCount} questions • {quiz.totalMarks} marks
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Due: {quiz.schedule?.endDateTime ? new Date(quiz.schedule.endDateTime).toLocaleDateString() : 'No deadline'}
                        </div>
                        {quiz.hasPassword && (
                          <div className="flex items-center text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Password protected
                          </div>
                        )}
                      </div>

                      {/* Attempts Info - Show only latest attempt */}
                      <div className="mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attempts: {quiz.attemptCount || 0}/{quiz.maxAttempts}
                          </span>
                          {bestScore !== null && bestScore > 0 && (
                            <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Best: {bestScore}%
                            </span>
                          )}
                        </div>
                        {latestAttempt ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>Latest Attempt ({latestAttempt.attemptNumber})</span>
                              <span className="font-medium">{latestAttempt.score}/{quiz.totalMarks} ({latestAttempt.percentage}%)</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-500">No attempts yet</p>
                        )}
                      </div>

                      {/* Action Buttons - Removed Review Button */}
                      <div className="flex gap-2">
                        {canAttempt ? (
                          <button
                            onClick={() => handleStartQuiz(quiz)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                            {quiz.attemptCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
                          </button>
                        ) : status === 'upcoming' ? (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Not Yet Available
                          </button>
                        ) : status === 'expired' ? (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Quiz Expired
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            No Attempts Left
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Password Modal */}
          {passwordModal.show && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div 
                  className="fixed inset-0 bg-gray-500 bg-opacity-75"
                  onClick={() => {
                    setPasswordModal({ show: false, quiz: null });
                    setPassword('');
                  }}
                ></div>

                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
                  <div className="px-4 pt-5 pb-4 sm:p-6">
                    <div className="sm:flex sm:items-start">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0">
                        <Lock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Password Required
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            This quiz is password protected. Please enter the password provided by your teacher.
                          </p>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter password"
                            disabled={passwordLoading}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !passwordLoading) {
                                handlePasswordSubmit();
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={handlePasswordSubmit}
                      disabled={passwordLoading}
                      className="w-full sm:w-auto px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed sm:ml-3 flex items-center justify-center gap-2"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Verifying...
                        </>
                      ) : (
                        'Start Quiz'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPasswordModal({ show: false, quiz: null });
                        setPassword('');
                      }}
                      disabled={passwordLoading}
                      className="w-full sm:w-auto px-4 py-2 mt-3 sm:mt-0 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast.show && (
            <div className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
              toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              <div className={`rounded-lg shadow-lg p-4 ${
                toast.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {toast.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {toast.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => setToast({ show: false, message: '', type: '' })}
                      className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        toast.type === 'success'
                          ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                          : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}