import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Users, BarChart, Clock, Search, Grid, List, TrendingUp, CheckCircle, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '../../components/Header/TutorHeader';
import Sidebar from '../../components/Sidebar/TutorSidebar';

export default function TeacherQuizDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Toast function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting fetch...');
      
      const response = await fetch('/api/teacher/quizzes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Response received, status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Body used before JSON:', response.bodyUsed);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('About to read JSON...');
      const result = await response.json();
      console.log('JSON parsed successfully:', result);
      
      if (result.success) {
        const transformedData = result.data.map(quiz => ({
          ...quiz,
          avg_score: parseFloat(quiz.avg_score) || 0,
          schedule: quiz.start_datetime && quiz.end_datetime ? {
            start_datetime: quiz.start_datetime,
            end_datetime: quiz.end_datetime
          } : null
        }));
        setQuizzes(transformedData);
        console.log('Quizzes set successfully');
      } else {
        throw new Error(result.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes. Please try again.');
      
      // Fallback to mock data if API fails
      const mockQuizzes = [
        {
          id: 1,
          title: 'Chapter 5: Algebra Test',
          description: 'Test covering linear equations, quadratic equations, and factorization',
          course_name: 'Mathematics Grade 10',
          status: 'published',
          duration_minutes: 60,
          attempt_count: 32,
          question_count: 25,
          total_marks: 50,
          avg_score: 78.5,
          schedule: {
            start_datetime: '2025-01-15T09:00:00',
            end_datetime: '2025-01-22T23:59:59'
          }
        },
        {
          id: 2,
          title: 'Physics - Motion and Forces',
          description: 'Assessment on kinematics, Newton\'s laws, and force calculations',
          course_name: 'Physics Grade 11',
          status: 'draft',
          duration_minutes: 45,
          attempt_count: 0,
          question_count: 20,
          total_marks: 40,
          avg_score: 0,
          schedule: null
        }
      ];
      setQuizzes(mockQuizzes);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/quizzes/${selectedQuiz.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const deleteResult = await response.json();
      
      if (!deleteResult.success) {
        throw new Error(deleteResult.message || 'Failed to delete quiz');
      }

      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id));
      setShowDeleteModal(false);
      setSelectedQuiz(null);
      
      showToast('Quiz deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showToast('Failed to delete quiz. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const togglePublish = async (quiz) => {
    try {
      setActionLoading(true);
      
      if (quiz.status === 'published') {
        // Archive (unpublish) the quiz
        const response = await fetch(`/api/quizzes/${quiz.id}/archive`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
        }

        const archiveResult = await response.json();
        
        if (!archiveResult.success) {
          throw new Error(archiveResult.message || 'Failed to archive quiz');
        }

        // Update the quiz status to archived
        setQuizzes(quizzes.map(q => 
          q.id === quiz.id ? { ...q, status: 'archived' } : q
        ));
        
        showToast('Quiz archived successfully!', 'success');
      } else {
        // Publish quiz (from draft or archived)
        const response = await fetch(`/api/quizzes/${quiz.id}/publish`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
        }

        const publishResult = await response.json();
        
        if (!publishResult.success) {
          throw new Error(publishResult.message || 'Failed to publish quiz');
        }

        // Update the quiz status to published
        setQuizzes(quizzes.map(q => 
          q.id === quiz.id ? { ...q, status: 'published' } : q
        ));
        
        showToast('Quiz published successfully!', 'success');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      const action = quiz.status === 'published' ? 'archive' : 'publish';
      showToast(`Failed to ${action} quiz. Please try again.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (quiz) => {
    if (quiz.status === 'draft') {
      return <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>;
    } else if (quiz.status === 'published') {
      return <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Published</span>;
    } else {
      return <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Archived</span>;
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    return quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />
      
      <div className="pt-20 sm:ml-64">
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quiz Management</h1>
                <p className="text-base sm:text-lg text-gray-600">Create and manage quizzes for your courses</p>
              </div>
              <Link 
                to="/tutor/quizCreate"
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create New Quiz
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button 
                    onClick={fetchQuizzes}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{quizzes.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <BarChart className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Published</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{quizzes.filter(q => q.status === 'published').length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Archived</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{quizzes.filter(q => q.status === 'archived').length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{quizzes.reduce((sum, q) => sum + q.attempt_count, 0)}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-xs sm:text-sm text-gray-600">
              Showing {filteredQuizzes.length} of {quizzes.length} quizzes
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <BarChart className="w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-4 text-gray-400" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Create your first quiz to get started</p>
              <Link 
                to="/quizCreate"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Quiz
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredQuizzes.map(quiz => (
                <div key={quiz.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1 mr-3">
                        {quiz.title}
                      </h3>
                      {getStatusBadge(quiz)}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 h-8 sm:h-10 overflow-hidden">
                      {quiz.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {quiz.duration_minutes} minutes
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {quiz.attempt_count} attempts
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <BarChart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {quiz.question_count} questions • {quiz.total_marks} marks
                      </div>
                      {quiz.avg_score > 0 && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Avg: {quiz.avg_score}%
                        </div>
                      )}
                    </div>
                    
                    {quiz.schedule && (
                      <div className="mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start text-xs sm:text-sm text-blue-800">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <div>Start: {new Date(quiz.schedule.start_datetime).toLocaleDateString()}</div>
                            <div>End: {new Date(quiz.schedule.end_datetime).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Link 
                        to={`/quizCreate/${quiz.id}`}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => togglePublish(quiz)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quiz.status === 'published' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span className="hidden sm:inline">{quiz.status === 'published' ? 'Archive' : 'Publish'}</span>
                      </button>
                      
                      <Link 
                        to={`/analytics/${quiz.id}`}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <BarChart className="w-3 h-3" />
                        <span className="hidden sm:inline">Analytics</span>
                      </Link>
                      
                      <button
                        onClick={() => { setSelectedQuiz(quiz); setShowDeleteModal(true); }}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Quiz Title</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Course</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Questions</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Duration</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Attempts</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Avg Score</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div>
                            <div className="font-medium text-gray-900 text-xs sm:text-sm">{quiz.title}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs lg:hidden">
                              {quiz.course_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 hidden lg:table-cell text-xs sm:text-sm">
                          {quiz.course_name}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          {getStatusBadge(quiz)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-xs sm:text-sm">
                          {quiz.question_count} • {quiz.total_marks} marks
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell text-xs sm:text-sm">
                          {quiz.duration_minutes}m
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-xs sm:text-sm">
                          {quiz.attempt_count}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell text-xs sm:text-sm">
                          {quiz.avg_score > 0 ? `${quiz.avg_score}%` : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1">
                            <Link 
                              to={`/quizCreate/${quiz.id}`}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                            <button
                              onClick={() => togglePublish(quiz)}
                              disabled={actionLoading}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {quiz.status === 'published' ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </button>
                            <Link 
                              to={`/analytics/${quiz.id}`}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <BarChart className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                            <button
                              onClick={() => { setSelectedQuiz(quiz); setShowDeleteModal(true); }}
                              disabled={actionLoading}
                              className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div 
                  className="fixed inset-0 bg-gray-500 bg-opacity-75"
                  onClick={() => setShowDeleteModal(false)}
                ></div>

                <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                  <div className="px-4 pt-5 pb-4 sm:p-6">
                    <div className="sm:flex sm:items-start">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium text-gray-900">Delete Quiz</h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete "{selectedQuiz?.title}"? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Deleting...' : 'Delete Quiz'}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-2 mt-3 sm:mt-0 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
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