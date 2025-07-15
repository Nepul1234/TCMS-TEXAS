//test page for testing the new course data fetching
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserData from "../../components/hooks/courseData";

export default function NewTest() {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [count, setCount] = useState(0);
    const { courseData } = useUserData();
    const navigate = useNavigate();
    return (

        <div className="bg-white text-blue-700 font-sans">
            <section className="max-w-full mx-auto my-8 p-4 bg-white rounded-lg">
                <main className="border-b border-gray-600 py-2 text-lg font-bold">
                    <ul className="flex justify-between">
                        <li>course ID</li>
                        <li>Course Name</li>
                        <li>Course Type</li>
                        <li>Payment Status</li>
                    </ul>
                </main>

                <section className="space-y-4 mt-4">
                    {courseData && courseData.length > 0 ? (
                        courseData.map((item, index) => (
                            <article key={index} className="p-5 border-l-4 border-orange-400 hover:bg-gray-300 transition">
                                <ul className="flex justify-between">
                                    <li>{item.course_id}</li>
                                    <li>{item.course_name}</li>
                                    <li>{item.course_type}</li>
                                    
                                </ul>
                            </article>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm mt-2">No payment details available.</p>
                    )}
                </section>
            </section>
            <p>{courseData ? "Y" : "N"}</p>
        </div>
    );
}