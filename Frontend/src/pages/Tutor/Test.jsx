import React, { use, useState } from "react";
import Button from "../../components/Buttons/Button";

export default function Test({ data }) {
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    const handleClick = async (pay_id) => {
        try {
            setLoading(true);
            const res = await fetch("/api/update_student_payment/setStudentPaymentDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pay_id }), 
            });

            const responseData = await res.json();

            if (responseData.success === true) {
                alert("Payment updating successful");
            } else {
                alert("Payment Updated Successfully");
                setCount(count + 1);
            }
        } catch (error) {
            alert("Error in updating: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white text-blue-700 font-sans">
            <section className="max-w-full mx-auto my-8 p-4 bg-white rounded-lg">
                <main className="border-b border-gray-600 py-2 text-lg font-bold">
                    <ul className="flex justify-between">
                        <li>Student ID</li>
                        <li>Course Name</li>
                        <li>Course Type</li>
                        <li>Payment Status</li>
                    </ul>
                </main>

                <section className="space-y-4 mt-4">
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <article key={index} className="p-5 border-l-4 border-orange-400 hover:bg-gray-300 transition">
                                <ul className="flex justify-between">
                                    <li>{item.stu_id}</li>
                                    <li>{item.course_name}</li>
                                    <li>{item.course_type}</li>
                                    <li>
                                        {item.payment_status === "Paid" ? (
                                            "Paid"
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => handleClick(item.pay_id)}
                                                disabled={loading}
                                            >
                                                {loading ? "Loading..." : "Pay Now"}
                                            </Button>
                                        )}
                                    </li>
                                </ul>
                                <p className="text-gray-400 text-sm mt-2">{item.description}</p>
                            </article>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm mt-2">No payment details available.</p>
                    )}
                </section>
            </section>
        </div>
    );
}
