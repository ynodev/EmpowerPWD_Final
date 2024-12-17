import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from "../ui/alert";
import { ArrowLeft, Send, RotateCw } from 'lucide-react';
import axios from 'axios';
import logo from "../../assets/img/logo.svg";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const startResendTimer = () => {
        setCanResend(false);
        setCountdown(60);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // First verify if email exists and is an admin
            const verifyResponse = await axios.post('/api/admin/verify-email-exists', { email });
            
            if (!verifyResponse.data.exists) {
                setStatus({
                    type: 'error',
                    message: 'No administrator account found with this email'
                });
                setIsLoading(false);
                return;
            }

            const response = await axios.post('/api/admin/forgot-password', { email });
            setEmailSent(true);
            startResendTimer();
            setStatus({
                type: 'success',
                message: 'Password reset instructions have been sent to your email'
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to process request'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setIsLoading(true);
        
        try {
            await axios.post('/api/admin/forgot-password', { email });
            startResendTimer();
            setStatus({
                type: 'success',
                message: 'New reset link has been sent to your email'
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to resend reset link'
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
                            Forgot Password?
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Enter your email to reset your password
                        </p>
                    </div>
                </div>

                {emailSent ? (
                    <div className="text-center space-y-6">
                        <div className="bg-green-50 p-4 rounded-xl">
                            <p className="text-green-800">
                                Check your email for password reset instructions
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <button
                                onClick={handleResend}
                                disabled={!canResend || isLoading}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                <span>
                                    {!canResend 
                                        ? `Resend available in ${countdown}s`
                                        : 'Resend reset link'
                                    }
                                </span>
                            </button>

                            <Link 
                                to="/admin/login"
                                className="block text-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
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

                        <div className="space-y-4">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Send Reset Link</span>
                                    </>
                                )}
                            </button>

                            <Link 
                                to="/admin/login"
                                className="block text-center text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword; 