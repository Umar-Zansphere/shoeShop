'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/adminApi';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAnalytics(dateRange);
      setAnalytics(data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    fetchAnalytics();
  };

  const metrics = [
    {
      label: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      trend: '+12%',
    },
    {
      label: 'Total Revenue',
      value: `$${(analytics?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600 border-green-200',
      trend: '+8%',
    },
    {
      label: 'Avg Order Value',
      value: analytics?.totalOrders > 0 
        ? `$${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)}`
        : '$0',
      icon: Package,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      trend: '+5%',
    },
    {
      label: 'Success Rate',
      value: analytics?.totalOrders > 0
        ? `${((analytics.statusBreakdown?.DELIVERED || 0) / analytics.totalOrders * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      trend: '+3%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-(--text-primary)">Analytics</h1>

      {/* Date Range Filter */}
      <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold text-(--text-primary) mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-(--text-primary) mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
          />
        </div>
        <button
          onClick={handleApplyFilter}
          className="px-6 py-2 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors"
        >
          Apply Filter
        </button>
        <button
          onClick={() => {
            setDateRange({ startDate: '', endDate: '' });
          }}
          className="px-6 py-2 border-2 border-gray-200 text-(--text-primary) rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-(--accent) rounded-2xl">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className={`border-2 rounded-2xl p-6 ${metric.color} transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={32} opacity={0.3} />
                  <span className="text-xs font-semibold text-green-600">{metric.trend}</span>
                </div>
                <p className="text-sm font-semibold opacity-75 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Distribution */}
      {!loading && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--text-primary)">Order Status Distribution</h3>
            <div className="space-y-4">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                const percentage = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-(--text-primary)">{status}</span>
                      <span className="text-sm font-semibold text-(--text-secondary)">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-linear-to-r from-blue-500 to-(--accent) h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--text-primary)">Payment Status Distribution</h3>
            <div className="space-y-4">
              {Object.entries(analytics.paymentBreakdown).map(([status, count]) => {
                const percentage = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-(--text-primary)">{status}</span>
                      <span className="text-sm font-semibold text-(--text-secondary)">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-linear-to-r from-green-500 to-(--accent) h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {!loading && analytics?.topProducts && analytics.topProducts.length > 0 && (
        <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-(--text-primary)">Top Performing Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, idx) => {
              const revenue = product._sum?.subtotal || 0;
              const quantity = product._sum?.quantity || 0;
              const totalRevenue = analytics.totalRevenue;
              const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

              return (
                <div key={idx} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-(--text-primary)">{product.productName}</p>
                      <p className="text-sm text-(--text-secondary)">{quantity} units sold</p>
                    </div>
                    <span className="text-lg font-bold text-(--accent)">${revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-(--accent) h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
