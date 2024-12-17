import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navasst from '../ui/navAsst';
import axios from 'axios';
import { debounce } from 'lodash';
import ConfirmationModal from '../ui/ConfirmationModal';
import SuccessRegistration from '../ui/SuccessRegistration';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  PHILIPPINES_REGIONS,
  getProvincesForRegion,
  getCitiesForProvince,
  getBarangaysForCity
} from '../../data/philippineLocations';

const steps = [
  { id: 1, title: 'Account Info' },
  { id: 1.5, title: 'OTP Verification' },
  { id: 2, title: 'Assistant Info' },
  { id: 3, title: 'Seeker Basic Info' },
  { id: 4, title: 'Seeker Location' },
  { id: 5, title: 'Disability Info' },
  { id: 6, title: 'Work Preferences' },
  { id: 7, title: 'Confirmation' }
];

const relationshipOptions = [
  'Parent',
  'Sibling',
  'Relative',
  'Guardian',
  'Other'
];

const disabilityOptions = [
  'Visual', 
  'Hearing', 
  'Mobility', 
  'Physical',
  'Other'
];

const jobTitleOptions = [
  'Massage Therapist',
  'Audio Transcriber',
  'Social Worker',
  'Freelance Writer / Designer',
  'Artist / Crafter',
  'Graphic Designer',
  'Other'
];

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Other'
];

const calculatePasswordStrength = (password) => {
  let strength = 0;

  // Check length
  const hasValidLength = password.length >= 8;

  // Check for numbers
  const hasNumber = /[0-9]/.test(password);

  // Check for special characters
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(password);

  // Check for uppercase and lowercase
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  // Update strength based on criteria
  if (hasValidLength) strength += 20;
  if (hasNumber) strength += 20;
  if (hasSpecialChar) strength += 20;
  if (hasUpperCase) strength += 20;
  if (hasLowerCase) strength += 20;

  // Ensure strength is capped at 100
  return Math.min(strength, 100);
};

const getStrengthColor = (strength) => {
  if (strength <= 25) return 'bg-gray-200';
  if (strength <= 50) return 'bg-gray-300';
  if (strength <= 75) return 'bg-gray-600';
  return 'bg-black';
};

const getStrengthText = (strength) => {
  if (strength <= 25) return 'Weak';
  if (strength <= 50) return 'Fair';
  if (strength <= 75) return 'Good';
  return 'Strong';
};

const getStrengthTextColor = (strength) => {
  if (strength <= 25) return 'text-red-400';
  if (strength <= 50) return 'text-gray-500';
  if (strength <= 75) return 'text-gray-600';
  return 'text-black';
};

const getBorderColor = (isMatch) => {
  return !isMatch ? 'border-gray-400' : 'border-black';
};

const NotificationModal = ({ type, message, isVisible }) => {
  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const textColor = isSuccess ? 'text-green-600' : 'text-red-600';
  const icon = isSuccess ? (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  ) : (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-30"></div>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 relative z-50">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${bgColor} mb-4`}>
            <svg className={`h-6 w-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icon}
            </svg>
          </div>
          <p className="text-gray-900 font-poppins text-[15px]">{message}</p>
        </div>
      </div>
    </div>
  );
};

const validatePhoneNumber = (phoneNumber) => {
  // Remove all spaces and special characters
  const cleanPhone = phoneNumber.replace(/\s+/g, '');
  
  if (!cleanPhone) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Updated regex to handle both formats
  const phoneRegex = /^(\+63|63|0)?9\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: "Please enter a valid Philippine mobile number (e.g., +639123456789, 09123456789, or 9123456789)" 
    };
  }

  // Check for sequential numbers
  const sequential = /01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210/;
  const numberPart = cleanPhone.slice(-10);
  if (sequential.test(numberPart)) {
    return { 
      isValid: false, 
      error: "Phone number cannot contain sequential numbers" 
    };
  }

  // Check for repeated digits
  const repeated = /(\d)\1{4,}/;
  if (repeated.test(numberPart)) {
    return { 
      isValid: false, 
      error: "Phone number cannot contain more than 4 repeated digits" 
    };
  }

  return { isValid: true, error: null };
};

const validateName = (name, fieldName) => {
  const nameRegex = /^[a-zA-Z\s-']+$/;
  
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (!nameRegex.test(name)) {
    return { 
      isValid: false, 
      error: `${fieldName} should only contain letters, spaces, hyphens, and apostrophes` 
    };
  }
  if (name.length < 2) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least 2 characters long` 
    };
  }
  return { isValid: true, error: null };
};

const validateDateOfBirth = (dob) => {
  if (!dob) {
    return { isValid: false, error: "Date of birth is required" };
  }

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (birthDate > today) {
    return { isValid: false, error: "Date of birth cannot be in the future" };
  }
  if (age < 16) {
    return { isValid: false, error: "Job seeker must be at least 16 years old" };
  }
  if (age > 100) {
    return { isValid: false, error: "Please enter a valid date of birth" };
  }

  return { isValid: true, error: null, calculatedAge: age };
};

const validateGender = (gender) => {
  if (!gender) {
    return { isValid: false, error: "Please select your gender" };
  }
  if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
    return { isValid: false, error: "Please select a valid gender option" };
  }
  return { isValid: true, error: null };
};

const validatePostalCode = (code) => {
  if (!code) {
    return { isValid: false, error: "Postal code is required" };
  }
  if (!/^\d{4}$/.test(code)) {
    return { isValid: false, error: "Please enter a valid 4-digit postal code" };
  }
  return { isValid: true, error: null };
};

const validateAddress = (address) => {
  if (!address) {
    return { isValid: false, error: "Address is required" };
  }
  if (address.length < 5) {
    return { isValid: false, error: "Address should be at least 5 characters long" };
  }
  return { isValid: true, error: null };
};

const validateDocument = (file, docType) => {
  const errors = [];
  const validExtensions = {
    pwdId: ['pdf', 'jpg', 'jpeg', 'png'],
    validId: ['pdf', 'jpg', 'jpeg', 'png'],
    others: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  };

  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      errors.push(`${docType === 'pwdId' ? 'PWD ID' : 
                   docType === 'validId' ? 'Valid ID' : 
                   'Document'} size should not exceed 5MB`);
    }

    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!validExtensions[docType]?.includes(fileExtension)) {
      errors.push(`Invalid file type for ${
        docType === 'pwdId' ? 'PWD ID' : 
        docType === 'validId' ? 'Valid ID' : 
        'document'}. Accepted formats: ${validExtensions[docType].join(', ')}`);
    }
  }

  return errors;
};

const customDatePickerStyle = `
  .react-datepicker {
    font-family: 'Poppins', sans-serif;
    border: 1px solid #000;
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .react-datepicker__header {
    background-color: #000;
    border-bottom: none;
    padding: 1rem;
    position: relative;
  }
  
  .react-datepicker__current-month {
    color: white;
    font-weight: 500;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .react-datepicker__day-name {
    color: white;
    margin: 0.2rem;
    width: 2rem;
  }
  
  .react-datepicker__day {
    margin: 0.2rem;
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    border-radius: 0.375rem;
    color: #000;
  }
  
  .react-datepicker__day:hover {
    background-color: #f3f4f6;
    border-radius: 0.375rem;
  }
  
  .react-datepicker__day--selected {
    background-color: #000 !important;
    color: white !important;
    border-radius: 0.375rem;
    font-weight: 500;
  }
  
  .react-datepicker__day--keyboard-selected {
    background-color: #e5e7eb !important;
    color: #000 !important;
    border-radius: 0.375rem;
  }
  
  .react-datepicker__navigation {
    top: 1rem;
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: white;
    border-width: 2px 2px 0 0;
    width: 0.5rem;
    height: 0.5rem;
  }
  
  .react-datepicker__navigation:hover *::before {
    border-color: #e5e7eb;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.5rem 1rem;
    border: 1px solid #000;
    border-radius: 0.75rem;
    font-family: 'Poppins', sans-serif;
    outline: none;
  }
  
  .react-datepicker__input-container input:focus {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }

  .react-datepicker__day--outside-month {
    color: #9ca3af;
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__month-container {
    background-color: white;
  }
`;

const RegisterAssistant = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Assistant Information
    email: '',
    password: '',
    confirmPassword: '',
    isAssistant: true,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    relationship: '',
    otherRelationship: '',
    validId: null,

    // Job Seeker's Basic Info
    seekerFirstName: '',
    seekerLastName: '',
    dateOfBirth: '',
    gender: '',
    age: '',
    seekerPhoneNumber: '',

    // Job Seeker's Location
    country: 'Philippines',
    region: '',
    province: '',
    barangay: '',
    city: '',
    postal: '',
    address: '',

    // Job Seeker's Disability Info
    disabilityType: [],
    disabilityAdditionalInfo: '',

    // Job Seeker's Work Preferences
    preferredJobTitles: [],
    industry: [],
    employmentType: '',

    // Job Seeker's Documents
    documents: {
      pwdId: null,
      validId: null
    }
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpModalMessage, setOtpModalMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [notification, setNotification] = useState({
    type: '',
    message: '',
    isVisible: false
  });
  const [isOtherDisability, setIsOtherDisability] = useState(false);
  const [isOtherJobTitle, setIsOtherJobTitle] = useState(false);
  const [isOtherIndustry, setIsOtherIndustry] = useState(false);
  const [otherIndustry, setOtherIndustry] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Add these new state variables
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState({
    pwdId: null,
    validId: null,
    others: []
  });

  // Add these state variables if not already present
  const [availableBarangays, setAvailableBarangays] = useState([]);

  // Add this state near the top with other states
  const [showOtpBackModal, setShowOtpBackModal] = useState(false);

  // Add these handlers
  const handleDocTypeSelect = (e) => {
    setSelectedDocType(e.target.value);
    // Clear any existing document errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.documents;
      return newErrors;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedDocType) return;

    // Validate file
    const validationErrors = validateDocument(file, selectedDocType);
    if (validationErrors.length > 0) {
      setNotification({
        type: 'error',
        message: validationErrors[0],
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return;
    }

    // Update uploaded documents
    setUploadedDocs(prev => ({
      ...prev,
      [selectedDocType]: file
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [selectedDocType]: file
      }
    }));

    // Show success notification
    setNotification({
      type: 'success',
      message: `${selectedDocType === 'pwdId' ? 'PWD ID' : 'Valid ID'} uploaded successfully`,
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);

    // Reset selected document type
    setSelectedDocType('');
  };

  const handleRemoveFile = (docType) => {
    // Remove from uploaded docs
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: null
    }));

    // Remove from form data
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: null
      }
    }));

    // Show notification
    setNotification({
      type: 'success',
      message: `${docType === 'pwdId' ? 'PWD ID' : 'Valid ID'} removed successfully`,
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // Move useEffect hooks inside the component
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customDatePickerStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

  useEffect(() => {
    let interval;
    if (currentStep === 1.5 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  const checkEmailExists = debounce(async (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    
    try {
      setIsCheckingEmail(true);
      const response = await axios.post('http://localhost:5001/api/auth/check-email', { email });
      
      if (response.data.exists) {
        setErrors(prev => ({
          ...prev,
          email: "This email is already registered. Please use a different email or login."
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  }, 1000);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Remove email validation from here
    if (name === 'email') {
      // Only clear existing email error while typing
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    
    // Password matching check
    if (name === 'password' || name === 'confirmPassword') {
      const otherField = name === 'password' ? 'confirmPassword' : 'password';
      setPasswordMatch(
        formData[otherField] === '' || 
        value === formData[otherField]
      );
    }
    
    if (name === 'phoneNumber' || name === 'seekerPhoneNumber') {
      const formattedNumber = formatPhoneNumber(value);
      
      // Allow input of various formats but limit the length appropriately
      let finalNumber = formattedNumber;
      if (formattedNumber.startsWith('+63')) {
        finalNumber = formattedNumber.slice(0, 13); // +63 + 9 digits
      } else if (formattedNumber.startsWith('0')) {
        finalNumber = formattedNumber.slice(0, 11); // 0 + 10 digits
      } else if (formattedNumber.startsWith('9')) {
        finalNumber = formattedNumber.slice(0, 10); // just 10 digits
      }

      setFormData(prev => ({
        ...prev,
        [name]: finalNumber
      }));

      // Clear existing phone number error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      // Just set error state without notification
      const { isValid, error } = validatePhoneNumber(finalNumber);
      if (!isValid && finalNumber.length >= 10) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    } else if (name === 'firstName' || name === 'lastName' || 
               name === 'seekerFirstName' || name === 'seekerLastName') {
      const fieldName = name.includes('seeker') ? 
        (name === 'seekerFirstName' ? 'Job seeker first name' : 'Job seeker last name') :
        (name === 'firstName' ? 'First name' : 'Last name');
      
      const { isValid, error } = validateName(value, fieldName);
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Just set error state without notification
      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else if (name === 'dateOfBirth') {
      const { isValid, error, calculatedAge } = validateDateOfBirth(value);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: calculatedAge ? calculatedAge.toString() : ''
      }));

      // Just set error state without notification
      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          dateOfBirth: error
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
      }
    } else if (name === 'gender') {
      const { isValid, error } = validateGender(value);
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (!isValid) {
        setNotification({
          type: 'error',
          message: error,
          isVisible: true
        });
        setTimeout(() => {
          setNotification(prev => ({ ...prev, isVisible: false }));
        }, 3000);
      }
    } else if (name === 'password') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setPasswordStrength(calculatePasswordStrength(value));

      // Set password error state without notification
      if (value && (
        value.length < 8 ||
        !/[A-Z]/.test(value) ||
        !/[a-z]/.test(value) ||
        !/[0-9]/.test(value) ||
        !/[!@#$%^&*(),.?":{}|<>_]/.test(value)
      )) {
        setErrors(prev => ({
          ...prev,
          password: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
    } else if (name === 'confirmPassword') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Set confirm password error state without notification
      if (value && value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear existing errors for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Add new handler for email blur event
  const handleEmailBlur = async (e) => {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // First validate email format
    if (!email) {
      setErrors(prev => ({
        ...prev,
        email: "Email is required"
      }));
      return;
    }
    
    if (!emailRegex.test(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
      return;
    }

    // Then check if email exists
    try {
      setIsCheckingEmail(true);
      const response = await axios.post('http://localhost:5001/api/auth/check-email', { email });
      
      if (response.data.exists) {
        setErrors(prev => ({
          ...prev,
          email: "This email is already registered. Please use a different email or login."
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleOtpChange = (e, index) => {
    if (isNaN(e.target.value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (e.target.value && index < 5) {
      const nextInput = e.target.parentElement.children[index + 1];
      nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setOtp(otpArray);
      
      // Focus the last input
      const inputs = e.target.parentElement.children;
      inputs[5].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.target.parentElement.children[index - 1];
      prevInput.focus();
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    try {
      setNotification({
        type: 'loading',
        message: 'Resending verification code...',
        isVisible: true
      });
      
      await axios.post('/api/auth/resend-otp', { email: formData.email });
      
      // Reset timer and show success message
      setTimer(60);
      setNotification({
        type: 'success',
        message: 'Verification code resent successfully!',
        isVisible: true
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotification({
          type: '',
          message: '',
          isVisible: false
        });
      }, 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to resend verification code',
        isVisible: true
      });
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
          newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        
        // Password validation
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else {
          const hasValidLength = formData.password.length >= 8;
          const hasNumber = /[0-9]/.test(formData.password);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(formData.password);
          const hasUpperCase = /[A-Z]/.test(formData.password);
          const hasLowerCase = /[a-z]/.test(formData.password);

          if (!hasValidLength || !hasNumber || !hasSpecialChar || !hasUpperCase || !hasLowerCase) {
            newErrors.password = "Password must meet all requirements";
          }
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (!passwordMatch) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;

      case 2:
        // Assistant's name validation
        const firstNameValidation = validateName(formData.firstName, "First name");
        if (!firstNameValidation.isValid) {
          newErrors.firstName = firstNameValidation.error;
        }

        const lastNameValidation = validateName(formData.lastName, "Last name");
        if (!lastNameValidation.isValid) {
          newErrors.lastName = lastNameValidation.error;
        }

        // Phone number validation
        const phoneValidation = validatePhoneNumber(formData.phoneNumber);
        if (!phoneValidation.isValid) {
          newErrors.phoneNumber = phoneValidation.error;
        }

        // Relationship validation
        if (!formData.relationship) {
          newErrors.relationship = "Please select your relationship to the job seeker";
        } else if (formData.relationship === 'Other' && !formData.otherRelationship) {
          newErrors.otherRelationship = "Please specify your relationship";
        }

        // Valid ID validation
        if (!formData.validId) {
          newErrors.validId = "Please upload a valid ID";
        } else {
          const validIdErrors = validateDocument(formData.validId, 'validId');
          if (validIdErrors.length > 0) {
            newErrors.validId = validIdErrors[0];
          }
        }
        break;

      case 3:
        // Job Seeker's name validation
        const seekerFirstNameValidation = validateName(formData.seekerFirstName, "First name");
        if (!seekerFirstNameValidation.isValid) {
          newErrors.seekerFirstName = seekerFirstNameValidation.error;
        }

        const seekerLastNameValidation = validateName(formData.seekerLastName, "Last name");
        if (!seekerLastNameValidation.isValid) {
          newErrors.seekerLastName = seekerLastNameValidation.error;
        }

        // Date of birth validation
        const dobValidation = validateDateOfBirth(formData.dateOfBirth);
        if (!dobValidation.isValid) {
          newErrors.dateOfBirth = dobValidation.error;
        }

        // Gender validation
        const genderValidation = validateGender(formData.gender);
        if (!genderValidation.isValid) {
          newErrors.gender = genderValidation.error;
        }

        // Age validation
        if (!formData.age) {
          newErrors.age = "Age is required";
        } else if (isNaN(formData.age) || formData.age < 16 || formData.age > 100) {
          newErrors.age = "Age must be between 16 and 100";
        }

        // Phone number validation
        const seekerPhoneValidation = validatePhoneNumber(formData.seekerPhoneNumber);
        if (!seekerPhoneValidation.isValid) {
          newErrors.seekerPhoneNumber = seekerPhoneValidation.error;
        }
        break;

      case 4:
        if (!formData.region) newErrors.region = "Region is required";
        if (!formData.province) newErrors.province = "Province is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.barangay) newErrors.barangay = "Barangay is required";
        if (!formData.postal) newErrors.postal = "Postal code is required";
        if (!formData.address) newErrors.address = "Address is required";
        break;

      case 5:
        // Document validation
        const documentErrors = {
          general: [],
          pwdId: [],
          validId: [],
          others: []
        };

        // Check if at least one required ID is uploaded
        const hasValidId = formData.documents.validId;
        const hasPwdId = formData.documents.pwdId;
        
        if (!hasValidId && !hasPwdId) {
          documentErrors.general.push("Please upload at least one form of identification (PWD ID or Valid ID)");
        }

        // Validate each document
        Object.entries(formData.documents).forEach(([docType, file]) => {
          if (file && docType !== 'others') {
            const errors = validateDocument(file, docType);
            if (errors.length > 0) {
              documentErrors[docType].push(...errors);
            }
          }
        });

        if (documentErrors.general.length > 0 || 
            documentErrors.pwdId.length > 0 || 
            documentErrors.validId.length > 0 || 
            documentErrors.others.length > 0) {
          newErrors.documents = documentErrors;
        }
        break;

      case 6:
        // Work preferences validation (optional)
        if (formData.employmentType && !['full-time', 'part-time', 'contract', 'temporary', 'internship', 'freelance', 'other'].includes(formData.employmentType)) {
          newErrors.employmentType = "Please select a valid employment type";
        }

        // If job titles are provided, validate them
        if (formData.preferredJobTitles.length > 0) {
          const validJobTitles = [...jobTitleOptions, formData.otherJobTitle].filter(Boolean);
          const invalidTitles = formData.preferredJobTitles.filter(title => !validJobTitles.includes(title));
          if (invalidTitles.length > 0) {
            newErrors.preferredJobTitles = "One or more selected job titles are invalid";
          }
        }

        // If industries are provided, validate them
        if (formData.industry.length > 0) {
          const validIndustries = [...industryOptions, otherIndustry].filter(Boolean);
          const invalidIndustries = formData.industry.filter(ind => !validIndustries.includes(ind));
          if (invalidIndustries.length > 0) {
            newErrors.industry = "One or more selected industries are invalid";
          }
        }
        break;

      case 7:
        if (!acceptedTerms) {
          newErrors.terms = "You must accept the terms and conditions to proceed";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 1) {
      try {
        setOtpModalMessage(`Sending verification code to ${formData.email}...`);
        setShowOtpModal(true);
        
        await axios.post('/api/auth/send-otp', { email: formData.email });
        setCurrentStep(1.5);
        setShowOtpModal(false);
      } catch (error) {
        setOtpModalMessage(error.response?.data?.message || 'Failed to send OTP');
        setTimeout(() => setShowOtpModal(false), 3000);
        return;
      }
    } else if (currentStep === 1.5) {
      try {
        const response = await axios.post('/api/auth/verify-otp', {
          email: formData.email,
          otp: otp.join('')
        });
        
        if (response.data.success) {
          setShowVerificationModal(true);
          setTimeout(() => {
            setShowVerificationModal(false);
            setCurrentStep(2);
          }, 2000);
        }
      } catch (error) {
        setOtpModalMessage(error.response?.data?.message || 'Invalid OTP');
        setShowOtpModal(true);
        setTimeout(() => setShowOtpModal(false), 3000);
        return;
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1.5) {
      setShowOtpBackModal(true);
      return;
    }
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    try {
      const formDataToSend = new FormData();

      // Add Assistant Information
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('isAssistant', true);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('relationship', formData.relationship);
      if (formData.relationship === 'Other') {
        formDataToSend.append('otherRelationship', formData.otherRelationship);
      }

      // Add Job Seeker's Basic Info
      formDataToSend.append('seekerFirstName', formData.seekerFirstName);
      formDataToSend.append('seekerLastName', formData.seekerLastName);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('seekerPhoneNumber', formData.seekerPhoneNumber);

      // Add Location Info
      formDataToSend.append('country', formData.country);
      formDataToSend.append('region', formData.region);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('barangay', formData.barangay);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('postal', formData.postal);
      formDataToSend.append('address', formData.address);

      // Add Disability Info
      formDataToSend.append('disabilityType', JSON.stringify(formData.disabilityType));
      formDataToSend.append('disabilityAdditionalInfo', formData.disabilityAdditionalInfo);

      // Add Work Preferences
      formDataToSend.append('preferredJobTitles', JSON.stringify(formData.preferredJobTitles));
      formDataToSend.append('industry', JSON.stringify(formData.industry));
      formDataToSend.append('employmentType', formData.employmentType);

      // Add Documents
      if (formData.validId) {
        formDataToSend.append('verificationDocument', formData.validId);
      }
      if (formData.documents.pwdId) {
        formDataToSend.append('pwdId', formData.documents.pwdId);
      }
      if (formData.documents.validId) {
        formDataToSend.append('validId', formData.documents.validId);
      }

      const response = await axios.post(
        'http://localhost:5001/api/jobseekers/assistant/register',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Failed to create account'
      }));
    }
  };

  const renderStepContent = () => {
      switch (currentStep) {
         case 1:
         return renderAccountInfo();
         case 1.5:
         return renderOtpVerification();
         case 2:
         return renderAssistantInfo();
         case 3:
         return renderSeekerBasicInfo();
         case 4:
         return renderSeekerLocation();
         case 5:
         return renderDisabilityInfo();
         case 6:
         return renderWorkPreferences();
         case 7:
         return renderConfirmation();
         default:
         return null;
      }
   };

  const renderAccountInfo = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Let's get started!</h2>
          <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">To get started, please provide some basic details to set up your account.</p>
        </div>

        {/* Email Field */}
        <div className="mb-2 relative">
          <label className="block mb-2 font-poppins text-[15px]">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleEmailBlur}  
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 font-poppins bg-white text-gray-700 ${
                errors.email ? 'border-rose-200' : 'border-gray-200'
              }`}
            placeholder="Enter your email"
          />
          {isCheckingEmail && (
            <p className="mt-1 text-gray-500 text-sm font-poppins">Checking email...</p>
          )}
          {errors.email && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="relative">
          <label className="block mb-2 font-poppins text-[15px] text-gray-600">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 font-poppins bg-white text-gray-700 ${
                errors.password ? 'border-rose-200' : 'border-gray-200'
              }`}
              placeholder="Password" 
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formData.password && (
            <>
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-100 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className={`text-sm mt-1 ${getStrengthTextColor(passwordStrength)} font-poppins`}>
                  Password Strength: {getStrengthText(passwordStrength)}
                </p>
              </div>
              {formData.password.length < 8 && (
                <p className="text-gray-500 text-sm mt-1 font-poppins">
                  Password must be at least 8 characters long
                </p>
              )}
            </>
          )}
          {!errors.password && formData.password && (
            <ul className="mt-1 text-xs text-gray-500 space-y-1 font-poppins">
              <li className={formData.password.length >= 8 ? "text-green-500" : ""}>
                ✓ At least 8 characters
              </li>
              <li className={/[A-Z]/.test(formData.password) ? "text-green-500" : ""}>
                ✓ One uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.password) ? "text-green-500" : ""}>
                ✓ One lowercase letter
              </li>
              <li className={/[0-9]/.test(formData.password) ? "text-green-500" : ""}>
                ✓ One number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>_]/.test(formData.password) ? "text-green-500" : ""}>
                ✓ One special character
              </li>
            </ul>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <label className="block mb-2 font-poppins text-[15px] text-gray-600">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 font-poppins bg-white text-gray-700 ${
                !passwordMatch ? 'border-rose-200' : 'border-gray-200'
              }`}
              placeholder="Confirm Password" 
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {!passwordMatch && formData.confirmPassword && (
            <p className="text-rose-400 text-sm mt-1 font-poppins">Passwords do not match</p>
          )}
        </div>
      </div>
    );
  };

  const renderOtpVerification = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">
            Verify your email
          </h2>
          <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">
            We've sent a verification code to {formData.email}
          </p>
        </div>

        <div className="flex gap-4 justify-center my-8">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="number"
              min="0"
              max="9"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              onPaste={handleOtpPaste}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length > 1) {
                  e.target.value = e.target.value.slice(0, 1);
                }
              }}
              className="w-14 h-14 text-center text-2xl border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 font-poppins [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ))}
        </div>

        <div className="text-center mt-4">
          {timer > 0 ? (
            <p className="text-sm text-gray-600 font-poppins">
              Resend code in {timer} seconds
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm text-black hover:text-gray-700 font-poppins"
            >
              Resend verification code
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAssistantInfo = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Assistant Info</h2>
          <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">
            Please provide your information as an assistant
          </p>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-poppins text-[15px]">First Name</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.firstName ? 'border-red-500' : 'border-black'
              }`}
              placeholder="First Name" 
            />
            {errors.firstName && (
              <p className="mt-1 text-red-500 text-sm font-poppins">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-poppins text-[15px]">Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.lastName ? 'border-red-500' : 'border-black'
              }`}
              placeholder="Last Name" 
            />
            {errors.lastName && (
              <p className="mt-1 text-red-500 text-sm font-poppins">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">Phone Number</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            value={formData.phoneNumber} 
            onChange={handleInputChange} 
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.phoneNumber ? 'border-red-500' : 'border-black'
            }`}
            placeholder="+639123456789" 
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">Relationship to Job Seeker</label>
          <select
            name="relationship"
            value={formData.relationship}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.relationship ? 'border-red-500' : 'border-black'
            }`}
          >
            <option value="">Select relationship</option>
            {relationshipOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.relationship && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.relationship}</p>
          )}
        </div>

        {/* Other Relationship */}
        {formData.relationship === 'Other' && (
          <div>
            <label className="block mb-2 font-poppins text-[15px]">Specify Relationship</label>
            <input 
              type="text" 
              name="otherRelationship" 
              value={formData.otherRelationship} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.otherRelationship ? 'border-red-500' : 'border-black'
              }`}
              placeholder="Please specify your relationship" 
            />
            {errors.otherRelationship && (
              <p className="mt-1 text-red-500 text-sm font-poppins">{errors.otherRelationship}</p>
            )}
          </div>
        )}

        {/* Valid ID Upload */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">Valid ID</label>
          <div className="space-y-4">
            <input 
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Validate file
                  const validationErrors = validateDocument(file, 'validId');
                  if (validationErrors.length > 0) {
                    setNotification({
                      type: 'error',
                      message: validationErrors[0],
                      isVisible: true
                    });
                    setTimeout(() => {
                      setNotification(prev => ({ ...prev, isVisible: false }));
                    }, 3000);
                    return;
                  }

                  // Update form data
                  setFormData(prev => ({
                    ...prev,
                    validId: file
                  }));

                  // Show success notification
                  setNotification({
                    type: 'success',
                    message: 'Valid ID uploaded successfully',
                    isVisible: true
                  });
                  setTimeout(() => {
                    setNotification(prev => ({ ...prev, isVisible: false }));
                  }, 3000);
                }
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
            />
            {formData.validId && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="font-poppins text-sm">{formData.validId.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      validId: null
                    }));
                    setNotification({
                      type: 'success',
                      message: 'Valid ID removed successfully',
                      isVisible: true
                    });
                    setTimeout(() => {
                      setNotification(prev => ({ ...prev, isVisible: false }));
                    }, 3000);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-500 font-poppins">
                Accepted formats: PDF, JPG, PNG (max 5MB)
              </p>
              <p className="text-sm text-gray-500 font-poppins">
                Please upload a valid government-issued ID
              </p>
            </div>
            {errors.validId && (
              <p className="mt-1 text-red-500 text-sm font-poppins">
                {errors.validId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSeekerBasicInfo = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Job Seeker Basic Info</h2>
          <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">
            Please provide the job seeker's basic information
          </p>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-poppins text-[15px]">First Name</label>
            <input 
              type="text" 
              name="seekerFirstName" 
              value={formData.seekerFirstName} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.seekerFirstName ? 'border-red-500' : 'border-black'
              }`}
              placeholder="Job Seeker's First Name" 
            />
            {errors.seekerFirstName && (
              <p className="mt-1 text-red-500 text-sm font-poppins">{errors.seekerFirstName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-poppins text-[15px]">Last Name</label>
            <input 
              type="text" 
              name="seekerLastName" 
              value={formData.seekerLastName} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.seekerLastName ? 'border-red-500' : 'border-black'
              }`}
              placeholder="Job Seeker's Last Name" 
            />
            {errors.seekerLastName && (
              <p className="mt-1 text-red-500 text-sm font-poppins">{errors.seekerLastName}</p>
            )}
          </div>
        </div>

        {/* Date of Birth and Gender in grid */}
        <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-poppins text-[15px]">Date of Birth</label>
          <DatePicker
            selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
            onChange={(date) => {
              handleInputChange({
                target: {
                  name: 'dateOfBirth',
                  value: date ? date.toISOString().split('T')[0] : ''
                }
              });
            }}
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date of birth"
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.dateOfBirth ? 'border-red-500' : 'border-black'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-poppins text-[15px]">Gender</label>
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.gender ? 'border-red-500' : 'border-black'
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.gender}</p>
          )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">Phone Number</label>
          <input 
            type="tel" 
            name="seekerPhoneNumber" 
            value={formData.seekerPhoneNumber} 
            onChange={handleInputChange} 
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.seekerPhoneNumber ? 'border-red-500' : 'border-black'
            }`}
            placeholder="+639123456789" 
          />
          {errors.seekerPhoneNumber && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.seekerPhoneNumber}</p>
          )}
        </div>
      </div>
    );
  };

  const renderSeekerLocation = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-3 mt-4">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Where Is the Job Seeker Located?</h2>
          <p className="text-center text-gray-600 mb-8 font-poppins text-[16px]">Help us find opportunities near them by providing their location</p>
        </div>

        {/* Country (non-editable) */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            Country
          </label>
          <div className="relative">
          <input 
            type="text" 
              value="Philippines" 
              disabled
              className="w-full p-2 border border-gray-300 rounded-xl bg-gray-50 font-poppins cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              ✓
            </span>
          </div>
        </div>

        {/* Region and Province in one row */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block mb-2 font-poppins text-[15px]">
              Region
            </label>
            <div className="relative">
              <select
            name="region" 
            value={formData.region} 
                onChange={handleRegionChange}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                  errors.region ? 'border-rose-200' : getBorderColor(formData.region)
                }`}
              >
                <option value="">Select Region</option>
                {Object.values(PHILIPPINES_REGIONS).flat().map(region => (
                  <option key={region.name} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
              {formData.region && !errors.region && (
                <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500">
                  ✓
                </span>
              )}
            </div>
          {errors.region && (
              <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.region}</p>
          )}
        </div>

        <div>
            <label className="block mb-2 font-poppins text-[15px]">
              Province
            </label>
            <div className="relative">
              <select
            name="province" 
            value={formData.province} 
                onChange={handleProvinceChange}
                disabled={!formData.region}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                  errors.province ? 'border-rose-200' : 
                  !formData.region ? 'border-gray-200 bg-gray-100' : 
                  getBorderColor(formData.province)
                } ${!formData.region ? 'cursor-not-allowed' : ''}`}
              >
                <option value="">Select Province</option>
                {availableProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {formData.province && !errors.province && (
                <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500">
                  ✓
                </span>
              )}
            </div>
          {errors.province && (
              <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.province}</p>
          )}
          </div>
        </div>

        {/* City and Postal Code in one row */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block mb-2 font-poppins text-[15px]">
              City
            </label>
            <div className="relative">
              <select
            name="city" 
            value={formData.city} 
                onChange={handleCityChange}
                disabled={!formData.province}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                  errors.city ? 'border-rose-200' : 
                  !formData.province ? 'border-gray-200 bg-gray-100' : 
                  getBorderColor(formData.city)
                } ${!formData.province ? 'cursor-not-allowed' : ''}`}
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {formData.city && !errors.city && (
                <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500">
                  ✓
                </span>
              )}
            </div>
          {errors.city && (
              <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.city}</p>
          )}
        </div>

        <div>
            <label className="block mb-2 font-poppins text-[15px]">
              Postal Code
            </label>
            <div className="relative">
          <input 
            type="text" 
            name="postal" 
            value={formData.postal} 
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange({
                target: {
                  name: 'postal',
                  value: value
                }
              });
            }}
            maxLength="4"
            pattern="\d{4}"
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.postal ? 'border-rose-200' : 
              getBorderColor(/^\d{4}$/.test(formData.postal))
            }`}
            placeholder="Enter 4-digit postal code" 
            inputMode="numeric" // This brings up the numeric keyboard on mobile
          />
              {errors.postal && (
                <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.postal}</p>
          )}
            </div>
          </div>
        </div>

        {/* Barangay field */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            Barangay
          </label>
          <div className="relative">
            <select
              name="barangay"
              value={formData.barangay}
            onChange={handleInputChange} 
              disabled={!formData.city}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.barangay ? 'border-rose-200' : 
                !formData.city ? 'border-gray-200 bg-gray-100' : 
                getBorderColor(formData.barangay)
              } ${!formData.city ? 'cursor-not-allowed' : ''}`}
            >
              <option value="">Select Barangay</option>
              {availableBarangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
            {formData.barangay && !errors.barangay && (
              <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500">
                ✓
              </span>
            )}
          </div>
          {errors.barangay && (
            <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.barangay}</p>
          )}
        </div>

        {/* Street Address */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            Street Address
          </label>
          <div className="relative">
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleInputChange} 
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.address ? 'border-rose-200' : 
                getBorderColor(formData.address && formData.address.length >= 5)
            }`}
              placeholder="Enter your complete street address" 
          />
          {errors.address && (
              <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.address}</p>
          )}
          </div>
        </div>
      </div>
    );
  };

  const renderDisabilityInfo = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-3 mt-4">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Tell Us About Your Disability</h2>
          <p className="text-center text-gray-600 mb-8 font-poppins text-[16px]">
            This information helps to verify your account and match you with the right employers and opportunities. Your data is confidential
          </p>
        </div>

        {/* Document Upload Section */}
          <div className="space-y-4">
          <div className="flex gap-4">
            <select
              value={selectedDocType}
              onChange={handleDocTypeSelect}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            >
              <option value="">Select Document Type</option>
              <option value="pwdId">PWD ID</option>
              <option value="validId">Valid ID</option>
              <option value="others">Other Supporting Document</option>
            </select>

            <input 
              type="file"
              onChange={handleFileUpload}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins ${
                !selectedDocType ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              accept=".pdf,.doc,.docx,image/*"
              disabled={!selectedDocType}
            />
          </div>

          {!selectedDocType && (
            <p className="mt-2 text-gray-500 text-sm font-poppins">
              Please select a document type before uploading a file
            </p>
          )}

          {/* Uploaded Documents Display */}
          <div className="mt-6">
            <h3 className="font-medium mb-3 font-poppins text-[15px]">Uploaded Documents:</h3>
            <div className="space-y-2">
              {/* Display PWD ID and Valid ID */}
              {Object.entries(uploadedDocs).map(([docType, file]) => {
                if (docType === 'others' || !file) return null;
                return (
                  <div key={docType} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="font-medium capitalize font-poppins">
                        {docType === 'pwdId' ? 'PWD ID' : 'Valid ID'}:
                      </span>
                      <span className="ml-2 text-sm text-gray-600 font-poppins">{file.name}</span>
                    </div>
                <button
                  type="button"
                      onClick={() => handleRemoveFile(docType)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 font-poppins">
              Accepted formats: PDF, JPG, JPEG, PNG (max 5MB per file)
            </p>
            <p className="text-sm text-gray-500 font-poppins mt-1">
              * At least one form of identification (PWD ID or Valid ID) is required
            </p>
        </div>

          {/* Error Display */}
          {errors.documents && (
            <div className="mt-4">
              {errors.documents.general?.map((error, index) => (
                <p key={index} className="text-red-500 text-sm font-poppins">{error}</p>
              ))}
              {errors.documents.pwdId?.map((error, index) => (
                <p key={index} className="text-red-500 text-sm font-poppins">{error}</p>
              ))}
              {errors.documents.validId?.map((error, index) => (
                <p key={index} className="text-red-500 text-sm font-poppins">{error}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkPreferences = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-3 mt-4">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">
            What Type of Work Is the Job Seeker Looking For?
            <span className="text-gray-500 text-[16px]">(optional)</span>
          </h2>
          <p className="text-center text-gray-600 mb-8 font-poppins text-[16px]">
            Let us know their preferred job field or type of work they're seeking
          </p>
        </div>

        {/* Preferred Job Title Section */}
        <div className="mb-6">
          <label className="block mb-2 font-poppins text-[15px]">
            Preferred Job Title
          </label>
          <select
            name="preferredJobTitles"
            onChange={handleInputChange}
            className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
            defaultValue=""
          >
            <option value="" disabled>Select job title that applies</option>
            {jobTitleOptions.map((jobTitle) => (
              <option key={jobTitle} value={jobTitle}>
                {jobTitle}
              </option>
            ))}
          </select>

          {errors.preferredJobTitles && (
            <p className="mt-1 text-red-500 text-sm font-poppins">
              {errors.preferredJobTitles}
            </p>
          )}

          {isOtherJobTitle && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={formData.otherJobTitle || ''}
                onChange={(e) => setFormData({ ...formData, otherJobTitle: e.target.value })}
                placeholder="Enter job title"
                className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, otherJobTitle: '' })}
                className="px-4 py-2 bg-black text-white rounded-xl font-poppins hover:bg-gray-800"
              >
                Add Job Title
              </button>
            </div>
          )}

          {formData.preferredJobTitles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 font-poppins text-[15px]">Selected Job Titles:</h3>
              <div className="flex flex-wrap gap-2">
                {formData.preferredJobTitles.map((title, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="font-poppins text-sm">{title}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredJobTitles: formData.preferredJobTitles.filter(item => item !== title) })}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Industry Section */}
        <div className="mb-6">
          <label className="block mb-2 font-poppins text-[15px]">
            Industry
          </label>
          <select
            name="industry"
            onChange={handleInputChange}
            className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
            defaultValue=""
          >
            <option value="" disabled>Select an industry</option>
            {industryOptions.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>

          {errors.industry && (
            <p className="mt-1 text-red-500 text-sm font-poppins">
              {errors.industry}
            </p>
          )}

          {isOtherIndustry && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={otherIndustry}
                onChange={(e) => setOtherIndustry(e.target.value)}
                placeholder="Enter industry"
                className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
              />
              <button
                type="button"
                onClick={() => setOtherIndustry('')}
                className="px-4 py-2 bg-black text-white rounded-xl font-poppins hover:bg-gray-800"
              >
                Add Industry
              </button>
            </div>
          )}

          {formData.industry.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 font-poppins text-[15px]">Selected Industries:</h3>
              <div className="flex flex-wrap gap-2">
                {formData.industry.map((ind, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="font-poppins text-sm">{ind}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, industry: formData.industry.filter(item => item !== ind) })}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Employment Type Section */}
        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            Employment Type
          </label>
          <select 
            name="employmentType" 
            value={formData.employmentType} 
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.employmentType ? 'border-red-500' : 'border-black'
            }`}
          >
            <option value="">Select preferred employment type</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
            <option value="other">Other</option>
          </select>
          {errors.employmentType && (
            <p className="mt-1 text-red-500 text-sm font-poppins">
              {errors.employmentType}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <div className="mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Confirmation</h2>
          <p className="text-center text-gray-600 mb-4 font-poppins text-[16px]">
            Please review all information before submitting
          </p>
        </div>

        {/* Assistant Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold font-poppins text-[16px] mb-4">Assistant Information</h3>
          <div className="space-y-3">
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Full Name</p>
              <p className="font-poppins text-[14px]">{`${formData.firstName} ${formData.lastName}`}</p>
            </div>
            
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Email</p>
              <p className="font-poppins text-[14px]">{formData.email}</p>
            </div>
            
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Phone Number</p>
              <p className="font-poppins text-[14px]">{formData.phoneNumber}</p>
            </div>
            
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Relationship to Job Seeker</p>
              <p className="font-poppins text-[14px]">
                {formData.relationship === 'Other' ? formData.otherRelationship : formData.relationship}
              </p>
            </div>

            <div>
              <p className="font-poppins text-[14px] text-gray-500">Valid ID</p>
              <p className="font-poppins text-[14px]">{formData.validId?.name || 'No file uploaded'}</p>
            </div>
          </div>
        </div>

        {/* Job Seeker Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold font-poppins text-[16px] mb-4">Job Seeker Information</h3>
          <div className="space-y-3">
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Full Name</p>
              <p className="font-poppins text-[14px]">{`${formData.seekerFirstName} ${formData.seekerLastName}`}</p>
            </div>
            
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Date of Birth</p>
              <p className="font-poppins text-[14px]">
                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Gender</p>
              <p className="font-poppins text-[14px] capitalize">{formData.gender}</p>
            </div>

            <div>
              <p className="font-poppins text-[14px] text-gray-500">Phone Number</p>
              <p className="font-poppins text-[14px]">{formData.seekerPhoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Location Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold font-poppins text-[16px] mb-4">Location Information</h3>
          <div className="space-y-3">
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Complete Address</p>
              <p className="font-poppins text-[14px]">
                {`${formData.address}, ${formData.city}, ${formData.province}, ${formData.postal}, ${formData.country}`}
              </p>
            </div>
          </div>
        </div>

        {/* Disability Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold font-poppins text-[16px] mb-4">Disability Information</h3>
          <div className="space-y-4">
            <div>
              <p className="font-poppins text-[14px] text-gray-500">Disability Types</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.disabilityType.map((type, index) => (
                  <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-poppins">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {formData.disabilityAdditionalInfo && (
              <div>
                <p className="font-poppins text-[14px] text-gray-500">Additional Information</p>
                <p className="font-poppins text-[14px]">{formData.disabilityAdditionalInfo}</p>
              </div>
            )}

            <div>
              <p className="font-poppins text-[14px] text-gray-500">PWD ID</p>
              <p className="font-poppins text-[14px]">
                {formData.documents.pwdId?.name || 'No file uploaded'}
              </p>
            </div>
          </div>
        </div>

        {/* Work Preferences Card */}
        {(formData.preferredJobTitles.length > 0 || formData.industry.length > 0 || formData.employmentType) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold font-poppins text-[16px] mb-4">Work Preferences</h3>
            <div className="space-y-4">
              {formData.preferredJobTitles.length > 0 && (
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Preferred Job Titles</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.preferredJobTitles.map((title, index) => (
                      <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-poppins">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.industry.length > 0 && (
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Industries</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.industry.map((ind, index) => (
                      <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-poppins">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.employmentType && (
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Employment Type</p>
                  <p className="font-poppins text-[14px] capitalize">{formData.employmentType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 font-poppins">
              I confirm that all the information provided is accurate and I agree to the{' '}
              <span className="text-blue-600">Terms and Conditions</span> and{' '}
              <span className="text-blue-600">Privacy Policy</span>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm font-poppins mt-2">
              {errors.terms}
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setFormData(prev => ({
      ...prev,
      region: selectedRegion,
      province: '',
      city: '',
      barangay: ''
    }));
    
    // Get provinces for selected region
    const provinces = getProvincesForRegion(selectedRegion);
    setAvailableProvinces(provinces);
    setAvailableCities([]);
    setAvailableBarangays([]);
  };

  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    setFormData(prev => ({
      ...prev,
      province: selectedProvince,
      city: '',
      barangay: ''
    }));
    
    // Get cities for selected province
    const cities = getCitiesForProvince(selectedProvince);
    setAvailableCities(cities);
    setAvailableBarangays([]);
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData(prev => ({
      ...prev,
      city: selectedCity,
      barangay: ''
    }));
    
    // Get barangays for selected city
    const barangays = getBarangaysForCity(selectedCity);
    setAvailableBarangays(barangays);
  };

  const handleAddDisability = (e) => {
    const selectedDisability = e.target.value;
    if (selectedDisability === 'Other') {
      setIsOtherDisability(true);
    } else if (selectedDisability && !formData.disabilityType.includes(selectedDisability)) {
      setFormData(prev => ({
        ...prev,
        disabilityType: [...prev.disabilityType, selectedDisability]
      }));
    }
  };

  const handleAddOtherDisability = () => {
    if (formData.otherDisability?.trim()) {
      setFormData(prev => ({
        ...prev,
        disabilityType: [...prev.disabilityType, formData.otherDisability],
        otherDisability: ''
      }));
      setIsOtherDisability(false);
    }
  };

  const handleRemoveDisability = (itemToRemove) => {
    setFormData(prev => ({
      ...prev,
      disabilityType: prev.disabilityType.filter(item => item !== itemToRemove)
    }));
  };

  const handleAddJobTitle = (e) => {
    const selectedJobTitle = e.target.value;
    if (selectedJobTitle === 'Other') {
      setIsOtherJobTitle(true);
    } else if (selectedJobTitle && !formData.preferredJobTitles.includes(selectedJobTitle)) {
      setFormData(prev => ({
        ...prev,
        preferredJobTitles: [...prev.preferredJobTitles, selectedJobTitle]
      }));
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Job title added successfully',
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  const handleAddOtherJobTitle = () => {
    if (formData.otherJobTitle?.trim()) {
      setFormData(prev => ({
        ...prev,
        preferredJobTitles: [...prev.preferredJobTitles, formData.otherJobTitle],
        otherJobTitle: ''
      }));
      setIsOtherJobTitle(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Custom job title added successfully',
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  const handleRemoveJobTitle = (jobTitleToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferredJobTitles: prev.preferredJobTitles.filter(jobTitle => jobTitle !== jobTitleToRemove)
    }));
    
    // Show notification
    setNotification({
      type: 'success',
      message: 'Job title removed successfully',
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleAddIndustry = (e) => {
    const selectedIndustry = e.target.value;
    if (selectedIndustry === 'Other') {
      setIsOtherIndustry(true);
    } else if (selectedIndustry && !formData.industry.includes(selectedIndustry)) {
      setFormData(prev => ({
        ...prev,
        industry: [...prev.industry, selectedIndustry]
      }));
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Industry added successfully',
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  const handleAddOtherIndustry = () => {
    if (otherIndustry.trim()) {
      setFormData(prev => ({
        ...prev,
        industry: [...prev.industry, otherIndustry]
      }));
      setOtherIndustry('');
      setIsOtherIndustry(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Custom industry added successfully',
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  const handleRemoveIndustry = (industryToRemove) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry.filter(industry => industry !== industryToRemove)
    }));
    
    // Show notification
    setNotification({
      type: 'success',
      message: 'Industry removed successfully',
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // Add this helper function for formatting phone numbers
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');
    
    // If number starts with 63, add the plus sign
    if (digits.startsWith('63')) {
      return `+${digits}`;
    }
    
    // If number starts with 0, convert to international format
    if (digits.startsWith('0')) {
      return `+63${digits.slice(1)}`;
    }
    
    // If number starts with 9, add the prefix
    if (digits.startsWith('9')) {
      return `+63${digits}`;
    }
    
    return digits;
  };

  return (
    <>
      {registrationSuccess ? (
        <SuccessRegistration />
      ) : (
        <div>
          <Navasst steps={steps} currentStep={currentStep} />
          
          <div className="max-w-2xl w-full mx-auto p-8">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === steps.length) {
                handleSubmit(e);
              }
            }}>
              {renderStepContent()}
              
              <div className="flex justify-end mt-8 mx-auto max-w-2xl">
                {currentStep > 1 && 
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-24 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-black rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mr-4 font-poppins"
                  >
                    Back
                  </button>
                }
                {currentStep === 7 ? (
                  <button 
                    type="submit"
                    disabled={!acceptedTerms}
                    className={`w-24 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-full font-poppins text-center ${
                      acceptedTerms 
                        ? 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                  >
                    Submit
                  </button>
                ) : (
                <button
                  type="button"
                    onClick={handleNext}
                    className="w-24 px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black font-poppins text-center"
                >
                    {currentStep === 1.5 ? "Verify Email" : "Next"}
                </button>
                )}
              </div>
            </form>
          </div>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
      />
      
      <NotificationModal 
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
      />
      
      {/* OTP Sending/Error Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              {otpModalMessage.includes('Sending') && (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4" />
              )}
              <p className="font-poppins text-[15px]">{otpModalMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Verification Success Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-poppins text-[15px] text-gray-900">Email verified successfully!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* OTP Back Confirmation Modal */}
      {showOtpBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 font-poppins">Confirm Navigation</h3>
            <p className="text-gray-600 mb-6 font-poppins">
              Are you sure you want to go back? You'll need to request a new verification code.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowOtpBackModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOtpBackModal(false);
                  setCurrentStep(1);
                  setOtp(['', '', '', '', '', '']);
                  setTimer(60);
                }}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-poppins"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </>
  );
};

export default RegisterAssistant;
