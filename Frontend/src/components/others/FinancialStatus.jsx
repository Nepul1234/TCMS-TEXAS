import React, { useState, useEffect ,useRef} from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Download, Calendar, 
  PieChart, BarChart3, FileText, DollarSign, Filter,
  Clock, ArrowUpRight, ArrowDownRight, Eye, CreditCard
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, 
  BarChart, Bar, AreaChart, Area 
} from 'recharts';
import PDFExportComponent from './PDFGenerator';
import { useModal } from '../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../Buttons/Button';
import Swal from 'sweetalert2';



const FinancialDashboard = () => {
  // State for financial data
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactions: [],
    incomeByCategory: [],
    expenseByCategory: [],
    monthlyTrends: []
  });

  const [ReportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactions: [],
    incomeByCategory: [],
    expenseByCategory: [],
  });


  // State for filters and controls
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [report,setReport] = useState(null);
  let monthlyData = {};
  let monthlyTrends = [];
  const pdfRef = useRef();
  


  const fetchIncomeExpenseDetails = async () => {
    setLoading(true);
    try{
      const res = await fetch('/api/incomeExpense/getIncomeExpenseDetailsByYear', {
        method: 'POST',  
        headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('token')}`

        },
        body: JSON.stringify({
          year: selectedYear,
        }
        )});
        if(!res.status === 200){
          console.error('Failed to fetch income and expense details');
          return;
        }
        else{
          const data = await res.json();
            if (data) {
            data.allDetails.forEach(item => {
              const { month, type } = item;

              if (!monthlyData[month]) {
              monthlyData[month] = {
                month,
                income: 0,
                expenses: 0,
                balance: 0
              };
              }

              if (type === 'income' && item.total_income) {
              monthlyData[month].income = parseFloat(item.total_income);
              }

              if (type === 'expense' && item.total_expense) {
              monthlyData[month].expenses = parseFloat(item.total_expense);
              }

              monthlyData[month].balance =
              monthlyData[month].income - monthlyData[month].expenses;
            });
            }
            monthlyTrends = Object.values(monthlyData);
                  
            
          }
    }catch (error) {
      console.error('Error fetching income and expense details:', error);
    }
  };
  


  // Colors for charts
  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A2B'];

  const fetchFinancialData = async () => {
    setLoading(true);

    
    try {
      const res = await fetch('api/incomeExpense/getIncomeExpenseDetails',
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (res.status !== 200) {
      console.error('Failed to fetch income and expense details');
      return;
    }
    else{
      const data = await res.json();
      if(data){
      const Transactions = data.allDetails.map((item, index) => ({
        id: index + 1,
        type: item.type,
        category: item.Category,
        amount: parseFloat(item.Amount),
        date: item.Date,
        paymentMethod: item.Payment_method,
        description: item.Description,
        payer: item.type === 'income' ? (item.Payer || 'N/A') : undefined,
        payee: item.type === 'expense' ? (item.Payee || 'N/A') : undefined,
      }));
      console.log('Fetched income and expense details:', Transactions);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totalExpenses = Transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);


      const totalIncome = Transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
          
      const incomeByCategory = Transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: t.category, value: t.amount });
          }
          return acc;
        }, []);

      const expenseByCategory = Transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: t.category, value: t.amount });
          }
          return acc;
        }, []);

      setFinancialData({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactions: Transactions,
        incomeByCategory,
        expenseByCategory,
        monthlyTrends
      });
      }
     }
      

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    setLoading(true);

     try {
      const res = await fetch('api/incomeExpense/getMonthlyDataForReporting',
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`

      },
      body: JSON.stringify({
        month: selectedMonth,
        year: selectedYear,
    })});
    if (!res.status === 200) {
      alert('Failed to fetch income and expense details for reporting');
      return}
    
    else{
      const data = await res.json();
      if(data){
      const Transactions = data.allDetails.map((item, index) => ({
        id: index + 1,
        type: item.type,
        category: item.Category,
        amount: parseFloat(item.Amount),
        date: item.Date,
        paymentMethod: item.Payment_method,
        description: item.Description,
        payer: item.type === 'income' ? (item.Payer || 'N/A') : undefined,
        payee: item.type === 'expense' ? (item.Payee || 'N/A') : undefined,
      }));
      console.log('Fetched income and expense details for reporting:', Transactions);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totalExpenses = Transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);


      const totalIncome = Transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
          
      const incomeByCategory = Transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: t.category, value: t.amount });
          }
          return acc;
        }, []);

      const expenseByCategory = Transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
            existing.value += t.amount;
          } else {
            acc.push({ name: t.category, value: t.amount });
          }
          return acc;
        }, []);

        setReportData({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          transactions: Transactions,
          incomeByCategory,
          expenseByCategory,

        })
      }
      }
    
    
      await new Promise(resolve => setTimeout(resolve, 2000));
      openModal();     
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
               title: 'Error!',
               text: 'No data for this selected month and year.',
               icon: 'error',
               confirmButtonText: 'OK!',
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
           return;
          
    } finally {
      setLoading(false);

    }
  };

  const handleDownload = () => {
      
      const reportData = {
        period: reportPeriod,
        month: selectedMonth,
        year: selectedYear,
        totalIncome: financialData.totalIncome,
        totalExpenses: financialData.totalExpenses,
        balance: financialData.balance,
        transactions: financialData.transactions,
        incomeByCategory: financialData.incomeByCategory,
        expenseByCategory: financialData.expenseByCategory
      };
      setReport(reportData);
           
    };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get percentage change (mock calculation)
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  useEffect(() => {
    fetchFinancialData();
    fetchIncomeExpenseDetails();
    
  }, [selectedMonth, selectedYear]);

  return (
    
    <div className="min-h-screen w-full rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Financial Dashboard</h1>
        </div>
        <div className="hidden">
            <div ref={pdfRef} style={{ padding: 20, backgroundColor: "#fff", width: "800px" }}>
              <h2>Monthly Financial Report</h2>

              <p>Income by Categories</p>
              <ul>
                {financialData.incomeByCategory?.map((category, index) => (
                  <li key={index}>
                    {category.name}: {category.value}
                  </li>
                ))}
              </ul>

              <p>Total Income: {financialData.totalIncome}</p>

              <p>Expenses by Category</p>
              <ul>
                {financialData.expenseByCategory?.map((category, index) => (
                  <li key={index}>
                    {category.name}: {category.value}
                  </li>
                ))}
              </ul>

              <p>Total Expenses: {financialData.totalExpenses}</p>
              <p>Balance: {financialData.balance}</p>
            </div>
          </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Total Income</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(financialData.totalIncome)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">
                    +{getPercentageChange(financialData.totalIncome, 4500)}%
                  </span>
                </div>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(financialData.totalExpenses)}</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-red-400 text-sm">
                    +{getPercentageChange(financialData.totalExpenses, 3200)}%
                  </span>
                </div>
              </div>
              <div className="bg-red-500/20 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(financialData.balance)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm">
                    +{getPercentageChange(financialData.balance, 1300)}%
                  </span>
                </div>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Generate Reports</h2>
            <FileText className="w-6 h-6 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Report Period</label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="daily" className="bg-slate-800">Daily</option>
                <option value="weekly" className="bg-slate-800">Weekly</option>
                <option value="monthly" className="bg-slate-800">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth((parseInt(e.target.value)))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i+1} className="bg-slate-800">
                    {new Date(2025, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={2025 - i} className="bg-slate-800">
                    {2025 - i}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => { generatePDFReport(); }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4 inline mr-2" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Income vs Expenses Bar Chart */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData.monthlyTrends.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" />
                <Bar dataKey="expenses" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income by Category */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Income by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={financialData.incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialData.incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={financialData.expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialData.expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Live Updates</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-sm font-medium text-slate-300 pb-3">Date</th>
                  <th className="text-left text-sm font-medium text-slate-300 pb-3">Category</th>
                  <th className="text-left text-sm font-medium text-slate-300 pb-3">Description</th>
                  <th className="text-left text-sm font-medium text-slate-300 pb-3">Method</th>
                  <th className="text-right text-sm font-medium text-slate-300 pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {financialData.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 text-sm text-slate-300">{formatDate(transaction.date)}</td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-sm text-white">{transaction.category}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-300">{transaction.description}</td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{transaction.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-medium ${
                          transaction.type === 'income'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
      <Modal isOpen={isOpen} className="max-w-[700px]  m-4" onClose={closeModal}>
  <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl dark:bg-gray-900 lg:p-8">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
          Financial Report for the month {selectedMonth} of {selectedYear}
        </h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Income and Expenses Summary
        </p>
      </div>
      <button 
        onClick={() => { closeModal(); location.reload(); }}
        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
      </button>
    </div>

    <div className="mt-8 flex flex-col">
      <div className="custom-scrollbar max-h-[400px] overflow-y-auto px-1 pb-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <p className="text-sm text-green-700 dark:text-green-300">Total Income</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">
             Rs. {ReportData.totalIncome}
            </p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-300">Total Expenses</p>
            <p className="text-2xl font-bold text-red-800 dark:text-red-200 mt-1">
              Rs. {ReportData.totalExpenses}
            </p>
          </div>
          
          <div className={`rounded-xl p-4 border ${
            ReportData.balance >= 0 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'
          }`}>
            <p className="text-sm text-gray-700 dark:text-gray-300">Net Balance</p>
            <p className={`text-2xl font-bold ${
              ReportData.balance >= 0 
                ? 'text-blue-800 dark:text-blue-200' 
                : 'text-amber-800 dark:text-amber-200'
            } mt-1`}>
              Rs. {ReportData.balance}
            </p>
          </div>
        </div>

        {/* Income Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-green-500 rounded-full mr-3"></div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
              Income By Category
            </h5>
          </div>
          
          <div className="space-y-3">
            {ReportData.incomeByCategory?.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{category.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Rs. {category.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-red-500 rounded-full mr-3"></div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
              Expenses By Categories
            </h5>
          </div>
          
          <div className="space-y-3">
            {ReportData.expenseByCategory?.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{category.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Rs. {category.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => { closeModal(); location.reload(); }}
        >
          Close Report
        </Button>
        <Button 
          size="sm" 
          variant="primary" 
          onClick={() => {handleDownload();}}
          className="flex items-center"
        >
          Download PDF
        </Button>
      </div>
    </div>

    {/* Hidden PDF Component */}
    
  </div>
</Modal>
    {report && <PDFExportComponent
        expenseByCategory={ReportData.expenseByCategory}
        month={selectedMonth}
        year={selectedYear}
        incomeByCategory={ReportData.incomeByCategory}
        totalIncome={ReportData.totalIncome}
        totalExpenses={ReportData.totalExpenses}
        balance={ReportData.balance}
        autogenerate={true}
      />}
    </div>
    
  );
};

export default FinancialDashboard;