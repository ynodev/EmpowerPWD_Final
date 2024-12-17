import React, { useState, useEffect } from 'react';
import NavEmployer from '../ui/navEmployer';
import { Edit2, Save, X, Camera } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const ProfileHeader = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data?.companyInfo || {});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    console.log('Profile Header Data:', data);
    if (data?.companyInfo?.companyLogo) {
      console.log('Logo URL:', `${process.env.REACT_APP_API_URL}${data.companyInfo.companyLogo}`);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await onUpdate('companyInfo', editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save changes');
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('companyLogo', file);
      
      const userId = localStorage.getItem('userId');
      console.log('Uploading file for userId:', userId);
      console.log('FormData contents:', [...formData.entries()]);
      
      const response = await axiosInstance.put(
        `/api/employer-profile/logo/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.success) {
        onUpdate('companyInfo', { ...editData, companyLogo: response.data.data.companyLogo });
        setShowUploadModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const fullUrl = `${process.env.REACT_APP_API_URL}/${cleanPath}`;
    console.log('Image path:', path);
    console.log('Constructed URL:', fullUrl);
    return fullUrl;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
      <div className="flex items-center gap-8">
        {/* Profile Picture */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {data?.companyInfo?.companyLogo ? (
              <img 
              src={`${process.env.REACT_APP_API_URL}${data.companyInfo.companyLogo}`}
              alt="Company Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  console.log('Attempted image URL:', e.target.src);
                }}
              />
            ) : (
              <div className="text-4xl text-gray-400 font-bold">
                {data?.companyInfo?.companyName?.charAt(0) || 'C'}
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center gap-2"
              >
                <Camera size={20} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editData.companyName || ''}
                  onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={editData.industry?.join(', ') || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    industry: e.target.value.split(',').map(item => item.trim()) 
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Industry (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  value={editData.companySize || ''}
                  onChange={(e) => setEditData({ ...editData, companySize: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Company Size"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={editData.website || ''}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Website"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {data?.companyInfo?.companyName || 'Company Profile'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {data?.companyInfo?.industry?.join(' • ') || 'Industry not specified'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={20} />
                </button>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="text-sm">
                  <span className="text-gray-500">Company Size:</span>
                  <span className="ml-2 text-gray-700">
                    {data?.companyInfo?.companySize || 'Not specified'}
                  </span>
                </div>
                {data?.companyInfo?.website && (
                  <div className="text-sm">
                    <span className="text-gray-500">Website:</span>
                    <a 
                      href={data.companyInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {data.companyInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Company Logo</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : data?.companyInfo?.companyLogo ? (
                  <img 
                  src={`${process.env.REACT_APP_API_URL}${data.companyInfo.companyLogo}`}
                  alt="Current Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={32} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]');
                    if (fileInput.files[0]) {
                      handleImageUpload(fileInput.files[0]);
                    }
                  }}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg"
                  disabled={!previewImage}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        console.log('Fetching profile for userId:', userId);

        const response = await axiosInstance.get(`/api/employer-profile/profile/${userId}`);
        console.log('Profile response:', response.data);

        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    console.log('Current profile data:', profile);
  }, [profile]);

  const handleUpdate = async (section, data) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axiosInstance.put(
        `/api/employer-profile/${section}/${userId}`,
        data
      );

      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          [section]: response.data.data
        }));
      }
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (section) => {
    setEditData({
      ...editData,
      [section]: { ...profile[section] }
    });
    setActiveSection(section);
  };

  const handleChange = (section, field, value) => {
    setEditData(prev => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async (section) => {
    try {
      const userId = localStorage.getItem('userId');
      console.log('Saving section:', section, 'with data:', editData[section]);

      const response = await axiosInstance.put(
        `/api/employer-profile/${section}/${userId}`,
        editData[section]
      );

      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          [section]: response.data.data
        }));
        setActiveSection(null);
        setEditData(null);
        alert('Successfully updated!');
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = () => {
    setActiveSection(null);
    setEditData(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      <div className="ml-64 p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <ProfileHeader 
            data={profile} 
            onUpdate={handleUpdate}
          />

          {/* Company Information Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
              <button
                onClick={() => handleEdit('companyInfo')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 size={20} />
              </button>
            </div>

            {activeSection === 'companyInfo' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                    <textarea
                      value={editData?.companyInfo?.companyDescription || ''}
                      onChange={(e) => handleChange('companyInfo', 'companyDescription', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departments</label>
                    <input
                      type="text"
                      value={editData?.companyInfo?.departments?.join(', ') || ''}
                      onChange={(e) => handleChange('companyInfo', 'departments', e.target.value.split(',').map(d => d.trim()))}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter departments (comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Establishment Date</label>
                    <input
                      type="date"
                      value={editData?.companyInfo?.establishmentDate?.split('T')[0] || ''}
                      onChange={(e) => handleChange('companyInfo', 'establishmentDate', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                {/* Address Fields */}
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Company Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editData?.companyInfo?.companyAddress?.street || ''}
                      onChange={(e) => handleChange('companyInfo', 'companyAddress', {
                        ...editData.companyInfo.companyAddress,
                        street: e.target.value
                      })}
                      placeholder="Street"
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={editData?.companyInfo?.companyAddress?.city || ''}
                      onChange={(e) => handleChange('companyInfo', 'companyAddress', {
                        ...editData.companyInfo.companyAddress,
                        city: e.target.value
                      })}
                      placeholder="City"
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={editData?.companyInfo?.companyAddress?.province || ''}
                      onChange={(e) => handleChange('companyInfo', 'companyAddress', {
                        ...editData.companyInfo.companyAddress,
                        province: e.target.value
                      })}
                      placeholder="Province"
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={editData?.companyInfo?.companyAddress?.country || ''}
                      onChange={(e) => handleChange('companyInfo', 'companyAddress', {
                        ...editData.companyInfo.companyAddress,
                        country: e.target.value
                      })}
                      placeholder="Country"
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={editData?.companyInfo?.companyAddress?.postalCode || ''}
                      onChange={(e) => handleChange('companyInfo', 'companyAddress', {
                        ...editData.companyInfo.companyAddress,
                        postalCode: e.target.value
                      })}
                      placeholder="Postal Code"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleCancel()}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('companyInfo')}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company Description</h3>
                    <p className="mt-1 text-gray-900">{profile.companyInfo?.companyDescription || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Departments</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.companyInfo?.departments?.map((dept, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Establishment Date</h3>
                    <p className="mt-1 text-gray-900">
                      {profile.companyInfo?.establishmentDate 
                        ? new Date(profile.companyInfo.establishmentDate).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <div className="mt-1 text-gray-900">
                      <p>{profile.companyInfo?.companyAddress?.street}</p>
                      <p>{profile.companyInfo?.companyAddress?.city}, {profile.companyInfo?.companyAddress?.province}</p>
                      <p>{profile.companyInfo?.companyAddress?.country}, {profile.companyInfo?.companyAddress?.postalCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Person Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Contact Person</h2>
              <button
                onClick={() => handleEdit('contactPerson')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 size={20} />
              </button>
            </div>

            {activeSection === 'contactPerson' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editData?.contactPerson?.fullName || ''}
                      onChange={(e) => handleChange('contactPerson', 'fullName', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={editData?.contactPerson?.position || ''}
                      onChange={(e) => handleChange('contactPerson', 'position', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editData?.contactPerson?.phoneNumber || ''}
                      onChange={(e) => handleChange('contactPerson', 'phoneNumber', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Phone</label>
                    <input
                      type="text"
                      value={editData?.contactPerson?.alternativePhoneNumber || ''}
                      onChange={(e) => handleChange('contactPerson', 'alternativePhoneNumber', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editData?.contactPerson?.email || ''}
                      onChange={(e) => handleChange('contactPerson', 'email', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={editData?.contactPerson?.linkedIn || ''}
                      onChange={(e) => handleChange('contactPerson', 'linkedIn', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={editData?.contactPerson?.department?.join(', ') || ''}
                      onChange={(e) => handleChange('contactPerson', 'department', e.target.value.split(',').map(d => d.trim()))}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter departments (comma separated)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleCancel()}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('contactPerson')}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="mt-1 text-gray-900">{profile.contactPerson?.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p className="mt-1 text-gray-900">{profile.contactPerson?.position || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1 text-gray-900">{profile.contactPerson?.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Alternative Phone</h3>
                  <p className="mt-1 text-gray-900">{profile.contactPerson?.alternativePhoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">{profile.contactPerson?.email || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">LinkedIn</h3>
                  <p className="mt-1 text-gray-900">{profile.contactPerson?.linkedIn || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.contactPerson?.department?.map((dept, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PWD Support Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">PWD Support</h2>
              <button
                onClick={() => handleEdit('pwdSupport')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 size={20} />
              </button>
            </div>

            {activeSection === 'pwdSupport' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Features</label>
                  <input
                    type="text"
                    value={editData?.pwdSupport?.accessibilityFeatures?.join(', ') || ''}
                    onChange={(e) => handleChange('pwdSupport', 'accessibilityFeatures', e.target.value.split(',').map(f => f.trim()))}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter features (comma separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Programs</label>
                  <input
                    type="text"
                    value={editData?.pwdSupport?.supportPrograms?.join(', ') || ''}
                    onChange={(e) => handleChange('pwdSupport', 'supportPrograms', e.target.value.split(',').map(p => p.trim()))}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter programs (comma separated)"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData?.pwdSupport?.remoteWorkOptions || false}
                      onChange={(e) => handleChange('pwdSupport', 'remoteWorkOptions', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Remote Work Options Available</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <textarea
                    value={editData?.pwdSupport?.additionalInfo || ''}
                    onChange={(e) => handleChange('pwdSupport', 'additionalInfo', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleCancel()}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('pwdSupport')}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Accessibility Features</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.pwdSupport?.accessibilityFeatures?.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Support Programs</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.pwdSupport?.supportPrograms?.map((program, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Remote Work Options</h3>
                  <p className="mt-1 text-gray-900">
                    {profile.pwdSupport?.remoteWorkOptions ? 'Available' : 'Not Available'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Additional Information</h3>
                  <p className="mt-1 text-gray-900">{profile.pwdSupport?.additionalInfo || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile; 