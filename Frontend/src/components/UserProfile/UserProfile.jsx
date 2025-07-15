import React from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import UserInfoCard from './UserInfoCard'
import UserMetaCard from './UserMetaCard'
import UserAddressCard from './UserAddressCard'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import NewSidebar from '../Sidebar/NewSidebar'


export default function UserProfile() {
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
  const { user } = useAuth();
  const uid = user?.uid ?? "Guest"; 
  const role = user?.role ?? "guest"; // Default to 'guest' if role is not defined
  return (
    <div>
        <Header/>
        {role === "super_admin" ? <NewSidebar/> : <Sidebar/>}
        <div className='p-4 sm:ml-64'>
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                 <div className="grid gap-3 mb-4">
                     <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">
                         <p className="text-2xl text-blue-500 dark:text-gray-500">
                          Profile Settings
                         </p>
                      </div>
                     <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
                       <UserMetaCard id = {uid}/>
                    </div>
                    <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
                         <UserInfoCard id = {uid}/>
                    </div>
                    <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
                         <UserAddressCard id = {uid}/>
                    </div>
                </div>
            </div>
            </div>
    </div>
  )
}
