import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import NavEmployer from '../ui/navEmployer.js';

const Header = () => {
  return (
    <div className="border-b border-gray-300 font-poppins ">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="flex items-center">
            <i className="fas fa-cube text-2xl"></i>
            <span className="ml-2 text-xl font-semibold ">photo</span>
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <span className="text-lg hidden sm:inline ">Notifications</span>
          
          <span className="text-lg hidden sm:inline ">Messages</span>

          <div className="flex items-center space-x-2">
            <span className="text-lg">Roberto</span>
            <div className="w-8 h-8 bg-gray-900 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const validateStep = (step, formData) => {
  const errors = {};

  switch (step) {
    case 1:
      if (!formData.jobTitle.trim()) {
        errors.jobTitle = 'Job title is required';
      }
      if (!formData.jobDescription.trim()) {
        errors.jobDescription = 'Job description is required';
      }
      if (!formData.jobLocation.trim()) {
        errors.jobLocation = 'Job location is required';
      }
      if (formData.industry.length === 0) {
        errors.industry = 'At least one industry must be selected';
      }
      if (!formData.applicationDeadline) {
        errors.applicationDeadline = 'Application deadline is required';
      } else {
        const deadline = new Date(formData.applicationDeadline);
        const today = new Date();
        if (deadline < today) {
          errors.applicationDeadline = 'Deadline cannot be in the past';
        }
      }
      break;

    case 2:
      if (!formData.vacancy || formData.vacancy < 1) {
        errors.vacancy = 'Number of vacancies must be at least 1';
      }
      if (!formData.educationLevel) {
        errors.educationLevel = 'Education level is required';
      }
      if (!formData.yearsOfExperience) {
        errors.yearsOfExperience = 'Years of experience is required';
      }
      if (formData.keySkills.length === 0) {
        errors.keySkills = 'At least one key skill is required';
      }
      break;

    case 3:
      if (!formData.salaryMin || !formData.salaryMax) {
        errors.salary = 'Both minimum and maximum salary are required';
      } else if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
        errors.salary = 'Minimum salary cannot be greater than maximum salary';
      }
      if (formData.benefits.length === 0) {
        errors.benefits = 'At least one benefit must be selected';
      }
      break;

    case 4:
      if (formData.disabilityTypes.length === 0) {
        errors.disabilityTypes = 'At least one disability type must be selected';
      }
      if (formData.accessibilityFeatures.length === 0) {
        errors.accessibilityFeatures = 'At least one accessibility feature must be selected';
      }
      break;

 

    default:
      break;
  }

  return errors;
};

const ValidationErrorMessage = () => {
  return (
    <div className="fixed top-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-lg max-w-md animate-slide-in">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            Please fix the validation errors before proceeding
          </p>
        </div>
      </div>
    </div>
  );
};

// Add this new SuccessModal component
const SuccessModal = ({ onClose, onNavigate }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl max-w-sm w-full">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-4">Job Posted Successfully!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Your job posting has been successfully created and is now live.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Post Another Job
          </button>
          <button
            onClick={onNavigate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CreateJobPosting = () => {
  const [step, setStep] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    jobLocation: '',
    workSetup: 'Remote',
    industry: [],
    employmentType: 'Full-time',
    applicationDeadline: '',
    keySkills: [],
    otherSkills: '',
    educationLevel: '',
    yearsOfExperience: '',
    salaryMin: '',
    salaryMax: '',
    salaryBasis: 'monthly',
    benefits: [],
    additionalPerks: '',
    accessibilityFeatures: [],
    specialAccommodations: '',
    document: '',
    questioner: [],
    disabilityTypes: [],
    vacancy: '1',
  });

    // Industry options
    const industryOptions = [
      'Technology',
      'Healthcare',
      'Education',
      'Finance',
      'Manufacturing',
      'Retail',
      'Others'
    ];

      // Predefined benefits options
const benefitOptions = [
  'Health Insurance',
  'Disability Insurance',
  'Pag-IBIG Fund Membership',
  'Free Annual Check-Ups',
  'Mental Health Support Services',,
  'Supportive Work Environment',
  'Flexible Leave Policies',
  'Transportation Assistance',
  'Performance-Based Incentives',
  'Accommodation Stipend or Benefits',
  'Emergency Medical Assistance',
  'Return-to-Work Support for Medical Leave',
  'Family Support Programs',
  'Relocation Assistance for Accessible Housing',
  'Disability Inclusion Initiatives',
  'Accommodations for Medical Needs',
  'Job Sharing Opportunities',
  '13th Month Pay',
  'Holiday Pay and Bonuses',
  'Overtime Pay',
  'Meal and Transportation Allowances',
  'Sick Leave and Vacation Leave',
  'Others'
];

  // Define available key skills options
  const keySkillsOptions = [
    'Communication', 'Teamwork', 'Problem Solving', 
    'Time Management', 'Adaptability', 'Creativity', 
    'Technical Skills', 'Leadership', 'Project Management', 
    'Attention to Detail', 'Customer Service', 'Analytical Thinking',
    'Organization', 'Decision Making', 'Interpersonal Skills'
  ];

  // Define available accessibility features options
const accessibilityFeaturesOptions = [
  'Wheelchair Accessible',
  'Vision Impaired Access',
  'Hearing Impaired Access',
  'Assistive Technology',
  'Accessible Parking',
  'Restroom Accessibility',
  'Braille Signage',
  'Audio Description',
  'Other'
];

  

  

  const [isOtherIndustry, setIsOtherIndustry] = useState(false);
  const [otherIndustry, setOtherIndustry] = useState('');

  const [isOtherBenefit, setIsOtherBenefit] = useState(false);
  const [otherBenefit, setOtherBenefit] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State to manage selected accessibility features and custom input
const [selectedAccessibilityFeatures, setSelectedAccessibilityFeatures] = useState([]);
const [isOtherFeature, setIsOtherFeature] = useState(false);
const [otherFeature, setOtherFeature] = useState('');

  // Add these state variables near the other useState declarations
  const [isOtherDisability, setIsOtherDisability] = useState(false);
  const [otherDisabilityType, setOtherDisabilityType] = useState('');

  // Add this constant for disability type options
  const disabilityTypeOptions = [
    'Physical Disability',
    'Visual Impairment',
    'Hearing Impairment',
    'Cognitive Disability',
    'Multiple Disabilities',
    'Other'
  ];

  // handle adding industry
const handleAddIndustry = (e) => {
  const selectedIndustry = e.target.value;

  if (selectedIndustry === 'Others') {
    setIsOtherIndustry(true); // Show input for custom industry
  } else if (selectedIndustry && !formData.industry.includes(selectedIndustry)) {
    setFormData((prevData) => ({
      ...prevData,
      industry: [...prevData.industry, selectedIndustry],
    }));
  }

  // Reset the select input after adding an industry
  e.target.value = '';
};

// handle adding custom industry
const handleAddOtherIndustry = () => {
  if (otherIndustry.trim() && !formData.industry.includes(otherIndustry.trim())) {
    setFormData((prevData) => ({
      ...prevData,
      industry: [...prevData.industry, otherIndustry.trim()],
    }));
    setOtherIndustry(''); // Clear the custom input field
    setIsOtherIndustry(false); // Hide the custom input
  }
};

  // Handle removing an industry
  const handleRemoveIndustry = (industryToRemove) => {
    // Update the formData by filtering out the industry to remove
    setFormData((prevData) => ({
      ...prevData,
      industry: prevData.industry.filter((industry) => industry !== industryToRemove),
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const userId = localStorage.getItem('userId');

    // Handle removing a skill
    const handleRemoveSkill = (skillToRemove) => {
      // Update the formData by filtering out the skill to remove
      const updatedSkills = formData.keySkills.filter((skill) => skill !== skillToRemove);
  
      // Update the state with the new array of key skills
      setFormData((prevData) => ({
        ...prevData,
        keySkills: updatedSkills,
      }));
    };

  // Handle adding selected benefit
  const handleAddBenefit = (benefit) => {
    if (benefit === 'Others') {
      setIsOtherBenefit(true);
    } else if (benefit && !formData.benefits.includes(benefit)) {
      setFormData((prevData) => ({
        ...prevData,
        benefits: [...prevData.benefits, benefit],
      }));
    }
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Handle adding custom benefit
  const handleAddOtherBenefit = () => {
    if (otherBenefit.trim() && !formData.benefits.includes(otherBenefit.trim())) {
      setFormData((prevData) => ({
        ...prevData,
        benefits: [...prevData.benefits, otherBenefit.trim()],
      }));
      setOtherBenefit(''); // Clear input
      setIsOtherBenefit(false); // Hide input
    }
  };

  // Handle removing benefit
  const handleRemoveBenefit = (benefitToRemove) => {
    // Update the formData by filtering out the benefit to remove
    const updatedBenefits = formData.benefits.filter(
      (benefit) => benefit !== benefitToRemove
    );
  
    // Update the state with the new array of benefits
    setFormData((prevData) => ({
      ...prevData,
      benefits: updatedBenefits,
    }));
  };
// Handle adding an accessibility feature from the dropdown
const handleAddAccessibilityFeature = (e) => {
  const selectedFeature = e.target.value;

  if (selectedFeature === 'Other') {
    setIsOtherFeature(true); // Show input for custom feature
  } else if (selectedFeature && !formData.accessibilityFeatures.includes(selectedFeature)) {
    setFormData((prevData) => ({
      ...prevData,
      accessibilityFeatures: [...prevData.accessibilityFeatures, selectedFeature],
    }));
  }

  // Reset the select input after adding a feature
  e.target.value = '';
};

// Handle adding custom accessibility feature
const handleAddOtherFeature = () => {
  if (otherFeature.trim() && !formData.accessibilityFeatures.includes(otherFeature.trim())) {
    setFormData((prevData) => ({
      ...prevData,
      accessibilityFeatures: [...prevData.accessibilityFeatures, otherFeature.trim()],
    }));
    setOtherFeature(''); // Clear the custom input field
    setIsOtherFeature(false); // Hide the custom input
  }
};

// Handle removing an accessibility feature
const handleRemoveFeature = (featureToRemove) => {
  setFormData((prevData) => ({
    ...prevData,
    accessibilityFeatures: prevData.accessibilityFeatures.filter((feature) => feature !== featureToRemove),
  }));
};



  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value.split(',').map(item => item.trim()),
    }));
  };
  const handleSubmit = async () => {
    let allErrors = {};
    for (let i = 1; i <= 5; i++) {
      const stepErrors = validateStep(i, formData);
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setShowValidationMessage(true);
      setTimeout(() => setShowValidationMessage(false), 3000);
      return;
    }

    setShowConfirmDialog(false);

    const jobData = {
      ...formData,
      workSetup: formData.workSetup,
      salaryBasis: formData.salaryBasis
    };

    try {
      const response = await fetch('/api/employer/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(jobData)
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowSuccessModal(true); // Show success modal instead of alert
      } else {
        console.error('Error:', result);
        alert('Failed to create job posting: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the job posting');
    }
  };

  const nextStep = () => {
    const validationErrors = validateStep(step, formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowValidationMessage(true);
      setTimeout(() => setShowValidationMessage(false), 3000);
      return;
    }
    
    setErrors({});
    if (step < 6) {
      setStep(step + 1);
    }
  };
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto p-6">
            {/* Header Image/Banner */}
            <div className="w-full mb-8">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6">
                <h2 className="text-white text-3xl font-bold text-center">Job Details</h2>
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-8">
              Provide the basic information about the job position you're offering.
            </p>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Job Title/Position</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Enter your Job Title"
                  className={`w-full p-3 border ${
                    errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500`}
                  required
                />
                <ErrorMessage error={errors.jobTitle} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Job Description</label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  placeholder="Enter your job description here"
                  className={`w-full p-3 border ${
                    errors.jobDescription ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500`}
                  rows="4"
                  required
                />
                <ErrorMessage error={errors.jobDescription} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Location</label>
                <input
                  type="text"
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  placeholder="Enter where the job located"
                  className={`w-full p-3 border ${
                    errors.jobLocation ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500`}
                />
                <ErrorMessage error={errors.jobLocation} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Industry</label>
                <select
                  onChange={handleAddIndustry}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Select an Industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {isOtherIndustry && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otherIndustry}
                        onChange={(e) => setOtherIndustry(e.target.value)}
                        placeholder="Enter your industry"
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddOtherIndustry}
                        className="px-4 py-2 text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-2 mt-4 mb-2">
                  {/* Selected Industries Display */}
                  {Array.isArray(formData.industry) && formData.industry.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Selected Industries:</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.industry.map((industry) => (
                          <span
                            key={industry}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm flex items-center"
                          >
                            {industry}
                            <button
                              onClick={() => handleRemoveIndustry(industry)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="" disabled>Select an employment type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Work Setup</label>
                <select
                  name="workSetup"
                  value={formData.workSetup}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Application Deadline</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.applicationDeadline ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500`}
                  required
                />
                <ErrorMessage error={errors.applicationDeadline} />
              </div>
            </div>

            {/* Next button is handled by the parent component */}
          </div>
        );
      case 2:
        return (
          <div className="max-w-2xl mx-auto p-6">
            {/* Header Banner */}
            <div className="w-full mb-8">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6">
                <h2 className="text-white text-3xl font-bold text-center">Qualifications</h2>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-8">
              Provide the basic information about the job position you're offering.
            </p>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Add Vacancy field at the top */}
              <div>
                <label className="block mb-2 text-sm font-medium">Number of Vacancies</label>
                <input
                  type="number"
                  name="vacancy"
                  value={formData.vacancy}
                  onChange={handleChange}
                  min="1"
                  placeholder="Enter number of vacancies"
                  className={`w-full p-3 border ${
                    errors.vacancy ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500`}
                  required
                />
                <ErrorMessage error={errors.vacancy} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Required Education Level</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.educationLevel ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white`}
                  required
                >
                  <option value="" disabled>Select a educational level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Certification">Certification</option>
                  <option value="NA">No Education Required</option>

                </select>
                <ErrorMessage error={errors.educationLevel} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Years of Experience</label>
                <select
                  type="text"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="Enter years of experience"
                  className={`w-full p-3 border ${
                    errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500`}
                  required
                >
                    <option value="" disabled>Select years of experience</option>
                    <option value="no-exp">No experience required</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10-plus">10+ years</option>
                    </select>

                <ErrorMessage error={errors.yearsOfExperience} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Key Skills or Competencies</label>
                <div className="flex flex-wrap gap-2">
                  {keySkillsOptions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        const newSkills = formData.keySkills.includes(skill)
                          ? formData.keySkills.filter(s => s !== skill)
                          : [...formData.keySkills, skill];
                        setFormData({ ...formData, keySkills: newSkills });
                      }}
                      className={`
                        flex items-center px-4 py-2 rounded-xl border transition-colors duration-200
                        ${formData.keySkills.includes(skill) 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-700 border-gray-300'}
                      `}
                    >
                      {skill}
                      <span className="ml-2">
                        {formData.keySkills.includes(skill) ? '−' : '+'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Skills Display */}
              {formData.keySkills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Selected Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.keySkills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium">Other Skills (Optional)</label>
                <input
                  type="text"
                  name="otherSkills"
                  value={formData.otherSkills}
                  onChange={handleChange}
                  placeholder="Enter additional skills"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Navigation buttons are handled by parent component */}
          </div>
        );
      case 3:
        return (
          <div className="max-w-2xl mx-auto p-6">
            {/* Header Banner */}
            <div className="w-full mb-8">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6">
                <h2 className="text-white text-3xl font-bold text-center">Salary & Benefits</h2>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-8">
              Share the salary range and the benefits your company offers for this role.
            </p>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Salary Basis */}
              <div>
                <label className="block mb-2 text-sm font-medium">Salary Basis</label>
                <select
                  name="salaryBasis"
                  value={formData.salaryBasis}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                 
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Min</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="Enter min"
                    className={`w-full p-3 border ${
                      errors.salary ? 'border-red-500' : 'border-gray-300'
                    } rounded-xl focus:outline-none focus:border-blue-500`}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Max</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="Enter max"
                    className={`w-full p-3 border ${
                      errors.salary ? 'border-red-500' : 'border-gray-300'
                    } rounded-xl focus:outline-none focus:border-blue-500`}
                    required
                  />
                </div>
                <ErrorMessage error={errors.salary} />
              </div>

              {/* Benefits */}
              <div>
                <label className="block mb-2 text-sm font-medium">Benefits</label>
                <div className="flex flex-wrap gap-2">
                  {benefitOptions.map((benefit) => (
                    <button
                      key={benefit}
                      onClick={() => handleAddBenefit(benefit)}
                      className={`flex items-center px-4 py-2 rounded-xl border transition-colors duration-200
                        ${formData.benefits.includes(benefit) 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-700 border-gray-300'}
                        ${errors.benefits ? 'border-red-500' : ''}`}
                    >
                      {benefit}
                      <span className="ml-2">
                        {formData.benefits.includes(benefit) ? '−' : '+'}
                      </span>
                    </button>
                  ))}
                </div>
                <ErrorMessage error={errors.benefits} />
              </div>

              {/* Other Benefit Input */}
              {isOtherBenefit && (
                <div className="space-y-2 mt-4">
                  <input
                    type="text"
                    value={otherBenefit}
                    onChange={(e) => setOtherBenefit(e.target.value)}
                    placeholder="Enter custom benefit"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddOtherBenefit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Add Benefit
                  </button>
                </div>
              )}

              {/* Selected Benefits Display */}
              {formData.benefits.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Selected Benefits:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm flex items-center"
                      >
                        {benefit}
                        <button
                          onClick={() => handleRemoveBenefit(benefit)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Perks */}
              <div>
                <label className="block mb-2 text-sm font-medium">Additional Perks</label>
                <input
                  type="text"
                  name="additionalPerks"
                  value={formData.additionalPerks}
                  onChange={handleChange}
                  placeholder="Enter additional perks"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-2xl mx-auto p-6">
            {/* Header Banner */}
            <div className="w-full mb-8">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6">
                <h2 className="text-white text-3xl font-bold text-center">Special Accommodation</h2>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-8">
              Share the salary range and the benefits your company offers for this role.
            </p>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Disability Types */}
              <div>
                <label className="block mb-2 text-sm font-medium">Disability Types</label>
                <select
                  onChange={(e) => {
                    const selectedType = e.target.value;
                    if (selectedType === 'Other') {
                      setIsOtherDisability(true);
                    } else if (selectedType && !formData.disabilityTypes.includes(selectedType)) {
                      setFormData((prevData) => ({
                        ...prevData,
                        disabilityTypes: [...prevData.disabilityTypes, selectedType],
                      }));
                    }
                    // Reset the select input
                    e.target.value = '';
                  }}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">Select disability type</option>
                  {disabilityTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Other Disability Type Input */}
                {isOtherDisability && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otherDisabilityType}
                        onChange={(e) => setOtherDisabilityType(e.target.value)}
                        placeholder="Enter disability type"
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (otherDisabilityType.trim() && !formData.disabilityTypes.includes(otherDisabilityType.trim())) {
                            setFormData((prevData) => ({
                              ...prevData,
                              disabilityTypes: [...prevData.disabilityTypes, otherDisabilityType.trim()],
                            }));
                            setOtherDisabilityType('');
                            setIsOtherDisability(false);
                          }
                        }}
                        className="px-4 py-2 text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Disability Types Display */}
                {formData.disabilityTypes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Selected Disability Types:</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.disabilityTypes.map((type) => (
                        <span
                          key={type}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm flex items-center"
                        >
                          {type}
                          <button
                            onClick={() => {
                              const newTypes = formData.disabilityTypes.filter(t => t !== type);
                              setFormData({ ...formData, disabilityTypes: newTypes });
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accommodations */}
              <div>
                <label className="block mb-2 text-sm font-medium">Accommodations</label>
                <div className="flex flex-wrap gap-2">
                  {accessibilityFeaturesOptions.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => {
                        if (feature === 'Other') {
                          setIsOtherFeature(true);
                        } else {
                          const newFeatures = formData.accessibilityFeatures.includes(feature)
                            ? formData.accessibilityFeatures.filter(f => f !== feature)
                            : [...formData.accessibilityFeatures, feature];
                          setFormData({ ...formData, accessibilityFeatures: newFeatures });
                        }
                      }}
                      className={`
                        flex items-center px-4 py-2 rounded-xl border transition-colors duration-200
                        ${formData.accessibilityFeatures.includes(feature) 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-700 border-gray-300'}
                      `}
                    >
                      {feature}
                      <span className="ml-2">
                        {formData.accessibilityFeatures.includes(feature) ? '−' : '+'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Other Feature Input */}
                {isOtherFeature && (
                  <div className="space-y-2 mt-4">
                    <input
                      type="text"
                      value={otherFeature}
                      onChange={(e) => setOtherFeature(e.target.value)}
                      placeholder="Enter accommodation"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddOtherFeature}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Add Accommodation
                    </button>
                  </div>
                )}

                {/* Selected Accommodations Display */}
                {formData.accessibilityFeatures.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Selected Accommodations:</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.accessibilityFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm flex items-center"
                        >
                          {feature}
                          <button
                            onClick={() => handleRemoveFeature(feature)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Special Accommodations */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Any special accommodations or support (optional)
                </label>
                <textarea
                  name="specialAccommodations"
                  value={formData.specialAccommodations}
                  onChange={handleChange}
                  placeholder="Enter any special accommodations or support"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  rows="6"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="max-w-2xl mx-auto p-6">
            {/* Header Banner */}
            <div className="w-full mb-8">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6">
                <h2 className="text-white text-3xl font-bold text-center">Application pre-interview</h2>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-8">
              List the of any optional pre-interview questions for applicants.
            </p>

            {/* Form Fields */}
            <div className="space-y-6">
            

              {/* Pre-Interview Questions */}
              <div>
                <label className="block mb-2 text-sm font-medium">Pre-Interview Questions (Optional)</label>
                <div className="space-y-4">
                  {formData.questioner.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...formData.questioner];
                          newQuestions[index] = e.target.value;
                          setFormData({ ...formData, questioner: newQuestions });
                        }}
                        placeholder="Enter pre-interview question"
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = formData.questioner.filter((_, i) => i !== index);
                          setFormData({ ...formData, questioner: newQuestions });
                        }}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <span className="text-xl">×</span>
                      </button>
                    </div>
                  ))}
                  
                  {/* Add More Questions Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        questioner: [...formData.questioner, ""]
                      });
                    }}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <span className="mr-2">+</span> Add More
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-8">Review Job</h2>

            {/* Job Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Job Details</h3>
                <button onClick={() => setStep(1)} className="text-blue-500 hover:text-blue-700">Edit</button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p className="font-medium">{formData.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{formData.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Description</p>
                  <p className="text-sm">{formData.jobDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium">{formData.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Work Setup</p>
                    <p className="font-medium">{formData.workSetup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <p className="font-medium">{formData.applicationDeadline}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Qualifications</h3>
                <button onClick={() => setStep(2)} className="text-blue-500 hover:text-blue-700">Edit</button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Number of Vacancies</p>
                  <p className="font-medium">{formData.vacancy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Required Education Level</p>
                  <p className="font-medium">{formData.educationLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Years of Experience</p>
                  <p className="font-medium">{formData.yearsOfExperience}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Key Skills and Competencies</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.keySkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-xl text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Salary and Benefits Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Salary and Benefits</h3>
                <button onClick={() => setStep(3)} className="text-blue-500 hover:text-blue-700">Edit</button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Salary Range</p>
                  <p className="font-medium">
                    {formData.salaryBasis}: {formData.salaryMin} - {formData.salaryMax} Pesos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-xl text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
                {formData.additionalPerks && (
                  <div>
                    <p className="text-sm text-gray-500">Additional Perks</p>
                    <p className="text-sm">{formData.additionalPerks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Accommodations Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Special Accommodations</h3>
                <button onClick={() => setStep(4)} className="text-blue-500 hover:text-blue-700">Edit</button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Accommodations</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.accessibilityFeatures.map((feature, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-xl text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                {formData.specialAccommodations && (
                  <div>
                    <p className="text-sm text-gray-500">Additional Support</p>
                    <p className="text-sm">{formData.specialAccommodations}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Requirements Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Application Requirements</h3>
                <button onClick={() => setStep(5)} className="text-blue-500 hover:text-blue-700">Edit</button>
              </div>
              <div className="space-y-4">
             
                {formData.questioner.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Pre-Interview Questions</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {formData.questioner.map((question, index) => (
                        <li key={index} className="text-sm">{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center font-poppins">
      <div className="bg-white p-6 rounded-xl max-w-sm w-full ">
        <h2 className=" text-[20px] font-bold mb-4 text-center">Confirm Submission</h2>
        <p className="mb-6 text-justify text-[14px] ">Are you sure you want to submit this job posting? Please review all the information carefully before confirming.</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-4 py-2 border border-black rounded-xl shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            Confirm Submit
          </button>
        </div>
      </div>
    </div>
  );

  const ErrorMessage = ({ error }) => {
    return error ? (
      <div className="flex items-center mt-1">
        <svg className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    ) : null;
  };

  // Add these handler functions
  const handlePostAnother = () => {
    setShowSuccessModal(false);
    setStep(1);
    // Reset form data if needed
    setFormData({
      // ... initial form state ...
    });
  };

  const handleViewDashboard = () => {
    navigate('/job-dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <NavEmployer />
      <div className="flex-1 p-8 bg-white pt-8 p-4 sm:ml-44">
        {/* Add header with back button */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 6 ? 'Review Job Posting' : 'Create Job Posting'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of 6
              </p>
            </div>
          </div>
        </div>

        {showValidationMessage && <ValidationErrorMessage />}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {renderStep()}
          <div className="flex justify-end mt-8 mx-auto max-w-2xl">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-24 px-4 py-2 text-sm font-medium text-gray-700 bg-white border  border-black rounded-full hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-black mr-4"
              >
                Back
              </button>
            )}
            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-24 px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-full hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                className="px-8 py-2 text-sm text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none"
              >
                Submit
              </button>
            )}
          </div>
        </form>
        {showConfirmDialog && <ConfirmDialog />}
        {showSuccessModal && (
          <SuccessModal 
            onClose={handlePostAnother}
            onNavigate={handleViewDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default CreateJobPosting;


