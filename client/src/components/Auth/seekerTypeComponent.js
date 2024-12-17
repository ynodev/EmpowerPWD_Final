import React from 'react';
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
//import assistant from "../../assets/img/assistant.svg"; // You'll need to add this image
//import personal from "../../assets/img/personal.svg"; // You'll need to add this image

const SeekerType = () => {
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
        <h1 className="text-black text-3xl font-bold">How Would You Like to Proceed?</h1>
        <p className="text-gray-600 mt-2">Choose your preferred way of using our platform</p>
      </div>

      {/* Type Selection Section */}
      <div className="flex gap-8 w-full max-w-4xl justify-center">
        {/* Assistant Section */}
        <Link 
          to="/register-assistant"
          className="w-80 p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col items-center"
        >
          <div className="mb-4">
            <img 
              //src={assistant} 
              alt="With Assistant" 
              className="w-48 h-48 object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">With Assistant</h3>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Get help from a dedicated assistant to navigate the platform and find jobs
          </p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Choose Assistant
          </button>
        </Link>

        {/* Personal Access Section */}
        <Link 
          to="/RegisterjobSeeker"
          className="w-80 p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col items-center"
        >
          <div className="mb-4">
            <img 
              //src={personal} 
              alt="Personal Access" 
              className="w-48 h-48 object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">Personal Access</h3>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Navigate the platform independently at your own pace
          </p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Choose Personal
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SeekerType;
