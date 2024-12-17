import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, ChevronRight, CheckIcon, Upload, ChevronUp, ChevronDown, CheckCircle ,AlertCircle, Search, FileText } from 'lucide-react';
import NavSeeker from '../ui/navSeeker';
import { format } from 'date-fns';
import { getAllProvinces, getCitiesForProvince, getBarangaysForCity, debugLocationData } from '../../data/philippineLocations';
import axiosInstance from '../../utils/axios';  // <-- Correct import path

const steps = [
  { id: 1, title: 'InputInfo' },
  { id: 2, title: 'ViewInfo' },
];

const tabOrder = ['personal', 'preferences', 'work', 'questions', 'documents'];

// Move SwitchButton component definition to the top, before ApplicationForm
const SwitchButton = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// Add this function at the component level (before the ApplicationForm component)
const isWorkEntryComplete = (entry) => {
  if (!entry) return false;

  // Check if all required fields are filled
  const hasRequiredFields = 
    Boolean(entry.previousJobTitle?.trim()) &&
    Boolean(entry.companyName?.trim()) &&
    Boolean(entry.startDate) &&
    Boolean(entry.keyResponsibility?.trim());

  // If it's marked as current job, we only need the start date
  if (entry.isCurrentJob) {
    return hasRequiredFields;
  }

  // If not current job, check if both dates exist and are valid
  const hasValidDates = entry.startDate && 
    (entry.isCurrentJob || (entry.endDate && new Date(entry.endDate) >= new Date(entry.startDate)));

  return hasRequiredFields && (entry.isCurrentJob || hasValidDates);
};

const WorkHistoryEntry = ({ entry, index, onChange, onRemove, isNew = false, showToast }) => {
  // Initialize expanded state based on isNew
  const [isExpanded, setIsExpanded] = useState(isNew);

  // Remove the useEffect that auto-collapses
  // useEffect(() => {
  //   if (isWorkEntryComplete(entry) && !isNew && !entry.isBeingEdited) {
  //     setIsExpanded(false);
  //   }
  // }, [entry, isNew]);

  const [isCurrentJob, setIsCurrentJob] = useState(entry.isCurrentJob || false);

  // Get current date for comparison
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const years = Array.from(
    { length: currentYear - (currentYear - 50) + 1 }, 
    (_, i) => currentYear - i
  );
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateChange = (field, type, newValue) => {
    if (!newValue) {
      // If no value is selected, clear the date
      onChange(field, '');
      return;
    }

    let date = new Date();
    
    if (entry[field]) {
      date = new Date(entry[field]);
    } else {
      // Set to first day of month for consistency
      date.setDate(1);
    }

    if (type === 'month') {
      date.setMonth(months.indexOf(newValue));
    } else {
      date.setFullYear(parseInt(newValue));
    }

    // Format date as YYYY-MM
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Validate dates
    if (field === 'startDate') {
      // If end date exists, validate it's not before the new start date
      if (entry.endDate) {
        const endDate = new Date(entry.endDate);
        if (endDate < date) {
          // Clear end date if it's before the new start date
          onChange('endDate', '');
          showToast('End date was cleared as it was before the new start date', 'warning');
        }
      }
    } else if (field === 'endDate') {
      // Validate end date is not before start date
      if (entry.startDate) {
        const startDate = new Date(entry.startDate);
        if (date < startDate) {
          showToast('End date cannot be before start date', 'error');
          return; // Don't update the end date
        }
      } else {
        showToast('Please select a start date first', 'warning');
        return; // Don't update the end date
      }
    }

    // Update the entry
    onChange(field, formattedDate);

    // Update duration
    const durationText = formatDateRange(
      field === 'startDate' ? formattedDate : entry.startDate,
      field === 'endDate' ? formattedDate : entry.endDate
    );
    onChange('duration', durationText);
  };

  // Update the formatDateRange function
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const startStr = `${months[start.getMonth()]} ${start.getFullYear()}`;
    
    if (!endDate) {
      return isCurrentJob ? `${startStr} - Present` : '';
    }
    
    const end = new Date(endDate);
    const endStr = `${months[end.getMonth()]} ${end.getFullYear()}`;
    
    return `${startStr} - ${endStr}`;
  };

  // Handle current job toggle
  const handleCurrentJobToggle = (checked) => {
    setIsCurrentJob(checked);
    
    const updates = {
      isCurrentJob: checked,
      endDate: checked ? '' : entry.endDate // Remove default date
    };
    
    // Update all changed fields at once
    Object.entries(updates).forEach(([field, value]) => {
      onChange(field, value);
    });
    
    // Update duration after state changes
    const durationText = formatDateRange(
      entry.startDate,
      checked ? null : updates.endDate
    );
    onChange('duration', durationText);
    
    // For debugging
    console.log('Current job toggled:', {
      checked,
      updates,
      durationText
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 mb-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              border border-gray-200 hover:border-gray-300
              flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More
              </>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Collapsed view */}
      {!isExpanded && (
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-gray-900">
              {entry.previousJobTitle || <span className="text-gray-400">Job Title</span>}
            </h5>
            <p className="text-sm text-gray-600">
              {entry.companyName || <span className="text-gray-400">Company Name</span>}
            </p>
            {entry.startDate && (
              <p className="text-sm text-gray-500">
                {formatDateRange(entry.startDate, entry.endDate)}
              </p>
            )}
          </div>
          {!isWorkEntryComplete(entry) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-50 text-yellow-700">
              Incomplete
            </span>
          )}
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Job Title */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              value={entry.previousJobTitle}
              onChange={(e) => onChange('previousJobTitle', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Software Engineer"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={entry.companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Tech Company Inc."
            />
          </div>

          {/* Employment Period */}
          <div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={entry.startDate ? months[new Date(entry.startDate).getMonth()] : ''}
                  onChange={(e) => handleDateChange('startDate', 'month', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={entry.startDate ? new Date(entry.startDate).getFullYear() : ''}
                  onChange={(e) => handleDateChange('startDate', 'year', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {!entry.startDate && (
                <p className="mt-1 text-sm text-gray-500">
                  Please select a start date first
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={entry.endDate ? months[new Date(entry.endDate).getMonth()] : ''}
                  onChange={(e) => handleDateChange('endDate', 'month', e.target.value)}
                  disabled={isCurrentJob || !entry.startDate}
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isCurrentJob || !entry.startDate ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option 
                      key={month} 
                      value={month}
                      disabled={
                        entry.startDate && 
                        new Date(entry.startDate).getFullYear() === new Date(entry.endDate || new Date()).getFullYear() &&
                        months.indexOf(month) < new Date(entry.startDate).getMonth()
                      }
                    >
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={entry.endDate ? new Date(entry.endDate).getFullYear() : ''}
                  onChange={(e) => handleDateChange('endDate', 'year', e.target.value)}
                  disabled={isCurrentJob || !entry.startDate}
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isCurrentJob || !entry.startDate ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option 
                      key={year} 
                      value={year}
                      disabled={year < new Date(entry.startDate).getFullYear()}
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {!entry.startDate && (
                <p className="mt-1 text-sm text-gray-500">
                  Please select a start date first
                </p>
              )}
            </div>
          </div>

          {/* Key Responsibilities */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Key Responsibilities & Achievements
            </label>
            <textarea
              value={entry.keyResponsibility}
              onChange={(e) => onChange('keyResponsibility', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Describe your main responsibilities and key achievements in this role..."
              rows="4"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Add these functions near the top of the file, after imports and before component definitions

// Helper function to check if an entry is empty
const isEmptyEntry = (entry) => {
  if (!entry) return true;
  
  return !entry.previousJobTitle?.trim() && 
         !entry.companyName?.trim() && 
         !entry.startDate && 
         !entry.keyResponsibility?.trim();
};

// Add the Toast component
const Toast = ({ message, type, show }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg shadow-lg p-4 ${
        type === 'error' 
          ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
          : 'bg-green-50 border-l-4 border-green-500 text-green-700'
      }`}>
        <div className="flex items-center">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const jobData = location.state || {};
  //const [userInfo, setUserInfo] = useState({});
  const [authError, setAuthError] = useState(null);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [step, setStep] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const [profileData, setProfileData] = useState({
    basicInfo: {
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
      country: '',
      postalCode: ''
    },
    jobPreferences: {
      desiredPosition: '',
      preferredStartDate: '',
      availability: '',
      accomodation: ''
    },
    workHistory: {
      previousJobTitle: '',
      companyName: '',
      duration: '',
      keyResponsibility: ''
    },
    documents: {
      resumeUrl: null,
      coverLetterUrl: null
    }
  });

  const [formValues, setFormValues] = useState({
    basicInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
      country: '',
      postalCode: ''
    }
  });

  const [data, setData] = useState({
    basicInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
      country: '',
      postalCode: ''
    },
    workHistory: []
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [useProfileData, setUseProfileData] = useState(true);
  const [workEntries, setWorkEntries] = useState([]);

  const [selectedExperiences, setSelectedExperiences] = useState(new Set());

  // Add state for jobseeker ID
  const [jobseekerId, setJobseekerId] = useState(null);

  // Add these state variables at the top with other state declarations
  const [addressSuggestions, setAddressSuggestions] = useState({
    provinces: [],
    cities: [],
    barangays: []
  });
  const [answers, setAnswers] = useState({});
  // Add this state to track input focus
  const [focusedInput, setFocusedInput] = useState(null);

  // Add these state variables for validation
  const [errors, setErrors] = useState({
    basicInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
      postalCode: ''
    }
  });

  // Add validation functions
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s-']+$/;
    return nameRegex.test(name);
  };

  // Update the handleAddExperience function
  const handleAddExperience = () => {
    const lastEntry = workEntries[workEntries.length - 1];
    
    if (workEntries.length === 0 || 
        (isWorkEntryComplete(lastEntry) && !isEmptyEntry(lastEntry))) {
      const newEntry = {
        previousJobTitle: '',
        companyName: '',
        startDate: '',
        endDate: '',
        duration: '',
        keyResponsibility: '',
        isCurrentJob: false
      };
      
      // Add the new entry and pass isNew=true to expand it
      setWorkEntries(prev => [...prev.map(entry => ({
        ...entry,
        isNew: false // Mark all previous entries as not new
      })), {
        ...newEntry,
        isNew: true // Mark the new entry as new
      }]);
    } else {
      showToast('Please complete the current work experience entry before adding a new one', 'error');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Allow +63 or 0 followed by exactly 10 digits
    const phoneRegex = /^(\+63|0)[0-9]{10}$/;
    return phoneRegex.test(phone) && phone.length <= 13; // +63 + 10 digits = 13 chars
  };

  const validatePostalCode = (code) => {
    // Only allow 4 digits for Philippine postal codes
    const postalRegex = /^[0-9]{4}$/;
    return postalRegex.test(code);
  };

  // Update the phone number formatting and validation
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    let cleaned = value.replace(/\D/g, '');
    
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Remove 63 from start if present
    if (cleaned.startsWith('63')) {
      cleaned = cleaned.substring(2);
    }
    
    // Limit to 10 digits (excluding +63)
    cleaned = cleaned.slice(0, 10);
    
    // Always add +63 prefix
    return `+63${cleaned}`;
  };

  // Add these handler functions before the render
  const handleProvinceChange = (value) => {
    console.log('handleProvinceChange called with:', value); // Debug log
    const allProvinces = getAllProvinces();
    console.log('All provinces:', allProvinces); // Debug log
    
    const suggestions = allProvinces.filter(p => 
      p.toLowerCase().includes(value.toLowerCase())
    );
    console.log('Filtered suggestions:', suggestions); // Debug log
    
    setAddressSuggestions(prev => ({ ...prev, provinces: suggestions }));
    
    if (!useProfileData) {
      setFormValues(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          province: value,
          city: '',
          barangay: ''
        }
      }));
    }
  };

  const handleCityChange = (value) => {
    const currentProvince = useProfileData ? data.basicInfo.province : formValues.basicInfo.province;
    let suggestions = [];
    
    if (currentProvince) {
      const allCities = getCitiesForProvince(currentProvince) || [];
      suggestions = value.trim()
        ? allCities.filter(c => c.toLowerCase().includes(value.toLowerCase()))
        : allCities;
    }
    
    setAddressSuggestions(prev => ({ ...prev, cities: suggestions }));
    
    if (!useProfileData) {
      setFormValues(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          city: value,
          barangay: ''
        }
      }));
    }
  };

  const handleBarangayChange = (value) => {
    const currentCity = useProfileData ? data.basicInfo.city : formValues.basicInfo.city;
    let suggestions = [];
    
    if (currentCity) {
      const allBarangays = getBarangaysForCity(currentCity) || [];
      suggestions = value.trim()
        ? allBarangays.filter(b => b.toLowerCase().includes(value.toLowerCase()))
        : allBarangays;
    }
    
    setAddressSuggestions(prev => ({ ...prev, barangays: suggestions }));
    
    if (!useProfileData) {
      setFormValues(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          barangay: value
        }
      }));
    }
  };

  // Update the selection handlers to clear all suggestions
  const handleProvinceSelect = (selectedProvince) => {
    setFormValues(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        province: selectedProvince,
        city: '',
        barangay: ''
      }
    }));
    // Clear ALL suggestions immediately
    setAddressSuggestions({
      provinces: [],
      cities: [],
      barangays: []
    });
  };

  const handleCitySelect = (selectedCity) => {
    setFormValues(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        city: selectedCity,
        barangay: ''
      }
    }));
    // Clear ALL suggestions immediately
    setAddressSuggestions({
      provinces: [],
      cities: [],
      barangays: []
    });
  };

  const handleBarangaySelect = (selectedBarangay) => {
    setFormValues(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        barangay: selectedBarangay
      }
    }));
    // Clear ALL suggestions immediately
    setAddressSuggestions({
      provinces: [],
      cities: [],
      barangays: []
    });
  };

  // <-------------------------------- Fectch data ------------------------------------->

  useEffect(() => {
    if (!id) {
      setErrorMessage('Missing job ID');
    }
  }, [id]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        
        // First fetch the jobseeker ID
        const profileResponse = await axios.get(`/api/seekers/profile/${userId}`);
        if (profileResponse.data.success) {
          const profile = profileResponse.data.profile;
          setJobseekerId(profile._id); // Store the jobseeker ID
          
          // Format work experience data from the profile
          const workHistory = profile.workExperience?.map(exp => ({
            previousJobTitle: exp.jobTitle || '',
            companyName: exp.company || '',
            duration: exp.isCurrentlyWorking 
              ? `${formatDate(exp.startDate)} - Present`
              : `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`,
            keyResponsibility: exp.responsibilities?.join(', ') || '',
            isCurrentlyWorking: exp.isCurrentlyWorking || false
          })) || [];

          // Set initial form data
          const initialFormData = {
            basicInfo: {
              firstName: profile.basicInfo?.firstName || '',
              lastName: profile.basicInfo?.lastName || '',
              email: profile.user?.email || '',
              phoneNumber: profile.basicInfo?.phoneNumber || '',
              address: profile.locationInfo?.address || '',
              city: profile.locationInfo?.city || '',
              province: profile.locationInfo?.province || '',
              country: profile.locationInfo?.country || '',
              postalCode: profile.locationInfo?.postal || ''
            },
            workHistory
          };

          setData(initialFormData);
          setInitialProfileData(initialFormData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setErrorMessage('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // <-------------------------------- Handle Submit ------------------------------------->

    // Loader component
    const Loader = () => (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        <p className="mt-2 text-gray-700">Loading...</p>
      </div>
    );




  // <-------------------------------- Handle Change ------------------------------------->


  const handleChange = (section, field, value) => {
    if (section === 'basicInfo' && !useProfileData) {
      let error = '';
      let formattedValue = value;

      switch (field) {
        case 'firstName':
        case 'lastName':
          if (!value.trim()) {
            error = `${field === 'firstName' ? 'First' : 'Last'} name is required`;
          } else if (!validateName(value)) {
            error = 'Name should only contain letters, spaces, hyphens, and apostrophes';
          }
          break;

        case 'email':
          if (!value.trim()) {
            error = 'Email is required';
          } else if (!validateEmail(value)) {
            error = 'Please enter a valid email address';
          }
          break;

        case 'phoneNumber':
          // Remove any non-digit characters except +
          formattedValue = value.replace(/[^\d+]/g, '');
          if (!value.trim()) {
            error = 'Phone number is required';
          } else if (!validatePhoneNumber(formattedValue)) {
            error = 'Please enter a valid Philippine phone number (+63XXXXXXXXXX)';
          } else if (formattedValue.length > 13) {
            error = 'Phone number cannot exceed 13 characters';
            formattedValue = formattedValue.slice(0, 13);
          }
          break;

        case 'postalCode':
          // Remove any non-digit characters
          formattedValue = value.replace(/\D/g, '');
          if (formattedValue.length > 4) {
            formattedValue = formattedValue.slice(0, 4);
          }
          if (value && !validatePostalCode(formattedValue)) {
            error = 'Postal code must be exactly 4 digits';
          }
          break;

        default:
          if (!value.trim() && ['province', 'city', 'barangay'].includes(field)) {
            error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          }
          break;
      }

      // Update errors
      setErrors(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          [field]: error
        }
      }));

      // Update form values with formatted value
      setFormValues(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          [field]: formattedValue
        }
      }));
    }
  };

  const handleChangeBasicInfo = (field, value) => {
    setData(prevData => ({
      ...prevData,
      basicInfo: { ...prevData.basicInfo, [field]: value }
    }));
  };

  const validateForm = () => {
    const errors = [];
    const { basicInfo } = profileData;

    //if (!basicInfo.firstName?.trim()) errors.push('First name is required');
    //if (!basicInfo.lastName?.trim()) errors.push('Last name is required');
    if (!basicInfo.email?.trim()) errors.push('Email is required');
    if (!basicInfo.phoneNumber?.trim()) errors.push('Phone number is required');
    //if (!basicInfo.location?.trim()) errors.push('Location is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  };


  const validateInputs = () => {

    if(step === 1){ 

      // Check the profile Data
      const { basicInfo, jobPreferences, workHistory, documents } = profileData;

      

      // Validate all fields
      if ( /*!basicInfo.firstName?.trim || !basicInfo.lastName?.trim || */ !basicInfo.email?.trim || !basicInfo.phoneNumber?.trim /*|| !basicInfo.location?.trim*/) {
        alert("Please fill in all personal information fields.");
        return false;
      }
      if(!jobPreferences.desiredPosition?.trim() || !jobPreferences.preferredStartDate?.trim() || !jobPreferences.availability?.trim() || !jobPreferences.accomodation?.trim()){
        alert("Please fill in all job preferences fields.");
        return false;
      }
      if(!workHistory.companyName?.trim() || !workHistory.previousJobTitle?.trim() || !workHistory.duration?.trim() || !workHistory.keyResponsibility?.trim()){
        alert("Please fill in all work history fields.");
        return false;
      }
      if(!documents.resumeUrl || !documents.coverLetterUrl){
        alert("Please upload documents.");
        return false;
      }
      
    }
    return true;  // All validations passed
  }

  // Add this state for preferences at the top with other states
  const [prefValues, setPrefValues] = useState({
    availability: '',
    preferredStartDate: '',
    accomodation: ''
  });

  // Add this function to handle preference changes
  const handlePreferenceChange = (field, value) => {
    setPrefValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add this confirmation dialog component
  const ConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Confirm Application Submission</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to submit this application? Please review all your information before confirming.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the handleSubmit function
  const handleSubmit = async () => {
    try {
      // Validate basic info
      const basicInfo = useProfileData ? data.basicInfo : formValues.basicInfo;
      if (!basicInfo?.firstName || !basicInfo?.lastName) {
        showToast('Please provide complete personal information', 'error');
        return;
      }

      // Create the application data object
      const applicationData = {
        jobId: id,
        basicInfo: {
          firstName: useProfileData ? data.basicInfo.firstName : formValues.basicInfo.firstName,
          lastName: useProfileData ? data.basicInfo.lastName : formValues.basicInfo.lastName,
          email: useProfileData ? data.basicInfo.email : formValues.basicInfo.email,
          phoneNumber: useProfileData ? data.basicInfo.phoneNumber : formValues.basicInfo.phoneNumber,
          address: useProfileData ? data.basicInfo.address : formValues.basicInfo.address,
          city: useProfileData ? data.basicInfo.city : formValues.basicInfo.city,
          province: useProfileData ? data.basicInfo.province : formValues.basicInfo.province,
          country: useProfileData ? data.basicInfo.country : formValues.basicInfo.country,
          postalCode: useProfileData ? data.basicInfo.postalCode : formValues.basicInfo.postalCode
        },
        workHistory: useExistingExperience 
          ? data.workHistory.filter((_, index) => selectedExperiences.has(index))
          : workEntries || [],
        jobPreferences: {
          availability: prefValues.availability || '',
          preferredStartDate: prefValues.preferredStartDate || '',
          accommodation: {
            required: prefValues.accomodation === 'yes',
            details: prefValues.accomodationDetails || '',
            types: {
              mobilityAccess: prefValues.mobilityAccess || false,
              visualAids: prefValues.visualAids || false,
              hearingAids: prefValues.hearingAids || false,
              flexibleSchedule: prefValues.flexibleSchedule || false
            }
          }
        },
        questionnaireAnswers: jobData?.questionnaire?.length > 0 ? Object.values(answers) : [],
        documents: {
          resumeUrl: documents.resume ? {
            path: documents.resume.path,
            originalName: documents.resume.originalName,
            mimeType: documents.resume.mimeType
          } : null,
          coverLetterUrl: documents.coverLetter ? {
            path: documents.coverLetter.path,
            originalName: documents.coverLetter.originalName,
            mimeType: documents.coverLetter.mimeType
          } : null
        }
      };
 // Additional safeguard
 Object.keys(applicationData).forEach(key => {
  if (applicationData[key] === undefined) {
    applicationData[key] = null;
  }
});

try {
  const response = await axios.post(
    '/api/applications/submit',
    applicationData,
    { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data.success) {
    setShowSuccessModal(true);
  }
} catch (axiosError) {
  console.error('Axios Error Details:', {
    response: axiosError.response?.data,
    message: axiosError.message,
    config: axiosError.config
  });

  if (axiosError.response?.data?.error === 'You have already applied for this job') {
    setShowDuplicateModal(true);
  } else {
    showToast(
      axiosError.response?.data?.message || 
      axiosError.message || 
      'Failed to submit application', 
      'error'
    );
  }
}
} catch (error) {
console.error('Submission Preparation Error:', error);
showToast('An unexpected error occurred', 'error');
} finally {
setSubmitting(false);
setShowConfirmDialog(false);
}
};

  // Add this state for error message
  const [validationError, setValidationError] = useState('');

  // Update the nextStep function
  const nextStep = () => {
    // Skip validation if using profile data
    if (useProfileData) {
      setStep(step + 1);
      return;
    }

    const { basicInfo } = formValues;
    const newErrors = { basicInfo: {} };
    let hasErrors = false;
    let errorMessage = '';

    // Only validate if not using profile data
    if (!useProfileData) {
      // Validate all required fields
      if (!basicInfo.firstName?.trim()) {
        newErrors.basicInfo.firstName = 'First name is required';
        errorMessage = 'Please enter your first name';
        hasErrors = true;
      } else if (!validateName(basicInfo.firstName)) {
        newErrors.basicInfo.firstName = 'Name should only contain letters';
        errorMessage = 'First name should only contain letters';
        hasErrors = true;
      }

      if (!basicInfo.lastName?.trim()) {
        newErrors.basicInfo.lastName = 'Last name is required';
        errorMessage = errorMessage || 'Please enter your last name';
        hasErrors = true;
      } else if (!validateName(basicInfo.lastName)) {
        newErrors.basicInfo.lastName = 'Name should only contain letters';
        errorMessage = errorMessage || 'Last name should only contain letters';
        hasErrors = true;
      }

      if (!basicInfo.email?.trim()) {
        newErrors.basicInfo.email = 'Email is required';
        errorMessage = errorMessage || 'Please enter your email';
        hasErrors = true;
      } else if (!validateEmail(basicInfo.email)) {
        newErrors.basicInfo.email = 'Please enter a valid email address';
        errorMessage = errorMessage || 'Please enter a valid email address';
        hasErrors = true;
      }

      if (!basicInfo.phoneNumber?.trim()) {
        newErrors.basicInfo.phoneNumber = 'Phone number is required';
        errorMessage = errorMessage || 'Please enter your phone number';
        hasErrors = true;
      } else if (!validatePhoneNumber(basicInfo.phoneNumber)) {
        newErrors.basicInfo.phoneNumber = 'Please enter a valid Philippine phone number';
        errorMessage = errorMessage || 'Please enter a valid Philippine phone number (+63XXXXXXXXXX)';
        hasErrors = true;
      }

      if (!basicInfo.province?.trim()) {
        newErrors.basicInfo.province = 'Province is required';
        errorMessage = errorMessage || 'Please select your province';
        hasErrors = true;
      }

      if (!basicInfo.city?.trim()) {
        newErrors.basicInfo.city = 'City is required';
        errorMessage = errorMessage || 'Please select your city';
        hasErrors = true;
      }

      // Update errors state and show message if there are errors
      setErrors(newErrors);
      if (hasErrors) {
        // Show error message
        setValidationError(errorMessage);
        // Optionally show a toast or alert
        showToast(errorMessage);
        return;
      }
    }

    // Clear any existing error message
    setValidationError('');
    // Proceed to next step
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
  switch (step) {
    case 1:
      return (
        <div className="container font-poppins">
          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Personal Information</h2>
            <p className="text-center text-gray-500 mb-4 text-[15px]">
            Please provide your personal details.
            </p>
            <div className="grid grid-cols-1">
       
              <div className="mb-6">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={useProfileData}
                    onChange={(e) => setUseProfileData(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Use my profile information</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
              <div className="mb-4 font-popp">
                  <label className="block mb-2 text-sm font-medium">
                  First Name
                </label>            
                <input
                  type="text"
                    value={useProfileData ? data.basicInfo.firstName : profileData.basicInfo.firstName}
                    onChange={(e) => {
                      if (!useProfileData) {
                        handleChange('basicInfo', 'firstName', e.target.value);
                      }
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      useProfileData ? 'bg-gray-50' : 'bg-white'
                    }`}
                  placeholder="First Name"
                    disabled={useProfileData}
                />
              </div>

              <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                  Last Name
                </label>            
                <input
                  type="text"
                    value={useProfileData ? data.basicInfo.lastName : profileData.basicInfo.lastName}
                    onChange={(e) => {
                      if (!useProfileData) {
                        handleChange('basicInfo', 'lastName', e.target.value);
                      }
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      useProfileData ? 'bg-gray-50' : 'bg-white'
                    }`}
                  placeholder="Last Name"
                    disabled={useProfileData}
                />
              </div>

              <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                  Email
                </label>            
                <input
                    type="email"
                    value={useProfileData ? data.basicInfo.email : profileData.basicInfo.email}
                    onChange={(e) => {
                      if (!useProfileData) {
                        handleChange('basicInfo', 'email', e.target.value);
                      }
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      useProfileData ? 'bg-gray-50' : 'bg-white'
                    }`}
                  placeholder="Email"
                    disabled={useProfileData}
                />
              </div>

              <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number
                </label>            
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                    +63
                  </div>
                  <input
                    type="tel"
                    value={useProfileData 
                      ? data.basicInfo.phoneNumber?.replace('+63', '') 
                      : formValues.basicInfo.phoneNumber?.replace('+63', '')
                    }
                    onChange={(e) => {
                      const formattedNumber = formatPhoneNumber(e.target.value);
                      handleChange('basicInfo', 'phoneNumber', formattedNumber);
                    }}
                    className={`w-full pl-12 pr-4 py-2 border ${
                      errors.basicInfo.phoneNumber 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    } rounded-lg focus:ring-2 focus:border-transparent ${
                      useProfileData ? 'bg-gray-50' : 'bg-white'
                    }`}
                    placeholder="9XXXXXXXXX"
                    maxLength="10"
                    disabled={useProfileData}
                  />
                </div>
                {errors.basicInfo.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.basicInfo.phoneNumber}
                  </p>
                )}
              </div> 

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {/* Country - Disabled and set to Philippines */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Country
                    </label>            
                    <input
                      type="text"
                      value="Philippines"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  </div>

                  {/* Province */}
                  <div className="relative">
                    <input
                      type="text"
                      value={useProfileData ? data.basicInfo.province : formValues.basicInfo.province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      onFocus={() => {
                        setFocusedInput('province');
                        handleProvinceChange('');
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow click to register
                        setTimeout(() => setFocusedInput(null), 200);
                      }}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        useProfileData ? 'bg-gray-50' : 'bg-white'
                      }`}
                      placeholder="Enter province"
                      disabled={useProfileData}
                    />
                    {!useProfileData && focusedInput === 'province' && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {addressSuggestions.provinces.map((province, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent input blur
                              handleProvinceSelect(province);
                            }}
                          >
                            {province}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      City/Municipality
                    </label>            
                    <div className="relative">
                      <input
                        type="text"
                        value={useProfileData ? data.basicInfo.city : formValues.basicInfo.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        onFocus={() => handleCityChange('')} // Show all suggestions on focus
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          useProfileData ? 'bg-gray-50' : 'bg-white'
                        }`}
                        placeholder="Enter city"
                        disabled={useProfileData}
                      />
                      {!useProfileData && (
                        <SuggestionDropdown 
                          items={addressSuggestions.cities}
                          onSelect={handleCitySelect}
                        />
                      )}
                    </div>
                  </div>

                  {/* Barangay */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                      Barangay
                    </label>            
                    <div className="relative">
                      <input
                        type="text"
                        value={useProfileData ? data.basicInfo.barangay : formValues.basicInfo.barangay}
                        onChange={(e) => handleBarangayChange(e.target.value)}
                        onFocus={() => handleBarangayChange('')} // Show all suggestions on focus
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          useProfileData ? 'bg-gray-50' : 'bg-white'
                        }`}
                        placeholder="Enter barangay"
                        disabled={useProfileData}
                      />
                      {!useProfileData && (
                        <SuggestionDropdown 
                          items={addressSuggestions.barangays}
                          onSelect={handleBarangaySelect}
                        />
                      )}
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Postal Code
                    </label>            
                    <input
                      type="text"
                      maxLength="4"
                      value={useProfileData ? data.basicInfo.postalCode : formValues.basicInfo.postalCode}
                      onChange={(e) => handleChange('basicInfo', 'postalCode', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.basicInfo.postalCode 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } rounded-lg focus:ring-2 focus:border-transparent ${
                        useProfileData ? 'bg-gray-50' : 'bg-white'
                      }`}
                      placeholder="Enter 4-digit postal code"
                      disabled={useProfileData}
                    />
                    {errors.basicInfo.postalCode && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.basicInfo.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Street Address / Address Line */}
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium">
                      Street Address
                    </label>            
                    <input
                      type="text"
                      value={useProfileData ? data.basicInfo.address : formValues.basicInfo.address}
                      onChange={(e) => {
                        if (!useProfileData) {
                          setFormValues(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              address: e.target.value
                            }
                          }));
                        }
                      }}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        useProfileData ? 'bg-gray-50' : 'bg-white'
                      }`}
                      placeholder="Enter street address"
                      disabled={useProfileData}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Your Job Preferences</h2>
            <p className="text-center text-[15px] text-gray-500 mb-4">
            Select your preferences related to the job. Make sure to choose the options that match your experience.
            </p>
            <div className="grid grid-cols-1">
              
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Desired Positions
                </label>            
                <input
                  type="text"
                  value={profileData.jobPreferences.desiredPosition|| ''}
                  onChange={(e) => handleChange('jobPreferences', 'desiredPosition', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Desired Positions"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Preferred Start Date
                </label>            
                <input
                  type="date"
                  value={profileData.jobPreferences.preferredStartDate || ''}
                  onChange={(e) => handleChange('jobPreferences', 'preferredStartDate', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Preferred Start Date"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Availability
                </label>            
                <input
                  type="text"
                  value={profileData.jobPreferences.availability || ''}
                  onChange={(e) => handleChange('jobPreferences', 'availability', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Availability"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Accommodation Needed
                </label>            
                <textarea
                  type="text"
                  value={profileData.jobPreferences.accomodation || ''}
                  onChange={(e) => handleChange('jobPreferences', 'accomodation', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Accomodation Needed"
                />
              </div> 
            </div>
          </section>


          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Work History</h2>
            <p className="text-center text-[15px] text-gray-500 mb-4">
            List your relevant work experiences. Focus on jobs or roles related to this position.
            </p>
            <div className="grid grid-cols-1">
              
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Previous Job Title
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.previousJobTitle || ''}
                  onChange={(e) => handleChange('workHistory', 'previousJobTitle', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Previous Job Title"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Company Name
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.companyName || ''}
                  onChange={(e) => handleChange('workHistory', 'companyName', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Company Name"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Duration
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.duration || ''}
                  onChange={(e) => handleChange('workHistory', 'duration', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Duration"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Key Responsibility
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.keyResponsibility || ''}
                  onChange={(e) => handleChange('workHistory', 'keyResponsibility', e.target.value)}
                  className="w-full bg-[#D9D9D9] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Key Responsibility"
                />
              </div> 
            </div>
          </section>


          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Upload Your Resume & Cover Letter</h2>
            <p className="text-center text-[15px] text-gray-500 mb-4">
            Upload your latest resume and an optional cover letter explaining why you're a great fit for this job.
            </p>
            <div className="grid grid-cols-1">
              
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Upload your Resume URL
                </label>            
                <input
                  type="url"
                  // accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                  value={profileData.documents.resumeUrl || ''}
                  onChange={(e) => handleChange('documents', 'resumeUrl', e.target.value)}
                  className="w-full bg-[#F4F4F4] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Resume URL"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Upload your Cover Letter URL
                </label>            
                <input
                  type="url"
                  // accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                  value={profileData.documents.coverLetterUrl || ''}
                  onChange={(e) => handleChange('documents', 'coverLetterUrl', e.target.value)}
                  className="w-full bg-[#F4F4F4] text-gray-700 px-4 py-2 rounded-[5px]"
                  placeholder="Cover Letter URL"
                />
              </div>
            </div>
          </section>

        </div>
      )

      case 2:
      return(
        <>
          <section className="mb-8 font-poppins">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Personal Information</h2>
            <p className="text-center text-gray-500 mb-4 text-[15px]">
            Please provide your personal details.
            </p>
            <div className="grid grid-cols-1">
       
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  First Name:
                </label>            
                <input
                  type="text"
                  value={data.basicInfo.firstName || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Last Name:
                </label>            
                <input
                  type="text"
                  value={data.basicInfo.lastName || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Email:
                </label>            
                <input
                  type="text"
                  value={profileData.basicInfo.email || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Phone Number:
                </label>            
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                    +63
                  </div>
                  <input
                    type="tel"
                    value={useProfileData 
                      ? data.basicInfo.phoneNumber?.replace('+63', '') 
                      : formValues.basicInfo.phoneNumber?.replace('+63', '')
                    }
                    onChange={(e) => {
                      const formattedNumber = formatPhoneNumber(e.target.value);
                      handleChange('basicInfo', 'phoneNumber', formattedNumber);
                    }}
                    className={`w-full pl-12 pr-4 py-2 border ${
                      errors.basicInfo.phoneNumber 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    } rounded-lg focus:ring-2 focus:border-transparent ${
                      useProfileData ? 'bg-gray-50' : 'bg-white'
                    }`}
                    placeholder="9XXXXXXXXX"
                    maxLength="10"
                    disabled={useProfileData}
                  />
                </div>
                {errors.basicInfo.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.basicInfo.phoneNumber}
                  </p>
                )}
              </div> 

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Current Location:
                </label>            
                <input
                  type="text"
                  value={data.basicInfo.address || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div> 
            </div>
          </section>


          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Your Job Preferences</h2>
            <p className="text-center text-[15px] text-gray-500 mb-4">
            Select your preferences related to the job. Make sure to choose the options that match your experience.
            </p>
            <div className="grid grid-cols-1">
              
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Desired Positions:
                </label>            
                <input
                  type="text"
                  value={profileData.jobPreferences.desiredPosition || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Preferred Start Date:
                </label>            
                <input
                  type="date"
                  value={profileData.jobPreferences.preferredStartDate || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Availability:
                </label>            
                <input
                  type="text"
                  value={profileData.jobPreferences.availability || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Accommodation Needed:
                </label>            
                <textarea
                  type="text"
                  value={profileData.jobPreferences.accomodation || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div> 
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Work History</h2>
            <p className="text-center text-[15px] text-gray-500 mb-4">
            List your relevant work experiences. Focus on jobs or roles related to this position.
            </p>
            <div className="grid grid-cols-1">
              
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Previous Job Title:
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.previousJobTitle || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Company Name: 
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.companyName || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Duration:
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.duration || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                key Responsibility:
                </label>            
                <input
                  type="text"
                  value={profileData.workHistory.keyResponsibility || ''}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 border border-black rounded-xl"
                  disabled
                />
              </div> 
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-center text-lg font-semibold mb-2 mt-8">Upload Your Resume & Cover Letter</h2>
            <p className="text-center text-[15px] text-gray-500 mb-4">
            Upload your latest resume and an optional cover letter explaining why you're a great fit for this job.
            </p>
            <div className="grid grid-cols-1">
              
              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                Uload Resume:
                </label>            
                <input
                  type="url"
                  // accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                  value={profileData.documents.resumeUrl || ''}
                  disabled
                  className="w-full bg-[#F4F4F4] text-gray-700 px-4 py-2 rounded-mdl"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-poppins text-[15px]">
                  Upload Cover Letter: 
                </label>            
                <input
                  type="url"
                  // accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                  value={profileData.documents.coverLetterUrl || ''}
                  disabled
                  className="w-full bg-[#F4F4F4] text-gray-700 px-4 py-2 rounded-mdl"
                />
              </div>
            </div>
          </section>
        
        </>
      )

      default:
        return null;
    }
  }

  const ConfirmDialog = () => (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl max-w-xl w-full shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Confirm Application</h2>
          <p className="text-center text-gray-600">
            Please review your information before submitting. Once submitted, you won't be able to make changes to your application.
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Review Application
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
          >
            Confirm Application
          </button>
        </div>
      </div>
    </div>
  );

  // Add function to handle work history entries
  const addWorkEntry = () => {
    // Check if the last entry is complete before adding a new one
    const lastEntry = workEntries[workEntries.length - 1];
    if (workEntries.length === 0 || isWorkEntryComplete(lastEntry)) {
      const newEntry = {
        previousJobTitle: '',
        companyName: '',
        startDate: '', // Remove default date
        endDate: '',
        duration: '',
        keyResponsibility: '',
        isCurrentJob: false,
        duration: ''
      };
      setWorkEntries(prev => [...prev, newEntry]);
    }
  };

  const removeWorkEntry = (index) => {
    setWorkEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Update the updateWorkEntry function
  const updateWorkEntry = (index, field, value) => {
    setWorkEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = {
        ...newEntries[index],
        [field]: value
      };
      
      // Check if entry is complete after update
      if (isWorkEntryComplete(newEntries[index])) {
        // Entry will be automatically collapsed by the useEffect in WorkHistoryEntry
        showToast('Work experience entry completed', 'success');
      }
      
      return newEntries;
    });
  };

  // Add this function to handle tab navigation
  const handleTabChange = (direction) => {
    if (direction === 'next') {
      // Validate current tab before proceeding
      if (activeTab === 'work') {
        if (!areAllWorkEntriesComplete(workEntries)) {
          showToast('Please complete all work experience entries before proceeding', 'error');
          return;
        }
      }
      
      if (activeTab === 'questions' && jobData?.questionnaire?.length > 0) {
        const unansweredQuestions = jobData.questionnaire.filter((_, index) => !answers[index]?.trim());
        if (unansweredQuestions.length > 0) {
          showToast('Please answer all questions before proceeding', 'error');
          return;
        }
      }

      if (activeTab === 'preferences') {
        const preferenceErrors = validatePreferences();
        if (Object.keys(preferenceErrors).length > 0) {
          setErrors(prev => ({
            ...prev,
            ...preferenceErrors
          }));
          showToast('Please fill in all required preference fields correctly', 'error');
          return;
        }
      }

      const currentIndex = tabOrder.indexOf(activeTab);
      const nextIndex = currentIndex + 1;
      if (nextIndex < tabOrder.length) {
        setActiveTab(tabOrder[nextIndex]);
      }
    } else {
      const currentIndex = tabOrder.indexOf(activeTab);
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        setActiveTab(tabOrder[prevIndex]);
      }
    }
  };

  // Create reusable class constants for consistent styling
  const inputClasses = `w-full px-3 py-2 border border-gray-300 rounded-full text-sm transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
    useProfileData ? 'bg-gray-50' : 'bg-white'
  }`;

  const textareaClasses = `w-full px-4 py-3 border border-gray-300 rounded-2xl transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
    useProfileData ? 'bg-gray-50' : 'bg-white'
  }`;

  const selectClasses = `w-full px-4 py-3 border border-gray-300 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white`;

  // First, let's add these utility classes at the top
  const cardClasses = "bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300";
  const sectionTitleClasses = "text-2xl font-semibold text-gray-800 mb-2";
  const sectionDescClasses = "text-gray-500 mb-8 text-sm";

  // Input group wrapper
  const InputGroup = ({ label, children, className = "" }) => (
    <div className={`relative ${className}`}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );

  // Add this new component for collapsible work entry
  const CollapsibleWorkEntry = ({ entry, index, onChange, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" 
             onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs text-indigo-600">
              {index + 1}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {entry.previousJobTitle || 'New Position'}
              </h3>
              <p className="text-sm text-gray-500">
                {entry.companyName || 'Company Name'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <ChevronRight 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
            />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Job Title">
                <input
                  type="text"
                  value={entry.previousJobTitle}
                  onChange={(e) => onChange('previousJobTitle', e.target.value)}
                  className={inputClasses}
                  placeholder="Enter job title"
                />
              </InputGroup>

              <InputGroup label="Company Name">
                <input
                  type="text"
                  value={entry.companyName}
                  onChange={(e) => onChange('companyName', e.target.value)}
                  className={inputClasses}
                  placeholder="Enter company name"
                />
              </InputGroup>

              <InputGroup label="Duration">
                <input
                  type="text"
                  value={entry.duration}
                  onChange={(e) => onChange('duration', e.target.value)}
                  className={inputClasses}
                  placeholder="e.g., 2 years"
                />
              </InputGroup>

              <div className="col-span-2">
                <InputGroup label="Key Responsibilities">
                  <textarea
                    value={entry.keyResponsibility}
                    onChange={(e) => onChange('keyResponsibility', e.target.value)}
                    className={textareaClasses}
                    placeholder="Describe your key responsibilities"
                    rows="3"
                  />
                </InputGroup>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add this useEffect to fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/seekers/profile`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          const profile = response.data.profile;
          
          // Format work experience data from the profile
          const workHistory = profile.workExperience?.map(exp => ({
            previousJobTitle: exp.jobTitle || '',
            companyName: exp.company || '',
            duration: exp.isCurrentlyWorking 
              ? `${formatDate(exp.startDate)} - Present`
              : `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`,
            keyResponsibility: exp.responsibilities?.join(', ') || '',
            isCurrentlyWorking: exp.isCurrentlyWorking || false
          })) || [];

          // Set initial form data
          const initialFormData = {
            basicInfo: {
              firstName: profile.basicInfo?.firstName || '',
              lastName: profile.basicInfo?.lastName || '',
              email: profile.user?.email || '',
              phoneNumber: profile.basicInfo?.phoneNumber || '',
              address: profile.locationInfo?.address || '',
              city: profile.locationInfo?.city || '',
              province: profile.locationInfo?.province || '',
              country: profile.locationInfo?.country || '',
              postalCode: profile.locationInfo?.postal || ''
            },
            workHistory
          };

          setData(initialFormData);
          setInitialProfileData(initialFormData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setErrorMessage('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);





  // Add state for initial profile data
  const [initialProfileData, setInitialProfileData] = useState(null);

  // Add this function to handle profile data toggle
  const handleProfileDataToggle = (checked) => {
    setUseProfileData(checked);
    if (checked) {
      // Use profile data
      setFormValues({
        basicInfo: {
          ...data.basicInfo
        }
      });
      setPrefValues({
        availability: profileData.jobPreferences.availability || '',
        preferredStartDate: profileData.jobPreferences.preferredStartDate || '',
        accomodation: profileData.jobPreferences.accomodation || ''
      });
    }
  };

  // Add this function to handle input changes
  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update the input fields
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium">First Name</label>            
    <input
      type="text"
      value={useProfileData ? data.basicInfo.firstName : formValues.basicInfo.firstName}
      onChange={(e) => {
        if (!useProfileData) {
          setFormValues(prev => ({
            ...prev,
            basicInfo: {
              ...prev.basicInfo,
              firstName: e.target.value
            }
          }));
        }
      }}
      className={`w-full px-4 py-2 border ${
        errors.basicInfo.firstName 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-blue-500'
      } rounded-lg focus:ring-2 focus:border-transparent`}
      placeholder="First Name"
      disabled={useProfileData}
    />
    {errors.basicInfo.firstName && (
      <p className="mt-1 text-sm text-red-500">
        {errors.basicInfo.firstName}
      </p>
    )}
  </div>

  // Update the work history section to allow selecting which experiences to include
  const toggleExperience = (index) => {
    const newSelected = new Set(selectedExperiences);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedExperiences(newSelected);
  };

  // Add this state for select all
  const [selectAll, setSelectAll] = useState(false);

  // Add this function to handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedExperiences(new Set());
    } else {
      const allIndexes = new Set(data.workHistory?.map((_, index) => index));
      setSelectedExperiences(allIndexes);
    }
    setSelectAll(!selectAll);
  };

  // Update the work history section when using profile data
  {useProfileData ? (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-600">
          Select the experiences you want to include:
        </span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {selectAll ? 'Unselect All' : 'Select All'}
        </button>
      </div>
      {data.workHistory?.map((work, index) => (
        <div 
          key={index}
          className={`bg-white p-4 rounded-xl border transition-all duration-200 ${
            selectedExperiences.has(index) 
              ? 'border-blue-200 bg-blue-50' 
              : 'border-gray-200'
          }`}
          onClick={() => toggleExperience(index)} // Make entire card clickable
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={selectedExperiences.has(index)}
              onChange={() => toggleExperience(index)}
              className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()} // Prevent double-toggle when clicking checkbox
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{work.previousJobTitle}</h3>
              <p className="text-sm text-gray-600">{work.companyName}</p>
              <p className="text-xs text-gray-500 mt-1">{work.duration}</p>
              {selectedExperiences.has(index) && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">Key Responsibilities:</p>
                  <p>{work.keyResponsibility}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4 text-sm text-gray-500 italic">
        {selectedExperiences.size} experience{selectedExperiences.size !== 1 ? 's' : ''} selected
      </div>
    </div>
  ) : (
    // Your existing manual entry form
    <div className="space-y-4">
      {workEntries.map((entry, index) => (
        <CollapsibleWorkEntry
          key={index}
          entry={entry}
          index={index}
          onChange={(field, value) => updateWorkEntry(index, field, value)}
          onRemove={() => removeWorkEntry(index)}
        />
      ))}
      <button
        type="button"
        onClick={handleAddExperience}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  )}

  // Update the preferences section to remove the disabled state
  {activeTab === 'preferences' && (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Job Preferences</h3>
      
      {/* Start Date */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          When can you start?
        </label>
        <input
          type="date"
          value={prefValues.preferredStartDate}
          min={new Date().toISOString().split('T')[0]} // Set minimum date to today
          onChange={(e) => handlePreferenceChange('preferredStartDate', e.target.value)}
          className={`w-full px-4 py-2 border ${
            errors.preferredStartDate 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          } rounded-lg focus:ring-2 focus:border-transparent`}
        />
        {errors.preferredStartDate && (
          <p className="mt-1 text-sm text-red-500">{errors.preferredStartDate}</p>
        )}
      </div>

      {/* Availability */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          What is your availability?
        </label>
        <select
          value={prefValues.availability}
          onChange={(e) => handlePreferenceChange('availability', e.target.value)}
          className={`w-full px-4 py-2 border ${
            errors.availability 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          } rounded-lg focus:ring-2 focus:border-transparent`}
        >
          <option value="">Select availability</option>
          <option value="immediate">Immediate</option>
          <option value="2weeks">2 weeks notice</option>
          <option value="1month">1 month notice</option>
          <option value="flexible">Flexible</option>
        </select>
        {errors.availability && (
          <p className="mt-1 text-sm text-red-500">{errors.availability}</p>
        )}
      </div>

      {/* Accommodation Needs */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Do you require any workplace accommodations?
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="accommodation-yes"
              name="accommodationNeeds"
              value="yes"
              checked={prefValues.accomodation === 'yes'}
              onChange={(e) => handlePreferenceChange('accomodation', e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="accommodation-yes" className="text-sm text-gray-700">
              Yes, I need workplace accommodations
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="accommodation-no"
              name="accommodationNeeds"
              value="no"
              checked={prefValues.accomodation === 'no'}
              onChange={(e) => handlePreferenceChange('accomodation', e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="accommodation-no" className="text-sm text-gray-700">
              No, I don't need any accommodations at this time
            </label>
          </div>
        </div>
        {prefValues.accomodation === 'yes' && (
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Please select the type of accommodations you need:
            </label>
            <div className="space-y-3">
              {/* Common workplace accommodations for PWDs */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="mobility-access"
                  checked={prefValues.mobilityAccess}
                  onChange={(e) => handlePreferenceChange('mobilityAccess', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <label htmlFor="mobility-access" className="text-sm text-gray-700">
                  Mobility/Accessibility accommodations (e.g., wheelchair access, accessible workstation)
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="visual-aids"
                  checked={prefValues.visualAids}
                  onChange={(e) => handlePreferenceChange('visualAids', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <label htmlFor="visual-aids" className="text-sm text-gray-700">
                  Visual aids or assistive technology
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="hearing-aids"
                  checked={prefValues.hearingAids}
                  onChange={(e) => handlePreferenceChange('hearingAids', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <label htmlFor="hearing-aids" className="text-sm text-gray-700">
                  Hearing accommodations or communication assistance
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="flexible-schedule"
                  checked={prefValues.flexibleSchedule}
                  onChange={(e) => handlePreferenceChange('flexibleSchedule', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <label htmlFor="flexible-schedule" className="text-sm text-gray-700">
                  Flexible work schedule or breaks
                </label>
              </div>

              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Additional details or other accommodations needed:
                </label>
                <textarea
                  value={prefValues.accomodationDetails || ''}
                  onChange={(e) => handlePreferenceChange('accomodationDetails', e.target.value)}
                  placeholder="Please describe any specific accommodations or additional support you may need to perform your job effectively..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                />
                <p className="mt-2 text-sm text-gray-500">
                  This information helps us prepare appropriate accommodations for your comfort and success.
                </p>
              </div>
            </div>
          </div>
        )}
        {errors.accomodation && (
          <p className="mt-1 text-sm text-red-500">{errors.accomodation}</p>
        )}
      </div>
    </div>
  )}

  const isLastTab = activeTab === tabOrder[tabOrder.length - 1];
  const isFirstTab = activeTab === tabOrder[0];

  // Add this state for documents
  const [documents, setDocuments] = useState({
    resume: null,
    coverLetter: null
  });

  // Update the file selection handler
  const handleFileSelect = (type, file) => {
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      showToast('Please upload PDF files only', 'error');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    // Store the file object with required metadata
    setDocuments(prev => ({
      ...prev,
      [type]: {
        path: URL.createObjectURL(file), // Create temporary URL for preview
        originalName: file.name,
        mimeType: file.type
      }
    }));
  };

  // Add this loading component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Submitting your application...</p>
      </div>
    </div>
  );

  // Update the suggestion dropdowns to ensure they're visible
  const SuggestionDropdown = ({ items, onSelect }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
        {items.map((item, index) => (
          <div
            key={index}
            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors"
            onClick={() => {
              onSelect(item);
              // Clear ALL suggestions immediately after selection
              setAddressSuggestions({
                provinces: [],
                cities: [],
                barangays: []
              });
            }}
          >
            {item}
          </div>
        ))}
      </div>
    );
  };

  // Debug the location data when component mounts
  useEffect(() => {
    console.log('Testing location data...');
    debugLocationData();
  }, []);

  // Add this near the top of your component
  useEffect(() => {
    // Test data access
    const testData = () => {
      const provinces = getAllProvinces();
      console.log('Test - All provinces:', provinces);
      
      if (provinces.length > 0) {
        const firstProvince = provinces[0];
        const cities = getCitiesForProvince(firstProvince);
        console.log(`Test - Cities in ${firstProvince}:`, cities);
        
        if (cities.length > 0) {
          const firstCity = cities[0];
          const barangays = getBarangaysForCity(firstCity);
          console.log(`Test - Barangays in ${firstCity}:`, barangays);
        }
      }
    };
    
    testData();
  }, []);

  // Add this button temporarily for testing
  <button
    type="button"
    onClick={() => {
      const provinces = getAllProvinces();
      console.log('Provinces:', provinces);
      setAddressSuggestions(prev => ({ ...prev, provinces }));
    }}
    className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4"
  >
    Test Show All Provinces
  </button>

  // Create a reusable input component with fixed height
  const FormInput = ({ label, error, ...inputProps }) => {
    return (
      <div className="mb-4 h-[85px]"> {/* Fixed height container */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            {...inputProps}
            className={`w-full px-4 py-2 border ${
              error 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            } rounded-lg focus:ring-2 focus:border-transparent`}
          />
          {error && (
            <p className="absolute text-sm text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Then use this component for your form inputs
  <div className="grid grid-cols-2 gap-4">
    <FormInput
      label="First Name"
      type="text"
      name="firstName"
      value={useProfileData ? data.basicInfo.firstName : formValues.basicInfo.firstName}
      onChange={(e) => handleChange('basicInfo', 'firstName', e.target.value)}
      placeholder="First Name"
      disabled={useProfileData}
      error={errors.basicInfo.firstName}
    />

    <FormInput
      label="Last Name"
      type="text"
      name="lastName"
      value={useProfileData ? data.basicInfo.lastName : formValues.basicInfo.lastName}
      onChange={(e) => handleChange('basicInfo', 'lastName', e.target.value)}
      placeholder="Last Name"
      disabled={useProfileData}
      error={errors.basicInfo.lastName}
    />

    <FormInput
      label="Email"
      type="email"
      name="email"
      value={useProfileData ? data.basicInfo.email : formValues.basicInfo.email}
      onChange={(e) => handleChange('basicInfo', 'email', e.target.value)}
      placeholder="Email"
      disabled={useProfileData}
      error={errors.basicInfo.email}
    />

    <FormInput
      label="Phone Number"
      type="tel"
      name="phoneNumber"
      value={useProfileData ? data.basicInfo.phoneNumber : formValues.basicInfo.phoneNumber}
      onChange={(e) => handleChange('basicInfo', 'phoneNumber', e.target.value)}
      placeholder="Phone Number"
      disabled={useProfileData}
      error={errors.basicInfo.phoneNumber}
    />
  </div>

  const AddressInput = ({ label, error, children }) => {
    return (
      <div className="mb-4 h-[85px]"> {/* Fixed height container */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          {children}
          {error && (
            <p className="absolute text-sm text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Use it for address fields
  <AddressInput
    label="Province"
    error={errors.basicInfo.province}
  >
    <input
      type="text"
      value={useProfileData ? data.basicInfo.province : formValues.basicInfo.province}
      onChange={(e) => handleProvinceChange(e.target.value)}
      onFocus={() => handleProvinceChange('')}
      className={`w-full px-4 py-2 border ${
        errors.basicInfo.province 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-blue-500'
      } rounded-lg focus:ring-2 focus:border-transparent`}
      placeholder="Select or type province"
      disabled={useProfileData}
    />
    {!useProfileData && (
      <SuggestionDropdown 
        items={addressSuggestions.provinces}
        onSelect={(province) => {
          handleProvinceSelect(province);
          handleProvinceChange(province);
        }}
      />
    )}
  </AddressInput>

  // Add these states at the top with other states
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error' // 'info' | 'success' | 'warning' | 'error'
  });

  // Add this helper function
  const showToast = (message, type = 'error') => {
    // Only show toast for errors
    if (type !== 'error') return;

    setToast({
      show: true,
      message,
      type: 'error'
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Add the Toast component
  const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className={`rounded-lg shadow-lg p-4 ${
          type === 'error' 
            ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
            : type === 'success'
            ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
            : 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {type === 'error' && (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              )}
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add validation for preferences
  const validatePreferences = () => {
    const errors = {};
    const today = new Date();

    // Validate start date
    if (!prefValues.preferredStartDate) {
      errors.preferredStartDate = 'Start date is required';
    } else {
      const selectedDate = new Date(prefValues.preferredStartDate);
      if (selectedDate < today) {
        errors.preferredStartDate = 'Start date cannot be in the past';
      }
    }

    // Validate availability
    if (!prefValues.availability) {
      errors.availability = 'Please select your availability';
    }

    // Validate accommodation selection
    if (!prefValues.accomodation) {
      errors.accomodation = 'Please indicate if you need workplace accommodations';
    } else if (prefValues.accomodation === 'yes') {
      // Check if at least one accommodation type is selected or details are provided
      const hasSelectedAccommodations = 
        prefValues.mobilityAccess ||
        prefValues.visualAids ||
        prefValues.hearingAids ||
        prefValues.flexibleSchedule ||
        (prefValues.accomodationDetails && prefValues.accomodationDetails.trim().length > 0);

      if (!hasSelectedAccommodations) {
        errors.accomodation = 'Please select at least one accommodation type or provide details';
      }
    }

    return errors;
  };
  // Add this component for the switch button
  const SwitchButton = ({ label, checked, onChange }) => {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  // Update the personal information section
  {activeTab === 'personal' && (
    <div>
      <SwitchButton
        label="Use information from my profile"
        checked={useProfileData}
        onChange={setUseProfileData}
      />
      
      {/* Rest of personal info form... */}
    </div>
  )}

  // Add this state at the top with other states
  const [useExistingExperience, setUseExistingExperience] = useState(false);

  // Add this to the work history section
  {activeTab === 'work' && (
    <div className="space-y-6">
      <SwitchButton
        label="Use work experience from my profile"
        checked={useExistingExperience}
        onChange={setUseExistingExperience}
      />

      {useExistingExperience ? (
        <div className="space-y-4">
          {data.workHistory?.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">Select the experiences you want to include:</p>
              {data.workHistory.map((experience, index) => (
                <div 
                  key={index} 
                  className={`p-4 bg-white rounded-lg border transition-colors duration-200 ${
                    selectedExperiences.has(index) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{experience.previousJobTitle}</h4>
                      <p className="text-sm text-gray-600">{experience.companyName}</p>
                      <p className="text-sm text-gray-500">{experience.duration}</p>
                      <p className="mt-2 text-sm text-gray-600">{experience.keyResponsibility}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newSelected = new Set(selectedExperiences);
                        if (selectedExperiences.has(index)) {
                          newSelected.delete(index);
                        } else {
                          newSelected.add(index);
                        }
                        setSelectedExperiences(newSelected);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        selectedExperiences.has(index) ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          selectedExperiences.has(index) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No work experience found in your profile.</p>
              <button
                onClick={() => setUseExistingExperience(false)}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add new work experience
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Work History</h3>
            {workEntries.length === 0 && (
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            )}
          </div>
          
          {workEntries.length > 0 && (
            <>
              {workEntries.map((entry, index) => (
                <WorkHistoryEntry
                  key={index}
                  entry={entry}
                  index={index}
                  onChange={(field, value) => updateWorkEntry(index, field, value)}
                  onRemove={() => removeWorkEntry(index)}
                  isNew={index === workEntries.length - 1 && !entry.previousJobTitle}
                  showToast={showToast}
                />
              ))}
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )}

  {activeTab === 'questions' && (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pre-Interview Questions</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please answer all questions below. Your responses will help us evaluate your application.
      </p>
      
      <div className="space-y-6">
        {jobData?.questionnaire && jobData.questionnaire.length > 0 ? (
          jobData.questionnaire.map((question, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Question {index + 1}: {question}
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              
              <textarea
                value={answers[index] || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setAnswers(prev => {
                    const updated = { ...prev, [index]: newValue };
                    console.log('Updated answers:', updated);
                    return updated;
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Type your answer here..."
                required
              />
              
              {!answers[index]?.trim() && (
                <p className="mt-2 text-sm text-red-500">
                  This question requires an answer
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No pre-interview questions for this position.</p>
          </div>
        )}
      </div>
    </div>
  )}

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Add this success modal component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            {/* Success Message */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Your application has been successfully submitted. You can track its status in My Application.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/job-list')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse More Jobs
              </button>
              <button
                onClick={() => navigate('/my-application')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View My Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
 const DuplicateApplicationModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl transform transition-all animate-scale-up">
          <div className="p-6">
            {/* Icon and Title */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Already Applied
              </h3>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-gray-600">
                You have already submitted an application for this job. Would you like to:
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/job-list')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Find Other Jobs
              </button>
              
              <button
                onClick={() => navigate('/my-application')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View My Application
              </button>

              <button
                onClick={onClose}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  {activeTab === 'documents' && (
    <div className="space-y-6">
      {/* Required Documents Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
        
        {/* Resume Upload */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Resume (PDF only)
            <span className="text-red-500 ml-1">*</span>
          </label>            
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileSelect('resume', e.target.files[0])}
              className="hidden"
              id="resumeUpload"
              required
            />
            <label
              htmlFor="resumeUpload"
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose Resume
            </label>
            {documents.resume && (
              <span className="text-sm text-gray-600">
                {documents.resume.name}
              </span>
            )}
          </div>
          {!documents.resume && (
            <p className="mt-1 text-sm text-red-500">
              * Resume is required for this position
            </p>
          )}
        </div>

        {/* Cover Letter Upload - Only show if required */}
        {jobData?.document === 'coverLetter' && (
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Cover Letter (PDF only)
              <span className="text-red-500 ml-1">*</span>
            </label>            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect('coverLetter', e.target.files[0])}
                className="hidden"
                id="coverLetterUpload"
                required
              />
              <label
                htmlFor="coverLetterUpload"
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose Cover Letter
              </label>
              {documents.coverLetter && (
                <span className="text-sm text-gray-600">
                  {documents.coverLetter.name}
                </span>
              )}
            </div>
            {!documents.coverLetter && (
              <p className="mt-1 text-sm text-red-500">
                * Cover Letter is required for this position
              </p>
            )}
          </div>
        )}

        {/* Document Guidelines */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Document Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Files must be in PDF format</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Make sure your documents are clear and readable</li>
            <li>• Include relevant contact information in your resume</li>
          </ul>
        </div>
      </div>
    </div>
  )}

  // Initialize answers when questions are loaded
  useEffect(() => {
    if (jobData?.questionnaire?.length > 0) {
      const initialAnswers = {};
      jobData.questionnaire.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
      console.log('Initialized questionnaire answers:', initialAnswers);
    }
  }, [jobData?.questionnaire]);

  // Add this useEffect to log answers when they change
  useEffect(() => {
    console.log('Current answers:', answers);
  }, [answers]);

  // Add this function to check if all work entries are complete
  const areAllWorkEntriesComplete = (entries) => {
    if (entries.length === 0) return true; // Allow next if no entries
    return entries.every(entry => {
      // Check if all required fields are filled
      const hasRequiredFields = 
        Boolean(entry.previousJobTitle?.trim()) &&
        Boolean(entry.companyName?.trim()) &&
        Boolean(entry.startDate) &&
        Boolean(entry.keyResponsibility?.trim());

      // If it's marked as current job, we only need the start date
      if (entry.isCurrentJob) {
        return hasRequiredFields;
      }

      // If not current job, check if both dates exist and are valid
      const hasValidDates = entry.startDate && 
        (entry.isCurrentJob || (entry.endDate && new Date(entry.endDate) >= new Date(entry.startDate)));

      return hasRequiredFields && (entry.isCurrentJob || hasValidDates);
    });
  };

  // Add this useEffect to debug data availability
  useEffect(() => {
    console.log('Profile Data:', {
      useProfileData,
      data: data?.basicInfo,
      formValues: formValues?.basicInfo
    });
  }, [useProfileData, data, formValues]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavSeeker />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button with improved styling */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Job Details</span>
        </button>

        {/* Job Details Card */}
        <div className={`${cardClasses} mb-6`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{jobData.jobTitle}</h1>
              <p className="text-sm text-gray-600">{jobData.companyName}</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
              Active
            </div>
          </div>
        </div>

        {/* Application Form Card */}
        <div className={cardClasses}>
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {['personal', 'preferences', 'work', 'questions', 'documents'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div 
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${activeTab === step 
                        ? 'bg-indigo-600 text-white' 
                        : index < tabOrder.indexOf(activeTab)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-16 h-0.5 ${
                      index < tabOrder.indexOf(activeTab) ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['Personal', 'Preferences', 'Work History', 'Questions', 'Documents'].map((label) => (
                <span key={label} className="text-xs text-gray-500">{label}</span>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="transition-all duration-300 transform">
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <div className="flex items-center space-x-2 mb-6">
                  <input
                    type="checkbox"
                    checked={useProfileData}
                    onChange={(e) => handleProfileDataToggle(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg transition-colors duration-200"
                  />
                  <span className="text-gray-700">Use my profile information</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">First Name</label>            
                    <input
                      type="text"
                      value={useProfileData ? data.basicInfo.firstName : formValues.basicInfo.firstName}
                      onChange={(e) => handleChange('basicInfo', 'firstName', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.basicInfo.firstName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } rounded-lg focus:ring-2 focus:border-transparent`}
                      placeholder="First Name"
                      disabled={useProfileData}
                    />
                    {errors.basicInfo.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.basicInfo.firstName}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Last Name</label>            
                    <input
                      type="text"
                      value={useProfileData ? data.basicInfo.lastName : formValues.basicInfo.lastName}
                      onChange={(e) => handleChange('basicInfo', 'lastName', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.basicInfo.lastName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } rounded-lg focus:ring-2 focus:border-transparent`}
                      placeholder="Last Name"
                      disabled={useProfileData}
                    />
                    {errors.basicInfo.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.basicInfo.lastName}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Email</label>            
                    <input
                      type="email"
                      value={useProfileData ? data.basicInfo.email : formValues.basicInfo.email}
                      onChange={(e) => handleChange('basicInfo', 'email', e.target.value)}
                      className={`w-full px-4 py-2 border ${
                        errors.basicInfo.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } rounded-lg focus:ring-2 focus:border-transparent`}
                      placeholder="Email"
                      disabled={useProfileData}
                    />
                    {errors.basicInfo.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.basicInfo.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                    Phone Number
                    </label>            
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                        +63
                      </div>
                      <input
                        type="tel"
                        value={useProfileData 
                          ? data.basicInfo.phoneNumber?.replace('+63', '') 
                          : formValues.basicInfo.phoneNumber?.replace('+63', '')
                        }
                        onChange={(e) => {
                          const formattedNumber = formatPhoneNumber(e.target.value);
                          handleChange('basicInfo', 'phoneNumber', formattedNumber);
                        }}
                        className={`w-full pl-12 pr-4 py-2 border ${
                          errors.basicInfo.phoneNumber 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        } rounded-lg focus:ring-2 focus:border-transparent ${
                          useProfileData ? 'bg-gray-50' : 'bg-white'
                        }`}
                        placeholder="9XXXXXXXXX"
                        maxLength="10"
                        disabled={useProfileData}
                      />
                    </div>
                    {errors.basicInfo.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.basicInfo.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-4">
                    {/* Country - Fixed as Philippines */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Country
                      </label>            
                      <input
                        type="text"
                        value="Philippines"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>

                    {/* Province Selection */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Province
                      </label>            
                      <div className="relative">
                        <input
                          type="text"
                          value={useProfileData ? data.basicInfo.province : formValues.basicInfo.province}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          onFocus={() => handleProvinceChange('')}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            useProfileData ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder="Select or type province"
                          disabled={useProfileData}
                        />
                        {!useProfileData && (
                          <SuggestionDropdown 
                            items={addressSuggestions.provinces}
                            onSelect={(province) => {
                              handleProvinceSelect(province);
                              handleProvinceChange(province);
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* City Selection - Only enabled if province is selected */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        City/Municipality
                      </label>            
                      <div className="relative">
                        <input
                          type="text"
                          value={useProfileData ? data.basicInfo.city : formValues.basicInfo.city}
                          onChange={(e) => handleCityChange(e.target.value)}
                          onFocus={() => handleCityChange('')}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            useProfileData || !formValues.basicInfo.province ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder={formValues.basicInfo.province ? "Select or type city" : "Please select province first"}
                          disabled={useProfileData || !formValues.basicInfo.province}
                        />
                        {!useProfileData && formValues.basicInfo.province && (
                          <SuggestionDropdown 
                            items={addressSuggestions.cities}
                            onSelect={(city) => {
                              handleCitySelect(city);
                              handleCityChange(city);
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Barangay Selection - Only enabled if city is selected */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Barangay
                      </label>            
                      <div className="relative">
                        <input
                          type="text"
                          value={useProfileData ? data.basicInfo.barangay : formValues.basicInfo.barangay}
                          onChange={(e) => handleBarangayChange(e.target.value)}
                          onFocus={() => handleBarangayChange('')}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            useProfileData || !formValues.basicInfo.city ? 'bg-gray-50' : 'bg-white'
                          }`}
                          placeholder={formValues.basicInfo.city ? "Select or type barangay" : "Please select city first"}
                          disabled={useProfileData || !formValues.basicInfo.city}
                        />
                        {!useProfileData && formValues.basicInfo.city && (
                          <SuggestionDropdown 
                            items={addressSuggestions.barangays}
                            onSelect={(barangay) => {
                              handleBarangaySelect(barangay);
                              handleBarangayChange(barangay);
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Postal Code
                      </label>            
                      <input
                        type="text"
                        maxLength="4"
                        value={useProfileData ? data.basicInfo.postalCode : formValues.basicInfo.postalCode}
                        onChange={(e) => handleChange('basicInfo', 'postalCode', e.target.value)}
                        className={`w-full px-4 py-2 border ${
                          errors.basicInfo.postalCode 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        } rounded-lg focus:ring-2 focus:border-transparent ${
                          useProfileData ? 'bg-gray-50' : 'bg-white'
                        }`}
                        placeholder="Enter 4-digit postal code"
                        disabled={useProfileData}
                      />
                      {errors.basicInfo.postalCode && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.basicInfo.postalCode}
                        </p>
                      )}
                    </div>

                    {/* Street Address */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Street Address
                      </label>            
                      <input
                        type="text"
                        value={useProfileData ? data.basicInfo.address : formValues.basicInfo.address}
                        onChange={(e) => handleChange('basicInfo', 'address', e.target.value)}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          useProfileData ? 'bg-gray-50' : 'bg-white'
                        }`}
                        placeholder="Enter street address"
                        disabled={useProfileData}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Job Preferences</h3>
                
                {/* Start Date */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    When can you start?
                  </label>
                  <input
                    type="date"
                    value={prefValues.preferredStartDate}
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                    onChange={(e) => handlePreferenceChange('preferredStartDate', e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      errors.preferredStartDate 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    } rounded-lg focus:ring-2 focus:border-transparent`}
                  />
                  {errors.preferredStartDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.preferredStartDate}</p>
                  )}
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    What is your availability?
                  </label>
                  <select
                    value={prefValues.availability}
                    onChange={(e) => handlePreferenceChange('availability', e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      errors.availability 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    } rounded-lg focus:ring-2 focus:border-transparent`}
                  >
                    <option value="">Select availability</option>
                    <option value="immediate">Immediate</option>
                    <option value="2weeks">2 weeks notice</option>
                    <option value="1month">1 month notice</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  {errors.availability && (
                    <p className="mt-1 text-sm text-red-500">{errors.availability}</p>
                  )}
                </div>

                {/* Accommodation Needs */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Do you require any workplace accommodations?
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="accommodation-yes"
                        name="accommodationNeeds"
                        value="yes"
                        checked={prefValues.accomodation === 'yes'}
                        onChange={(e) => handlePreferenceChange('accomodation', e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="accommodation-yes" className="text-sm text-gray-700">
                        Yes, I need workplace accommodations
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="accommodation-no"
                        name="accommodationNeeds"
                        value="no"
                        checked={prefValues.accomodation === 'no'}
                        onChange={(e) => handlePreferenceChange('accomodation', e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="accommodation-no" className="text-sm text-gray-700">
                        No, I don't need any accommodations at this time
                      </label>
                    </div>
                  </div>
                  {prefValues.accomodation === 'yes' && (
                    <div className="mt-4 space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Please select the type of accommodations you need:
                      </label>
                      <div className="space-y-3">
                        {/* Common workplace accommodations for PWDs */}
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="mobility-access"
                            checked={prefValues.mobilityAccess}
                            onChange={(e) => handlePreferenceChange('mobilityAccess', e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600"
                          />
                          <label htmlFor="mobility-access" className="text-sm text-gray-700">
                            Mobility/Accessibility accommodations (e.g., wheelchair access, accessible workstation)
                          </label>
                        </div>

                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="visual-aids"
                            checked={prefValues.visualAids}
                            onChange={(e) => handlePreferenceChange('visualAids', e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600"
                          />
                          <label htmlFor="visual-aids" className="text-sm text-gray-700">
                            Visual aids or assistive technology
                          </label>
                        </div>

                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="hearing-aids"
                            checked={prefValues.hearingAids}
                            onChange={(e) => handlePreferenceChange('hearingAids', e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600"
                          />
                          <label htmlFor="hearing-aids" className="text-sm text-gray-700">
                            Hearing accommodations or communication assistance
                          </label>
                        </div>

                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="flexible-schedule"
                            checked={prefValues.flexibleSchedule}
                            onChange={(e) => handlePreferenceChange('flexibleSchedule', e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600"
                          />
                          <label htmlFor="flexible-schedule" className="text-sm text-gray-700">
                            Flexible work schedule or breaks
                          </label>
                        </div>

                        <div className="mt-4">
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Additional details or other accommodations needed:
                          </label>
                          <textarea
                            value={prefValues.accomodationDetails || ''}
                            onChange={(e) => handlePreferenceChange('accomodationDetails', e.target.value)}
                            placeholder="Please describe any specific accommodations or additional support you may need to perform your job effectively..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            This information helps us prepare appropriate accommodations for your comfort and success.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.accomodation && (
                    <p className="mt-1 text-sm text-red-500">{errors.accomodation}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'work' && (
              <div className="space-y-6">
                <SwitchButton
                  label="Use work experience from my profile"
                  checked={useExistingExperience}
                  onChange={setUseExistingExperience}
                />

                {useExistingExperience ? (
                  <div className="space-y-4">
                    {data.workHistory?.length > 0 ? (
                      <>
                        <p className="text-sm text-gray-600 mb-4">Select the experiences you want to include:</p>
                        {data.workHistory.map((experience, index) => (
                          <div 
                            key={index} 
                            className={`p-4 bg-white rounded-lg border transition-colors duration-200 ${
                              selectedExperiences.has(index) 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{experience.previousJobTitle}</h4>
                                <p className="text-sm text-gray-600">{experience.companyName}</p>
                                <p className="text-sm text-gray-500">{experience.duration}</p>
                                <p className="mt-2 text-sm text-gray-600">{experience.keyResponsibility}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSelected = new Set(selectedExperiences);
                                  if (selectedExperiences.has(index)) {
                                    newSelected.delete(index);
                                  } else {
                                    newSelected.add(index);
                                  }
                                  setSelectedExperiences(newSelected);
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  selectedExperiences.has(index) ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                    selectedExperiences.has(index) ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No work experience found in your profile.</p>
                        <button
                          onClick={() => setUseExistingExperience(false)}
                          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Add new work experience
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Work History</h3>
                      {workEntries.length === 0 && (
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Experience
                        </button>
                      )}
                    </div>
                    
                    {workEntries.length > 0 && (
                      <>
                        {workEntries.map((entry, index) => (
                          <WorkHistoryEntry
                            key={index}
                            entry={entry}
                            index={index}
                            onChange={(field, value) => updateWorkEntry(index, field, value)}
                            onRemove={() => removeWorkEntry(index)}
                            isNew={index === workEntries.length - 1 && !entry.previousJobTitle}
                            showToast={showToast}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Experience
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pre-Interview Questions</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please answer all questions below. Your responses will help us evaluate your application.
                </p>
                
                <div className="space-y-6">
                  {jobData?.questionnaire && jobData.questionnaire.length > 0 ? (
                    jobData.questionnaire.map((question, index) => (
                      <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Question {index + 1}: {question}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                        </div>
                        
                        <textarea
                          value={answers[index] || ''}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setAnswers(prev => {
                              const updated = { ...prev, [index]: newValue };
                              console.log('Updated answers:', updated);
                              return updated;
                            });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="4"
                          placeholder="Type your answer here..."
                          required
                        />
                        
                        {!answers[index]?.trim() && (
                          <p className="mt-2 text-sm text-red-500">
                            This question requires an answer
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pre-interview questions for this position.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Required Documents Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                  
                  {/* Resume Upload */}
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Resume (PDF only)
                      <span className="text-red-500 ml-1">*</span>
                    </label>            
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileSelect('resume', e.target.files[0])}
                        className="hidden"
                        id="resumeUpload"
                        required
                      />
                      <label
                        htmlFor="resumeUpload"
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Resume
                      </label>
                      {documents.resume && (
                        <span className="text-sm text-gray-600">
                          {documents.resume.name}
                        </span>
                      )}
                    </div>
                    {!documents.resume && (
                      <p className="mt-1 text-sm text-red-500">
                        * Resume is required for this position
                      </p>
                    )}
                  </div>

                  {/* Cover Letter Upload - Only show if required */}
                  {jobData?.document === 'coverLetter' && (
                    <div className="mb-6">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Cover Letter (PDF only)
                        <span className="text-red-500 ml-1">*</span>
                      </label>            
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileSelect('coverLetter', e.target.files[0])}
                          className="hidden"
                          id="coverLetterUpload"
                          required
                        />
                        <label
                          htmlFor="coverLetterUpload"
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Cover Letter
                        </label>
                        {documents.coverLetter && (
                          <span className="text-sm text-gray-600">
                            {documents.coverLetter.name}
                          </span>
                        )}
                      </div>
                      {!documents.coverLetter && (
                        <p className="mt-1 text-sm text-red-500">
                          * Cover Letter is required for this position
                        </p>
                      )}
                    </div>
                  )}

                  {/* Document Guidelines */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Document Guidelines:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Files must be in PDF format</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Make sure your documents are clear and readable</li>
                      <li>• Include relevant contact information in your resume</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons - Moved inside the card */}
          <div className="mt-8 flex justify-between items-center border-t pt-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => handleTabChange('back')}
              disabled={isFirstTab}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 
                ${isFirstTab 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {/* Next/Submit Button */}
            {isLastTab ? (
              <button
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleTabChange('next')}
                disabled={activeTab === 'work' && !areAllWorkEntriesComplete(workEntries)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-200 ${
                  activeTab === 'work' && !areAllWorkEntriesComplete(workEntries)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

  
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleSubmit}
      />

      {/* Loading Overlay */}
      {submitting && <LoadingOverlay />}

      {/* Validation Error Message */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{validationError}</p>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
        />
      )}

      <SuccessModal />  {/* Add this line */}

      {/* Add this near your other modals */}
      <DuplicateApplicationModal 
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
      />
    </div>
  );
};

export default ApplicationForm;