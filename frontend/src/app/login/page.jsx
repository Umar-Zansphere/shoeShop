'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { authApi } from '@/lib/api';
import { Shield, Mail, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            router.push('/admin');
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
                router.push('/admin');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-400">Sign in to access the admin dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    {/* Login Method Toggle */}
                    <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-lg">
                        <button
                            onClick={() => {
                                setLoginMethod('email');
                                setStep('credentials');
                                setError('');
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md transition-all ${loginMethod === 'email'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Mail size={18} />
                            <span className="font-medium">Email</span>
                        </button>
                        <button
                            onClick={() => {
                                setLoginMethod('phone');
                                setStep('credentials');
                                setError('');
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md transition-all ${loginMethod === 'phone'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Phone size={18} />
                            <span className="font-medium">Phone</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email Login Form */}
                    {loginMethod === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
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
                        <form onSubmit={handlePhoneLogin} className="space-y-4">
                            {step === 'credentials' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                                            placeholder="+1234567890"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
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
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Enter OTP
                                        </label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            maxLength={6}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                                            placeholder="000000"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('credentials');
                                                setOtp('');
                                                setError('');
                                            }}
                                            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
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
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Authorized personnel only. Unauthorized access is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}
