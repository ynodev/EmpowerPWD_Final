import React, { useState } from 'react';
import { Eye, EyeOff, Save, ArrowLeft, Lock, Shield, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavEmployer from '../ui/navEmployer';
import axiosInstance from '../../utils/axios';

const Settings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [notificationPreferences, setNotificationPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        notifyOnNewApplications: true,
        notifyOnMessages: true,
        notifyOnInterviews: true,
        notifyOnJobUpdates: true,
        emailDigest: 'daily' // 'daily', 'weekly', 'never'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        setError('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }

        // Add password strength requirements
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError(
                'Password must be at least 8 characters long and contain at least one uppercase letter, ' +
                'one lowercase letter, one number, and one special character'
            );
            return false;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('User not authenticated. Please log in again.');
                return;
            }

            const response = await axiosInstance.put(`/api/employers/${userId}/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setSuccess('Password updated successfully');
                // Clear form
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                // Remove the automatic sign out
                // setTimeout(() => {
                //     localStorage.clear();
                //     navigate('/login');
                // }, 2000);
            }
        } catch (error) {
            console.error('Password change error:', error);
            setError(
                error.response?.data?.message || 
                'Failed to update password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavEmployer />
            <div className="ml-64 p-4 pt-20">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button and Header in same row */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/job-dashboard')}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Dashboard
                        </button>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
                        </div>
                    </div>

                    {/* Settings Grid with adjusted columns */}
                    <div className="grid grid-cols-5 gap-4">
                        {/* Sidebar Navigation - 1 column */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-3">
                                <nav className="space-y-1">
                                    <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Security
                                    </a>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content - 4 columns */}
                        <div className="col-span-4">
                            <div className="bg-white rounded-lg shadow-sm">
                                {/* Section Header - More compact */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <Lock className="h-5 w-5 text-blue-600 mr-2" />
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">Password & Security</h2>
                                            <p className="text-xs text-gray-600">
                                                Ensure your account stays secure by using a strong password
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {/* Alerts - More compact */}
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start text-sm">
                                            <div className="flex-shrink-0">
                                                <svg className="h-4 w-4 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="ml-2">{error}</p>
                                        </div>
                                    )}
                                    
                                    {success && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start text-sm">
                                            <div className="flex-shrink-0">
                                                <svg className="h-4 w-4 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="ml-2">{success}</p>
                                        </div>
                                    )}

                                    {/* Password Form - More compact */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Enter your current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Enter your new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
                                            </p>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Confirm your new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Button - Adjusted position */}
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Update Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
