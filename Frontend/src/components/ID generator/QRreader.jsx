import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = () => {
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const qrCodeScanner = new Html5Qrcode(qrCodeRegionId);
        html5QrCodeRef.current = qrCodeScanner;

        await qrCodeScanner.start(
          { facingMode: "environment" }, // You can try "user" for front camera
          {
            fps: 10, // frames per second
            qrbox: { width: 250, height: 250 },
          },
          (decodedText, decodedResult) => {
            console.log("QR Code Scanned:", decodedText);
            alert(`QR Code Detected: ${decodedText}`);
            qrCodeScanner.stop(); // Stop after one successful scan
          },
          (errorMessage) => {
            console.warn("QR Scan Error:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startScanner();

    return () => {
      // Stop the scanner on component unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
        });
      }
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
      <div id={qrCodeRegionId} style={{ width: '300px' }}></div>
    </div>
  );
};

export default QrScanner;
