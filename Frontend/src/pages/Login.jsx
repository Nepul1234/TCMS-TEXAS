import React, { useState } from "react";
import { data, Link, useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";
import { useAuth } from "../components/context/AuthContext";
import { Notyf } from "notyf";
import { useEffect, useRef } from "react";
import { Eye, EyeClosed} from "lucide-react";
import { ArrowRight, Lock, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useModal } from "../components/hooks/useModal";
import { Modal } from "../components/ui/modal"
import "notyf/notyf.min.css";


const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [step, setStep] = useState(1);
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState('weak');


  const otpRefs = useRef([]);


  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength('weak');
    } else if (newPassword.length < 8) {
      setPasswordStrength('weak');
    } else if (/^[a-zA-Z0-9]*$/.test(newPassword)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [newPassword]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  const notyf = new Notyf();
  const handleChange = (e) => {
    setFormData({
     ...formData,
      [e.target.id]:e.target.value,
    });   
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.password) {
      notyf.error("Please fill out all the fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json(); 
      if(res.status != 200) {
        notyf.error("Invalid username or password");
        setLoading(false);
        return;
      }else{
        setLoading(false);
        const token = data.token; 
        notyf.success("Login successful");
        login(token);       
      }
    } catch (error) {
      setLoading(false);
      notyf.error("Error in Fetching details");
      console.error(error);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json(); 
      if(res.ok) {
        setMessage(data.message);
        console.log(data.message);
        setStep(2);     
      }
    } catch (error) {
      setMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const otpValue = Number(otp.join(''));
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpValue }),
        
      });
      console.log(otpValue);
      const data = await res.json(); 
      if(res.ok) {
        setMessage(data.message);
        setStep(3);     
      }
    } catch (error) {
      setMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleResetPassword = async () => {
    const otpValue = Number(otp.join(''));
    setLoading(true);
    if (newPassword !== newPasswordConfirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpValue, newPassword }),
      });
      const data = await res.json(); 
      if(res.ok) {
        setMessage(data.message);
        setStep(4);     
      }
    } catch (error) {
      setMessage(error);
    } finally {
      setLoading(false);
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
            Log in to your account using email and password
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
            placeholder="Enter email"
            required
          />
          
          <div className="relative w-full">
           <input
             type={showPassword ? "text" : "password"}
             id="password"
             onChange={handleChange}
             className="h-12 px-4 pr-12 border-2 border-gray-300 rounded mt-5 w-full focus:border-blue-500 focus:ring focus:ring-blue-300"
             placeholder="Enter password"
             required
           />
            <div
              className="absolute inset-y-0 right-0 flex items-center mt-5 pr-3 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <Eye className="w-5 h-5 text-gray-500" />
              ) : (
                <EyeClosed className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2.4 }}
            className="text-right mt-2 text-sm"
          >
            <button type="button" className="text-black" onClick={openModal}>
              Forgot Password?
            </button>
          </motion.p>
          <motion.button 
            type="submit"
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2.5 }}
            className="mt-4 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded text-sm tracking-wider hover:from-blue-500 hover:to-pink-500 hover:scale-105 "
          >
            {loading ? "Loading..." : "LOGIN TO LMS"}
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">

        <div className="max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mx-auto my-12">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h1 className="text-2xl font-bold text-white">Account Recovery</h1>
            <div className="flex mt-4">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-white' : 'text-gray-300'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-white bg-opacity-30' : 'bg-gray-200'}`}>1</div>
                <span className="text-xs mt-1">ID</span>
              </div>
              <div className="flex-1 border-t border-white border-opacity-30 relative top-4 mx-2"></div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-white' : 'text-gray-300'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-white bg-opacity-30' : 'bg-gray-200'}`}>2</div>
                <span className="text-xs mt-1">OTP</span>
              </div>
              <div className="flex-1 border-t border-white border-opacity-30 relative top-4 mx-2"></div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-white' : 'text-gray-300'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? 'bg-white bg-opacity-30' : 'bg-gray-200'}`}>3</div>
                <span className="text-xs mt-1">Reset</span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Mail className="mx-auto text-blue-500 mb-2" size={32} />
                  <h2 className="text-xl font-bold text-gray-800">Recover your account</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your email to receive a verification code</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Your Email</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your ID"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!email || loading}
                  className={`w-full py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium transition-all ${
                    !email || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="ml-2" size={16} />}
                </button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Mail className="mx-auto text-blue-500 mb-2" size={32} />
                  <h2 className="text-xl font-bold text-gray-800">Enter verification code</h2>
                  <p className="text-gray-500 text-sm mt-1">We've sent a 6-digit code to your registered email</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Verification Code</label>
                  <div className="flex justify-between space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otp.some(digit => digit === '') || loading}
                  className={`w-full py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium transition-all ${
                    otp.some(digit => digit === '') || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                  {!loading && <ArrowRight className="ml-2" size={16} />}
                </button>
                
                <p className="text-center text-sm text-gray-500">
                  Didn't receive a code? <button type="button" className="text-blue-600 hover:underline">Resend code</button>
                </p>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Lock className="mx-auto text-blue-500 mb-2" size={32} />
                  <h2 className="text-xl font-bold text-gray-800">Create new password</h2>
                  <p className="text-gray-500 text-sm mt-1">Your new password must be different from previous passwords</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                                passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                                'w-full bg-green-500'
                              }`}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-500 capitalize">{passwordStrength}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {message && (
                  <div className="text-red-500 text-sm">{message}</div>
                )}
                
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={!newPassword || !newPasswordConfirm || newPassword !== newPasswordConfirm || loading}
                  className={`w-full py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium transition-all ${
                    !newPassword || !newPasswordConfirm || newPassword !== newPasswordConfirm || loading ? 
                    'bg-gray-400 cursor-not-allowed' : 
                    'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                  {!loading && <ArrowRight className="ml-2" size={16} />}
                </button>
              </div>
            )}
            
            {step === 4 && (
              <div className="text-center space-y-6">
                <CheckCircle className="mx-auto text-green-500" size={64} />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Password Reset Successful</h2>
                  <p className="text-gray-500 mt-2">You can now log in with your new password</p>
                </div>
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium transition-all"
                  onClick={() => {
                    closeModal();
                    navigate('/login');
                  }}
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
