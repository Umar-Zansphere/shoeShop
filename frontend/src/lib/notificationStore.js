import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationStore = create(
    persist(
        (set, get) => ({
            // Notification permission state
            permission: typeof window !== 'undefined' && 'Notification' in window
                ? Notification.permission
                : 'default',

            // Push subscription object
            subscription: null,

            // Loading states
            isSubscribing: false,
            isUnsubscribing: false,

            // User preferences
            notificationsEnabled: false,
            promptDismissed: false,

            // Actions
            setPermission: (permission) => set({ permission }),

            setSubscription: (subscription) => set({
                subscription,
                notificationsEnabled: !!subscription
            }),

            setIsSubscribing: (isSubscribing) => set({ isSubscribing }),

            setIsUnsubscribing: (isUnsubscribing) => set({ isUnsubscribing }),

            dismissPrompt: () => set({ promptDismissed: true }),

            resetPrompt: () => set({ promptDismissed: false }),

            // Clear all notification data
            clearNotificationData: () => set({
                subscription: null,
                notificationsEnabled: false,
                permission: typeof window !== 'undefined' && 'Notification' in window
                    ? Notification.permission
                    : 'default',
            }),
        }),
        {
            name: 'notification-storage',
            // Only persist certain fields
            partialize: (state) => ({
                notificationsEnabled: state.notificationsEnabled,
                promptDismissed: state.promptDismissed,
            }),
        }
    )
);

export default useNotificationStore;
