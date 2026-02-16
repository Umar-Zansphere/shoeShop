'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import useNotificationHistoryStore from '@/lib/notificationHistoryStore';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const {
        notifications,
        unreadCount,
        markAsRead,
        getRecentNotifications,
        setNotifications,
    } = useNotificationHistoryStore();

    const recentNotifications = getRecentNotifications(5);

    // Fetch notifications from API
    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isSubscribed, setIsSubscribed] = useState(false);

    // Check subscription status
    useEffect(() => {
        const checkSubscription = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);

                // If permission is granted but not subscribed (cleared cookies etc), auto-subscribe
                if (!subscription && Notification.permission === 'granted') {
                    subscribeToPush();
                }
            }
        };
        checkSubscription();
    }, []);

    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMk...'; // You should expose this env var

                // We need to fetch the VAPID key from server if not hardcoded
                // Ideally create an endpoint: GET /api/notifications/vapid-key
                // For now assuming we can get it or use a placeholder to trigger the flow (logic structure)
                // But let's act real: we need the key.

                // Let's assume the component will fetch it? No, better to fetch from API.
                const keyResponse = await fetch('/api/notifications/vapid-key', { headers: { 'ngrok-skip-browser-warning': 'true' }, credentials: 'include' });
                // If endpoint doesn't exist yet, we might need to create it.
                // Checking previous analysis... routes didn't show it.
                // We should probably add it or hardcode if user provided (not provided).
                // Let's rely on an endpoint we will create.

                if (!keyResponse.ok) return;
                const { publicKey } = await keyResponse.json();

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });

                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    credentials: 'include',
                    body: JSON.stringify(subscription)
                });

                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Failed to subscribe to push:', error);
        }
    };

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }


    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications/history?limit=50', {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
                method: 'PATCH',
                credentials: 'include',
            });
            if (response.ok) {
                markAsRead(id);
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-[32rem] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {!isSubscribed && (
                                    <button
                                        onClick={subscribeToPush}
                                        className="text-xs text-primary hover:text-primary-dark font-medium mr-2"
                                    >
                                        Enable Push
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {recentNotifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {recentNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''
                                                }`}
                                            onClick={(e) => {
                                                if (!notification.isRead) {
                                                    handleMarkAsRead(notification.id, e);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                                        {notification.body}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors"
                                                            >
                                                                <Check size={12} />
                                                                Mark read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {recentNotifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                                >
                                    View All Notifications
                                    <ExternalLink size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
