import React from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
import employer from "../../assets/img/employer1.svg";
import jobseeker from "../../assets/img/seeker.svg";

const Usertype = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen font-poppins p-4 sm:p-8">
      {/* Top Left Logo - Hidden on mobile */}
      <div className="hidden sm:flex absolute top-6 left-8 items-center gap-2">
        <img src={logo} alt="EmpowerPWD Logo" className="h-8" />
        <span className="font-bold text-lg">EmpowerPWD</span>
      </div>

      {/* Mobile Logo - Centered */}
      <div className="sm:hidden flex items-center gap-2 mb-8">
        <img src={logo} alt="EmpowerPWD Logo" className="h-8" />
        <span className="font-bold text-lg">EmpowerPWD</span>
      </div>

      {/* Top Right Login Section - Hidden on mobile */}
      <div className="hidden sm:block absolute top-6 right-8">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="text-blue-600 font-medium">Login</Link>
      </div>

      {/* Mobile Login Link - Positioned at the bottom */}
      <div className="sm:hidden fixed bottom-6 left-0 right-0 text-center">
        <Link to="/login" className="text-blue-600 font-medium text-sm">
          Login to your account
        </Link>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">How Would You Like to Join?</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Choose your role to start the registration process</p>
      </div>

      {/* Role Selection Section */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full max-w-4xl justify-center px-4">
        {/* Employer Section */}
        <Link 
          to="/create-employer"
          className="w-full sm:w-80 p-4 sm:p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col items-center bg-white"
        >
          <div className="mb-4">
            <img 
              src={employer} 
              alt="Employer" 
              className="w-36 sm:w-48 h-36 sm:h-48 object-contain"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base">
            Employer
          </button>
        </Link>

        {/* Job Seeker Section */}
        <Link 
          to="/RegisterjobSeeker"
          className="w-full sm:w-80 p-4 sm:p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col items-center bg-white"
        >
          <div className="mb-4">
            <img 
              src={jobseeker} 
              alt="Jobseeker" 
              className="w-36 sm:w-48 h-36 sm:h-48 object-contain"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base">
            Jobseeker
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Usertype;

