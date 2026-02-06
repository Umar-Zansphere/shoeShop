'use client';

import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import useNotifications from '../lib/useNotifications';
import useNotificationStore from '../lib/notificationStore';

export default function NotificationPrompt() {
    const [isVisible, setIsVisible] = useState(false);
    const { isSupported, permission, subscribe, isSubscribing } = useNotifications();
    const { promptDismissed, dismissPrompt } = useNotificationStore();

    useEffect(() => {
        // Show prompt only if:
        // 1. Notifications are supported
        // 2. Permission is default (not asked yet)
        // 3. User hasn't dismissed the prompt
        // 4. Wait a bit before showing (better UX)
        if (isSupported && permission === 'default' && !promptDismissed) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isSupported, permission, promptDismissed]);

    const handleEnable = async () => {
        try {
            await subscribe();
            setIsVisible(false);
        } catch (error) {
            console.error('Failed to enable notifications:', error);
            // Show error toast if available
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleDontAskAgain = () => {
        dismissPrompt();
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8585] p-4 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Stay Updated</h3>
                                <p className="text-sm text-white/90">Get notified about new arrivals</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4">
                        Enable notifications to receive updates about:
                    </p>
                    <ul className="space-y-2 mb-4">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full"></span>
                            New product arrivals
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full"></span>
                            Exclusive deals and offers
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full"></span>
                            Order status updates
                        </li>
                    </ul>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleEnable}
                            disabled={isSubscribing}
                            className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8585] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubscribing ? 'Enabling...' : 'Enable Notifications'}
                        </button>
                        <button
                            onClick={handleDontAskAgain}
                            className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
                        >
                            Don't ask again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
