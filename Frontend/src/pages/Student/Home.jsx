import React, { useState, useEffect } from "react"
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import DateIndicator from "../../components/DatePicker/DateIndicator"
import ClassHoursBarGraph from "../../components/StudyGraph/ClassHoursBarGraph"
import DashboardMetrics from "../../components/DashboardMetrics/DashboardMetrics"
import Announcements from "../../components/Announcements/announcements"
import UpcomingAssignments from "../../components/UpcomingAssignments/UpcomingAssignments"
import QuickLinks from "../../components/QuickLinks/QuickLinks"
import { useAuth } from "../../components/context/AuthContext"
import { AlertCircle } from "lucide-react"


export default function Home() {
  const { user, logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)



  // Get current time to display appropriate greeting
  const hours = new Date().getHours()
  const greeting = hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening"

 useEffect(() => {
          const token = localStorage.getItem("token");
          const userData = JSON.parse(localStorage.getItem("user"));
          setUserData(userData);
          if (!token) {
              alert("Please login to access this page");
              location.href = "/login";
           }
          const verifyToken = async () => {
             try {
                 const res = await fetch('/api/auth/verifyToken', {
                   method: 'POST',
                   headers: {
                      'Authorization': `Bearer ${token}`,
                   },
                });
                   const data = await res.json();
                   if (data.message === "Token expired") {
                      alert("Session expired, please login again");
                      location.href = "/login";
                    }
                } catch (error) {
                   console.log("Message",error,token);
                }
          }
          verifyToken();
       },[]);


  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if we couldn't get user data
  if (error) {
    return (
      <div className="flex bg-white min-h-screen">
        <Header />
        <Sidebar />
        <div className="p-6 sm:ml-64 pt-20 flex items-center justify-center min-h-[80vh] w-full">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button 
              onClick={() => window.location.href = "/login"}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Header />
      <Sidebar />

      {/* Main content */}
      <div className="p-4 sm:ml-64 pt-20 w-full">
        <div className="pb-6">
          {/* Dashboard Header with Greeting */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg mb-4">
            <div className="absolute top-0 right-0 w-40 h-40 transform translate-x-8 -translate-y-8">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
                <path
                  fill="white"
                  d="M42.8,-68.2C54.9,-62.3,63.7,-49.2,69.2,-35.3C74.8,-21.3,77,-6.5,74.9,7.5C72.8,21.5,66.3,34.7,56.6,44.3C46.9,53.9,34,59.9,20.6,64.4C7.3,68.9,-6.6,71.8,-20.8,69.7C-35,67.6,-49.5,60.5,-59.3,49.3C-69.1,38.1,-74.2,22.9,-75.6,7.4C-77,-8.1,-74.7,-23.9,-67.3,-36.6C-59.9,-49.3,-47.4,-59,-34.2,-64.3C-21,-69.6,-7,-70.5,6.4,-70.5C19.8,-70.5,30.7,-74.1,42.8,-68.2Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>
            <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
              <div>
                <p className="text-blue-100 text-lg mb-1">{greeting}</p>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center">
                  Hey, {userData?.username || "Student"} <span className="ml-2 animate-wave inline-block">👋</span>
                </h1>
                <p className="mt-2 text-blue-100 max-w-lg">
                  Welcome back to your dashboard.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
              </div>
            </div>
          </div>

          {/* Dashboard Metrics */}
          <div className="mb-6">
            <DashboardMetrics />
          </div>

          {/* Two Column Layout for Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Class Hours Graph with Card Styling */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Class Schedule</h2>
                  <div className="flex items-center">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-gray-500">Live</span>
                  </div>
                </div>
                <ClassHoursBarGraph studentId={userData?.id} />
              </div>

              {/* Announcements with Card Styling */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Announcements</h2>
                  <div className="flex items-center">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span className="text-sm text-gray-500 mr-1">New</span>
                  </div>
                </div>
                <Announcements />
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Calendar Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendar</h2>
                <DateIndicator />
              </div>

              {/* Upcoming Assignments Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Assignments</h2>
                <UpcomingAssignments />
              </div>

              {/* Quick Links Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
                <QuickLinks />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add wave animation */}
      <style jsx>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave 2.5s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}