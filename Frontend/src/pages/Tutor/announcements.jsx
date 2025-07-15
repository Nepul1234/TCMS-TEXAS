import React, { useEffect, useState } from 'react';
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";
import { Megaphone, Trash2, Edit } from 'lucide-react';
import useUserData from '../../components/hooks/courseData';

const Announcement = () => {
  // State management
  const { courseData} = useUserData();
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Function to show success message and auto-hide after timeout
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    // Auto-hide the message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Form states
  const [formData, setFormData] = useState({
    course_id: "",
    text: "",  // Changed from "announcement" to "text" to match API 
    priority: "MEDIUM"  // Changed to uppercase to match API 
  });

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    text: "",  // Changed from "announcement" to "text"
    priority: "MEDIUM"  // Changed to uppercase
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setCourses(courseData);

        // Fetch announcements
        const announcementsRes = await fetch('/api/getTutorAnnouncement/getAnnouncements');
        if (!announcementsRes.ok) throw new Error('Failed to fetch announcements');
        const announcementsData = await announcementsRes.json();
        
        // Sort announcements in descending order (latest first)
        const sortedAnnouncements = announcementsData.sort((a, b) => 
          new Date(b.published_date) - new Date(a.published_date)
        );
        setAnnouncements(sortedAnnouncements);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Publish new announcement
  const publishAnnouncement = async () => {
    if (!formData.course_id || !formData.text.trim()) {
      setError("Please select a course and enter announcement text");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/PublishAnnouncement/setNewAnnouncement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publisher_name: "Mr. Anura" // This should come from auth context
        }),
      });

      if (!res.ok) throw new Error('Failed to create announcement');
      
      const newAnnouncement = await res.json();
      
      // Map backend response to frontend format if needed
      const formattedAnnouncement = {
        announcement_id: newAnnouncement.announcement_id,
        course_id: newAnnouncement.course_id,
        announcement: newAnnouncement.text, // Map "text" to "announcement" for frontend
        priority: (newAnnouncement.priority || "MEDIUM").toLowerCase(), // Convert to lowercase for frontend with fallback
        publisher_name: newAnnouncement.publisher_name,
        published_date: newAnnouncement.published_date || new Date().toISOString()
      };
      
      // Add new announcement at the beginning and sort to maintain descending order
      const updatedAnnouncements = [formattedAnnouncement, ...announcements].sort((a, b) => 
        new Date(b.published_date) - new Date(a.published_date)
      );
      setAnnouncements(updatedAnnouncements);
      setFormData({ course_id: "", text: "", priority: "MEDIUM" });
      setError(null);
      showSuccessMessage("Announcement published successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement
const deleteAnnouncement = async (id) => {
  if (!window.confirm("Are you sure you want to delete this announcement?")) return;
  
  try {
    setLoading(true);
    // Send announcement_id in the request body
    const res = await fetch(`/api/deleteAnnouncements/deleteAnnouncement`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ announcement_id: id }),
    });
    
    // Parse response body once
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete announcement');
    }
    
    // Update local state to remove the deleted announcement
    setAnnouncements(announcements.filter(a => a.announcement_id !== id));
    
    // Show success message
    showSuccessMessage("Announcement deleted successfully!");
    
  } catch (err) {
    setError(err.message);
    // Optionally show error in UI
    showErrorMessage(err.message);
  } finally {
    setLoading(false);
  }
};

  // Start editing an announcement
  const startEditing = (announcement) => {
    setEditingId(announcement.announcement_id);
    setEditData({
      text: announcement.announcement, // Map frontend "announcement" to backend "text"
      priority: (announcement.priority || "medium").toUpperCase() // Convert to uppercase for API with fallback
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({ text: "", priority: "MEDIUM" });
  };

  // Update announcement
  const updateAnnouncement = async () => {
    if (!editData.text.trim()) {
      setError("Please enter announcement text");
      return;
    }

    try {
      setLoading(true);
      // Changed URL  request
      const res = await fetch('/api/updateAnnouncements/updateAnnouncement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_id: editingId, // Include ID in the body
          text: editData.text,
          priority: editData.priority
        }),
      });
  
      if (!res.ok) throw new Error('Failed to update announcement');
      
      const updatedAnnouncementData = await res.json();
      
      // Map backend response to frontend format
      const updatedAnnouncement = {
        ...announcements.find(a => a.announcement_id === editingId),
        announcement: updatedAnnouncementData.text || editData.text,
        priority: ((updatedAnnouncementData.priority || editData.priority || "MEDIUM") + "").toLowerCase()
      };
      
      setAnnouncements(announcements.map(a => 
        a.announcement_id === editingId ? updatedAnnouncement : a
      ));
      cancelEditing();
      showSuccessMessage("Announcement updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? course.course_name : "Geography";
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Priority options with uppercase values for API
  const priorityOptions = [
    { value: "HIGH", label: "High", color: "bg-red-100 text-red-800" },
    { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" }
  ];

  const priorityBorderColors = {
    high: "border-red-500",
    medium: "border-yellow-500",
    low: "border-green-500"
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-blue-800 flex items-center">
                <Megaphone className="mr-2" size={24} />
                Course Announcements
              </h1>
            </div>
          
            {/* Create Announcement Form */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center mb-6">
                <Megaphone className="mr-2" size={20} />
                Publish New Announcement
              </h2>
              
              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold mr-1">Success!</strong>
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}
              
              {error && <div className="mb-4 text-red-500">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="courseSelect" className="block text-gray-700 font-medium mb-2">
                    Select Course
                  </label>
                  <select
                    id="courseSelect"
                    name="course_id"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.course_id}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select a Course --</option>
                    {courseData.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Priority</label>
                  <div className="flex space-x-2">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm ${formData.priority === option.value ? option.color + ' ring-2 ring-offset-2 ring-blue-500' : 'bg-gray-100 text-gray-800'}`}
                        onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="announcementText" className="block text-gray-700 font-medium mb-2">
                  Announcement
                </label>
                <textarea
                  id="announcementText"
                  name="text" // Changed from "announcement" to "text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Write your announcement here..."
                  value={formData.text}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
                  onClick={publishAnnouncement}
                  disabled={loading}
                >
                  {loading ? (
                    "Publishing..."
                  ) : (
                    <>
                      <Megaphone className="mr-2" size={18} />
                      Publish Announcement
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Display Announcements */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                <Megaphone className="mr-2" size={20} />
                Recent Announcements
              </h2>
              
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div 
                      key={announcement.announcement_id} 
                      className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${priorityBorderColors[announcement.priority ? announcement.priority.toLowerCase() : 'medium']} hover:bg-blue-50 transition-colors`}
                    >
                      {editingId === announcement.announcement_id ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {getCourseName(announcement.course_id)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(announcement.published_date)}
                            </span>
                          </div>
                          <textarea
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                            value={editData.text}
                            onChange={(e) => setEditData(prev => ({ ...prev, text: e.target.value }))}
                          ></textarea>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              {priorityOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  className={`px-3 py-1 rounded-full text-sm ${editData.priority === option.value ? option.color + ' ring-2 ring-offset-2 ring-blue-500' : 'bg-gray-100 text-gray-800'}`}
                                  onClick={() => setEditData(prev => ({ ...prev, priority: option.value }))}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={updateAnnouncement}
                                disabled={loading}
                              >
                                {loading ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {getCourseName(announcement.course_id)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                by {announcement.publisher_name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(announcement.published_date)}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-3">{announcement.announcement}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`text-xs px-2 py-1 rounded-full ${priorityOptions.find(o => o.value === (announcement.priority || "medium").toUpperCase())?.color || priorityOptions[1].color}`}>
                                {(announcement.priority || "medium").toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditing(announcement)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteAnnouncement(announcement.announcement_id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-gray-500 italic">No announcements yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Announcement;