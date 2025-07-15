//hook for accessing user data in the application
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useUserData() {
    const [courseData, setCourseData] = useState([]);
    const navigate = useNavigate();
    const temp = localStorage.getItem('user');
    const tempId = temp ? JSON.parse(temp).id : 'ID not found';
    useEffect(() => {
        const fetchTeacherCourseData = async () => {
            try {
                const res = await fetch("/api/getTutorcoursesGetByTutorId/getByTutorId", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ teacher_id: tempId }) 
                });
                
                const data = await res.json();
                
                if (res.status === 200) {
                    if (data) {
                        const courseDetails = data;
                        setCourseData(courseDetails);
                        console.log("Course data fetched successfully:", courseDetails);
                    }
                }
            } catch (error) {
                console.error("Error fetching teacher data:", error);
                navigate('/login');
            }
        }
        fetchTeacherCourseData();
    }, [tempId, navigate]);

    return { courseData};
}
