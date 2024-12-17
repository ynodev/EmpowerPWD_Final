import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/img/logo.svg";

const AdminRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await axios.post('/api/admin/', { email, password });
            navigate('/admin/login');
        } catch (error) {
            setError('Error registering admin, please try again.');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen font-poppins h-screen">
            <div className="flex flex-col md:flex-row rounded-lg overflow-hidden max-w-5xl w-full gap-6 p-8">
                <div className="md:w-1/2 p-2">
                    <div className="flex items-center mb-8">
                        {<img src={logo} alt="logo" className="w-10 h-10 text-2xl mr-2" />}
                        <span className="text-[20px] font-semibold">EmpowerPWD</span>
                    </div>
                    <h2 className="font-semibold text-[26px] tracking-widest">Admin Registration</h2>
                    <p className="text-black mb-8 text-[12px]">Please fill in the registration details below</p>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <Alert type="error">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="mb-4 mt-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-[#CCCCCC] rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 text-[14px]"
                            />
                        </div>

                        <div className="mb-4 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-[#CCCCCC] rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 text-[14px]"
                            />
                            <div 
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-[#929292]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        </div>

                        <div className="mb-6 relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-[#CCCCCC] rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 text-[14px]"
                            />
                            <div 
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-[#929292]"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 rounded-3xl font-medium mt-1 text-[15px]"
                        >
                            {isLoading ? 'REGISTERING...' : 'REGISTER'}
                        </button>
                    </form>

                    <div className="mt-4 text-[12px]">
                        <p className="text-black">
                            Already have an account?{" "}
                            <Link to="/admin/login" className="text-[#4285F4] hover:underline">Sign in</Link>
                        </p>
                    </div>

                    <div className="flex items-center mt-7 mb-5">
                        <hr className="flex-grow border-1.5 border-[#929292]" />
                        <span className="mx-12 text-black text-[12px]">OR</span>
                        <hr className="flex-grow border-1.5 border-[#929292]" />
                    </div>

                    <div className="flex justify-center space-x-6">
                        <button className="flex items-center justify-center w-20 h-9 border-2 border-[#929292] rounded-xl text-[14px]">
                            <i className="fas fa-cube mr-2"></i> LOGO
                        </button>
                        <button className="flex items-center justify-center w-20 h-9 border-2 border-[#929292] rounded-xl text-[14px]">
                            <i className="fas fa-cube mr-2"></i> LOGO
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-2">
                    <div className="w-[480px] h-[500px] bg-[#D9D9D9] flex items-center justify-center rounded-xl">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;