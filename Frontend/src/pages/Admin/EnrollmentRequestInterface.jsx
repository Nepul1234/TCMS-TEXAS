import { useState,useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, Search, Clock, Award, Calendar, Book, Filter, MoreVertical } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EnrollmentRequestsInterface() {
  const [requests, setRequests] = useState([
    
  ]);
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/courses/courseEnrollmentRequests',{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (!res.status === 200) {
          alert('Failed to fetch enrollment requests' + data.status);
          return;
        }
        const tempRequests = data.requests.map((request,index) => ({
          id: request.id || index, // Use index as fallback if _id is not available
          name: request.Fname + ' ' + request.Lname,
          email: request.Email,
          studentId: request.stu_id,
          course: request.course_name,
          courseCode: request.course_id,
          courseType: request.course_type || "N/A",
          grade: request.grade || "N/A",
          requestDate: new Date(request.request_date).toLocaleDateString(),
          status: request.status === null ? 'Pending' : request.status.charAt(0).toUpperCase() + request.status.slice(1),
          avatar: request.avatar || "/src/assets/student.png", // Default avatar if not provided
        }));
        console.log(tempRequests);
        setRequests(tempRequests);

      } catch (error) {
        console.error('Error fetching enrollment requests:', error);
        alert('Error fetching enrollment requests');
      }
    }
    fetchRequests();
  }, []);

  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  
  const handleAccept = async (id) => {
    setRequests(
      requests.map(request => 
        request.id === id ? { ...request, status: 'Accepted' } : request
      )
    );
    try{
      const res = await fetch('/api/courses/approveEnrollmentRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId: id , status: 'Accepted' }),
    });
     const result = await res.json();
     if (!res.status === 200) {
       alert('Failed to accept enrollment request: ' + result?.message)
       return;
     }else{
      Swal.fire({
         title: 'Success!',
         text: 'Your approval is successfully granted.',
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
     }
      

    }catch(error){
      alert("Error in accepting enrollment request");
      console.log(error);
      return;
    } 
  }
    

  
  const handleReject = async (id) => {
    setRequests(
      requests.map(request => 
        request.id === id ? { ...request, status: 'Rejected' } : request
      )
    );
    try{
      const res = fetch('/api/courses/approveEnrollmentRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId: id , status: 'Rejected' }),
    });
     const result = await res.json();
     if (!res.status === 200) {
       alert('Failed to accept enrollment request: ' + result.message)
       return;
     }
     alert("Enrollment request rejected successfully");
    }catch(error){
      alert("Error in accepting enrollment request",error);
      return;
    } 
  };
  
  const toggleRequestDetails = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };
  
  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  
  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <div>
            <p className="text-gray-600 mt-1">Manage student enrollment requests for your courses</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
              <Filter size={16} className="mr-2" />
              Advanced Filters
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
              Export List
            </button> */}
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{pendingCount}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted Requests</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{acceptedCount}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected Requests</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{rejectedCount}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID or course..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Filter by:</span>
              <div className="flex">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-lg ${
                    filterStatus === 'all' 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-300' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('Pending')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    filterStatus === 'pending' 
                      ? 'bg-yellow-50 text-yellow-700 border-t border-b border-yellow-300' 
                      : 'bg-white text-gray-700 border-t border-b border-gray-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('Accepted')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    filterStatus === 'accepted' 
                      ? 'bg-green-50 text-green-700 border-t border-b border-green-300' 
                      : 'bg-white text-gray-700 border-t border-b border-gray-300'
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setFilterStatus('Rejected')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-r-lg ${
                    filterStatus === 'rejected' 
                      ? 'bg-red-50 text-red-700 border border-red-300' 
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Requests List */}
        <div className="space-y-4 mb-8">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">No enrollment requests match your filters</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={request.avatar} 
                        alt={request.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 mr-3">{request.studentId}</span>
                          <span className="text-sm text-gray-500">{request.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    {request.status === 'Pending' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReject(request.id)}
                          className="p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        >
                          <XCircle size={22} className="text-red-500" />
                        </button>
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                        >
                          <CheckCircle size={18} className="mr-1" />
                          Accept Request
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center px-3 py-1 rounded-full ${
                        request.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'Accepted' ? (
                          <>
                            <CheckCircle size={16} className="mr-1" />
                            <span className="text-sm font-medium capitalize">Accepted</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="mr-1" />
                            <span className="text-sm font-medium capitalize">Rejected</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Course</p>
                      <div className="flex items-center mt-1">
                        <Book size={16} className="text-gray-400 mr-1" />
                        <p className="text-sm font-medium text-gray-900">{request.course}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Course Code</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{request.courseCode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">course Type</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{request.courseType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Request Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={16} className="text-gray-400 mr-1" />
                        <p className="text-sm font-medium text-gray-900">{request.requestDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Award size={16} className="text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">Grade: {request.grade}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleRequestDetails(request.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      {expandedRequestId === request.id ? 'Hide Details' : 'View Details'}
                      <ChevronDown size={16} className={`ml-1 transform transition-transform ${
                        expandedRequestId === request.id ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </div>
                  
                  {expandedRequestId === request.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Student Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Enrollment History</p>
                          <p className="text-sm text-gray-700 mt-1">
                            This student has expresses his/her interest in enrolling in this course.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Prerequisites</p>
                          <p className="text-sm text-gray-700 mt-1">
                            No prerequisites required for this course
                          </p>
                        </div>
                        </div>
                      
                        
                      
                      {request.status === 'Pending' && (
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Accept Enrollment
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredRequests.length}</span> of <span className="font-medium">{requests.length}</span> requests
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="p-2 w-10 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-700 font-medium">
              1
            </button>
            <button className="p-2 w-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}2