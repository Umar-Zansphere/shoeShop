'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search as SearchIcon } from 'lucide-react';
import Button from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import FormInput from '@/components/admin/FormInput';
import Alert from '@/components/admin/Alert';
import useNotificationHistoryStore from '@/lib/notificationHistoryStore';

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        setNotifications,
    } = useNotificationHistoryStore();

    const [filter, setFilter] = useState('all'); // all, unread, read
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/notifications/history?limit=100', {
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
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load notifications',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
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

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
                method: 'PATCH',
                credentials: 'include',
            });
            if (response.ok) {
                markAllAsRead();
                setAlert({
                    type: 'success',
                    title: 'Success',
                    message: 'All notifications marked as read',
                });
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to mark all as read',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;

        try {
            const response = await fetch(`/api/notifications/${id}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                deleteNotification(id);
                setAlert({
                    type: 'success',
                    title: 'Success',
                    message: 'Notification deleted',
                });
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to delete notification',
            });
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
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter and search notifications
    const filteredNotifications = notifications.filter((notification) => {
        // Apply filter
        if (filter === 'unread' && notification.isRead) return false;
        if (filter === 'read' && !notification.isRead) return false;

        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                notification.title.toLowerCase().includes(searchLower) ||
                notification.body.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
                        <CheckCheck size={20} />
                        Mark All as Read
                    </Button>
                )}
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

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<SearchIcon size={18} />}
                    />
                    <div className="flex gap-2">
                        {['all', 'unread', 'read'].map((filterOption) => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${filter === filterOption
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Notifications Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-48 animate-pulse">
                            <div className="h-full bg-gray-100 rounded"></div>
                        </Card>
                    ))}
                </div>
            ) : filteredNotifications.length === 0 ? (
                <Card className="text-center py-12">
                    <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No matching notifications' : 'No notifications yet'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search' : 'You\'ll see notifications here when you receive them'}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            hover
                            className={`flex flex-col ${!notification.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
                        >
                            {/* Notification Header */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                                    {notification.title}
                                </h3>
                                {!notification.isRead && (
                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                            </div>

                            {/* Notification Body */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                                {notification.body}
                            </p>

                            {/* Timestamp */}
                            <p className="text-xs text-gray-400 mb-4">
                                {formatTime(notification.createdAt)}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                {!notification.isRead && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="flex-1 gap-2"
                                    >
                                        <Check size={16} />
                                        Mark Read
                                    </Button>
                                )}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                    className="gap-2"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats */}
            {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                    <span>Total: {notifications.length}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Unread: {unreadCount}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Showing: {filteredNotifications.length}</span>
                </div>
            )}
        </div>
    );
}
