import React from 'react'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import  Button  from "../../components/Buttons/Button";
import { useState,useEffect } from 'react';
import StudentPaymentInterface from './StudentPayments';
import StudentAttendanceInterface from './StudentAttendace';
import { useAuth } from "../../components/context/AuthContext";



export default function Attendace() {
  useEffect(() => {
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
  
          
  return (
    <div>
          <Header/>
          <Sidebar/>
        <div className="p-4 sm:ml-64">
       <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div className="grid gap-3 mb-4">
          <div className="flex items-center justify-center h-24 border-1 border-amber-400 rounded-lg dark:bg-gray-800">
                <p className="text-2xl text-violet-700 dark:text-gray-500">
                   Student Attendance
                </p>
             </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
            <div className="flex  h-auto border-1 border-amber-400 rounded-lg dark:bg-gray-800 p-2">
               <StudentAttendanceInterface/>
           

               </div>
           </div>
         </div>
          
          </div>
       </div>
    

  )
}
