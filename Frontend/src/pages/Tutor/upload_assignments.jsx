import React, { useState, useEffect } from 'react';
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";
import { BookOpen, Upload, Download, X, Edit, Trash2, FileText, Calendar, Clock } from 'lucide-react';

const UploadAssignments = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  
  // Sample subjects/courses (using the same ones as in lecture materials)
  const courses = [
    { id: 1, name: "Maths", code: "C005" },
    { id: 2, name: "History", code: "C006" },
    { id: 3, name: "Arts", code: "C007" },
    { id: 4, name: "Tamil", code: "C008" },
    { id: 5, name: "IT", code: "C009" },
    { id: 6, name: "Geography", code: "C010" },
    { id: 7, name: "Music", code: "C011" },
    { id: 8, name: "Sinhala", code: "C012" },
  ];

  // Initialize assignments to use local storage data if none exists
  const [assignmentsByCourse, setAssignmentsByCourse] = useState(() => {
    const savedAssignments = localStorage.getItem('studentAssignments');
    return savedAssignments ? JSON.parse(savedAssignments) : {
      1: [
        { 
          id: 1, 
          title: "Algebra Homework", 
          description: "Complete problems 1-20 from Chapter 3", 
          filename: "algebra_hw.pdf", 
          uploadDate: "2025-03-15",
          dueDate: "2025-05-20",
          status: "Submitted"
        },
        { 
          id: 2, 
          title: "Geometry Quiz", 
          description: "Practice quiz on triangles and circles", 
          filename: "geometry_quiz.docx", 
          uploadDate: "2025-03-20",
          dueDate: "2025-05-25",
          status: "Pending"
        }
      ],
      2: [
        { 
          id: 1, 
          title: "History Essay", 
          description: "Write a 500-word essay on Sri Lankan Independence", 
          filename: "history_essay.docx", 
          uploadDate: "2025-03-10",
          dueDate: "2025-05-18",
          status: "Submitted"
        }
      ]
    };
  });

  // Save to whenever assignments change
  useEffect(() => {
    localStorage.setItem('studentAssignments', JSON.stringify(assignmentsByCourse));
  }, [assignmentsByCourse]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedCourse('');
    setFile(null);
    setFileName('');
    if (document.getElementById('file-upload')) {
      document.getElementById('file-upload').value = '';
    }
    setEditMode(false);
    setAssignmentToEdit(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const courseId = parseInt(selectedCourse);
    
    if (!title || !description || !dueDate || (!file && !editMode) || !courseId) {
      setMessage('Please fill in all fields, select a course, and choose a file');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && assignmentToEdit) {
        // Update existing assignment
        const updatedAssignments = {...assignmentsByCourse};
        const assignmentIndex = updatedAssignments[courseId].findIndex(a => a.id === assignmentToEdit.id);
        
        if (assignmentIndex >= 0) {
          updatedAssignments[courseId][assignmentIndex] = {
            ...updatedAssignments[courseId][assignmentIndex],
            title,
            description,
            dueDate,
            filename: fileName || updatedAssignments[courseId][assignmentIndex].filename,
            // Keep original upload date but add "edited" flag
            lastEdited: new Date().toISOString().split('T')[0]
          };
          
          setAssignmentsByCourse(updatedAssignments);
          setMessage('Assignment updated successfully!');
        }
      } else {
        // Create new assignment
        const newAssignment = {
          id: Date.now(),
          title,
          description,
          filename: fileName,
          dueDate,
          uploadDate: new Date().toISOString().split('T')[0],
          status: "Pending"
        };
        
        // Check if course already has assignments
        const updatedAssignments = {...assignmentsByCourse};
        if (!updatedAssignments[courseId]) {
          updatedAssignments[courseId] = [];
        }
        
        // Add new assignment to course
        updatedAssignments[courseId] = [newAssignment, ...(updatedAssignments[courseId] || [])];
        setAssignmentsByCourse(updatedAssignments);
        setMessage('Assignment uploaded successfully!');
      }
      
      resetForm();
    } catch (error) {
      setMessage('Error processing assignment. Please try again.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const openAssignmentsModal = (courseId) => {
    setCurrentCourse(courses.find(course => course.id === courseId));
    setShowModal(true);
  };
  
  const handleEdit = (assignment) => {
    setEditMode(true);
    setAssignmentToEdit(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDueDate(assignment.dueDate);
    setFileName(assignment.filename);
    setSelectedCourse(currentCourse.id.toString());
    setShowModal(false);
    
    // Scroll to form section
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const confirmDelete = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirm(true);
  };
  
  const handleDelete = () => {
    if (assignmentToDelete && currentCourse) {
      const courseId = currentCourse.id;
      const updatedAssignments = {...assignmentsByCourse};
      
      updatedAssignments[courseId] = updatedAssignments[courseId].filter(
        item => item.id !== assignmentToDelete.id
      );
      
      setAssignmentsByCourse(updatedAssignments);
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
      
      // Show temporary message in the modal
      setMessage('Assignment deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAssignmentToDelete(null);
  };
  
  const cancelEdit = () => {
    resetForm();
  };

  // Toggle assignment status (Pending/Submitted)
  const toggleStatus = (courseId, assignmentId) => {
    const updatedAssignments = {...assignmentsByCourse};
    const assignmentIndex = updatedAssignments[courseId].findIndex(a => a.id === assignmentId);
    
    if (assignmentIndex >= 0) {
      const currentStatus = updatedAssignments[courseId][assignmentIndex].status;
      updatedAssignments[courseId][assignmentIndex].status = 
        currentStatus === "Pending" ? "Submitted" : "Pending";
      
      setAssignmentsByCourse(updatedAssignments);
    }
  };

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDateString) => {
    const today = new Date();
    const dueDate = new Date(dueDateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-blue-800 flex items-center">
                <FileText className="mr-2" size={24} />
                Student Assignments
              </h1>
            </div>
          
            {/* Upload Assignments Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center mb-6">
                {editMode ? (
                  <>
                    <Edit className="mr-2" size={20} />
                    Edit Assignment
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={20} />
                    Upload New Assignment
                  </>
                )}
              </h2>
              
              {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label htmlFor="course" className="block text-gray-700 font-medium mb-2">Select Course</label>
                  <select
                    id="course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={editMode}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Assignment Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Assignment Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    placeholder="Enter assignment description and instructions"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="due-date" className="block text-gray-700 font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    id="due-date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="file-upload" className="block text-gray-700 font-medium mb-2">
                    {editMode ? 'File' : 'Upload Assignment File'}
                  </label>
                  {editMode && (
                    <div className="flex items-center mb-2">
                      <span className="text-blue-600">{fileName}</span>
                      <span className="text-gray-500 text-sm ml-2">(Current file)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    required={!editMode}
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {editMode 
                      ? "Upload a new file to replace the current one (optional)" 
                      : "Supported formats: PDF, DOC, DOCX, ZIP, etc."}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center"
                    >
                      <X className="mr-2" size={18} />
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
                  >
                    {editMode ? (
                      <>
                        <Edit className="mr-2" size={18} />
                        Update Assignment
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2" size={18} />
                        {isUploading ? 'Uploading...' : 'Upload Assignment'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Course Assignments Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-6">All Course Assignments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-bold text-lg text-blue-800">{course.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{course.code}</p>
                    <div className="text-xs text-gray-500 mb-4">
                      {assignmentsByCourse[course.id] ? 
                        `${assignmentsByCourse[course.id].length} assignments available` : 
                        'No assignments available'}
                    </div>
                    <button 
                      onClick={() => openAssignmentsModal(course.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      View Assignments
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Modal for displaying course assignments - Background changed to transparent */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-800 text-white">
              <h3 className="text-xl font-semibold">
                {currentCourse ? `${currentCourse.code} - ${currentCourse.name} Assignments` : 'Course Assignments'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
              {message && (
                <div className="p-4 mb-4 rounded bg-blue-100 text-blue-700">
                  {message}
                </div>
              )}
              
              {currentCourse && assignmentsByCourse[currentCourse.id] && assignmentsByCourse[currentCourse.id].length > 0 ? (
                <div className="space-y-4">
                  {assignmentsByCourse[currentCourse.id].map(assignment => {
                    const daysRemaining = getDaysRemaining(assignment.dueDate);
                    const isOverdue = daysRemaining < 0;
                    
                    return (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-semibold text-lg text-blue-800">{assignment.title}</h4>
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              assignment.status === "Submitted" 
                                ? "bg-green-100 text-green-800" 
                                : isOverdue
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {assignment.status === "Submitted" 
                                ? "Submitted" 
                                : isOverdue
                                  ? "Overdue"
                                  : "Pending"
                              }
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{assignment.description}</p>
                          <div className="mt-2 text-sm flex flex-wrap items-center">
                            <span className="text-gray-600 flex items-center mr-4">
                              <Calendar size={14} className="mr-1" />
                              Due: {assignment.dueDate}
                            </span>
                            {assignment.status !== "Submitted" && !isOverdue && (
                              <span className={`flex items-center ${daysRemaining <= 3 ? "text-red-600" : "text-blue-600"}`}>
                                <Clock size={14} className="mr-1" />
                                {daysRemaining} days remaining
                              </span>
                            )}
                            {isOverdue && assignment.status !== "Submitted" && (
                              <span className="text-red-600 flex items-center">
                                <Clock size={14} className="mr-1" />
                                {Math.abs(daysRemaining)} days overdue
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            <span>File: {assignment.filename}</span>
                            <span className="ml-4">Uploaded: {assignment.uploadDate}</span>
                            {assignment.lastEdited && (
                              <span className="ml-4">Edited: {assignment.lastEdited}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => toggleStatus(currentCourse.id, assignment.id)}
                            className={`px-2 py-1 ${
                              assignment.status === "Submitted" 
                                ? "bg-yellow-500 hover:bg-yellow-600" 
                                : "bg-green-500 hover:bg-green-600"
                            } text-white rounded text-sm flex items-center`}
                          >
                            {assignment.status === "Submitted" ? "Mark Pending" : "Mark Submitted"}
                          </button>
                          <button 
                            onClick={() => handleEdit(assignment)}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
                          >
                            <Edit className="mr-1" size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => confirmDelete(assignment)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center"
                          >
                            <Trash2 className="mr-1" size={14} />
                            Delete
                          </button>
                          <button className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center">
                            <Download className="mr-1" size={14} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No assignments available for this course yet.
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal - Also changed to transparent background */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{assignmentToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadAssignments;