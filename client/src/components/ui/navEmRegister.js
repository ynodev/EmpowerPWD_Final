import React from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";


const NavEmRegister = ({ navStep }) => {
  const steps = [
    'Account Info ───',
    'Company Info ───',
    'Contact Info ───',
    'Accessibility Info ───',
    'Confirmation'
  ];

  return (
   
    <div>
      {/* Header Section */}
      <div className="p-4 ">
        <div className="absolute top-2 left-10 m-4 flex items-center">
          <img src={logo} alt="logo" className="w-10 h-10 mr-1 ml-2" /> 
          <span className="ml-2 text-[28px] font-semibold">EmpowerPWD</span>
        </div>
        <div className="absolute top-3 right-10 m-4 text-[15px]">
          <span className="text-sm">
            Already have an account?</span>
            <Link to="/" className="text-black font-bold ml-2">Login</Link>
        </div>
      </div>

      <div className="w-full p-4 flex justify-between items-center">
         {/* Progress Bar */}
         <div className="w-full mt-12 font-poppins text-[15px]">
          <div className="max-w-4xl w-full mx-auto ">
            <div className="flex flex-wrap items-center justify-between mb-4">
              {steps.map((step, index) => {
                const isCompleted = index + 1 < navStep;
                const isActive = index + 1 === navStep;

                return (
                  <div key={index} className="flex items-center mb-2 sm:mb-0">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 border-2 rounded-full flex items-center justify-center 
                        ${isCompleted ? 'border-gray-400' : isActive ? 'border-black' : 'border-gray-400'}
                      `}
                    >
                      <span
                        className={`text-sm 
                          ${isCompleted ? 'text-gray-500' : isActive ? 'text-black' : 'text-gray-400'}
                        `}
                      >
                        {index + 1}
                      </span>
                    </div>

                    {/* Step Name */}
                    <span
                      className={`ml-2 text-sm 
                        ${isCompleted ? 'text-gray-400 semi-bold' : isActive ? 'text-black' : 'text-gray-400'}
                      `}
                    >
                      {step}
                    </span>

                    {/* Line Between Steps */}
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-grow border-t 
                          ${isCompleted ? 'border-green-500' : isActive ? 'border-black' : 'border-gray-300'}
                          mx-2 hidden sm:block`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavEmRegister;