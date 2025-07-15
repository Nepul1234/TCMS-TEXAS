import React from 'react'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import  Button  from "../../components/Buttons/Button";
import { useState } from 'react';
import StudentPaymentInterface from './StudentPayments';




export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [formData, setFormData] = useState({
    //student_id ,grade, teacher_name, course_type
        student_id: "",
        grade: "",
        teacher_name: "",
        course_type: "",
       
        
      });
      const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Updating ${name} to ${value}`);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
      const handleSubmit = async(e) => {
        e.preventDefault();
        if(!formData.student_id || !formData.grade || !formData.teacher_name || !formData.course_type ){
          alert("Please fill out all the fields");
          return;
        }
        setLoading(true);
        try{
          const res = await fetch('/api/student_payment_details/getStudentPaymentDetails',
          {
            method:'POST',
            headers:{
              'Content-Type':'application/json',
            },
            body:JSON.stringify(formData),
      
          });
          const data = await res.json();
          console.log(formData);
          if(data.success === false){
            alert("No payment Details");;
            setLoading(false);
            return;
          }
          else{
            setLoading(false);
            setDetails(data);
          }
          }catch(error){
             setLoading(false);
             alert("Error in Fetching details",error);
  
          }
      }
          
  return (
    <div>
          <Header/>
          <Sidebar/>
        <div className="p-4 sm:ml-64">
       <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div className="grid gap-3 mb-4">
          <div className="flex items-center justify-center h-24 border-1 border-amber-400 rounded-lg dark:bg-gray-800">
                <p className="text-2xl text-gray-400 dark:text-gray-500">
                   Student Payment
                </p>
             </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
            <div className="flex  h-auto border-1 border-amber-400 rounded-lg dark:bg-gray-800 p-2">
               <StudentPaymentInterface/>
           

         </div>
         </div>
         </div>
          
          </div>
       </div>
    

  )
}
