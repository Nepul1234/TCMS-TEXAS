import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Users, Clock, Target, TrendingUp, AlertCircle, Download, Filter, Eye, ChevronDown, RefreshCw, BookOpen, ArrowLeft } from 'lucide-react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

// Using Vite proxy - no need for full URL
const API_BASE_URL = '/api';

export default function QuizAnalytics() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  // Fetch analytics data from backend
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/quiz-analytics/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you have authentication
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch analytics');
      }

      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchAnalytics();
    }
  }, [quizId]);

  const handleBack = () => {
    navigate('/quiz-dashboard');
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const exportToCSV = async (type = 'students') => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz-analytics/${quizId}/export?type=${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Convert data to CSV format
        const csvContent = convertToCSV(result.data);
        downloadCSV(csvContent, result.filename || `quiz_${quizId}_analytics.csv`);
      } else {
        alert('Failed to export data: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data: ' + error.message);
    }
  };

  // Helper function to convert JSON data to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  // Helper function to download CSV file
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Sidebar />
        <div className="pt-20 sm:ml-64">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <AlertCircle className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Sidebar />
        <div className="pt-20 sm:ml-64">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quiz Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The requested quiz analytics could not be found.</p>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = selectedFilter === 'all' 
    ? analytics.studentPerformance 
    : analytics.studentPerformance.filter(s => s.status === selectedFilter);

  const getInsights = () => {
    const insights = [];
    
    if (analytics.summary.attemptedStudents === 0) {
      insights.push('No students have attempted this quiz yet');
      return insights;
    }
    
    const hardQuestions = analytics.questionAnalysis.filter(q => q.successRate < 60);
    if (hardQuestions.length > 0) {
      insights.push(`${hardQuestions.length} question(s) have success rate below 60% - consider reviewing these topics`);
    }
    
    const notAttempted = analytics.summary.totalStudents - analytics.summary.attemptedStudents;
    if (notAttempted > 0) {
      insights.push(`${notAttempted} student(s) haven't attempted the quiz yet`);
    }
    
    if (analytics.summary.passRate >= 85) {
      insights.push(`Excellent pass rate of ${analytics.summary.passRate}% - students are performing well`);
    } else if (analytics.summary.passRate < 60) {
      insights.push(`Low pass rate of ${analytics.summary.passRate}% - consider reviewing difficulty level`);
    }

    if (insights.length === 0) {
      insights.push('Quiz performance is within normal range');
    }

    return insights;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Sidebar />
      
      {/* Main Content */}
      <div className="pt-20 sm:ml-64">
        {/* Header */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Analytics</h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{analytics.quiz.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Created on {new Date(analytics.quiz.createdDate).toLocaleDateString()} • 
                    {analytics.quiz.lastAttempt && ` Last attempt: ${new Date(analytics.quiz.lastAttempt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  Refresh
                </button>
                <div className="relative">
                  <button
                    onClick={() => exportToCSV('students')}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* View Mode Tabs */}
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-6 sm:mb-8">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md transition-colors ${
                viewMode === 'overview'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('questions')}
              className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md transition-colors ${
                viewMode === 'questions'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Question Analysis
            </button>
            <button
              onClick={() => setViewMode('students')}
              className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md transition-colors ${
                viewMode === 'students'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Student Performance
            </button>
          </div>

          {/* Overview Tab */}
          {viewMode === 'overview' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.summary.attemptedStudents}/{analytics.summary.totalStudents}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Students Attempted</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {analytics.summary.totalStudents > 0 ? ((analytics.summary.attemptedStudents / analytics.summary.totalStudents) * 100).toFixed(1) : 0}% participation
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Target className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.summary.averageScore}%
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    High: {analytics.summary.highestScore}% | Low: {analytics.summary.lowestScore}%
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.summary.passRate}%
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pass Rate</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {analytics.summary.passedStudents} students passed
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.summary.averageTimeSpent}m
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Time Spent</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Quiz duration: {analytics.quiz.duration} minutes
                  </p>
                </div>
              </div>

              {/* Score Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <BarChart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Score Distribution
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {analytics.scoreDistribution.map((range, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 w-16 sm:w-20">
                        {range.range}%
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 sm:h-8 relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${range.percentage || 0}%` }}
                        >
                          {range.count > 0 && (
                            <span className="text-xs font-medium text-white">{range.count}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 w-12 sm:w-16">
                        {(range.percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Questions Tab */}
          {viewMode === 'questions' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  Question Performance Analysis
                </h3>
                {analytics.questionAnalysis.length > 0 && (
                  <button
                    onClick={() => exportToCSV('questions')}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Questions
                  </button>
                )}
              </div>
              {analytics.questionAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No question data available yet. Students need to attempt the quiz first.</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {analytics.questionAnalysis.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                              Question {index + 1}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              question.type === 'mcq' ? 'bg-green-100 text-green-800' :
                              question.type === 'short_answer' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {question.type === 'mcq' ? 'MCQ' : 
                               question.type === 'short_answer' ? 'Short Answer' : 
                               'Drag & Drop'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">{question.marks} marks</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-3">
                            {question.questionText}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className={`text-base sm:text-lg font-bold ${getSuccessRateColor(question.successRate)}`}>
                            {(question.successRate || 0).toFixed(1)}%
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {question.correctAttempts}/{question.totalAttempts}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Correct/Total</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {(question.avgTimeSpent || 0).toFixed(1)}m
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg. Time</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {question.marks}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Max Marks</p>
                        </div>
                      </div>

                      {question.commonMistakes && question.commonMistakes.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Common Mistakes:</p>
                          <ul className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                            {question.commonMistakes.map((mistake, idx) => (
                              <li key={idx}>• {mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {viewMode === 'students' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Student Performance
                </h3>
                <div className="flex items-center gap-3">
                  {analytics.studentPerformance.length > 0 && (
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Students ({analytics.studentPerformance.length})</option>
                      <option value="passed">Passed Only ({analytics.studentPerformance.filter(s => s.status === 'passed').length})</option>
                      <option value="failed">Failed Only ({analytics.studentPerformance.filter(s => s.status === 'failed').length})</option>
                    </select>
                  )}
                  {analytics.studentPerformance.length > 0 && (
                    <button
                      onClick={() => exportToCSV('students')}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Students
                    </button>
                  )}
                </div>
              </div>
              
              {analytics.studentPerformance.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No student performance data available yet. Students need to attempt the quiz first.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-3">Rank</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Student Name</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Score</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Percentage</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 hidden sm:table-cell">Time Spent</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 hidden md:table-cell">Attempts</th>
                        <th scope="col" className="px-3 sm:px-6 py-3">Status</th>
                        <th scope="col" className="px-3 sm:px-6 py-3 hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 sm:px-6 py-4 font-medium text-gray-900 dark:text-white">
                            #{student.rank || 0}
                          </td>
                          <td className="px-3 sm:px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            {student.score}/{analytics.quiz.totalMarks}
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className={`font-medium ${
                              student.percentage >= 80 ? 'text-green-600' :
                              student.percentage >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {student.percentage}%
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">{student.timeSpent}m</td>
                          <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                            <span className={student.attempts > 1 ? 'text-orange-600' : 'text-gray-600'}>
                              {student.attempts}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              student.status === 'passed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {student.status === 'passed' ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">{student.attemptDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Insights - Always visible */}
          <div className="mt-6 sm:mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 sm:mb-3">Analytics Insights</h4>
                <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 space-y-1 sm:space-y-2">
                  {getInsights().map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}