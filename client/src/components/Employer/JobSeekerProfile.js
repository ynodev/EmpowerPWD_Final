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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      
      <div className="flex">
        {/* Side Navigation */}
        <div className="w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 pt-20">
          <nav className="p-4 space-y-2">
            <a href="#personal" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Personal Information
            </a>
            <a href="#work" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Work Experience
            </a>
            <a href="#education" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Education
            </a>
            <a href="#skills" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              Skills
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
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

            {/* Work Experience Section */}
            <div id="work" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
              </div>
              <div className="space-y-6">
                {profileData.workExperience?.map((exp) => (
                  <div key={exp._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exp.previousJobTitle}</h3>
                        <p className="text-gray-600">{exp.companyName}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(exp.startDate)} - {exp.isCurrentlyWorking ? 'Present' : formatDate(exp.endDate)}
                        </p>
                      </div>
                    </div>
                    {exp.keyResponsibility && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities:</h4>
                        <p className="text-gray-600">{exp.keyResponsibility}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div id="education" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              </div>
              <div className="space-y-6">
                {profileData.education?.map((edu) => (
                  <div key={edu._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(edu.startDate)} - {edu.isCurrentlyEnrolled ? 'Present' : formatDate(edu.endDate)}
                        </p>
                      </div>
                    </div>
                    {edu.description && (
                      <div className="mt-4">
                        <p className="text-gray-600">{edu.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div id="skills" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.keySkills?.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfile; 