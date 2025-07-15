import React, { useState, useEffect } from 'react';
import Header from "../../components/Header/TutorHeader";
import Sidebar from "../../components/Sidebar/TutorSidebar";
import { 
  DollarSign, TrendingUp, Calendar, CreditCard, 
  PieChart, BarChart2, Download, ArrowUp, ArrowDown, Filter 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import useUserData from '../../components/hooks/courseData';


const Earnings = () => {
  const [earningsData, setEarningsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const { courseData } = useUserData();
  
  
  // Filter states
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  let courseDetails;

  // Fetch data from API
  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/get_tutor_earnings/get_tutor_earnings');
        const result = await response.json();
        
        if (result.success) {
          setEarningsData(result.data);
          setFilteredData(result.data);
          setTotalCount(result.count);
        } else {
          setError('Failed to fetch earnings data');
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = earningsData;

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(item => item.course_id === selectedCourse);
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(item => item.Grade === parseInt(selectedGrade));
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(item => item.month === selectedMonth);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.time);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === filterDate.getTime();
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(item => new Date(item.time) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(item => new Date(item.time) >= filterDate);
          break;
        default:
          break;
      }
    }

    setFilteredData(filtered);
  }, [selectedCourse, selectedGrade, selectedMonth, dateFilter, earningsData]);

  // Calculate totals
  const totalAmount = filteredData.reduce((sum, item) => sum + item.Amount, 0);
  const myEarnings = totalAmount * 0.7; // 70% after deducting 30%

  // Get unique values for dropdowns
  const uniqueCourses = [...new Set(earningsData.map(item => ({ id: item.course_id, name: item.course_name })))];
  const uniqueGrades = [...new Set(earningsData.map(item => item.Grade))].sort((a, b) => a - b);
  const uniqueMonths = [...new Set(earningsData.map(item => item.month))];

  // Prepare chart data
  //Mark
  courseDetails = filteredData.reduce((acc, item) => {
    const existing = acc.find(c => c.course_id === item.course_id);
    if (existing) {
      existing.amount += item.Amount;
      existing.count += 1;
    } else {
      acc.push({
        course_id: item.course_id,
        course_name: item.course_name,
        amount: item.Amount,
        count: 1
      });
    }
    return acc;
  }, []);

  const gradeData = filteredData.reduce((acc, item) => {
    const existing = acc.find(g => g.grade === item.Grade);
    if (existing) {
      existing.amount += item.Amount;
      existing.count += 1;
    } else {
      acc.push({
        grade: item.Grade,
        amount: item.Amount,
        count: 1
      });
    }
    return acc;
  }, []);

  // LKR currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Colors for charts
  const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading earnings data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-blue-800 flex items-center">
                <DollarSign className="mr-2" size={24} />
                Earnings 
              </h1>
        
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">Total Payments</p>
                    <h3 className="text-2xl font-bold text-blue-800">
                      {formatCurrency(totalAmount)}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">My Earnings (70%)</p>
                    <h3 className="text-2xl font-bold text-blue-800">
                      {formatCurrency(myEarnings)}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">Total Payments</p>
                    <h3 className="text-2xl font-bold text-blue-800">
                      {filteredData.length}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500">Texas Institute Fee (30%)</p>
                    <h3 className="text-2xl font-bold text-blue-800">
                      {formatCurrency(totalAmount * 0.3)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
              <div className="flex items-center mb-4">
                <Filter className="mr-2 text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-blue-800">Filters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Courses</option>
                    {courseData.map(course => (
                      <option key={course.id} value={course.course_id}>
                        {course.course_id} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select 
                    value={selectedGrade} 
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Grades</option>
                    {uniqueGrades.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Months</option>
                    {uniqueMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Course Revenue Chart */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-xl font-semibold text-blue-800 flex items-center mb-4">
                  <PieChart className="mr-2" size={20} />
                  Revenue by Course
                </h2>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={courseDetails}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({course_name, amount}) => `${course_name}: ${formatCurrency(amount)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {courseDetails.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grade Revenue Chart */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-xl font-semibold text-blue-800 flex items-center mb-4">
                  <BarChart2 className="mr-2" size={20} />
                  Revenue by Grade
                </h2>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" tickFormatter={(value) => `Grade ${value}`} />
                      <YAxis tickFormatter={(value) => `LKR ${value}`} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-blue-800">Payment Records</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Month
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map(payment => (
                      <tr key={payment.pay_id} className="hover:bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.time).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.course_name} ({payment.course_id})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Grade {payment.Grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(payment.Amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.month}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Payment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Texas Institute Fee (30%)</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAmount * 0.3)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">My Earnings (70%)</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(myEarnings)}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Earnings;