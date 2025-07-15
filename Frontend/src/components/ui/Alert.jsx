import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export default function Alert({
  type = 'info',
  title,
  message,
  autoClose = false,
  autoCloseTime = 5000,
  showIcon = true,
  showCloseButton = true,
  onClose = () => {},
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto close effect
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  // Alert styles based on type
  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: <Info className="text-blue-500" />,
      iconBg: 'bg-blue-100',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: <CheckCircle className="text-green-500" />,
      iconBg: 'bg-green-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      icon: <AlertCircle className="text-yellow-500" />,
      iconBg: 'bg-yellow-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: <XCircle className="text-red-500" />,
      iconBg: 'bg-red-100',
    },
  };
  
  const styles = typeStyles[type] || typeStyles.info;
  
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${styles.bg} ${styles.border} ${className}`} role="alert">
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 ${styles.iconBg}`}>
            {styles.icon}
          </div>
        )}
        
        <div className="flex-1">
          {title && <h5 className={`font-medium ${styles.text}`}>{title}</h5>}
          <div className={`${title ? 'mt-1' : ''} text-sm ${styles.text}`}>{message}</div>
        </div>
        
        {showCloseButton && (
          <button 
            type="button" 
            onClick={handleClose} 
            className={`ml-2 flex-shrink-0 rounded-full p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.text}`}
          >
            <span className="sr-only">Close</span>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}