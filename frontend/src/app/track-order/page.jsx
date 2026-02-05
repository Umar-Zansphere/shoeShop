'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Phone, CheckCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { orderApi } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

export default function TrackOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [step, setStep] = useState(1); // 1: Enter order details, 2: Enter OTP, 3: Show order
    const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '');
    const [email, setEmail] = useState('');
    const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
    const [otp, setOtp] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('track');

    const handleRequestOTP = async (e) => {
        e.preventDefault();

        if (!orderNumber) {
            showToast('Please enter an order number', 'warning');
            return;
        }

        if (!email || !email.includes('@')) {
            showToast('Please enter a valid email address', 'warning');
            return;
        }

        try {
            setLoading(true);
            const response = await orderApi.requestTrackingOTP(orderNumber, email);

            if (response.success) {
                showToast('Verification code sent to your email', 'success');
                setStep(2);
            } else {
                showToast(response.message || 'Failed to send verification code', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Error sending OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            showToast('Please enter a valid 6-digit OTP', 'warning');
            return;
        }

        try {
            setLoading(true);
            const response = await orderApi.verifyTrackingOTP(email, otp);

            if (response.success) {
                showToast('OTP verified successfully', 'success');
                setOrder(response.data);
                setStep(3);
            } else {
                showToast(response.message || 'Invalid OTP', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Error verifying OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'PAID':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                            <Package size={32} className="text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
                        <p className="text-gray-600">Enter your phone number to receive a tracking code via email</p>
                    </div>

                    {/* Step 1: Enter Phone Number */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Order Number
                                </label>
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                    placeholder="Enter your order number (e.g., ORD-1234567890-ABC)"
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    We'll send a 6-digit verification code to your email
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email.includes('@') || !orderNumber}
                                className="w-full px-6 py-4 min-h-[44px] bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl touch-manipulation active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        Send Verification Code
                                        <span className="text-lg">→</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle size={20} />
                                    <p className="text-sm font-medium">
                                        Verification code sent to {email}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Enter Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg text-center tracking-widest"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-orange-600 font-semibold hover:underline"
                                    >
                                        Resend
                                    </button>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full px-6 py-4 min-h-[44px] bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl touch-manipulation active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Track Order
                                        <span className="text-lg">→</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full px-6 py-3 min-h-[44px] text-gray-600 hover:text-gray-900 font-medium transition-colors touch-manipulation active:scale-95"
                            >
                                ← Change Phone Number
                            </button>
                        </form>
                    )}

                    {/* Step 3: Show Order Details */}
                    {step === 3 && order && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                                <CheckCircle size={48} className="mx-auto mb-3 text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Found!</h2>
                                <p className="text-gray-600">Order #{order.orderNumber}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-600">Order Date</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-600">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === 'SUCCESS'
                                        ? 'bg-green-100 text-green-800'
                                        : order.paymentStatus === 'PENDING'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>

                                {order.shipment && order.shipment.trackingNumber && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">Tracking Information</p>
                                        <p className="text-blue-700 font-mono">{order.shipment.trackingNumber}</p>
                                        {order.shipment.trackingUrl && (
                                            <a
                                                href={order.shipment.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                                            >
                                                Track on Courier Website →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setOtp('');
                                        setOrder(null);
                                    }}
                                    className="flex-1 px-6 py-3 min-h-[44px] border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors touch-manipulation active:scale-95"
                                >
                                    Track Another Order
                                </button>
                                <button
                                    onClick={() => router.push('/products')}
                                    className="flex-1 px-6 py-3 min-h-[44px] bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors touch-manipulation active:scale-95"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="text-center mt-8 text-sm text-gray-600">
                    <p>Need help? Contact us at <span className="font-semibold">support@solemate.com</span></p>
                </div>
            </main>

            <Footer activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
