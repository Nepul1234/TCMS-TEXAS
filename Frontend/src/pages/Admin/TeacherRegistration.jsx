import React from 'react'
import { useState,useEffect } from 'react';
import Header from '../../components/Header/Header'
import { useModal } from "../../components/hooks/useModal";
import { Modal } from "../../components/ui/modal"
import  Button  from "../../components/Buttons/Button";
import Sidebar from '../../components/Sidebar/Sidebar'
import StudentIdCard from '../../components/others/StudentID'
import TutorIdCard from '../../components/others/TutorID';
import IDCardGenerator from "../../components/ID generator/IdCardGenerator";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export default function TeacherRegistration() {
  
  const [loading, setLoading] = useState(false);
  const notyf = new Notyf();
  const [details, setDetails] = useState([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [studentId, setStudentId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [regfee, setRegFee] = useState(false);
  const [formData, setFormData] = useState({
      fname: '',
      lname:'',
      email: '',
      address: '',
      country: '',
      state: '',
      gender: '',
      dob: '',
      nic: '',
      mobileno: '',
      qualification: '',
      password:'',
      pwd:'',
      profile_picture: null,
      reg_fee: false,
      
    });

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

    const handleChange = (e) => {
    if (e.target.name === 'profile_picture') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
      handleFileChange(e); 
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (e.target.name === 'password') {
        setNewPassword(e.target.value);
      }
     
      
    }
    };
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        profile_picture:file,
      }));
      
  
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
      }
    };
  
    
    const handleSubmit = async(e) => {
      e.preventDefault();
      
      if(formData.password.toLowerCase() !== formData.pwd.toLowerCase()){
        notyf.error("Passwords are not matching");
        return;
      }
      if(formData.fname && !/^[A-Za-z]*$/.test(formData.fname)){
        notyf.error("Please Enter a valid first name");
        return;
      }
      if(formData.lname && !/^[A-Za-z]*$/.test(formData.lname)){
        notyf.error("Please Enter a valid first name");
        return;
      }
      if(formData.mobileno && !/^[0-9]{10}$/.test(formData.mobileno)){
        notyf.error("Please Enter a valid mobile number");
        return;
      }
      
      if(!formData.fname || 
        !formData.lname || 
        !formData.address ||
        !formData.state ||
        !formData.dob ||
        !formData.nic ||
        !formData.gender ||
        !formData.country || 
        !formData.email || 
        !formData.qualification ||
        !formData.mobileno ||
        !formData.password ||
        !formData.profile_picture 
      ){
        notyf.error("Please fill out all the required fields");
        return;
      }

      if(!regfee){
        notyf.error("Fill fill out all the required fields");
        return;
      }
      
      if(passwordStrength === 'weak'){
        notyf.error("Password is too weak. Please choose a stronger password.");
        return;
      }

      const data = new FormData();
      data.append("fname", formData.fname);
      data.append("lname", formData.lname);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("mobileno", formData.mobileno);
      data.append("gender", formData.gender);
      data.append("password", formData.password);
      data.append("profile_picture", formData.profile_picture);
      data.append("dob", formData.dob);
      data.append("nic", formData.nic);
      data.append("qualification", formData.qualification);

      
      setLoading(true);
      try {
        const res = await fetch('/api/register/registerTeacher', {
          method: 'POST',
          body: data,
        });
        const result = await res.json();
        if (result.success === false) {
          alert("User already exists" + result.message);
          setLoading(false);
          return;
        } else {
          setLoading(false);
          console.log("Registered successfully");
          setDetails(result);
          openModal();
        }
        console.log(formData);
      } catch (error) {
        alert("Error in registration", error);
        setLoading(false);
      }
        
    };
  return (
    <div>
        <Header/>
        <Sidebar/>
        <div className='p-4 sm:ml-64'>
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                 <div className="grid gap-3 mb-4">
                     <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">
                         <p className="text-2xl text-blue-800 font-light dark:text-gray-500">
                          Teacher Registration
                         </p>
                      </div>
                     <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
                         <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 ">
                            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                             <div className="text-gray-600">
                                <p className="font-medium text-lg">Add Teacher Details</p>
                                <p>Please fill out all the required fields.</p>
                             </div>
                             <div className="lg:col-span-2">
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                    <div className="md:col-span-5">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        name="fname"
                        id="fname"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder='Ex: Harry'
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        name="lname"
                        id="lname"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder='Ex: Ramanayake'
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder="email@domain.com"
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="email">NIC number</label>
                      <input
                        type="number"
                        name="nic"
                        id="nic"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder="99XXXXXXV"
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="email">Birth Date</label>
                      <input
                        type="date"
                        name="dob"
                        id="dob"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder="YYYY-MM-DD"
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                    <label htmlFor="gender">Gender</label>
                         <select 
                         name="gender" 
                         id="gender"
                         className='h-10 border mt-1 rounded px-4 w-full bg-gray-50'
                         onChange={handleChange}
                         required
                         >
                             <option value=''>select a gender</option>
                             <option value='m'>Male</option>
                             <option value='f'>Female</option>
                             <option value='o'>Other</option>
                          </select>
                    
                    </div>
                  

                    <div className="md:col-span-5">
                      <label htmlFor="address">Address / Street</label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder='Ex: 123 Main St, Colombo 07'
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="city">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        id="qualification"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder='Ex: BSc in Computer Science'
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label htmlFor="country">Country / Region</label>
                      <input
                        type="text"
                        name="country"
                        id="country"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder='Ex: Sri Lanka'
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="state">State / Province</label>
                      <input
                        type="text"
                        name="state"
                        id="state"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder='Ex: Western Province'
                        onChange={handleChange}
                      />
                    </div>

                    

                    <div className="md:col-span-5">
                      <label htmlFor="telno">Enter the mobile number</label>
                      <input
                        type="text"
                        name="mobileno"
                        id="mobileno"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        maxLength={10}
                        placeholder='Ex: 0712345678'
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div class="md:col-span-5">
                          <div class="inline-flex items-center">
                             <input type="checkbox"  onChange={handleChange} className="form-checkbox" checked />
                             <label for="registration_fee_status" class="ml-2">This password will be used for the LMS access. Choose a strong password.</label>
                          </div>
                      </div>
                    

                  
                    <div className="md:col-span-2">
                      <label htmlFor="telno">Enter a password</label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        maxLength={10}
                        onChange={handleChange}
                        placeholder='choose a strong password'
                        required
                      />
                    </div>
                    

                    <div className="md:col-span-2">
                      <label htmlFor="telno">Re-enter the password</label>
                      <input
                        type="password"
                        name="pwd"
                        id="pwd"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        maxLength={10}
                        onChange={handleChange}
                        placeholder='re-enter the password'
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    passwordStrength === 'weak'
                                      ? 'w-1/3 bg-red-500'
                                      : passwordStrength === 'medium'
                                      ? 'w-2/3 bg-yellow-500'
                                      : 'w-full bg-green-500'
                                  }`}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500 capitalize">
                                {passwordStrength}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              <p className="mb-1">Password Guidelines:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Include at least one number (0-9)</li>
                                <li>Include at least one special character (!@#$%^&*)</li>
                                <li>Maximum length of 16 characters</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      <div class="md:col-span-5">
                          <div class="inline-flex items-center">
                             <input type="checkbox" name="reg_fee" checked ={regfee} onChange={(e) => setRegFee(e.target.checked)} id="reg_fee" className="form-checkbox" />
                             <label for="registration_fee_status" class="ml-2">Registration Fees are received.</label>
                          </div>
                      </div>

                      <div className="md:col-span-5">
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <img
                              src="src/assets/fileupload.png"
                              alt="fileupload"
                              className="mx-auto h-12 w-12 text-white"
                            />
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                <span>Upload a profile picture</span>
                                <input
                                  id="file-upload"
                                  name="profile_picture"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1 text-blue">or drag and drop</p>
                            </div>
                            <p className="text-xs text-blue">PNG, JPG, GIF up to 10MB</p>
                            {imagePreview && (
                              <div className="mt-4 flex justify-center">
                                <div className="text-center">
                                  <p>Image Preview:</p>
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-md object-cover mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    

                    <div className="md:col-span-5 text-right">
                    
                      
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleSubmit}>
                        {loading ? "Loading..." : "Submit"}
                      </button>
                      
                    </div>
                  </div>
                </div>
                
            </div>
          </div>
          </div>
          </div>              
          </div>
        </div>
        <Modal isOpen={isOpen} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                      New Teacher Confirmation
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                        Please verify the details before proceeding.
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                     
                      <div className="mt-7">
                        <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                          Personal Information
                        </h5>
                        </div>
                        <div className="grid grid-rows-1 gap-2 lg:grid-cols-1 mt-15">
                           <div className="flex items-center justify-center">
                               <TutorIdCard
                                     photoUrl="src/assets/student.png"
                                     name= {details.fname + " " + details.lname}
                                     studentId={details.teacherId}
                                     enrollDate={details.enrolledon}
                                 />
                               
                            </div>
                            
                     </div>
                      
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                      <Button size="sm" variant="outline" onClick={() => { closeModal(); location.reload();}}  >
                        Close
                      </Button>
                      <Button size="sm" variant="primary" onClick={()=>{closeModal();location.reload();}}>
                        Confirm
                      </Button>
                      

                      
                    </div>
                  </div>
                </div>
              </Modal>
             
    </div>
    
    

  )
}
