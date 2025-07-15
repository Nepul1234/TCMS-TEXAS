import React, { useState, useRef } from 'react';
import { Calendar, DollarSign, Upload, X, Plus, Wallet, TrendingUp, TrendingDown, CreditCard, Building, User, FileText, Tag, Clock, Currency } from 'lucide-react';
import { sub } from 'framer-motion/client';
import Swal from 'sweetalert2';

const ExpenseIncomeTracker = () => {
  const [activeTab, setActiveTab] = useState('expense');
  const [transactions, setTransactions] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: '',
    payee: '',
    payer: '',
    description: '',
    receipt: null
  });

  const expenseCategories = [
    "Tutor Salaries", "Admin Staff Wages", "EPF/ETF", "Bonuses & Incentives", "Rents", "Equipments", "Utilities", "Office Supplies", "Marketing & Advertising", "Maintenance & Repairs", "Insurance", "Professional Fees", "Miscellaneous"
  ];

  const incomeCategories = [
     "Hall Bookings", "Late payement charges", "Sales", "Donations", "Sponsorships", "Miscellaneous"
  ];

  const paymentMethods = [
    'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Check', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      type: tab,
      category: '',
      payee: '',
      payer: ''
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          receipt: file
        }));
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          receipt: file
        }));
      }
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      receipt: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.amount || !formData.paymentMethod || 
        (!formData.payee && activeTab === 'expense') || 
        (!formData.payer && activeTab === 'income')) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create FormData to file upload
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    try{
      try {
      const res = await fetch('/api/incomeExpense/setIncomeExpenseDetails', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        method: 'POST',
        body: submitData,
      });
      const result = await res.json();
      if (!res.status === 200) {
        console.log("Error in operation", result.message);
        return;
      } else {
        console.log("updated successfully");
        Swal.fire({
                 title: 'Success!',
                 text: `Your ${activeTab} is recorded successfully'`,
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
    } catch (error) {
      alert("Error in operation", error);
      setLoading(false);
      return;
    }
    
      console.log('Sending data to backend:', Object.fromEntries(submitData));
      
      const newTransaction = {
        id: Date.now(),
        ...formData,
        timestamp: new Date().toISOString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      setFormData({
        type: activeTab,
        category: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: '',
        payee: '',
        payer: '',
        description: '',
        receipt: null
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    return type === 'expense' ? 
      <TrendingDown className="w-4 h-4 text-red-500" /> : 
      <TrendingUp className="w-4 h-4 text-green-500" />;
  };

  const getTypeColor = (type) => {
    return type === 'expense' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 rounded-xl">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Financial Management</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => handleTabChange('expense')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'expense'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Expense
                </button>
                <button
                  onClick={() => handleTabChange('income')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'income'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Income
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Tag className="w-4 h-4 inline mr-2" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {(activeTab === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                        <option key={cat} value={cat} className="bg-slate-800 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Currency className="w-4 h-4 inline mr-2" />
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select method</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method} className="bg-slate-800 text-white">
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payee/Payer */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {activeTab === 'expense' ? (
                        <>
                          <Building className="w-4 h-4 inline mr-2" />
                          Payee
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 inline mr-2" />
                          Payer
                        </>
                      )}
                    </label>
                    <input
                      type="text"
                      name={activeTab === 'expense' ? 'payee' : 'payer'}
                      value={activeTab === 'expense' ? formData.payee : formData.payer}
                      onChange={handleInputChange}
                      required
                      placeholder={activeTab === 'expense' ? 'Who did you pay?' : 'Who paid you?'}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Optional description"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-2" />
                    {activeTab === 'expense' ? 'Receipt' : 'Invoice'}
                  </label>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-400/10' 
                        : 'border-white/30 hover:border-white/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {formData.receipt ? (
                      <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium">{formData.receipt.name}</p>
                            <p className="text-slate-400 text-sm">
                              {(formData.receipt.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-slate-300">
                          Drag and drop your {activeTab === 'expense' ? 'receipt' : 'invoice'} here
                        </p>
                        <p className="text-slate-400 text-sm">or click to browse</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-200 transform hover:scale-105 ${
                    activeTab === 'expense'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  } shadow-lg hover:shadow-xl`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add {activeTab === 'expense' ? 'Expense' : 'Income'}
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="xl:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Live</span>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Add your first transaction above</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(transaction.type)}
                          <span className="font-medium text-white">
                            {transaction.category}
                          </span>
                        </div>
                        <span className={`font-bold ${getTypeColor(transaction.type)}`}>
                          {transaction.type === 'expense' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>{transaction.type === 'expense' ? 'Paid to' : 'From'}</span>
                          <span className="text-slate-300">
                            {transaction.type === 'expense' ? transaction.payee : transaction.payer}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span className="text-slate-300">{formatDate(transaction.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Method</span>
                          <span className="text-slate-300">{transaction.paymentMethod}</span>
                        </div>
                        {transaction.description && (
                          <div className="mt-2 text-slate-300 text-xs">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseIncomeTracker;