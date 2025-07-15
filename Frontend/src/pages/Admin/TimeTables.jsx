import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Buttons/Button';
import Testing from '../../components/charts/TimeTable';
import { useEffect } from 'react';


export default function TimeTables() {
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);

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


  const handleSubmit = async(e) => {
    e.preventDefault();

    // Getting the content from the TinyMCE editor
    const content = document.querySelector("tinymce-editor")?.value || '';
    const grade = document.getElementById("grade").value;
    setEditorContent(content);
    if(content == " " || grade == " "){
        alert("Please fill out the content before submitting");
        return;
    }
      console.log("Content:", content);
      setLoading(true);
      try{
        const res = await fetch('/api/set/setTimetables',
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
          },
          body:JSON.stringify({ content, grade }),
    
        });
        const data = await res.json();
        if(data.success === false){
          alert("Error in uploading data");;
          setLoading(false);
          console.log(content,grade);
          return;
        }
        else{
          setLoading(false);
          console.log("Time table updated sucessfully");
        }
        console.log('Submitted Content:', content);
        }catch(error){
           setLoading(false);
           alert("Error",error);

        }
        console.log('Submitted Content:', content);
    };

     // This should now log the correct content
  

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <Testing/>
        </div>
      </div>
      </div>
    
    
  );
}
