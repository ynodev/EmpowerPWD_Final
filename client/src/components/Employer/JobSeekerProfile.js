import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Briefcase, GraduationCap, 
  Wrench, Info, ArrowLeft, FileText, Phone, Mail
} from 'lucide-react';
import NavEmployer from '../ui/navEmployer';
import axios from 'axios';

const JobSeekerProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { seekerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [seekerId]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for seekerId:', seekerId); // Debug log
      
      const response = await axios.get(`/api/employer/jobseeker/${seekerId}`, {
        withCredentials: true
      });
      
      console.log('Profile response:', response.data); // Debug log
      
      setProfileData(response.data.profile);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err.response?.data || err); // Enhanced error logging
      setError(err.response?.data?.message || 'Error fetching profile');
      setLoading(false);
    }
  };

  const InfoField = ({ label, value }) => (
    <div className="mb-4">
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
      <p className="font-medium text-gray-800">{value || 'Not specified'}</p>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6">
      <Icon className="w-5 h-5 text-blue-600" />
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">No profile data found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Application</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData.basicInfo?.firstName} {profileData.basicInfo?.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-500">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {profileData.user?.email}
                </span>
                {profileData.basicInfo?.phoneNumber && (
                  <span className="text-gray-500">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {profileData.basicInfo.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* About Me */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={Info} title="About Me" />
            <p className="text-gray-700 leading-relaxed">
              {profileData.basicInfo?.aboutMe || 'No description provided'}
            </p>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Age" value={profileData.basicInfo?.age} />
              <InfoField label="Gender" value={profileData.basicInfo?.gender} />
              <InfoField label="Date of Birth" value={profileData.basicInfo?.dateOfBirth?.split('T')[0]} />
            </div>
          </div>

          {/* Disability Information */}
          {profileData.disabilityInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={Info} title="Disability Information" />
              <div className="space-y-4">
                {profileData.disabilityInfo.disabilityType && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.disabilityInfo.disabilityType.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profileData.disabilityInfo.disabilityAdditionalInfo && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Additional Information</label>
                    <p className="text-gray-700">{profileData.disabilityInfo.disabilityAdditionalInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={Briefcase} title="Work Experience" />
            {profileData.workExperience?.length > 0 ? (
              <div className="space-y-6">
                {profileData.workExperience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h3 className="font-medium text-gray-900">{exp.previousJobTitle}</h3>
                    <p className="text-gray-600 text-sm">{exp.companyName}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.isCurrentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-700">{exp.keyResponsibility}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No work experience listed</p>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={GraduationCap} title="Education" />
            {profileData.education?.length > 0 ? (
              <div className="space-y-6">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600 text-sm">{edu.school}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(edu.startDate).toLocaleDateString()} - 
                      {edu.isCurrentlyEnrolled ? 'Present' : new Date(edu.endDate).toLocaleDateString()}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-gray-700">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No education history listed</p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={Wrench} title="Skills" />
            {profileData.keySkills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.keySkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfile; 