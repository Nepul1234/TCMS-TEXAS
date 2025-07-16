import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { useModal } from "../../components/hooks/useModal";
import { Modal } from "../../components/ui/Modal";
import Button from "../../components/Buttons/Button";
import Sidebar from '../../components/Sidebar/Sidebar';
import StudentIdCard from '../../components/others/StudentID';
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { form } from 'framer-motion/client';
import AdminIdCard from '../../components/others/AdminID';
import NewSidebar from '../../components/Sidebar/NewSidebar';

export default function AdminRegistration() {
  const [loading, setLoading] = useState(false);
  const notyf = new Notyf();
  const [details, setDetails] = useState([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [password, setPassword] = useState(false);
  const [formContent, setFormContent] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [condition, setCondition] = useState(false);

  useEffect(() => {
          const token = localStorage.getItem("token");
          if (!token) {
              alert("Please login to access this page");
              window.location.href = "/login";
           }
          const user = JSON.parse(localStorage.getItem("user"));
          if(user?.role !== "super_admin") {
              alert("You do not have permission to access this page");
              Navigate("/login");
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

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    address: '',
    city: '',
    country: '',
    state: '',
    zipcode: '',
    mobileno: '',
    gender: '',
    password: '',
    pwd: '',
    emp_no: '',
    dob:'',
    nic:'',
    nationality: '',
    martial_status: '',
    emp_type: '',
    emp_qualification: '',
    permenent_number: '',
    tax_id: '',
    epf_number: '',
    designation: '',
    salary:'',
    profile_picture: null,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.toLowerCase() !== formData.pwd.toLowerCase()) {
      notyf.error("Passwords are not matching");
      return;
    }
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
    if (
      !formData.fname ||
      !formData.lname ||
      !formData.address ||
      !formData.email ||
      !formData.gender ||
      !formData.mobileno ||
      !formData.password ||
      !formData.emp_no ||
      !formData.nic ||
      !formData.dob ||
      !formData.martial_status ||
      !formData.emp_type ||
      !formData.tax_id ||
      !formData.epf_number ||
      !formData.salary ||
      !formData.permenent_number ||
      !formData.designation ||
      !formData.country ||
      !formData.nationality ||
      !formData.state   

    ) {
      notyf.error("Please fill out all the fields");
      return;
    }
    if (!selectedFile) {
      notyf.error("Please upload a profile picture");
      return;
    }

    if (passwordStrength === 'weak') {
      notyf.error("Password is too weak. Please follow the password guidelines.");
      return;
    }

    if (!condition) {
      notyf.error("Please agree to the terms and guidelines issued by the institute.");
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
    data.append("emp_no", formData.emp_no);
    data.append("dob", formData.dob);
    data.append("nic", formData.nic);
    data.append("nationality", formData.nationality);
    data.append("martial_status", formData.martial_status);
    data.append("emp_type", formData.emp_type);
    data.append("emp_qualification", formData.emp_qualification);
    data.append("permenent_number", formData.permenent_number);
    data.append("tax_id", formData.tax_id);
    data.append("epf_number", formData.epf_number);
    data.append("designation", formData.designation);
    data.append("salary", formData.salary);



    setLoading(true);
    try {
      const res = await fetch('/api/register/registerEmployee', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (!res.ok) {
        notyf.error("Error in registration, please try again" + result.message);
        setLoading(false);
        return;
      } else {
        setLoading(false);
        console.log("Registered successfully");
        setDetails(result);
        openModal();
      }
    } catch (error) {
      alert("Error in registration", error);
      setLoading(false);
      return;
    }
  };

  return (
    <div>
      <Header />
      <NewSidebar/>
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div className="grid gap-3 mb-4">
            <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-blue-800 font-light dark:text-gray-500">
                Employee Registration
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
                        <label htmlFor="emp_reg_no">Employee Registration Number</label>
                        <input
                          type="text"
                          name="emp_no"
                          id="emp_no"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: ABC123"
                          required
                        />
                      </div>
                      <div className="md:col-span-5">
                        <label htmlFor="first_name">First Name</label>
                        <input
                          type="text"
                          name="fname"
                          id="fname"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: Harry123"
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
                          placeholder="Ex: Ramanayake"
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
                          placeholder="email@domain.com"
                          required
                        />
                      </div>
                      <div className="md:col-span-5">
                        <label htmlFor="nic">NIC number</label>
                        <input
                          type="text"
                          name="nic"
                          id="nic"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: 123456789V"
                          required
                        />
                      </div>
                      <div className="md:col-span-5">
                        <label htmlFor="qualification">Qualification/Education</label>
                        <input
                          type="text"
                          name="emp_qualification"
                          id="emp_qualification"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: Degree in Computer Science"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="nationality">Nationality</label>
                        <select
                          name="nationality"
                          id="nationality"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          required
                        >
                          <option value="">select a nationality</option>
                          <option value="sinhala">Sinhala</option>
                          <option value="tamil">Tamil</option>
                          <option value="other">Other</option>
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
                          placeholder="Ex: 123 Main St"
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
                          placeholder="Ex: Colombo"
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
                          placeholder="Ex: Sri Lanka"
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
                          placeholder="Ex: Western"
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
                          placeholder="Ex: 12345"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="gender">Enter the gender</label>
                        <select
                          name="gender"
                          id="gender"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          required
                        >
                          <option value="">select a gender</option>
                          <option value="m">Male</option>
                          <option value="f">Female</option>
                          <option value="o">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-5">
                        <label htmlFor="telno">Enter the mobile number</label>
                        <input
                          type="text"
                          name="mobileno"
                          id="mobileno"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          maxLength={10}
                          onChange={handleChange}
                          placeholder="Ex: 0712345678"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label htmlFor="telno">Enter the permenant mobile number</label>
                        <input
                          type="text"
                          name="permenent_number"
                          id="permenent_number"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          maxLength={10}
                          placeholder="Ex: 0112345678"
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="marital">Marital status</label>
                        <select
                          name="martial_status"
                          id="martial_status"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          required
                        >
                          <option value="">select one</option>
                          <option value="married">Married</option>
                          <option value="not married">Not married</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label htmlFor="designation">Designation</label>
                        <select
                          name="designation"
                          id="designation"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          required
                        >
                          <option value="">select one</option>
                          <option value="admin">Admin</option>
                          <option value="clerk">Clerk</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="marital">Employee type</label>
                        <select
                          name="emp_type"
                          id="emp_type"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          required
                        >
                          <option value="">select one</option>
                          <option value="part time">Part time</option>
                          <option value="full time">Full time</option>
                          <option value="contract">Contract</option>
                        </select>
                      </div>

                      <div className="md:col-span-5">
                        <label htmlFor="tax number">TAX number</label>
                        <input
                          type="text"
                          name="tax_id"
                          id="tax_id"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: 123456789"
                          required
                        />
                      </div>

                      <div className="md:col-span-5">
                        <label htmlFor="epf">EPF/ETF number</label>
                        <input
                          type="text"
                          name="epf_number"
                          id="epf_number"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: 123456789"
                          required
                        />
                      </div>

                      <div className="md:col-span-5">
                        <label htmlFor="epf">Salary</label>
                        <input
                          type="number"
                          name="salary"
                          id="salary"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          onChange={handleChange}
                          placeholder="Ex: 50000.00"
                          required
                        />
                      </div>

                      <div class="md:col-span-5">
                          <div class="inline-flex items-center">
                             <input type="checkbox" name="condition" checked ={condition} onChange={(e) => setCondition(e.target.checked)} id="condition" className="form-checkbox" />
                             <label for="registration_fee_status" class="ml-2">Agreed to all the terms and guidelines issued by the institute.</label>
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
                          placeholder="Enter a strong password"
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
                          placeholder="Re-enter the password"
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
                              <button
                                type="button"
                                className="text-red-500 ml-1"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setImagePreview(null);
                                  setFormData(prev => ({ ...prev, profile_picture: null }));
                                }}
                              >
                                Remove Image </button>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-5 text-right">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          onClick={handleSubmit}
                        >
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
              New Admin Confirmation
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Confirm details please!.
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
                  <AdminIdCard
                    photoUrl={imagePreview}
                    name={details.fname + " " + details.lname}
                    adminEmail={details.email}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  closeModal();
                  location.reload();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
