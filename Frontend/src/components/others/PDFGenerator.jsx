import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PDFExportComponent({expenseByCategory, totalIncome, totalExpenses, balance, incomeByCategory, autogenerate, month, year}) {
  const pdfRef = useRef();

  useEffect(() => {
  if (
    autogenerate &&
    incomeByCategory?.length > 0 &&
    expenseByCategory?.length > 0
  ) {
    setTimeout(() => {
      generatePDF();
    }, 0);
  }
}, [true]);
   

  const generatePDF = async () => {
    console.log("Generation starts");
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("report_for_" + month + "_" + year + ".pdf");
  };

  return (
    <div className="pdf-export-component">
      <div  ref = {pdfRef} style={{ 
      padding: "20px", 
      backgroundColor: "#fff", 
      width: "100%",
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      borderRadius: "8px"
    }}>
      <h2 style={{
        textAlign: "center",
        color: "#2c3e50",
        marginBottom: "25px",
        paddingBottom: "15px",
        borderBottom: "1px solid #ecf0f1",
        fontSize: "26px",
        fontWeight: "600"
      }}>
        Monthly Financial Report for the month {month} of {year}
      </h2>

      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "25px", 
        marginBottom: "25px" 
      }}>
        {/* Income Section */}
        <div style={{ 
          flex: "1", 
          minWidth: "300px", 
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          padding: "15px",
          borderLeft: "4px solid #3498db"
        }}>
          <h3 style={{
            color: "#3498db",
            marginTop: "0",
            marginBottom: "15px",
            fontSize: "18px",
            fontWeight: "600"
          }}>
            Income by Categories
          </h3>
          
          <ul style={{ 
            listStyle: "none", 
            padding: "0", 
            margin: "0 0 15px 0" 
          }}>
            {incomeByCategory?.map((category, index) => (
              <li key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #edf2f7"
              }}>
                <span style={{ color: "#4a5568" }}>{category.name}</span>
                <span style={{ fontWeight: "600", color: "#3498db" }}>
                  Rs. {category.value}
                </span>
              </li>
            ))}
          </ul>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid #e2e8f0",
            fontWeight: "600",
            fontSize: "16px"
          }}>
            <span>Total Income:</span>
            <span style={{ color: "#27ae60" }}>Rs. {totalIncome}</span>
          </div>
        </div>

        {/* Expenses Section */}
        <div style={{ 
          flex: "1", 
          minWidth: "300px", 
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          padding: "15px",
          borderLeft: "4px solid #e74c3c"
        }}>
          <h3 style={{
            color: "#e74c3c",
            marginTop: "0",
            marginBottom: "15px",
            fontSize: "18px",
            fontWeight: "600"
          }}>
            Expenses by Category
          </h3>
          
          <ul style={{ 
            listStyle: "none", 
            padding: "0", 
            margin: "0 0 15px 0" 
          }}>
            {expenseByCategory?.map((category, index) => (
              <li key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #edf2f7"
              }}>
                <span style={{ color: "#4a5568" }}>{category.name}</span>
                <span style={{ fontWeight: "600", color: "#e74c3c" }}>
                  Rs. {category.value}
                </span>
              </li>
            ))}
          </ul>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid #e2e8f0",
            fontWeight: "600",
            fontSize: "16px"
          }}>
            <span>Total Expenses:</span>
            <span style={{ color: "#c0392b" }}>Rs. {totalExpenses}</span>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div style={{ 
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        border: "1px solid #edf2f7"
      }}>
        <div style={{ 
          marginBottom: "10px",
          fontSize: "14px",
          color: "#718096"
        }}>
          NET BALANCE
        </div>
        <div style={{
          fontSize: "32px",
          fontWeight: "700",
          color: balance >= 0 ? "#27ae60" : "#c0392b"
        }}>
          Rs. {balance}
        </div>
        <div style={{ 
          height: "4px",
          background: balance >= 0 ? "linear-gradient(90deg, #27ae60, #2ecc71)" : "linear-gradient(90deg, #c0392b, #e74c3c)",
          margin: "15px auto 0",
          borderRadius: "2px",
          maxWidth: "300px"
        }}></div>
      </div>
    </div>
   </div>
  );
}
