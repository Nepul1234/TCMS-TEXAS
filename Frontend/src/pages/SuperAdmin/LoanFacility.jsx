import React, { useState,useEffect } from 'react';
import { Plus, Edit2,Currency, Trash2, Eye, Calendar, DollarSign, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { form } from 'framer-motion/client';

const LoanFacilityManagement = () => {
  const [loans, setLoans] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await fetch('/api/loanRequests/getAllLoanRequests',{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (!res.status === 200) {
          alert('Failed to fetch loan records: ' + data.message);
          console.log(res);
          return;
        }
        const tempLoans = data.loanRequests.map(loan => ({
          id: loan.id,
          staffName: loan.staff_name,
          staffId: loan.staff_id,
          amount: parseFloat(loan.amount),
          requestDate: loan.request_date,
          purpose: loan.purpose,
          status: loan.status,
          repaymentDate: loan.repayment_date,
          monthlyDeduction: loan.monthly_deduction || 0,
          type: loan.type,
          notes: loan.description
        }));
        setLoans(tempLoans);
      } catch (error) {
        console.error('Error fetching loan records:', error);
        alert('Error fetching loan records. Please try again later.');
      }
    }
    const fetchStaffList = async () => {
      try {
        const res = await fetch('/api/loanRequests/getAllStaffDetails',{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`

          }
        });
        const data = await res.json();
        if (!res.status === 200) {
          alert('Failed to fetch staff list: ' + data.message);
          return;
        }
        const tempStaffList = data.staffDetails.map(staff => ({
          id: staff.id,
          name: staff.name, 
        }));
        setStaffList(tempStaffList);
        console.log('Staff List:', tempStaffList);
      } catch (error) {
        console.error('Error fetching staff list:', error);
        alert('Error fetching staff list. Please try again later.');
      }
    }

     fetchLoans();
     fetchStaffList();
    },
   
    []);

  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [formData, setFormData] = useState({
    staffName: '',
    staffId: '',
    amount: '',
    requestDate: '',
    purpose: '',
    status: 'Pending',
    repaymentDate: '',
    monthlyDeduction: '',
    type:'',
    notes: ''
  });

  // const staffList = [
  //   { id: 'ST001', name: 'John Smith', department: 'Mathematics' },
  //   { id: 'ST002', name: 'Sarah Johnson', department: 'English' },
  //   { id: 'ST003', name: 'Mike Wilson', department: 'Science' },
  //   { id: 'ST004', name: 'Emily Davis', department: 'History' },
  //   { id: 'ST005', name: 'David Brown', department: 'Computer Science' }
  // ];

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Issued: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    Pending: <AlertCircle className="w-4 h-4" />,
    Issued: <Clock className="w-4 h-4" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Rejected: <XCircle className="w-4 h-4" />
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStaffChange = (e) => {
    const selectedStaff = staffList.find(staff => staff.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      staffId: e.target.value,
      staffName: selectedStaff ? selectedStaff.name : ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.staffId || !formData.amount || !formData.requestDate || !formData.purpose || !formData.repaymentDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingLoan) {
      setLoans(prev => prev.map(loan => 
        loan.id === editingLoan.id 
          ? { ...loan, 
            ...formData, 
            id: editingLoan.id,
            amount: parseFloat(formData.amount) }: loan
         ));  
       

    } else {
      const newLoan = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount),
        monthlyDeduction: parseFloat(formData.monthlyDeduction)
      };
      setLoans(prev => [...prev, newLoan]);
    }

    try{
       const res = await fetch('/api/loanRequests/setLoanRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`

      },
      body: JSON.stringify({  
        ...formData,
        repaymentDate: (formData.repaymentDate.split('T')[0]),
        requestDate: (formData.requestDate.split('T')[0]),
        monthlyDeduction: parseFloat(formData.monthlyDeduction) || 0 ,
        amount: parseFloat(formData.amount),
        type: formData.type || 'Monthly deduction',
      })
    });
    const result = await res.json();
    if(!res.status === 200){
      alert('Failed to submit loan request: ' + result.message);
      return;
    }
    Swal.fire({
       title: 'Success!',
       text: 'New loan request is added successfully.',
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
    }catch(error){
      console.error('Error submitting loan request:', error);
      alert('Error submitting loan request. Please try again later.');
      return;
    }
    

    
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      staffName: '',
      staffId: '',
      amount: '',
      requestDate: '',
      purpose: '',
      status: 'Pending',
      repaymentDate: '',
      monthlyDeduction: '',
      notes: ''
    });
    setEditingLoan(null);
    setShowModal(false);
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData(loan);
    setShowModal(true);


  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan record?')) {
      setLoans(prev => prev.filter(loan => loan.id !== id));
    }
    try{
      const res = await fetch('/api/loanRequests/deleteLoanRequest', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (!res.status === 200) {
        alert('Failed to delete loan request: ' + result.message);
        return;
      }
    

      Swal.fire({
       title: 'Success!',
       text: 'New loan request is deleted successfully.',
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


      
    }catch(error){
      console.log(error);
      alert('Error deleting loan request. Please try again later.');
      return;
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    setLoans(prev => prev.map(loan => 
      loan.id === id ? { ...loan, status: newStatus } : loan
    ));
    

  };

  const getTotalAmount = () => {
    return loans.reduce((sum, loan) => sum + (loan.status === 'Issued' ? loan.amount : 0), 0);
  };

  const getStatusCount = (status) => {
    return loans.filter(loan => loan.status === status).length;
  };

  return (
    <div className="min-h-screen min-w-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Management</h1>
          <p className="text-gray-600">Manage staff loans and advance payments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {getTotalAmount().toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Currency className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('Pending')}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-blue-600">{getStatusCount('Issued')}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('Completed')}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add New Loan Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add New Loan Request
          </button>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-full mr-3">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{loan.staffName}</div>
                          <div className="text-sm text-gray-500">{loan.staffId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Rs. {loan.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Monthly: Rs. {loan.monthlyDeduction}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-4 h-4" />
                        Request: {(loan.requestDate).split('T')[0]}
                      </div>
                      <div>Repayment: {(loan.repaymentDate).split('T')[0]}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{loan.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[loan.status]}`}>
                          {statusIcons[loan.status]}
                          {loan.status}
                        </span>
                        {loan.status === 'Pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusUpdate(loan.id, 'Issued')}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(loan.id, 'Rejected')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {loan.status === 'Issued' && (
                          <button
                            onClick={() => handleStatusUpdate(loan.id, 'Completed')}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(loan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loan.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingLoan ? 'Edit Loan Request' : 'Add New Loan Request'}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Staff/Teacher
                      </label>
                      <select
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleStaffChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Staff Member</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.id} {staff.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Amount (Rs)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Request Date
                      </label>
                      <input
                        type="date"
                        name="requestDate"
                        value={(formData.requestDate).split('T')[0]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Repayment Date
                      </label>
                      <input
                        type="date"
                        name="repaymentDate"
                        value={(formData.repaymentDate).split('T')[0]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="At once">At once</option>
                        <option value="Monthly deduction">Monthly deduction</option>
                      </select>
                    </div>

                    { formData.type === 'Monthly deduction' && (
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Deduction (Rs)
                      </label>
                      <input
                        type="number"
                        name="monthlyDeduction"
                        value={formData.monthlyDeduction}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                        step="0.01"
                      />
                      </div>)}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Issued">Issued</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose of Loan
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., Medical Emergency, Personal Development, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes/Comments
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes or comments..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingLoan ? 'Update Loan' : 'Add Loan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanFacilityManagement;