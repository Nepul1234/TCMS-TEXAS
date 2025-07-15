import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';

const QRScanner = () => {
  const [student_id, setStudentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const html5QrCodeRef = useRef(null);
  const qrCodeRegionId = useRef("qr-reader");

  const startCamera = async () => {
    setError('');
    setScanResult(null);
    setStudentId('');
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    try {
      setIsScanning(true);
      const qrCodeScanner = new Html5Qrcode(qrCodeRegionId);
              html5QrCodeRef.current = qrCodeScanner;
      
              await qrCodeScanner.start(
                { facingMode: "environment" }, // user or environment camera
                {
                  fps: 10, // fps 10
                  qrbox: { width: 250, height: 350 },
                },
                (decodedText, decodedResult) => {
                  setStudentId(decodedText);
                  setScanResult(decodedText);
                  stopCamera();
                },
                (errorMessage) => {
                  console.warn("QR Scan Error:", errorMessage);
                }
              );
             
    } catch (err) {
      setError('Camera access denied or not available.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const resetScan = () => {
    setScanResult(null);
    setStudentId('');
    setError('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        QR Code Scanner
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
        Scan student ID QR code using your camera
      </p>

      <div className="flex flex-col">
        <div className="pb-3">
          <div className="mb-6">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90">
              Camera Scanner
            </h5>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-rows-1 ">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* QR Scanner View */}
              <div id = {qrCodeRegionId} className="relative w-full h-25 max-w-md aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {isScanning ? (
                  <div className="relative flex flex-col items-center justify-center h-fit">
                    <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      Scanning...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <Camera size={48} className="mb-2" />
                    <p className="text-sm text-center">Camera not active</p>
                  </div>
                )}
              </div>

              {/* Scan results */}
              {scanResult && (
                <div className="flex items-center space-x-2 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      QR Code Scanned Successfully
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Student ID: {student_id}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Student ID Display */}
              {student_id && (
                <div className="w-full max-w-md p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Captured Student ID:
                  </h6>
                  <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                    {student_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 justify-center lg:justify-end">
          {!isScanning && !scanResult && (
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={startCamera}
            >
              Start Scanning
            </button>
          )}

          {isScanning && (
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              onClick={stopCamera}
            >
              Stop Scanning
            </button>
          )}

          {scanResult && (
            <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              onClick={resetScan}
            >
              Scan Another
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-green-700"
              onClick={() => {
                localStorage.setItem('scanned_student_id', student_id);
                window.location.href = '/attendance';
              }}

            >
              Go to Attendance
            </button>
          </div>
          )
            
          }
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
