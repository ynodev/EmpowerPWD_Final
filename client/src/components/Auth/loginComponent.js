import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import logo from "../../assets/img/logo.svg";

// Placeholder images (replace with actual imported images)
import slide1 from "../../assets/img/slide-1.png";
import slide2 from "../../assets/img/slide-2.png";
import slide3 from "../../assets/img/slide-3.png";

// Add axios configuration at the top of the file
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
axios.defaults.withCredentials = true;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [slide1, slide2, slide3];

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  // Previous load remembered email logic remains the same...
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
  
    try {
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        const { userId, role, isVerified } = response.data;
        
        if (!isVerified) {
          setShowModal(true);
          setIsLoading(false);
          return;
        }

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setStatus({
          type: 'success',
          message: response.data.message || 'Login successful'
        });
        
        localStorage.setItem('isVerified', isVerified);

        if (role === 'jobseeker') {
          localStorage.setItem('userRole', role);
          localStorage.setItem('userId', userId);
          navigate('/job-list');
        } else if (role === 'employer') {
          localStorage.setItem('userRole', role);
          localStorage.setItem('userId', userId);
          navigate('/job-dashboard');
        } else {
          setStatus({
            type: 'error',
            message: 'Unexpected role'
          });
          localStorage.removeItem('userRole');
          localStorage.removeItem('isVerified');
          localStorage.removeItem('userId');
        }
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-poppins bg-gradient-to-br from-blue-50 to-white">
      {/* Modal remains the same */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Account Verification</h3>
              <p className="text-center text-gray-600 mb-4 text-sm">
                Please wait for admin verification before logging in.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden max-w-4xl w-full m-4 shadow-xl">
        {/* Login Form Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
          <a href="/" className="flex items-center mb-6">
            <img src={logo} alt="logo" className="w-10 h-10 mr-3" />
            <span className="text-xl font-bold text-gray-800">EmpowerPWD</span>
          </a>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h2>
          <p className="text-gray-600 mb-6 text-base">Enter your login details</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status.message && (
              <Alert type={status.type}>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-12 transition-all duration-300"
              />
              <div 
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox rounded-md text-blue-500 focus:ring-blue-400"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-pass" className="text-blue-600 hover:underline">Forgot Password?</Link>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="text-center mt-4 text-sm">
            <p className="text-gray-600">
              Not registered?{" "}
              <Link to="/user-type" className="text-blue-600 font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>

        {/* Slideshow Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-100 to-white p-6 items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-md aspect-[3/4] relative overflow-hidden rounded-2xl shadow-xl">
            {/* Slides */}
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={slide} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Navigation Buttons */}
            <button 
              onClick={prevSlide} 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white shadow-md transition-all"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <button 
              onClick={nextSlide} 
              className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white shadow-md transition-all"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                    ? 'bg-blue-600 w-6' 
                    : 'bg-white/50 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
