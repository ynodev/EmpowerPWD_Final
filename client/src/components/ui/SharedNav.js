import React from 'react';
import { Link } from "react-router-dom";
import { X } from 'lucide-react';
import logo from "../../assets/img/logo.svg";

const SharedNav = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 sm:px-8 py-4 bg-white z-50 shadow-md">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="logo" className="w-8 h-8" />
            <span className="ml-2 text-lg font-semibold">EmpowerPWD</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-black font-medium">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-black font-medium">About Us</Link>
            <Link to="/guest/blogs" className="text-gray-600 hover:text-black font-medium">Blogs</Link>
          </nav>
          <Link 
            to="/login" 
            className="bg-[#1A2755] text-white px-6 py-2 rounded-xl hover:bg-[#3532D9] transition-colors font-medium"
          >
            SIGN IN
          </Link>
        </div>
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-x-0 top-[73px] transform ${isOpen ? 'translate-y-0' : '-translate-y-full'} 
        transition-transform duration-300 ease-in-out md:hidden z-40`}>
        <div className="bg-white border-t shadow-lg">
          <nav className="flex flex-col space-y-4 p-4">
            <Link 
              to="/"
              className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about"
              className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/guest/blogs"
              className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Blogs
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 text-center bg-[#1A2755] text-white rounded-lg hover:bg-[#3532D9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              SIGN IN
            </Link>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default SharedNav; 