import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Lock, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function PasswordReset() {
  const [step, setStep] = useState(1);
  const [id, setId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('weak');
  
  const otpRefs = useRef([]);
  
  // Password validation
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
  
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forget-password/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
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
  
  const handleVerifyOtp = async() => {
    setLoading(true);
    const otpValue = Number(otp.join(''));
    try {
      const res = await fetch('/api/verify-otp/verifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, otpValue }),
        
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

  
  
  const handleResetPassword = async () => {
    const otpValue = Number(otp.join(''));
    setLoading(true);
    if (newPassword !== newPasswordConfirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/reset-password/updatePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, otpValue, newPassword }),
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
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
                            <p className="text-gray-500 text-sm mt-1">Enter your ID to receive a verification code</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter your ID"
                                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <button
                            onClick={handleSendOtp}
                            disabled={!id || loading}
                            className={`w-full py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium transition-all ${
                                !id || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
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
                            Didn't receive a code? <button className="text-blue-600 hover:underline">Resend code</button>
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
                        <Link to = '/'> 
                        <button
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium transition-all"
                        
                        >
                            Return to Login
                        </button></Link>
                    </div>
                )}
            </div>
        </div>
    </div>
);
}