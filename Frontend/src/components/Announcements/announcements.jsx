import { useState, useEffect } from "react"

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        
        // Get token from localStorage (adjust this based on how you store the token)
        const token = localStorage.getItem('token')
        
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('/api/announcements/students', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed. Please log in again.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success) {
          setAnnouncements(result.data)
        } else {
          throw new Error(result.message || 'Failed to fetch announcements')
        }
      } catch (err) {
        console.error('Error fetching announcements:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" }
    const date = new Date(dateString)

    // Calculate if it's today, yesterday, or show the date
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", options)
    }
  }

  // Toggle expanded state for an announcement
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Mark announcement as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/announcements/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Update local state
        setAnnouncements(
          announcements.map((announcement) => 
            announcement.id === id ? { ...announcement, read: true } : announcement
          )
        )
      } else {
        console.error('Failed to mark announcement as read')
      }
    } catch (err) {
      console.error('Error marking announcement as read:', err)
    }
  }

  // Get icon based on announcement type and priority
  const getAnnouncementIcon = (type, priority) => {
    // Use priority to determine if it's important
    const isImportant = priority === 'HIGH' || type === 'important'
    
    if (isImportant) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      )
    }
    
    if (type === "course") {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="announcements-container">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="announcements-container">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Error loading announcements</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="announcements-container">
      {announcements.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No announcements</h3>
          <p className="mt-1 text-sm text-gray-500">You're all caught up! Check back later for new announcements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
                announcement.read
                  ? "border-gray-200"
                  : "border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200 shadow-sm"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  {getAnnouncementIcon(announcement.type, announcement.priority)}

                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-base font-semibold ${announcement.read ? "text-gray-700" : "text-gray-900"}`}
                      >
                        {announcement.title}
                        {announcement.course && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {announcement.course}
                          </span>
                        )}
                        {announcement.priority === 'HIGH' && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            HIGH PRIORITY
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{formatDate(announcement.date)}</span>
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {expandedId === announcement.id
                        ? announcement.content
                        : `${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? "..." : ""}`}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>From: {announcement.author}</span>
                      </div>

                      <div className="flex space-x-2">
                        {announcement.content.length > 100 && (
                          <button
                            onClick={() => toggleExpand(announcement.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {expandedId === announcement.id ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}