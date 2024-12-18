import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logo from "../../assets/img/logo.svg";

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
                'https://empower-pwd.onrender.com/api/admin/login', 
                { email, password },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Store user data from response
                const { user } = response.data;
                localStorage.setItem('userId', user._id);
                localStorage.setItem('userRole', user.role);

                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.setItem('rememberMe', 'false');
                }

                setStatus({
                    type: 'success',
                    message: response.data.message || 'Login successful'
                });

                navigate('/admin/dashboard');
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Invalid credentials, please try again.'
            });
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
