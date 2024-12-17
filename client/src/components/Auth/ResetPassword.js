import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, Lock } from 'lucide-react';
import axios from 'axios';
import logo from "../../assets/img/logo.svg";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        if (password !== confirmPassword) {
            setStatus({
                type: 'error',
                message: 'Passwords do not match'
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/admin/reset-password', {
                token,
                newPassword: password
            });

            setStatus({
                type: 'success',
                message: 'Password reset successful'
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/admin/login');
            }, 2000);

        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to reset password'
            });
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
                            Reset Your Password
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Please enter your new password
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
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 bg-gray-50 hover:bg-gray-100 focus:bg-white"
                            />
                            <button 
                                type="button"
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                                <span>Resetting Password...</span>
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                <span>Reset Password</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 