import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logo from "../../assets/img/logo.svg";

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://empower-pwd.onrender.com/api'
    : '/api';

const AdminLogin = () => {
    const [email, setEmail] = useState(() => {
        // Check if there's a remembered email on component mount
        return localStorage.getItem('rememberedEmail') || '';
    });
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => {
        // Check if remember me was previously enabled
        return localStorage.getItem('rememberMe') === 'true';
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin/login`,
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                }
            );

            console.log('Login response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }

            const userData = response.data.user;
            if (!userData) {
                throw new Error('No user data received');
            }

            // Create cookie expiry date (e.g., 7 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);

            // Set cookie with token if it's provided in the response
            if (response.data.token) {
                document.cookie = `adminToken=${response.data.token}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
            }

            localStorage.setItem('userId', userData._id);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('accessLevel', userData.accessLevel);
            localStorage.setItem('permissions', JSON.stringify(userData.permissions));

            setStatus({
                type: 'success',
                message: response.data.message || 'Login successful'
            });

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.setItem('rememberMe', 'false');
            }

            if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                throw new Error('Insufficient permissions');
            }

        } catch (error) {
            console.error('Login error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Invalid credentials, please try again.'
            });

            // Clear any existing auth data on error
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('accessLevel');
            localStorage.removeItem('permissions');
            // Clear the auth cookie
            document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        } finally {
            setIsLoading(false);
        }
    };

    // Add a helper function to check for cookie
    const getAdminToken = () => {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('adminToken='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    // Update the check for logged-in status
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        const accessLevel = localStorage.getItem('accessLevel');
        const token = getAdminToken();
        
        if (userId && userRole === 'admin' && accessLevel && token) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white font-poppins">
            <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-blue-50 p-3 rounded-2xl mb-4">
                        <img src={logo} alt="logo" className="w-12 h-12" />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">EmpowerPWD</span>
                    <div className="mt-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
                            Welcome Back, Admin!
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Please sign in to access your dashboard
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {status.message && (
                        <Alert type={status.type} className="mb-6">
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 bg-gray-50 hover:bg-gray-100 focus:bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 bg-gray-50 hover:bg-gray-100 focus:bg-white"
                            />
                            <button 
                                type="button"
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <Link 
                            to="/admin/forgot-password" 
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
