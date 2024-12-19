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
    <div className="space-y-1">
      <label className="text-sm text-gray-500">{label}</label>
      <p className="font-medium text-gray-800">{value || 'Not specified'}</p>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Application</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {profileData.basicInfo?.firstName} {profileData.basicInfo?.lastName}
              </h1>
              <div className="flex items-center justify-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profileData.user?.email}
                </span>
                {profileData.basicInfo?.phoneNumber && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profileData.basicInfo.phoneNumber}
                  </span>
                )}
              </div>
            </div>

            {/* About Me */}
            {profileData.basicInfo?.aboutMe && (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-700 leading-relaxed">
                  {profileData.basicInfo.aboutMe}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <SectionHeader icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField label="Age" value={profileData.basicInfo?.age} />
              <InfoField label="Gender" value={profileData.basicInfo?.gender} />
              <InfoField 
                label="Date of Birth" 
                value={new Date(profileData.basicInfo?.dateOfBirth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} 
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <SectionHeader icon={Briefcase} title="Work Experience" />
            {profileData.workExperience?.length > 0 ? (
              <div className="space-y-8">
                {profileData.workExperience.map((exp, index) => (
                  <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-100">
                    <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-blue-500 -translate-x-[5px]" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.previousJobTitle}</h3>
                      <p className="text-gray-600">{exp.companyName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - 
                        {exp.isCurrentlyWorking ? ' Present' : 
                          new Date(exp.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities:</h4>
                        <p className="text-gray-600">{exp.keyResponsibility}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No work experience listed</p>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <SectionHeader icon={GraduationCap} title="Education" />
            {profileData.education?.length > 0 ? (
              <div className="space-y-8">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-100">
                    <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-blue-500 -translate-x-[5px]" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.school}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - 
                        {edu.isCurrentlyEnrolled ? ' Present' : 
                          new Date(edu.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      {edu.description && (
                        <div className="bg-gray-50 rounded-lg p-4 mt-3">
                          <p className="text-gray-600">{edu.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No education history listed</p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <SectionHeader icon={Wrench} title="Skills" />
            {profileData.keySkills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.keySkills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No skills listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfile; 