import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import { Calendar, Clock, Link2, BookOpen, Trash2, Edit, Upload, Check, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VirtualClasses() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [publishedClasses, setPublishedClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateClass, setStatusUpdateClass] = useState(null);

  // Sample course list  
  const courses = [
    'Mathematics',
    'History',
    'Art',
    'Science',
    'ICT'
  ];

  // Updated API URL to match backend routes
  const API_URL = '/api/virtual-classes';

  // Fetch all virtual classes from the API
  useEffect(() => {
    fetchVirtualClasses();
  }, []);

  const fetchVirtualClasses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setPublishedClasses(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching virtual classes:", err);
      setError("Failed to load virtual classes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedDate || !selectedTime || !selectedCourse || !meetingLink) {
      setAlertMessage('Please fill all the fields before publishing');
      setShowAlert(true);
      return;
    }

    try {
      const classData = {
        course: selectedCourse,
        date: selectedDate,
        time: selectedTime,
        link: meetingLink,
        status: 'upcoming'
      };

      let response;
      let successMessage;

      if (editMode && currentEditId) {
        // Update existing class via PUT request
        response = await fetch(`${API_URL}/${currentEditId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classData),
        });
        successMessage = `Virtual class for ${selectedCourse} updated successfully`;
      } else {
        // Create new class via POST request
        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classData),
        });
        successMessage = `Virtual class link for ${selectedCourse} published successfully for ${selectedDate} at ${selectedTime}`;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      // Refresh the classes list
      await fetchVirtualClasses();
      
      setAlertMessage(successMessage);
      setShowAlert(true);
      
      // Reset form fields
      setSelectedDate('');
      setSelectedTime('');
      setSelectedCourse('');
      setMeetingLink('');
      
      if (editMode) {
        setEditMode(false);
        setCurrentEditId(null);
      }
    } catch (err) {
      console.error("Error saving virtual class:", err);
      setAlertMessage(err.message || `Failed to ${editMode ? 'update' : 'publish'} virtual class. Please try again.`);
      setShowAlert(true);
    }
    
    // Hide alert after 3 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  const confirmDelete = (id) => {
    setClassToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const handleDelete = async () => {
    if (classToDelete) {
      try {
        const response = await fetch(`${API_URL}/${classToDelete}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        // Refresh the classes list after deletion
        await fetchVirtualClasses();
        
        setAlertMessage('Virtual class deleted successfully');
        setShowAlert(true);
        setShowDeleteConfirm(false);
        setClassToDelete(null);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (err) {
        console.error("Error deleting virtual class:", err);
        setAlertMessage(err.message || 'Failed to delete virtual class. Please try again.');
        setShowAlert(true);
        setShowDeleteConfirm(false);
      }
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setClassToDelete(null);
  };

  const handleEdit = (id) => {
    const classToEdit = publishedClasses.find(cls => cls.id === id);
    if (classToEdit) {
      setSelectedDate(classToEdit.date);
      setSelectedTime(classToEdit.time);
      setSelectedCourse(classToEdit.course);
      setMeetingLink(classToEdit.link);
      setEditMode(true);
      setCurrentEditId(id);
      
      // Scroll to the form section
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCurrentEditId(null);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedCourse('');
    setMeetingLink('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Add 'T00:00:00' to handle date string properly
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  // Status update functionality
  const openStatusModal = (classItem) => {
    setStatusUpdateClass(classItem);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setStatusUpdateClass(null);
  };

  const updateClassStatus = async (newStatus) => {
    if (!statusUpdateClass) return;

    try {
      const response = await fetch(`${API_URL}/${statusUpdateClass.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      // Refresh the classes list
      await fetchVirtualClasses();
      
      setAlertMessage(`Class status updated to ${newStatus} successfully`);
      setShowAlert(true);
      closeStatusModal();
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error("Error updating class status:", err);
      setAlertMessage(err.message || 'Failed to update class status. Please try again.');
      setShowAlert(true);
      closeStatusModal();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle size={14} className="mr-1" />;
      case 'completed':
        return <CheckCircle size={14} className="mr-1" />;
      case 'cancelled':
        return <XCircle size={14} className="mr-1" />;
      default:
        return <AlertCircle size={14} className="mr-1" />;
    }
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
                <Link2 className="mr-2" size={24} />
                Virtual Classes
              </h1>
            </div>
          
            {/* Schedule New Class Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center mb-6">
                <Upload className="mr-2" size={20} />
                {editMode ? 'Edit Virtual Class' : 'Schedule New Virtual Class'}
              </h2>
              
              {showAlert && (
                <div className={`p-4 mb-4 rounded ${alertMessage.includes('successfully') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {alertMessage}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date Selector */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="date">
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Time Selector */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="time">
                    Select Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
                
                {/* Course Dropdown */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="course">
                    Select Course
                  </label>
                  <select
                    id="course"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">-- Select a Course --</option>
                    {courses.map((course, index) => (
                      <option key={index} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Meeting Link */}
                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="meetingLink">
                    Virtual Meeting Link
                  </label>
                  <textarea
                    id="meetingLink"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    placeholder="Paste your virtual meeting link here..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end mt-6 space-x-3">
                {editMode && (
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center"
                  >
                    <X className="mr-2" size={18} />
                    Cancel
                  </button>
                )}
                <button
                  onClick={handlePublish}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
                >
                  {editMode ? (
                    <>
                      <Check className="mr-2" size={18} />
                      Update
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={18} />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Published Classes Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                <Link2 className="mr-2" size={20} />
                Published Virtual Classes
              </h2>
              
              {isLoading ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">Loading virtual classes...</p>
                </div>
              ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded">
                  {error}
                </div>
              ) : publishedClasses.length === 0 ? (
                <p className="text-gray-500 py-4">No virtual classes have been published yet</p>
              ) : (
                <div className="space-y-4">
                  {publishedClasses.map(cls => (
                    <div key={cls.id} className={`border rounded-lg p-4 hover:bg-blue-50 transition-colors ${
                      cls.status === 'completed' ? 'bg-gray-50' : 
                      cls.status === 'cancelled' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <BookOpen className="mr-2 text-blue-600" size={18} />
                            <h3 className="font-semibold text-lg text-blue-800">{cls.course}</h3>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="mr-1" size={16} />
                            <span>{formatDate(cls.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-1" size={16} />
                            <span>{cls.time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => openStatusModal(cls)}
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center cursor-pointer hover:opacity-80 transition-opacity ${
                              cls.status === 'upcoming' ? 'bg-green-100 text-green-800' : 
                              cls.status === 'completed' ? 'bg-gray-200 text-gray-800' :
                              cls.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                              'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {getStatusIcon(cls.status)}
                            {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Meeting Link:</p>
                        <a 
                          href={cls.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {cls.link}
                        </a>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-3">
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => handleEdit(cls.id)}
                          title="Edit class"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => confirmDelete(cls.id)}
                          title="Delete class"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Status Update Modal */}
      {showStatusModal && statusUpdateClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Class Status</h3>
            <p className="text-gray-700 mb-4">
              Update the status for: <strong>{statusUpdateClass.course}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Current status: <span className={`px-2 py-1 rounded text-xs font-medium ${
                statusUpdateClass.status === 'upcoming' ? 'bg-green-100 text-green-800' : 
                statusUpdateClass.status === 'completed' ? 'bg-gray-200 text-gray-800' :
                'bg-red-200 text-red-800'
              }`}>
                {statusUpdateClass.status.charAt(0).toUpperCase() + statusUpdateClass.status.slice(1)}
              </span>
            </p>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={() => updateClassStatus('upcoming')}
                disabled={statusUpdateClass.status === 'upcoming'}
                className={`p-3 rounded-lg border text-left flex items-center transition-colors ${
                  statusUpdateClass.status === 'upcoming' 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800'
                }`}
              >
                <AlertCircle size={16} className="mr-2" />
                <div>
                  <div className="font-medium">Upcoming</div>
                  <div className="text-xs">Class is scheduled and ready</div>
                </div>
              </button>
              
              <button
                onClick={() => updateClassStatus('completed')}
                disabled={statusUpdateClass.status === 'completed'}
                className={`p-3 rounded-lg border text-left flex items-center transition-colors ${
                  statusUpdateClass.status === 'completed' 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                }`}
              >
                <CheckCircle size={16} className="mr-2" />
                <div>
                  <div className="font-medium">Completed</div>
                  <div className="text-xs">Class has been conducted</div>
                </div>
              </button>
              
              <button
                onClick={() => updateClassStatus('cancelled')}
                disabled={statusUpdateClass.status === 'cancelled'}
                className={`p-3 rounded-lg border text-left flex items-center transition-colors ${
                  statusUpdateClass.status === 'cancelled' 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
                }`}
              >
                <XCircle size={16} className="mr-2" />
                <div>
                  <div className="font-medium">Cancelled</div>
                  <div className="text-xs">Class has been cancelled</div>
                </div>
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={closeStatusModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this virtual class? This action cannot be undone.
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
}