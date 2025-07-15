import { useState, useEffect } from "react";
import { studentCourseApiHelpers } from '../../utils/studentCourseApiHelpers';
import { Loader, AlertCircle } from 'lucide-react';

function UpcomingAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchUpcomingAssignments();
  }, []);

  const fetchUpcomingAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new simplified API method
      const response = await studentCourseApiHelpers.getUpcomingAssignments(10);
      
      if (response.success) {
        const formattedAssignments = response.data.map(assignment => ({
          id: assignment.assignment_id || assignment.id,
          title: assignment.title,
          course: assignment.course_code || assignment.course_id,
          courseName: assignment.course_name,
          dueDate: new Date(assignment.due_date),
          maxPoints: assignment.max_points,
          status: getDueDateStatus(new Date(assignment.due_date)),
          completed: assignment.submitted || false,
          assignment_id: assignment.assignment_id || assignment.id,
          course_id: assignment.course_id,
          instructor: assignment.instructor
        }));

        setAssignments(formattedAssignments);
      } else {
        throw new Error(response.message || 'Failed to fetch assignments');
      }
      
    } catch (error) {
      console.error('Failed to fetch upcoming assignments:', error);
      setError(studentCourseApiHelpers.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const getDueDateStatus = (dueDate) => {
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 1) return "urgent";
    if (diffDays <= 3) return "due-soon";
    return "normal";
  };

  const toggleComplete = async (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    // In a real implementation, you might want to handle marking as complete
    // For now, we'll just toggle the local state
    setAssignments(prevAssignments =>
      prevAssignments.map(a =>
        a.id === assignmentId ? { ...a, completed: !a.completed } : a
      )
    );

    // Close menu if open
    setActiveMenu(null);
  };

  const handleViewAssignment = (assignment) => {
    // Navigate to the assignment submission page
    const courseId = assignment.course_id;
    const assignmentId = assignment.assignment_id;
    
    // You can use your router here (React Router, Next.js router, etc.)
    // For example with React Router:
    // navigate(`/courses/${courseId}/assignments/${assignmentId}`);
    
    // Or redirect using window.location:
    window.location.href = `/courses/${courseId}`;
    
    setActiveMenu(null);
  };

  const handleRemoveAssignment = (assignmentId) => {
    // Remove from local state (this doesn't affect the backend)
    setAssignments(prevAssignments =>
      prevAssignments.filter(a => a.id !== assignmentId)
    );
    setActiveMenu(null);
  };

  const formatDueDate = (date) => {
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 7) return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    
    const weeks = Math.floor(diffDays / 7);
    return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const getStatusColor = (status, completed) => {
    if (completed) return "bg-green-500";
    
    switch (status) {
      case "overdue":
        return "bg-red-600";
      case "urgent":
        return "bg-red-500";
      case "due-soon":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "overdue":
        return "text-red-600";
      case "urgent":
        return "text-red-500";
      case "due-soon":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="upcoming-assignments">
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin h-6 w-6 text-blue-600 mr-2" />
          <span className="text-gray-600">Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upcoming-assignments">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-2">Failed to load assignments</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchUpcomingAssignments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-assignments">
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">You have no upcoming assignments.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`flex items-center p-3 border rounded-lg transition-colors ${
                assignment.completed ? "bg-gray-50 border-gray-200" : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              {/* Status indicator */}
              <div
                className={`w-2 h-10 rounded-full mr-3 ${getStatusColor(assignment.status, assignment.completed)}`}
              ></div>

              {/* Assignment details */}
              <div className="flex-1">
                <h3 className={`font-medium ${assignment.completed ? "text-gray-500 line-through" : "text-gray-800"}`}>
                  {assignment.title}
                </h3>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">{assignment.courseName || assignment.course}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className={getStatusTextColor(assignment.status)}>
                    {formatDueDate(assignment.dueDate)}
                  </span>
                  {assignment.maxPoints && (
                    <>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-500">{assignment.maxPoints} marks</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UpcomingAssignments;