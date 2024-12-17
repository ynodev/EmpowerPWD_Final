import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import NavEmRegister from "../ui/navEmRegister";
import SuccessModal from '../ui/SuccessModal';
import TermsModal from '../ui/TermsModal';
import axios from 'axios';
import { 
  PHILIPPINES_REGIONS,
  getProvincesForRegion,
  getCitiesForProvince,
  getBarangaysForCity
} from '../../data/philippineLocations';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import SuccessRegistration from '../ui/SuccessRegistration';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo.svg';

// Add these validation helper functions at the top of the file
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

const validateDocument = (file, docType) => {
  const errors = [];
  const validExtensions = {
    companyPermit: ['pdf', 'jpg', 'jpeg', 'png'],
    taxId: ['pdf', 'jpg', 'jpeg', 'png'],
    incorporation: ['pdf', 'jpg', 'jpeg', 'png'],
    others: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  };

  if (!file) {
    errors.push('Please select a file to upload');
    return errors;
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    errors.push(`File size should not exceed 5MB`);
  }

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!validExtensions[docType]?.includes(fileExtension)) {
    errors.push(`Invalid file type. Accepted formats: ${validExtensions[docType].join(', ')}`);
  }

  return errors;
};

const validateEstablishmentDate = (date) => {
  if (!date) {
    return { isValid: false, error: "Establishment date is required" };
  }

  const establishmentDate = new Date(date);
  const today = new Date();
  
  if (establishmentDate > today) {
    return { isValid: false, error: "Establishment date cannot be in the future" };
  }

  return { isValid: true, error: null };
};

// First, update the steps array near the top of the file
const steps = [
  { id: 1, title: 'Account Info', mobileTitle: '•' },
  { id: 1.5, title: 'OTP Verification', mobileTitle: '•' },
  { id: 2, title: 'Company Info', mobileTitle: '•' },
  { id: 3, title: 'Contact Info', mobileTitle: '•' },
  { id: 4, title: 'Accessibility Info', mobileTitle: '•' },
  { id: 5, title: 'Confirmation', mobileTitle: '•' }
];

const validateCurrentStep = (currentStep, formData, setErrors) => {
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
      break;

    case 2:
      // Company name validation
      const nameValidation = validateName(formData.companyInfo.companyName, 'Company name');
      if (!nameValidation.isValid) {
        newErrors.companyName = nameValidation.error;
      }

      // Industry validation
      if (!formData.companyInfo.industry || formData.companyInfo.industry.length === 0) {
        newErrors.industry = "Please select at least one industry";
      }

      // Company size validation
      if (!formData.companyInfo.companySize) {
        newErrors.companySize = "Company size is required";
      }

      // Company description validation
      if (!formData.companyInfo.companyDescription) {
        newErrors.companyDescription = "Company description is required";
      }

      // Company address validation
      if (!formData.companyInfo.companyAddress.street) {
        newErrors.street = "Street address is required";
      }
      if (!formData.companyInfo.companyAddress.city) {
        newErrors.city = "City is required";
      }
      if (!formData.companyInfo.companyAddress.province) {
        newErrors.province = "Province is required";
      }
      if (!formData.companyInfo.companyAddress.postalCode) {
        newErrors.postalCode = "Postal code is required";
      }

      // Establishment date validation
      const establishmentDateValidation = validateEstablishmentDate(formData.companyInfo.establishmentDate);
      if (!establishmentDateValidation.isValid) {
        newErrors.establishmentDate = establishmentDateValidation.error;
      }

      // Document validation
      const documentErrors = {
        general: [],
        companyPermit: [],
        taxId: [],
        incorporation: []
      };

      // Check if at least one required document is uploaded
      const hasRequiredDoc = formData.documents.companyPermit || 
                           formData.documents.taxId || 
                           formData.documents.incorporation;
      
      if (!hasRequiredDoc) {
        documentErrors.general.push("Please upload at least one required document");
      }

      // Validate each uploaded document
      Object.entries(formData.documents).forEach(([docType, file]) => {
        if (file && docType !== 'others') {
          const errors = validateDocument(file, docType);
          if (errors.length > 0) {
            documentErrors[docType].push(...errors);
          }
        }
      });

      if (Object.values(documentErrors).some(errors => errors.length > 0)) {
        newErrors.documents = documentErrors;
      }

      // Add departments validation
      if (!formData.companyInfo.departments || formData.companyInfo.departments.length === 0) {
        newErrors.departments = "Please add at least one department";
      }

      break;

    case 3:
      // Contact person validation
      const fullNameValidation = validateName(formData.contactPerson.fullName, 'Full name');
      if (!fullNameValidation.isValid) {
        newErrors.fullName = fullNameValidation.error;
      }

      // Position validation
      if (!formData.contactPerson.position) {
        newErrors.position = "Position is required";
      }

      // Phone number validation
      const phoneValidation = validatePhoneNumber(formData.contactPerson.phoneNumber);
      if (!phoneValidation.isValid) {
        newErrors.phoneNumber = phoneValidation.error;
      }

      // Contact email validation
      if (!formData.contactPerson.email) {
        newErrors.contactEmail = "Contact email is required";
      } else if (!emailRegex.test(formData.contactPerson.email)) {
        newErrors.contactEmail = "Please enter a valid email address";
      }

      // Department validation
      if (!formData.contactPerson.department || formData.contactPerson.department.length === 0) {
        newErrors.department = "Please select at least one department";
      }
      break;

    case 4:
      // Accessibility Features validation
      if (!formData.pwdSupport.accessibilityFeatures || formData.pwdSupport.accessibilityFeatures.length === 0) {
        newErrors.accessibilityFeatures = "Please select at least one accessibility feature";
      }

      // Support Programs validation
      if (formData.pwdSupport.supportPrograms.length < 50) {
        newErrors.supportPrograms = "Support programs must be at least 20 characters long";
      }

      break;

    case 5:
      if (!formData.acceptTerms) {
        newErrors.terms = "Please accept the terms and conditions";
      }
      break;
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
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

// First, add the NotificationModal component at the top of the file
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

// Add these helper functions near the top with other helper functions
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

const EmployerRegistrationForm = () => {
  const [formData, setFormData] = useState({
    // User model fields
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employer',
    
    // CompanyInfo model fields
    companyInfo: {
      companyName: '',
      industry: [],
      companySize: '',
      website: '',
      companyAddress: {
        street: '',
        city: '',
        province: '',
        region: '',
        barangay: '',
        country: 'Philippines', // Add this default value
        postalCode: ''
      },
      companyDescription: '',
      establishmentDate: '',
      companyLogo: null,
      departments: []
    },

    // ContactPerson model fields
    contactPerson: {
      fullName: '',
      position: '',
      phoneNumber: '',
      email: '',
      alternativePhoneNumber: '',
      linkedIn: '',
      department: []
    },

    // PWDSupport model fields
    pwdSupport: {
      accessibilityFeatures: [],
      remoteWorkOptions: false,
      supportPrograms: '',
      additionalInfo: ''
    },

    // Documents array with the correct structure
    documents: {
      companyPermit: null,
      taxId: null,
      incorporation: null,
      otherDocs: []
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState({
    companyPermit: null,
    taxId: null,
    incorporation: null
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);

  // Add this to the existing state declarations
  const [isOtherCompanyDepartment, setIsOtherCompanyDepartment] = useState(false);
  const [otherCompanyDepartment, setOtherCompanyDepartment] = useState('');

  // Add this state near your other state declarations
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    let interval;
    if (currentStep === 1.5 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  // Add this useEffect to handle the reload confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      
      // Show custom modal instead of browser default
      setShowReloadModal(true);
      
      // Return a string (though modern browsers will show their own message)
      return 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Update the options arrays at the top of the file
  const industryOptions = [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Manufacturing',
    'Retail',
    'Others' // Add Others option
  ];

  const departmentOptions = [
    'Human Resources (HR)',
    'Recruitment or Talent Acquisition',
    'Hiring Managers',
    'Training and Development',
    'Finance',
    'Legal/Compliance',
    'IT Department',
    'Marketing',
    'Operations',
    'Diversity and Inclusion',
    'Others' // Add Others option
  ];

  const accessibilityFeaturesOptions = [
    'Wheelchair Access',
    'Sign Language Interpretation',
    'Assistive Technology',
    'Accessible Restrooms',
    'Braille Signage',
    'Others' // Add Others option
  ];

  // States for custom industry 
  const [isOtherIndustry, setIsOtherIndustry] = useState(false);
  const [otherIndustry, setOtherIndustry] = useState('');


// States for custom department 
const [isOtherDepartment, setIsOtherDepartment] = useState(false);
const [otherDepartment, setOtherDepartment] = useState('');


// States for custom accessibility feature
const [isOtherAccessibilityFeature, setIsOtherAccessibilityFeature] = useState(false);
const [otherAccessibilityFeature, setOtherAccessibilityFeature] = useState('');
  

  // Update the handleInputChange function to handle phone number formatting
  const handleInputChange = (e, section, subsection = null) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phoneNumber' || name === 'alternativePhoneNumber') {
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
        contactPerson: {
          ...prev.contactPerson,
          [name]: finalNumber
        }
      }));

      // Clear existing phone number error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      // Validate both phone numbers as user types
      const { isValid, error } = validatePhoneNumber(finalNumber);
      if (!isValid && finalNumber.length >= 10) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
      return;
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

    setFormData(prev => {
      if (section) {
        if (subsection) {
          return {
            ...prev,
            [section]: {
              ...prev[section],
              [subsection]: {
                ...prev[section][subsection],
                [name]: type === 'checkbox' ? checked : value
              }
            }
          };
        }
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === 'checkbox' ? checked : value
          }
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleDepartmentChange = (index, value) => {
    setFormData(prev => {
      const newDepartments = [...prev.companyInfo.departments];
      newDepartments[index] = value;
      return {
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          departments: newDepartments
        }
      };
    });
  };
  // Handle adding industry
const handleAddIndustry = (e) => {
  const selectedIndustry = e.target.value;
  if (selectedIndustry === 'Others') {
    setIsOtherIndustry(true);
  } else if (selectedIndustry && !formData.companyInfo.industry.includes(selectedIndustry)) {
    setFormData(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        industry: [...prev.companyInfo.industry, selectedIndustry]
      }
    }));
    e.target.value = ''; // Reset select after adding
  }
};

// Handle adding custom industry
const handleAddOtherIndustry = () => {
  if (otherIndustry.trim() !== '') {
    setFormData(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        industry: [...prev.companyInfo.industry, otherIndustry.trim()]
      }
    }));
    setOtherIndustry('');
    setIsOtherIndustry(false);
  }
};

// Handle removing industry
const handleRemoveIndustry = (industryToRemove) => {
  setFormData((prevData) => ({
    ...prevData,
    companyInfo: {
      ...prevData.companyInfo,
      industry: prevData.companyInfo.industry.filter((industry) => industry !== industryToRemove),
    },
  }));
};
// Handle adding department
const handleAddDepartment = (e) => {
  const selectedDepartment = e.target.value;
  if (selectedDepartment === 'Others') {
    setIsOtherDepartment(true);
  } else if (selectedDepartment && !formData.contactPerson.department.includes(selectedDepartment)) {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        department: [...prev.contactPerson.department, selectedDepartment]
      }
    }));
    e.target.value = ''; // Reset select after adding
  }
};

// Handle adding custom department
const handleAddOtherDepartment = () => {
  if (otherDepartment.trim() !== '') {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        department: [...prev.contactPerson.department, otherDepartment.trim()]
      }
    }));
    setOtherDepartment('');
    setIsOtherDepartment(false);
  }
};

// Handle removing department
const handleRemoveDepartment = (departmentToRemove) => {
  setFormData((prevData) => ({
    ...prevData,
    contactPerson: {
      ...prevData.contactPerson,
      department: prevData.contactPerson.department.filter((department) => department !== departmentToRemove),
    },
  }));
};
// Handle adding accessibility feature
const handleAddAccessibilityFeature = (e) => {
  const selectedFeature = e.target.value;
  if (selectedFeature === 'Others') {
    setIsOtherAccessibilityFeature(true);
  } else if (selectedFeature && !formData.pwdSupport.accessibilityFeatures.includes(selectedFeature)) {
    setFormData(prev => ({
      ...prev,
      pwdSupport: {
        ...prev.pwdSupport,
        accessibilityFeatures: [...prev.pwdSupport.accessibilityFeatures, selectedFeature]
      }
    }));
    e.target.value = ''; // Reset select after adding
  }
};

// Handle adding custom accessibility feature
const handleAddOtherAccessibilityFeature = () => {
  if (otherAccessibilityFeature.trim() !== '') {
    setFormData(prev => ({
      ...prev,
      pwdSupport: {
        ...prev.pwdSupport,
        accessibilityFeatures: [...prev.pwdSupport.accessibilityFeatures, otherAccessibilityFeature.trim()]
      }
    }));
    setOtherAccessibilityFeature('');
    setIsOtherAccessibilityFeature(false);
  }
};

// Handle removing accessibility feature
const handleRemoveAccessibilityFeature = (featureToRemove) => {
  setFormData((prevData) => ({
    ...prevData,
    pwdSupport: {
      ...prevData.pwdSupport,
      accessibilityFeatures: prevData.pwdSupport.accessibilityFeatures.filter((feature) => feature !== featureToRemove),
    },
  }));
};

const documentTypes = ['Company Permit', 'Tax ID', 'Certificate of Incorporation', 'Other'];

const handleDocumentTypeChange = (index, value) => {
  const updatedDocuments = [...formData.companyInfo.documents];
  updatedDocuments[index] = {
    ...updatedDocuments[index],
    documentType: value,
  };
  setFormData({
    ...formData,
    companyInfo: {
      ...formData.companyInfo,
      documents: updatedDocuments
    }
  });
};

// const handleFileUpload = (e) => {
//   const file = e.target.files[0];
//   if (!file || !selectedDocType) {
//     setNotification({
//       type: 'error',
//       message: 'Please select both a document type and a file',
//       isVisible: true
//     });
//     setTimeout(() => {
//       setNotification(prev => ({ ...prev, isVisible: false }));
//     }, 3000);
//     return;
//   }

//   // Validate file
//   const validationErrors = validateDocument(file, selectedDocType);
//   if (validationErrors.length > 0) {
//     setNotification({
//       type: 'error',
//       message: validationErrors[0],
//       isVisible: true
//     });
//     // Clear the file input
//     e.target.value = '';
//     setTimeout(() => {
//       setNotification(prev => ({ ...prev, isVisible: false }));
//     }, 3000);
//     return;
//   }

//   // Update uploaded documents
//   setUploadedDocs(prev => ({
//     ...prev,
//     [selectedDocType]: {
//       file,
//       name: file.name,
//       type: file.type
//     }
//   }));

//   // Update form data
//   setFormData(prev => ({
//     ...prev,
//     documents: {
//       ...prev.documents,
//       [selectedDocType]: file
//     }
//   }));

//   // Show success notification
//   setNotification({
//     type: 'success',
//     message: `${selectedDocType === 'companyPermit' ? 'Company Permit' : 
//               selectedDocType === 'taxId' ? 'Tax ID' : 
//               'Certificate of Incorporation'} uploaded successfully`,
//     isVisible: true
//   });

//   // Reset selected document type and file input
//   setSelectedDocType('');
//   e.target.value = '';

//   setTimeout(() => {
//     setNotification(prev => ({ ...prev, isVisible: false }));
//   }, 3000);
// };

const addDocument = () => {
  setFormData({
    ...formData,
    companyInfo: {
      ...formData.companyInfo,
      documents: [...formData.companyInfo.documents, { documentType: '', fileName: '', data: null, contentType: '' }]
    }
  });
};

const removeDocument = (index) => {
  const updatedDocuments = formData.companyInfo.documents.filter((_, i) => i !== index);
  setFormData({
    ...formData,
    companyInfo: {
      ...formData.companyInfo,
      documents: updatedDocuments
    }
  });
};


  const validateStep = (step) => {
    const newErrors = {};
    console.log('Validating step:', step); // Debug log

    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;

      case 2:
        if (!formData.companyInfo.companyName?.trim()) {
          newErrors.companyName = "Company name is required";
        }
        if (!formData.companyInfo.industry?.length) {
          newErrors.industry = "Please select at least one industry";
        }
        if (!formData.companyInfo.companySize?.trim()) {
          newErrors.companySize = "Company size is required";
        }
        break;

      case 3:
        if (!formData.contactPerson.fullName?.trim()) {
          newErrors.fullName = "Full name is required";
        }
        if (!formData.contactPerson.position?.trim()) {
          newErrors.position = "Position is required";
        }
        if (!formData.contactPerson.phoneNumber?.trim()) {
          newErrors.phoneNumber = "Phone number is required";
        }
        if (!formData.contactPerson.email?.trim()) {
          newErrors.contactEmail = "Contact email is required";
        }
        break;

      case 4:
        // No required fields for PWD Support
        break;

      case 5:
        if (!acceptTerms) {
          newErrors.terms = "Please accept the terms and conditions";
        }
        break;
    }

    console.log('Validation errors:', newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);

      // Add company info
      formDataToSend.append('companyInfo', JSON.stringify({
        companyName: formData.companyInfo.companyName,
        industry: formData.companyInfo.industry,
        companySize: formData.companyInfo.companySize,
        website: formData.companyInfo.website,
        companyAddress: {
          ...formData.companyInfo.companyAddress,
          country: 'Philippines'
        },
        companyDescription: formData.companyInfo.companyDescription,
        establishmentDate: formData.companyInfo.establishmentDate,
        departments: formData.companyInfo.departments
      }));

      // Add contact person info
      formDataToSend.append('contactPerson', JSON.stringify(formData.contactPerson));

      // Add PWD support info
      formDataToSend.append('pwdSupport', JSON.stringify(formData.pwdSupport));

      // Add documents
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (key === 'otherDocs') {
          if (Array.isArray(file)) {
            file.forEach((doc, index) => {
              formDataToSend.append(`otherDocs`, doc);
            });
          }
        } else if (file) {
          formDataToSend.append(key, file);
        }
      });

      showNotification('loading', 'Creating your account...');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/employers/register`
,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setRegistrationSuccess(true); // Set success state instead of showing modal
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('error', error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally, redirect or reset the form
  };

  // Add password strength calculation functions
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) strength += 25;
    return strength;
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

  // Add OTP handlers
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
      
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    try {
      setIsSendingOtp(true);
      showNotification('loading', 'Resending verification code...');
      
      console.log(`${process.env.REACT_APP_API_URL}/api/auth/resend-otp`);


      if (response.data.success) {
        setTimer(60);
        showNotification('success', 'Verification code resent successfully!');
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Update handleNext for OTP verification
  const handleNext = async () => {
    console.log('Current step:', currentStep); // Debug log

    // Validate current step
    if (!validateStep(currentStep)) {
      console.log('Validation failed for step:', currentStep);
      return;
    }

    try {
      // Handle email verification (Step 1)
      if (currentStep === 1) {
        setIsSendingOtp(true);
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-otp`, { 
          email: formData.email 
        });

        if (response.data.success) {
          setCurrentStep(1.5);
          setTimer(60);
          showNotification('success', 'Verification code sent!');
        }
        setIsSendingOtp(false);
        return;
      }

      // Handle OTP verification (Step 1.5)
      if (currentStep === 1.5) {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
          showNotification('error', 'Please enter complete OTP');
          return;
        }

        setIsSendingOtp(true);
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
          email: formData.email,
          otp: otpString
        });

        if (response.data.success) {
          setCurrentStep(2);
          showNotification('success', 'Email verified!');
        }
        setIsSendingOtp(false);
        return;
      }

      // Handle final submission (Step 5)
      if (currentStep === 5) {
        if (!acceptTerms) {
          showNotification('error', 'Please accept the terms and conditions');
          return;
        }
        await handleSubmit();
        return;
      }

      // Move to next step for other steps
      setCurrentStep(prev => prev + 1);
      console.log('Moving to next step:', currentStep + 1); // Debug log

    } catch (error) {
      console.error('Error in handleNext:', error);
      showNotification('error', error.response?.data?.message || 'An error occurred');
    }
  };

  // Add this new function near the other handlers
  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    try {
      setIsSendingOtp(true);
      const response = await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp: otpString
      });

      if (response.data.success) {
        setOtpSuccess('Email verified successfully!');
        setTimeout(() => {
          setCurrentStep(2);
        }, 1500);
      } else {
        setOtpError('Invalid verification code');
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Update the useEffect hook for the timer
  useEffect(() => {
    let interval;
    if (currentStep === 1.5 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  // Define togglePasswordVisibility inside the component
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Add these constants at the top of your file
  const DOCUMENT_TYPES = {
    BUSINESS_PERMIT: 'Business Permit',
    TAX_ID: 'Tax ID',
    SEC_REGISTRATION: 'SEC Registration',
    MAYORS_PERMIT: "Mayor's Permit",
    DTI_REGISTRATION: 'DTI Registration',
    OTHER: 'Other'
  };

  // Update the document section in your form
  const renderDocumentUploadSection = () => (
    <div className="mb-8">
      <h3 className="font-semibold font-poppins text-[15px] mb-4">Upload Documents</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
        >
          <option value="">Select Document Type</option>
          <option value="companyPermit">Company Permit</option>
          <option value="taxId">Tax ID</option>
          <option value="incorporation">Certificate of Incorporation</option>
        </select>

        <input 
          type="file"
          onChange={handleFileUpload}
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins ${
            !selectedDocType ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={!selectedDocType}
        />
      </div>

      {/* Document Requirements */}
      <div className="text-sm text-gray-500 mb-4 font-poppins">
        <p>* At least one document is required</p>
        <p>* Maximum file size: 5MB</p>
        <p>* Accepted formats: PDF, JPG, JPEG, PNG</p>
      </div>

      {/* Error Display */}
      {errors.documents && (
        <div className="mt-4 space-y-2">
          {errors.documents.general?.map((error, index) => (
            <p key={`general-${index}`} className="text-red-500 text-sm font-poppins">
              {error}
            </p>
          ))}
          {Object.entries(errors.documents).map(([docType, docErrors]) => {
            if (docType === 'general' || !docErrors?.length) return null;
            return docErrors.map((error, index) => (
              <p key={`${docType}-${index}`} className="text-red-500 text-sm font-poppins">
                {error}
              </p>
            ));
          })}
        </div>
      )}

      {/* Uploaded Documents Display - Only show if there are actual uploaded documents */}
      {Object.values(uploadedDocs).some(doc => doc && doc.name) && (
        <div className="mt-6">
          <h4 className="font-medium mb-3 font-poppins text-[15px]">Uploaded Documents:</h4>
          <div className="space-y-2">
            {Object.entries(uploadedDocs).map(([docType, doc]) => {
              if (!doc || !doc.name) return null;
              return (
                <div key={docType} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="font-medium capitalize font-poppins">
                      {docType === 'companyPermit' ? 'Company Permit' : 
                       docType === 'taxId' ? 'Tax ID' : 
                       'Certificate of Incorporation'}:
                    </span>
                    <span className="ml-2 text-sm text-gray-600 font-poppins">
                      {doc.name}
                    </span>
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
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-2">
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
                onBlur={handleEmailBlur}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Company Information</h2>
              <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">
                Please provide details about your company
              </p>
            </div>
  
            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyInfo.companyName}
                  onChange={(e) => handleInputChange(e, 'companyInfo')}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                />
                {errors.companyName && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.companyName}</p>
                )}
              </div>

              {/* Industry Selection */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Industry *</label>
                <select
                  name="industry"
                  onChange={handleAddIndustry}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  value="" // Add this to reset after selection
                >
                  <option value="" disabled>Select industry that applies</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.companyInfo.industry.map((industry, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-black">
                      {industry}
                      <button
                        type="button"
                        onClick={() => handleRemoveIndustry(industry)}
                        className="ml-2 text-black hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {errors.industry && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.industry}</p>
                )}
              </div>

              {/* In the Industry section (case 2), add this after the industry select dropdown: */}
              {isOtherIndustry && (
                <div className="mt-4 space-y-2 relative">
                  <button
                    onClick={() => setIsOtherIndustry(false)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
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

              {/* Company Size */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Company Size *</label>
                <select
                  name="companySize"
                  value={formData.companyInfo.companySize}
                  onChange={(e) => handleInputChange(e, 'companyInfo')}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
                {errors.companySize && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.companySize}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.companyInfo.website}
                  onChange={(e) => handleInputChange(e, 'companyInfo')}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  placeholder="https://example.com"
                />
              </div>

              {/* Company Description */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Company Description *</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyInfo.companyDescription}
                  onChange={(e) => handleInputChange(e, 'companyInfo')}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  rows="4"
                  placeholder="Describe your company..."
                />
                {errors.companyDescription && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.companyDescription}</p>
                )}
              </div>

              {/* Establishment Date */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">
                  Establishment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.companyInfo.establishmentDate ? new Date(formData.companyInfo.establishmentDate) : null}
                    onChange={(date) => {
                      handleInputChange({
                        target: {
                          name: 'establishmentDate',
                          value: date ? date.toISOString().split('T')[0] : ''
                        }
                      }, 'companyInfo');
                    }}
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select establishment date"
                    className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                      errors.establishmentDate ? 'border-red-500' : 'border-black'
                    }`}
                  />
                </div>
                {errors.establishmentDate && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.establishmentDate}</p>
                )}
              </div>

              {/* Departments */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Company Departments</label>
                <select
                  name="departments"
                  onChange={(e) => {
                    const selectedDepartment = e.target.value;
                    if (selectedDepartment === 'Others') {
                      setIsOtherCompanyDepartment(true);
                    } else if (selectedDepartment && !formData.companyInfo.departments.includes(selectedDepartment)) {
                      setFormData(prev => ({
                        ...prev,
                        companyInfo: {
                          ...prev.companyInfo,
                          departments: [...prev.companyInfo.departments, selectedDepartment]
                        }
                      }));
                    }
                    e.target.value = ''; // Reset select after adding
                  }}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  value=""
                >
                  <option value="" disabled>Select department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Display selected departments */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.companyInfo.departments.map((dept, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-black">
                      {dept}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            companyInfo: {
                              ...prev.companyInfo,
                              departments: prev.companyInfo.departments.filter((_, i) => i !== index)
                            }
                          }));
                        }}
                        className="ml-2 text-black hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Other department input */}
                {isOtherCompanyDepartment && (
                  <div className="mt-4 space-y-2 relative">
                    <button
                      onClick={() => setIsOtherCompanyDepartment(false)}
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                    <input
                      type="text"
                      value={otherCompanyDepartment}
                      onChange={(e) => setOtherCompanyDepartment(e.target.value)}
                      placeholder="Enter department name"
                      className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (otherCompanyDepartment.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            companyInfo: {
                              ...prev.companyInfo,
                              departments: [...prev.companyInfo.departments, otherCompanyDepartment.trim()]
                            }
                          }));
                          setOtherCompanyDepartment('');
                          setIsOtherCompanyDepartment(false);
                        }
                      }}
                      className="px-4 py-2 bg-black text-white rounded-xl font-poppins hover:bg-gray-800"
                    >
                      Add Department
                    </button>
                  </div>
                )}

                {errors.departments && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.departments}</p>
                )}
              </div>

              {/* Company Address */}
              <div className="space-y-4">
                <h3 className="font-semibold font-poppins text-[15px]">Company Address</h3>
                
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
                      Region <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="region"
                        value={formData.companyInfo.companyAddress.region}
                        onChange={handleRegionChange}
                        className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                          errors.region ? 'border-red-500' : 'border-black'
                        }`}
                      >
                        <option value="">Select Region</option>
                        {Object.values(PHILIPPINES_REGIONS).flat().map(region => (
                          <option key={region.name} value={region.name}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.region && (
                      <p className="mt-1 text-red-500 text-sm font-poppins">{errors.region}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-poppins text-[15px]">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="province"
                        value={formData.companyInfo.companyAddress.province}
                        onChange={handleProvinceChange}
                        disabled={!formData.companyInfo.companyAddress.region}
                        className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                          errors.province ? 'border-red-500' : 
                          !formData.companyInfo.companyAddress.region ? 'border-gray-200 bg-gray-100' : 
                          'border-black'
                        }`}
                      >
                        <option value="">Select Province</option>
                        {availableProvinces.map(province => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.province && (
                      <p className="mt-1 text-red-500 text-sm font-poppins">{errors.province}</p>
                    )}
                  </div>
                </div>

                {/* City and Postal Code in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-poppins text-[15px]">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="city"
                        value={formData.companyInfo.companyAddress.city}
                        onChange={handleCityChange}
                        disabled={!formData.companyInfo.companyAddress.province}
                        className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                          errors.city ? 'border-red-500' : 
                          !formData.companyInfo.companyAddress.province ? 'border-gray-200 bg-gray-100' : 
                          'border-black'
                        }`}
                      >
                        <option value="">Select City</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-red-500 text-sm font-poppins">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-poppins text-[15px]">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.companyInfo.companyAddress.postalCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleInputChange({
                          target: {
                            name: 'postalCode',
                            value: value.slice(0, 4)
                          }
                        }, 'companyInfo', 'companyAddress');
                      }}
                      maxLength="4"
                      className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                        errors.postalCode ? 'border-red-500' : 'border-black'
                      }`}
                      placeholder="Enter 4-digit postal code"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-red-500 text-sm font-poppins">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Barangay */}
                <div>
                  <label className="block mb-2 font-poppins text-[15px]">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="barangay"
                      value={formData.companyInfo.companyAddress.barangay}
                      onChange={(e) => handleInputChange(e, 'companyInfo', 'companyAddress')}
                      disabled={!formData.companyInfo.companyAddress.city}
                      className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                        errors.barangay ? 'border-red-500' : 
                        !formData.companyInfo.companyAddress.city ? 'border-gray-200 bg-gray-100' : 
                        'border-black'
                      }`}
                    >
                      <option value="">Select Barangay</option>
                      {availableBarangays.map(barangay => (
                        <option key={barangay} value={barangay}>
                          {barangay}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.barangay && (
                    <p className="mt-1 text-red-500 text-sm font-poppins">{errors.barangay}</p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block mb-2 font-poppins text-[15px]">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.companyInfo.companyAddress.street}
                    onChange={(e) => handleInputChange(e, 'companyInfo', 'companyAddress')}
                    className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                      errors.street ? 'border-red-500' : 'border-black'
                    }`}
                    placeholder="Enter complete street address"
                  />
                  {errors.street && (
                    <p className="mt-1 text-red-500 text-sm font-poppins">{errors.street}</p>
                  )}
                </div>
              </div>

              {/* Document Upload Section */}
              {renderDocumentUploadSection()}
            </div>
          </div>
        );
  
      case 3:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-2">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Contact Information</h2>
              <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">
                Please provide contact details for your company representative
              </p>
            </div>
  
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.contactPerson.fullName}
                  onChange={(e) => {
                    handleInputChange(e, 'contactPerson');
                    const error = validateFullName(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      fullName: error
                    }));
                  }}
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.fullName ? 'border-red-500' : 'border-black'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.fullName}</p>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Position *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.contactPerson.position}
                  onChange={(e) => {
                    handleInputChange(e, 'contactPerson');
                    const error = validatePosition(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      position: error
                    }));
                  }}
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.position ? 'border-red-500' : 'border-black'
                  }`}
                  placeholder="Enter position"
                />
                {errors.position && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.position}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.contactPerson.phoneNumber}
                  onChange={(e) => handleInputChange(e, 'contactPerson')}
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.phoneNumber ? 'border-red-500' : 'border-black'
                  }`}
                  placeholder="+639123456789, 09123456789, or 9123456789"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Alternative Phone Number */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Alternative Phone Number</label>
                <input
                  type="tel"
                  name="alternativePhoneNumber"
                  value={formData.contactPerson.alternativePhoneNumber}
                  onChange={(e) => handleInputChange(e, 'contactPerson')}
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.alternativePhoneNumber ? 'border-red-500' : 'border-black'
                  }`}
                  placeholder="+639123456789, 09123456789, or 9123456789"
                />
                {errors.alternativePhoneNumber && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.alternativePhoneNumber}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.contactPerson.email}
                  onChange={(e) => {
                    handleInputChange(e, 'contactPerson');
                    const error = validateEmail(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      contactEmail: error
                    }));
                  }}
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.contactEmail ? 'border-red-500' : 'border-black'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.contactEmail}</p>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.contactPerson.linkedIn}
                  onChange={(e) => handleInputChange(e, 'contactPerson')}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

            </div>
          </div>
        );
  
      case 4:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-2">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Accessibility Information</h2>
              <p className="text-center text-gray-600 mb-6 font-poppins text-[16px]">
                Please provide information about your company's accessibility features
              </p>
            </div>
  
            <div className="space-y-4">
              {/* Accessibility Features */}
              <div>
                <label className="block mb-2 font-poppins text-[15px]">
                  Accessibility Features <span className="text-red-500">*</span>
                </label>
                <select
                  name="accessibilityFeatures"
                  onChange={handleAddAccessibilityFeature}
                  className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                    errors.accessibilityFeatures ? 'border-red-500' : 'border-black'
                  }`}
                  value=""
                >
                  <option value="" disabled>Select accessibility features</option>
                  {accessibilityFeaturesOptions.map((feature) => (
                    <option key={feature} value={feature}>{feature}</option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.pwdSupport.accessibilityFeatures.map((feature, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-black">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveAccessibilityFeature(feature)}
                        className="ml-2 text-black hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {errors.accessibilityFeatures && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.accessibilityFeatures}</p>
                )}

                {/* Custom Accessibility Feature Input */}
                {isOtherAccessibilityFeature && (
                  <div className="mt-4 space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={otherAccessibilityFeature}
                        onChange={(e) => setOtherAccessibilityFeature(e.target.value)}
                        placeholder="Enter accessibility feature"
                        className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins pr-8"
                      />
                      <button
                        onClick={() => setIsOtherAccessibilityFeature(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddOtherAccessibilityFeature}
                      className="px-4 py-2 bg-black text-white rounded-xl font-poppins hover:bg-gray-800"
                    >
                      Add Feature
                    </button>
                  </div>
                )}
              </div>

              {/* Remote Work Options */}
              <div className="mt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remoteWorkOptions"
                    checked={formData.pwdSupport.remoteWorkOptions}
                    onChange={(e) => handleInputChange(e, 'pwdSupport')}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-black text-black"
                  />
                  <span className="font-poppins text-[15px]">Remote Work Options Available</span>
                </label>
              </div>

              {/* Support Programs */}
              <div className="mt-6">
                <label className="block mb-2 font-poppins text-[15px]">
                  Support Programs <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  name="supportPrograms"
                  value={formData.pwdSupport.supportPrograms}
                  onChange={(e) => handleInputChange(e, 'pwdSupport')}
                  className="w-full p-2 border border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins min-h-[100px]"
                  placeholder="Describe any support programs or initiatives your company offers..."
                />
                {errors.supportPrograms && (
                  <p className="mt-1 text-red-500 text-sm font-poppins">{errors.supportPrograms}</p>
                )}
                <p className="mt-1 text-gray-500 text-sm font-poppins">
                  Optional: Describe any support programs or initiatives for PWD employees
                </p>
              </div>
            </div>
          </div>
        );
  
      case 5:
        return (
          <div className="mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-semibold text-center mb-2 font-poppins text-[36px]">Confirmation</h2>
              <p className="text-center text-gray-600 mb-4 font-poppins text-[16px]">Please review your details and submit your application</p>
            </div>

            {/* Company Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold font-poppins text-[16px] mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Company Name</p>
                  <p className="font-poppins text-[14px]">{formData.companyInfo.companyName}</p>
                </div>
                
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Industry</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.companyInfo.industry.map((industry, index) => (
                      <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-poppins">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Company Size</p>
                  <p className="font-poppins text-[14px]">{formData.companyInfo.companySize}</p>
                </div>

                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Full Address</p>
                  <p className="font-poppins text-[14px]">
                    {`${formData.companyInfo.companyAddress.street}, Brgy. ${formData.companyInfo.companyAddress.barangay}, ${formData.companyInfo.companyAddress.city}, ${formData.companyInfo.companyAddress.province}, ${formData.companyInfo.companyAddress.postalCode}, Philippines`}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold font-poppins text-[16px] mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Contact Person</p>
                  <p className="font-poppins text-[14px]">{formData.contactPerson.fullName}</p>
                </div>
                
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Position</p>
                  <p className="font-poppins text-[14px]">{formData.contactPerson.position}</p>
                </div>
                
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Email</p>
                  <p className="font-poppins text-[14px]">{formData.contactPerson.email}</p>
                </div>
                
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Phone Number</p>
                  <p className="font-poppins text-[14px]">{formData.contactPerson.phoneNumber}</p>
                </div>

              </div>
            </div>

            {/* Accessibility Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold font-poppins text-[16px] mb-4">Accessibility Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-poppins text-[14px] text-gray-500">Accessibility Features</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.pwdSupport.accessibilityFeatures.map((feature, index) => (
                      <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-poppins">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {formData.pwdSupport.remoteWorkOptions && (
                  <div>
                    <p className="font-poppins text-[14px] text-gray-500">Remote Work</p>
                    <p className="font-poppins text-[14px]">Available</p>
                  </div>
                )}

                {formData.pwdSupport.supportPrograms && (
                  <div>
                    <p className="font-poppins text-[14px] text-gray-500">Support Programs</p>
                    <p className="font-poppins text-[14px]">{formData.pwdSupport.supportPrograms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
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

  // Add this debug helper
  useEffect(() => {
    console.log('Current step changed to:', currentStep);
  }, [currentStep]);

  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Current form data:', formData);
    console.log('Current errors:', errors);
  }, [currentStep, formData, errors]);

  // Add file handling functions
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedDocType) {
      setNotification({
        type: 'error',
        message: 'Please select both a document type and a file',
        isVisible: true
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return;
    }

    // Validate file
    const validationErrors = validateDocument(file, selectedDocType);
    if (validationErrors.length > 0) {
      setNotification({
        type: 'error',
        message: validationErrors[0],
        isVisible: true
      });
      // Clear the file input
      e.target.value = '';
      setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      return;
    }

    // Update uploaded documents
    setUploadedDocs(prev => ({
      ...prev,
      [selectedDocType]: {
        file,
        name: file.name,
        type: file.type
      }
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
      message: `${selectedDocType === 'companyPermit' ? 'Company Permit' : 
                selectedDocType === 'taxId' ? 'Tax ID' : 
                'Certificate of Incorporation'} uploaded successfully`,
      isVisible: true
    });

    // Reset selected document type and file input
    setSelectedDocType('');
    e.target.value = '';

    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
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
      message: `${docType === 'companyPermit' ? 'Company Permit' : 
                docType === 'taxId' ? 'Tax ID' : 
                'Certificate of Incorporation'} removed successfully`,
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/check-email`, { email });
      
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
      if (error.response?.data?.message) {
        setNotification({
          type: 'error',
          message: error.response.data.message,
          isVisible: true
        });
        setTimeout(() => {
          setNotification(prev => ({ ...prev, isVisible: false }));
        }, 3000);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Add this helper function to handle notifications
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

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setFormData(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        companyAddress: {
          ...prev.companyInfo.companyAddress,
          region: selectedRegion,
          province: '',
          city: '',
          barangay: ''
        }
      }
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
      companyInfo: {
        ...prev.companyInfo,
        companyAddress: {
          ...prev.companyInfo.companyAddress,
          province: selectedProvince,
          city: '',
          barangay: ''
        }
      }
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
      companyInfo: {
        ...prev.companyInfo,
        companyAddress: {
          ...prev.companyInfo.companyAddress,
          city: selectedCity,
          barangay: ''
        }
      }
    }));
    
    // Get barangays for selected city
    const barangays = getBarangaysForCity(selectedCity);
    setAvailableBarangays(barangays);
  };

  // Update the company address section in renderStepContent case 2
  const renderCompanyAddress = () => (
    <div className="space-y-4">
      <h3 className="font-semibold font-poppins text-[15px]">Company Address</h3>
      
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
            Region <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="region"
              value={formData.companyInfo.companyAddress.region}
              onChange={handleRegionChange}
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.region ? 'border-red-500' : 'border-black'
              }`}
            >
              <option value="">Select Region</option>
              {Object.values(PHILIPPINES_REGIONS).flat().map(region => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          {errors.region && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.region}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            Province <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="province"
              value={formData.companyInfo.companyAddress.province}
              onChange={handleProvinceChange}
              disabled={!formData.companyInfo.companyAddress.region}
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.province ? 'border-red-500' : 
                !formData.companyInfo.companyAddress.region ? 'border-gray-200 bg-gray-100' : 
                'border-black'
              }`}
            >
              <option value="">Select Province</option>
              {availableProvinces.map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          {errors.province && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.province}</p>
          )}
        </div>
      </div>

      {/* City and Postal Code in one row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="city"
              value={formData.companyInfo.companyAddress.city}
              onChange={handleCityChange}
              disabled={!formData.companyInfo.companyAddress.province}
              className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
                errors.city ? 'border-red-500' : 
                !formData.companyInfo.companyAddress.province ? 'border-gray-200 bg-gray-100' : 
                'border-black'
              }`}
            >
              <option value="">Select City</option>
              {availableCities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          {errors.city && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-poppins text-[15px]">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.companyInfo.companyAddress.postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange({
                target: {
                  name: 'postalCode',
                  value: value.slice(0, 4)
                }
              }, 'companyInfo', 'companyAddress');
            }}
            maxLength="4"
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.postalCode ? 'border-red-500' : 'border-black'
            }`}
            placeholder="Enter 4-digit postal code"
          />
          {errors.postalCode && (
            <p className="mt-1 text-red-500 text-sm font-poppins">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Barangay */}
      <div>
        <label className="block mb-2 font-poppins text-[15px]">
          Barangay <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="barangay"
            value={formData.companyInfo.companyAddress.barangay}
            onChange={(e) => handleInputChange(e, 'companyInfo', 'companyAddress')}
            disabled={!formData.companyInfo.companyAddress.city}
            className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
              errors.barangay ? 'border-red-500' : 
              !formData.companyInfo.companyAddress.city ? 'border-gray-200 bg-gray-100' : 
              'border-black'
            }`}
          >
            <option value="">Select Barangay</option>
            {availableBarangays.map(barangay => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
        </div>
        {errors.barangay && (
          <p className="mt-1 text-red-500 text-sm font-poppins">{errors.barangay}</p>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label className="block mb-2 font-poppins text-[15px]">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="street"
          value={formData.companyInfo.companyAddress.street}
          onChange={(e) => handleInputChange(e, 'companyInfo', 'companyAddress')}
          className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 font-poppins ${
            errors.street ? 'border-red-500' : 'border-black'
          }`}
          placeholder="Enter complete street address"
        />
        {errors.street && (
          <p className="mt-1 text-red-500 text-sm font-poppins">{errors.street}</p>
        )}
      </div>
    </div>
  );

  // Add this function to handle company departments
  const handleAddCompanyDepartment = (e) => {
    const selectedDepartment = e.target.value;
    if (selectedDepartment === 'Others') {
      setIsOtherCompanyDepartment(true);
    } else if (selectedDepartment && !formData.companyInfo.departments.includes(selectedDepartment)) {
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          departments: [...prev.companyInfo.departments, selectedDepartment]
        }
      }));
      e.target.value = ''; // Reset select after adding
    }
  };

  // Add this function to handle custom company department
  const handleAddOtherCompanyDepartment = () => {
    if (otherCompanyDepartment.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          departments: [...prev.companyInfo.departments, otherCompanyDepartment.trim()]
        }
      }));
      setOtherCompanyDepartment('');
      setIsOtherCompanyDepartment(false);
    }
  };

  // Add these validation functions near the top of the file, with other validation functions

  const validateFullName = (name) => {
    if (!name) return "Full name is required";
    if (!/^[a-zA-Z\s-']+$/.test(name)) return "Only letters, spaces, hyphens, and apostrophes allowed";
    if (name.length < 2) return "Must be at least 2 characters long";
    return null;
  };

  const validatePosition = (position) => {
    if (!position) return "Position is required";
    if (!/^[a-zA-Z\s-']+$/.test(position)) return "Only letters, spaces, hyphens, and apostrophes allowed";
    if (position.length < 2) return "Must be at least 2 characters long";
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    return null;
  };

  // Add this component near your other modal components
  const ReloadConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4 font-poppins">Confirm Reload</h3>
          <p className="text-gray-600 mb-6 font-poppins">
            You have unsaved changes. Are you sure you want to reload the page? All your progress will be lost.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-poppins"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-poppins"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {registrationSuccess ? (
        <SuccessRegistration />
      ) : (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
          {/* Desktop navigation */}
          <div className="hidden md:block">
            <NavEmRegister steps={steps} currentStep={currentStep} />
          </div>
          
          {/* Mobile navigation dots */}
          <div className="block md:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={logo} alt="logo" className="w-8 h-8" />
                  <span className="ml-2 text-xl font-semibold">EmpowerPWD</span>
                </div>
                <Link to="/" className="text-sm font-bold">
                  Login
                </Link>
              </div>
            </div>
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

          {/* Main Form Container */}
          <div className="max-w-2xl w-full mx-auto p-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-end mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="w-24 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-black rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mr-4 font-poppins"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`w-24 px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black font-poppins ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {currentStep === 5 ? (
                    isSubmitting ? 'Submitting...' : 'Submit'
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Modals */}
          <ReloadConfirmationModal
            isOpen={showReloadModal}
            onClose={() => setShowReloadModal(false)}
            onConfirm={() => {
              setShowReloadModal(false);
              window.location.reload();
            }}
          />
          <NotificationModal 
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
          />
          {isModalOpen && <SuccessModal onClose={handleCloseModal} />}
          {isTermsModalOpen && <TermsModal onClose={() => setIsTermsModalOpen(false)} onAccept={() => setAcceptTerms(true)} />}
        </div>
      )}
    </>
  );
};

export default EmployerRegistrationForm;
