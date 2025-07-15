import { useState, useEffect } from "react"
import axios from "axios"
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import {Calendar, DollarSign, Search, Filter, CreditCard, Clock, AlertCircle, CheckCircle, XCircle} from "lucide-react"
import { useAuth } from "../../components/context/AuthContext"


const PaymentHistory = () => {
  const { user } = useAuth() // Get user data from context
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {

    const fetchData = async () => {
      try {
        //get ID from context
        let userId = user?.id;
        
        // If not in context, try localStorage
        if (!userId) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            userId = parsedUser.id;
          }
        }

        if (userId) {
          // If we have a userId from any source, fetch payments
          await fetchPaymentsById(userId);
        } else {
          // Still no user ID available, show appropriate error
          setLoading(false);
          setError("User ID not found. Please log in.");
        }
      } catch (err) {
        console.error("Error in initial data fetch:", err);
        setLoading(false);
        setError("Failed to load payment data. Please try again.");
      }
    };

    fetchData();
  }, [user]); // Re-run when user changes in context

  const fetchPaymentsById = async (userId) => {
    if (!userId) {
      setError("User ID not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching payments for studentId:", userId);
      const response = await axios.post("/api/get_student_payment_details_byId/getStudentPaymentDetailsById", {
        id: userId,
      });

      console.log("API Response:", response);

      const data = response.data;
      if (response.status === 200) {
        setPayments(data.studentPaymentDetails || []);
        
        // Store payment data in sessionStorage for persistence across refreshes
        sessionStorage.setItem('paymentData', JSON.stringify(data.studentPaymentDetails || []));
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.response ? error.response.data : error.message);
      
      // Try to recover from sessionStorage if API call fails
      const storedPayments = sessionStorage.getItem('paymentData');
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
        setError(null); // Clear error as we have some data to show
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to retry fetching data
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    // Try context user first
    let userId = user?.id;
    
    // Fallback to localStorage
    if (!userId) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.id;
      }
    }
    
    await fetchPaymentsById(userId);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.course_name && typeof payment.course_name === "string"
        ? payment.course_name.toLowerCase().includes(searchQuery.toLowerCase())
        : false

    const matchesStatus =
      selectedStatus === "all" ||
      (payment.payment_status &&
        typeof payment.payment_status === "string" &&
        payment.payment_status.toLowerCase() === selectedStatus.toLowerCase())

    return matchesSearch && matchesStatus
  })

  // Calculate summary statistics - Fix by normalizing case for status checks
  const totalPaid = filteredPayments
    .filter((payment) => payment.payment_status?.toLowerCase() === "paid")
    .reduce((sum, payment) => sum + (Number(payment.fees) || 0), 0)

  const totalPending = filteredPayments
    .filter((payment) => payment.payment_status?.toLowerCase() === "pending")
    .reduce((sum, payment) => sum + (Number(payment.fees) || 0), 0)

  const totalOverdue = filteredPayments
    .filter((payment) => payment.payment_status?.toLowerCase() === "overdue")
    .reduce((sum, payment) => sum + (Number(payment.fees) || 0), 0)

  const getStatusIcon = (status) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "pending":
        return <Clock className="w-4 h-4 mr-1" />
      case "overdue":
        return <AlertCircle className="w-4 h-4 mr-1" />
      case "cancelled":
        return <XCircle className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  const statusStyles = {
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  }

  // Helper function to get status style with case insensitivity
  const getStatusStyle = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  // Helper function to get month name from date
  const getMonthName = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('default', { month: 'long' });
    } catch (error) {
      console.error("Error parsing date:", error);
      return 'N/A';
    }
  }

  // Check for stored data on initial render (React 18 strict mode compatibility)
  useEffect(() => {
    if (payments.length === 0 && !loading && !error) {
      const storedPayments = sessionStorage.getItem('paymentData');
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-40 to-white">
      {/* Header */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 sm:ml-64 pt-20 p-4 sm:p-8 mt-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
              </div>
              <p className="text-gray-600 ml-11">View and manage all your course payments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">Rs.{totalPaid.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">Rs.{totalPending.toFixed(2)}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">Rs.{totalOverdue.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search payments by course name..."
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading your payment history...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={fetchPayments}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No payment records found</p>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Month</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">{payment.course_name}</td>
                          <td className="px-6 py-4">{getMonthName(payment.time)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {payment.time ? new Date(payment.time).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              Rs.{payment.fees ? Number(payment.fees).toFixed(2) : '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(payment.payment_status)}`}
                            >
                              {getStatusIcon(payment.payment_status)}
                              {payment.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PaymentHistory