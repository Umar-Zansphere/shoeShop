import { useState, useEffect, useCallback } from 'react';

export function useAdminNotifications() {
    const [permission, setPermission] = useState('default');
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check initial permission status
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            setError('Notifications not supported in this browser');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (err) {
            setError('Failed to request permission');
            return false;
        }
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Request permission first
            const hasPermission = await requestPermission();
            if (!hasPermission) {
                throw new Error('Notification permission denied');
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Subscribe to push
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                throw new Error('VAPID public key not configured');
            }

            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey
            });

            // Send subscription to backend
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                credentials: 'include',
                body: JSON.stringify(pushSubscription)
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            setSubscription(pushSubscription);
            return pushSubscription;
        } catch (err) {
            console.error('Subscription error:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [requestPermission]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.ready;
            const pushSubscription = await registration.pushManager.getSubscription();

            if (pushSubscription) {
                // Unsubscribe from push
                await pushSubscription.unsubscribe();

                // Remove from backend
                await fetch('/api/notifications/unsubscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ endpoint: pushSubscription.endpoint })
                });

                setSubscription(null);
            }
        } catch (err) {
            console.error('Unsubscribe error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send test notification
    const sendTestNotification = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to send test notification');
            }

            return true;
        } catch (err) {
            console.error('Test notification error:', err);
            setError(err.message);
            return false;
        }
    }, []);

    // Check current subscription status
    const checkSubscription = useCallback(async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const pushSubscription = await registration.pushManager.getSubscription();
                setSubscription(pushSubscription);
                return pushSubscription;
            }
        } catch (err) {
            console.error('Check subscription error:', err);
        }
        return null;
    }, []);

    return {
        permission,
        subscription,
        loading,
        error,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification,
        checkSubscription
    };
}
