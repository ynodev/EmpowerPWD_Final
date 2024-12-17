import React from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
import employer from "../../assets/img/employer1.svg";
import jobseeker from "../../assets/img/seeker.svg";

const Usertype = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen font-poppins p-8">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <img src={logo} alt="EmpowerPWD Logo" className="h-8" />
        <span className="font-bold text-lg">EmpowerPWD</span>
      </div>

      {/* Top Right Login Section */}
      <div className="absolute top-6 right-8">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="text-blue-600 font-medium">Login</Link>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-black text-3xl font-bold">How Would You Like to Join?</h1>
        <p className="text-gray-600 mt-2">Choose your role to start the registration process</p>
      </div>

      {/* Role Selection Section */}
      <div className="flex gap-8 w-full max-w-4xl justify-center">
        {/* Employer Section */}
        <Link 
          to="/create-employer"
          className="w-80 p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col items-center"
        >
          <div className="mb-4">
            <img 
              src={employer} 
              alt="Employer" 
              className="w-48 h-48 object-contain"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Employer
          </button>
        </Link>

        {/* Job Seeker Section */}
        <Link 
          to="/RegisterjobSeeker"
          className="w-80 p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col items-center"
        >
          <div className="mb-4">
            <img 
              src={jobseeker} 
              alt="Jobseeker" 
              className="w-48 h-48 object-contain"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Jobseeker
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Usertype;

