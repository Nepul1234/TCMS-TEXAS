import React, { useState } from "react";
import IDCardGenerator from "../../components/ID generator/IdCardGenerator"; 

const ParentComponent = () => {
  const [student, setStudent] = useState(null);

  const studentData = {
    fullName: "John Doe",
    indexNumber: "TG1048",
    instituteName: "TEXAS"
  };

  const generateIDCard = () => {
    setStudent(studentData);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Generate Student ID Card</h1>
      <button onClick={generateIDCard}>Generate ID Card</button>

      {/* Render IDCardGenerator only when student is set */}
      {<IDCardGenerator student={studentData} autoGenerate={true} />}
    </div>
  );
};

export default ParentComponent;
