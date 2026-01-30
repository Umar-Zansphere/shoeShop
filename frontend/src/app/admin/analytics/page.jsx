'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';
import FormInput from '@/components/admin/FormInput';
import Button from '@/components/admin/Button';
import Alert from '@/components/admin/Alert';
import { ordersApi } from '@/lib/adminApi';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await ordersApi.getAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setAnalytics(response.data || {});
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load analytics',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyDateRange = () => {
    fetchAnalytics();
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'red' }) => {
    const bgColors = {
      red: 'bg-red-50',
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      purple: 'bg-purple-50',
    };

    const iconColors = {
      red: 'text-red-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
    };

    return (
      <div className={`${bgColors[color]} rounded-lg border border-gray-200 p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">{title}</h3>
          <div className={`p-2.5 rounded-lg bg-white/50`}>
            <Icon size={20} className={iconColors[color]} />
          </div>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-2">{subtitle}</p>}
      </div>
    );
  };

  if (isLoading && !analytics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track orders, revenue, and customer insights</p>
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

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={18} />
          Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormInput
            label="Start Date"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
          />
          <FormInput
            label="End Date"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
          />
          <Button onClick={applyDateRange} isLoading={isLoading}>
            Apply
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={analytics?.totalOrders || 0}
          subtitle="orders in this period"
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
          subtitle="revenue generated"
          color="green"
        />
        <StatCard
          icon={Package}
          title="Orders Shipped"
          value={analytics?.shippedOrders || 0}
          subtitle="currently in transit"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Order Value"
          value={`$${((analytics?.totalRevenue || 0) / Math.max(analytics?.totalOrders || 1, 1)).toFixed(2)}`}
          subtitle="average per order"
          color="red"
        />
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Order Status Distribution</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: analytics?.ordersByStatus?.PENDING || 0, color: 'bg-yellow-100' },
              { label: 'Processing', value: analytics?.ordersByStatus?.PROCESSING || 0, color: 'bg-blue-100' },
              { label: 'Shipped', value: analytics?.ordersByStatus?.SHIPPED || 0, color: 'bg-cyan-100' },
              { label: 'Delivered', value: analytics?.ordersByStatus?.DELIVERED || 0, color: 'bg-green-100' },
              { label: 'Cancelled', value: analytics?.ordersByStatus?.CANCELLED || 0, color: 'bg-red-100' },
            ].map((status) => {
              const total = analytics?.totalOrders || 1;
              const percentage = ((status.value / total) * 100).toFixed(1);
              return (
                <div key={status.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{status.label}</span>
                    <span className="text-sm text-gray-600">
                      {status.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Payment Status Distribution</h2>
          <div className="space-y-3">
            {[
              { label: 'Completed', value: analytics?.paymentsByStatus?.COMPLETED || 0, color: 'bg-green-100' },
              { label: 'Pending', value: analytics?.paymentsByStatus?.PENDING || 0, color: 'bg-yellow-100' },
              { label: 'Failed', value: analytics?.paymentsByStatus?.FAILED || 0, color: 'bg-red-100' },
              { label: 'Refunded', value: analytics?.paymentsByStatus?.REFUNDED || 0, color: 'bg-gray-100' },
            ].map((status) => {
              const total = analytics?.totalOrders || 1;
              const percentage = ((status.value / total) * 100).toFixed(1);
              return (
                <div key={status.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{status.label}</span>
                    <span className="text-sm text-gray-600">
                      {status.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Total Customers</h3>
          <p className="text-3xl font-bold text-red-600">{analytics?.totalCustomers || 0}</p>
          <p className="text-sm text-gray-600">customers who placed orders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Repeat Customers</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics?.repeatCustomers || 0}</p>
          <p className="text-sm text-gray-600">
            {analytics?.totalCustomers
              ? ((analytics?.repeatCustomers / analytics?.totalCustomers) * 100).toFixed(1)
              : 0}
            % of total customers
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Avg Orders/Customer</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.totalCustomers
              ? (analytics?.totalOrders / analytics?.totalCustomers).toFixed(2)
              : 0}
          </p>
          <p className="text-sm text-gray-600">orders per customer</p>
        </div>
      </div>

      {/* Daily Revenue Trend (Simple Table) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Units Sold</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                analytics.topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{product.unitsSold}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
