import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../components/context/AuthContext';


const AdminNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const { user } = useAuth();
  const role = user ? user.role : 'admi'; // Default to 'guest' if user is not logged in
  
  useEffect(() => {

    // Fetch notices from the server 
    const fetchNotices = async () => {
      try {
      const res = await fetch('/api/notices/getAllSuperAdminNotices', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.status === 200) {
        alert('Failed to fetch notices');
        return;
      }
      const temp = data.notices.map((notice, index) => ({
        id: index + 1,
        title: notice.topic,
        content: notice.description,
        category: notice.category,
        priority: notice.priority,
        date: notice.date,
        author: notice.author,
        pinned: true,
      }));
      setNotices(temp);
      } catch (error) {
      console.error('Failed to fetch notices:', error);
      }
    };
    fetchNotices();
  }, []);


  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'announcement',
    priority: 'medium',
    author: 'Admin'
  });

  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Category styles
  const categoryStyles = {
    announcement: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    alert: 'bg-red-100 text-red-800',
    reminder: 'bg-green-100 text-green-800'
  };

  // Priority styles
  const priorityStyles = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  // Filter notices
  const filteredNotices = filter === 'all' 
    ? notices 
    : filter === 'pinned' 
      ? notices.filter(notice => notice.pinned) 
      : notices.filter(notice => notice.category === filter);

  // Sort notices by date (newest first) and pinned status
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotice(prev => ({ ...prev, [name]: value }));
  };

  // new notice
  const handleAddNotice = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newNoticeObj = {
      id: notices.length + 1,
      ...newNotice,
      date: currentDate,
      pinned: false
    };
    console.log('Adding new notice:', newNoticeObj);

    // Add new notice to the top of the list
    const res = await fetch('/api/notices/addSuperAdminNotice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNoticeObj),
    });
    if(!res.status === 200) {
      alert('Failed to add notice');
      return;
    }
    Swal.fire({
             title: 'Success!',
             text: 'Your notice is successfully added.',
             icon: 'success',
             confirmButtonText: 'Awesome!',
             background: '#f0f4f8',
             color: '#1a202c',
             confirmButtonColor: '#10b981', // Tailwind's emerald-500
             width: '400px',
             customClass: {
             popup: 'rounded-2xl shadow-xl',
             title: 'text-2xl font-bold',
              confirmButton: 'text-white text-lg px-5 py-2',
              },
            backdrop: `
               rgba(0,0,0,0.4)
               left top
               no-repeat `
          });
    setNotices([newNoticeObj, ...notices]);
    setNewNotice({
      title: '',
      content: '',
      category: 'announcement',
      priority: 'medium',
      author: 'Admin'
    });
    setIsAdding(false);
  };

  const togglePin = (id) => {
    setNotices(notices.map(notice => 
      notice.id === id ? { ...notice, pinned: !notice.pinned } : notice
    ));
  };

  // Delete notice
  const deleteNotice = (id) => {
    setNotices(notices.filter(notice => notice.id !== id));
    if (selectedNotice && selectedNotice.id === id) {
      setSelectedNotice(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Notice Board</h2>
          {role === 'super_admin' && ( <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            {isAdding ? 'Cancel' : 'Add Notice'}
          </button>) }
        </div>

        {/* Add Notice Form */}
        {isAdding && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Create New Notice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newNotice.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Notice title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  name="author"
                  value={newNotice.author}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Your name"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                name="content"
                value={newNotice.content}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Notice content"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newNotice.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="alert">Alert</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={newNotice.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAddNotice}
                disabled={!newNotice.title || !newNotice.content}
                className={`px-4 py-2 rounded-md ${!newNotice.title || !newNotice.content 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                Post Notice {user.role}
              </button>
            </div>
            
            
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${filter === 'all' 
              ? 'bg-gray-200 font-medium' 
              : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={`px-3 py-1 rounded-md ${filter === 'pinned' 
              ? 'bg-gray-200 font-medium' 
              : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Pinned
          </button>
          <button
            onClick={() => setFilter('announcement')}
            className={`px-3 py-1 rounded-md ${filter === 'announcement' 
              ? 'bg-blue-200 text-blue-800 font-medium' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            Announcements
          </button>
          <button
            onClick={() => setFilter('maintenance')}
            className={`px-3 py-1 rounded-md ${filter === 'maintenance' 
              ? 'bg-yellow-200 text-yellow-800 font-medium' 
              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setFilter('alert')}
            className={`px-3 py-1 rounded-md ${filter === 'alert' 
              ? 'bg-red-200 text-red-800 font-medium' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            Alerts
          </button>
          <button
            onClick={() => setFilter('reminder')}
            className={`px-3 py-1 rounded-md ${filter === 'reminder' 
              ? 'bg-green-200 text-green-800 font-medium' 
              : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
          >
            Reminders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        {/* Notice List */}
        <div className="md:col-span-1 border-r border-gray-200 h-full max-h-screen overflow-y-auto">
          {sortedNotices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No notices found
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {sortedNotices.map((notice) => (
                <li 
                  key={notice.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedNotice?.id === notice.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setSelectedNotice(notice)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      {notice.pinned && (
                        <span className="mr-1 text-yellow-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </span>
                      )}
                      {notice.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${categoryStyles[notice.category]}`}>
                      {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {notice.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(notice.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${priorityStyles[notice.priority]}`}>
                      {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notice Detail View */}
        <div className="md:col-span-2 p-6">
          {selectedNotice ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedNotice.title}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePin(selectedNotice.id)}
                    className={`p-2 rounded-full ${selectedNotice.pinned ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-500'} hover:bg-gray-200`}
                    title={selectedNotice.pinned ? "Unpin notice" : "Pin notice"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteNotice(selectedNotice.id)}
                    className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500"
                    title="Delete notice"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryStyles[selectedNotice.category]}`}>
                  {selectedNotice.category.charAt(0).toUpperCase() + selectedNotice.category.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[selectedNotice.priority]}`}>
                  {selectedNotice.priority.charAt(0).toUpperCase() + selectedNotice.priority.slice(1)} Priority
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedNotice.content}
                </p>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Posted by: {selectedNotice.author}</span>
                <span>Date: {new Date(selectedNotice.date).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a notice to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNoticeBoard;