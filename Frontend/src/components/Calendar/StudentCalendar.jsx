import { useState, useEffect } from "react";
import { Calendar, Plus, Edit, X, Trash2, ChevronLeft, ChevronRight, GraduationCap, FileText, BarChart3, Users } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../Header/StudentHeader";
import Sidebar from "../Sidebar/StudentSidebar";

const CalendarEvent = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("class");
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventCategories = {
    class: { color: "#3B82F6", icon: GraduationCap, name: "Class" },
    assignment: { color: "#1E40AF", icon: FileText, name: "Assignment" },
    exam: { color: "#1D4ED8", icon: BarChart3, name: "Exam" },
    termtest: { color: "#2563EB", icon: Users, name: "Term Test" }
  };

  // Get token from localStorage (adjust based on your auth implementation)
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API call helper function
  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall('/api/events');
      
      console.log('Backend response:', response); // Debug log
      console.log('Response data:', JSON.stringify(response.data, null, 2)); // More detailed log
      
      if (response.success) {
        // Transform backend data to frontend format
        const transformedEvents = response.data.map(event => {
          console.log('Processing event:', JSON.stringify(event, null, 2)); // More detailed log
          
          // Extract date part from timestamp (YYYY-MM-DD)
          const startDate = event.start.split('T')[0]; // "2025-07-12T18:30:00.000Z" -> "2025-07-12"
          const endDate = event.end ? event.end.split('T')[0] : startDate;
          
          const transformedEvent = {
            id: event.id.toString(),
            title: event.title,
            start: startDate, // Now just the date part
            end: endDate,     // Now just the date part
            category: event.extendedProps?.calendar || event.category || 'class',
            allDay: event.allDay !== undefined ? Boolean(event.allDay) : true,
            description: event.extendedProps?.description || event.description
          };
          
          console.log('Transformed event:', JSON.stringify(transformedEvent, null, 2)); // Debug log
          return transformedEvent;
        });
        
        console.log('Final events array:', JSON.stringify(transformedEvents, null, 2)); // Debug log
        console.log('Events array length:', transformedEvents.length); // Debug log
        setEvents(transformedEvents);
      }
    } catch (error) {
      setError('Failed to fetch events. Please try again.');
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    resetModalFields();
    setError(null);
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("class");
    setSelectedEvent(null);
  };

  // Create or update event
  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) {
      setError('Event title is required');
      toast.error('Event title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const eventData = {
        title: eventTitle.trim(),
        start: eventStartDate,
        end: eventEndDate || eventStartDate,
        category: eventLevel,
        allDay: true
      };

      console.log('Sending event data:', eventData); // Debug log

      let response;

      if (selectedEvent) {
        // Update existing event
        toast.info('Updating event...');
        response = await apiCall(`/api/events/${selectedEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(eventData)
        });
      } else {
        // Create new event
        toast.info('Creating event...');
        response = await apiCall('/api/events', {
          method: 'POST',
          body: JSON.stringify(eventData)
        });
      }

      console.log('API response:', response); // Debug log

      if (response.success) {
        await fetchEvents(); // Refresh events list
        closeModal();
        
        // Show success toast message
        if (selectedEvent) {
          toast.success('Event updated successfully!');
          console.log('Event updated successfully');
        } else {
          toast.success('Event created successfully!');
          console.log('Event created successfully');
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to save event. Please try again.');
      console.error('Error saving event:', error);
      
      // Show error toast message
      if (selectedEvent) {
        toast.error('Failed to update event. Please try again.');
      } else {
        toast.error('Failed to create event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      setError(null);
      
      toast.info('Deleting event...');

      const response = await apiCall(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        await fetchEvents(); // Refresh events list
        closeModal();
        console.log('Event deleted successfully');
        toast.success('Event deleted successfully!');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete event. Please try again.');
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventStartDate(event.start);
    setEventEndDate(event.end || event.start);
    setEventLevel(event.category);
    openModal();
  };

  // Calendar grid generation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date().toDateString();
    
    console.log('Generating calendar for:', year, month); // Debug log
    console.log('Available events:', events); // Debug log
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = events.filter(event => {
        console.log(`Comparing event.start "${event.start}" with dateStr "${dateStr}"`); // Debug log
        return event.start === dateStr;
      });
      
      if (dayEvents.length > 0) {
        console.log(`Found ${dayEvents.length} events for ${dateStr}:`, dayEvents); // Debug log
      }
      
      days.push({
        date: date,
        dateStr: dateStr,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today,
        events: dayEvents
      });
    }
    
    console.log('Total days generated:', days.length); // Debug log
    console.log('Days with events:', days.filter(d => d.events.length > 0).length); // Debug log
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <>
      <Header />
      <Sidebar />
      
      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Main Content - Adjusted for sidebar and header */}
      <div className="ml-64 pt-20 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-600">
                    Student Calendar
                  </h1>
                  <p className="text-slate-600 text-sm">Manage your events</p>
                </div>
              </div>
              
              <button
                onClick={openModal}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Loading...' : 'New Event'}</span>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !isModalOpen && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600 text-sm">Loading events...</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* Quick Stats */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Total Events</span>
                    <span className="font-bold text-blue-600">{events.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">This Month</span>
                    <span className="font-bold text-blue-600">
                      {events.filter(e => new Date(e.start).getMonth() === currentDate.getMonth()).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Categories</h3>
                <div className="space-y-2">
                  {Object.entries(eventCategories).map(([key, category]) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={key} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <IconComponent className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-700 text-sm">{category.name}</span>
                        <span className="ml-auto text-xs text-slate-500">
                          {events.filter(e => e.category === key).length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mini Calendar Navigation */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-800">Navigate</h3>
                  <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Today
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => navigateMonth(-1)}
                    className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-800 text-sm">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button 
                    onClick={() => navigateMonth(1)}
                    className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                
                {/* Calendar Header */}
                <div className="bg-blue-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <p className="text-blue-100 mt-1 text-sm">Click any day to add an event</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => navigateMonth(-1)}
                        className="p-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigateMonth(1)}
                        className="p-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 bg-blue-50">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-blue-100">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-24 bg-white p-1 hover:bg-blue-50 transition-colors cursor-pointer ${
                        !day.isCurrentMonth ? 'opacity-30' : ''
                      } ${day.isToday ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                      onClick={() => {
                        setEventStartDate(day.dateStr);
                        setEventEndDate(day.dateStr);
                        openModal();
                      }}
                    >
                      <div className={`text-xs font-semibold mb-1 ${
                        day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className="space-y-0.5">
                        {day.events.slice(0, 3).map(event => {
                          const IconComponent = eventCategories[event.category]?.icon;
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                              style={{ 
                                backgroundColor: eventCategories[event.category]?.color + '20',
                                borderLeft: `2px solid ${eventCategories[event.category]?.color}`
                              }}
                            >
                              <div className="flex items-center space-x-1">
                                <IconComponent className="w-3 h-3" />
                                <span className="font-medium truncate text-xs">{event.title}</span>
                              </div>
                            </div>
                          );
                        })}
                        {day.events.length > 3 && (
                          <div className="text-xs text-slate-500 font-medium">
                            +{day.events.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform scale-100 transition-all duration-300">
            
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    {selectedEvent ? (
                      <Edit className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedEvent ? "Edit Event" : "Create Event"}</h3>
                    <p className="text-blue-100 text-xs">Fill in the details below</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              
              {/* Error Display in Modal */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Event Title *</label>
                <input 
                  type="text" 
                  placeholder="Enter event title..."
                  value={eventTitle} 
                  onChange={(e) => setEventTitle(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:ring-0 transition-colors bg-slate-50 focus:bg-white disabled:bg-slate-100"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Start Date *</label>
                  <input 
                    type="date" 
                    value={eventStartDate} 
                    onChange={(e) => setEventStartDate(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:ring-0 transition-colors bg-slate-50 focus:bg-white disabled:bg-slate-100"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">End Date</label>
                  <input 
                    type="date" 
                    value={eventEndDate} 
                    onChange={(e) => setEventEndDate(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:ring-0 transition-colors bg-slate-50 focus:bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(eventCategories).map(([key, category]) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEventLevel(key)}
                        disabled={loading}
                        className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          eventLevel === key 
                            ? 'border-blue-400 shadow-md' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{
                          backgroundColor: eventLevel === key ? category.color + '20' : 'white'
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-semibold text-xs">{category.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 rounded-b-xl flex justify-between items-center">
              {selectedEvent ? (
                <button
                  onClick={handleDeleteEvent}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg font-semibold transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-sm">{loading ? 'Deleting...' : 'Delete'}</span>
                </button>
              ) : (
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
              )}
              
              <button
                onClick={handleAddOrUpdateEvent}
                disabled={loading || !eventTitle.trim() || !eventStartDate}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center space-x-1"
              >
                {selectedEvent ? (
                  <>
                    <Edit className="w-3 h-3" />
                    <span className="text-sm">{loading ? 'Updating...' : 'Update Event'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span className="text-sm">{loading ? 'Creating...' : 'Create Event'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarEvent;