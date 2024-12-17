import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Add this password validation helper function near the top of the file
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Add this new Modal component at the top of the file
const Modal = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {type === 'success' ? (
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {type === 'success' ? 'Success' : 'Error'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className={`inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${
                type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
              } sm:text-sm`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this loading spinner component near the top of the file
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Step 1: Email Input Component
const EmailStep = ({ email, setEmail, onSubmit, isLoading }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="mx-auto w-12 h-12 mb-6">
        <svg viewBox="0 0 24 24" className="w-full h-full text-blue-500" fill="currentColor">
          <path d="M12 1a9 9 0 0 1 9 9v4a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-4a9 9 0 0 1 9-9zm0 2a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0v-4a7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5v4a5 5 0 0 1-10 0v-4a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0v-4a3 3 0 0 0-3-3z"/>
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Forgot Password?
      </h2>
      <p className="text-sm text-gray-600 mb-8">
        No worries, we'll send you reset instructions.
      </p>
    </div>

    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center">
            <LoadingSpinner />
            <span className="ml-2">Sending OTP...</span>
          </div>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  </div>
);

// Step 2: OTP Verification Component
const OTPStep = ({ email, otp, setOtp, onSubmit, onResend, timer, isLoading }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="mx-auto w-12 h-12 mb-6">
        <svg
          className="w-full h-full text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Password Reset
      </h2>
      <p className="text-sm text-gray-600 mb-8">
        We sent code to {email}
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-2 justify-center">
        {[...Array(6)].map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            ref={(input) => input && index === 0 && !otp && input.focus()}
            className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={otp[index] || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value) && value.length <= 1) {
                const newOtp = [...otp];
                newOtp[index] = value;
                setOtp(newOtp.join(''));
                
                // Focus next input if value is entered
                if (value && index < 5) {
                  const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                  inputs[index + 1]?.focus();
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !otp[index] && index > 0) {
                const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                inputs[index - 1]?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pastedData = e.clipboardData.getData('text').replace(/[^\d]/g, '').slice(0, 6);
              setOtp(pastedData);
            }}
          />
        ))}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Continue
      </button>
    </form>

    <div className="text-center space-y-4">
      <p className="text-sm text-gray-600">
        Didn't receive the code? {' '}
        {timer > 0 ? (
          <span className="text-gray-500">
            Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </span>
        ) : isLoading ? (
          <span className="text-gray-500">Sending...</span>
        ) : (
          <button
            onClick={onResend}
            disabled={isLoading}
            className="text-blue-600 font-medium hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Click to resend
          </button>
        )}
      </p>
    </div>
  </div>
);

// Step 3: New Password Component
const NewPasswordStep = ({ newPassword, setNewPassword, confirmPassword, setConfirmPassword, onSubmit }) => {
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const validation = validatePassword(value);
    setPasswordErrors(validation.errors);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 mb-6">
          <svg viewBox="0 0 24 24" className="w-full h-full text-blue-500" fill="currentColor">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M18.364 5.636A9 9 0 0112 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9a9 9 0 00-2.636-6.364zm-6.364 12A7 7 0 1118.364 7.636 7 7 0 0112 17.636z"/>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set New Password
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          Your new password must be different from previous used passwords
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                value={newPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

// Add this new component after the NewPasswordStep component
const SuccessStep = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="mx-auto w-12 h-12 mb-6 text-green-500">
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        All done!
      </h2>
      <p className="text-sm text-gray-600 mb-8">
        Your password has been reset. Please return to login page to log your account
      </p>

      <button
        onClick={() => window.location.href = '/login'}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Back to Login
      </button>
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ step }) => (
  <div className="flex gap-2 w-full max-w-md mt-8">
    {[1, 2, 3, 4].map((index) => (
      <div key={index} className="flex-1">
        <div className={`h-1 rounded ${index <= step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
      </div>
    ))}
  </div>
);

// Back to Login Button Component
const BackToLoginButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center text-blue-500 hover:text-blue-600 font-medium mx-auto mt-6"
  >
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Back to Login
  </button>
);

// Main Component
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation helper
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Helper function to show modal
  const showModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalOpen(true);
  };

  // Handler for email submission - update to start timer
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      showModal('error', 'Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/send-forgot-password-otp', { email });
      if (response.data.success) {
        showModal('success', response.data.message);
        setStep(2);
        setTimer(60);
        setIsTimerRunning(true);
        setOtp('');
      } else {
        showModal('error', response.data.message || 'Email not found.');
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showModal('error', 'Please enter a valid 6-digit OTP');
      return;
    }
    try {
      const response = await axios.post('/api/auth/verify-forgot-password-otp', { email, otp });
      if (response.data.success) {
        showModal('success', response.data.message);
        setStep(3);
        setIsTimerRunning(false);
      } else {
        showModal('error', response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || 'Invalid OTP');
    }
  };

  // Handler for password reset
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      showModal('error', validation.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal('error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      if (response.data.success) {
        showModal('success', 'Password reset successful!');
        setStep(4);
      } else {
        showModal('error', response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || 'An error occurred');
    }
  };

  // Handler for back to login
  const handleBackToLogin = (e) => {
    e.preventDefault();
    if (step === 3 && !modalMessage) {
      // Show confirmation only if we're on the password reset step and haven't completed the process
      if (window.confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  // Update the timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Update the reload confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step !== 1 && !modalMessage) {
        const confirmationMessage = 'Are you sure you want to leave? Your progress will be lost.';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    const handlePopState = (e) => {
      if (step !== 1 && !modalMessage) {
        if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
          navigate('/login');
        } else {
          e.preventDefault();
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    // Push a new entry to the history stack to handle the back button
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [step, modalMessage, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        message={modalMessage}
      />
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        {step === 1 && (
          <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            isLoading={isLoading}
          />
        )}

        {step === 2 && (
          <OTPStep
            email={email}
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleOtpSubmit}
            onResend={handleEmailSubmit}
            timer={timer}
            isLoading={isLoading}
          />
        )}

        {step === 3 && (
          <NewPasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handlePasswordSubmit}
          />
        )}

        {step === 4 && <SuccessStep />}

        {step !== 4 && <BackToLoginButton onClick={handleBackToLogin} />}
      </div>

      <ProgressBar step={step} />
    </div>
  );
};

export default ForgotPassword;