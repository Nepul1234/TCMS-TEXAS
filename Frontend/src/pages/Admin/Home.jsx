import React from 'react'
import Header from "../../components/Header/Header"
import Sidebar from "../../components/Sidebar/Sidebar"
import MonthlySalesChart from '../../components/charts/MonthlyIncomeChart'
import MonthlyTarget from '../../components/charts/MonthlyTarget'
import Calendar from '../../components/Calendar/Calendar'
import AdminNoticeBoard from './NoticeBoard'
import CountQueuingStrategyer from '../../components/charts/CountOnLoad'
import { Navigate, useNavigate} from 'react-router-dom'
import { useEffect } from 'react'
import Notifications from '../SuperAdmin/Notifications'
import { useAuth } from "../../components/context/AuthContext";
import { Notyf } from "notyf";
import EnrollmentRequestsTable from '../SuperAdmin/LoanFacilityInterface'
import "notyf/notyf.min.css";

export default function Home() {
   const { user, logout } = useAuth();
   const [content,setContent] = React.useState([]);
   const notify = new Notyf({});
   
   
   useEffect(() => {
           const token = localStorage.getItem("token");
           if (!token) {
               alert("Please login to access this page");
               window.location.href = "/login";
            }
            const user = JSON.parse(localStorage.getItem("user"));
            if(user?.role !== "admin") {
              alert("You do not have permission to access this page");
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
      
     useEffect(() => {
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
                console.error('Error fetching data:');
                return;
             }
             setContent(data);
          } catch (error) {
             console.log(error.message);
          }
      };
      
   fetchData();    
   }, []);
  return (
   <div>
      <Header/>
      <Sidebar/>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="rounded-sm bg-gray-50 h-full dark:bg-gray-800">
        <Notifications />
      </div>
      <div className="rounded-sm bg-gray-50 h-full dark:bg-gray-800">
        <MonthlyTarget />
      </div>
    </div>
      
      <div className="flex items-center justify-center h-auto mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">
         <Calendar/>
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
