import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import NavSeeker from '../ui/navSeeker';
import { Link, useLocation } from 'react-router-dom';
import ProfileNav from './profileNav';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Info,
  Briefcase,
  GraduationCap,
  Wrench,
  Target,
  Edit,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Calendar,
  Bookmark,
  FileText
} from 'lucide-react';

// Import the location data and helper functions
import {
  PHILIPPINES_REGIONS,
  getProvincesForRegion,
  getCitiesForProvince,
  getBarangaysForCity,
  validatePostalCode
} from '../../data/philippineLocations';

// Add these validation functions at the top of the file
const validateWorkExperience = (data) => {
  const errors = {};

  if (!data.jobTitle?.trim()) {
    errors.jobTitle = 'Job title is required';
  }

  if (!data.company?.trim()) {
    errors.company = 'Company name is required';
  }

  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!data.isCurrentlyWorking && !data.endDate) {
    errors.endDate = 'End date is required when not currently working';
  }

  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    errors.endDate = 'End date cannot be earlier than start date';
  }

  if (!data.responsibilities?.length || data.responsibilities.some(resp => !resp.trim())) {
    errors.responsibilities = 'At least one responsibility is required';
  }

  if (!data.skills?.length || data.skills.some(skill => !skill.trim())) {
    errors.skills = 'At least one skill is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateEducation = (data) => {
  const errors = {};

  if (!data.educationalLevel) {
    errors.educationalLevel = 'Educational level is required';
  }

  if (!data.schoolName?.trim()) {
    errors.schoolName = 'School name is required';
  }

  if (!data.batchYear?.start) {
    errors.startDate = 'Start date is required';
  }

  if (!data.batchYear.isCurrentlyEnrolled && !data.batchYear.end) {
    errors.endDate = 'End date is required when not currently enrolled';
  }

  if (data.batchYear?.start && data.batchYear?.end && 
      new Date(data.batchYear.start) > new Date(data.batchYear.end)) {
    errors.endDate = 'End date cannot be earlier than start date';
  }

  // Validate level-specific fields
  switch (data.educationalLevel) {
    case 'High School':
      if (!data.highSchool?.track) {
        errors.track = 'Track is required for high school';
      }
      break;

    case 'Associate':
    case 'Bachelor':
    case 'Master':
    case 'Doctorate':
      if (!data.college?.courseOrProgram?.trim()) {
        errors.courseOrProgram = 'Course/Program is required';
      }
      if (!data.college?.fieldOfStudy?.trim()) {
        errors.fieldOfStudy = 'Field of study is required';
      }
      break;

    case 'Certificate':
      if (!data.certificate?.title?.trim()) {
        errors.title = 'Certificate title is required';
      }
      if (!data.certificate?.issuingOrganization?.trim()) {
        errors.issuingOrganization = 'Issuing organization is required';
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const truncateText = (text, limit) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
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

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [editingExp, setEditingExp] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [isAddingWorkExp, setIsAddingWorkExp] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/seekers/profile`, {
        withCredentials: true
      });
      setProfileData(response.data.profile);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (section, data) => {
    try {
      const response = await axios.put(
`${process.env.REACT_APP_API_URL}/api/seekers/profile/${section}`,
        data,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          [section]: response.data[section]
        }));
        setEditSection(null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  // Add this helper component for editable fields
  const EditableField = ({ label, value, isEditing, onEdit, type = "text", options = [], disabled = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {isEditing ? (
        type === "select" ? (
          <select
            value={value || ""}
            onChange={(e) => onEdit(e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value || ""}
            onChange={(e) => onEdit(e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
          />
        ) : (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onEdit(e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
          />
        )
      ) : (
        <p className="text-gray-700 py-2">{value || "Not specified"}</p>
      )}
    </div>
  );

  const PersonalInfoSection = () => {
    return (
      <div className="relative font-poppins">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-3">
            {/* Display only fields, no editing */}
            <div className="mb-2">
              <span className="text-gray-600">First Name: </span>
              <span>{profileData.basicInfo?.firstName || 'Not specified'}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Last Name: </span>
              <span>{profileData.basicInfo?.lastName || 'Not specified'}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Date of Birth: </span>
              <span>{profileData.basicInfo?.dateOfBirth?.split('T')[0] || 'Not specified'}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Gender: </span>
              <span>{profileData.basicInfo?.gender || 'Not specified'}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Age: </span>
              <span>{profileData.basicInfo?.age || 'Not specified'}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Phone Number: </span>
              <span>{profileData.basicInfo?.phoneNumber || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LocationSection = ({ profileData, onUpdate, initialData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      region: initialData?.region || '',
      province: initialData?.province || '',
      city: initialData?.city || '',
      barangay: initialData?.barangay || '',
      postal: initialData?.postal || '',
      address: initialData?.address || ''
    });

    // Get all regions from each division (Luzon, Visayas, Mindanao)
    const regions = Object.values(PHILIPPINES_REGIONS).flatMap(divisionRegions => 
      divisionRegions.map(region => region.name)
    );
    
    // Get provinces based on selected region
    const provinces = useMemo(() => {
      for (const division of Object.values(PHILIPPINES_REGIONS)) {
        const foundRegion = division.find(r => r.name === formData.region);
        if (foundRegion) {
          return foundRegion.provinces;
        }
      }
      return [];
    }, [formData.region]);
    
    // Get cities based on selected province
    const cities = useMemo(() => {
      return formData.province ? getCitiesForProvince(formData.province) : [];
    }, [formData.province]);
    
    // Get barangays based on selected city
    const barangays = useMemo(() => {
      return formData.city ? getBarangaysForCity(formData.city) : [];
    }, [formData.city]);

    useEffect(() => {
      setFormData({
        region: profileData.locationInfo?.region || '',
        province: profileData.locationInfo?.province || '',
        city: profileData.locationInfo?.city || '',
        barangay: profileData.locationInfo?.barangay || '',
        postal: profileData.locationInfo?.postal || '',
        address: profileData.locationInfo?.address || ''
      });
    }, [profileData]);

    const handleSave = async () => {
      try {
        await onUpdate('location', formData);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating location:', error);
      }
    };

    return (
      <div className="relative">
        {!isEditing ? (
          <>
            <div className="space-y-2">
              <InfoField label="Region" value={formData.region} />
              <InfoField label="Province" value={formData.province} />
              <InfoField label="City" value={formData.city} />
              <InfoField label="Barangay" value={formData.barangay} />
              <InfoField label="Postal Code" value={formData.postal} />
              <InfoField label="Address" value={formData.address} />
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-0 right-0 text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={formData.region}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    region: e.target.value,
                    province: '',
                    city: '',
                    barangay: ''
                  });
                }}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <select
                value={formData.province}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    province: e.target.value,
                    city: '',
                    barangay: ''
                  });
                }}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
                disabled={!formData.region}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    city: e.target.value,
                    barangay: ''
                  });
                }}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
                disabled={!formData.province}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
              <select
                value={formData.barangay}
                onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
                disabled={!formData.city}
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>{barangay}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postal}
                onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50"
                maxLength={4}
                pattern="\d{4}"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                placeholder="Enter your complete address..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, title, onAdd, section }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      )}
    </div>
  );

  const AddWorkExperienceForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrentlyWorking: false,
      responsibilities: [''],
      skills: ['']
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4 font-poppins">
        <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
          placeholder="Job Title"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          placeholder="Company"
          className="w-full border p-2 rounded"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className="border p-2 rounded"
          />
          {!formData.isCurrentlyWorking && (
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="border p-2 rounded"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isCurrentlyWorking}
            onChange={(e) => setFormData({...formData, isCurrentlyWorking: e.target.checked})}
            className="border rounded"
          />
          <label>Currently working here</label>
        </div>
        
        {/* Responsibilities */}
        <div className="space-y-2">
          <label className="block font-medium">Responsibilities</label>
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={resp}
                onChange={(e) => {
                  const newResp = [...formData.responsibilities];
                  newResp[index] = e.target.value;
                  setFormData({...formData, responsibilities: newResp});
                }}
                placeholder="Add responsibility"
                className="flex-1 border p-2 rounded"
              />
              {formData.responsibilities.length > 1 && (
                <RemoveButton 
                  onClick={() => {
                    const newResp = formData.responsibilities.filter((_, i) => i !== index);
                    setFormData({...formData, responsibilities: newResp});
                  }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              responsibilities: [...formData.responsibilities, '']
            })}
            className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            <Plus className="w-4 h-4" />
            Add Responsibility
          </button>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="block font-medium">Skills Used</label>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 rounded-full pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[index] = e.target.value;
                    setFormData({...formData, skills: newSkills});
                  }}
                  placeholder="Add skill"
                  className="bg-transparent border-none focus:outline-none text-blue-600 w-24 min-w-0"
                />
                {formData.skills.length > 1 && (
                  <RemoveButton 
                    onClick={() => {
                      const newSkills = formData.skills.filter((_, i) => i !== index);
                      setFormData({...formData, skills: newSkills});
                    }}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                skills: [...formData.skills, '']
              })}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-poppins"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Experience
          </button>
        </div>
      </form>
    );
  };

  // Update the handleAddWorkExperience function
  const handleAddWorkExperience = async (data) => {
    const validation = validateWorkExperience(data);
    
    if (!validation.isValid) {
      // Display validation errors
      const errorMessage = Object.values(validation.errors).join('\n');
      alert('Please fix the following errors:\n' + errorMessage);
      return;
    }

    try {
      const response = await axios.post(
`${process.env.REACT_APP_API_URL}/api/seekers/profile/work-experience`,
        data,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          workExperience: [...(prev.workExperience || []), response.data.workExperience]
        }));
        setIsAddingWorkExp(false);
      }
    } catch (err) {
      console.error('Error adding work experience:', err);
      alert(err.response?.data?.message || 'Error adding work experience');
    }
  };

  const handleAddEducation = async (data) => {
    const validation = validateEducation(data);
    
    if (!validation.isValid) {
      // Display validation errors
      const errorMessage = Object.values(validation.errors).join('\n');
      alert('Please fix the following errors:\n' + errorMessage);
      return;
    }

    try {
      const formattedData = {
        ...data,
        batchYear: {
          start: new Date(data.batchYear.start).toISOString(),
          end: new Date(data.batchYear.isCurrentlyEnrolled ? data.batchYear.start : data.batchYear.end).toISOString(),
          isCurrentlyEnrolled: data.batchYear.isCurrentlyEnrolled
        }
      };

      const response = await axios.post(
`${process.env.REACT_APP_API_URL}/api/seekers/profile/education`,
        formattedData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          education: [...(prev.education || []), response.data.education]
        }));
        setIsAddingEducation(false);
      }
    } catch (err) {
      console.error('Error adding education:', err);
      alert(err.response?.data?.message || 'Error adding education');
    }
  };

  const handleEditWorkExperience = async (id, data) => {
    const validation = validateWorkExperience(data);
    
    if (!validation.isValid) {
      // Display validation errors
      const errorMessage = Object.values(validation.errors).join('\n');
      alert('Please fix the following errors:\n' + errorMessage);
      return;
    }

    try {
      const response = await axios.put(
`${process.env.REACT_APP_API_URL}/api/seekers/profile/work-experience/${id}`,
        data,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          workExperience: prev.workExperience.map(exp => 
            exp._id === id ? response.data.workExperience : exp
          )
        }));
        setEditingExp(null);
      }
    } catch (err) {
      console.error('Error updating work experience:', err);
      alert(err.response?.data?.message || 'Error updating work experience');
    }
  };

  const handleEditEducation = async (id, data) => {
    const validation = validateEducation(data);
    
    if (!validation.isValid) {
      // Display validation errors
      const errorMessage = Object.values(validation.errors).join('\n');
      alert('Please fix the following errors:\n' + errorMessage);
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/seekers/profile/education/${id}`,
        data,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          education: prev.education.map(edu => 
            edu._id === id ? response.data.education : edu
          )
        }));
        setEditingEdu(null);
      }
    } catch (err) {
      console.error('Error updating education:', err);
      alert(err.response?.data?.message || 'Error updating education');
    }
  };

  const handleDeleteWorkExperience = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/seekers/profile/work-experience/${id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          workExperience: prev.workExperience.filter(exp => exp._id !== id)
        }));
      }
    } catch (err) {
      console.error('Error deleting work experience:', err);
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/seekers/profile/education/${id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          education: prev.education.filter(edu => edu._id !== id)
        }));
      }
    } catch (err) {
      console.error('Error deleting education:', err);
    }
  };

  const EditWorkExperienceForm = ({ experience, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      jobTitle: experience.jobTitle || '',
      company: experience.company || '',
      startDate: experience.startDate?.split('T')[0] || '',
      endDate: experience.endDate?.split('T')[0] || '',
      isCurrentlyWorking: experience.isCurrentlyWorking || false,
      responsibilities: experience.responsibilities || [''],
      skills: experience.skills || ['']
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(experience._id, formData);
        onClose();
      }} className="space-y-4">
        <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
          placeholder="Job Title"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          placeholder="Company"
          className="w-full border p-2 rounded"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className="border p-2 rounded"
          />
          {!formData.isCurrentlyWorking && (
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="border p-2 rounded"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isCurrentlyWorking}
            onChange={(e) => setFormData({...formData, isCurrentlyWorking: e.target.checked})}
            className="border rounded"
          />
          <label>Currently working here</label>
        </div>
        
        {/* Responsibilities */}
        <div className="space-y-2">
          <label className="block font-medium font-pop">Responsibilities</label>
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={resp}
                onChange={(e) => {
                  const newResp = [...formData.responsibilities];
                  newResp[index] = e.target.value;
                  setFormData({...formData, responsibilities: newResp});
                }}
                placeholder="Add responsibility"
                className="flex-1 border p-2 rounded"
              />
              {formData.responsibilities.length > 1 && (
                <RemoveButton 
                  onClick={() => {
                    const newResp = formData.responsibilities.filter((_, i) => i !== index);
                    setFormData({...formData, responsibilities: newResp});
                  }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              responsibilities: [...formData.responsibilities, '']
            })}
            className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            <Plus className="w-4 h-4" />
            Add Responsibility
          </button>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="block font-medium">Skills Used</label>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 rounded-full pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[index] = e.target.value;
                    setFormData({...formData, skills: newSkills});
                  }}
                  placeholder="Add skill"
                  className="bg-transparent border-none focus:outline-none text-blue-600 w-24 min-w-0"
                />
                {formData.skills.length > 1 && (
                  <RemoveButton 
                    onClick={() => {
                      const newSkills = formData.skills.filter((_, i) => i !== index);
                      setFormData({...formData, skills: newSkills});
                    }}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                skills: [...formData.skills, '']
              })}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  };

  const EditEducationForm = ({ education, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      educationalLevel: education.educationalLevel,
      schoolName: education.schoolName,
      batchYear: {
        start: education.batchYear?.start?.split('T')[0] || '',
        end: education.batchYear?.end?.split('T')[0] || '',
        isCurrentlyEnrolled: education.batchYear?.isCurrentlyEnrolled || false
      },
      location: education.location || {
        city: '',
        country: '',
        address: ''
      },
      // High School fields
      highSchool: education.highSchool || {
        track: '',
        strand: '',
        grade: ''
      },
      // College fields
      college: education.college || {
        courseOrProgram: '',
        fieldOfStudy: '',
        gpa: ''
      },
      // Certificate fields
      certificate: education.certificate || {
        title: '',
        issuingOrganization: '',
        credentialID: '',
        credentialURL: '',
        issueDate: '',
        expiryDate: ''
      }
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Format dates properly
      const submissionData = {
        ...formData,
        batchYear: {
          ...formData.batchYear,
          start: new Date(formData.batchYear.start).toISOString(),
          end: formData.batchYear.isCurrentlyEnrolled 
            ? new Date(formData.batchYear.start).toISOString()
            : new Date(formData.batchYear.end).toISOString()
        }
      };

      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/seekers/profile/education/${education._id}`,
          submissionData,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Update the profile data through the parent component
          onSubmit(education._id, submissionData);
          onClose();
        }
      } catch (err) {
        console.error('Error updating education:', err);
        alert(err.response?.data?.message || 'Error updating education');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Educational Level - Read only in edit mode */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Educational Level
            </label>
            <input
              type="text"
              value={formData.educationalLevel}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-50"
            />
          </div>

          {/* School Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.batchYear.start}
              onChange={(e) => setFormData({
                ...formData,
                batchYear: { ...formData.batchYear, start: e.target.value }
              })}
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={formData.batchYear.end}
              onChange={(e) => setFormData({
                ...formData,
                batchYear: { ...formData.batchYear, end: e.target.value }
              })}
              className="w-full border p-2 rounded-lg"
              disabled={formData.batchYear.isCurrentlyEnrolled}
              required={!formData.batchYear.isCurrentlyEnrolled}
            />
          </div>

          {/* Currently Enrolled Checkbox */}
          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.batchYear.isCurrentlyEnrolled}
                onChange={(e) => setFormData({
                  ...formData,
                  batchYear: { ...formData.batchYear, isCurrentlyEnrolled: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Currently Enrolled</span>
            </label>
          </div>

          {/* Level-specific fields */}
          {formData.educationalLevel === 'High School' && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
                <select
                  value={formData.highSchool.track}
                  onChange={(e) => setFormData({
                    ...formData,
                    highSchool: { ...formData.highSchool, track: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                >
                  <option value="">Select Track</option>
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="HUMSS">HUMSS</option>
                  <option value="GAS">GAS</option>
                  <option value="TVL">TVL</option>
                  <option value="Arts and Design">Arts and Design</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Strand</label>
                <input
                  type="text"
                  value={formData.highSchool.strand}
                  onChange={(e) => setFormData({
                    ...formData,
                    highSchool: { ...formData.highSchool, strand: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  value={formData.highSchool.grade}
                  onChange={(e) => setFormData({
                    ...formData,
                    highSchool: { ...formData.highSchool, grade: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </>
          )}

          {/* College fields */}
          {['Associate', 'Bachelor', 'Master', 'Doctorate'].includes(formData.educationalLevel) && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Course/Program</label>
                <input
                  type="text"
                  value={formData.college.courseOrProgram}
                  onChange={(e) => setFormData({
                    ...formData,
                    college: { ...formData.college, courseOrProgram: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  value={formData.college.fieldOfStudy}
                  onChange={(e) => setFormData({
                    ...formData,
                    college: { ...formData.college, fieldOfStudy: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input
                  type="text"
                  value={formData.college.gpa}
                  onChange={(e) => setFormData({
                    ...formData,
                    college: { ...formData.college, gpa: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Certificate fields */}
          {formData.educationalLevel === 'Certificate' && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.certificate.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificate: { ...formData.certificate, title: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                  <input
                    type="text"
                    value={formData.certificate.issuingOrganization}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, issuingOrganization: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
                  <input
                    type="url"
                    value={formData.certificate.credentialURL}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, credentialURL: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={formData.certificate.credentialID}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, credentialID: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.certificate.expiryDate}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, expiryDate: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  };

  const WorkExperienceSection = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingExp, setEditingExp] = useState(null);
    const [expandedItems, setExpandedItems] = useState(new Set());

    const toggleExpand = (id) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      setExpandedItems(newExpanded);
    };

    if (isAddingWorkExp) {
      return (
        <AddWorkExperienceForm 
          onClose={() => setIsAddingWorkExp(false)}
          onSubmit={handleAddWorkExperience}
        />
      );
    }

    if (editingExp) {
      return <EditWorkExperienceForm 
        experience={editingExp}
        onClose={() => setEditingExp(null)}
        onSubmit={handleEditWorkExperience}
      />;
    }

    return (
      <div className="space-y-6">
        {profileData.workExperience?.map((exp) => (
          <div 
            key={exp._id} 
            className="relative bg-white border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-all"
          >
            {/* Main Content */}
            <div className="flex flex-col space-y-4">
              {/* Header Row - Always Visible */}
              <div className="flex items-start justify-between">
                {/* Left Side - Company Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Company Logo or Icon Placeholder */}
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{exp.jobTitle}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(exp.startDate)} - 
                      {exp.isCurrentlyWorking ? ' Present' : exp.endDate ? ` ${formatDate(exp.endDate)}` : ''}
                    </p>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingExp(exp)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkExperience(exp._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedItems.has(exp._id) && (
                <div className="pl-16"> {/* Align with company info */}
                  {/* Responsibilities */}
                  {exp.responsibilities?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Responsibilities
                      </h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {exp.responsibilities.map((resp, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 ring-2 ring-blue-100"></div>
                            <span className="text-gray-600 text-sm flex-1">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {exp.skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Skills Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm rounded-full border border-gray-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show More/Less Button */}
              {(exp.responsibilities?.length > 0 || exp.skills?.length > 0) && (
                <button
                  onClick={() => toggleExpand(exp._id)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 pl-16"
                >
                  {expandedItems.has(exp._id) ? (
                    <>
                      Show less details
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show more details
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(!profileData.workExperience || profileData.workExperience.length === 0) && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">No work experience added yet</p>
          </div>
        )}
      </div>
    );
  };

  const EducationSection = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingEdu, setEditingEdu] = useState(null);
    const [expandedItems, setExpandedItems] = useState(new Set());

    const toggleExpand = (id) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      setExpandedItems(newExpanded);
    };

    if (isAddingEducation) {
      return (
        <AddEducationForm 
          onClose={() => setIsAddingEducation(false)}
          onSubmit={handleAddEducation}
        />
      );
    }

    if (editingEdu) {
      return (
        <EditEducationForm 
          education={editingEdu}
          onClose={() => setEditingEdu(null)}
          onSubmit={handleEditEducation}
        />
      );
    }

    return (
      <div className="space-y-6">
        {profileData.education?.map((edu) => (
          <div 
            key={edu._id} 
            className="relative bg-white border border-gray-100 rounded-lg p-5 hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col space-y-4">
              {/* Header - Always Visible */}
              <div className="flex items-start justify-between group">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon with gradient background */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-6 h-6 text-blue-500" />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-sm rounded-full font-medium">
                        {edu.educationalLevel}
                      </span>
                      {edu.batchYear?.isCurrentlyEnrolled && (
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded-full">
                          Currently Enrolled
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {edu.educationalLevel === 'Certificate' 
                        ? edu.certificate?.title 
                        : edu.college?.courseOrProgram || edu.highSchool?.track}
                    </h3>
                    <p className="text-gray-600 mb-1">{edu.schoolName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(edu.batchYear?.start)} - {formatDate(edu.batchYear?.end)}
                    </p>
                  </div>

                  {/* Action Buttons - Show on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => setEditingEdu(edu)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(edu._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <div className={`overflow-hidden transition-all duration-300 ${
                expandedItems.has(edu._id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pl-16 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Details based on education type */}
                    {edu.educationalLevel === 'High School' && (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Track & Strand</h4>
                          <p className="text-gray-600">{edu.highSchool?.track}</p>
                          {edu.highSchool?.strand && (
                            <p className="text-gray-600">{edu.highSchool.strand}</p>
                          )}
                        </div>
                        {edu.highSchool?.grade && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Grade</h4>
                            <p className="text-gray-600">{edu.highSchool.grade}</p>
                          </div>
                        )}
                      </>
                    )}

                    {['Associate', 'Bachelor', 'Master', 'Doctorate'].includes(edu.educationalLevel) && (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Field of Study</h4>
                          <p className="text-gray-600">{edu.college?.fieldOfStudy}</p>
                        </div>
                        {edu.college?.gpa && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">GPA</h4>
                            <p className="text-gray-600">{edu.college.gpa}</p>
                          </div>
                        )}
                      </>
                    )}

                    {edu.educationalLevel === 'Certificate' && (
                      <>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Issuing Organization</h4>
                          <p className="text-gray-600">{edu.certificate?.issuingOrganization}</p>
                        </div>
                        {edu.certificate?.credentialID && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Credential ID</h4>
                            <p className="text-gray-600">{edu.certificate.credentialID}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Location Info */}
                    {edu.location?.city && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Location</h4>
                        <p className="text-gray-600">{edu.location.city}, {edu.location.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Show More/Less Button */}
              <button
                onClick={() => toggleExpand(edu._id)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 pl-16 group"
              >
                <span className="group-hover:underline">
                  {expandedItems.has(edu._id) ? 'Show less' : 'Show more'}
                </span>
                <div className={`transform transition-transform duration-300 ${
                  expandedItems.has(edu._id) ? 'rotate-180' : ''
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(!profileData.education || profileData.education.length === 0) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-500 mb-4">No education history added yet</p>
            <button
              onClick={() => setIsAddingEducation(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Education
            </button>
          </div>
        )}
      </div>
    );
  };

  // Helper function to determine which fields to show
  const getVisibleFields = (educationalLevel) => {
    const commonFields = {
      showSchoolName: true,
      showDates: true,
      showLocation: true,
      showDescription: true
    };

    switch (educationalLevel) {
      case 'High School':
        return {
          ...commonFields,
          showTrack: true,
          showStrand: true,
          showGrade: true,
          showAwards: true,
          showActivities: true,
          // Hide college-specific fields
          showCourseProgram: false,
          showFieldOfStudy: false,
          showMajorMinor: false,
          showThesis: false,
          showGPA: false,
          // Hide certificate-specific fields
          showCredentials: false,
          showIssuer: false,
          showExpiry: false
        };

      case 'Certificate':
        return {
          ...commonFields,
          showCredentials: true,
          showIssuer: true,
          showExpiry: true,
          showSkills: true,
          // Hide academic fields
          showTrack: false,
          showStrand: false,
          showGrade: false,
          showCourseProgram: false,
          showFieldOfStudy: false,
          showMajorMinor: false,
          showThesis: false,
          showGPA: false
        };

      case 'Associate':
      case 'Bachelor':
      case 'Master':
      case 'Doctorate':
        return {
          ...commonFields,
          showCourseProgram: true,
          showFieldOfStudy: true,
          showMajorMinor: true,
          showGPA: true,
          showAwards: true,
          showActivities: true,
          // Show thesis/dissertation only for Master/Doctorate
          showThesis: ['Master', 'Doctorate'].includes(educationalLevel),
          // Hide high school fields
          showTrack: false,
          showStrand: false,
          // Hide certificate fields
          showCredentials: false,
          showIssuer: false,
          showExpiry: false
        };

      default:
        return commonFields;
    }
  };

  // Update the AddEducationForm to use the visibility helper
  const AddEducationForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      educationalLevel: '',
      schoolName: '',
      batchYear: {
        start: '',
        end: '',
        isCurrentlyEnrolled: false
      },
      location: {
        city: '',
        country: '',
        address: ''
      },
      highSchool: {
        track: '',
        strand: '',
        grade: ''
      },
      college: {
        courseOrProgram: '',
        fieldOfStudy: '',
        gpa: ''
      },
      certificate: {
        title: '',
        issuingOrganization: '',
        credentialID: '',
        credentialURL: '',
        issueDate: '',
        expiryDate: ''
      }
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // If currently enrolled, set end date to start date
      const submissionData = {
        ...formData,
        batchYear: {
          ...formData.batchYear,
          end: formData.batchYear.isCurrentlyEnrolled ? formData.batchYear.start : formData.batchYear.end
        }
      };

      onSubmit(submissionData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Educational Level - Always visible */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Educational Level
            </label>
            <select
              value={formData.educationalLevel}
              onChange={(e) => setFormData({...formData, educationalLevel: e.target.value})}
              className="w-full border p-2 rounded-lg"
              required
            >
              <option value="">Select Educational Level</option>
              <option value="High School">High School</option>
              <option value="Associate">Associate Degree</option>
              <option value="Bachelor">Bachelor's Degree</option>
              <option value="Master">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
              <option value="Certificate">Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* School Name - Always visible */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.educationalLevel === 'High School' ? 'High School Name' : 
               formData.educationalLevel === 'Certificate' ? 'Institution Name' : 
               'University/College Name'}
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>

          {/* Common Fields for All Levels */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.batchYear.start}
                onChange={(e) => setFormData({
                  ...formData,
                  batchYear: { ...formData.batchYear, start: e.target.value }
                })}
                className="w-full border p-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.batchYear.end}
                onChange={(e) => setFormData({
                  ...formData,
                  batchYear: { ...formData.batchYear, end: e.target.value }
                })}
                className="w-full border p-2 rounded-lg"
                disabled={formData.batchYear.isCurrentlyEnrolled}
                required={!formData.batchYear.isCurrentlyEnrolled}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.batchYear.isCurrentlyEnrolled}
                  onChange={(e) => setFormData({
                    ...formData,
                    batchYear: { ...formData.batchYear, isCurrentlyEnrolled: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Currently Enrolled</span>
              </label>
            </div>
          </div>

          {/* High School Specific Fields */}
          {formData.educationalLevel === 'High School' && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
                <select
                  value={formData.highSchool.track}
                  onChange={(e) => setFormData({
                    ...formData,
                    highSchool: { ...formData.highSchool, track: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                >
                  <option value="">Select Track</option>
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="HUMSS">HUMSS</option>
                  <option value="GAS">GAS</option>
                  <option value="TVL">TVL</option>
                  <option value="Arts and Design">Arts and Design</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Strand</label>
                <input
                  type="text"
                  value={formData.highSchool.strand}
                  onChange={(e) => setFormData({
                    ...formData,
                    highSchool: { ...formData.highSchool, strand: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  value={formData.highSchool.grade}
                  onChange={(e) => setFormData({
                    ...formData,
                    highSchool: { ...formData.highSchool, grade: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>
            </>
          )}

          {/* College/University Specific Fields */}
          {['Associate', 'Bachelor', 'Master', 'Doctorate'].includes(formData.educationalLevel) && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Course/Program</label>
                <input
                  type="text"
                  value={formData.college.courseOrProgram}
                  onChange={(e) => setFormData({
                    ...formData,
                    college: { ...formData.college, courseOrProgram: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  value={formData.college.fieldOfStudy}
                  onChange={(e) => setFormData({
                    ...formData,
                    college: { ...formData.college, fieldOfStudy: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input
                  type="text"
                  value={formData.college.gpa}
                  onChange={(e) => setFormData({
                    ...formData,
                    college: { ...formData.college, gpa: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Certificate Specific Fields */}
          {formData.educationalLevel === 'Certificate' && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  value={formData.certificate.issuingOrganization}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificate: { ...formData.certificate, issuingOrganization: e.target.value }
                  })}
                  className="w-full border p-2 rounded-lg"
                  required
                />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={formData.certificate.credentialID}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, credentialID: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
                  <input
                    type="url"
                    value={formData.certificate.credentialURL}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, credentialURL: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formData.certificate.issueDate}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, issueDate: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.certificate.expiryDate}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificate: { ...formData.certificate, expiryDate: e.target.value }
                    })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Add Education
          </button>
        </div>
      </form>
    );
  };

  // Add this new component for adding skills
  const AddSkillsForm = ({ onClose, onSubmit }) => {
    const [skills, setSkills] = useState(['']);

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(skills.filter(skill => skill.trim() !== ''));
      }} className="space-y-4">
        <div className="space-y-2">
          <label className="block font-medium">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 rounded-full pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...skills];
                    newSkills[index] = e.target.value;
                    setSkills(newSkills);
                  }}
                  placeholder="Add skill"
                  className="bg-transparent border-none focus:outline-none text-blue-600 w-24 min-w-0"
                />
                {skills.length > 1 && (
                  <RemoveButton 
                    onClick={() => {
                      const newSkills = skills.filter((_, i) => i !== index);
                      setSkills(newSkills);
                    }}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSkills([...skills, ''])}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Skills
          </button>
        </div>
      </form>
    );
  };

  // Replace the existing Skills section with this new component
  const SkillsSection = () => {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSkills = async (skills) => {
      try {
        const response = await axios.put(
`${process.env.REACT_APP_API_URL}/api/seekers/profile/skills`,
          { skills },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setProfileData(prev => ({
            ...prev,
            keySkills: response.data.skills
          }));
          setIsAdding(false);
        }
      } catch (err) {
        console.error('Error updating skills:', err);
      }
    };

    if (isAdding) {
      return <AddSkillsForm 
        onClose={() => setIsAdding(false)}
        onSubmit={handleAddSkills}
      />;
    }

    return (
      <>
        {(!profileData.keySkills || profileData.keySkills.length === 0) ? (
          <div className="flex justify-end">
            <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Skills
          </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2">
                {profileData.keySkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              >
                <Edit className="w-4 h-4" />
                Edit Skills
              </button>
            </div>
          </>
        )}
      </>
    );
  };

  // Common remove button component
  const RemoveButton = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
    >
      <X className="w-4 h-4" />
    </button>
  );

  // Update the AboutMeSection component
  const AboutMeSection = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [aboutMe, setAboutMe] = useState(profileData.basicInfo?.aboutMe || '');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.put(
`${process.env.REACT_APP_API_URL}/api/seekers/profile/basic-info`,
          { 
            ...profileData.basicInfo,
            aboutMe 
          },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setProfileData(prev => ({
            ...prev,
            basicInfo: { ...prev.basicInfo, aboutMe }
          }));
          setIsEditing(false);
        }
      } catch (err) {
        console.error('Error updating about me:', err);
      }
    };

    if (!isEditing) {
      return (
        <div className="relative">
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-0 right-0 text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-5 h-5" />
          </button>
          <div className="pr-10">
            {aboutMe ? (
              <p className="text-gray-700 leading-relaxed">{aboutMe}</p>
            ) : (
              <p className="text-gray-500 italic">Add a description about yourself</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Tell us about yourself..."
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm border rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    );
  };

  // Update the WorkPreferencesSection
  const WorkPreferencesSection = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      preferredJobTitles: profileData.workPreferences?.preferredJobTitles || [''],
      industry: profileData.workPreferences?.industry || [''],
      employmentType: profileData.workPreferences?.employmentType || ''
    });

    const handleSave = async () => {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/seekers/profile/preferences`
,
          formData,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setProfileData(prev => ({
            ...prev,
            workPreferences: response.data.workPreferences
          }));
          setIsEditing(false);
        }
      } catch (err) {
        console.error('Error updating work preferences:', err);
      }
    };

    if (!isEditing) {
      return (
        <div className="relative">
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-0 right-0 text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-5 h-5" />
          </button>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Preferred Job Titles</h3>
              <div className="flex flex-wrap gap-2">
                {formData.preferredJobTitles.map((title, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full">
                    {title}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {formData.industry.map((ind, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Employment Type</h3>
              <p>{formData.employmentType}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <form className="space-y-4">
        <div>
          <label className="block font-medium mb-2">Preferred Job Titles</label>
          <div className="flex flex-wrap gap-2">
            {formData.preferredJobTitles.map((title, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 rounded-full pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const newTitles = [...formData.preferredJobTitles];
                    newTitles[index] = e.target.value;
                    setFormData({...formData, preferredJobTitles: newTitles});
                  }}
                  className="bg-transparent border-none focus:outline-none text-blue-600 w-32 min-w-0"
                />
                {formData.preferredJobTitles.length > 1 && (
                  <RemoveButton 
                    onClick={() => {
                      const newTitles = formData.preferredJobTitles.filter((_, i) => i !== index);
                      setFormData({...formData, preferredJobTitles: newTitles});
                    }}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                preferredJobTitles: [...formData.preferredJobTitles, '']
              })}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Job Title
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Industries</label>
          <div className="flex flex-wrap gap-2">
            {formData.industry.map((ind, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 rounded-full pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={ind}
                  onChange={(e) => {
                    const newIndustries = [...formData.industry];
                    newIndustries[index] = e.target.value;
                    setFormData({...formData, industry: newIndustries});
                  }}
                  className="bg-transparent border-none focus:outline-none text-blue-600 w-32 min-w-0"
                />
                {formData.industry.length > 1 && (
                  <RemoveButton 
                    onClick={() => {
                      const newIndustries = formData.industry.filter((_, i) => i !== index);
                      setFormData({...formData, industry: newIndustries});
                    }}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                industry: [...formData.industry, '']
              })}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Industry
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Employment Type</label>
          <select
            value={formData.employmentType}
            onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  };

  // Add these handler functions in the EducationSection component
  const handleEditClick = (education) => {
    setEditingEdu(education);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this education record?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/seekers/profile/education/${id}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setProfileData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu._id !== id)
          }));
        }
      } catch (err) {
        console.error('Error deleting education:', err);
      }
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profileData) return <div>No profile data found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker/>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ProfileNav />
        
        {/* Profile Sections - Top to Bottom Layout */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <SectionHeader 
              icon={User} 
              title="Personal Information" 
              section="personal"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InfoField label="First Name" value={profileData.basicInfo?.firstName} />
                <InfoField label="Last Name" value={profileData.basicInfo?.lastName} />
                <InfoField label="Date of Birth" value={profileData.basicInfo?.dateOfBirth?.split('T')[0]} />
              </div>
              <div>
                <InfoField label="Gender" value={profileData.basicInfo?.gender} />
                <InfoField label="Age" value={profileData.basicInfo?.age} />
                <InfoField label="Phone Number" value={profileData.basicInfo?.phoneNumber} />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <SectionHeader 
              icon={MapPin} 
              title="Contact & Location" 
              section="location"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {/* Update these paths to match your profileData structure */}
                <InfoField label="Email" value={profileData.user?.email} />
                <InfoField label="Phone" value={profileData.basicInfo?.phoneNumber} />
              </div>
              <div>
                <LocationSection 
                  profileData={profileData} 
                  onUpdate={handleSubmit} 
                  initialData={profileData.locationInfo} // Pass the correct location data
                />
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <SectionHeader 
              icon={Info} 
              title="About Me" 
            />
            <AboutMeSection />
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <SectionHeader 
              icon={Briefcase} 
              title="Work Experience"
              onAdd={() => setIsAddingWorkExp(true)}
            />
            <WorkExperienceSection />
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <SectionHeader 
              icon={GraduationCap} 
              title="Education"
              onAdd={() => setIsAddingEducation(true)}
            />
            <EducationSection />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <SectionHeader 
              icon={Wrench} 
              title="Skills" 
            />
            <SkillsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this new component for read-only info fields
const InfoField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <p className="text-gray-800">
      {value || 'Not specified'}
    </p>
  </div>
);

export default Profile;
