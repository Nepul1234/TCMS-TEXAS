import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal } from "../ui/modal";
import { useModal } from "../hooks/useModal";
import Button from "../Buttons/Button";

const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  const eventColors = {
    Danger: "bg-red-100 border-red-500 text-red-800",
    Success: "bg-green-100 border-green-500 text-green-800",
    Primary: "bg-blue-100 border-blue-500 text-blue-800",
    Warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
  };

  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      const newEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel || "Primary" },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Calendar Header with Add Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Calendar</h2>
          <button
            onClick={openModal}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Add Event +
          </button>
        </div>
        
        {/* Calendar Container */}
        <div className="custom-calendar p-2 md:p-4">
          <style jsx global>{`
            .fc .fc-toolbar {
              flex-wrap: wrap;
              gap: 8px;
              padding: 0 0.5rem 1rem;
            }
            
            .fc .fc-toolbar-title {
              font-size: 1.25rem;
              font-weight: 600;
            }
            
            .fc .fc-button {
              background-color: #f3f4f6;
              border: 1px solid #e5e7eb;
              color: #4b5563;
              font-weight: 500;
              padding: 0.375rem 0.75rem;
              font-size: 0.875rem;
              border-radius: 0.375rem;
              box-shadow: none;
            }
            
            .fc .fc-button:hover {
              background-color: #e5e7eb;
            }
            
            .fc .fc-button-primary {
              background-color: #4f46e5;
              border-color: #4f46e5;
              color: white;
            }
            
            .fc .fc-button-primary:hover {
              background-color: #4338ca;
              border-color: #4338ca;
            }
            
            .fc .fc-button-primary:not(:disabled).fc-button-active,
            .fc .fc-button-primary:not(:disabled):active {
              background-color: #4338ca;
              border-color: #4338ca;
            }
            
            .fc-theme-standard td, .fc-theme-standard th {
              border-color: #e5e7eb;
            }
            
            .fc-day-today {
              background-color: #eff6ff !important;
            }
            
            .fc-event {
              border-radius: 4px;
              padding: 2px 4px;
              font-size: 0.75rem;
              line-height: 1rem;
            }
            
            .dark .fc .fc-button {
              background-color: #1f2937;
              border-color: #374151;
              color: #d1d5db;
            }
            
            .dark .fc .fc-button:hover {
              background-color: #374151;
            }
            
            .dark .fc-theme-standard td, 
            .dark .fc-theme-standard th {
              border-color: #374151;
            }
            
            .dark .fc-day-today {
              background-color: rgba(79, 70, 229, 0.1) !important;
            }
            
            .dark .fc-col-header-cell {
              background-color: #111827;
            }
            
            .dark .fc-toolbar-title {
              color: #f3f4f6;
            }
            
            @media (max-width: 640px) {
              .fc .fc-toolbar {
                flex-direction: column;
                align-items: flex-start;
              }
              
              .fc .fc-toolbar-title {
                margin-bottom: 0.5rem;
                font-size: 1.125rem;
              }
            }
          `}</style>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-lg p-0 overflow-hidden bg-white rounded-xl dark:bg-gray-900"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {selectedEvent ? "Edit Event" : "Add New Event"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedEvent 
              ? "Update your event details below" 
              : "Fill in the details to add a new event to your calendar"}
          </p>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Event Title */}
          <div>
            <label 
              htmlFor="event-title" 
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter event title"
              className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
            />
          </div>

          {/* Event Color */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Color
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(calendarsEvents).map(([key, value]) => (
                <div 
                  key={key} 
                  onClick={() => setEventLevel(key)}
                  className={`flex items-center px-3 py-2 space-x-2 transition-colors border rounded-lg cursor-pointer ${
                    eventLevel === key 
                      ? `ring-2 ring-offset-2 ${value === 'danger' ? 'ring-red-500' : value === 'success' ? 'ring-green-500' : value === 'primary' ? 'ring-blue-500' : 'ring-yellow-500'} dark:ring-offset-gray-900` 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span 
                    className={`w-4 h-4 rounded-full ${
                      value === 'danger' 
                        ? 'bg-red-500' 
                        : value === 'success' 
                        ? 'bg-green-500' 
                        : value === 'primary' 
                        ? 'bg-blue-500' 
                        : 'bg-yellow-500'
                    }`}
                  ></span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label 
                htmlFor="event-start-date" 
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date
              </label>
              <input
                id="event-start-date"
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
              />
            </div>
            <div>
              <label 
                htmlFor="event-end-date" 
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                End Date
              </label>
              <input
                id="event-end-date"
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={closeModal}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900"
          >
            Cancel
          </button>
          <Button
            size="md"
            variant="primary"
            onClick={handleAddOrUpdateEvent}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {selectedEvent ? "Update Event" : "Add Event"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

const renderEventContent = (eventInfo) => {
  const getEventColor = (calendar) => {
    switch(calendar.toLowerCase()) {
      case 'danger':
        return 'border-l-4 border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'primary':
        return 'border-l-4 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`px-2 py-1 overflow-hidden text-xs font-medium rounded ${getEventColor(eventInfo.event.extendedProps.calendar)}`}>
      <div className="font-semibold truncate">{eventInfo.event.title}</div>
      {eventInfo.timeText && (
        <div className="text-xs opacity-90">{eventInfo.timeText}</div>
      )}
    </div>
  );
};

export default Calendar;