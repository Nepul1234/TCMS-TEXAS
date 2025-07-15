import React, { useState } from "react";
import { data, Link, useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";


const Login = () => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [userdata, setUserData] = useState({});
  const handleChange = (e) => {
    setFormData({
     ...formData,
      [e.target.id]:e.target.value,
    });   
};

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    try{
      const res = await fetch('/api/auth/signin',
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(formData),
  
      });
      const data = await res.json();
      
      if(data.success === false){
        console.log("success error");
        return;
      }
      else{
        localStorage.setItem('token', data.token);
        const t_id = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;   
        const teacher_name = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).username; 
        const userDetails = {t_id, teacher_name};
        const userData = [
          {
            t_id: t_id,
            teacher_name: teacher_name
          }
        ]
        localStorage.setItem("userData", JSON.stringify(userDetails));
        
        navigate('/')
      }

      }catch(error){
         console.log("error", error);
      }
      
  };
  

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <motion.div 
        initial={{ opacity: 0, width: 0 }} 
        animate={{ opacity: 1, width: "550px", padding: "20px 40px" }} 
        transition={{ duration: 1, delay: 1 }}
        className="flex flex-col justify-center items-center w-[440px]"
      >
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2 }}
            className="text-2xl font-bold text-indigo-700"
          >
            Welcome Back
          </motion.h2>
          <motion.h4 
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2.1 }}
            className="mt-2 text-sm text-gray-500"
          >
            Log in to your account using Username and Password
          </motion.h4>
        </div>
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: -40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 2.2 }}
          className="mt-10 w-4/5 flex flex-col"
        >
          <input
            type="text"
            id="id"
            onChange={handleChange}
            className="h-12 px-4 border-2 border-gray-300 rounded mt-5 focus:border-blue-500 focus:ring focus:ring-blue-300"
            placeholder="Enter username"
            required
          />
          <input
            type="password"
            id="password"
            onChange={handleChange}
            className="h-12 px-4 border-2 border-gray-300 rounded mt-5 focus:border-blue-500 focus:ring focus:ring-blue-300"
            placeholder="Enter Password"
            required
          />
          <motion.p 
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2.4 }}
            className="text-right mt-2 text-sm"
          >
            <a href="#" className="text-black">
              Forgot Password?
            </a>
          </motion.p>
          <motion.button 
            type="submit"
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2.5 }}
            className="mt-4 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded text-sm tracking-wider hover:from-blue-500 hover:to-pink-500 hover:scale-105 "
          >
            {loading ? "Loading..." : "LOGIN"}
          </motion.button>
        </motion.form>
      </motion.div>
      {/* Right Section */}
      <div
        className="flex-1 bg-black bg-cover bg-center transition-all"
        style={{
          backgroundImage:
          "url('src/assets/bc-four.jpg')"
        }}
      ></div>
    </div>
  );
};

export default Login;
