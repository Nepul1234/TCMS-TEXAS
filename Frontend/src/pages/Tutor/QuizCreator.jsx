import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Settings, Calendar, Clock, Award, ArrowLeft, CheckCircle, X } from 'lucide-react';
import Header from '../../components/Header/TutorHeader';
import Sidebar from '../../components/Sidebar/TutorSidebar';

export default function QuizCreator() {
  const { id: quizId } = useParams(); // Get quiz ID from URL params
  const navigate = useNavigate();
  const isEditMode = Boolean(quizId);

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: '',
    instructions: '',
    difficulty: 'Medium',
    password: '',
    showResults: true,
    shuffleQuestions: false,
    reviewEnabled: true,
    shuffleAnswers: false,
    maxAttempts: 1,
    passingMarks: 0,
    startDatetime: '',
    endDatetime: '',
    autoSubmit: true
  });

  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]); // New state for courses
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(isEditMode);
  const [coursesLoading, setCoursesLoading] = useState(true); // New state for courses loading
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Helper function to format timestamp for display (converts UTC to local)
  const formatTimestampForDisplay = (utcTimestamp) => {
    if (!utcTimestamp) return '';
    
    const date = new Date(utcTimestamp);
    // This will automatically convert to local timezone
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Helper function to convert UTC datetime to local datetime-local format
  const convertUTCToLocal = (utcDateString) => {
    if (!utcDateString) return '';
    
    // Handle both ISO format and MySQL DATETIME format
    const utcDate = new Date(utcDateString);
    
    // Check if the date is valid
    if (isNaN(utcDate.getTime())) return '';
    
    // Convert to local time and format for datetime-local input
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to convert local datetime-local to UTC
  const convertLocalToUTC = (localDateString) => {
    if (!localDateString) return null;
    
    // Create date object from local datetime-local input
    const localDate = new Date(localDateString);
    
    // Convert to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Helper function to determine correct answer based on question type
  const getCorrectAnswer = (question) => {
    if (question.type === 'short_answer') {
      return question.correctAnswer;
    } else if (question.type === 'mcq') {
      // For MCQ, find the correct option(s) and store as comma-separated string
      const correctOptions = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.text);
      return correctOptions.length > 0 ? correctOptions.join(',') : null;
    } else if (question.type === 'drag_drop') {
      // For drag & drop, store the pairs as JSON string
      const validItems = question.dragDropItems.filter(item => 
        item.itemText && item.itemText.trim() && item.targetText && item.targetText.trim()
      );
      return validItems.length > 0 ? JSON.stringify(validItems) : null;
    }
    return null;
  };

  // Toast function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch('/api/teacher/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setCourses(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('Failed to load courses. Please refresh the page.', 'error');
      // Fallback to empty array
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Load quiz data for edit mode
  useEffect(() => {
    fetchCourses(); // Always fetch courses
    if (isEditMode && quizId) {
      fetchQuizData();
    }
  }, [isEditMode, quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data || !data.success) {
        throw new Error('Invalid response format');
      }
      
      // Fixed: The quiz data is directly in data, not nested
      const quizData = data.data;
      
      console.log('Quiz Data:', quizData);
      console.log('Questions:', quizData.questions);
      
      if (!quizData) {
        throw new Error('Quiz not found');
      }
      
      setQuiz({
        title: quizData.title || '',
        description: quizData.description || '',
        courseId: quizData.course_id || '',
        duration: quizData.duration_minutes || '',
        instructions: quizData.instructions || '',
        difficulty: quizData.difficulty || 'Medium',
        password: quizData.password || '',
        showResults: Boolean(quizData.show_results),
        shuffleQuestions: Boolean(quizData.shuffle_questions),
        reviewEnabled: Boolean(quizData.review_enabled),
        shuffleAnswers: Boolean(quizData.shuffle_answers),
        maxAttempts: quizData.max_attempts || 1,
        passingMarks: quizData.passing_marks || 0,
        // Fixed: Use helper function to convert UTC to local time
        startDatetime: convertUTCToLocal(quizData.start_datetime),
        endDatetime: convertUTCToLocal(quizData.end_datetime),
        autoSubmit: Boolean(quizData.auto_submit)
      });

      const mappedQuestions = (quizData.questions || []).map(q => {
        console.log('Processing question:', q);
        
        // Reconstruct correct answer if it's empty but we have options/dragDropItems
        let correctAnswer = q.correct_answer || '';
        
        // If correctAnswer is empty, try to reconstruct it based on question type
        if (!correctAnswer) {
          if (q.question_type === 'mcq' && q.options) {
            const correctOptions = q.options
              .filter(opt => opt.is_correct)
              .map(opt => opt.option_text);
            correctAnswer = correctOptions.length > 0 ? correctOptions.join(',') : '';
          } else if (q.question_type === 'drag_drop') {
            const items = q.dragDropItems || q.drag_drop_items || [];
            if (items && items.length > 0) {
              const validItems = items.filter(item => 
                (item.item_text || item.itemText) && (item.target_text || item.targetText)
              );
              correctAnswer = validItems.length > 0 ? JSON.stringify(validItems) : '';
            }
          }
        }
        
        return {
          id: q.id,
          type: q.question_type,
          questionText: q.question_text || '',
          marks: q.marks || 1,
          difficulty: q.difficulty || 'Medium',
          explanation: q.explanation || '',
          correctAnswer: correctAnswer,
          isCaseSensitive: Boolean(q.is_case_sensitive),
          options: q.options ? q.options.map(opt => ({
            id: opt.id,
            text: opt.option_text || '',
            isCorrect: Boolean(opt.is_correct)
          })) : [],
          // Enhanced drag & drop mapping with debugging
          dragDropItems: (() => {
            if (q.question_type === 'drag_drop') {
              console.log('Drag drop question found:', q);
              
              // The API returns dragDropItems (camelCase)
              let items = q.dragDropItems || q.drag_drop_items || [];
              
              console.log('Drag drop items:', items);
              
              if (items && items.length > 0) {
                return items.map(item => {
                  console.log('Mapping drag drop item:', item);
                  return {
                    id: item.id || Date.now() + Math.random(),
                    // Fixed: Use the correct API field names
                    itemText: item.item_text || item.itemText || '',
                    targetText: item.target_text || item.targetText || ''
                  };
                });
              }
            }
            return [];
          })()
        };
      });
      
      console.log('Mapped questions:', mappedQuestions);
      setQuestions(mappedQuestions);
      
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      showToast(`Failed to load quiz data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      questionText: '',
      marks: 1,
      difficulty: 'Medium',
      explanation: '',
      correctAnswer: '',
      isCaseSensitive: false,
      options: type === 'mcq' ? [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false }
      ] : [],
      dragDropItems: type === 'drag_drop' ? [
        { id: 1, itemText: '', targetText: '' },
        { id: 2, itemText: '', targetText: '' }
      ] : []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, updates) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!quiz.title.trim()) {
      showToast('Quiz title is required', 'error');
      return false;
    }
    
    if (!quiz.courseId) {
      showToast('Course selection is required', 'error');
      return false;
    }
    
    if (questions.length === 0) {
      showToast('At least one question is required', 'error');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.questionText.trim()) {
        showToast(`Question ${i + 1} text is required`, 'error');
        return false;
      }
      
      if (question.type === 'mcq') {
        if (question.options.length < 2) {
          showToast(`Question ${i + 1} must have at least 2 options`, 'error');
          return false;
        }
        
        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          showToast(`Question ${i + 1} must have at least one correct answer`, 'error');
          return false;
        }
        
        const hasEmptyOption = question.options.some(opt => !opt.text || !opt.text.trim());
        if (hasEmptyOption) {
          showToast(`All options in Question ${i + 1} must have text`, 'error');
          return false;
        }
      }
      
      if (question.type === 'short_answer' && !question.correctAnswer.trim()) {
        showToast(`Question ${i + 1} must have an expected answer`, 'error');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const requestData = {
        title: quiz.title,
        description: quiz.description,
        courseId: quiz.courseId,
        duration: parseInt(quiz.duration) || null,
        instructions: quiz.instructions,
        difficulty: quiz.difficulty,
        password: quiz.password || null,
        show_results: quiz.showResults,
        shuffle_questions: quiz.shuffleQuestions,
        review_enabled: quiz.reviewEnabled,
        shuffle_answers: quiz.shuffleAnswers,
        max_attempts: parseInt(quiz.maxAttempts),
        passing_marks: parseInt(quiz.passingMarks),
        start_datetime: convertLocalToUTC(quiz.startDatetime),
        end_datetime: convertLocalToUTC(quiz.endDatetime),
        auto_submit: quiz.autoSubmit,
        questions: questions.map(q => ({
          type: q.type,
          questionText: q.questionText,
          marks: parseInt(q.marks) || 1,
          difficulty: q.difficulty,
          explanation: q.explanation,
          // FIXED: Use helper function to get correct answer for all question types
          correctAnswer: getCorrectAnswer(q),
          isCaseSensitive: q.isCaseSensitive,
          // Fixed: Safely check for opt.text existence before calling trim()
          options: q.type === 'mcq' ? q.options.filter(opt => opt.text && opt.text.trim()) : undefined,
          // Fixed: Safely check for item properties before calling trim()
          dragDropItems: q.type === 'drag_drop' ? q.dragDropItems.filter(item => 
            item.itemText && item.itemText.trim() && item.targetText && item.targetText.trim()
          ) : undefined
        }))
      };

      const url = isEditMode ? `/api/quizzes/${quizId}` : '/api/quizzes';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save quiz');
      }
      
      showToast(
        isEditMode ? 'Quiz updated successfully!' : 'Quiz created successfully!', 
        'success'
      );
      
      setTimeout(() => {
        navigate('/tutor/quiz_interface');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving quiz:', error);
      showToast(error.message || 'Failed to save quiz', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/tutor/quiz_interface');
  };

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
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: '' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="pt-20 sm:ml-64">
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {isEditMode ? 'Update your quiz settings and questions' : 'Design your quiz with various question types'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                {saving ? 'Saving...' : (isEditMode ? 'Update Quiz' : 'Save Quiz')}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Tabs */}
          <div className="mb-6 sm:mb-8">
            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
              {['basic', 'questions', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quiz.description}
                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={quiz.instructions}
                    onChange={(e) => setQuiz({ ...quiz, instructions: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Instructions for students"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course *
                    </label>
                    <select
                      value={quiz.courseId}
                      onChange={(e) => setQuiz({ ...quiz, courseId: e.target.value })}
                      disabled={coursesLoading}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {coursesLoading ? 'Loading courses...' : 'Select a course'}
                      </option>
                      {courses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.course_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={quiz.duration}
                      onChange={(e) => setQuiz({ ...quiz, duration: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={quiz.difficulty}
                      onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password (Optional)
                    </label>
                    <input
                      type="text"
                      value={quiz.password}
                      onChange={(e) => setQuiz({ ...quiz, password: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password to protect quiz"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={quiz.startDatetime}
                      onChange={(e) => setQuiz({ ...quiz, startDatetime: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={quiz.endDatetime}
                      onChange={(e) => setQuiz({ ...quiz, endDatetime: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Questions ({questions.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addQuestion('mcq')}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Add MCQ
                    </button>
                    <button
                      onClick={() => addQuestion('short_answer')}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Short Answer
                    </button>
                    <button
                      onClick={() => addQuestion('drag_drop')}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Drag & Drop
                    </button>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">
                            Q{index + 1}
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
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Marks:</label>
                            <input
                              type="number"
                              value={question.marks}
                              onChange={(e) => updateQuestion(index, { marks: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            onClick={() => deleteQuestion(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                          rows={2}
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question here"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                          </label>
                          <select
                            value={question.difficulty}
                            onChange={(e) => updateQuestion(index, { difficulty: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Explanation (Optional)
                          </label>
                          <input
                            type="text"
                            value={question.explanation}
                            onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Explanation for the answer"
                          />
                        </div>
                      </div>

                      {question.type === 'mcq' && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">Options *</label>
                          {question.options.map((option, oIndex) => (
                            <div key={option.id} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={option.isCorrect}
                                onChange={() => {
                                  const newOptions = question.options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === oIndex
                                  }));
                                  updateQuestion(index, { options: newOptions });
                                }}
                                className="w-4 h-4 text-blue-600"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[oIndex].text = e.target.value;
                                  updateQuestion(index, { options: newOptions });
                                }}
                                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  onClick={() => {
                                    const newOptions = question.options.filter((_, i) => i !== oIndex);
                                    updateQuestion(index, { options: newOptions });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...question.options, { id: Date.now(), text: '', isCorrect: false }];
                              updateQuestion(index, { options: newOptions });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      {question.type === 'short_answer' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expected Answer *
                            </label>
                            <input
                              type="text"
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter expected answer"
                            />
                          </div>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.isCaseSensitive}
                              onChange={(e) => updateQuestion(index, { isCaseSensitive: e.target.checked })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Case sensitive</span>
                          </label>
                        </div>
                      )}

                      {question.type === 'drag_drop' && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Drag & Drop Pairs
                          </label>
                          {question.dragDropItems.map((pair, pIndex) => (
                            <div key={pair.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <input
                                type="text"
                                value={pair.itemText}
                                onChange={(e) => {
                                  const newPairs = [...question.dragDropItems];
                                  newPairs[pIndex].itemText = e.target.value;
                                  updateQuestion(index, { dragDropItems: newPairs });
                                }}
                                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Draggable item"
                              />
                              <span className="text-gray-500 font-bold hidden sm:inline">→</span>
                              <input
                                type="text"
                                value={pair.targetText}
                                onChange={(e) => {
                                  const newPairs = [...question.dragDropItems];
                                  newPairs[pIndex].targetText = e.target.value;
                                  updateQuestion(index, { dragDropItems: newPairs });
                                }}
                                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Drop target"
                              />
                              {question.dragDropItems.length > 2 && (
                                <button
                                  onClick={() => {
                                    const newPairs = question.dragDropItems.filter((_, i) => i !== pIndex);
                                    updateQuestion(index, { dragDropItems: newPairs });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newPairs = [...question.dragDropItems, { id: Date.now(), itemText: '', targetText: '' }];
                              updateQuestion(index, { dragDropItems: newPairs });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Pair
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Plus className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">Add your first question to get started</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                        <button
                          onClick={() => addQuestion('mcq')}
                          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add MCQ
                        </button>
                        <button
                          onClick={() => addQuestion('short_answer')}
                          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Add Short Answer
                        </button>
                        <button
                          onClick={() => addQuestion('drag_drop')}
                          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                          Add Drag & Drop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quiz Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Show Results Immediately</span>
                      <p className="text-xs text-gray-500">Display score after submission</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={quiz.showResults}
                      onChange={(e) => setQuiz({ ...quiz, showResults: e.target.checked })}
                      className="w-4 h-4 text-blue-600 self-start sm:self-center" 
                    />
                  </label>

                  <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Shuffle Questions</span>
                      <p className="text-xs text-gray-500">Randomize question order</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={quiz.shuffleQuestions}
                      onChange={(e) => setQuiz({ ...quiz, shuffleQuestions: e.target.checked })}
                      className="w-4 h-4 text-blue-600 self-start sm:self-center" 
                    />
                  </label>

                  <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Enable Review Mode</span>
                      <p className="text-xs text-gray-500">Allow students to review answers and explanations after submission</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={quiz.reviewEnabled}
                      onChange={(e) => setQuiz({ ...quiz, reviewEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 self-start sm:self-center" 
                    />
                  </label>

                  <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Shuffle Answer Options</span>
                      <p className="text-xs text-gray-500">Randomize MCQ answer choices for each student</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={quiz.shuffleAnswers}
                      onChange={(e) => setQuiz({ ...quiz, shuffleAnswers: e.target.checked })}
                      className="w-4 h-4 text-blue-600 self-start sm:self-center" 
                    />
                  </label>

                  <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Auto Submit</span>
                      <p className="text-xs text-gray-500">Automatically submit quiz when time expires</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={quiz.autoSubmit}
                      onChange={(e) => setQuiz({ ...quiz, autoSubmit: e.target.checked })}
                      className="w-4 h-4 text-blue-600 self-start sm:self-center" 
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        value={quiz.maxAttempts}
                        onChange={(e) => setQuiz({ ...quiz, maxAttempts: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passing Marks (%)
                      </label>
                      <input
                        type="number"
                        value={quiz.passingMarks}
                        onChange={(e) => setQuiz({ ...quiz, passingMarks: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}