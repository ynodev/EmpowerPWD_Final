import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in`}>
      <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] 
        ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'}`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        )}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast; 