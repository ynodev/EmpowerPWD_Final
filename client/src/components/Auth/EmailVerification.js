import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post('/api/auth/resend-otp', { email });
      setTimer(60);
      setError('');
      setSuccess('OTP resent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    try {
      const response = await axios.post('/api/auth/verify-email', {
        email,
        otp: otpString
      });

      if (response.data.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a code to {email}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-12 text-center text-2xl border-2 rounded focus:border-blue-500 focus:outline-none"
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify Email
            </button>
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend code in {timer} seconds
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Resend verification code
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification; 