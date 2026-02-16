'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { authApi } from '@/lib/api';
import { Shield, Mail, Phone, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Email/Password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone/OTP state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Check if user is admin
            if (data.user.userRole !== 'ADMIN') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Cookie is automatically set by backend
            // Redirect to admin dashboard
            router.push('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };

    const handlePhoneLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (step === 'credentials') {
                // Send OTP
                const response = await fetch('/api/auth/phone-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                    credentials: 'include',
                    body: JSON.stringify({ phoneNumber }),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to send OTP');
                }

                setStep('otp');
                setLoading(false);
            } else {
                // Verify OTP
                const response = await fetch('/api/auth/phone-login-verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                    credentials: 'include',
                    body: JSON.stringify({ phoneNumber, otp }),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Invalid OTP');
                }

                // Check if user is admin
                if (data.user.userRole !== 'ADMIN') {
                    setError('Access denied. Admin privileges required.');
                    setLoading(false);
                    return;
                }

                // Cookie is automatically set by backend
                // Redirect to admin dashboard
                router.push('/');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center ">
            <div className="w-full max-w-md">
                {/* Logo & Branding */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-full mb-4 shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">SoleMate</h1>
                    <p className="text-gray-500 text-sm">Admin Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
                    {/* Login Method Toggle */}
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl">
                        <button
                            onClick={() => {
                                setLoginMethod('email');
                                setStep('credentials');
                                setError('');
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                                loginMethod === 'email'
                                    ? 'bg-red-600 text-white shadow-md scale-105'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                        >
                            <Mail size={18} />
                            <span>Email</span>
                        </button>
                        <button
                            onClick={() => {
                                setLoginMethod('phone');
                                setStep('credentials');
                                setError('');
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                                loginMethod === 'phone'
                                    ? 'bg-red-600 text-white shadow-md scale-105'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                        >
                            <Phone size={18} />
                            <span>Phone</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-shake flex items-start gap-3">
                            <div className="mt-0.5">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            </div>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Email Login Form */}
                    {loginMethod === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-5 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all hover:bg-gray-100"
                                    placeholder="admin@example.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all hover:bg-gray-100 pr-12"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 disabled:hover:shadow-md"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Phone Login Form */}
                    {loginMethod === 'phone' && (
                        <form onSubmit={handlePhoneLogin} className="space-y-5 animate-fadeIn">
                            {step === 'credentials' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all hover:bg-gray-100"
                                            placeholder="+1234567890"
                                            autoComplete="tel"
                                        />
                                        <p className="text-xs text-gray-500 mt-1.5">Include country code for faster verification</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 disabled:hover:shadow-md"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Sending OTP...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send OTP</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                            Enter OTP
                                        </label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                            required
                                            maxLength={6}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all hover:bg-gray-100 text-center text-3xl tracking-widest font-bold letter-spacing"
                                            placeholder="000000"
                                            autoComplete="off"
                                        />
                                        <p className="text-xs text-gray-500 mt-1.5">Check your SMS for the 6-digit code</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('credentials');
                                                setOtp('');
                                                setError('');
                                            }}
                                            className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all active:scale-95"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 disabled:hover:shadow-md"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Verify & Sign In</span>
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs leading-relaxed">
                        🔒 Authorized personnel only.<br />
                        Unauthorized access is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}
