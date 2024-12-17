// src/ui/TermsModal.js
import React from 'react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
        <h2 className="text-lg font-bold">Terms and Conditions</h2>
        <p className="mt-2">
          {/* Your Terms and Conditions content goes here */}
          Please read these Terms and Conditions carefully before using our service...
        </p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-black text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

// Export the TermsModal component
export default TermsModal;