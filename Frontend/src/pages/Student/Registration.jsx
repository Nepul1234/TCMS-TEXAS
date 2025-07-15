import React from 'react'
import Header from '../../components/Header/StudentHeader';
import Sidebar from '../../components/Sidebar/StudentSidebar';
import {useState} from 'react'

export default function Registration() {
  const [mydata,setData] = useState(" ");
  const myfunc = async() =>{
    try{
      const res = await fetch('/api/get_student_payment_details_byId/getStudentPaymentDetailsById',
      {
        method:'GET',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({id:"TE0001"}),
  
      });
      const data = await res.json();
      setData(data)

    }catch(error){

    }
  }
  

  return (
    <div>
        <input type='button 'onClick={myfunc} value="Get Data"/>
        <p>{mydata}</p>
    </div>
  )
}
