import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus as AddIcon,
  Trash2 as DeleteIcon,
  Pencil as EditIcon,
  GripVertical as DragIndicatorIcon,
  Image as ImageIcon,
  Eye as PreviewIcon,
  Save as SaveIcon,
  X as CloseIcon
} from 'lucide-react';

const QuizCreation = () => {
  // Form handling
  const { register, handleSubmit, control, reset } = useForm();
  
  // State for quizzes list
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [quizPreviewData, setQuizPreviewData] = useState(null);
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  
  // Quiz settings state
  const [quizSettings, setQuizSettings] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    timeLimit: 0,
    attempts: 1,
    gradingMethod: 'highest',
    shuffleQuestions: false,
    showFeedback: false,
    showCorrectAnswers: false,
    courseModule: ''
  });

  // Question types
  const questionTypes = [
    { value: 'multiple-choice-single', label: 'Multiple Choice (Single Answer)' },
    { value: 'multiple-choice-multiple', label: 'Multiple Choice (Multiple Answers)' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ];

  // Handle drag start
  const handleDragStart = (e, index) => {
    setDraggedQuestion(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedQuestion !== null && draggedQuestion !== index) {
      const newQuestions = [...questions];
      const movedQuestion = newQuestions[draggedQuestion];
      newQuestions.splice(draggedQuestion, 1);
      newQuestions.splice(index, 0, movedQuestion);
      setQuestions(newQuestions);
    }
    setDraggedQuestion(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedQuestion(null);
  };

  // Handle quiz settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add a new question
  const addQuestion = () => {
    setEditingQuestion({
      id: Date.now(),
      type: 'multiple-choice-single',
      text: '',
      image: null,
      points: 1,
      options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false }
      ],
      correctAnswer: '',
      feedback: ''
    });
  };

  // Edit existing question
  const editQuestion = (question) => {
    setEditingQuestion(JSON.parse(JSON.stringify(question)));
  };

  // Save question (new or edited)
  const saveQuestion = () => {
    if (editingQuestion) {
      if (editingQuestion.id) {
        // Update existing question
        const index = questions.findIndex(q => q.id === editingQuestion.id);
        if (index >= 0) {
          const updatedQuestions = [...questions];
          updatedQuestions[index] = editingQuestion;
          setQuestions(updatedQuestions);
        } else {
          // Add new question
          setQuestions([...questions, editingQuestion]);
        }
      }
      setEditingQuestion(null);
    }
  };

  // Delete question
  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Add option to multiple choice question
  const addOption = () => {
    setEditingQuestion(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { id: Date.now(), text: '', isCorrect: false }
      ]
    }));
  };

  // Remove option from multiple choice question
  const removeOption = (optionId) => {
    setEditingQuestion(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId)
    }));
  };

  // Handle option change
  const handleOptionChange = (optionId, field, value) => {
    setEditingQuestion(prev => {
      const updatedOptions = prev.options.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, [field]: value };
        }
        return opt;
      });
      
      return { ...prev, options: updatedOptions };
    });
  };

  // Save quiz
  const saveQuiz = () => {
    const newQuiz = {
      ...quizSettings,
      id: currentQuiz?.id || Date.now(),
      questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (currentQuiz) {
      // Update existing quiz
      setQuizzes(quizzes.map(q => q.id === currentQuiz.id ? newQuiz : q));
    } else {
      // Add new quiz
      setQuizzes([...quizzes, newQuiz]);
    }
    
    // Reset form
    setCurrentQuiz(null);
    setQuestions([]);
    setQuizSettings({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      timeLimit: 0,
      attempts: 1,
      gradingMethod: 'highest',
      shuffleQuestions: false,
      showFeedback: false,
      showCorrectAnswers: false,
      courseModule: ''
    });
  };

  // Edit quiz
  const editQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuestions(quiz.questions);
    setQuizSettings({
      name: quiz.name,
      description: quiz.description,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      timeLimit: quiz.timeLimit,
      attempts: quiz.attempts,
      gradingMethod: quiz.gradingMethod,
      shuffleQuestions: quiz.shuffleQuestions,
      showFeedback: quiz.showFeedback,
      showCorrectAnswers: quiz.showCorrectAnswers,
      courseModule: quiz.courseModule
    });
  };

  // Delete quiz
  const deleteQuiz = (id) => {
    setQuizzes(quizzes.filter(q => q.id !== id));
  };

  // Preview quiz handler
  const handlePreviewQuiz = (quiz) => {
    setQuizPreviewData(quiz);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6 ml-1 mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Quiz Settings Form */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                {currentQuiz ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block mb-2">Quiz Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    name="name"
                    value={quizSettings.name}
                    onChange={handleSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="block mb-2">Course Module</label>
                  <select
                    className="w-full p-2 border rounded"
                    name="courseModule"
                    value={quizSettings.courseModule}
                    onChange={handleSettingsChange}
                  >
                    <option value="module1">Module 1</option>
                    <option value="module2">Module 2</option>
                    <option value="module3">Module 3</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-2">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    name="description"
                    value={quizSettings.description}
                    onChange={handleSettingsChange}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block mb-2">Start Time</label>
                      <input
                        type="datetime-local"
                        className="w-full p-2 border rounded"
                        name="startTime"
                        value={quizSettings.startTime}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="block mb-2">End Time</label>
                      <input
                        type="datetime-local"
                        className="w-full p-2 border rounded"
                        name="endTime"
                        value={quizSettings.endTime}
                        onChange={handleSettingsChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="block mb-2">Time Limit (minutes)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      name="timeLimit"
                      value={quizSettings.timeLimit}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block mb-2">Number of Attempts</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      name="attempts"
                      value={quizSettings.attempts}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="block mb-2">Grading Method</label>
                    <select
                      className="w-full p-2 border rounded"
                      name="gradingMethod"
                      value={quizSettings.gradingMethod}
                      onChange={handleSettingsChange}
                    >
                      <option value="highest">Highest Attempt</option>
                      <option value="average">Average of Attempts</option>
                      <option value="first">First Attempt</option>
                      <option value="last">Last Attempt</option>
                    </select>
                  </div>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={quizSettings.shuffleQuestions}
                      onChange={handleSettingsChange}
                      className="form-checkbox"
                    />
                    <span>Shuffle Questions</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="showFeedback"
                      checked={quizSettings.showFeedback}
                      onChange={handleSettingsChange}
                      className="form-checkbox"
                    />
                    <span>Show Feedback</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="showCorrectAnswers"
                      checked={quizSettings.showCorrectAnswers}
                      onChange={handleSettingsChange}
                      className="form-checkbox"
                    />
                    <span>Show Correct Answers</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Questions Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-800">
                  Questions ({questions.length})
                </h2>
                <button
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={addQuestion}
                >
                  <AddIcon className="mr-2" size={18} />
                  Add Question
                </button>
              </div>
              
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions added yet</p>
                </div>
              ) : (
                <div>
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="mb-4"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="mr-2 cursor-move">
                                <DragIndicatorIcon className="text-gray-500" size={18} />
                              </div>
                              <h3 className="text-lg font-medium text-blue-700">
                                Question {index + 1} ({question.points} pts)
                              </h3>
                            </div>
                            <div>
                              <button
                                className="p-1 text-blue-600 hover:text-blue-800"
                                onClick={() => editQuestion(question)}
                              >
                                <EditIcon size={18} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:text-red-800 ml-2"
                                onClick={() => deleteQuestion(question.id)}
                              >
                                <DeleteIcon size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-2 ml-8">
                            {question.text && (
                              <p className="mb-2">
                                {question.text}
                              </p>
                            )}
                            
                            {question.image && (
                              <div className="mb-2">
                                <img 
                                  src={question.image} 
                                  alt="Question" 
                                  className="max-w-full h-auto max-h-48"
                                />
                              </div>
                            )}
                            
                            {question.type.includes('multiple-choice') && (
                              <div className="space-y-2">
                                {question.options.map((option) => (
                                  <div key={option.id} className="flex items-center">
                                    {question.type === 'multiple-choice-single' ? (
                                      <input
                                        type="radio"
                                        checked={option.isCorrect}
                                        disabled
                                        className="mr-2"
                                      />
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        disabled
                                        className="mr-2"
                                      />
                                    )}
                                    <span>{option.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'true-false' && (
                              <div className="ml-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    value="true"
                                    checked={question.correctAnswer === 'true'}
                                    disabled
                                    className="mr-2"
                                  />
                                  <span>True</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    value="false"
                                    checked={question.correctAnswer === 'false'}
                                    disabled
                                    className="mr-2"
                                  />
                                  <span>False</span>
                                </label>
                              </div>
                            )}
                            
                            {(question.type === 'short-answer' || question.type === 'essay') && (
                              <textarea
                                className="w-full p-2 border rounded mt-2"
                                rows={question.type === 'essay' ? 4 : 1}
                                placeholder={question.type === 'essay' ? 'Essay answer...' : 'Short answer...'}
                                disabled
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                onClick={() => {
                  setCurrentQuiz(null);
                  setQuestions([]);
                  setQuizSettings({
                    name: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    timeLimit: 0,
                    attempts: 1,
                    gradingMethod: 'highest',
                    shuffleQuestions: false,
                    showFeedback: false,
                    showCorrectAnswers: false,
                    courseModule: ''
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                onClick={saveQuiz}
                disabled={questions.length === 0}
              >
                <SaveIcon className="mr-2" size={18} />
                {currentQuiz ? 'Update Quiz' : 'Save Quiz'}
              </button>
            </div>
          </div>
          
          {/* Quiz List */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Your Quizzes
            </h2>
            
            {quizzes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No quizzes created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-blue-700">
                            {quiz.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {quiz.courseModule} • {quiz.questions.length} questions
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(quiz.startTime).toLocaleString()} - {new Date(quiz.endTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-blue-600 hover:text-blue-800"
                            onClick={() => handlePreviewQuiz(quiz)}
                          >
                            <PreviewIcon size={18} />
                          </button>
                          <button
                            className="p-1 text-blue-600 hover:text-blue-800"
                            onClick={() => editQuiz(quiz)}
                          >
                            <EditIcon size={18} />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={() => deleteQuiz(quiz.id)}
                          >
                            <DeleteIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Question Edit Dialog */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingQuestion?.id ? 'Edit Question' : 'Add New Question'}
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="block mb-2">Question Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={editingQuestion.type}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      type: e.target.value,
                      options: e.target.value.includes('multiple-choice') 
                        ? editingQuestion.options.length > 0 
                          ? editingQuestion.options 
                          : [
                              { id: 1, text: '', isCorrect: false },
                              { id: 2, text: '', isCorrect: false }
                            ]
                        : [],
                      correctAnswer: ''
                    })}
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block mb-2">Question Text</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={2}
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      text: e.target.value
                    })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="flex items-center px-3 py-1 border rounded"
                    onClick={() => {
                      const dummyImageUrl = 'https://via.placeholder.com/400x200';
                      setEditingQuestion({
                        ...editingQuestion,
                        image: dummyImageUrl
                      });
                    }}
                  >
                    <ImageIcon className="mr-2" size={16} />
                    Add Image
                  </button>
                  {editingQuestion.image && (
                    <button
                      className="text-red-600"
                      onClick={() => setEditingQuestion({
                        ...editingQuestion,
                        image: null
                      })}
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                
                {editingQuestion.image && (
                  <img 
                    src={editingQuestion.image} 
                    alt="Question" 
                    className="max-w-full h-auto max-h-48"
                  />
                )}
                
                <div className="form-group">
                  <label className="block mb-2">Points</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={editingQuestion.points}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      points: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                {/* Options for multiple choice questions */}
                {editingQuestion.type.includes('multiple-choice') && (
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      Options (mark correct answers)
                    </h4>
                    
                    {editingQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        {editingQuestion.type === 'multiple-choice-single' ? (
                          <input
                            type="radio"
                            checked={option.isCorrect}
                            onChange={() => {
                              const updatedOptions = editingQuestion.options.map(opt => ({
                                ...opt,
                                isCorrect: opt.id === option.id
                              }));
                              setEditingQuestion({
                                ...editingQuestion,
                                options: updatedOptions
                              });
                            }}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) => handleOptionChange(
                              option.id,
                              'isCorrect',
                              e.target.checked
                            )}
                          />
                        )}
                        
                        <input
                          type="text"
                          className="flex-1 p-2 border rounded"
                          value={option.text}
                          onChange={(e) => handleOptionChange(
                            option.id,
                            'text',
                            e.target.value
                          )}
                        />
                        
                        <button
                          className="text-red-600"
                          onClick={() => removeOption(option.id)}
                        >
                          <DeleteIcon size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      className="flex items-center text-blue-600"
                      onClick={addOption}
                    >
                      <Plus className="mr-1" size={16} />
                      Add Option
                    </button>
                  </div>
                )}
                
                {/* True/False options */}
                {editingQuestion.type === 'true-false' && (
                  <div>
                    <h4 className="font-medium mb-2">
                      Correct Answer
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="true"
                          checked={editingQuestion.correctAnswer === 'true'}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            correctAnswer: e.target.value
                          })}
                          className="mr-2"
                        />
                        <span>True</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="false"
                          checked={editingQuestion.correctAnswer === 'false'}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            correctAnswer: e.target.value
                          })}
                          className="mr-2"
                        />
                        <span>False</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Feedback */}
                <div className="form-group">
                  <label className="block mb-2">Feedback (optional)</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={2}
                    value={editingQuestion.feedback}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      feedback: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setEditingQuestion(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                onClick={saveQuestion}
                disabled={
                  !editingQuestion.text ||
                  (editingQuestion.type.includes('multiple-choice') && 
                    (editingQuestion.options.length < 2 || 
                     editingQuestion.options.some(opt => !opt.text) ||
                     !editingQuestion.options.some(opt => opt.isCorrect))) ||
                  (editingQuestion.type === 'true-false' && !editingQuestion.correctAnswer)
                }
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quiz Preview Dialog */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                Quiz Preview: {quizPreviewData?.name}
              </h3>
            </div>
            <div className="p-4">
              {quizPreviewData && (
                <div className="space-y-6">
                  <p className="mb-4">
                    {quizPreviewData.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Available:</strong> {new Date(quizPreviewData.startTime).toLocaleString()} - {new Date(quizPreviewData.endTime).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <strong>Time Limit:</strong> {quizPreviewData.timeLimit} minutes
                    </p>
                    <p className="text-sm">
                      <strong>Attempts:</strong> {quizPreviewData.attempts}
                    </p>
                  </div>
                  
                  <hr />
                  
                  <div className="space-y-8">
                    {quizPreviewData.questions.map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <h4 className="text-lg font-medium">
                          Question {index + 1} ({question.points} points)
                        </h4>
                        
                        {question.text && (
                          <p className="mb-2">
                            {question.text}
                          </p>
                        )}
                        
                        {question.image && (
                          <img 
                            src={question.image} 
                            alt="Question" 
                            className="max-w-full h-auto max-h-48"
                          />
                        )}
                        
                        {question.type.includes('multiple-choice') && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={option.id} className="flex items-center">
                                {question.type === 'multiple-choice-single' ? (
                                  <input type="radio" disabled className="mr-2" />
                                ) : (
                                  <input type="checkbox" disabled className="mr-2" />
                                )}
                                <span>
                                  {option.text}
                                  {option.isCorrect && (
                                    <span className="ml-2 text-green-600">✓ Correct</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'true-false' && (
                          <div className="ml-4">
                            <div className="flex items-center">
                              <input type="radio" disabled className="mr-2" />
                              <span>
                                True
                                {question.correctAnswer === 'true' && (
                                  <span className="ml-2 text-green-600">✓ Correct</span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <input type="radio" disabled className="mr-2" />
                              <span>
                                False
                                {question.correctAnswer === 'false' && (
                                  <span className="ml-2 text-green-600">✓ Correct</span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {(question.type === 'short-answer' || question.type === 'essay') && (
                          <textarea
                            className="w-full p-2 border rounded mt-2"
                            rows={question.type === 'essay' ? 4 : 1}
                            placeholder={question.type === 'essay' ? 'Type your essay answer here...' : 'Type your short answer here...'}
                          />
                        )}
                        
                        {question.feedback && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Feedback:</strong> {question.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCreation;