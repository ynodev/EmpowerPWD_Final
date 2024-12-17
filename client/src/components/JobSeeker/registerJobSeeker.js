import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom Components
import NavRegister from '../ui/navRegister';
import ConfirmationModal from '../ui/ConfirmationModal';
import SuccessRegistration from '../ui/SuccessRegistration';

// Data and Constants
import { 
  PHILIPPINES_REGIONS,
  CITIES_MUNICIPALITIES,
  BARANGAYS_BY_CITY,
  getProvincesForRegion,
  getCitiesForProvince,
  getBarangaysForCity
} from '../../data/philippineLocations';

const steps = [
  { id: 1, title: 'Account Info', mobileTitle: '•' },
  { id: 1.5, title: 'OTP Verification', mobileTitle: '•' },
  { id: 2, title: 'Basic Info', mobileTitle: '•' },
  { id: 3, title: 'Location Info', mobileTitle: '•' },
  { id: 4, title: 'Disability Info', mobileTitle: '•' },
  { id: 5, title: 'Work Preferences', mobileTitle: '•' },
  { id: 6, title: 'Confirmation', mobileTitle: '•' }
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

const calculatePasswordStrength = (password) => {
  let strength = 0;

  // Check length
  const hasValidLength = password.length >= 8;

  // Check for numbers
  const hasNumber = /[0-9]/.test(password);

  // Check for special characters
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(password);

  // Update strength based on criteria
  if (hasValidLength) strength += 25;
  if (hasNumber) strength += 25;
  if (hasSpecialChar) strength += 25;

  // Ensure "Strong" only if all criteria are met
  if (hasValidLength && hasNumber && hasSpecialChar) strength = 100;

  return strength;
};

const getStrengthColor = (strength) => {
  if (strength <= 25) return 'bg-gray-200';
  if (strength <= 50) return 'bg-gray-300';
  if (strength <= 75) return 'bg-gray-600';
  return 'bg-black';
};

const getStrengthTextColor = (strength) => {
  if (strength <= 25) return 'text-red-400';
  if (strength <= 50) return 'text-gray-500';
  if (strength <= 75) return 'text-gray-600';
  return 'text-black';
};

const getStrengthText = (strength) => {
  if (strength <= 25) return 'Weak';
  if (strength <= 50) return 'Fair';
  if (strength <= 75) return 'Good';
  return 'Strong';
};

const getBorderColor = (isMatch) => {
  return !isMatch ? 'border-gray-400' : 'border-black';
};

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

  // Rest of the validation remains the same
  const sequential = /01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210/;
  const numberPart = cleanPhone.slice(-10);
  if (sequential.test(numberPart)) {
    return { 
      isValid: false, 
      error: "Phone number cannot contain sequential numbers" 
    };
  }

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
    return { isValid: false, error: "You must be at least 16 years old" };
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

// Add this helper function near the top of the file, with other helper functions
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

// First, add this new component near the top of the file
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

const CreateJobSeeker = () => {
  // Add this useEffect to inject the custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customDatePickerStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    age: '',
    country: 'Philippines', // Set default country
    province: '',
    region: '',
    city: '',
    postal: '',
    address: '',
    barangay: '', // Add this line
    disabilityType: [],
    disabilityAdditionalInfo: '',
    preferredJobTitles: [],
    industry: [],
    employmentType: '',
    phoneNumber: '',
    documents: {
      pwdId: null,
      validId: null,
      others: []
    },
    profilePicture: null,
  });
  const [isOtherJobTitle, setIsOtherJobTitle] = useState(false);
  const [isOtherDisability, setIsOtherDisability] = useState(false);
  const [isOtherIndustry, setIsOtherIndustry] = useState(false);
  const [otherIndustry, setOtherIndustry] = useState('');
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const [showOtpError, setShowOtpError] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [notification, setNotification] = useState({
    type: '',
    message: '',
    isVisible: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [errors, setErrors] = useState({});
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState({
    pwdId: null,
    validId: null,
    others: []
  });
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [otpModalMessage, setOtpModalMessage] = useState('');
  // Add these new state variables for managing dependent dropdowns
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  // Add this state near the top with other states
  const [showOtpBackModal, setShowOtpBackModal] = useState(false);

  useEffect(() => {
    let interval;
    if (currentStep === 1.5 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  useEffect(() => {
    // Handler for beforeunload event
    const handleBeforeUnload = (e) => {
      // Cancel the event and show confirmation dialog
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
      
      // Custom message (note: modern browsers show their own message instead)
      return 'You have unsaved changes. Are you sure you want to leave?';
    };

    // Add event listener when component mounts
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]); // Dependency on formData to track changes

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    const validations = {
      1: () => {
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
          if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
          }
          if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter";
          }
          if (!/[a-z]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one lowercase letter";
          }
          if (!/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one number";
          }
          if (!/[!@#$%^&*(),.?":{}|<>_]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one special character";
          }
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      },
      2: () => {
        // Name validation
        const nameRegex = /^[a-zA-Z\s-']+$/;
        if (!formData.firstName) {
          newErrors.firstName = "First name is required";
        } else if (!nameRegex.test(formData.firstName)) {
          newErrors.firstName = "First name should only contain letters, spaces, hyphens, and apostrophes";
        } else if (formData.firstName.length < 2) {
          newErrors.firstName = "First name must be at least 2 characters long";
        }

        if (!formData.lastName) {
          newErrors.lastName = "Last name is required";
        } else if (!nameRegex.test(formData.lastName)) {
          newErrors.lastName = "Last name should only contain letters, spaces, hyphens, and apostrophes";
        } else if (formData.lastName.length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters long";
        }

        // Phone number validation
        const phoneValidation = validatePhoneNumber(formData.phoneNumber);
        if (!phoneValidation.isValid) {
          newErrors.phoneNumber = phoneValidation.error;
        }

        // Date of birth validation
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = "Date of birth is required";
        } else {
          const dob = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          
          if (dob > today) {
            newErrors.dateOfBirth = "Date of birth cannot be in the future";
          } else if (age < 16 || (age === 16 && monthDiff < 0)) {
            newErrors.dateOfBirth = "You must be at least 16 years old";
          } else if (age > 100) {
            newErrors.dateOfBirth = "Please enter a valid date of birth";
          }
        }

        // Gender validation
        if (!formData.gender) {
          newErrors.gender = "Please select your gender";
        } else if (!['male', 'female', 'other'].includes(formData.gender.toLowerCase())) {
          newErrors.gender = "Please select a valid gender option";
        }

        // Age validation
        const calculatedAge = formData.dateOfBirth ? 
          Math.floor((new Date() - new Date(formData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
          null;

        if (!formData.age) {
          newErrors.age = "Age is required";
        } else if (isNaN(formData.age) || formData.age < 16 || formData.age > 100) {
          newErrors.age = "Age must be between 16 and 100";
        } else if (calculatedAge && Math.abs(calculatedAge - parseInt(formData.age)) > 1) {
          newErrors.age = "Age does not match with the date of birth provided";
        }
      },
      3: () => {
        if (!formData.region) newErrors.region = "Region is required";
        if (!formData.province) newErrors.province = "Province is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.barangay) newErrors.barangay = "Barangay is required";
        if (!formData.postal) newErrors.postal = "Postal code is required";
        if (!formData.address) newErrors.address = "Address is required";
      },
      4: () => {
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

        // If there are any others documents, validate them
        if (formData.documents.others && formData.documents.others.length > 0) {
          formData.documents.others.forEach((file, index) => {
            const errors = validateDocument(file, 'others');
            if (errors.length > 0) {
              documentErrors.others.push(`Supporting document ${index + 1}: ${errors.join(', ')}`);
            }
          });
        }

        // Add errors to newErrors object if there are any
        if (documentErrors.general.length > 0 || 
            documentErrors.pwdId.length > 0 || 
            documentErrors.validId.length > 0 || 
            documentErrors.others.length > 0) {
          newErrors.documents = documentErrors;
        }

        // Validate additional information if provided
        if (formData.disabilityAdditionalInfo && formData.disabilityAdditionalInfo.length > 500) {
          newErrors.disabilityAdditionalInfo = "Additional information cannot exceed 500 characters";
        }
      },
      7: () => {
        if (!acceptedTerms) {
          newErrors.terms = "You must accept the terms and conditions to proceed";
        }
        return Object.keys(newErrors).length === 0;
      }
    };

    validations[currentStep]?.();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add the handleEmailBlur function
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Only clear existing email error while typing
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    } else if (name === 'phoneNumber') {
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
        delete newErrors.phoneNumber;
        return newErrors;
      });

      // Validate phone number as user types
      const { isValid, error } = validatePhoneNumber(finalNumber);
      if (!isValid && finalNumber.length >= 10) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: error
        }));
      }
    } else if (name === 'firstName' || name === 'lastName') {
      const fieldName = name === 'firstName' ? 'First name' : 'Last name';
      const { isValid, error } = validateName(value, fieldName);
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

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
        setErrors(prev => ({
          ...prev,
          gender: error
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.gender;
          return newErrors;
        });
      }
    } else if (name === 'barangay') {
      const { isValid, error } = validateName(value, 'Barangay');
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          barangay: error
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.barangay;
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

      // Check email as user types
      if (name === 'email') {
        handleEmailBlur(e);
      }

      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
      }
      
      if (name === 'password' || name === 'confirmPassword') {
        setPasswordMatch(
          formData.confirmPassword === '' || 
          value === (name === 'password' ? formData.confirmPassword : formData.password)
        );
      }
    }
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
    if (formData.otherDisability.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        disabilityType: [...prev.disabilityType, formData.otherDisability]
      }));
      setFormData(prev => ({ ...prev, otherDisability: '' }));
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
    }
  };

  const handleAddOtherJobTitle = () => {
    if (formData.otherJobTitle.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        preferredJobTitles: [...prev.preferredJobTitles, formData.otherJobTitle],
        otherJobTitle: ''
      }));
      setIsOtherJobTitle(false);
    }
  };

  const handleRemoveJobTitle = (jobTitleToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferredJobTitles: prev.preferredJobTitles.filter(jobTitle => jobTitle !== jobTitleToRemove)
    }));
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
    }
  };

  const handleAddOtherIndustry = () => {
    if (otherIndustry.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        industry: [...prev.industry, otherIndustry]
      }));
      setOtherIndustry('');
      setIsOtherIndustry(false);
    }
  };

  const handleRemoveIndustry = (industryToRemove) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry.filter(industry => industry !== industryToRemove)
    }));
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

  const handleBack = () => {
    if (currentStep === 1.5) {
      setShowOtpBackModal(true);
      return;
    }
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === 1) {
      try {
        const checkEmailResponse = await axios.post('http://localhost:5001/api/auth/check-email', {
          email: formData.email
        });

        if (checkEmailResponse.data.exists) {
          setErrors(prev => ({
            ...prev,
            email: "This email is already registered. Please use a different email or login."
          }));
          return;
        }

        // Show OTP sending modal
        setOtpModalMessage(`Sending verification code to ${formData.email}...`);
        setShowOtpModal(true);
        
        try {
          await axios.post('/api/auth/send-otp', { 
            email: formData.email,
          });
          setCurrentStep(1.5);
          setShowOtpModal(false);
        } catch (error) {
          setOtpModalMessage(error.response?.data?.message || 'Failed to send OTP');
          setTimeout(() => {
            setShowOtpModal(false);
          }, 3000);
        }
      } catch (error) {
        if (error.response?.status === 409) {
          setErrors(prev => ({
            ...prev,
            email: "This email is already registered. Please use a different email or login."
          }));
        } else {
          setOtpModalMessage(error.response?.data?.message || 'Failed to send OTP');
          setShowOtpModal(true);
          setTimeout(() => {
            setShowOtpModal(false);
          }, 3000);
        }
      }
      return;
    }

    // Special handling for OTP verification step
    if (currentStep === 1.5) {
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
        setTimeout(() => {
          setShowOtpModal(false);
        }, 3000);
        return;
      }
      return;
    }

    // For all other steps, just move to the next step
    setCurrentStep(prev => prev + 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the formData to verify region is present
    console.log('Form Data:', formData);
    
    if (!formData.region) {
      setErrors(prev => ({
        ...prev,
        region: "Region is required"
      }));
      return;
    }
    
    if (!acceptedTerms) {
      setErrors(prev => ({
        ...prev,
        terms: "You must accept the terms and conditions to proceed"
      }));
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!acceptedTerms) {
      setErrors(prev => ({
        ...prev,
        terms: "You must accept the terms and conditions to proceed"
      }));
      setShowConfirmModal(false);
      return;
    }

    setShowConfirmModal(false);
    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      
      // Add location fields - ensure region is included
      formDataToSend.append('country', formData.country);
      formDataToSend.append('region', formData.region);  // Make sure this is added
      formDataToSend.append('province', formData.province);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('postal', formData.postal);
      formDataToSend.append('barangay', formData.barangay);
      formDataToSend.append('address', formData.address);

      // Add arrays as JSON strings
      formDataToSend.append('disabilityType', JSON.stringify(formData.disabilityType));
      formDataToSend.append('disabilityAdditionalInfo', formData.disabilityAdditionalInfo);
      formDataToSend.append('preferredJobTitles', JSON.stringify(formData.preferredJobTitles));
      formDataToSend.append('industry', JSON.stringify(formData.industry));
      formDataToSend.append('employmentType', formData.employmentType);

      // Add documents
      if (formData.documents.pwdId) {
        formDataToSend.append('pwdId', formData.documents.pwdId);
      }
      if (formData.documents.validId) {
        formDataToSend.append('validId', formData.documents.validId);
      }
      if (formData.documents.certifications) {
        // Handle multiple certifications if needed
        if (Array.isArray(formData.documents.certifications)) {
          formData.documents.certifications.forEach((cert, index) => {
            formDataToSend.append('certifications', cert);
          });
        } else {
          formDataToSend.append('certifications', formData.documents.certifications);
        }
      }

      setNotification({
        type: 'loading',
        message: 'Creating your account...'
      });

      const response = await axios.post(
        'http://localhost:5001/api/jobseekers/create',
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
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create account'
      });
    }
  };

  const handleIdTypeChange = (e) => {
    setFormData({ ...formData, idType: e.target.value });
  };
  
  const handleDocTypeSelect = (e) => {
    setSelectedDocType(e.target.value);
  };

  // Add a helper function to show notifications
  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      isVisible: true
    });

    setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        isVisible: false
      }));
    }, 3000);
  };

  // Update the handleFileUpload function
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedDocType) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'File size should not exceed 5MB',
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return;
    }

    // Check file type based on document type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = {
      pwdId: ['pdf', 'jpg', 'jpeg', 'png'],
      validId: ['pdf', 'jpg', 'jpeg', 'png'],
      others: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
    };

    if (!validExtensions[selectedDocType].includes(fileExtension)) {
      setNotification({
        type: 'error',
        message: `Invalid file type for ${
          selectedDocType === 'pwdId' ? 'PWD ID' : 
          selectedDocType === 'validId' ? 'Valid ID' : 
          'supporting document'}. Accepted formats: ${validExtensions[selectedDocType].join(', ')}`,
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return;
    }

    // Update the uploaded documents
    if (selectedDocType === 'others') {
      setUploadedDocs(prev => ({
        ...prev,
        others: [...(prev.others || []), file]
      }));

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          others: [...(prev.documents.others || []), file]
        }
      }));
    } else {
      setUploadedDocs(prev => ({
        ...prev,
        [selectedDocType]: file
      }));

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [selectedDocType]: file
        }
      }));
    }

    // Clear the selected document type
    setSelectedDocType('');
    
    // Show success notification using modal
    setNotification({
      type: 'success',
      message: 'Document uploaded successfully!',
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleRemoveFile = (docType, index) => {
    if (docType === 'others') {
      // Remove specific other document by index
      setUploadedDocs(prev => ({
        ...prev,
        others: prev.others.filter((_, i) => i !== index)
      }));

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          others: prev.documents.others.filter((_, i) => i !== index)
        }
      })
    );
    } else {
      // Remove PWD ID or Valid ID
      setUploadedDocs(prev => ({
        ...prev,
        [docType]: null
      }));

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: null
        }
      }));
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
    
    // Check if pasted content is a number and has correct length
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
    if (timer > 0) return; // Prevent resend if timer is still running
    
    try {
      setNotification({ type: 'loading', message: 'Resending verification code...' });
      await axios.post('/api/auth/resend-otp', { email: formData.email });
      
      // Reset timer and show success message
      setTimer(60);
      setNotification({ type: 'success', message: 'Verification code resent successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to resend verification code'
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-2" >
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Let's get started!</h2>
              <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">To get started, please provide some basic details to set up your account.</p>
            </div>
            <div className="mb-2 relative">
          <label className="block mb-2 font-poppins text-[15px]">
            Email
          </label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            onBlur={handleEmailBlur}  // Add this line
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 font-poppins bg-white text-gray-700 ${
              errors.email ? 'border-rose-200' : 'border-gray-200'
            }`}
            placeholder="Enter your email"
            disabled={isCheckingEmail}
          />
          {isCheckingEmail && (
            <p className="mt-1 text-gray-500 text-sm font-poppins">Checking email...</p>
          )}
          {errors.email && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.email}</p>
          )}
          </div>
            <div className="relative">
              <label className="block mb-2 font-poppins text-[15px] text-gray-600">
                Password
              </label>
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
                  required 
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
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
              {errors.password && (
                <p className="text-gray-500 text-sm mt-1 font-poppins">
                  {errors.password}
                </p>
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
            <div className="relative">
              <label className="block mb-2 font-poppins text-[15px] text-gray-600">
                Confirm Password
              </label>
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
                  required 
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <p className="text-rose-400 text-sm mt-1 font-poppins">Passwords do not match</p>
              )}
            </div>
          {isSendingOtp && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="font-poppins text-[15px]">Sending verification code to {formData.email}...</p>
                </div>
              </div>
            )}
          </div>
          
          
        );
        case 1.5:
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

            {showOtpError && otpError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative font-poppins">
                {otpError}
              </div>
            )}

            {otpSuccess && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative font-poppins">
                {otpSuccess}
              </div>
            )}

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
      case 2:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-2">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Basic Info</h2>
              <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">Please provide some basic information to create your account</p>
            </div>

            {/* New grid layout for first name and last name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-poppins text-[15px]">
                  First Name
                </label>
                <div className="relative">
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
                  {formData.firstName && !errors.firstName && formData.firstName.length >= 2 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </span>
                  )}
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-poppins text-[15px]">
                  Last Name
                </label>
                <div className="relative">
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
                  {formData.lastName && !errors.lastName && formData.lastName.length >=2 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </span>
                  )}
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone number remains full width */}
            <div className="mb-2">
              <label className="block mb-2 font-poppins text-[15px]">
                Phone Number
              </label>
              <div className="relative">
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleInputChange} 
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.phoneNumber ? 'border-red-500' : 'border-black'
                  }`}
                  placeholder="+639123456789, 09123456789, or 9123456789" 
                />
                {formData.phoneNumber && !errors.phoneNumber && 
                  (formData.phoneNumber.length === 13 || formData.phoneNumber.length === 11) && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    ✓
                  </span>
                )}
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-red-500 text-sm font-poppins">{errors.phoneNumber}</p>
              )}
            </div>

            {/* New grid layout for date of birth and gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-poppins text-[15px]">
                  Date of Birth
                </label>
                <div className="relative">
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
                    calendarClassName="font-poppins"
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    showPopperArrow={false}
                    popperProps={{
                      positionFixed: true,
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 8]
                          }
                        },
                        {
                          name: "preventOverflow",
                          options: {
                            boundary: window
                          }
                        }
                      ]
                    }}
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div className="flex items-center justify-between px-2 py-2">
                        <button
                          onClick={decreaseMonth}
                          disabled={prevMonthButtonDisabled}
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <div className="flex space-x-2">
                          <select
                            value={date.getFullYear()}
                            onChange={({ target: { value } }) => changeYear(value)}
                            className="bg-black text-white border-none rounded-md cursor-pointer text-sm py-1"
                          >
                            {Array.from(
                              { length: 100 },
                              (_, i) => new Date().getFullYear() - i
                            ).map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <select
                            value={date.getMonth()}
                            onChange={({ target: { value } }) => changeMonth(value)}
                            className="bg-black text-white border-none rounded-md cursor-pointer text-sm py-1"
                          >
                            {[
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ].map((month, i) => (
                              <option key={month} value={i}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={increaseMonth}
                          disabled={nextMonthButtonDisabled}
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-poppins text-[15px]">
                  Gender
                </label>
                <div className="relative">
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
                  {formData.gender && !errors.gender && (
                    <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </span>
                  )}
                </div>
                {errors.gender && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.gender}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-3 mt-4">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Where Are You Located?</h2>
              <p className="text-center text-gray-600 mb-8 font-poppins text-[16px]">Help us find opportunities near you by providing your location</p>
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
                    onChange={handleInputChange}
                    maxLength="4"
                    pattern="\d{4}"
                    className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                      errors.postal ? 'border-rose-200' : 
                      getBorderColor(/^\d{4}$/.test(formData.postal))
                    }`}
                    placeholder="Enter 4-digit postal code" 
                  />
                  {errors.postal && (
                    <p className="mt-1 text-rose-400 text-sm font-poppins">{errors.postal}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Add Barangay field */}
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
      case 4:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-3 mt-4">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Tell Us About Your Disability</h2>
              <p className="text-center text-gray-600 mb-8 font-poppins text-[16px]">This information helps to verify your account and match you with the right employers and opportunities.  Your data is confidential</p>
            </div>

            {/* Document Upload Section */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
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

              {/* Display document errors */}
              {errors.documents && (
                <div className="mt-4 space-y-2">
                  {errors.documents.general.length > 0 && (
                    <p className="text-red-500 text-sm font-poppins">
                      {errors.documents.general.join(', ')}
                    </p>
                  )}
                  {errors.documents.pwdId.length > 0 && (
                    <p className="text-red-500 text-sm font-poppins">
                      PWD ID: {errors.documents.pwdId.join(', ')}
                    </p>
                  )}
                  {errors.documents.validId.length > 0 && (
                    <p className="text-red-500 text-sm font-poppins">
                      Valid ID: {errors.documents.validId.join(', ')}
                    </p>
                  )}
                  {errors.documents.others.length > 0 && (
                    <p className="text-red-500 text-sm font-poppins">
                      {errors.documents.others.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Display additional info error */}
              {errors.disabilityAdditionalInfo && (
                <p className="text-red-500 text-sm font-poppins mt-2">
                  {errors.disabilityAdditionalInfo}
                </p>
              )}

              {/* Display Uploaded Documents */}
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

                  {/* Display Other Supporting Documents */}
                  {uploadedDocs.others && uploadedDocs.others.map((file, index) => (
                    <div key={`other-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="font-medium capitalize font-poppins">
                          Supporting Document {index + 1}:
                        </span>
                        <span className="ml-2 text-sm text-gray-600 font-poppins">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('others', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
            </div>

            {/* Add the NotificationModal */}
            <NotificationModal 
              type={notification.type}
              message={notification.message}
              isVisible={notification.isVisible}
            />
          </div>
        );
      case 5:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-3 mt-4">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">
                What Type of Work Are You Looking For? 
                <span className="text-gray-500 text-[16px]">(optional)</span>
              </h2>
              <p className="text-center text-gray-600 mb-8 font-poppins text-[16px]">
                Let us know your preferred job field or type of work you're seeking
              </p>
            </div>

            {/* Preferred Job Title Section */}
            <div className="mb-6">
              <label className="block mb-2 font-poppins text-[15px]">
                Preferred Job Title
              </label>
              <select
                name="preferredJobTitles"
                onChange={handleAddJobTitle}
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
                    value={formData.otherJobTitle}
                    onChange={(e) => setFormData({ ...formData, otherJobTitle: e.target.value })}
                    placeholder="Enter your job title"
                    className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  />
                  <button
                    type="button"
                    onClick={handleAddOtherJobTitle}
                    className="px-4 py-2 bg-black text-white rounded-xl font-poppins hover:bg-gray-800"
                  >
                    Add Job Title
                  </button>
                </div>
              )}

              {formData.preferredJobTitles.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 font-poppins text-[15px]">Selected Job Titles:</h3>
                  <div className="space-y-2">
                    {formData.preferredJobTitles.map((jobTitle, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="font-poppins">{jobTitle}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveJobTitle(jobTitle)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
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
                onChange={handleAddIndustry}
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
                    placeholder="Enter your industry"
                    className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  />
                  <button
                    type="button"
                    onClick={handleAddOtherIndustry}
                    className="px-4 py-2 bg-black text-white rounded-xl font-poppins hover:bg-gray-800"
                  >
                    Add Industry
                  </button>
                </div>
              )}

              {formData.industry.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 font-poppins text-[15px]">Selected Industries:</h3>
                  <div className="space-y-2">
                    {formData.industry.map((industry, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="font-poppins">{industry}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIndustry(industry)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
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
                className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
              >
                <option value="">Select your preferred employment type</option>
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
      case 6:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Confirmation</h2>
              <p className="text-center text-gray-600 mb-4 font-poppins text-[16px]">Please review your details and submit your application</p>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold font-poppins text-[16px] mb-4">Personal Information</h3>
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
                  <p className="font-poppins text-[14px] text-gray-500">Full Address</p>
                  <p className="font-poppins text-[14px]">
                    {`${formData.address}, Brgy. ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.postal}, Philippines`}
                  </p>
                </div>
              </div>
            </div>

            {/* Disability Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold font-poppins text-[16px] mb-4">Disability Information</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.disabilityType.map((type, index) => (
                    <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-poppins">
                      {type}
                    </span>
                  ))}
                </div>
                
                {formData.disabilityAdditionalInfo && (
                  <div>
                    <p className="font-poppins text-[14px] text-gray-500">Additional Info</p>
                    <p className="font-poppins text-[14px]">{formData.disabilityAdditionalInfo}</p>
                  </div>
                )}

                {/* Documents */}
                <div className="space-y-2 pt-2">
                  {uploadedDocs.pwdId && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                      </svg>
                      <span className="font-poppins text-[14px]">PWD ID: {uploadedDocs.pwdId.name}</span>
                    </div>
                  )}
                  {uploadedDocs.validId && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                      </svg>
                      <span className="font-poppins text-[14px]">Valid ID: {uploadedDocs.validId.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Preference Card - Only show if there are values */}
            {(formData.preferredJobTitles.length > 0 || formData.industry.length > 0 || formData.employmentType) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold font-poppins text-[16px] mb-4">Job Preference</h3>
                <div className="space-y-4">
                  {formData.preferredJobTitles.length > 0 && (
                    <div>
                      <p className="font-poppins text-[14px] text-gray-500">Job Title</p>
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
                      <p className="font-poppins text-[14px] text-gray-500">Industry</p>
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

            {/* Terms and Conditions Card */}
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
                  I agree with the <span className="text-blue-600">Terms and Conditions</span> and <span className="text-blue-600">Privacy Policy</span>
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
      default:
        return null;
    }
  };

  return (
    <>
      {registrationSuccess ? (
        <SuccessRegistration />
      ) : (
        <div>
          <div className="hidden md:block">
            <NavRegister steps={steps} currentStep={currentStep} />
          </div>
          <div className="block md:hidden">
            <div className="flex justify-center space-x-4 py-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`h-2 w-2 rounded-full ${
                    currentStep >= step.id ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
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
                {currentStep === 6 ? ( // If we're on the confirmation step
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
        </div>
      )}

      {/* OTP Sending/Error Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              {otpModalMessage.includes('Sending') && (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
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
    </>
  );
};

export default CreateJobSeeker;
