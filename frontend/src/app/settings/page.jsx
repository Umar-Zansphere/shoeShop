'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Loader, AlertCircle, Settings as SettingsIcon, Send } from 'lucide-react';
import { useAdminNotifications } from '@/lib/useAdminNotifications';
import Button from '@/components/admin/Button';
import Alert from '@/components/admin/Alert';
import Card from '@/components/admin/Card';

export default function SettingsPage() {
    const {
        permission,
        subscription,
        loading,
        error,
        subscribe,
        unsubscribe,
        sendTestNotification,
        checkSubscription,
    } = useAdminNotifications();

    const [preferences, setPreferences] = useState({
        newOrders: true,
        orderStatusChange: true,
        lowStock: true,
        otherEvents: true,
    });
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        checkSubscription();
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await fetch('/api/notifications/preferences', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.preferences) {
                    setPreferences(data.preferences);
                }
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    };

    const handleSubscribe = async () => {
        const result = await subscribe();
        if (result) {
            setAlert({
                type: 'success',
                title: 'Success',
                message: 'Successfully subscribed to push notifications!',
            });
        } else {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error || 'Failed to subscribe to notifications',
            });
        }
    };

    const handleUnsubscribe = async () => {
        await unsubscribe();
        setAlert({
            type: 'success',
            title: 'Success',
            message: 'Successfully unsubscribed from push notifications',
        });
    };

    const handleTestNotification = async () => {
        setTestLoading(true);
        const success = await sendTestNotification();
        setTestLoading(false);

        if (success) {
            setAlert({
                type: 'success',
                title: 'Success',
                message: 'Test notification sent! Check your notifications.',
            });
        } else {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to send test notification',
            });
        }
    };

    const handleSavePreferences = async () => {
        setSavingPreferences(true);
        try {
            const response = await fetch('/api/notifications/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                setAlert({
                    type: 'success',
                    title: 'Success',
                    message: 'Preferences saved successfully!',
                });
            } else {
                throw new Error('Failed to save preferences');
            }
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to save preferences',
            });
        } finally {
            setSavingPreferences(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'granted' && subscription) return 'text-success';
        if (status === 'denied') return 'text-error';
        return 'text-warning';
    };

    const getStatusText = () => {
        if (permission === 'granted' && subscription) return 'Active';
        if (permission === 'granted' && !subscription) return 'Permission Granted (Not Subscribed)';
        if (permission === 'denied') return 'Blocked';
        return 'Not Enabled';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
                <p className="text-gray-600 mt-1">Manage your push notification preferences and subscription</p>
            </div>

            {/* Alert */}
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Status Card */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Bell size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Push Notifications</h2>
                            <p className={`text-sm font-semibold ${getStatusColor(permission)}`}>
                                {getStatusText()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Permission</p>
                                    <p className="font-semibold text-gray-900 capitalize">{permission}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Subscription</p>
                                    <p className="font-semibold text-gray-900">
                                        {subscription ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {permission === 'default' || !subscription ? (
                                <Button
                                    onClick={handleSubscribe}
                                    isLoading={loading}
                                    fullWidth
                                    className="gap-2"
                                >
                                    <Bell size={20} />
                                    Enable Notifications
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleTestNotification}
                                        isLoading={testLoading}
                                        fullWidth
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Send size={20} />
                                        Send Test Notification
                                    </Button>
                                    <Button
                                        onClick={handleUnsubscribe}
                                        isLoading={loading}
                                        fullWidth
                                        variant="secondary"
                                    >
                                        Unsubscribe
                                    </Button>
                                </>
                            )}
                        </div>

                        {permission === 'denied' && (
                            <div className="p-4 bg-error-light border border-error/30 rounded-lg">
                                <p className="text-sm text-error">
                                    <strong>Notifications Blocked:</strong> Please enable notifications in your browser settings to receive alerts.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Notification Preferences Card */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-info/10 rounded-lg">
                            <SettingsIcon size={24} className="text-info" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                            <p className="text-sm text-gray-600">Choose what you want to be notified about</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900">New Orders</p>
                                <p className="text-xs text-gray-600">Get notified when a new order is placed</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.newOrders}
                                onChange={(e) => setPreferences({ ...preferences, newOrders: e.target.checked })}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900">Order Status Changes</p>
                                <p className="text-xs text-gray-600">Get notified when order status updates</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.orderStatusChange}
                                onChange={(e) => setPreferences({ ...preferences, orderStatusChange: e.target.checked })}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900">Low Stock Alerts</p>
                                <p className="text-xs text-gray-600">Get notified when products are running low</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.lowStock}
                                onChange={(e) => setPreferences({ ...preferences, lowStock: e.target.checked })}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900">Other Events</p>
                                <p className="text-xs text-gray-600">Get notified about other admin events</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.otherEvents}
                                onChange={(e) => setPreferences({ ...preferences, otherEvents: e.target.checked })}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                        </div>

                        <Button
                            onClick={handleSavePreferences}
                            isLoading={savingPreferences}
                            fullWidth
                            className="gap-2"
                        >
                            <CheckCircle size={20} />
                            Save Preferences
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Tips Card */}
            <Card className="bg-info-light border border-info/30">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-info flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-info mb-2">About Admin Notifications</h3>
                        <ul className="space-y-1.5 text-sm text-info/90">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-info rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>You'll receive real-time alerts for new orders and important events</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-info rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>Notifications work even when the admin panel is closed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-info rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>You can customize which events trigger notifications</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-info rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>Test notifications help ensure everything is working correctly</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
