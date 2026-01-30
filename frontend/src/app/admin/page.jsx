'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, TrendingUp, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/admin/Button';
import Alert from '@/components/admin/Alert';
import { ordersApi, productsApi } from '@/lib/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, ordersRes] = await Promise.all([
        ordersApi.getAnalytics(),
        ordersApi.getOrders({ skip: 0, take: 5 }),
      ]);

      setStats(analyticsRes);
      setRecentOrders(ordersRes || []);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = 'red', action }) => {
    const bgColors = {
      red: 'from-red-50 to-red-100/50',
      blue: 'from-blue-50 to-blue-100/50',
      green: 'from-green-50 to-green-100/50',
      purple: 'from-purple-50 to-purple-100/50',
    };

    const iconColors = {
      red: 'text-red-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
    };

    return (
      <div className={`bg-gradient-to-br ${bgColors[color]} rounded-lg border border-gray-200 p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">{title}</h3>
          <div className="p-2.5 rounded-lg bg-white/60">
            <Icon size={24} className={iconColors[color]} />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-4">{value}</p>
        {action && (
          <Link href={action.href} className="text-sm text-gray-600 hover:text-gray-900 font-semibold">
            {action.label} →
          </Link>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-cyan-100 text-cyan-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage products, orders, and track business metrics</p>
      </div>

      {/* Alerts */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats?.totalOrders || 0}
          color="blue"
          action={{ label: 'View Orders', href: '/admin/orders' }}
        />
        <StatCard
          icon={TrendingUp}
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toFixed(0)}`}
          color="green"
          action={{ label: 'View Analytics', href: '/admin/analytics' }}
        />
        <StatCard
          icon={Package}
          title="Orders Shipped"
          value={stats?.shippedOrders || 0}
          color="purple"
          action={{ label: 'Manage Orders', href: '/admin/orders' }}
        />
        <StatCard
          icon={Users}
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          color="red"
          action={{ label: 'View Analytics', href: '/admin/analytics' }}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/products/new">
            <Button variant="outline" fullWidth className="justify-center">
              <Plus size={18} />
              Add Product
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline" fullWidth className="justify-center">
              <Package size={18} />
              Manage Products
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" fullWidth className="justify-center">
              <ShoppingCart size={18} />
              View Orders
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button variant="outline" fullWidth className="justify-center">
              <AlertCircle size={18} />
              Manage Inventory
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <div className="flex gap-2 mt-2 justify-end">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">No recent orders</p>
          )}
        </div>

        {/* Order Status Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Order Status Summary</h2>

          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats?.ordersByStatus?.PENDING || 0, color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Processing', value: stats?.ordersByStatus?.PROCESSING || 0, color: 'bg-blue-100 text-blue-700' },
              { label: 'Shipped', value: stats?.ordersByStatus?.SHIPPED || 0, color: 'bg-cyan-100 text-cyan-700' },
              { label: 'Delivered', value: stats?.ordersByStatus?.DELIVERED || 0, color: 'bg-green-100 text-green-700' },
              { label: 'Cancelled', value: stats?.ordersByStatus?.CANCELLED || 0, color: 'bg-red-100 text-red-700' },
            ].map((status) => (
              <div key={status.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status.label}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                  {status.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon for Plus
function Plus({ size = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
