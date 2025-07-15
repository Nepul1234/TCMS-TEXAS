import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, BookOpen, Clock, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal } from "../../components/ui/modal.jsx";
import Button from '../../components/Buttons/Button.jsx';
import { useModal } from "../../components/hooks/useModal.js";
import QRScannerComponent from '../../components/others/QRScannerModel.jsx';
import QRScanner from '../../components/others/QRScannerModel.jsx';
import QrScanner from '../../components/ID generator/QRreader.jsx';
import Swal from 'sweetalert2';

const StudentAttendanceInterface = () => {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [weekday, setWeekday] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [unpaidMonths, setUnpaidMonths] = useState([]);
  const [view, setView] = useState('addPayment');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [courseDetails, setCourseDetails] = useState([]);
  const [newClass, setNewClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState('normal');
  const { isOpen, openModal, closeModal } = useModal();

  let course_id = '';
  const scanned_student_id = localStorage.getItem('scanned_student_id')?.trim() || '';
  
  useEffect(() => {
    if (scanned_student_id) {
      localStorage.removeItem('scanned_student_id');
    }}, [scanned_student_id]);

  const getStudentClasses = async (e) => {
    const stu_id = e.target.value;
    setStudentId(stu_id);
    
    if (!stu_id.trim()) {
      setCourseDetails([]);
      setNewClass('');
      setPaymentAmount('');
      weekday('');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/courses/getCourseEnrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: stu_id }),
      });
      
      const result = await response.json();
      
      if (!response.ok || result.courseDetails?.length === 0) {
        setCourseDetails([]);
        return;
      }
      
      setCourseDetails(result.courseDetails);
      
      // Assuming student name is returned in the first course detail
      if (result.courseDetails.length > 0 && result.courseDetails[0].student_name) {
        setStudentName(result.courseDetails[0].student_name);
      }
      
      console.log(result.courseDetails);
    } catch (error) {
      console.error("Error fetching courses:", error);
      //alert("Something went wrong while fetching courses");
    } finally {
      setIsLoading(false);
    }
  };



  // Fetch payment history when student ID is entered
  const studentPaymentDetails  = (studentid,courseid) => {
    course_id = courseid;
    const fetchPaymentHistory = async () => {
      if (!studentId.trim()) {
        setPaymentHistory([]);
        setUnpaidMonths([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await fetch('/api/payments/getStudentPaymentDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('token')}`

          },
          body: JSON.stringify({ student_id: studentid,course_id:courseid}),
        });
        
        if (!response.ok) {
          return;
        }
        
        const data = await response.json();
        console.log("course details " ,data.rows);
        setPaymentHistory(data.rows);
        
        // Identify unpaid months
        const unpaid = data.rows.filter(payment => payment.payment_status === 'Not Paid');
        setUnpaidMonths(unpaid);
       
      } catch (error) {
        console.error("Error fetching payment history:", error);
        generateMockPaymentHistory();
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  };

  

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId || !newClass || !session) {
      setErrorMessage('Please fill in all required fields');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if((weekday !== new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()) && (session === 'normal')){
      setErrorMessage('Today is not the recording day for this class. Please set the session to extra');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
      

    // Get the selected month
    const monthSelect = document.getElementById('payment-month');
    const selectedMonth = monthSelect ? monthSelect.value : 'Current Month';

    setIsLoading(true);
    
    try { 
      const response = await fetch('/api/attendance/setStudentAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`

        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: newClass,
          session: session,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message);
        setTimeout(() => {
            setSuccessMessage('');
            setErrorMessage('');
            setStudentId('');
            setStudentName('');
            setNewClass('');
            setPaymentAmount('');
            setWeekday('');
            setCourseDetails([]);
          }, 3000);
        throw new Error('Payment processing failed');
      }
                Swal.fire({
                  title: 'Success!',
                  text: "Student attendance recorded successfully",
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
                    no-repeat
                  `
                });
      
      // Reset form and success message after delay
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
        setStudentId('');
        setStudentName('');
        setNewClass('');
        setPaymentAmount('');
        setCourseDetails([]);
      }, 3000);
    } catch (error) {
      console.error("Error processing payment:", error);
      setErrorMessage(response.message);


    } finally {
      setIsLoading(false);
      setWeekday('');
      
    }
  };

  

  return (
    <div className="w-full mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        Student Attendace Management
      </h1>

      {/* Navigation Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${view === 'addPayment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setView('addPayment')}
        >
          <div className="flex items-center">
            <CreditCard size={18} className="mr-2" />
            Add Attendance
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${view === 'paymentHistory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          onClick={() => setView('paymentHistory')}
        >
          <div className="flex items-center">
            <Clock size={18} className="mr-2" />
            Payment History
          </div>
        </button>
      </div>
      
      
      
      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {errorMessage}
        </div>
      )}

      {view === 'addPayment' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Record Attendance</h2>
          
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={16} className="inline mr-1" />
                  Student ID
                </label>
                <input
                  type="text"
                  value={scanned_student_id ? scanned_student_id : studentId}
                  onChange={getStudentClasses}
                  placeholder="Enter student ID"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                    type="button"
                    name = "getStudentbyId" 
                    className='mt-2 text-sm text-blue-600 hover:text-blue-800 bg-amber-300'
                    onClick={() => {openModal();}}
                >Scan QR Code</button>
                {studentName && (
                  <p className="mt-1 text-sm text-green-600">Student: {studentName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <BookOpen size={16} className="inline mr-1" />
                  Class
                </label>
                <select
                  value={newClass}
                  onChange={(e) => {setNewClass(e.target.value);
                    const selected = courseDetails.find(course => course.course_id === e.target.value);
                    setPaymentAmount(selected ? selected.fees : '');
                    setWeekday(selected ? selected.weekday : '');
                    studentPaymentDetails(studentId,e.target.value); 
                    setItems(true);
                      }
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={courseDetails.length === 0}
                >
                  <option value="">Select a class</option>
                  {courseDetails.map(course => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_id} {course.grade} {course.teacher_name}/month
                    </option>
                  ))}
                </select>
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={16} className="inline mr-1" />
                  Recording week
                </label>
                <select
                  id="payment-month"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="April"
                >
                  <option value="April">current week</option>
                </select>
                {(weekday && (weekday !== new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()))  ? (
                  <p className="mt-1 text-sm text-red-600"user>Today is not the the recording day for this class. Please set the session to extra</p>
                ) : (
                  <p className="mt-1 text-sm text-red-600"></p>
                )}    
              </div>
         
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  session
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="normal"
                  onChange={(e) => {setSession(e.target.value);}}>
                  <option value="normal">Normal</option>
                  <option value="extra">Extra</option>
                  </select>
              </div>
            </div>
            
            {unpaidMonths.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-700 flex items-center font-medium">
                  <AlertTriangle size={18} className="mr-2" />
                  There are {unpaidMonths.length} unpaid previous months
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  Please settle previous payments before recording new ones.
                </p>
                <button
                  type="button"
                  onClick={() => setView('paymentHistory')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  View payment history
                </button>
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                onClick={handleAttendanceSubmit}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <CreditCard size={18} className="mr-2" />
                {unpaidMonths.length > 0 ? 'Record Attendace anyway' : 'Record Attendace'} 
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'paymentHistory' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <Clock size={20} className="mr-2" />
            Payment History
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Student ID
            </label>
            <input
              type="text"
              value={localStorage.getItem('scanned_student_id')?.trim() || studentId}
              onChange={getStudentClasses}
              placeholder="Enter student ID"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {studentName && (
              <p className="mt-1 text-sm text-green-600">Student: {studentName}</p>
            )}
          </div>
          
          {studentId ? (
            <>
              <div className="overflow-x-auto mt-4">
                {paymentHistory.length > 0 ? (
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.pay_id} className={payment.payment_status === 'Not Paid' ? 'bg-red-50' : ''}>
                          <td className="py-3 px-4 text-sm text-gray-900">{payment.month}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{payment.course_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">Rs. {payment.fees}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{payment.payment_status === 'Not Paid'? '-':(payment.time.split('T')[0])}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${payment.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {payment.payment_status}
                            </span>
                          </td>
                         
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payment records found for this student
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setView('addPayment')}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back to Add Payment
                </button>
                
                {unpaidMonths.length > 0 && (
                  <div className="text-amber-600 flex items-center">
                    <AlertTriangle size={18} className="mr-2" />
                    {unpaidMonths.length} unpaid months need attention
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Enter a student ID to view payment history
            </div>
          )}
        </div>
      )}
      <Modal isOpen={isOpen} className="max-w-[700px] m-4 lg:m-0" onClose={closeModal}>
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  <div className="px-2 pr-14">
                    <QRScanner/>
                   
                  </div>
                </div>
              </Modal>
    </div>
  );
};

export default StudentAttendanceInterface;