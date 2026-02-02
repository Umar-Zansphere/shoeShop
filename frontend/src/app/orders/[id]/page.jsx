'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, Truck, CreditCard, Package, X, CheckCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import LoginPrompt from '@/components/LoginPrompt';
import { orderApi } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { OrderDetailSkeleton } from '@/components/LoadingSkeleton';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    // Check for payment success in URL
    if (searchParams.get('payment') === 'success') {
      showToast('Payment successful! Your order has been confirmed.', 'success');
      // Remove query param from URL
      window.history.replaceState({}, document.title, `/orders/${orderId}`);
    }
  }, [orderId, searchParams, showToast]);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          // Don't redirect, just stop loading to show login prompt
          setLoading(false);
          return;
        }

        // Fetch order detail
        const orderResponse = await orderApi.getOrderDetail(orderId);
        if (orderResponse.success) {
          setOrder(orderResponse.data);
        } else {
          showToast('Failed to load order details', 'error');
        }

        // Fetch tracking info if order is shipped
        try {
          const trackingResponse = await orderApi.trackOrder(orderId);
          if (trackingResponse.success) {
            setTracking(trackingResponse.data);
          }
        } catch (err) {
          // Tracking might not be available for all orders
        }
      } catch (err) {
        showToast(err.message || 'Error loading order', 'error');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, router, showToast]);

  const handleCancelOrder = async () => {
    if (!order) return;

    // Check if order can be cancelled
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      showToast(`Cannot cancel a ${order.status.toLowerCase()} order.`, 'warning');
      return;
    }

    try {
      setCanceling(true);
      const response = await orderApi.cancelOrder(orderId, cancelReason);

      if (response.success) {
        setOrder((prev) => ({ ...prev, status: 'CANCELLED' }));
        setShowCancelModal(false);
        setCancelReason('');
        showToast('Order cancelled successfully', 'success');
        // Optionally refresh page
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('Failed to cancel order', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error canceling order', 'error');
    } finally {
      setCanceling(false);
    }
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

  const canCancelOrder = order && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <OrderDetailSkeleton />
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-gray-900 text-lg font-semibold mb-4">Order not found</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 min-h-[44px] bg-[#172031] text-white rounded-lg hover:bg-[#232e42] transition-colors touch-manipulation active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 min-w-[44px] min-h-[44px] hover:bg-gray-200 rounded-lg transition-colors touch-manipulation active:scale-95"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">#{order?.orderNumber}</p>
          </div>
        </div>

        {/* Status Section */}
        {order && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Order Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-[#FF6B6B]">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment & Shipment Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment & Shipment</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-blue-600" />
                    <p className="text-sm text-gray-600">Payment Method</p>
                  </div>
                  <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === 'SUCCESS'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {order.paymentStatus}
                  </span>
                </div>

                {order.shipment && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Truck size={18} className="text-purple-600" />
                        <p className="text-sm text-gray-600">Shipment Status</p>
                      </div>
                      <p className="font-semibold text-gray-900">{order.shipment.status}</p>
                    </div>

                    {order.shipment.trackingNumber && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                        <p className="font-semibold text-gray-900">{order.shipment.trackingNumber}</p>
                        {order.shipment.trackingUrl && (
                          <a
                            href={order.shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF6B6B] hover:underline text-sm mt-1 block"
                          >
                            Track on Courier Website →
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Section */}
        {order && order.items && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  {item.productImage && (
                    <div className="relative w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-gray-600">Color</p>
                        <p className="font-medium text-gray-900">{item.color}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Size</p>
                        <p className="font-medium text-gray-900">{item.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-medium text-gray-900">{item.quantity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="font-semibold text-gray-900">₹{parseFloat(item.price).toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-2">Subtotal</p>
                    <p className="font-bold text-gray-900">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order && (
          <div className="flex gap-4 mb-8">
            {canCancelOrder && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-3 min-h-[44px] border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium transition-colors touch-manipulation active:scale-95"
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 min-h-[44px] bg-[#172031] text-white rounded-lg hover:bg-[#232e42] font-medium transition-colors touch-manipulation active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Cancel Order</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 min-w-[44px] min-h-[44px] hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="flex-1 px-4 py-3 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 touch-manipulation active:scale-95"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={canceling}
                className="flex-1 px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation active:scale-95"
              >
                {canceling ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
