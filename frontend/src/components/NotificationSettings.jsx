'use client';

import { useEffect } from 'react';
import { Bell, BellOff, AlertCircle, CheckCircle } from 'lucide-react';
import useNotifications from '../lib/useNotifications';

export default function NotificationSettings() {
    const {
        isSupported,
        permission,
        notificationsEnabled,
        subscribe,
        unsubscribe,
        checkSubscription,
        isSubscribing,
        isUnsubscribing,
        sendTestNotification,
    } = useNotifications();

    useEffect(() => {
        // Check subscription status on mount
        if (isSupported && permission === 'granted') {
            checkSubscription();
        }
    }, [isSupported, permission, checkSubscription]);

    const handleToggle = async () => {
        try {
            if (notificationsEnabled) {
                await unsubscribe();
            } else {
                await subscribe();
            }
        } catch (error) {
            console.error('Error toggling notifications:', error);
        }
    };

    const handleTestNotification = async () => {
        try {
            await sendTestNotification();
        } catch (error) {
            console.error('Error sending test notification:', error);
        }
    };

    if (!isSupported) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-amber-900 mb-1">Not Supported</h3>
                        <p className="text-sm text-amber-700">
                            Push notifications are not supported in this browser. Try using Chrome, Firefox, or Safari.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {notificationsEnabled ? (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Bell className="w-5 h-5 text-green-600" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <BellOff className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                            <p className="text-sm text-gray-500">
                                {notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        disabled={isSubscribing || isUnsubscribing || permission === 'denied'}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${notificationsEnabled ? 'bg-[#FF6B6B]' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Status Messages */}
                {permission === 'denied' && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700">
                                <p className="font-medium mb-1">Notifications Blocked</p>
                                <p className="text-xs">
                                    You've blocked notifications. To enable them, click the lock icon in your browser's address bar and allow notifications.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {permission === 'granted' && notificationsEnabled && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">
                                You're all set! You'll receive notifications about new products, offers, and order updates.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Test Notification Button */}
            {notificationsEnabled && permission === 'granted' && (
                <button
                    onClick={handleTestNotification}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                >
                    Send Test Notification
                </button>
            )}

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">What you'll receive:</h4>
                <ul className="space-y-1.5 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>New product arrivals and restocks</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>Exclusive deals and limited-time offers</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>Order confirmations and shipping updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>Personalized recommendations</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
