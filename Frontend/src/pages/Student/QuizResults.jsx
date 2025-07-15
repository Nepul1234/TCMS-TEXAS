import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, CheckCircle, XCircle, AlertCircle, Home, Eye, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Import components
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';

export default function QuizResults({ quizId: propQuizId, attemptId: propAttemptId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [quizId, setQuizId] = useState(null);
  
  const navigate = useNavigate();

  // Get student ID from localStorage, session, or props
  const studentId = 'TE0001';

  // Helper function to get correct answer based on question type
  const getCorrectAnswerDisplay = (question) => {
    if (question.type === 'short_answer') {
      return question.correctAnswer || 'No correct answer provided';
    } else if (question.type === 'mcq' && question.options) {
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      if (correctOptions.length > 0) {
        return correctOptions.map(opt => opt.text).join(', ');
      }
      return 'No correct answer marked';
    } else if (question.type === 'drag_drop') {
      if (question.dragDropItems && question.dragDropItems.length > 0) {
        return question.dragDropItems.map(item => 
          `${item.itemText} → ${item.targetText}`
        ).join('; ');
      } else if (question.correctMatches) {
        try {
          if (typeof question.correctMatches === 'string') {
            const matches = JSON.parse(question.correctMatches);
            return Object.entries(matches).map(([target, item]) => 
              `${item} → ${target}`
            ).join('; ');
          } else if (typeof question.correctMatches === 'object') {
            return Object.entries(question.correctMatches).map(([target, item]) => 
              `${item} → ${target}`
            ).join('; ');
          }
        } catch (e) {
          console.error('Error parsing correct matches:', e);
        }
      }
      return 'Drag & drop matches available';
    }
    return 'Correct answer not available';
  };

  // Helper function to check if user answer is correct for MCQ
  const isUserAnswerCorrect = (question) => {
    if (question.type === 'mcq' && question.options && question.userAnswer) {
      const userOption = question.options.find(opt => opt.id === question.userAnswer);
      return userOption ? userOption.isCorrect : false;
    }
    return question.isCorrect || false;
  };

  // Enhanced helper function to get user answer display text
  const getUserAnswerDisplay = (question) => {
    if (question.type === 'mcq' && question.options && question.userAnswer) {
      const userOption = question.options.find(opt => opt.id === question.userAnswer);
      return userOption ? userOption.text : 'No answer selected';
    } else if (question.type === 'short_answer') {
      return question.userAnswer || 'No answer provided';
    } else if (question.type === 'drag_drop') {
      console.log('Processing drag & drop question:', question);
      
      let userMatches = null;
      
      // Method 1: Check dragMatches field (this is where your data is!)
      if (question.dragMatches) {
        console.log('Found dragMatches field:', question.dragMatches);
        userMatches = question.dragMatches;
      }
      
      // Method 2: Check userAnswer field  
      else if (question.userAnswer && question.userAnswer !== "Drag & drop matches recorded") {
        if (typeof question.userAnswer === 'string') {
          try {
            userMatches = JSON.parse(question.userAnswer);
          } catch (e) {
            console.log('Failed to parse userAnswer as JSON');
          }
        } else if (typeof question.userAnswer === 'object') {
          userMatches = question.userAnswer;
        }
      }
      
      // Method 3: Check dragDropMatches field
      else if (question.dragDropMatches) {
        if (typeof question.dragDropMatches === 'string') {
          try {
            userMatches = JSON.parse(question.dragDropMatches);
          } catch (e) {
            console.log('Failed to parse dragDropMatches as JSON');
          }
        } else if (typeof question.dragDropMatches === 'object') {
          userMatches = question.dragDropMatches;
        }
      }
      
      // Method 4: Check drag_drop_matches field
      else if (question.drag_drop_matches) {
        if (typeof question.drag_drop_matches === 'string') {
          try {
            userMatches = JSON.parse(question.drag_drop_matches);
          } catch (e) {
            console.log('Failed to parse drag_drop_matches as JSON');
          }
        } else if (typeof question.drag_drop_matches === 'object') {
          userMatches = question.drag_drop_matches;
        }
      }
      
      console.log('Final userMatches:', userMatches);
      
      // Format the matches for display
      if (userMatches && typeof userMatches === 'object' && Object.keys(userMatches).length > 0) {
        const matchPairs = Object.entries(userMatches).map(([target, item]) => {
          return `"${item}" → "${target}"`;
        });
        const result = matchPairs.join(', ');
        console.log('Formatted drag & drop result:', result);
        return result;
      }
      
      return 'No drag & drop matches recorded';
    }
    return question.userAnswer || 'No answer provided';
  };

  // Get attemptId and quizId from multiple sources
  useEffect(() => {
    const getAttemptData = () => {
      if (propAttemptId && propQuizId) {
        return { finalAttemptId: propAttemptId, finalQuizId: propQuizId };
      }

      const urlParams = new URLSearchParams(window.location.search);
      const urlAttemptId = urlParams.get('attemptId');
      const urlQuizId = urlParams.get('quizId');
      
      const storedAttemptId = localStorage.getItem('currentAttemptId');
      const storedQuizId = localStorage.getItem('currentQuizId');
      
      const pathParts = window.location.pathname.split('/');
      const pathAttemptId = pathParts[pathParts.length - 1];
      
      const finalAttemptId = propAttemptId || urlAttemptId || storedAttemptId || (pathAttemptId !== 'results' ? pathAttemptId : null);
      const finalQuizId = propQuizId || urlQuizId || storedQuizId;
      
      console.log('Attempt data sources:', {
        propAttemptId,
        propQuizId,
        urlAttemptId,
        urlQuizId,
        storedAttemptId,
        storedQuizId,
        pathAttemptId,
        finalAttemptId,
        finalQuizId,
        currentURL: window.location.href
      });
      
      return { finalAttemptId, finalQuizId };
    };

    const { finalAttemptId, finalQuizId } = getAttemptData();
    
    if (finalAttemptId && finalAttemptId !== 'undefined' && finalAttemptId !== 'null') {
      setAttemptId(finalAttemptId);
      setQuizId(finalQuizId);
      console.log('Using attemptId:', finalAttemptId, 'quizId:', finalQuizId);
    } else {
      console.error('No valid attemptId found');
      setError('No quiz attempt found. Please try taking the quiz again.');
      setLoading(false);
    }
  }, [propAttemptId, propQuizId]);

  // Fetch results when attemptId is available
  useEffect(() => {
    if (attemptId) {
      fetchQuizResults();
    }
  }, [attemptId]);

  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching results for attemptId:', attemptId);
      
      if (!attemptId || attemptId === 'undefined') {
        throw new Error('Invalid attempt ID');
      }

      const response = await fetch(`/api/quiz/attempt/${attemptId}/results`);
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (result.success) {
        setResults(result.data);
        localStorage.removeItem('currentAttemptId');
        localStorage.removeItem('currentQuizId');
      } else {
        setError(result.message || 'Failed to fetch quiz results');
      }
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      setError('Failed to load quiz results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewData = async () => {
    try {
      setLoadingReview(true);
      console.log('Fetching review for attemptId:', attemptId);
      
      const response = await fetch(`/api/quiz/attempt/${attemptId}/review`);
      console.log('Review API response status:', response.status);
      
      const result = await response.json();
      console.log('Review API response data:', result);
      
      if (result.success) {
        console.log('Review data received:', result.data);
        console.log('Questions in review:', result.data?.questions?.length || 0);
        
        if (result.data && result.data.questions) {
          const processedQuestions = result.data.questions.map(question => {
            console.log('Processing question for review:', question);
            
            const actuallyCorrect = isUserAnswerCorrect(question);
            
            return {
              ...question,
              isCorrect: actuallyCorrect,
              correctAnswerDisplay: getCorrectAnswerDisplay(question),
              userAnswerDisplay: getUserAnswerDisplay(question)
            };
          });
          
          console.log('Processed questions with enhanced displays:', processedQuestions);
          
          setReviewData({
            ...result.data,
            questions: processedQuestions
          });
        } else {
          setReviewData(result.data);
        }
      } else {
        console.error('Failed to fetch review data:', result.message);
        alert(`Review data is not available: ${result.message}`);
      }
    } catch (err) {
      console.error('Error fetching review data:', err);
      alert('Failed to load review data. Please check the console for details.');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleShowReview = () => {
    if (!showReview && !reviewData) {
      fetchReviewData();
    }
    setShowReview(!showReview);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 sm:ml-64 pt-20 flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 sm:ml-64 pt-20 min-h-screen flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Results</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={fetchQuizResults}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 sm:ml-64 pt-20 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">No results found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 border-green-200';
    if (percentage >= 80) return 'bg-blue-100 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-100 border-yellow-200';
    if (percentage >= 60) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 sm:ml-64 pt-20">
          {/* Header */}
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-6">
            <div className="bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4 sm:py-5">
                  <div className="text-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Results</h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-1">{results.quizTitle}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                      Course: {results.courseName} • Teacher: {results.teacherName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                      Completed on {new Date(results.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Score Card */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5 mb-6 border-2 ${getGradeBgColor(results.percentage)}`}>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3 shadow-md">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${getGradeColor(results.percentage)}`}>
                  {Math.round(results.percentage)}%
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {results.score} / {results.totalMarks} marks
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  {results.passed ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Passed</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      <span>Failed</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Passing Score</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {results.passingMarks} marks
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Time Spent</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {formatTime(results.timeSpent)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {results.score}/{results.totalMarks}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Percentage</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {Math.round(results.percentage)}%
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                  <p className={`text-sm sm:text-base font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {results.passed ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
              <Link
                to="/student/stu/quiz"
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                Back to Quizzes
              </Link>
              
              {results.reviewEnabled && (
                <button
                  onClick={handleShowReview}
                  disabled={loadingReview}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loadingReview ? 'Loading...' : showReview ? 'Hide Review' : 'Review Answers'}
                </button>
              )}
            </div>

            {/* Review Section */}
            {showReview && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                {loadingReview ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading detailed review...</p>
                  </div>
                ) : reviewData && reviewData.questions && reviewData.questions.length > 0 ? (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Answer Review</h3>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Review your answers and learn from explanations. ({reviewData.questions.length} questions)
                    </div>
                    
                    {/* Performance Summary */}
                    {reviewData.statistics && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{reviewData.statistics.totalQuestions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</p>
                          <p className="text-lg font-bold text-green-600">{reviewData.statistics.correctAnswers}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                          <p className="text-lg font-bold text-blue-600">{reviewData.statistics.accuracy}%</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Review questions */}
                    <div className="space-y-6">
                      {reviewData.questions.map((question, index) => (
                        <div
                          key={question.id || index}
                          className={`border-l-4 p-4 sm:p-6 rounded-lg ${
                            question.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          {/* Question Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900 dark:text-white">Question {index + 1}</span>
                              {question.difficulty && (
                                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                              )}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                question.isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {question.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {question.marksObtained || 0}/{question.marks}
                              </span>
                            </div>
                          </div>

                          {/* Question Text */}
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
                            {question.questionText}
                          </h4>

                          {/* Question Image */}
                          {question.questionImage && (
                            <div className="mb-4">
                              <img 
                                src={question.questionImage} 
                                alt="Question" 
                                className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                            </div>
                          )}

                          {/* MCQ Options */}
                          {question.type === 'mcq' && question.options && (
                            <div className="space-y-2 mb-4">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options:</p>
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={option.id || optIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    option.id === question.userAnswer
                                      ? option.isCorrect
                                        ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                                        : 'border-red-500 bg-red-100 dark:bg-red-900/30'
                                      : option.isCorrect
                                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                                      : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm sm:text-base text-gray-900 dark:text-white">
                                      {option.text}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {option.id === question.userAnswer && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded">
                                          Your Answer
                                        </span>
                                      )}
                                      {option.isCorrect && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded">
                                          Correct Answer
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Short Answer */}
                          {question.type === 'short_answer' && (
                            <div className="space-y-3 mb-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer:</p>
                                <div className={`p-3 rounded-lg border ${
                                  question.isCorrect ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                }`}>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {question.userAnswerDisplay}
                                  </p>
                                </div>
                              </div>
                              {!question.isCorrect && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer:</p>
                                  <div className="p-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                      {question.correctAnswerDisplay}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Enhanced Drag and Drop Display */}
                          {question.type === 'drag_drop' && (
                            <div className="mb-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Matches:</p>
                                  <div className={`p-3 rounded-lg border ${
                                    question.isCorrect ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                  }`}>
                                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                      {question.userAnswerDisplay}
                                    </p>
                                  </div>
                                </div>
                                {question.correctAnswerDisplay && question.correctAnswerDisplay !== 'Drag & drop matches available' && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Matches:</p>
                                    <div className="p-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20">
                                      <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                                        {question.correctAnswerDisplay}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {(question.correctMatches || question.totalMatches) && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  Matching Results: {question.correctMatches || 0} out of {question.totalMatches || 0} correct
                                </p>
                              )}
                            </div>
                          )}

                          {/* Time Spent */}
                          {question.timeSpent > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Time spent: {formatTime(question.timeSpent)}
                              </p>
                            </div>
                          )}

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Explanation:</p>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Category Performance */}
                    {reviewData.categoryPerformance && reviewData.categoryPerformance.length > 0 && (
                      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance by Question Type</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {reviewData.categoryPerformance.map((category, index) => (
                            <div key={index} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.category}</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {category.correct}/{category.total}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{category.percentage}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Review Not Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {reviewData ? 'No questions found in the review data.' : 'Detailed review data is not available for this quiz.'}
                    </p>
                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && reviewData && (
                      <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500">Debug: Review Data</summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                          {JSON.stringify(reviewData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Note about review functionality */}
            {!results.reviewEnabled && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">
                    Answer review is not enabled for this quiz by your instructor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}