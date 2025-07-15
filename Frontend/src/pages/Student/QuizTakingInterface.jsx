import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Save, Send, AlertCircle, Flag, X, Check, AlertTriangle, GripVertical, CheckCircle, XCircle, Award } from 'lucide-react';
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';

export default function QuizTakingInterface({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // Default 1 hour
  const [quizStartTime, setQuizStartTime] = useState(null); // Track when quiz actually started
  const [questionStartTimes, setQuestionStartTimes] = useState({}); // Track when each question was first accessed

  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showInstructions, setShowInstructions] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);
  
  // Get student ID and quiz ID from URL params or props
  const studentId = 'TE0001';
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuizId = quizId || urlParams.get('quizId') || localStorage.getItem('currentQuizId');
  const urlAttemptId = urlParams.get('attemptId') || localStorage.getItem('currentAttemptId');

  // Modified useEffect to handle loading states properly
  useEffect(() => {
    console.log('Component mounted with Quiz ID:', currentQuizId);
    
    // If we have an existing attempt ID, skip instructions and load questions
    if (urlAttemptId) {
      setAttemptId(urlAttemptId);
      setShowInstructions(false);
      loadQuizData();
      setLoadingQuestions(true);
      loadRealQuestions(urlAttemptId);
    } else {
      // Just load quiz data for instructions
      if (currentQuizId) {
        loadQuizData();
      } else {
        // Set a basic quiz object if no ID available
        setQuiz({
          id: '1',
          title: 'Test Quiz',
          description: 'A test quiz for debugging',
          instructions: 'This is a test quiz. Answer all questions to the best of your ability.',
          duration: 60,
          totalMarks: 100,
          questionCount: 5,
          attemptsUsed: 0,
          maxAttempts: 3
        });
        setLoading(false);
      }
    }
  }, [currentQuizId, urlAttemptId]);

  const loadQuizData = async () => {
    try {
      console.log('Loading quiz data for ID:', currentQuizId);
      
      const response = await fetch(`/api/quiz/${currentQuizId}/student/${studentId}/attempt-info`);
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.success) {
          setQuiz(data.data);
          setTimeRemaining(data.data.duration * 60);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading quiz data:', err);
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    console.log('Starting quiz...');
    setShowInstructions(false);
    setLoadingQuestions(true);
    
    // Start the real quiz attempt
    try {
      await startRealQuizAttempt();
    } catch (err) {
      console.error('Failed to start quiz attempt:', err);
      // Show error state instead of mock data
      setError('Failed to start quiz. Please try again.');
      setLoadingQuestions(false);
    }
  };

  const startRealQuizAttempt = async () => {
    try {
      const response = await fetch('/api/quiz/start-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: currentQuizId,
          studentId: studentId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttemptId(data.data.attemptId);
          
          // Store attempt ID for results page
          localStorage.setItem('currentAttemptId', data.data.attemptId);
          localStorage.setItem('currentQuizId', currentQuizId);
          
          await loadRealQuestions(data.data.attemptId);
        } else {
          throw new Error(data.message || 'Failed to start quiz attempt');
        }
      } else {
        throw new Error('Failed to start quiz attempt');
      }
    } catch (err) {
      console.error('Error starting quiz attempt:', err);
      throw err;
    }
  };

  const loadRealQuestions = async (attemptId) => {
    try {
      console.log('🔄 Loading questions for quiz-taking mode...');
      const response = await fetch(`/api/quiz/${currentQuizId}/attempt/${attemptId}/questions`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Raw questions API response:', data);
        
        if (data.success && data.data.length > 0) {
          const formattedQuestions = await Promise.all(data.data.map(async (q) => {
            console.log('🔄 Processing question for quiz-taking:', q);
            
            // Handle different possible data structures for drag & drop
            let dragItems = [];
            let dropZones = [];
            let dragDropType = 'matching'; // default type
            
            if (q.question_type === 'drag_drop' || q.type === 'drag_drop') {
              console.log('🎯 Found drag & drop question, checking data structure...');
              
              // Method 1: Check for dragItems (your actual API structure)
              if (q.dragItems && Array.isArray(q.dragItems) && q.dragItems.length > 0) {
                console.log('✅ Method 1: Found dragItems array:', q.dragItems);
                dragDropType = 'matching';
                
                dragItems = q.dragItems.map((item, index) => ({
                  id: `item_${item.match_id || index + 1}`,
                  text: item.item_text,
                  type: 'draggable',
                  match_id: item.match_id || index + 1,
                  order_index: item.order_index,
                  originalItem: item
                }));
                
                dropZones = q.dragItems.map((item, index) => ({
                  id: `target_${item.match_id || index + 1}`,
                  text: item.target_text,
                  accepts: [],
                  match_id: item.match_id || index + 1,
                  order_index: item.order_index,
                  correctItemId: `item_${item.match_id || index + 1}`,
                  originalItem: item
                }));
              }
              
              // Method 2: Check for drag_drop_items (alternative structure)
              else if (q.drag_drop_items && Array.isArray(q.drag_drop_items) && q.drag_drop_items.length > 0) {
                console.log('✅ Method 2: Found drag_drop_items:', q.drag_drop_items);
                dragDropType = 'matching';
                
                dragItems = q.drag_drop_items.map(item => ({
                  id: `item_${item.id}`,
                  text: item.item_text || item.text || `Item ${item.id}`,
                  type: 'draggable',
                  match_id: item.match_id || item.id,
                  originalItem: item
                }));
                
                dropZones = q.drag_drop_items.map(item => ({
                  id: `target_${item.id}`,
                  text: item.target_text || item.target || `Target ${item.id}`,
                  accepts: [],
                  match_id: item.match_id || item.id,
                  correctItemId: `item_${item.id}`,
                  originalItem: item
                }));
              }
              
              // Method 3: Check if options contain drag & drop data
              else if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                console.log('🔄 Method 3: Checking options for drag & drop data:', q.options);
                
                const hasMatchingData = q.options.some(opt => 
                  opt.item_text || opt.target_text || opt.match_id || 
                  opt.draggable_text || opt.drop_zone_text
                );
                
                if (hasMatchingData) {
                  console.log('✅ Method 3: Found drag & drop data in options');
                  dragDropType = 'matching';
                  
                  dragItems = q.options.map(opt => ({
                    id: `item_${opt.id}`,
                    text: opt.item_text || opt.draggable_text || opt.option_text || opt.text || `Item ${opt.id}`,
                    type: 'draggable',
                    match_id: opt.match_id || opt.id,
                    originalItem: opt
                  }));
                  
                  dropZones = q.options.map(opt => ({
                    id: `target_${opt.id}`,
                    text: opt.target_text || opt.drop_zone_text || opt.target || `Target ${opt.id}`,
                    accepts: [],
                    match_id: opt.match_id || opt.id,
                    correctItemId: `item_${opt.id}`,
                    originalItem: opt
                  }));
                }
              }
              
              // Method 4: Try separate API endpoint
              else {
                console.log('🌐 Method 4: Trying separate drag & drop API...');
                try {
                  const dragDropResponse = await fetch(`/api/quiz/question/${q.id}/drag-drop-items`);
                  if (dragDropResponse.ok) {
                    const dragDropData = await dragDropResponse.json();
                    console.log('📥 Separate API response:', dragDropData);
                    
                    if (dragDropData.success && dragDropData.data && dragDropData.data.length > 0) {
                      console.log('✅ Method 4: Success!');
                      dragDropType = 'matching';
                      
                      dragItems = dragDropData.data.map(item => ({
                        id: `item_${item.id}`,
                        text: item.item_text || item.text || `Item ${item.id}`,
                        type: 'draggable',
                        match_id: item.match_id || item.id,
                        originalItem: item
                      }));
                      
                      dropZones = dragDropData.data.map(item => ({
                        id: `target_${item.id}`,
                        text: item.target_text || item.target || `Target ${item.id}`,
                        accepts: [],
                        match_id: item.match_id || item.id,
                        correctItemId: `item_${item.id}`,
                        originalItem: item
                      }));
                    }
                  }
                } catch (err) {
                  console.error('❌ Method 4: API call failed:', err);
                }
              }
              
              // Show debugging info if no data found
              if (dragItems.length === 0) {
                console.log('❌ No drag & drop data found. Expected structures:');
                console.log('  1. question.dragItems[{item_text, target_text, match_id}]');
                console.log('  2. question.drag_drop_items[{id, item_text, target_text, match_id}]');
                console.log('  3. question.options[{id, item_text, target_text, match_id}]');
                console.log('  4. Separate API: /api/quiz/question/{id}/drag-drop-items');
                console.log('  Current question structure keys:', Object.keys(q));
              }
              
              console.log('📊 Final drag & drop processing result:');
              console.log(`  Found ${dragItems.length} drag items and ${dropZones.length} drop zones`);
              if (dragItems.length > 0) {
                console.log('  dragItems:', dragItems);
                console.log('  dropZones:', dropZones);
              }
            }
            
            // Return formatted question for quiz-taking interface
            return {
              id: q.id,
              type: q.question_type || q.type,
              questionText: q.question_text || q.questionText,
              questionImage: q.question_image || q.questionImage,
              marks: q.marks,
              options: q.options || [],
              dragItems: dragItems,
              dropZones: dropZones,
              dragDropType: dragDropType,
              drag_drop_items: q.drag_drop_items
            };
          }));
          
          console.log('✅ All questions formatted for quiz-taking:', formattedQuestions);
          setQuestions(formattedQuestions);
          
          // Initialize answers for drag and drop questions
          const initialAnswers = {};
          formattedQuestions.forEach(q => {
            if (q.type === 'drag_drop') {
              initialAnswers[q.id] = {};
            }
          });
          setAnswers(prev => ({ ...prev, ...initialAnswers }));
          
          // 🔧 FIXED: Set quiz start time when questions are loaded and quiz actually begins
          setQuizStartTime(Date.now());
          console.log('⏰ Quiz start time recorded:', new Date().toISOString());
          
          setLoadingQuestions(false);
        } else {
          throw new Error('No questions found in API response');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setError(`Failed to load questions: ${err.message}`);
      setLoadingQuestions(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || !attemptId) return;

    if (timeRemaining === 300) {
      setShowWarning(true);
      setWarningMessage('5 minutes remaining! Please review your answers.');
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timeRemaining, attemptId]);

  // Drag and Drop Handlers
  const handleDragStart = (e, item, questionId) => {
    setDraggedItem({ item, questionId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, zoneId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zoneId);
  };

  const handleDragLeave = (e) => {
    setDragOverZone(null);
  };

  const handleDrop = (e, dropZone, questionId) => {
    e.preventDefault();
    setDragOverZone(null);
    
    if (!draggedItem || draggedItem.questionId !== questionId) return;
    
    const { item } = draggedItem;
    const currentAnswers = answers[questionId] || {};
    
    // Remove item from any previous drop zone
    Object.keys(currentAnswers).forEach(zoneId => {
      if (currentAnswers[zoneId] === item.id) {
        delete currentAnswers[zoneId];
      }
    });
    
    // Add item to new drop zone
    currentAnswers[dropZone.id] = item.id;
    
    // Convert to backend format for drag & drop
    const question = questions.find(q => q.id === questionId);
    if (question && question.type === 'drag_drop') {
      // Convert from ID-based format to text-based format for backend
      const textBasedAnswers = {};
      Object.keys(currentAnswers).forEach(zoneId => {
        const itemId = currentAnswers[zoneId];
        const zone = question.dropZones?.find(z => z.id === zoneId);
        const dragItem = question.dragItems?.find(i => i.id === itemId);
        
        if (zone && dragItem) {
          // Use actual text values instead of IDs
          textBasedAnswers[zone.text] = dragItem.text;
        }
      });
      
      console.log('Converted drag & drop answer:', {
        originalFormat: currentAnswers,
        backendFormat: textBasedAnswers
      });
      
      // Save in both formats - currentAnswers for UI, textBasedAnswers for backend
      handleAnswerChange(questionId, currentAnswers, textBasedAnswers);
    } else {
      handleAnswerChange(questionId, currentAnswers);
    }
    
    setDraggedItem(null);
  };

  const removeFromDropZone = (questionId, zoneId) => {
    const currentAnswers = { ...(answers[questionId] || {}) };
    delete currentAnswers[zoneId];
    handleAnswerChange(questionId, currentAnswers);
  };

  const getDroppedItem = (questionId, zoneId) => {
    const questionAnswers = answers[questionId] || {};
    const itemId = questionAnswers[zoneId];
    if (!itemId) return null;
    
    const question = questions.find(q => q.id === questionId);
    return question?.dragItems?.find(item => item.id === itemId);
  };

  const getAvailableItems = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.dragItems) return [];
    
    const questionAnswers = answers[questionId] || {};
    const usedItems = new Set(Object.values(questionAnswers));
    
    return question.dragItems.filter(item => !usedItems.has(item.id));
  };

  // Utility functions
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 🔧 FIXED: Calculate actual time spent using quiz start time
  const calculateTimeSpent = () => {
    if (!quizStartTime) {
      console.warn('⚠️ Quiz start time not recorded, using fallback calculation');
      // Fallback: use duration minus remaining time
      return quiz?.duration ? (quiz.duration * 60 - timeRemaining) : 0;
    }
    
    const timeSpentMs = Date.now() - quizStartTime;
    const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
    
    console.log('⏰ Time calculation:', {
      quizStartTime: new Date(quizStartTime).toISOString(),
      currentTime: new Date().toISOString(),
      timeSpentMs,
      timeSpentSeconds,
      timeSpentMinutes: Math.floor(timeSpentSeconds / 60)
    });
    
    return timeSpentSeconds;
  };

  // 🔧 FIXED: Track question access times and calculate per-question time
  const trackQuestionAccess = (questionId) => {
    if (!questionStartTimes[questionId]) {
      const currentTime = Date.now();
      setQuestionStartTimes(prev => ({
        ...prev,
        [questionId]: currentTime
      }));
      console.log(`⏰ Started tracking time for question ${questionId}:`, new Date(currentTime).toISOString());
    }
  };

  const calculateTimeSpentForQuestion = (questionId) => {
    const questionStartTime = questionStartTimes[questionId];
    if (!questionStartTime) {
      console.warn(`⚠️ No start time recorded for question ${questionId}`);
      return 0;
    }
    
    const timeSpentMs = Date.now() - questionStartTime;
    const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
    
    console.log(`⏰ Time spent on question ${questionId}:`, {
      questionStartTime: new Date(questionStartTime).toISOString(),
      currentTime: new Date().toISOString(),
      timeSpentSeconds,
      timeSpentMinutes: Math.floor(timeSpentSeconds / 60)
    });
    
    return timeSpentSeconds;
  };

  // Enhanced answer change handler with special handling for drag & drop
  const handleAnswerChange = async (questionId, answer, backendAnswer = null) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Track when this question was first accessed
    trackQuestionAccess(questionId);
    
    // Auto-save in background with correct format for your backend
    if (attemptId && attemptId !== 'test-attempt-123') {
      try {
        setSaving(true);
        
        const question = questions.find(q => q.id === questionId);
        
        // Use backendAnswer if provided (for drag & drop), otherwise format normally
        const formattedAnswer = backendAnswer 
          ? { text: null, optionId: null, dragMatches: backendAnswer }
          : formatAnswerForBackend(question, answer);
        
        // 🔧 FIXED: Calculate actual time spent on this specific question
        const timeSpentOnQuestion = calculateTimeSpentForQuestion(questionId);
        
        console.log('Auto-saving answer to /api/quiz/submit-answer:', {
          attemptId,
          questionId,
          answer: formattedAnswer,
          timeSpent: timeSpentOnQuestion,
          questionType: question?.type
        });
        
        // Use the correct endpoint that matches your backend
        const response = await fetch('/api/quiz/submit-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId: attemptId,
            questionId: questionId,
            answer: formattedAnswer,
            timeSpent: timeSpentOnQuestion
          })
        });
        
        if (!response.ok) {
          console.warn('Failed to auto-save answer:', response.status);
          const errorText = await response.text();
          console.warn('Error response:', errorText);
        } else {
          const result = await response.json();
          console.log('✅ Answer saved successfully with time:', result);
        }
      } catch (err) {
        console.error('❌ Error auto-saving answer:', err);
        // Don't show error to user for auto-save failures
      } finally {
        setSaving(false);
      }
    } else {
      console.log('Skipping auto-save for test attempt:', attemptId);
    }
  };

  // Helper function to format answers for your backend API
  const formatAnswerForBackend = (question, answer) => {
    if (!question) {
      console.log('No question found, using text format');
      return { text: String(answer || '') };
    }
    
    console.log(`Formatting answer for question type: ${question.type}`, answer);
    
    switch (question.type) {
      case 'mcq':
        // For MCQ: send selected option ID
        console.log('Formatting MCQ answer:', answer);
        return {
          optionId: answer,
          text: null,
          dragMatches: null
        };
        
      case 'short_answer':
        // For short answer: send text
        console.log('Formatting short answer:', answer);
        return {
          text: String(answer || ''),
          optionId: null,
          dragMatches: null
        };
        
      case 'drag_drop':
        // For drag & drop: convert IDs to text values that backend expects
        if (answer && typeof answer === 'object') {
          const textBasedAnswers = {};
          
          Object.keys(answer).forEach(zoneId => {
            const itemId = answer[zoneId];
            const zone = question?.dropZones?.find(z => z.id === zoneId);
            const dragItem = question?.dragItems?.find(i => i.id === itemId);
            
            if (zone && dragItem) {
              // Use actual text values instead of IDs
              textBasedAnswers[zone.text] = dragItem.text;
            }
          });
          
          console.log('Formatting drag & drop answer - converted IDs to text:', textBasedAnswers);
          return {
            text: null,
            optionId: null,
            dragMatches: textBasedAnswers
          };
        } else {
          return {
            text: null,
            optionId: null,
            dragMatches: {}
          };
        }
        
      default:
        // For any other type: send as text
        console.log('Formatting unknown type as text:', answer);
        return {
          text: String(answer || ''),
          optionId: null,
          dragMatches: null
        };
    }
  };

  // 🔧 FIXED: Simple submission handler with correct time calculation
  const handleSubmit = async () => {
    console.log('Submitting quiz...');
    console.log('Current answers:', answers);
    
    setSubmitting(true);
    
    try {
      // Clear the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (attemptId && attemptId !== 'test-attempt-123') {
        console.log('Submitting to real API...');
        
        // 🔧 FIXED: Calculate actual time spent using quiz start time
        const timeSpentSeconds = calculateTimeSpent();
        
        console.log('📊 Final time calculation:', {
          timeSpentSeconds,
          timeSpentMinutes: Math.floor(timeSpentSeconds / 60),
          quizDurationMinutes: quiz?.duration,
          quizStartTime: quizStartTime ? new Date(quizStartTime).toISOString() : 'Not recorded'
        });
        
        const response = await fetch(`/api/quiz/attempt/${attemptId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeSpent: timeSpentSeconds
          })
        });

        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('API Response:', result);
          
          if (result.success) {
            console.log('Quiz submitted successfully, redirecting to results...');
            window.location.href = `/student/results?attemptId=${attemptId}&quizId=${currentQuizId}`;
            return;
          } else {
            console.error('API returned success: false', result);
            alert('Failed to submit quiz: ' + (result.message || 'Unknown error'));
            setSubmitting(false);
            return;
          }
        } else {
          console.error('API request failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          alert('Failed to submit quiz. Please try again.');
          setSubmitting(false);
          return;
        }
      }
      
      // Fallback for testing with mock data
      console.log('Using localStorage fallback for testing...');
      localStorage.setItem('currentAttemptId', attemptId);
      localStorage.setItem('currentQuizId', currentQuizId);
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
      
      window.location.href = `/results?attemptId=${attemptId}&quizId=${currentQuizId}`;
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Error submitting quiz. Please try again.');
      setSubmitting(false);
    }
  };

  // Enhanced auto-submit function
  const handleAutoSubmit = () => {
    console.log('Auto-submitting quiz due to time expiry');
    setWarningMessage('Time has expired! Submitting your quiz automatically...');
    setShowWarning(true);
    
    // Auto-submit after showing warning briefly
    setTimeout(() => {
      setShowWarning(false);
      handleSubmit();
    }, 2000);
  };

  const toggleFlag = (questionIndex) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    if (!question) return 'unanswered';
    if (flaggedQuestions.has(index)) return 'flagged';
    
    const answer = answers[question.id];
    if (question.type === 'drag_drop') {
      return answer && Object.keys(answer).length > 0 ? 'answered' : 'unanswered';
    }
    
    return answer ? 'answered' : 'unanswered';
  };

  const getAnsweredCount = () => {
    return questions.filter(q => {
      const answer = answers[q.id];
      if (q.type === 'drag_drop') {
        return answer && Object.keys(answer).length > 0;
      }
      return answer;
    }).length;
  };

  const canSubmit = () => {
    return getAnsweredCount() > 0;
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const newQuestionIndex = currentQuestion + 1;
      const questionId = questions[newQuestionIndex]?.id;
      setCurrentQuestion(newQuestionIndex);
      
      // Track when this question is accessed
      if (questionId) {
        trackQuestionAccess(questionId);
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      const newQuestionIndex = currentQuestion - 1;
      const questionId = questions[newQuestionIndex]?.id;
      setCurrentQuestion(newQuestionIndex);
      
      // Track when this question is accessed
      if (questionId) {
        trackQuestionAccess(questionId);
      }
    }
  };

  console.log('Rendering - Loading:', loading, 'LoadingQuestions:', loadingQuestions, 'Quiz:', !!quiz, 'Questions:', questions.length);

  // Loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Sidebar />
        <div className="pt-20 sm:ml-64">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
            </div>
          </div>
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
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setLoadingQuestions(true);
                  if (attemptId) {
                    loadRealQuestions(attemptId);
                  } else {
                    handleStartQuiz();
                  }
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Sidebar />

      {/* Instructions Modal */}
      {showInstructions && quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Instructions</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{quiz.instructions}</p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>• Duration: {quiz.duration} minutes</p>
              <p>• Total Marks: {quiz.totalMarks}</p>
              <p>• Questions: {quiz.questionCount}</p>
              <p>• Attempt: {quiz.attemptsUsed + 1} of {quiz.maxAttempts}</p>
            </div>
            <button
              onClick={handleStartQuiz}
              disabled={loadingQuestions}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loadingQuestions ? 'Starting Quiz...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Warning</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20 sm:ml-64">
        {showInstructions ? null : loadingQuestions ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-800">No questions available for this quiz.</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{quiz?.title}</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Question {currentQuestion + 1} of {questions.length} • {getAnsweredCount()} answered
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    {saving && (
                      <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                        Saving...
                      </span>
                    )}
                    <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg ${
                      timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-mono font-medium text-sm sm:text-base">{formatTime(timeRemaining)}</span>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit() || submitting}
                      className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Question Navigation */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:sticky lg:top-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Question Navigator</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, index) => {
                        const status = getQuestionStatus(index);
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setCurrentQuestion(index);
                              // Track when this question is accessed via navigator
                              trackQuestionAccess(q.id);
                            }}
                            className={`relative p-2 text-sm font-medium rounded-lg transition-colors ${
                              currentQuestion === index
                                ? 'bg-blue-600 text-white'
                                : status === 'answered'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : status === 'flagged'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}
                            {status === 'flagged' && (
                              <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Answered ({getAnsweredCount()})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Not Answered ({questions.length - getAnsweredCount()})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 rounded relative">
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-600" />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">Flagged ({flaggedQuestions.size})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                    {questions[currentQuestion] && (
                      <>
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                questions[currentQuestion].type === 'mcq' ? 'bg-green-100 text-green-800' :
                                questions[currentQuestion].type === 'short_answer' ? 'bg-purple-100 text-purple-800' :
                                questions[currentQuestion].type === 'drag_drop' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {questions[currentQuestion].type === 'mcq' ? 'Multiple Choice' :
                                 questions[currentQuestion].type === 'short_answer' ? 'Short Answer' :
                                 questions[currentQuestion].type === 'drag_drop' ? 'Drag & Drop' :
                                 questions[currentQuestion].type}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {questions[currentQuestion].marks} {questions[currentQuestion].marks === 1 ? 'mark' : 'marks'}
                              </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                              {questions[currentQuestion].questionText}
                            </h2>
                          </div>
                          <button
                            onClick={() => toggleFlag(currentQuestion)}
                            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                              flaggedQuestions.has(currentQuestion)
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Answer Area */}
                        <div className="mb-6 sm:mb-8">
                          {/* Multiple Choice Questions */}
                          {questions[currentQuestion].type === 'mcq' && (
                            <div className="space-y-3">
                              {questions[currentQuestion].options?.map((option) => (
                                <label
                                  key={option.id}
                                  className="flex items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${questions[currentQuestion].id}`}
                                    value={option.id}
                                    checked={answers[questions[currentQuestion].id] === option.id}
                                    onChange={() => handleAnswerChange(questions[currentQuestion].id, option.id)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="ml-3 text-sm sm:text-base text-gray-900 dark:text-white">
                                    {option.option_text || option.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Short Answer Questions */}
                          {questions[currentQuestion].type === 'short_answer' && (
                            <div>
                              <textarea
                                value={answers[questions[currentQuestion].id] || ''}
                                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                                rows={4}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Type your answer here..."
                              />
                              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                                Characters: {(answers[questions[currentQuestion].id] || '').length}
                              </div>
                            </div>
                          )}

                          {/* Drag and Drop Questions */}
                          {questions[currentQuestion].type === 'drag_drop' && (
                            <div className="space-y-6">
                              {/* Instructions */}
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  <strong>Instructions:</strong> Drag items from the left side to any drop zone on the right. 
                                  You can move items between zones or remove them by clicking the X button.
                                </p>
                              </div>

                              {/* Check if we have dragItems and dropZones */}
                              {(!questions[currentQuestion].dragItems || questions[currentQuestion].dragItems.length === 0) ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <p className="text-yellow-800 mb-2">
                                    <strong>🔍 Debugging: No drag items found.</strong>
                                  </p>
                                  <details className="text-sm">
                                    <summary className="cursor-pointer text-yellow-700 hover:text-yellow-900">
                                      Click to see question data structure
                                    </summary>
                                    <div className="mt-2 p-2 bg-white rounded border">
                                      <p><strong>Question ID:</strong> {questions[currentQuestion].id}</p>
                                      <p><strong>Question Type:</strong> {questions[currentQuestion].type}</p>
                                      <p><strong>Has drag_drop_items:</strong> {questions[currentQuestion].drag_drop_items ? 'Yes' : 'No'}</p>
                                      <p><strong>Has options:</strong> {questions[currentQuestion].options ? 'Yes' : 'No'}</p>
                                      {questions[currentQuestion].drag_drop_items && (
                                        <div>
                                          <p><strong>drag_drop_items:</strong></p>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(questions[currentQuestion].drag_drop_items, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {questions[currentQuestion].options && (
                                        <div>
                                          <p><strong>options:</strong></p>
                                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                            {JSON.stringify(questions[currentQuestion].options, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </details>
                                  <div className="mt-3 text-sm">
                                    <p><strong>Expected data structure (one of these):</strong></p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                      <li><code>question.dragItems[].item_text</code> and <code>target_text</code></li>
                                      <li><code>question.drag_drop_items[].item_text</code> and <code>target_text</code></li>
                                      <li><code>question.options[].item_text</code> and <code>target_text</code></li>
                                      <li>Separate API: <code>/api/quiz/question/{`{id}`}/drag-drop-items</code></li>
                                    </ul>
                                  </div>
                                </div>
                              ) : !questions[currentQuestion].dropZones || questions[currentQuestion].dropZones.length === 0 ? (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <p className="text-orange-800">
                                    <strong>🔍 Debugging: No drop zones found.</strong>
                                  </p>
                                  <p className="text-sm mt-1">Found {questions[currentQuestion].dragItems?.length || 0} drag items but no drop zones.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Available Items */}
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                      Available Items ({questions[currentQuestion].dragItems?.length || 0} total)
                                    </h3>
                                    <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                      <div className="space-y-2">
                                        {getAvailableItems(questions[currentQuestion].id).map((item) => (
                                          <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item, questions[currentQuestion].id)}
                                            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:shadow-md transition-shadow"
                                          >
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                              {item.text || item.item_text || item.option_text || `Item ${item.id}`}
                                            </span>
                                          </div>
                                        ))}
                                        {getAvailableItems(questions[currentQuestion].id).length === 0 && (
                                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                                            All items have been placed.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Drop Zones */}
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                      Drop Zones ({questions[currentQuestion].dropZones?.length || 0} total)
                                    </h3>
                                    <div className="space-y-3">
                                      {questions[currentQuestion].dropZones?.map((zone) => {
                                        const droppedItem = getDroppedItem(questions[currentQuestion].id, zone.id);
                                        const isOver = dragOverZone === zone.id;
                                        
                                        return (
                                          <div
                                            key={zone.id}
                                            onDragOver={(e) => handleDragOver(e, zone.id)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, zone, questions[currentQuestion].id)}
                                            className={`min-h-[60px] p-4 border-2 border-dashed rounded-lg transition-colors ${
                                              isOver
                                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                : droppedItem
                                                ? 'border-gray-400 bg-gray-50 dark:bg-gray-700/50'
                                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                                            }`}
                                          >
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                              {zone.text}
                                            </div>
                                            
                                            {droppedItem ? (
                                              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                  {droppedItem.text}
                                                </span>
                                                <button
                                                  onClick={() => removeFromDropZone(questions[currentQuestion].id, zone.id)}
                                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                  <X className="w-4 h-4" />
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Drop any item here
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={prevQuestion}
                            disabled={currentQuestion === 0}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            Previous
                          </button>
                          
                          <div className="flex items-center gap-2">
                            {(() => {
                              const answer = answers[questions[currentQuestion].id];
                              const hasAnswer = questions[currentQuestion].type === 'drag_drop' 
                                ? answer && Object.keys(answer).length > 0
                                : answer;
                              return hasAnswer && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
                            })()}
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {currentQuestion + 1} of {questions.length}
                            </span>
                          </div>

                          <button
                            onClick={nextQuestion}
                            disabled={currentQuestion === questions.length - 1}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}