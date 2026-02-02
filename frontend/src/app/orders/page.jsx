'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ArrowRight } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import LoginPrompt from '@/components/LoginPrompt';
import { orderApi } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { OrdersLoadingSkeleton } from '@/components/LoadingSkeleton';

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  const itemsPerPage = 10;

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          // Don't redirect, just stop loading to show login prompt
          setLoading(false);
          return;
        }

        const skip = (currentPage - 1) * itemsPerPage;
        const response = await orderApi.getOrders(statusFilter, skip, itemsPerPage);

        if (response.success) {
          setOrders(response.data.orders);
          setPagination(response.data.pagination);
        } else {
          showToast('Failed to load orders', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error loading orders', 'error');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, statusFilter, router, showToast]);

  const handleStatusFilter = (status) => {
    setStatusFilter(statusFilter === status ? null : status);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <OrdersLoadingSkeleton />
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <LoginPrompt
          title="View Your Orders"
          message="Log in to track your orders, view order history, and manage returns"
          showGuestOption={true}
        />
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all touch-manipulation active:scale-95 ${statusFilter === status
                ? 'bg-[#172031] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to create your first order!</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 min-h-[44px] bg-[#172031] text-white rounded-lg hover:bg-[#232e42] transition-colors touch-manipulation active:scale-95"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer touch-manipulation active:scale-[0.99]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 my-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Items</p>
                        <p className="font-semibold text-gray-900">{order.itemCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="font-semibold text-gray-900">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus}
                      </span>
                      {order.shipmentStatus && order.status !== 'CANCELLED' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                          {order.shipmentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Action Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/orders/${order.id}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[#172031] text-white rounded-lg hover:bg-[#232e42] transition-colors touch-manipulation active:scale-95"
                    >
                      View Details
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-95"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 min-h-[44px] rounded-lg transition-colors touch-manipulation active:scale-95 ${currentPage === page
                  ? 'bg-[#172031] text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-95"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
