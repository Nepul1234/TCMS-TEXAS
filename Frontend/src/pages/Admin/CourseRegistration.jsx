import React, { use } from 'react'
import { useState, useEffect } from 'react';
import Header from '../../components/Header/Header'
import { useModal } from "../../components/hooks/useModal";
import { Modal } from "../../components/ui/modal"
import Button from "../../components/Buttons/Button";
import Sidebar from '../../components/Sidebar/Sidebar'
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { form } from 'framer-motion/client';

export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([]);
  const notyf = new Notyf();
  const [details, setDetails] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    cname: "",
    grade: "",
    tname: "",
    ctype: "",
    hall_alloc: "",
    starting_t: "",
    ending_t: "",
    Fees: "",
    weekday:""
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

  const fetchData = async () => {
    try {
      const res = await fetch('/api/profileData/getAllTeacherData', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      });
      const data = await res.json();
      setContent(data.data);
      if (!res.ok) {
        console.error('Error fetching data:', data.message);
        return;
      }
    } catch (error) {
      console.error('Error in fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleDownload = () => {
    // Download logic here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.cname ||
      !formData.grade ||
      !formData.tname ||
      !formData.ctype ||
      !formData.hall_alloc ||
      !formData.starting_t ||
      !formData.ending_t ||
      !formData.Fees
    ) {
      notyf.error("Please fill out all the fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register/registerCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(formData);
      if (data.success === false) {
        alert("Course Registration failed...!" + data.message);
        setLoading(false);
        return;
      } else {
        setLoading(false);
        console.log("New Course Registered successfully");
        setDetails(data);
        openModal();
      }
      console.log(formData);
    } catch (error) {
      setLoading(false);
      alert("Error in registration", error);
      return;
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className='p-4 sm:ml-64'>
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div className="grid gap-3 mb-4">
            <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl text-blue-800 font-light dark:text-gray-500">
                Course Registration
              </p>
            </div>
            <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
              <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 ">
                <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                  <div className="text-gray-600">
                    <p className="font-medium text-lg">Add New Course</p>
                    <p>Please fill out all the fields.</p>
                  </div>
                  <div className="lg:col-span-2">
                    <form className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                      <div className="md:col-span-5">
                        <label htmlFor="course_name">Course Name</label>
                        <input
                          type="text"
                          name="cname"
                          id="cname"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={formData.cname}
                          onChange={handleChange}
                          placeholder="Ex: Biology"
                          required
                        />
                      </div>

                      <div className="md:col-span-5">
                    <label htmlFor="grade">Grade</label>
                         <select 
                         name="grade" 
                         id="grade"
                         value={formData.grade}
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

                      <div className="md:col-span-5">
                        <label htmlFor="teacher_name">Teacher Name</label>
                        <select
                          name="tname"
                          id="tname"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={formData.tname}
                          onChange={handleChange}
                          onClick={fetchData}
                          required
                        >
                          <option value="">Select a Teacher</option>
                          {content.map((teacher) => (
                            <option key={teacher.teacher_id} value={`${teacher.fname} ${teacher.lname}`}>
                              {teacher.fname} {teacher.lname}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label htmlFor="course_type">Course Type</label>
                        <select
                          name="ctype"
                          id="ctype"
                          className='h-10 border mt-1 rounded px-4 w-full bg-gray-50'
                          value={formData.ctype}
                          onChange={handleChange}
                          placeholder="Ex: Theory"
                          required
                        >
                          <option value=''>select a course type</option>
                          <option value='theory'>Theory</option>
                          <option value='revision'>Revision</option>
                          <option value='theary and revision'>Theory and Revision</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="weekday">Select a weekday</label>
                        <select
                          name="weekday"
                          id="weekday"
                          className='h-10 border mt-1 rounded px-4 w-full bg-gray-50'
                          value={formData.weekday}
                          onChange={handleChange}
                          placeholder="Ex: Monday"
                          required
                        >
                          <option value=''></option>
                          <option value='monday'>Monday</option>
                          <option value='tuesday'>Tuesday</option>
                          <option value='wednesday'>Wednesday</option>
                          <option value='Thursday'>Thursday</option>
                          <option value='Friday'>Friday</option>
                          <option value='saturday'>Saturday</option>
                          <option value='sunday'>Sunday</option>
                        </select>
                      </div>

                      <div className="md:col-span-5">
                    <label htmlFor="hall allocation">Hall Allocation</label>
                         <select 
                         name="hall_alloc" 
                         id="hall_alloc"
                         value={formData.hall_alloc}
                         className='h-10 border mt-1 rounded px-4 w-full bg-gray-50'
                         onChange={handleChange}
                         required
                         >
                             <option value=''>select a Hall</option>
                             <option value='1'>Hall 1</option>
                             <option value='2'>Hall 2</option>
                             <option value='3'>Hall 3</option>
                             <option value='4'>Hall 4</option>                  
                          </select>                   
                    </div>

                      <div className="md:col-span-2">
                        <label htmlFor="starting_t">Starting time</label>
                        <input
                          type="text"
                          name="starting_t"
                          id="starting_t"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={formData.starting_t}
                          placeholder='Ex: 10:00 AM'
                          onChange={handleChange}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="state">Ending time</label>
                        <input
                          type="text"
                          name="ending_t"
                          id="ending_t"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={formData.ending_t}
                          placeholder='Ex: 12:00 PM'
                          onChange={handleChange}
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label htmlFor="course_fees">Fees (Rs)</label>
                        <input
                          type="text"
                          name="Fees"
                          id="Fees"
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={formData.Fees}
                          onChange={handleChange}
                          placeholder="Ex: 5000"
                        />
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
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          type="submit"
                          onClick={handleSubmit}
                        >
                          {loading ? "Loading..." : "Submit"}
                        </button>
                      </div>
                    </form>
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
              New Course Confirmation
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              You have registered a new course.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Course Information
                </h5>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mt-6">
                <h2 className="text-lg font-bold text-indigo-700 dark:text-gray-300 border-b pb-3 mb-4">
                  Course Details
                </h2>
                <div className="grid gap-4 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">📘 Course Name:</span>
                    <p className="ml-2">{formData.cname}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">👨‍🏫 Teacher:</span>
                    <p className="ml-2">{formData.tname}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">🎓 Grade:</span>
                    <p className="ml-2">{formData.grade}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">📂 Course Type:</span>
                    <p className="ml-2">{formData.ctype}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => { closeModal(); location.reload() }}>
                  Close
                </Button>
                <Button size="sm" variant="primary" onClick={() => { closeModal(); location.reload() }}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
