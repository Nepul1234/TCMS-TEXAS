import React from 'react'
import Header from "../../components/Header/Header"
import Sidebar from "../../components/Sidebar/Sidebar"
import MonthlySalesChart from '../../components/charts/MonthlyIncomeChart'
import MonthlyTarget from '../../components/charts/MonthlyTarget'
import Calendar from '../../components/Calendar/Calendar'
import AdminNoticeBoard from '../Admin/NoticeBoard'
import CountQueuingStrategyer from '../../components/charts/CountOnLoad'
import Notifications from './Notifications'
import StatisticsChart from '../../components/charts/StatiticsChart'
import RecentHallBookings from '../../components/charts/RecentOrders'
import NewSidebar from '../../components/Sidebar/NewSidebar'
import { useEffect } from 'react';


export default function SuperAdminDashboard() {
   const [content,setContent] = React.useState([]);


   useEffect(() => {
         const user = JSON.parse(localStorage.getItem("user"));
         if(user?.role !== "super_admin") {
              alert("You do not have permission to access this page");
              window.location.href = "/login";
          }
           const token = localStorage.getItem("token");
           if (!token) {
               alert("Please login to access this page");
               window.location.href = "/login";
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
                    if (data.message === "Token expired" || "Invalid token") {
                       alert("Session expired, please login again");
                       window.location.href = "/login";
   
                     }
                 } catch (error) {
                    console.log("Message",error,token);
                 }
           }
           verifyToken();
        },[]);
      React.useEffect(() => {
         const fetchData = async () => {
            try {
               const res = await fetch('/api/dashboard/getDashboardInfo', 
                  {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(),
                  });
               const data = await res.json();
               if (!res.ok) {
                  console.error('Error fetching data:', data.message);
                  return;
               }
               setContent(data);
               console.log(data);
            } catch (error) {
               console.log(error.message);
            }
         };
         fetchData();
      }, []);

  return (
   <div>
      <Header/>
      <NewSidebar/>
    <div className="p-4 sm:ml-64">
   <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <div className="grid grid-cols-3 sm:grid-col-3  gap-4 mb-4">
      <div className="grid grid-col-1  items-center justify-items-center h-auto border-1 border-blue-600 rounded-lg dark:bg-gray-800 p-3">
            <p className="text-2xl text-purple-800 font-light dark:text-gray-500">
               Number of Students
            </p>
            <p className="text-2xl text-purple-800 font-medium dark:text-gray-500">
            <CountQueuingStrategyer targetNumber={content.studentCount} duration={1000} />
            </p>
         </div>
         <div className="grid grid-cols-1 items-center justify-items-center h-auto border-1 border-blue-600 rounded-lg dark:bg-gray-800 p-3">
         <p className="text-2xl text-purple-800 font-light dark:text-gray-500">
               Number of Teachers
            </p>
            <p className="text-2xl text-purple-800 font-medium dark:text-gray-500">
            <CountQueuingStrategyer targetNumber={content.teacherCount} duration={1000} />
            </p>
         </div>
         <div className="grid grid-cols-1 items-center justify-items-center h-auto border-1 border-blue-600 rounded-lg dark:bg-gray-800 p-3">
         <p className="text-2xl text-purple-800 font-light dark:text-gray-500">
               Number of Courses
            </p>
            <p className="text-2xl text-purple-800 font-medium dark:text-gray-500">
            <CountQueuingStrategyer targetNumber={content.courseCount} duration={1000} />
            </p>
         </div>
      </div>
      <div className=" mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">
         <MonthlySalesChart/>
      </div>
      <div className=" mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">
         <RecentHallBookings/>
      </div>

      
      <div className=" mb-3 rounded-sm bg-gray-50 dark:bg-gray-800">
         <StatisticsChart/>
      </div>

      
      
      
      <div className="mb-3 rounded-sm bg-gray-50 h-full dark:bg-gray-800">
         <Notifications/>
      </div>
      <div className="grid grid-row-1 gap-4">
         <div className="flex items-center justify-center rounded-sm bg-gray-50 h-auto dark:bg-gray-800">
            <AdminNoticeBoard/>
         </div>
         
      </div>
   </div>
</div>
</div>
    
  )
}
