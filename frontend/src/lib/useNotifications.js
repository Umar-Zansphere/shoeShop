import { useEffect, useCallback } from 'react';
import useNotificationStore from './notificationStore';

// Helper function to convert VAPID key
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

export default function useNotifications() {
    const {
        permission,
        subscription,
        isSubscribing,
        isUnsubscribing,
        notificationsEnabled,
        setPermission,
        setSubscription,
        setIsSubscribing,
        setIsUnsubscribing,
        clearNotificationData,
    } = useNotificationStore();

    // Check if notifications are supported
    const isSupported = typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

    // Update permission state when it changes
    useEffect(() => {
        if (!isSupported) return;

        const updatePermission = () => {
            setPermission(Notification.permission);
        };

        // Check permission on mount
        updatePermission();

        // Listen for permission changes (not widely supported, but good to have)
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'notifications' })
                .then((permissionStatus) => {
                    permissionStatus.onchange = updatePermission;
                })
                .catch(() => {
                    // Permissions API not supported, ignore
                });
        }
    }, [isSupported, setPermission]);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            throw new Error('Notifications are not supported in this browser');
        }

        if (permission === 'granted') {
            return 'granted';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            throw error;
        }
    }, [isSupported, permission, setPermission]);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!isSupported) {
            throw new Error('Push notifications are not supported');
        }

        if (isSubscribing) {
            return; // Already subscribing
        }

        setIsSubscribing(true);

        try {
            // Request permission if not granted
            if (permission !== 'granted') {
                const result = await requestPermission();
                if (result !== 'granted') {
                    throw new Error('Notification permission denied');
                }
            }

            // Register service worker
            const registration = await navigator.serviceWorker.ready;

            // Check for existing subscription
            let pushSubscription = await registration.pushManager.getSubscription();

            if (!pushSubscription) {
                // Get VAPID public key from environment
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

                if (!vapidPublicKey) {
                    throw new Error('VAPID public key not configured');
                }

                // Subscribe to push notifications
                pushSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });
            }

            // Send subscription to backend
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(pushSubscription),
                credentials: 'include', // Include cookies for authentication
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription to server');
            }

            // Update store
            setSubscription(pushSubscription);

            return pushSubscription;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            throw error;
        } finally {
            setIsSubscribing(false);
        }
    }, [isSupported, permission, isSubscribing, requestPermission, setIsSubscribing, setSubscription]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!isSupported) {
            throw new Error('Push notifications are not supported');
        }

        if (isUnsubscribing) {
            return; // Already unsubscribing
        }

        setIsUnsubscribing(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const pushSubscription = await registration.pushManager.getSubscription();

            if (pushSubscription) {
                // Unsubscribe from push manager
                await pushSubscription.unsubscribe();

                // Remove subscription from backend
                await fetch('/api/notifications/unsubscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                    body: JSON.stringify(pushSubscription),
                    credentials: 'include',
                });
            }

            // Clear store
            clearNotificationData();
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            throw error;
        } finally {
            setIsUnsubscribing(false);
        }
    }, [isSupported, isUnsubscribing, setIsUnsubscribing, clearNotificationData]);

    // Check current subscription status
    const checkSubscription = useCallback(async () => {
        if (!isSupported || permission !== 'granted') {
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const pushSubscription = await registration.pushManager.getSubscription();

            if (pushSubscription) {
                setSubscription(pushSubscription);
            } else {
                clearNotificationData();
            }

            return pushSubscription;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return null;
        }
    }, [isSupported, permission, setSubscription, clearNotificationData]);

    // Send a test notification (for debugging)
    const sendTestNotification = useCallback(async () => {
        if (!isSupported || permission !== 'granted') {
            throw new Error('Notifications not enabled');
        }

        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification('Test Notification', {
            body: 'This is a test notification from SoleMate',
            icon: '/icons/manifest-icon-192.maskable.png',
            badge: '/icons/manifest-icon-192.maskable.png',
            vibrate: [200, 100, 200],
            tag: 'test-notification',
            data: {
                url: '/'
            }
        });
    }, [isSupported, permission]);

    return {
        // State
        isSupported,
        permission,
        subscription,
        isSubscribing,
        isUnsubscribing,
        notificationsEnabled,

        // Actions
        requestPermission,
        subscribe,
        unsubscribe,
        checkSubscription,
        sendTestNotification,
    };
}
