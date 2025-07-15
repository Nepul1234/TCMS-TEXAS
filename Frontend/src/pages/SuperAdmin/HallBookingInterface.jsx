import React from 'react'
import Header from '../../components/Header/Header'
import HallBookingSystem from '../../components/others/HallBookingsUI'
import NewSidebar from '../../components/Sidebar/NewSidebar'
import { useEffect } from 'react'

export default function() {
  useEffect(() => {
          const token = localStorage.getItem("token");
          const user = JSON.parse(localStorage.getItem("user"));
          if(user?.role !== "super_admin") {
              alert("You do not have permission to access this page");
              window.location.href = "/login";
          }
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
        <NewSidebar/>
        <HallBookingSystem/> 
    
    </div>
  )
}
