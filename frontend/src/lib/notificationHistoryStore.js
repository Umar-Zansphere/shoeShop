import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationHistoryStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            lastFetched: null,

            // Add a new notification
            addNotification: (notification) => {
                set((state) => {
                    const exists = state.notifications.some((n) => n.id === notification.id);
                    if (exists) return state;

                    const newNotifications = [notification, ...state.notifications];
                    const newUnreadCount = notification.isRead ? state.unreadCount : state.unreadCount + 1;

                    return {
                        notifications: newNotifications,
                        unreadCount: newUnreadCount,
                    };
                });
            },

            // Set all notifications (from API fetch)
            setNotifications: (notifications) => {
                set({
                    notifications,
                    unreadCount: notifications.filter((n) => !n.isRead).length,
                    lastFetched: new Date().toISOString(),
                });
            },

            // Mark a notification as read
            markAsRead: (notificationId) => {
                set((state) => {
                    const notifications = state.notifications.map((n) =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    );
                    const unreadCount = notifications.filter((n) => !n.isRead).length;

                    return { notifications, unreadCount };
                });
            },

            // Mark all notifications as read
            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                    unreadCount: 0,
                }));
            },

            // Delete a notification
            deleteNotification: (notificationId) => {
                set((state) => {
                    const notification = state.notifications.find((n) => n.id === notificationId);
                    const notifications = state.notifications.filter((n) => n.id !== notificationId);
                    const unreadCount = notification && !notification.isRead
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount;

                    return { notifications, unreadCount };
                });
            },

            // Clear all notifications
            clearAll: () => {
                set({ notifications: [], unreadCount: 0 });
            },

            // Get unread notifications
            getUnreadNotifications: () => {
                return get().notifications.filter((n) => !n.isRead);
            },

            // Get recent notifications (last N)
            getRecentNotifications: (limit = 5) => {
                return get().notifications.slice(0, limit);
            },
        }),
        {
            name: 'notification-history-storage',
            partialize: (state) => ({
                notifications: state.notifications,
                unreadCount: state.unreadCount,
                lastFetched: state.lastFetched,
            }),
        }
    )
);

export default useNotificationHistoryStore;
