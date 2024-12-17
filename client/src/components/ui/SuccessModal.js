// SuccessModal.js
import React from 'react';

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Success!</h2>
        <p className="flex-grow">Your account has been successfully created.</p>
        
        <div className="flex justify-end">
        <button
          onClick={onClose}
          className="  mt-4 px-4 py-2 bg-black text-white rounded-xl rounded hover:bg-green"
        >
          Close
        </button>
        </div>
        
      </div>
    </div>
  );
};

export default SuccessModal;