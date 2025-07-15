import React, { useEffect, useState } from 'react';

const RecentHallBookings = () => {
  const [bookings, setBookings] = useState([]);

   useEffect(() => {
    const fetchBookings = async () => {
      try {
      const res = await fetch('/api/hallBookings/getRecentBookings', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.status !== 200) {
        console.error('Error fetching bookings:', data.message);
      }
      const temp = data.recentBookings.map((booking, index) => ({
        id: index + 1,
        hall: booking.hall_name,
        bookedBy: booking.requester_name,
        purpose: booking.event_details,
        date: booking.request_date,
        time: booking.start_time,
        status: booking.status,
      }));
      setBookings(temp);
      } catch (error) {
      console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, []);



  const [statusFilter, setStatusFilter] = useState('All');

  // Filter bookings based on status
  const filteredBookings = statusFilter === 'All' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  // Function to determine status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg overflow-hidden p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Recent Hall Bookings</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'All' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('Confirmed')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'Confirmed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'Pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hall
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booked By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Purpose
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.hall}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.bookedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-500">{booking.purpose}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No bookings found matching the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 italic">
        Showing {filteredBookings.length} of {bookings.length} total bookings
      </div>
    </div>
  );
};

export default RecentHallBookings;