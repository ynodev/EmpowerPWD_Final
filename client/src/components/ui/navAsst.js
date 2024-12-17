import React, { useState } from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";

const NavAsst = ({ steps, currentStep }) => {
  const [showModal, setShowModal] = useState(false);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // Helper function to determine step status
  const getStepStatus = (stepId) => {
    if (currentStep > stepId) return 'completed';
    if (currentStep === stepId) return 'active';
    return 'upcoming';
  };

  return (
    <div>
      {/* Header Section */}
      <div className="p-4">
        {/* Top Left Logo */}
        <div className="absolute top-6 left-8 flex items-center gap-2">
          <img src={logo} alt="EmpowerPWD Logo" className="h-8" />
          <span className="font-bold text-lg">EmpowerPWD</span>
        </div>

        {/* Top Right Login Section */}
        <div className="absolute top-6 right-8">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" onClick={handleLoginClick} className="text-blue-600 font-medium">
            Login
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full p-4 flex justify-between items-center">
        <div className="w-full mt-12 font-poppins text-[15px]">
          <div className="max-w-7xl w-full mx-auto">
            <div className="flex flex-wrap items-center justify-between mb-4">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const isLast = index === steps.length - 1;

                return (
                  <div key={index} className="flex items-center mb-2 sm:mb-0">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                        status === 'completed' ? 'bg-blue-500 border-blue-500' : 
                        status === 'active' ? 'border-blue-600' : 
                        'border-gray-300'
                      }`}
                    >
                      {status === 'completed' ? (
                        // Checkmark for completed steps
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        // Number for active and upcoming steps
                        <span className={`text-sm ${
                          status === 'active' ? 'text-blue-800' : 
                          'text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Step Title */}
                    <span className={`ml-2 text-sm whitespace-nowrap transition-all duration-200 ${
                      status === 'completed' ? 'text-black font-medium' : 
                      status === 'active' ? 'text-blue-800' : 
                      'text-gray-400'
                    }`}>
                      {step.title}
                    </span>

                    {/* Connector Line */}
                    {!isLast && (
                      <div className={`flex-grow border-t mx-2 hidden sm:block ${
                        status === 'completed' ? 'border-black' : 'border-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 font-poppins">Confirm Navigation</h3>
            <p className="text-gray-600 mb-6 font-poppins">
              Are you sure you want to leave the registration process? Your progress will not be saved.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-poppins"
              >
                Cancel
              </button>
              <Link
                to="/login"
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-poppins"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavAsst;