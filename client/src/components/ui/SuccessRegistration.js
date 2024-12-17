import React from 'react';
import { CheckCircle, Home, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuccessRegistration = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
            Registration Submitted!
          </h1>
          <p className="text-gray-600 mb-8 font-poppins">
            Thank you for registering. We are currently reviewing your account. 
            You will receive an email notification once your account has been verified.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              to="/login"
              className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-poppins"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Back to Login
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-poppins"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessRegistration; 