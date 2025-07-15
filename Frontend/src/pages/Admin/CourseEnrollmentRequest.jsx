import React from 'react'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import EnrollmentRequestsInterface from './EnrollmentRequestInterface';
import { useEffect } from 'react';


export default function CourseEnrollmentRequest() {
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
            <div className='p-4 sm:ml-64'>
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                     <div className="grid gap-3 mb-4">
                         <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">
                             <p className="text-2xl text-blue-800 font-light dark:text-gray-500">
                              Course Enrollment Requests
                             </p>
                          </div>
                          <div className="flex  rounded-sm bg-gray-50 dark:bg-gray-800">
                             <EnrollmentRequestsInterface/>
                          </div>

                        </div>
                    </div>
                </div>
            </div>
  )
}
