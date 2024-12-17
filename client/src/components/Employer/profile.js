import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Phone, Building, MapPin, ArrowLeft } from 'lucide-react';
import NavEmployer from '../ui/navEmployer';
import axiosInstance from '../../utils/axios';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    basicInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      profilePicture: null
    },
    companyInfo: {
      companyName: '',
      industry: '',
      companySize: '',
      companyAddress: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axiosInstance.get(`/api/employer-profile/profile/${userId}`);
      
      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsUploading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await axiosInstance.post(
        `/api/employer-profile/upload-profile-picture/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            profilePicture: response.data.data.profilePicture
          }
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {profileData.basicInfo?.profilePicture ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${profileData.basicInfo.profilePicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-500" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Camera className="w-4 h-4 text-gray-600" />
                </label>
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData.basicInfo?.firstName} {profileData.basicInfo?.lastName}
                </h1>
                <p className="text-gray-500">Employer</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profileData.basicInfo?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profileData.basicInfo?.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{profileData.basicInfo?.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{profileData.companyInfo?.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{profileData.companyInfo?.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company Size</p>
                  <p className="font-medium">{profileData.companyInfo?.companySize}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company Address</p>
                  <p className="font-medium">{profileData.companyInfo?.companyAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
