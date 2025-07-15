import React, { useEffect, useRef } from 'react'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from "react-qr-code";

const IDCardGenerator = ({ student, autoGenerate }) => {
  const idCardRef = useRef(null);
  const hasGenerated = useRef(false);

  const handleDownload = async () => {
    if (!student) return;

    const element = idCardRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [86, 54] // Standard ID card size
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 86, 54);
    pdf.save(`${student.indexNumber}_id_card.pdf`);
  };

  // Automatically generate ID card when the component mounts
  useEffect(() => {
    if (autoGenerate && !hasGenerated.current) {
      handleDownload();
      hasGenerated.current = true;
    }
  }, [autoGenerate]);// Runs only when autoGenerate changes

  return (
    <div>
      <div ref={idCardRef} style={{ 
        width: '340px',
        height: '210px',
        border: '2px solid #000',
        padding: '2px',
        backgroundColor: '#fff',
        position: 'absolute',
        left: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ marginBottom: '5px' }}>{student.instituteName}</h2>
        
        <div style={{ 
          margin: '5px 0',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '5px'
        }}>
          <QRCode 
            value={student.indexNumber}
            size={100}
            includeMargin={true}
          />
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '5px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
            {student.fullName}
          </div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>
            ID: {student.indexNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCardGenerator;
