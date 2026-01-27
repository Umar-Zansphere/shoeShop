'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/adminApi';
import Link from 'next/link';
import { Eye, TrendingUp } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: '',
    skip: 0,
    take: 10,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrders(filters);
      setOrders(data.orders);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, skip: 0 }));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PAID: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      SUCCESS: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-(--text-primary)">Orders</h1>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 px-6 py-3 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors"
        >
          <TrendingUp size={20} />
          Analytics
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Order number or email..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">Payment Status</label>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            >
              <option value="">All Payments</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-(--accent) rounded-2xl">
          {error}
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className="bg-(--card-bg) border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Order #</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Total</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Items</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Payment</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-(--text-primary) font-semibold">{order.orderNumber}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-(--text-primary) font-medium">{order.user.fullName}</p>
                        <p className="text-xs text-(--text-secondary)">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-(--text-primary) font-semibold">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-(--text-secondary)">{order.items.length}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-(--text-secondary) text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors inline-block"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-(--text-secondary)">
              Showing {filters.skip + 1} to {Math.min(filters.skip + filters.take, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.take) }))}
                disabled={filters.skip === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, skip: prev.skip + prev.take }))}
                disabled={filters.skip + filters.take >= pagination.total}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
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
