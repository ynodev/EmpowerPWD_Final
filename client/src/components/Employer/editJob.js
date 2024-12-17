import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavEmployer from "../ui/navEmployer.js";
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { 
  getAllProvinces, 
  getCitiesForProvince, 
  CITIES_MUNICIPALITIES 
} from '../../data/philippineLocations.js';

const COMMON_SKILLS = [
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Time Management',
  'Leadership',
  'Microsoft Office',
  'Customer Service',
  'Project Management',
  'Data Analysis',
  'Critical Thinking',
  'Adaptability',
  'Organization',
  'Research',
  'Writing',
  'Presentation'
];

const COMMON_BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  'Life Insurance',
  'Paid Time Off',
  'Sick Leave',
  'Flexible Hours',
  'Remote Work',
  'Professional Development',
  '13th Month Pay',
  'Performance Bonus',
  'Transportation Allowance',
  'Meal Allowance',
  'HMO Coverage',
  'Gym Membership'
];

const ACCESSIBILITY_FEATURES = [
  'Wheelchair Access',
  'Screen Reader Support',
  'Sign Language Support',
  'Flexible Work Hours',
  'Remote Work Options',
  'Assistive Technology',
  'Accessible Workspace',
  'Modified Equipment',
  'Close to Public Transport',
  'Quiet Work Environment',
  'Ergonomic Furniture',
  'Braille Signage',
  'Audio Description',
  'Color Contrast Options',
  'Voice Recognition Software'
];

const SelectionChips = ({ options, selected, onChange, label }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (selected.includes(option)) {
                onChange(selected.filter(item => item !== option));
              } else {
                onChange([...selected, option]);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selected.includes(option)
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add custom item (press Enter)"
        className="mt-2 w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            if (!selected.includes(e.target.value.trim())) {
              onChange([...selected, e.target.value.trim()]);
            }
            e.target.value = '';
          }
        }}
      />
    </div>
  );
};

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  
  // Updated formData state with all fields
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    jobLocation: '',
    workSetup: '',
    industry: [],
    employmentType: '',
    applicationDeadline: '',
    keySkills: [],
    otherSkills: '',
    educationLevel: '',
    yearsOfExperience: '',
    salaryMin: '',
    salaryMax: '',
    salaryBasis: '',
    benefits: [],
    additionalPerks: '',
    accessibilityFeatures: [],
    specialAccommodations: '',
    jobStatus: '',
    questioner: [],
    document: '',
    disabilityTypes: [],
    vacancy: 1,
    isActive: false
  });

  const [provinces] = useState(getAllProvinces());
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');

  useEffect(() => {
    const initializeJobData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get data from sessionStorage
        const sessionData = sessionStorage.getItem('editJobData');
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          
          // Find the province for the existing city
          const province = Object.entries(CITIES_MUNICIPALITIES).find(([_, cities]) => 
            cities.includes(parsedData.jobLocation)
          )?.[0];
          
          if (province) {
            setSelectedProvince(province);
            setCities(getCitiesForProvince(province));
          }
          
          setFormData(prevData => ({
            ...prevData,
            ...parsedData
          }));
          
          sessionStorage.removeItem('editJobData');
          setLoading(false);
          return;
        }

        // If no session data, fetch from API
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const jobData = data.job || data.data || data;
        
        // Find the province for the existing city
        const province = Object.entries(CITIES_MUNICIPALITIES).find(([_, cities]) => 
          cities.includes(jobData.jobLocation)
        )?.[0];
        
        if (province) {
          setSelectedProvince(province);
          setCities(getCitiesForProvince(province));
        }

        setFormData(prevData => ({
          ...prevData,
          ...jobData
        }));

      } catch (err) {
        console.error('Error fetching job data:', err);
        setError(err.message || 'Failed to load job data');
      } finally {
        setLoading(false);
      }
    };

    initializeJobData();
  }, [jobId]);

  useEffect(() => {
    if (selectedProvince) {
      const provinceCities = getCitiesForProvince(selectedProvince);
      setCities(provinceCities);
    } else {
      setCities([]);
    }
  }, [selectedProvince]);

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.jobTitle?.trim()) {
      errors.jobTitle = 'Job title is required';
    }
    
    if (!formData.jobDescription?.trim()) {
      errors.jobDescription = 'Job description is required';
    }
    
    if (!formData.jobLocation?.trim()) {
      errors.jobLocation = 'Job location is required';
    }
    
    if (!formData.employmentType?.trim()) {
      errors.employmentType = 'Employment type is required';
    }
    
    if (!formData.applicationDeadline) {
      errors.applicationDeadline = 'Application deadline is required';
    }
    
    if (formData.salaryMin && formData.salaryMax && 
        Number(formData.salaryMin) > Number(formData.salaryMax)) {
      errors.salaryMin = 'Minimum salary cannot be greater than maximum salary';
    }
    
    if (!formData.vacancy || formData.vacancy < 1) {
      errors.vacancy = 'At least one vacancy is required';
    }

    return errors;
  };

  // Update handleSubmit to include validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setLoading(true);

      // Format the data
      const formattedData = {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        vacancy: Number(formData.vacancy),
        keySkills: formData.keySkills,
        benefits: formData.benefits,
        accessibilityFeatures: formData.accessibilityFeatures,
        industry: Array.isArray(formData.industry) ? formData.industry : [formData.industry]
      };

      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job');
      }

      const result = await response.json();
      
      // Show success message
      alert('Job updated successfully!');
      
      // Navigate back to job details
      navigate(`/employers/view-job/${jobId}`);

    } catch (error) {
      console.error('Error updating job:', error);
      setSubmitError(error.message || 'Failed to update job');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInput = (field, value) => {
    // Handle arrays (keySkills, benefits, accessibilityFeatures)
    const arrayValue = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setFormData(prev => ({
      ...prev,
      jobLocation: '' // Reset city when province changes
    }));
  };

  // Helper component for form field error
  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-red-500">
            <p>Error: {error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold">Edit Job Posting</h1>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.jobTitle ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.jobTitle ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.jobTitle}
                required
              />
              <FieldError error={validationErrors.jobTitle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <select
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${
                    validationErrors.jobLocation ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-1 ${
                    validationErrors.jobLocation ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  data-error={!!validationErrors.jobLocation}
                  required
                  disabled={!selectedProvince}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <FieldError error={validationErrors.jobLocation} />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.jobDescription ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-1 ${
                validationErrors.jobDescription ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              data-error={!!validationErrors.jobDescription}
              required
            />
            <FieldError error={validationErrors.jobDescription} />
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.employmentType ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.employmentType ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.employmentType}
                required
              >
                <option value="">Select Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
              <FieldError error={validationErrors.employmentType} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Work Setup</label>
              <select
                name="workSetup"
                value={formData.workSetup}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.workSetup ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.workSetup ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.workSetup}
                required
              >
                <option value="">Select Setup</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <FieldError error={validationErrors.workSetup} />
            </div>
          </div>

          {/* Salary Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Salary</label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.salaryMin ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.salaryMin ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.salaryMin}
                required
              />
              <FieldError error={validationErrors.salaryMin} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Salary</label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.salaryMax ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.salaryMax ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.salaryMax}
                required
              />
              <FieldError error={validationErrors.salaryMax} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Basis</label>
              <select
                name="salaryBasis"
                value={formData.salaryBasis}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.salaryBasis ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.salaryBasis ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.salaryBasis}
                required
              >
                <option value="">Select Basis</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <FieldError error={validationErrors.salaryBasis} />
            </div>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Education Level</label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.educationLevel ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.educationLevel ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.educationLevel}
                required
              >
                <option value="">Select Education Level</option>
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
              </select>
              <FieldError error={validationErrors.educationLevel} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <select
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${
                  validationErrors.yearsOfExperience ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 focus:outline-none focus:ring-1 ${
                  validationErrors.yearsOfExperience ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                data-error={!!validationErrors.yearsOfExperience}
                required
              >
                <option value="">Select Experience</option>
                <option value="no-exp">No Experience</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
              <FieldError error={validationErrors.yearsOfExperience} />
            </div>
          </div>

          {/* Key Skills */}
          <SelectionChips
            options={COMMON_SKILLS}
            selected={formData.keySkills}
            onChange={(newSkills) => setFormData(prev => ({ ...prev, keySkills: newSkills }))}
            label="Key Skills"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Other Skills</label>
            <input
              type="text"
              name="otherSkills"
              value={formData.otherSkills}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.otherSkills ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-1 ${
                validationErrors.otherSkills ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              data-error={!!validationErrors.otherSkills}
            />
            <FieldError error={validationErrors.otherSkills} />
          </div>

          {/* Benefits */}
          <SelectionChips
            options={COMMON_BENEFITS}
            selected={formData.benefits}
            onChange={(newBenefits) => setFormData(prev => ({ ...prev, benefits: newBenefits }))}
            label="Benefits"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Perks</label>
            <input
              type="text"
              name="additionalPerks"
              value={formData.additionalPerks}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.additionalPerks ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-1 ${
                validationErrors.additionalPerks ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              data-error={!!validationErrors.additionalPerks}
            />
            <FieldError error={validationErrors.additionalPerks} />
          </div>

          {/* Accessibility Features */}
          <SelectionChips
            options={ACCESSIBILITY_FEATURES}
            selected={formData.accessibilityFeatures}
            onChange={(newFeatures) => setFormData(prev => ({ 
              ...prev, 
              accessibilityFeatures: newFeatures 
            }))}
            label="Accessibility Features"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Special Accommodations</label>
            <textarea
              name="specialAccommodations"
              value={formData.specialAccommodations}
              onChange={handleInputChange}
              rows={3}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.specialAccommodations ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-1 ${
                validationErrors.specialAccommodations ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              data-error={!!validationErrors.specialAccommodations}
            />
            <FieldError error={validationErrors.specialAccommodations} />
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.applicationDeadline ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-1 ${
                validationErrors.applicationDeadline ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              data-error={!!validationErrors.applicationDeadline}
              required
            />
            <FieldError error={validationErrors.applicationDeadline} />
          </div>

          {/* Vacancy */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Vacancies</label>
            <input
              type="number"
              name="vacancy"
              value={formData.vacancy}
              onChange={handleInputChange}
              min="1"
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.vacancy ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-1 ${
                validationErrors.vacancy ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              data-error={!!validationErrors.vacancy}
              required
            />
            <FieldError error={validationErrors.vacancy} />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(validationErrors).length > 0}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;