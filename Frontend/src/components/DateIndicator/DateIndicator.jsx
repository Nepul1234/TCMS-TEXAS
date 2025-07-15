"use client"

import { useState } from "react"

export default function DateIndicator() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Function to get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Function to get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // Sample events data
  const events = [
    { date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5), type: "assignment" },
    { date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12), type: "exam" },
    { date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15), type: "assignment" },
    { date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 18), type: "meeting" },
    { date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 22), type: "exam" },
    { date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 25), type: "assignment" },
  ]

  // Get current date info
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const today = new Date()

  // Create calendar days array
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null, isCurrentMonth: false })
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    // Find events for this day
    const dayEvents = events.filter(
      (event) => event.date.getDate() === day && event.date.getMonth() === month && event.date.getFullYear() === year,
    )

    days.push({
      day,
      isCurrentMonth: true,
      isToday,
      events: dayEvents,
    })
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Format month name
  const monthName = currentMonth.toLocaleString("default", { month: "long" })

  // Get event type color
  const getEventColor = (type) => {
    switch (type) {
      case "assignment":
        return "bg-blue-500"
      case "exam":
        return "bg-red-500"
      case "meeting":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="calendar-container">
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-medium text-gray-800">
          {monthName} {year}
        </h3>

        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              relative h-10 flex flex-col items-center justify-center rounded-md
              ${!day.isCurrentMonth ? "invisible" : ""}
              ${day.isToday ? "bg-blue-100" : "hover:bg-gray-100"}
              transition-colors
            `}
          >
            <span className={`text-sm ${day.isToday ? "font-bold text-blue-600" : "text-gray-700"}`}>{day.day}</span>

            {/* Event indicators */}
            {day.events && day.events.length > 0 && (
              <div className="absolute bottom-1 flex space-x-0.5">
                {day.events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.type)}`}
                    title={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-xs text-gray-600">Assignment</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
          <span className="text-xs text-gray-600">Exam</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
          <span className="text-xs text-gray-600">Meeting</span>
        </div>
      </div>
    </div>
  )
}
