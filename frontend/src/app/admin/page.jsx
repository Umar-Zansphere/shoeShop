'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/adminApi';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';

export default function DashboardPage() {
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

  const cards = [
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Revenue',
      value: `$${(analytics?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Pending Orders',
      value: analytics?.statusBreakdown?.PENDING || 0,
      icon: Package,
      color: 'yellow',
    },
    {
      title: 'Shipped Orders',
      value: analytics?.statusBreakdown?.SHIPPED || 0,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-(--text-primary)">Dashboard</h1>
      </div>

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

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`border-2 rounded-2xl p-6 ${colorClasses[card.color]} transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold opacity-75 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <Icon size={32} opacity={0.3} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Status Breakdown */}
      {!loading && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-(--text-primary) mb-4">Order Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-(--text-secondary)">{status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-(--accent) h-2 rounded-full"
                        style={{ width: `${(count / analytics.totalOrders) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-(--text-primary) w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-(--text-primary) mb-4">Payment Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(analytics.paymentBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-(--text-secondary)">{status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-(--accent) h-2 rounded-full"
                        style={{ width: `${(count / analytics.totalOrders) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-(--text-primary) w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {!loading && analytics?.topProducts && (
        <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-(--text-primary) mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-(--text-primary)">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-(--text-primary)">Quantity Sold</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-(--text-primary)">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-(--text-primary)">{product.productName}</td>
                    <td className="py-3 px-4 text-(--text-secondary)">{product._sum?.quantity || 0}</td>
                    <td className="py-3 px-4 text-(--text-primary) font-semibold">
                      ${(product._sum?.subtotal || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
