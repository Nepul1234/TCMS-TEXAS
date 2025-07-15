import React from 'react'
import { useState,useEffect } from 'react';
import Header from '../../components/Header/Header'
import { useModal } from "../../components/hooks/useModal";
import { Modal } from "../../components/ui/modal";
import  Button  from "../../components/Buttons/Button";
import Sidebar from '../../components/Sidebar/Sidebar'
import Footer from '../../components/Footer/Footer';
import NewFooter from '../../components/Footer/NewFooter';
import StudentIdCard from '../../components/others/StudentID'
import IDCardGenerator from "../../components/ID generator/IdCardGenerator";
import { Notyf } from "notyf";
import { useAuth } from "../../components/context/AuthContext";

export default function Registration() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const notyf = new Notyf();
  const [details, setDetails] = useState([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [studentId, setStudentId] = useState(null);
  const [password,setPassword] = useState(false);
  const [formContent,setFormContent] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [formData, setFormData] = useState({
      fname: '',
      lname:'',
      email: '',
      address: '',
      city: '',
      dob:'',
      school:'',
      grade:'',
      nic:'',
      country: '',
      state: '',
      zipcode: '',
      mobileno: '',
      parent_mn:'',
      gender:'',
      password:'',
      pwd:'',
      profile_picture: null,   
    });



    useEffect(() => {
          const token = localStorage.getItem("token");
          if (!token) {
              notyf.error("Please login to access this page");
              logout();
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
                   if (data.message === "Token expired") {
                       alert("Session expired, please login again");
                      logout();
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
      handleFileChange(e); // Call handleFileChange to update the preview
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (e.target.name === 'password') {
        setNewPassword(e.target.value);
      }
    }

    
  };
    const handleDownload = () => {
      
      const studentData = {
        fullName: details.fname + " " + details.lname,
        indexNumber: details.studentId,
        instituteName: "TEXAS"
      };
      setStudentId(studentData);
           
    };

    const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      profile_picture: file,
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
        !formData.email || 
        !formData.gender ||
        !formData.mobileno ||
        !formData.grade ||
        !formData.school ||
        !formData.dob ||
        !formData.parent_mn ||
        !formData.password){
        notyf.error("Please fill out all the required fields");
        return;
      }
      if (!selectedFile) {
        notyf.error("Please upload a profile picture");
        return;
      }
      if(passwordStrength === 'weak'){
        notyf.error("Password is too weak. Please follow the password guidelines.");
        return;
      }

      const data = new FormData();
      data.append("fname", formData.fname);
      data.append("lname", formData.lname);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("zipcode", formData.zipcode);
      data.append("mobileno", formData.mobileno);
      data.append("gender", formData.gender);
      data.append("password", formData.password);
      data.append("profile_picture", formData.profile_picture);
      data.append("dob", formData.dob);
      data.append("school", formData.school);
      data.append("grade", formData.grade);
      data.append("nic", formData.nic);
      data.append("parent_mn", formData.parent_mn);


     
      setLoading(true);
      try{
        const res = await fetch('/api/register/registerStudent',
        {
          method:'POST',
          body:data,  
        });
        const response = await res.json();
        if(response.success === false){
          notyf.error("User already exists" + response.message);
          setLoading(false);
          console.log(data);
          return;
        }
        else{
          setLoading(false);
          console.log("Registered sucessfully");
          setDetails(response);
          openModal();
        }
       
        }catch(error){
           alert("Error in registration",error);
           setLoading(false);
           return;
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
                          Student Registration
                         </p>
                      </div>
                     <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
                         <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 ">
                            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                             <div className="text-gray-600">
                                <p className="font-medium text-lg">Add Personal Details</p>
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
                        type="text"
                        name="email"
                        id="email"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder="email@domain.com"
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="dob">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        id="dob"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder=""
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="school">School Name</label>
                      <input
                        type="text"
                        name="school"
                        id="school"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder="Royal College, Colombo 07"
                        required
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label htmlFor="nic">NIC number (If available)</label>
                      <input
                        type="text"
                        name="nic"
                        id="nic"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder="Ex: 200145608090"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                    <label htmlFor="grade">Grade</label>
                         <select 
                         name="grade" 
                         id="grade"
                         className='h-10 border mt-1 rounded px-4 w-full bg-gray-50'
                         onChange={handleChange}
                         required
                         >
                             <option value=''>select a grade</option>
                             <option value='1'>Grade 1</option>
                             <option value='2'>Grade 2</option>
                             <option value='3'>Grade 3</option>
                             <option value='4'>Grade 4</option>
                             <option value='5'>Grade 5</option>
                             <option value='6'>Grade 6</option>
                             <option value='7'>Grade 7</option>
                             <option value='8'>Grade 8</option>
                             <option value='9'>Grade 9</option>
                             <option value='10'>Grade 10</option>
                             <option value='11'>Grade 11</option>
                             <option value='12'>Grade 12</option>
                             <option value='13'>Grade 13</option>
                          </select>                   
                    </div>

                    <div className="md:col-span-3">
                      <label htmlFor="address">Address / Street</label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        placeholder='Ex: 123 Main St'
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder='Ex: Colombo'
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label htmlFor="country">Country / Region</label>
                      <input
                        type="text"
                        name="country"
                        id="country"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder='Ex: Sri Lanka'
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="state">State / Province</label>
                      <input
                        type="text"
                        name="state"
                        id="state"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder='Ex: Western'
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="zipcode">Zipcode</label>
                      <input
                        type="text"
                        name="zipcode"
                        id="zipcode"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder='Ex: 12345'
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                    <label htmlFor="gender">Enter the gender</label>
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
                      <label htmlFor="telno">Enter the mobile number</label>
                      <input
                        type="text"
                        name="mobileno"
                        id="mobileno"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        onChange={handleChange}
                        required
                      />
                    </div>
                   

                    <div className="md:col-span-5">
                      <label htmlFor="parent mobile number">Enter parent's mobile number</label>
                      <input
                        type="text"
                        name="parent_mn"
                        id="parent_mn"
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        maxLength={10}
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
                        maxLength={16}
                        placeholder='Enter a strong password'
                        onChange={handleChange}
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
                        maxLength={16}
                        placeholder='Re-enter the password'
                        onChange={handleChange}
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
                             <input type="checkbox" name="reg_fee" id="reg_fee" className="form-checkbox" />
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
                                  onChange={handleChange}
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
                            {selectedFile && (
                              <div className="mt-2 text-center">
                                <p className="text-sm text-gray-500">
                                  Selected file: {selectedFile.name}
                                </p>
                                <button
                                  type="button"
                                  className="text-red-500 ml-1"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setImagePreview(null);
                                    setFormData(prev => ({ ...prev, profile_picture: null }));
                                  }}
                                >
                                  Remove Image
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    
                    

                    <div className="md:col-span-5 text-right">
                    { password ? (<div class="flex items-center p-4 mb-4 mt-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <svg class="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                       </svg>
                        <span class="sr-only">Info</span>
                        <div>
                        <span class="font-medium">Danger alert!</span> Passwords are not matching
                        </div>
                       </div>):""}
                      { formContent ? (<div className="flex items-center p-4 mb-4 mt-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
                        <svg class="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                         </svg>
                         <span class="sr-only">Info</span>
                        <div>
                        <span class="font-medium">Warning alert!</span> Please fill out all the fields
                       </div>
                      </div>):" "}
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
          <Footer/>
        </div>
        <Modal isOpen={isOpen} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                      New Student Confirmation
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                      You can download student ID card now.
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
                              <StudentIdCard
                                  photoUrl={imagePreview}
                                  name= {details.fname + " " + details.lname}
                                  studentId={details.studentId}
                                  enrollDate={details.Enroll_date}
                                  
                               />
                               
                            </div>
                            
                     </div>
                      
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                      <Button size="sm" variant="outline" onClick={() => { closeModal(); location.reload();}}  >
                        Close
                      </Button>
                      <Button size="sm" variant="primary" onClick={handleDownload}>
                        Download
                      </Button>
                      

                      
                    </div>
                    {studentId && <IDCardGenerator student={studentId} autoGenerate={true} />}
                  </div>
                </div>
              </Modal>
             
    </div>
    
    

  )
}
